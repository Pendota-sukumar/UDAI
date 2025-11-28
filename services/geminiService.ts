
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult, IncidentFormData, Severity } from '../types';

// Ensure API key is available
const apiKey = process.env.API_KEY;

const jsonSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    root_cause: { type: Type.STRING, description: "A concise explanation of the technical root cause." },
    likely_origin: { type: Type.STRING, description: "The specific file, function, or service where the error likely originated." },
    impact_scope: { type: Type.STRING, description: "What parts of the system or user base are affected." },
    severity: { type: Type.STRING, enum: [Severity.LOW, Severity.MEDIUM, Severity.HIGH, Severity.CRITICAL], description: "The severity level of the incident." },
    confidence_score: { type: Type.NUMBER, description: "Confidence score from 0 to 100." },
    suggested_fix: { type: Type.STRING, description: "Step-by-step fix instructions. Use Markdown for code blocks." },
    suggested_tests: { type: Type.STRING, description: "Recommended test cases to prevent regression. Use Markdown." },
    notes_for_future: { type: Type.STRING, description: "Advice on how to prevent this class of errors in the future." },
    simulation_preview: {
      type: Type.OBJECT,
      properties: {
        success_probability: { type: Type.NUMBER, description: "Predicted success rate (0-100) based on Monte Carlo simulation." },
        regression_risk: { type: Type.NUMBER, description: "Predicted regression risk (0-100)." },
        predicted_outcome: { type: Type.STRING, description: "Short summary of what happens after applying the fix." },
        simulated_scenarios: { type: Type.NUMBER, description: "Number of scenarios simulated (e.g., 1000)." }
      },
      required: ["success_probability", "regression_risk", "predicted_outcome", "simulated_scenarios"]
    },
    architecture_inference: {
      type: Type.OBJECT,
      properties: {
        nodes: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              type: { type: Type.STRING, enum: ['Service', 'Database', 'Gateway', 'Queue', 'Client'] },
              status: { type: Type.STRING, enum: ['Healthy', 'Compromised', 'Down'] }
            },
            required: ["id", "name", "type", "status"]
          }
        },
        edges: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              from: { type: Type.STRING },
              to: { type: Type.STRING },
              label: { type: Type.STRING }
            },
            required: ["from", "to"]
          }
        },
        blast_radius_summary: { type: Type.STRING, description: "Description of the architectural impact." }
      },
      required: ["nodes", "edges", "blast_radius_summary"]
    }
  },
  required: ["root_cause", "likely_origin", "impact_scope", "severity", "confidence_score", "suggested_fix", "suggested_tests", "notes_for_future", "simulation_preview", "architecture_inference"],
};

export const analyzeIncident = async (data: IncidentFormData, modelName: string): Promise<AnalysisResult> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    You are UDAI (Universal Debugger AI), an expert Senior Site Reliability Engineer and Software Architect.
    
    Please analyze the following incident report and provide a structured debugging analysis.
    
    --- INCIDENT REPORT ---
    Title: ${data.title}
    Environment: ${data.environment}
    Service/Module: ${data.serviceName}
    
    Expected Behavior:
    ${data.expectedBehavior || "N/A"}
    
    --- LOGS / STACK TRACE ---
    ${data.logs}
    
    --- CODE SNIPPET (Optional) ---
    ${data.codeSnippet || "N/A"}
    
    -----------------------
    
    Based on the above:
    1. Identify root cause, fix, and severity.
    2. SHADOW LAB: Simulate the fix in your mind across 1,000 execution paths. Estimate success probability and regression risk.
    3. HOLO-MAP: Infer the architecture topology (nodes/edges) involved in this error based on the logs (e.g., Service A calls Database B). Identify which nodes are compromised.
    
    Be technical, precise, and helpful.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: jsonSchema,
        temperature: 0.4, // Lower temperature for more analytical results
      },
    });

    if (!response.text) {
      throw new Error("No response received from Gemini.");
    }

    // Robust JSON parsing to handle potential Markdown wrapping
    let jsonString = response.text.trim();
    if (jsonString.startsWith("```json")) {
      jsonString = jsonString.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (jsonString.startsWith("```")) {
      jsonString = jsonString.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    const result = JSON.parse(jsonString) as AnalysisResult;
    return result;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};
