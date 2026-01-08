import React, { useState, useRef, useEffect } from 'react';
import { askTheSage } from '../services/geminiService';
import { ChatMessage } from '../types';

interface SageDialogProps {
    isOpen: boolean;
    onClose: () => void;
    context: string;
}

export const SageDialog: React.FC<SageDialogProps> = ({ isOpen, onClose, context }) => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'model', text: "致敬，工匠。我是阿拉里克大师。你是否怀疑空气起重机的效率？尽管问，我将为你阐明其中的物理学原理。" }
    ]);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setLoading(true);

        const response = await askTheSage(userMsg, context);
        
        setMessages(prev => [...prev, { role: 'model', text: response }]);
        setLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-slate-900 border-4 border-amber-700 rounded-lg w-full max-w-2xl h-[600px] flex flex-col shadow-2xl relative overflow-hidden">
                {/* Header */}
                <div className="bg-amber-900/50 p-4 border-b border-amber-700 flex justify-between items-center">
                    <h2 className="text-amber-100 medieval-font text-xl">阿拉里克手稿 (The Codex of Alaric)</h2>
                    <button onClick={onClose} className="text-amber-400 hover:text-white font-bold text-xl">&times;</button>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')]">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-3 rounded-lg border ${
                                msg.role === 'user' 
                                    ? 'bg-slate-700 border-slate-500 text-slate-100' 
                                    : 'bg-amber-900/40 border-amber-600 text-amber-100 font-serif italic'
                            }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-amber-900/40 border-amber-600 text-amber-200 p-3 rounded-lg animate-pulse">
                                正在占星...
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-slate-800 border-t border-amber-700 flex gap-2">
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="询问关于机械原理..."
                        className="flex-1 bg-slate-950 border border-slate-600 rounded p-2 text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                    <button 
                        onClick={handleSend}
                        disabled={loading}
                        className="bg-amber-700 hover:bg-amber-600 text-white px-4 py-2 rounded font-bold disabled:opacity-50 transition-colors"
                    >
                        询问
                    </button>
                </div>
            </div>
        </div>
    );
};