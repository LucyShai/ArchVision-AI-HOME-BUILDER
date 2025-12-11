import React, { useState, useEffect, useRef } from 'react';
import { Type, Tool, FunctionDeclaration } from "@google/genai";
import { DesignConfig, GeneratedImage, HOME_STYLES, AVAILABLE_FEATURES } from '../types';
import { ai, generateArchitectureImage } from '../services/geminiService';
import * as LucideIcons from 'lucide-react';

interface ChatViewProps {
  config: DesignConfig;
  setConfig: React.Dispatch<React.SetStateAction<DesignConfig>>;
  onGenerate: (image: GeneratedImage) => void;
}

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: GeneratedImage;
  isThinking?: boolean;
}

const SYSTEM_INSTRUCTION = `
You are the "ArchVision Assistant", an expert AI architect.
Your goal is to help users design their dream home by updating the configuration and generating visualizations.

You have access to tools to:
1. Update the design configuration (style, bedrooms, features, etc.).
2. Generate architectural images (blueprints or exteriors).

Rules:
- If the user describes a house, use 'update_configuration' to set the parameters matching their description.
- Use 'modern-minimalist', 'traditional-family', 'luxury-villa', 'compact-urban', or 'eco-friendly' for styleId.
- If the user asks to "show", "visualize", or "generate" it, call 'generate_design'.
- Be helpful, concise, and professional. 
- Always confirm what changes you made.
`;

