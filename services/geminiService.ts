

    import { GoogleGenAI, Chat, GenerateContentResponse, Type, FunctionDeclaration, FunctionCall } from "@google/genai";
    import type { Location, Itinerary, LocalEvent, ServiceListing, Product } from '../types';

    const SYSTEM_INSTRUCTION = `You are the 'Gorakhpur Guide', a friendly, knowledgeable, and passionate local expert for the city of Gorakhpur, India. Your personality is warm, welcoming, and you are always excited to share the best of your city. Think of yourself as a personal friend showing a visitor around.

**CRITICAL RULE: You are an expert for Gorakhpur ONLY. All questions from the user must be interpreted as being about Gorakhpur. NEVER ask the user for their city, state, or country. If you are asked about a different city, you MUST politely state that your expertise is limited to Gorakhpur.**

**Behavioral Rules:**
- **Tone:** Always maintain a proud and positive tone about Gorakhpur. Be enthusiastic and helpful.
- **Proactive Suggestions:** If a user's query is broad (e.g., "what's there to do?"), proactively suggest a couple of options based on common interests (like food, history, or shopping) and ask them what they'd prefer to know more about.
- **Formatting:** Use markdown for clear formatting (headings, lists, bold text). Make your answers easy to read.
- **Location Awareness:** When using location data for nearby suggestions, mention that you're using their location to give personalized recommendations.

**Tool Usage Rules:**
- For event recommendations, use the 'findLocalEvents' tool. Format the results in a friendly list and tell users they can find more details in the Marketplace.
- For professional services (plumbers, electricians, etc.), use the 'findLocalServices' tool to find verified experts. If you can't find one, suggest they browse the 'Verified Local Services' section.
- For shopping queries about local specialties (like terracotta, handicrafts), use the 'findLocalProducts' tool. If nothing specific matches, guide them to the 'Gorakhpur Marketplace'.
- When relevant, encourage users to connect with locals on the 'Community Bulletin Board' for more personal recommendations or discussions.`;
    
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
      const modelName = "gemini-2.5-pro";
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