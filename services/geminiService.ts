import { GoogleGenAI } from "@google/genai";
import { DesignConfig } from "../types";

export const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const validatePrompt = async (prompt: string): Promise<{ isValid: boolean; errorMessage?: string }> => {
  if (!prompt || prompt.trim().length === 0) return { isValid: true };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [{ 
            text: `You are a strict content filter for an architectural design AI.
            
            Goal: Only allow prompts related to houses, architecture, home design, or construction.

            Analyze the following User Input: "${prompt}"
            
            1. If the input is related to architecture/design/homes (e.g. "Modernist architects", "Types of roof trusses", "History of Gothic cathedrals", "Art Deco style"), respond with exactly: "YES"
            
            2. If the input is NOT related (e.g. food, cooking, fashion, cars, politics, sports, general knowledge unrelated to building), you must return a specific error message in the following format:
            "Error: The request is not related to houses or architecture. Please submit a prompt focusing on architecture, such as '[Suggestion 1]' or '[Suggestion 2]' to receive an output."
            
            Replace [Suggestion 1] and [Suggestion 2] with relevant architectural examples based on the user's intent if possible, or generic ones if not.
            
            Examples:
            - Input: "Best vegetarian recipes" -> Output: "Error: The request is not related to houses or architecture. Please submit a prompt focusing on architecture, such as 'Describe the key features of Baroque architecture' or 'What are the steps to designing a sustainable home?' to receive an output."
            - Input: "New York Fashion Week" -> Output: "Error: The request is not related to houses or architecture. Please submit a prompt focusing on the topic, such as 'Compare load-bearing walls vs. curtain walls' or 'Explain the principles of Feng Shui in home design' to receive an output."
            
            Response:` 
        }]
      }
    });

    const answer = response.text?.trim();
    
    if (answer?.toUpperCase().startsWith('YES')) {
        return { isValid: true };
    }

    // If it's not YES, treat the entire response as the error message.
    return { 
        isValid: false, 
        errorMessage: answer || "Error: The request is not related to houses or architecture." 
    };

  } catch (e) {
    console.warn("Validation check failed, defaulting to allow:", e);
    return { isValid: true };
  }
};

export const generateArchitectureImage = async (
  config: DesignConfig, 
  type: 'blueprint' | 'exterior', 
  styleName: string
): Promise<string> => {
  
  // Validate Custom Prompt before generating
  if (config.customPrompt) {
    const validation = await validatePrompt(config.customPrompt);
    if (!validation.isValid) {
      throw new Error(validation.errorMessage);
    }
  }

  const basePrompt = `
    Create a high-quality, professional architectural image.
    Type: ${type === 'blueprint' ? 'Architectural technical blueprint floor plan, top-down view, white background, blue or black lines, detailed dimensions' : 'Photorealistic 3D exterior render, architectural visualization, 8k resolution, cinematic lighting'}.
    Style: ${styleName}.
    Specs: ${config.bedrooms} bedrooms, ${config.bathrooms} bathrooms, ${config.levels} stories/levels.
    Lot Size: Approx ${config.lotSize} square meters.
    Key Features: ${config.features.join(', ')}.
    Additional Details: ${config.customPrompt}.
  `;

  // Use the Flash Image model for standard generation
  const modelId = 'gemini-2.5-flash-image'; 

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          { text: basePrompt }
        ]
      },
      config: {
        // No responseMimeType for image models
      }
    });

    let imageUrl = '';

    // Iterate through parts to find the image
    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (!imageUrl) {
      throw new Error("No image data received from Gemini.");
    }

    return imageUrl;

  } catch (error) {
    console.error("Gemini Image Gen Error:", error);
    throw error;
  }
};