export const ChatView: React.FC<ChatViewProps> = ({ config, setConfig, onGenerate }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'Hello! I am your AI Architect Assistant. Tell me about your dream home (e.g., "I want a 4-bedroom baby blue luxury villa with a pool") and I will configure it for you.'
    }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const chatSessionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Chat
  useEffect(() => {
    const initChat = async () => {
      // Define tools
      const updateConfigTool: FunctionDeclaration = {
        name: 'update_configuration',
        description: 'Update the design configuration based on user requirements.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            styleId: { 
              type: Type.STRING, 
              description: 'Style ID: modern-minimalist, traditional-family, luxury-villa, compact-urban, eco-friendly' 
            },
            bedrooms: { type: Type.NUMBER },
            levels: { type: Type.NUMBER },
            bathrooms: { type: Type.NUMBER },
            lotSize: { type: Type.NUMBER },
            featuresToAdd: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING }, 
              description: 'Features to add from: ' + AVAILABLE_FEATURES.join(', ') 
            },
            customPrompt: { type: Type.STRING, description: 'Specific visual details for the prompt' }
          },
        }
      };

      const generateDesignTool: FunctionDeclaration = {
        name: 'generate_design',
        description: 'Generate an image of the current design.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, description: 'Type of generation: "blueprint" or "exterior"' }
          },
          required: ['type']
        }
      };

      const tools: Tool[] = [{ functionDeclarations: [updateConfigTool, generateDesignTool] }];

      try {
        chatSessionRef.current = ai.chats.create({
          model: 'gemini-2.5-flash',
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            tools: tools,
          }
        });
      } catch (e) {
        console.error("Failed to init chat", e);
      }
    };

    initChat();
  }, []);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const executeUpdateConfig = (args: any) => {
    console.log("Updating config with:", args);
    setConfig(prev => {
      const next = { ...prev };
      if (args.styleId) next.styleId = args.styleId;
      if (args.bedrooms) next.bedrooms = args.bedrooms;
      if (args.levels) next.levels = args.levels;
      if (args.bathrooms) next.bathrooms = args.bathrooms;
      if (args.lotSize) next.lotSize = args.lotSize;
      if (args.customPrompt) next.customPrompt = args.customPrompt;
      
      if (args.featuresToAdd && Array.isArray(args.featuresToAdd)) {
        // Simple merge
        const unique = new Set([...next.features, ...args.featuresToAdd]);
        next.features = Array.from(unique);
      }
      return next;
    });
    return "Configuration updated successfully.";
  };

  const executeGenerate = async (args: any) => {
    const type = args.type === 'blueprint' ? 'blueprint' : 'exterior';
    const styleName = HOME_STYLES.find(s => s.id === config.styleId)?.name || 'Modern';
    
    try {
      const base64 = await generateArchitectureImage(config, type, styleName);
      
      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        url: base64,
        type: type,
        timestamp: Date.now(),
        config: { ...config },
        prompt: config.customPrompt || "Generated via Assistant"
      };

      onGenerate(newImage);
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: `Here is the ${type} you requested.`,
        image: newImage
      }]);

      return `Image generated successfully. ID: ${newImage.id}`;
    } catch (e: any) {
      return `Error generating image: ${e.message}`;
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !chatSessionRef.current) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsProcessing(true);

    try {
      let result = await chatSessionRef.current.sendMessage({ message: input });
      
      while (result.functionCalls && result.functionCalls.length > 0) {
        const functionCalls = result.functionCalls;
        const functionResponses = [];

        for (const call of functionCalls) {
          let responseObj: any = { result: "Unknown function" };
          
          if (call.name === 'update_configuration') {
            responseObj = { result: executeUpdateConfig(call.args) };
          } else if (call.name === 'generate_design') {
            const resText = await executeGenerate(call.args);
            responseObj = { result: resText };
          }

          functionResponses.push({
            id: call.id,
            name: call.name,
            response: responseObj
          });
        }

        result = await chatSessionRef.current.sendMessage({
            message: functionResponses 
        });
      }

      const modelText = result.text;
      if (modelText) {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'model',
          text: modelText
        }]);
      }

    } catch (error) {
      console.error("Chat Error", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "I encountered an error processing your request. Please try again."
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-slate-800 text-white' : 'bg-sky-100 text-sky-600'}`}>
                {msg.role === 'user' ? <LucideIcons.User className="w-5 h-5" /> : <LucideIcons.Bot className="w-5 h-5" />}
              </div>

              {/* Bubble */}
              <div className={`flex flex-col gap-2`}>
                {msg.text && (
                  <div className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-slate-800 text-white rounded-tr-none' 
                      : 'bg-sky-50 text-slate-700 border border-sky-100 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                )}

                {/* Generated Image Card */}
                {msg.image && (
                  <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-md max-w-sm mt-2">
                    <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden mb-2 relative">
                       <img src={msg.image.url} alt="Generated" className="w-full h-full object-cover" />
                       <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded font-bold uppercase backdrop-blur-md">
                          {msg.image.type}
                       </div>
                    </div>
                    <div className="px-1 pb-1">
                      <p className="text-xs font-bold text-slate-800">{HOME_STYLES.find(s => s.id === msg.image?.config.styleId)?.name}</p>
                      <p className="text-[10px] text-slate-500">{msg.image.config.bedrooms} Bed • {msg.image.config.lotSize}m²</p>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        ))}
        {isProcessing && (
           <div className="flex justify-start">
             <div className="flex gap-3 max-w-[80%]">
               <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                 <LucideIcons.Bot className="w-5 h-5" />
               </div>
               <div className="bg-sky-50 p-4 rounded-2xl rounded-tl-none border border-sky-100 flex items-center gap-2">
                 <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce"></div>
                 <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                 <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
               </div>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your changes or ask to generate (e.g., 'Change to 5 bedrooms and add a garage')..."
            className="w-full pl-4 pr-14 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none resize-none text-sm min-h-[50px] max-h-[120px]"
            rows={1}
          />
          <button 
            onClick={handleSendMessage}
            disabled={!input.trim() || isProcessing}
            className="absolute right-2 bottom-2 p-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 disabled:opacity-50 disabled:hover:bg-sky-500 transition-colors"
          >
            <LucideIcons.Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-center text-slate-400 mt-2">
          AI Assistant can update configuration and generate designs.
        </p>
      </div>
    </div>
  );
};