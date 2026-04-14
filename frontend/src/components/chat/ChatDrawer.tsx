import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

const COMMON_QUERIES = [
  "Show low stock items",
  "Warehouse capacities",
  "Recent stock movements",
];

export default function ChatDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([{ 
    role: 'model', 
    text: 'Hello! I am your WTMS Assistant. You can ask me about inventory limits, warehouse capacities, low stock alerts, and recent movements. How can I help you today?' 
  }]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuth();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    
    const userMsg = { role: 'user' as const, text: text.trim() };
    const currentHist = [...messages];
    
    setMessages([...currentHist, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/v1/chat/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          history: currentHist.slice(1).map(m => ({ role: m.role, text: m.text })), // skip initial greeting if desired, or let gemini see it.
          message: text.trim()
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, { role: 'model', text: data.reply }]);
      } else {
        const errorData = await response.json();
        setMessages(prev => [...prev, { role: 'model', text: `Sorry, there was an error processing your request: ${errorData.detail || 'Unknown error'}` }]);
      }
    } catch (error) {
      console.error("Chat Error", error);
      setMessages(prev => [...prev, { role: 'model', text: 'Sorry, I am having trouble connecting to the server.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const submitForm = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputMessage);
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-glow animate-float z-50 p-0 flex items-center justify-center transition-transform hover:scale-110"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Drawer/Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-[350px] sm:w-[400px] h-[600px] max-h-[80vh] flex flex-col shadow-2xl z-50 border-primary/20 overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="bg-primary p-4 flex items-center justify-between text-primary-foreground">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <h3 className="font-semibold">WTMS Assistant</h3>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-primary-foreground hover:bg-primary/20 h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted border border-border'}`}>
                    {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div className={`p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-card border border-border rounded-tl-none'} whitespace-pre-wrap`}>
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex gap-2">
                  <div className="h-8 w-8 rounded-full bg-muted border border-border flex items-center justify-center">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="p-4 rounded-2xl bg-card border border-border rounded-tl-none">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          {messages.length === 1 && (
            <div className="px-4 py-2 bg-muted/20 flex flex-wrap gap-2 border-t border-border/50">
              {COMMON_QUERIES.map(q => (
                 <button 
                  key={q} 
                  onClick={() => handleSendMessage(q)}
                  className="text-xs bg-background border border-border rounded-full px-3 py-1.5 hover:border-primary hover:text-primary transition-colors"
                >
                  {q}
                 </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <form onSubmit={submitForm} className="p-3 bg-background border-t border-border flex items-center gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about inventory, warehouses..."
              disabled={isLoading}
              className="flex-1 bg-muted/50 border border-border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all disabled:opacity-50"
            />
            <Button type="submit" disabled={!inputMessage.trim() || isLoading} size="icon" className="h-9 w-9 rounded-full shrink-0">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </Card>
      )}
    </>
  );
}
