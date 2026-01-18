
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { createChat, generateSpeech } from '../services/geminiService';

const AIChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLive, setIsLive] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [useDeepThinking, setUseDeepThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const chatRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (isOpen) {
      chatRef.current = createChat(useDeepThinking);
    }
  }, [isOpen, useDeepThinking]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isThinking) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsThinking(true);

    try {
      const result = await chatRef.current.sendMessage({ message: userMsg });
      setMessages(prev => [...prev, { role: 'model', text: result.text }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I'm having trouble connecting to the candle network." }]);
    } finally {
      setIsThinking(false);
    }
  };

  const readAloud = async (text: string) => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    try {
      const audioData = await generateSpeech(text);
      if (audioData) {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const ctx = audioContextRef.current;
        const binary = atob(audioData);
        const len = binary.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
        
        const dataInt16 = new Int16Array(bytes.buffer);
        const frameCount = dataInt16.length;
        const buffer = ctx.createBuffer(1, frameCount, 24000);
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i] / 32768.0;
        
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.onended = () => setIsSpeaking(false);
        source.start(0);
      }
    } catch (e) {
      console.error("TTS failed", e);
      setIsSpeaking(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 md:bottom-8 right-8 w-14 h-14 bg-amber-500 text-white rounded-full shadow-2xl flex items-center justify-center text-2xl z-[100] transition-transform active:scale-90 hover:scale-110"
      >
        {isOpen ? '✕' : '✨'}
      </button>

      {isOpen && (
        <div className="fixed bottom-40 md:bottom-28 right-8 w-[90vw] md:w-96 h-[550px] bg-white rounded-[2.5rem] shadow-2xl z-[100] flex flex-col overflow-hidden border border-amber-50 animate-fadeIn">
          <div className="p-6 bg-black text-white flex justify-between items-center">
            <div>
              <h3 className="font-black tracking-tight">Mizo Concierge</h3>
              <div className="flex items-center gap-2 mt-1">
                <button 
                  onClick={() => setUseDeepThinking(!useDeepThinking)}
                  className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border transition-colors ${useDeepThinking ? 'bg-amber-500 border-amber-500' : 'border-white/20 opacity-50'}`}
                >
                  Thinking Mode
                </button>
              </div>
            </div>
          </div>

          <div ref={scrollRef} className="flex-grow p-6 overflow-y-auto space-y-4 bg-gray-50/50">
            {messages.length === 0 && (
              <div className="text-center py-10 opacity-40">
                <span className="text-4xl mb-2 block">🕯️</span>
                <p className="text-xs font-bold uppercase tracking-widest">How can I assist your sanctuary today?</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className="relative group max-w-[85%]">
                  <div className={`p-4 rounded-3xl text-sm font-medium leading-relaxed shadow-sm ${
                    m.role === 'user' ? 'bg-amber-500 text-white' : 'bg-white text-gray-800 border'
                  }`}>
                    {m.text}
                  </div>
                  {m.role === 'model' && (
                    <button 
                      onClick={() => readAloud(m.text)}
                      className="absolute -right-2 -top-2 w-6 h-6 bg-white border rounded-full flex items-center justify-center text-[10px] shadow-sm hover:scale-110 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      🔊
                    </button>
                  )}
                </div>
              </div>
            ))}
            {isThinking && (
              <div className="flex justify-start">
                <div className="bg-white p-4 rounded-3xl flex gap-1 items-center border">
                  <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-white border-t">
            <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="flex gap-2">
              <input 
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={useDeepThinking ? "Entering deep thinking..." : "Ask about scents..."}
                className="flex-grow px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500/20 text-sm font-medium"
              />
              <button type="submit" className="p-3 bg-black text-white rounded-2xl hover:bg-gray-800 transition-colors">
                <span className="text-xl">➔</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChat;
