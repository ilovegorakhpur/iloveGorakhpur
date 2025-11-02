/*
 * Copyright (c) 2024, iLoveGorakhpur Project Contributors.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. 
 */
    import { GoogleGenAI, Chat, GenerateContentResponse, Type, FunctionDeclaration, FunctionCall } from "@google/genai";
    import type { Location, Itinerary, LocalEvent, ServiceListing, Product } from '../types';

    const SYSTEM_INSTRUCTION = `You are the 'Gorakhpur Guide', a friendly, knowledgeable, and passionate local expert for the city of Gorakhpur, India. Your personality is warm, welcoming, and you are always excited to share the best of your city.

---
**CORE DIRECTIVES**

1.  **TOOL FIRST, ALWAYS:** Your primary function is to use the provided tools ('findLocalEvents', 'findLocalServices', 'findLocalProducts') to give direct, specific answers. You MUST prioritize using these tools over providing general advice.
2.  **NO EXTERNAL WEBSITES:** You MUST NOT recommend external websites, apps, or platforms like Facebook, BookMyShow, AllEvents.in, or suggest using a search engine. All your information comes directly from the app's internal listings.
3.  **GORAKHPUR ONLY:** All user questions must be interpreted as being about Gorakhpur. NEVER ask for their city. If asked about another location, politely state your expertise is limited to Gorakhpur.

---
**RESPONSE GUIDELINES**

- **Direct Answers:** When a user asks a question that can be answered by a tool (e.g., "show events," "find a plumber"), use the tool immediately and present the results clearly. Do not ask clarifying questions unless absolutely necessary to use the tool.
- **Formatting:** Use markdown for clarity (headings, bold text, and especially lists). Make your answers easy to scan.
- **Presenting Results:**
    - **Events:** For each event, list its 'Title', 'Location', and 'Price'.
    - **Products:** For each product, list its 'Name', 'Seller', and 'Price'.
    - **Services:** For each service, list its 'Name', 'Category', and 'Rating'.
- **Handling No Results:** If a tool returns no results, state that you couldn't find anything matching their specific request. Then, suggest they either broaden their search terms or browse the relevant section of the app directly.
- **Call to Action:** After successfully providing results from a tool, end your response by encouraging the user to visit the 'Marketplace' or 'Verified Local Services' section for more details.
- **Location Awareness:** When using the user's location for nearby suggestions, briefly mention it so they know they are getting personalized results.
- **Tone:** Maintain a proud, enthusiastic, and helpful tone. You are a passionate local expert.`;
    
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API_KEY environment variable is not set.");
    }
    const ai = new GoogleGenAI({ apiKey });

    let chat: Chat | null = null;
    let currentConfigKey: string = "";
    
    const findLocalEventsTool: FunctionDeclaration = {
      name: 'findLocalEvents',
      description: "Finds local events in Gorakhpur based on user interests and date preferences. Use this when the user asks for event recommendations.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          interest: {
            type: Type.STRING,
            description: "The category or type of event the user is interested in (e.g., 'Music', 'Workshop', 'Comedy', 'Art').",
          },
          dateRange: {
            type: Type.STRING,
            description: "The desired date range. Can be 'today', 'tomorrow', 'this week', 'this weekend', or 'this month'.",
          },
        },
        required: [],
      },
    };
    
    const findLocalServicesTool: FunctionDeclaration = {
      name: 'findLocalServices',
      description: "Finds verified local services in Gorakhpur based on the user's needs (e.g., plumber, electrician, tutor). Use this when the user asks for a specific service recommendation.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          serviceType: {
            type: Type.STRING,
            description: "The type of service the user is looking for (e.g., 'Plumber', 'Electrician', 'Carpenter').",
          },
        },
        required: ['serviceType'],
      },
    };
    
    const findLocalProductsTool: FunctionDeclaration = {
      name: 'findLocalProducts',
      description: "Finds local products in the Gorakhpur Marketplace based on user queries. Use this when the user asks about buying local items, handicrafts, food products, etc.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          productType: {
            type: Type.STRING,
            description: "The type or category of product the user is looking for (e.g., 'terracotta', 'handicrafts', 'spices', 'honey').",
          },
        },
        required: ['productType'],
      },
    };

    const getChatSession = (location: Location | null): Chat => {
      const modelName = "gemini-2.5-flash";
      const locationKey = location ? 'with-location' : 'no-location';
      const toolsKey = 'with-events-services-products-tool';
      const newConfigKey = `${modelName}-${locationKey}-${toolsKey}`;

      if (chat && currentConfigKey === newConfigKey) {
        return chat;
      }
      
      const chatRequest: any = {
        model: modelName,
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ functionDeclarations: [findLocalEventsTool, findLocalServicesTool, findLocalProductsTool] }],
      };
      
      if (location) {
        chatRequest.tools.push({googleMaps: {}});
        chatRequest.toolConfig = {
          retrievalConfig: {
            latLng: {
              latitude: location.latitude,
              longitude: location.longitude,
            }
          }
        };
      }

      chat = ai.chats.create(chatRequest);

      currentConfigKey = newConfigKey;
      return chat;
    };

    const filterEvents = (allEvents: LocalEvent[], interest?: string, dateRange?: string): LocalEvent[] => {
        let events = [...allEvents];
        const now = new Date();

        if (interest) {
            const lowerInterest = interest.toLowerCase();
            events = events.filter(e => e.category.toLowerCase().includes(lowerInterest));
        }

        if (dateRange) {
            const today = new Date(new Date().setHours(0, 0, 0, 0));
            switch (dateRange.toLowerCase()) {
                case 'today':
                    const endOfToday = new Date(new Date(today).setDate(today.getDate() + 1));
                    events = events.filter(e => new Date(e.date) >= today && new Date(e.date) < endOfToday);
                    break;
                case 'tomorrow':
                    const tomorrow = new Date(new Date(today).setDate(today.getDate() + 1));
                    const endOfTomorrow = new Date(new Date(tomorrow).setDate(tomorrow.getDate() + 1));
                    events = events.filter(e => new Date(e.date) >= tomorrow && new Date(e.date) < endOfTomorrow);
                    break;
                case 'this week':
                    const startOfWeek = new Date(today);
                    startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1)); // Monday as start of week
                    const endOfWeek = new Date(new Date(startOfWeek).setDate(startOfWeek.getDate() + 7));
                    events = events.filter(e => new Date(e.date) >= startOfWeek && new Date(e.date) < endOfWeek);
                    break;
                case 'this weekend':
                    const friday = new Date(today);
                    friday.setDate(today.getDate() + (5 - today.getDay() + 7) % 7); // Find coming Friday
                    const endOfSunday = new Date(new Date(friday).setDate(friday.getDate() + 3));
                    events = events.filter(e => new Date(e.date) >= friday && new Date(e.date) < endOfSunday);
                    break;
                case 'this month':
                    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                    const endOfMonth = new Date(new Date(now.getFullYear(), now.getMonth() + 1, 0).setHours(23, 59, 59, 999));
                    events = events.filter(e => new Date(e.date) >= startOfMonth && new Date(e.date) <= endOfMonth);
                    break;
            }
        }
        return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    };

    const filterServices = (allServices: ServiceListing[], serviceType?: string): ServiceListing[] => {
        if (!serviceType) {
            return [];
        }
        const lowerServiceType = serviceType.toLowerCase().replace(/s$/, ''); // Handle simple plurals
        return allServices
            .filter(s => s.category.toLowerCase().includes(lowerServiceType))
            .sort((a, b) => b.rating - a.rating); // Sort by rating
    };

    const filterProducts = (allProducts: Product[], productType?: string): Product[] => {
        if (!productType) {
            return [];
        }
        const lowerProductType = productType.toLowerCase();
        return allProducts
            .filter(p => p.category.toLowerCase().includes(lowerProductType) || p.name.toLowerCase().includes(lowerProductType));
    };

    export async function* askGorakhpurGuideStream(
        prompt: string, 
        allEvents: LocalEvent[], 
        allServices: ServiceListing[], 
        allProducts: Product[], 
        location: Location | null = null
    ): AsyncGenerator<{ text: string; groundingChunks?: any[] }> {
        try {
            const chatSession = getChatSession(location);
            
            const initialStream = await chatSession.sendMessageStream({ message: prompt });
    
            let collectedFunctionCalls: FunctionCall[] = [];
            let textStreamStarted = false;

            // First pass: Handle initial text response and collect function calls
            for await (const chunk of initialStream) {
                if (chunk.text) {
                    textStreamStarted = true;
                    yield { text: chunk.text, groundingChunks: chunk.candidates?.[0]?.groundingMetadata?.groundingChunks };
                }
                const functionCalls = chunk.functionCalls;
                if (functionCalls && functionCalls.length > 0) {
                    collectedFunctionCalls.push(...functionCalls);
                }
            }
    
            // If function calls were collected, process them and get the final response
            if (collectedFunctionCalls.length > 0) {
                const toolResponses = collectedFunctionCalls.map(call => {
                    if (call.name === 'findLocalEvents') {
                        const { interest, dateRange } = call.args;
                        const recommendedEvents = filterEvents(allEvents, interest, dateRange);
                        const simplifiedEvents = recommendedEvents.map(({ title, date, location, category, price }) => ({ title, date, location, category, price }));
                        return { id: call.id, name: call.name, response: { events: simplifiedEvents } };
                    } else if (call.name === 'findLocalServices') {
                        const { serviceType } = call.args;
                        const recommendedServices = filterServices(allServices, serviceType);
                        const topVerifiedServices = recommendedServices.filter(s => s.isVerified).slice(0, 3);
                        const simplifiedServices = topVerifiedServices.map(({ name, category, rating, phone }) => ({ name, category, rating, phone }));
                        return { id: call.id, name: call.name, response: { services: simplifiedServices } };
                    } else if (call.name === 'findLocalProducts') {
                        const { productType } = call.args;
                        const recommendedProducts = filterProducts(allProducts, productType);
                        const simplifiedProducts = recommendedProducts.slice(0, 5).map(({ name, price, seller, category }) => ({ name, price, seller, category }));
                        return { id: call.id, name: call.name, response: { products: simplifiedProducts } };
                    }
                    return null;
                }).filter(Boolean);
    
                if (toolResponses.length > 0) {
                    const finalStream = await chatSession.sendMessageStream({
                        toolResponses
                    });
                    for await (const chunk of finalStream) {
                        yield { text: chunk.text, groundingChunks: chunk.candidates?.[0]?.groundingMetadata?.groundingChunks };
                    }
                }
            } else if (!textStreamStarted) {
                // This is an edge case for an empty or non-text initial response without function calls.
                yield { text: "I'm not sure how to answer that. Could you please rephrase your question?" };
            }
        } catch (error) {
            console.error("Error calling Gemini API:", error);
            chat = null; // Reset chat on error
            if (error instanceof Error) {
                yield { text: `Sorry, I encountered an error while trying to answer your question: ${error.message}` };
            } else {
                yield { text: "Sorry, I encountered an unknown error. Please try again later." };
            }
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
          model: "gemini-2.5-flash",
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

    export const moderateContent = async (text: string): Promise<{ decision: 'SAFE' | 'UNSAFE' }> => {
        const prompt = `You are a content moderation AI. Analyze the following text and determine if it is SAFE or UNSAFE for a public community forum. Unsafe content includes hate speech, spam, harassment, explicit content, or calls to violence. Respond with only a JSON object with a single key 'decision' which can be either 'SAFE' or 'UNSAFE'.\n\nText to analyze: "${text}"`;

        const schema = {
            type: Type.OBJECT,
            properties: {
                decision: {
                    type: Type.STRING,
                    description: "The moderation decision, either 'SAFE' or 'UNSAFE'."
                }
            },
            required: ["decision"]
        };

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: schema,
                }
            });
            const jsonText = response.text.trim();
            const result = JSON.parse(jsonText);
            if (result.decision === 'SAFE' || result.decision === 'UNSAFE') {
                return result;
            }
            // Fallback for unexpected decision values
            console.warn("Moderation returned unexpected value:", result.decision);
            return { decision: 'UNSAFE' };
        } catch (error) {
            console.error("Error during content moderation:", error);
            // Default to unsafe on error to be cautious
            return { decision: 'UNSAFE' };
        }
    };

    export const generateDescription = async (title: string, category: string): Promise<string> => {
        const prompt = `You are a marketing assistant. Write a short, attractive, and engaging description for the following item. The description should be about 2-3 sentences long. Do not use markdown. Just return the plain text description.\n\nItem Title: '${title}', Category: '${category}'`;
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            return response.text.trim();
        } catch (error) {
            console.error("Error generating description:", error);
            return "Failed to generate a description. Please write one manually.";
        }
    };

    export const getTopicExplanation = async (topic: string): Promise<string> => {
        const prompt = `You are the 'Gorakhpur Guide', a knowledgeable and passionate local expert. Write a detailed and engaging article about the following topic related to Gorakhpur: '${topic}'. Use markdown for formatting, including headings and lists, to make the content easy to read and visually appealing.`;
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            return response.text;
        } catch (error) {
            console.error("Error getting topic explanation:", error);
            if (error instanceof Error) {
                return `Sorry, I couldn't generate information on that topic right now. Error: ${error.message}`;
            }
            return "Sorry, an unknown error occurred while fetching information.";
        }
    };