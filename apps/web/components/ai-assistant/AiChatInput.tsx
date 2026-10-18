'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Mic, X, Trash2, Pause, Play } from 'lucide-react';
import { useTranslation } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

export interface PresetPrompt {
  icon: string;
  title: string;
  fullPrompt: string;
}

export const PRESET_PROMPTS: PresetPrompt[] = [
  {
    icon: '📊',
    title: 'Proyeksi Finansial',
    fullPrompt: 'Berapa proyeksi omset bulanan dan estimasi arus kas kost saya untuk bulan depan?',
  },
  {
    icon: '📈',
    title: 'Isi Kamar Kosong',
    fullPrompt: 'Bagaimana strategi dan promo terbaik untuk mengisi kamar kosong saat libur semester?',
  },
  {
    icon: '💬',
    title: 'Draf WA Tagihan',
    fullPrompt: 'Buatkan draf pesan WhatsApp pengingat tagihan sewa jatuh tempo yang sopan dan ramah.',
  },
  {
    icon: '🛠️',
    title: 'Evaluasi Kerusakan',
    fullPrompt: 'Kamar atau fasilitas mana yang paling sering komplain kerusakan dan butuh evaluasi perbaikan?',
  },
  {
    icon: '🏷️',
    title: 'Penyesuaian Tarif',
    fullPrompt: 'Berikan rekomendasi penyesuaian tarif sewa kamar berdasarkan kondisi pasar dan fasilitas.',
  },
];

interface AiChatInputProps {
  inputMessage: string;
  setInputMessage: (msg: string) => void;
  onSend: (customText?: string, audioData?: { url?: string; duration?: number; waveform?: number[] }) => void;
  isSending: boolean;
}

const BAR_COUNT = 42; // Full-width continuous audio waveform bars matching WhatsApp

