'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Volume2, Mic, Sparkles } from 'lucide-react';
import { useDiyStore } from '../../lib/store';

export default function AiAssistantPanel() {
  const { chatMessages, addChatMessage, materials } = useDiyStore();
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const query = chatInput.trim();
    if (!query) return;

    // Add User Message
    addChatMessage({ sender: 'user', text: query });
    setChatInput('');
    setIsTyping(true);

    // Simulate AI response based on query
    setTimeout(() => {
      let reply = `I suggest checking out designs combining ${materials.length > 0 ? materials.join(' and ') : 'recycled items'}. `;
      const queryLower = query.toLowerCase();

      if (queryLower.includes('tool') || queryLower.includes('equipment')) {
        reply += `For these items, you generally need simple hand tools like a hot glue gun, craft utility scissors, and a measuring tape. Always work on a cutting mat.`;
      } else if (queryLower.includes('safety') || queryLower.includes('danger') || queryLower.includes('hazard')) {
        reply += `Safety checklist: 1) Keep blades retracted when not cutting. 2) Apply hot glue sparingly to prevent finger burns. 3) Work in a well-ventilated space if using acrylic paints.`;
      } else if (queryLower.includes('alternative') || queryLower.includes('replace') || queryLower.includes('swap')) {
        reply += `No twine or glue? You can substitute duct tape, wire ties, or punch holes and sew pieces together using scrap wool thread.`;
      } else {
        reply += `That is a creative project route! Let me know if you would like me to detail specific step guides, provide safety rules, or list common dimensions.`;
      }

      addChatMessage({ sender: 'ai', text: reply });
      setIsTyping(false);
    }, 1200);
  };

  const applyQuickChip = (text: string) => {
    setChatInput(text);
  };

  const simulateVoiceInput = () => {
    setIsTyping(true);
    addChatMessage({ sender: 'user', text: '🎙️ [Voice Input]: What can I build with plastic bottles and cord?' });
    setTimeout(() => {
      addChatMessage({ sender: 'ai', text: 'For plastic bottles and cord, you can build self-watering planters, hanging seed bird feeders, or a simple desk cable management tidy. What difficulty do you prefer?' });
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="bg-[#1E293B]/30 border border-slate-800 rounded-2xl flex flex-col h-[560px] overflow-hidden shadow-md glass-panel">
      
      {/* Header */}
      <div className="p-4 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse-slow" />
          <span className="text-xs font-bold tracking-wide text-white uppercase font-mono flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#00D4FF]" /> AI Assistant Panel
          </span>
        </div>
        
        <button 
          onClick={simulateVoiceInput}
          className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          title="Voice Command Simulation"
        >
          <Volume2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin">
        {chatMessages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                msg.sender === 'user' 
                  ? 'bg-[#6C63FF] text-white rounded-tr-none shadow-md shadow-[#6C63FF]/10' 
                  : 'bg-[#1E293B]/80 text-slate-200 rounded-tl-none border border-slate-800'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-[#1E293B]/80 text-slate-400 rounded-2xl rounded-tl-none border border-slate-800 p-3.5 text-xs flex items-center gap-1.5 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00D4FF] animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#00D4FF] animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#00D4FF] animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* Quick Prompts */}
      <div className="px-4 py-2 border-t border-slate-850 bg-slate-950/20 flex gap-2 overflow-x-auto scrollbar-none shrink-0">
        <button 
          onClick={() => applyQuickChip('What tools do I need for these materials?')}
          className="text-[10px] bg-slate-800 hover:bg-slate-750 text-slate-350 px-2.5 py-1 rounded-full shrink-0 border border-slate-750 cursor-pointer font-semibold transition-colors"
        >
          🛠️ Tools needed?
        </button>
        <button 
          onClick={() => applyQuickChip('Show safety guidelines.')}
          className="text-[10px] bg-slate-800 hover:bg-slate-750 text-slate-350 px-2.5 py-1 rounded-full shrink-0 border border-slate-750 cursor-pointer font-semibold transition-colors"
        >
          ⚠️ Safety tips
        </button>
        <button 
          onClick={() => applyQuickChip('Suggest alternative materials for hot glue.')}
          className="text-[10px] bg-slate-800 hover:bg-slate-750 text-slate-350 px-2.5 py-1 rounded-full shrink-0 border border-slate-750 cursor-pointer font-semibold transition-colors"
        >
          💡 Swap items?
        </button>
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 border-t border-slate-800 bg-[#1E293B]/20 flex gap-2">
        <input 
          type="text"
          value={chatInput}
          onChange={e => setChatInput(e.target.value)}
          placeholder="Ask AI builder helper..."
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-[#6C63FF]"
        />
        
        <button 
          type="submit" 
          className="p-2.5 bg-[#6C63FF] hover:bg-[#7B68EE] text-white rounded-xl transition-colors cursor-pointer"
          title="Send Question"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
      
    </div>
  );
}
