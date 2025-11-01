    import { GoogleGenAI, Chat, GenerateContentResponse, Type } from "@google/genai";
    import type { Location, Itinerary } from '../types';

    const SYSTEM_INSTRUCTION = `You are a helpful and enthusiastic tour guide for the city of Gorakhpur, India. Your name is 'Gorakhpur Guide'. Provide detailed, friendly, and positive information about the city. Answer questions about its history, culture, food, famous places, and current events. Always maintain a positive and proud tone about Gorakhpur. 
    
    New Features:
    - You can encourage users to connect on the Community Bulletin Board for discussions.
    - If a user asks for a recommendation for a service (like a plumber, electrician, etc.), you should guide them to check out the new 'Verified Local Services' directory in the app.
    - Crucially, if a user asks about buying tickets for events, or wants to shop for local goods (like handicrafts, terracotta, etc.), you MUST direct them to the 'Gorakhpur Marketplace' section of the app. This is the central place for all commerce.
    
    Format your answers clearly, using markdown for headings, lists, and bold text where appropriate. When asked for nearby places, use the provided location data to give relevant suggestions.`;
    
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API_KEY environment variable is not set.");
    }
    const ai = new GoogleGenAI({ apiKey });

    let chat: Chat | null = null;
    let currentConfigKey: string = "";

    const getChatSession = (isThinkingMode: boolean, location: Location | null): Chat => {
      const modelName = isThinkingMode ? "gemini-2.5-pro" : "gemini-2.5-flash";
      const locationKey = location ? 'with-location' : 'no-location';
      const newConfigKey = `${modelName}-${locationKey}`;

      if (chat && currentConfigKey === newConfigKey) {
        return chat;
      }
      
      const config: any = { systemInstruction: SYSTEM_INSTRUCTION };
      
      if (isThinkingMode) {
        config.thinkingConfig = { thinkingBudget: 32768 };
      }

      if (location) {
        config.tools = [{googleMaps: {}}];
        config.toolConfig = {
          retrievalConfig: {
            latLng: {
              latitude: location.latitude,
              longitude: location.longitude,
            }
          }
        };
      }

      chat = ai.chats.create({
        model: modelName,
        config: config,
      });

      currentConfigKey = newConfigKey;
      return chat;
    };

    export const askGorakhpurGuide = async (prompt: string, isThinkingMode: boolean = false, location: Location | null = null): Promise<{ text: string; groundingChunks?: any[] }> => {
      try {
        const chatSession = getChatSession(isThinkingMode, location);
        const response: GenerateContentResponse = await chatSession.sendMessage({ message: prompt });
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        return { text: response.text, groundingChunks };
      } catch (error) {
        console.error("Error calling Gemini API:", error);
        chat = null; // Reset chat on error
        if (error instanceof Error) {
          return { text: `Sorry, I encountered an error while trying to answer your question: ${error.message}` };
        }
        return { text: "Sorry, I encountered an unknown error. Please try again later." };
      }
    };

    export const generateItinerary = async (duration: string, interests: string[], budget: string): Promise<Itinerary> => {
      const prompt = `
        Create a personalized travel itinerary for a trip to Gorakhpur, India.
        
        Trip Details:
        - Duration: ${duration}
        - Interests: ${interests.join(", ")}
        - Budget: ${budget}

        Please generate a creative title and a brief summary for the trip. Then, provide a detailed day-by-day plan. For each day, include a title and a list of activities with suggested times, a short description for each activity, and make sure the activities align with the specified interests and budget.
        
        Structure the entire response as a single JSON object that conforms to the provided schema.
      `;
      
      const itinerarySchema = {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "A creative title for the itinerary." },
          summary: { type: Type.STRING, description: "A brief, engaging summary of the trip." },
          plan: {
            type: Type.ARRAY,
            description: "An array of daily plans.",
            items: {
              type: Type.OBJECT,
              properties: {
                day: { type: Type.INTEGER, description: "The day number, starting from 1." },
                title: { type: Type.STRING, description: "A theme or title for the day's plan." },
                activities: {
                  type: Type.ARRAY,
                  description: "A list of activities for the day.",
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      time: { type: Type.STRING, description: "Suggested time range for the activity (e.g., '9:00 AM - 11:00 AM')." },
                      activity: { type: Type.STRING, description: "The name of the activity or place to visit." },
                      description: { type: Type.STRING, description: "A short, compelling description of the activity." },
                    },
                    required: ["time", "activity", "description"],
                  },
                },
              },
              required: ["day", "title", "activities"],
            },
          },
        },
        required: ["title", "summary", "plan"],
      };

      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-pro", // Using a more powerful model for a complex creative task.
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: itinerarySchema,
          },
        });

        // The response.text should be a JSON string that we need to parse.
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
      } catch (error) {
        console.error("Error generating itinerary:", error);
        if (error instanceof Error) {
          throw new Error(`Failed to generate itinerary: ${error.message}`);
        }
        throw new Error("An unknown error occurred while generating the itinerary.");
      }
    };

    export const summarizeText = async (textToSummarize: string): Promise<string> => {
      const prompt = `Summarize the following text in three concise bullet points, using markdown for the bullets (e.g., '* Point 1').:\n\n---\n\n${textToSummarize}`;

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });
        return response.text;
      } catch (error) {
        console.error("Error summarizing text:", error);
        if (error instanceof Error) {
          throw new Error(`Failed to generate summary: ${error.message}`);
        }
        throw new Error("An unknown error occurred while generating the summary.");
      }
    };