'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, User, Copy, Check, Sparkles, Play, Pause, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useTranslation } from '@/contexts/LanguageContext';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  audio?: {
    url?: string;
    duration?: number;
    waveform?: number[];
  };
}

interface AiChatWindowProps {
  messages: ChatMessage[];
  isSending: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

// Voice Note Player Bubble (WhatsApp / Telegram style)
const VoiceMessageBubble: React.FC<{
  audio: { url?: string; duration?: number; waveform?: number[] };
  content?: string;
}> = ({ audio, content }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [showTranscript, setShowTranscript] = useState(false);
  const audioInstanceRef = useRef<HTMLAudioElement | null>(null);

  const duration = Math.max(1, audio.duration || 1);
  const waveform =
    audio.waveform && audio.waveform.length > 0
      ? audio.waveform
      : [6, 12, 18, 14, 8, 16, 22, 18, 10, 14, 20, 16, 8, 12, 18, 14, 10, 16, 22, 14, 8, 12, 16, 20, 14, 10, 18, 14, 8, 12];

  useEffect(() => {
    return () => {
      if (audioInstanceRef.current) {
        audioInstanceRef.current.pause();
        audioInstanceRef.current = null;
      }
    };
  }, []);

  const togglePlay = () => {
    if (!audio.url) {
      toast.info('Audio tidak tersedia untuk diputar.');
      return;
    }

    if (!audioInstanceRef.current) {
      const a = new Audio(audio.url);
      a.playbackRate = playbackRate;
      a.ontimeupdate = () => {
        setCurrentTime(a.currentTime);
      };
      a.onended = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };
      a.onerror = () => {
        setIsPlaying(false);
        toast.error('Gagal memutar audio.');
      };
      audioInstanceRef.current = a;
    }

    if (isPlaying) {
      audioInstanceRef.current.pause();
      setIsPlaying(false);
    } else {
      audioInstanceRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioInstanceRef.current && audio.url) {
      const a = new Audio(audio.url);
      a.playbackRate = playbackRate;
      a.ontimeupdate = () => setCurrentTime(a.currentTime);
      a.onended = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };
      audioInstanceRef.current = a;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = pct * duration;
    setCurrentTime(newTime);
    if (audioInstanceRef.current) {
      audioInstanceRef.current.currentTime = newTime;
    }
  };

  const cyclePlaybackRate = () => {
    const nextRate = playbackRate === 1 ? 1.5 : playbackRate === 1.5 ? 2 : 1;
    setPlaybackRate(nextRate);
    if (audioInstanceRef.current) {
      audioInstanceRef.current.playbackRate = nextRate;
    }
  };

  const progressPct = Math.min(1, currentTime / duration);

  const formatSecs = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-[260px] sm:w-[310px] flex flex-col gap-1.5 select-none">
      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={togglePlay}
          className="w-10 h-10 rounded-full bg-white text-primary700 hover:bg-slate-100 flex items-center justify-center shadow-md cursor-pointer shrink-0 transition-transform active:scale-95"
          title={isPlaying ? 'Jeda' : 'Putar pesan suara'}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 fill-rose-700" />
          ) : (
            <Play className="w-5 h-5 fill-rose-700 ml-0.5" />
          )}
        </button>

        {/* Waveform Scrubber & Duration */}
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          {/* Waveform track */}
          <div
            onClick={handleSeek}
            className="flex items-center gap-[2.5px] h-6 cursor-pointer py-1 group/wave overflow-hidden"
            title="Klik untuk geser durasi"
          >
            {waveform.map((val, idx) => {
              const barProgress = idx / waveform.length;
              const isPlayed = barProgress <= progressPct;
              return (
                <span
                  key={idx}
                  style={{ height: `${Math.max(4, Math.min(22, val))}px` }}
                  className={`w-[2.5px] rounded-full shrink-0 transition-colors duration-150 ${
                    isPlayed
                      ? 'bg-white shadow-xs'
                      : 'bg-white/40 group-hover/wave:bg-white/60'
                  }`}
                />
              );
            })}
          </div>

          {/* Time & Speed Controls */}
          <div className="flex items-center justify-between text-[11px] text-white/90 font-mono font-medium">
            <span>{formatSecs(isPlaying ? currentTime : duration)}</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={cyclePlaybackRate}
                className="px-1.5 py-0.5 rounded-full bg-white/20 hover:bg-white/30 text-[10px] font-bold text-white transition-colors cursor-pointer"
                title="Kecepatan putar"
              >
                {playbackRate}x
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Transcript toggle */}
      {content && (
        <div className="mt-1 pt-1.5 border-t border-white/20">
          <button
            type="button"
            onClick={() => setShowTranscript(!showTranscript)}
            className="text-[10px] text-white/80 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Mic className="w-3 h-3" />
            <span>{showTranscript ? 'Sembunyikan teks' : 'Lihat transkrip teks'}</span>
          </button>
          {showTranscript && (
            <p className="text-[11px] text-white/95 italic mt-1 leading-snug bg-black/20 p-2 rounded-lg">
              "{content}"
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// Formats text with markdown, headers, bullets, and highlighted Rupiah values
const FormattedAssistantMessage: React.FC<{ content: string }> = ({ content }) => {
  const lines = content.split('\n');

  const highlightRupiahAndBold = (text: string) => {
    // Regex for matching **bold** and Rp amounts
    const parts = text.split(/(\*\*.*?\*\*|Rp\s?[\d.,]+)/g);

    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const boldText = part.slice(2, -2);
        return (
          <strong key={i} className="font-bold text-slate-900 dark:text-white">
            {boldText}
          </strong>
        );
      }
      if (/^Rp\s?[\d.,]+/i.test(part)) {
        return (
          <span
            key={i}
            className="inline-flex items-center font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-800/40 text-xs mx-0.5"
          >
            {part}
          </span>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-xs">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <div className="space-y-2 text-xs sm:text-sm leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        // Headers
        if (trimmed.startsWith('### ')) {
          return (
            <h4
              key={idx}
              className="font-bold text-slate-900 dark:text-white text-sm sm:text-base mt-3 mb-1 text-primary600 dark:text-primary400 flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary500" />
              {highlightRupiahAndBold(trimmed.slice(4))}
            </h4>
          );
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h3
              key={idx}
              className="font-extrabold text-slate-900 dark:text-white text-base mt-3.5 mb-1.5"
            >
              {highlightRupiahAndBold(trimmed.slice(3))}
            </h3>
          );
        }
        if (trimmed.startsWith('# ')) {
          return (
            <h2
              key={idx}
              className="font-black text-slate-900 dark:text-white text-lg mt-4 mb-2"
            >
              {highlightRupiahAndBold(trimmed.slice(2))}
            </h2>
          );
        }

        // Bullet points
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary500 mt-2 shrink-0" />
              <div className="flex-1 text-slate-700 dark:text-slate-200">
                {highlightRupiahAndBold(trimmed.slice(2))}
              </div>
            </div>
          );
        }

        // Numbered list
        if (/^\d+\.\s/.test(trimmed)) {
          const numMatch = trimmed.match(/^(\d+\.)\s(.*)/);
          return (
            <div key={idx} className="flex items-start gap-2 pl-1">
              <span className="font-semibold text-primary600 dark:text-primary400 shrink-0 text-xs mt-0.5">
                {numMatch ? numMatch[1] : '•'}
              </span>
              <div className="flex-1 text-slate-700 dark:text-slate-200">
                {highlightRupiahAndBold(numMatch ? numMatch[2] : trimmed)}
              </div>
            </div>
          );
        }

        // Empty line spacer
        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }

        // Regular paragraph
        return (
          <p key={idx} className="text-slate-700 dark:text-slate-200">
            {highlightRupiahAndBold(trimmed)}
          </p>
        );
      })}
    </div>
  );
};

