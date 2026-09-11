"use client";

import React, { useEffect, useState, useRef } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import { Sparkles, Bot } from "lucide-react";
import { ChatMessage, AiChatWindow } from "./AiChatWindow";
import { AiChatInput } from "./AiChatInput";
import { Insight, AiInsightsSidebar } from "./AiInsightsSidebar";

export const AiAssistantView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Halo! Saya **RentMate AI Assistant**, didukung oleh Groq Model openai/gpt-oss-120b. Saya siap membantu Anda mengelola kamar kost, menganalisis performa sewa, atau merancang strategi kenaikan okupansi. Ada yang bisa saya bantu hari ini?",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchInsights = async () => {
    try {
      setLoadingInsights(true);
      const res = await api.get("/ai/insights");
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

  const handleSendMessage = async (
    e?: React.FormEvent,
    customText?: string,
  ) => {
    if (e) e.preventDefault();
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || isSending) return;

    const userMsg: ChatMessage = {
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputMessage("");
    setIsSending(true);

    try {
      const res = await api.post<{ reply: string }>("/ai/assistant", {
        message: textToSend,
      });

      if (res.success && res.data) {
        const assistantMsg: ChatMessage = {
          role: "assistant",
          content: res.data.reply,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Maaf, terjadi kendala saat menghubungi AI Assistant. Silakan coba kembali.",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AppLayout
      title="AI Smart Assistant"
      subtitle="Konsultasi cerdas untuk optimasi bisnis kost, analisis keuangan, dan rekomendasi berbasis AI."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in items-start">
        {/* Main Chat Interface */}
        <Card className="lg:col-span-2 rounded-3xl border-gray-100 dark:border-border shadow-sm flex flex-col h-175 overflow-hidden bg-white dark:bg-card">
          <div className="p-4 px-6 border-b border-gray-100 dark:border-border flex items-center justify-between bg-gray-50/50 dark:bg-muted/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-foreground text-sm">
                  RentMate Co-Pilot
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] text-gray-400 dark:text-muted-foreground font-medium">
                    Groq Llama 3 / GPT-OSS
                  </span>
                </div>
              </div>
            </div>
          </div>

          <AiChatWindow
            messages={messages}
            isSending={isSending}
            messagesEndRef={messagesEndRef}
          />

          <AiChatInput
            inputMessage={inputMessage}
            setInputMessage={setInputMessage}
            onSend={(e) => handleSendMessage(e)}
            isSending={isSending}
          />
        </Card>

        {/* AI Insights Sidebar */}
        <AiInsightsSidebar
          insights={insights}
          loadingInsights={loadingInsights}
          onRefresh={fetchInsights}
          onSelectPrompt={(text) => handleSendMessage(undefined, text)}
        />
      </div>
    </AppLayout>
  );
};
