'use client';

import React, { useEffect, useState, useRef } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { api } from '@/lib/api';
import {
  Bot,
  Sparkles,
  Send,
  User,
  Lightbulb,
  RefreshCw,
} from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface Insight {
  category: string;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  actionable: boolean;
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        'Halo! Saya **RentMate AI Assistant**, didukung oleh Groq Model openai/gpt-oss-120b. Saya siap membantu Anda mengelola kamar kost, menganalisis performa sewa, atau merancang strategi kenaikan okupansi. Ada yang bisa saya bantu hari ini?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchInsights = async () => {
    try {
      setLoadingInsights(true);
      const res = await api.get('/ai/insights');
      if (res.success && res.data?.insights) {
        setInsights(res.data.insights);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingInsights(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || isSending) return;

    const userMsg: ChatMessage = {
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputMessage('');
    setIsSending(true);

    try {
      const res = await api.post<{ reply: string }>('/ai/assistant', {
        message: textToSend,
      });

      if (res.success && res.data) {
        const assistantMsg: ChatMessage = {
          role: 'assistant',
          content: res.data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        role: 'assistant',
        content: 'Maaf, terjadi kendala saat menghubungi AI: ' + (err.message || 'Koneksi gagal') + '. Silakan coba lagi.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const samplePrompts = [
    'Berapa jumlah kamar kosong dan bagaimana strategi memasarkannya?',
    'Buatkan draft pesan WhatsApp penagihan sewa jatuh tempo yang ramah dan sopan.',
    'Apa saja perbaikan AC yang paling mendesak untuk ditangani?',
  ];

  return (
    <AppLayout
      title="RentMate Smart AI Assistant"
      subtitle="Asisten cerdas berbasis Groq AI yang memahami seluruh data real-time properti Anda."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-xs flex flex-col overflow-hidden">
          <div className="p-4 px-6 border-b border-gray-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                  RentMate Property Agent
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Online
                  </span>
                </h3>
                <p className="text-[11px] text-gray-400">
                  Groq Model openai/gpt-oss-120b • Konteks Real-Time Database Kost
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-50/40">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-3 max-w-[85%] ${
                  m.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${
                    m.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-indigo-100 text-indigo-700'
                  }`}
                >
                  {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`p-4 rounded-2xl text-xs leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none shadow-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.content}</p>
                  <span
                    className={`block text-[10px] mt-2 ${
                      m.role === 'user' ? 'text-indigo-200 text-right' : 'text-gray-400'
                    }`}
                  >
                    {m.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isSending && (
              <div className="flex gap-3 max-w-[85%] mr-auto">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 shrink-0 flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3.5 bg-white border border-gray-100 rounded-2xl rounded-tl-none shadow-xs text-xs text-gray-400 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]" />
                  <span>AI sedang menganalisis data...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-gray-100 bg-white">
            <div className="flex items-center gap-2 overflow-x-auto pb-3 text-xs">
              {samplePrompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(undefined, p)}
                  className="whitespace-nowrap px-3 py-1 rounded-full bg-gray-100 hover:bg-indigo-50 hover:text-indigo-600 text-gray-600 text-[11px] font-medium transition cursor-pointer"
                >
                  {p}
                </button>
              ))}
            </div>

            <form onSubmit={(e) => handleSendMessage(e)} className="flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Tanyakan hal apapun seputar properti, keuangan, atau keluhan penyewa..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
              />
              <button
                type="submit"
                disabled={isSending || !inputMessage.trim()}
                className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 transition shadow-xs cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-5 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-gray-900 text-sm">Smart Insights</h3>
              </div>
              <button
                onClick={fetchInsights}
                className="p-1 text-gray-400 hover:text-indigo-600 transition cursor-pointer"
                title="Perbarui Insight"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {loadingInsights ? (
                <div className="py-12 text-center text-xs text-gray-400">
                  <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  Mengkalkulasi insight...
                </div>
              ) : insights.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-400">
                  <Lightbulb className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                  Semua operasional kost optimal. Belum ada insight baru.
                </div>
              ) : (
                insights.map((ins, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-2xl border border-indigo-50 bg-gradient-to-br from-indigo-50/40 to-purple-50/20 text-xs"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold text-indigo-900 text-[11px] uppercase tracking-wider">
                        {ins.category}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                          ins.priority === 'HIGH'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-indigo-100 text-indigo-700'
                        }`}
                      >
                        {ins.priority}
                      </span>
                    </div>
                    <h4 className="font-bold text-gray-900 text-xs mb-1">
                      {ins.title}
                    </h4>
                    <p className="text-gray-500 text-[11px] leading-relaxed">
                      {ins.description}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-3 bg-indigo-50/60 rounded-xl mt-4 border border-indigo-100/50 text-[11px] text-indigo-900">
            <strong>Tips:</strong> Ketik pertanyaan di chat jika ingin penjabaran solusi lebih rinci untuk setiap insight di atas.
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