export const AiChatWindow: React.FC<AiChatWindowProps> = ({
  messages,
  isSending,
  messagesEndRef,
}) => {
  const { t } = useTranslation();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success('Pesan disalin ke clipboard');
    setTimeout(() => {
      setCopiedIndex(null);
    }, 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 scroll-smooth">
      {messages.map((msg, index) => {
        const isUser = msg.role === 'user';

        return (
          <div
            key={index}
            className={`flex gap-3 max-w-[90%] sm:max-w-[85%] group ${
              isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-2xs ${
                isUser
                  ? 'bg-gradient-to-tr from-primary600 to-crimson700 text-white'
                  : 'bg-gradient-to-tr from-primaryred to-crimson text-white shadow-xs'
              }`}
            >
              {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Message Bubble Container */}
            <div className="flex flex-col min-w-0 max-w-full">
              <div
                className={`relative rounded-2xl p-3.5 sm:p-4 shadow-2xs transition-all ${
                  isUser
                    ? 'bg-primary600 text-white rounded-tr-xs'
                    : 'bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-border/60 text-slate-800 dark:text-slate-100 rounded-tl-xs hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Content: Voice message player bubble or text formatted message */}
                {isUser ? (
                  msg.audio ? (
                    <VoiceMessageBubble audio={msg.audio} content={msg.content} />
                  ) : (
                    <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </div>
                  )
                ) : (
                  <FormattedAssistantMessage content={msg.content} />
                )}

                {/* Quick Copy Button for Assistant */}
                {!isUser && (
                  <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopy(msg.content, index)}
                      className="h-7 w-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800"
                      title="Salin jawaban"
                    >
                      {copiedIndex === index ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {/* Timestamp */}
              <div
                className={`flex items-center gap-1 mt-1 text-[10px] text-slate-400 dark:text-muted-foreground ${
                  isUser ? 'justify-end pr-1' : 'justify-start pl-1'
                }`}
              >
                <span>{msg.timestamp}</span>
              </div>
            </div>
          </div>
        );
      })}

      {/* Typing Indicator with 3 Bouncing Dots */}
      {isSending && (
        <div className="flex gap-3 max-w-md mr-auto animate-fade-in">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primaryred to-crimson text-white flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-border/60 rounded-2xl rounded-tl-xs p-3.5 px-4 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 shadow-2xs">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-primary600 dark:bg-primary400 animate-bounce [animation-delay:-0.3s]" />
              <span className="w-2 h-2 rounded-full bg-primary600 dark:bg-primary400 animate-bounce [animation-delay:-0.15s]" />
              <span className="w-2 h-2 rounded-full bg-primary600 dark:bg-primary400 animate-bounce" />
            </div>
            <span className="text-[11px] font-medium ml-1">
              {t('ai.thinkingIndicator', { defaultValue: 'Sedang menganalisis data properti...' })}
            </span>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};