export const AiChatInput: React.FC<AiChatInputProps> = ({
  inputMessage,
  setInputMessage,
  onSend,
  isSending,
}) => {
  const { t } = useTranslation();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Voice recording states
  const [isListening, setIsListening] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [waveformLevels, setWaveformLevels] = useState<number[]>(() =>
    Array(BAR_COUNT).fill(5)
  );

  // Voice recording refs
  const recognitionRef = useRef<any>(null);
  const timerIntervalRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordedWaveformRef = useRef<number[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const transcriptRef = useRef<string>('');
  const isPausedRef = useRef<boolean>(false);
  const recordingTimeRef = useRef<number>(0);

  // Keep recordingTimeRef in sync
  useEffect(() => {
    recordingTimeRef.current = recordingTime;
  }, [recordingTime]);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputMessage.trim() && !isSending) {
        onSend();
      }
    }
  };

  // Helper to format seconds as m:ss (e.g. 0:12)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Clean up all audio and recording resources
  const cleanupAudioAndRecording = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
      mediaRecorderRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      cleanupAudioAndRecording();
    };
  }, [cleanupAudioAndRecording]);

  // Start voice recording with live continuous waveform and MediaRecorder
  const startVoiceRecording = async () => {
    if (typeof window === 'undefined') return;

    try {
      cleanupAudioAndRecording();

      transcriptRef.current = '';
      audioChunksRef.current = [];
      recordedWaveformRef.current = [];
      isPausedRef.current = false;
      setIsPaused(false);
      setRecordingTime(0);
      setIsListening(true);

      // 1. Get User Media Audio Stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      // 2. Setup MediaRecorder to capture audio for playback
      try {
        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : MediaRecorder.isTypeSupported('audio/mp4')
          ? 'audio/mp4'
          : '';

        const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };
        recorder.start(100);
        mediaRecorderRef.current = recorder;
      } catch (recErr) {
        console.warn('MediaRecorder init error:', recErr);
      }

      // 3. Setup Web Speech Recognition (for AI intelligence)
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'id-ID';
        recognition.interimResults = true;
        recognition.continuous = true;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event: any) => {
          let full = '';
          for (let i = 0; i < event.results.length; ++i) {
            full += event.results[i][0].transcript;
          }
          transcriptRef.current = full;
        };

        recognition.onerror = (event: any) => {
          if (event.error !== 'no-speech' && event.error !== 'aborted') {
            console.warn('Speech recognition warning:', event.error);
          }
        };

        recognition.onend = () => {
          if (isListening && !isPausedRef.current && recognitionRef.current) {
            try {
              recognition.start();
            } catch {}
          }
        };

        recognition.start();
        recognitionRef.current = recognition;
      }

      // 4. Setup Stopwatch Timer
      timerIntervalRef.current = setInterval(() => {
        if (!isPausedRef.current) {
          setRecordingTime((prev) => prev + 1);
        }
      }, 1000);

      // 5. Setup Live Full-Width Waveform Analyser (WhatsApp style)
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const audioCtx = new AudioCtx();
        audioContextRef.current = audioCtx;
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 128;
        analyserRef.current = analyser;

        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const updateWaveform = () => {
          if (!isPausedRef.current && analyserRef.current) {
            analyserRef.current.getByteFrequencyData(dataArray);
            const step = Math.max(1, Math.floor(bufferLength / BAR_COUNT));
            const nextLevels: number[] = [];
            let sum = 0;

            for (let i = 0; i < BAR_COUNT; i++) {
              const val = dataArray[i * step] || 0;
              sum += val;
              // Scale 0-255 to 4px-24px height
              const barHeight = Math.max(4, Math.min(24, Math.round((val / 255) * 20) + 4));
              nextLevels.push(barHeight);
            }

            const avgVol = Math.round((sum / BAR_COUNT / 255) * 20) + 4;
            recordedWaveformRef.current.push(avgVol);

            setWaveformLevels(nextLevels);
          }
          animFrameRef.current = requestAnimationFrame(updateWaveform);
        };

        updateWaveform();
      } else {
        // Fallback rhythmic wave animation
        let phase = 0;
        const updateFallbackWave = () => {
          if (!isPausedRef.current) {
            phase += 0.15;
            const nextLevels = Array.from({ length: BAR_COUNT }, (_, i) => {
              return Math.round(Math.abs(Math.sin(phase + i * 0.25)) * 16) + 5;
            });
            recordedWaveformRef.current.push(nextLevels[10]);
            setWaveformLevels(nextLevels);
          }
          animFrameRef.current = requestAnimationFrame(updateFallbackWave);
        };
        updateFallbackWave();
      }

      toast.info('Mendengarkan suara... Silakan berbicara.');
    } catch {
      cleanupAudioAndRecording();
      setIsListening(false);
      toast.error('Gagal mengakses mikrofon.');
    }
  };

  // Toggle pause/resume recording
  const togglePauseRecording = () => {
    const nextState = !isPaused;
    setIsPaused(nextState);
    isPausedRef.current = nextState;

    if (nextState) {
      toast.info('Perekaman dijeda.');
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        try {
          mediaRecorderRef.current.pause();
        } catch {}
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    } else {
      toast.info('Melanjutkan perekaman...');
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
        try {
          mediaRecorderRef.current.resume();
        } catch {}
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch {}
      }
    }
  };

  // Cancel recording (Trash icon)
  const cancelVoiceRecording = () => {
    cleanupAudioAndRecording();
    setIsListening(false);
    setIsPaused(false);
    setRecordingTime(0);
    audioChunksRef.current = [];
    recordedWaveformRef.current = [];
    transcriptRef.current = '';
    toast.info('Rekaman suara dibatalkan.');
  };

  // Downsample waveform history to ~32 clean bars for chat bubble
  const getDownsampledWaveform = () => {
    const history = recordedWaveformRef.current;
    const targetCount = 32;
    if (history.length === 0) {
      return Array.from({ length: targetCount }, (_, i) => Math.round(Math.abs(Math.sin(i * 0.4)) * 14) + 6);
    }
    if (history.length <= targetCount) {
      return [...history];
    }
    const blockSize = Math.floor(history.length / targetCount);
    const result: number[] = [];
    for (let i = 0; i < targetCount; i++) {
      const slice = history.slice(i * blockSize, (i + 1) * blockSize);
      const avg = Math.round(slice.reduce((acc, v) => acc + v, 0) / slice.length);
      result.push(Math.max(4, Math.min(22, avg)));
    }
    return result;
  };

  // Finalize and send voice recording as audio message
  const sendVoiceRecording = () => {
    const speechText = transcriptRef.current.trim() || 'Pesan Suara';
    const duration = Math.max(1, recordingTimeRef.current);
    const finalWaveform = getDownsampledWaveform();

    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || 'audio/webm',
        });

        // Convert audioBlob to base64 Data URL so it is fully persistent in DB
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = reader.result as string;

          cleanupAudioAndRecording();
          setIsListening(false);
          setIsPaused(false);
          setRecordingTime(0);

          onSend(speechText, {
            url: base64Audio,
            duration,
            waveform: finalWaveform,
          });

          toast.success('Pesan suara terkirim!');
        };
      };

      try {
        recorder.stop();
      } catch {
        cleanupAudioAndRecording();
        setIsListening(false);
        onSend(speechText, {
          url: '',
          duration,
          waveform: finalWaveform,
        });
      }
    } else {
      cleanupAudioAndRecording();
      setIsListening(false);
      setIsPaused(false);
      setRecordingTime(0);

      onSend(speechText, {
        url: '',
        duration,
        waveform: finalWaveform,
      });
    }
  };

  return (
    <div className="p-3 sm:p-4 border-t border-slate-100 dark:border-border/60 bg-white/80 dark:bg-card/80 backdrop-blur-xs">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSend();
        }}
        className="flex flex-col gap-2"
      >
        {/* Quick Prompt Chips (Tepat di atas text box prompt, menyamping) */}
        {!isListening && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 scrollbar-none px-0.5 select-none">
            {PRESET_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setInputMessage(prompt.fullPrompt);
                  toast.info(`Prompt "${prompt.title}" dipilih.`);
                  if (textareaRef.current) {
                    textareaRef.current.focus();
                  }
                }}
                className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-slate-100/90 dark:bg-muted/40 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-300 border border-slate-200/80 dark:border-border/60 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer whitespace-nowrap shadow-2xs group"
                title={prompt.fullPrompt}
              >
                <span className="text-[11px]">{prompt.icon}</span>
                <span>{prompt.title}</span>
              </button>
            ))}
          </div>
        )}

        {/* VOICE RECORDING BAR (WhatsApp Style - Full-width audio waveform) */}
        {isListening ? (
          <div className="relative flex items-center justify-between bg-[#1f2c34] dark:bg-[#182229] border border-slate-700/80 rounded-2xl sm:rounded-full py-2 px-3 sm:px-4 shadow-lg min-h-[50px] select-none animate-in fade-in zoom-in-95 duration-200">
            {/* Left Section: Trash, Red Pulsing Dot, Timer */}
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={cancelVoiceRecording}
                className="text-slate-400 hover:text-rose-400 p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                title="Batalkan rekaman"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shrink-0 ml-0.5" />
              <span className="font-mono text-sm font-semibold text-white tracking-wide min-w-[32px]">
                {formatTime(recordingTime)}
              </span>
            </div>

            {/* Center Section: Full-width continuous audio waveform bars (WhatsApp Style) */}
            <div className="flex-1 mx-3 sm:mx-4 flex items-center justify-center gap-[2.5px] overflow-hidden h-7 select-none">
              {waveformLevels.map((lvl, idx) => (
                <span
                  key={`wave-${idx}`}
                  style={{ height: `${lvl}px` }}
                  className="w-[2.5px] rounded-full bg-slate-300 dark:bg-slate-200 shrink-0 transition-all duration-75"
                />
              ))}
            </div>

            {/* Right Section: Pause/Play Button & WhatsApp Green Send Button */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={togglePauseRecording}
                className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                title={isPaused ? 'Lanjutkan rekaman' : 'Jeda rekaman'}
              >
                {isPaused ? (
                  <Play className="w-5 h-5 fill-rose-400 text-rose-400 ml-0.5" />
                ) : (
                  <Pause className="w-5 h-5 fill-rose-400 text-rose-400" />
                )}
              </button>

              <button
                type="button"
                onClick={sendVoiceRecording}
                className="w-9.5 h-9.5 rounded-full bg-[#00a884] hover:bg-[#029676] active:scale-95 text-slate-950 flex items-center justify-center shadow-md cursor-pointer shrink-0 transition-transform"
                title="Kirim pesan suara"
              >
                <Send className="w-4 h-4 fill-slate-950 text-slate-950 translate-x-0.5" />
              </button>
            </div>
          </div>
        ) : (
          /* STANDARD TEXT INPUT BAR */
          <div className="relative flex items-end gap-2 bg-slate-50 dark:bg-muted/20 border border-slate-200 dark:border-border/80 rounded-2xl p-2 px-3 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all shadow-2xs">
            {/* Auto-expanding Textarea */}
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('ai.inputPlaceholder', {
                defaultValue: 'Tanyakan analisis keuangan, strategi harga sewa, dsb...',
              })}
              disabled={isSending}
              className="flex-1 bg-transparent border-none outline-hidden resize-none text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-muted-foreground max-h-32 py-1 leading-relaxed"
            />

            {/* Action buttons inside the right side of input */}
            <div className="flex items-center gap-1.5 shrink-0 pb-0.5">
              {/* Clear Text button */}
              {inputMessage && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setInputMessage('')}
                  className="h-8 w-8 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  title="Hapus teks"
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              )}

              {/* Voice Input Button */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={startVoiceRecording}
                className="h-8 w-8 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors"
                title="Input suara (Mic)"
              >
                <Mic className="w-4 h-4" />
              </Button>

              {/* Send Button */}
              <Button
                type="submit"
                disabled={!inputMessage.trim() || isSending}
                className="h-8.5 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs cursor-pointer gap-1.5 transition-all disabled:opacity-50"
              >
                <span>Kirim</span>
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}

        {/* Bottom Helper Note */}
        {!isListening && (
          <div className="flex items-center justify-end text-[11px] text-slate-400 px-1 select-none">
            <span className="hidden sm:inline">
              Tekan <kbd className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-[10px]">Enter ↵</kbd> untuk kirim, <kbd className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-[10px]">Shift + Enter</kbd> baris baru
            </span>
          </div>
        )}
      </form>
    </div>
  );
};
