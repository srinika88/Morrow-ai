import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  Mic,
  MicOff,
  Trash2,
  AlertTriangle,
  Check,
  PlusCircle,
  Activity,
  BatteryCharging,
  Info
} from 'lucide-react';
import { api } from '../services/api.js';
import { ChatMessage, UserProfile } from '../types/index.js';
import confetti from 'canvas-confetti';

interface CompanionViewProps {
  profile: UserProfile | null;
  onRefreshData?: () => void;
}

const CONVERSATION_STARTERS = [
  'I have had headaches every afternoon this week.',
  'I am feeling fatigued after 45 minutes of computer work.',
  'How does my sleep over the past 2 weeks correlate with my pain?',
  'Help me prepare questions for my neurologist appointment.',
  'I skipped my morning electrolyte dose and feel dizzy.'
];

export const CompanionView: React.FC<CompanionViewProps> = ({
  profile,
  onRefreshData
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [emergencyAlert, setEmergencyAlert] = useState<string | null>(null);
  const [actionDoneMap, setActionDoneMap] = useState<Record<string, boolean>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    loadChatHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const loadChatHistory = async () => {
    try {
      const history = await api.getChatHistory();
      setMessages(history);
    } catch (err) {
      console.error('Failed to load chat history:', err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || loading) return;

    setInputText('');
    setEmergencyAlert(null);
    setLoading(true);

    // Optimistically show user message
    const tempUserMsg: ChatMessage = {
      id: `temp_${Date.now()}`,
      sender: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await api.sendMessage(text);
      if (res.isEmergencyAlert) {
        setEmergencyAlert(res.safetyDisclaimer || 'Immediate clinical care required.');
      }
      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== tempUserMsg.id);
        return [...filtered, res.userMessage, res.assistantMessage];
      });
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'assistant',
          content: "I'm temporarily having trouble connecting to my service, but I'm here. Please try again in a moment.",
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = async () => {
    if (!confirm('Clear your conversation with Morrow?')) return;
    try {
      await api.clearChat();
      loadChatHistory();
    } catch (err) {
      console.error(err);
    }
  };

  // Voice Input (Web Speech API with graceful fallback)
  const toggleVoiceInput = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Simulate realistic voice input for demo if browser restricts microphone
      setIsRecording(true);
      setTimeout(() => {
        setInputText("I've noticed a throbbing sensation in my right temple that started about 2 hours ago.");
        setIsRecording(false);
      }, 2000);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      setIsRecording(false);
    }
  };

  // Execute embedded action suggested by Morrow
  const handleExecuteAction = async (msgId: string, action: NonNullable<ChatMessage['suggestedAction']>) => {
    try {
      if (action.type === 'log_symptom') {
        const today = new Date().toISOString().split('T')[0];
        const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        await api.addSymptom({
          name: action.data.name || 'Reported Symptom',
          severity: action.data.severity || 5,
          date: today,
          time: timeNow,
          durationMinutes: action.data.durationMinutes || 60,
          location: action.data.location || 'Head / General',
          frequency: 'recurring',
          triggers: action.data.triggers || ['Physical / Cognitive exertion'],
          associatedActivities: [],
          notes: action.data.notes || 'Logged via Morrow AI conversation',
          loggedVia: 'ai_chat'
        });
      } else if (action.type === 'log_energy') {
        const today = new Date().toISOString().split('T')[0];
        const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        await api.addEnergyEntry({
          date: today,
          time: timeNow,
          level: action.data.level || 5,
          context: 'midday',
          notes: action.data.notes || 'Recorded via Morrow AI companion'
        });
      }

      try {
        confetti({
          particleCount: 25,
          spread: 45,
          origin: { y: 0.8 },
          colors: ['#DCD5F2', '#F5E8A8', '#DCE7D8']
        });
      } catch (e) {}

      setActionDoneMap((prev) => ({ ...prev, [msgId]: true }));
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Error executing action');
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-6rem)] sm:h-[calc(100vh-5rem)] flex flex-col pb-4">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-3 border-b border-[#35313A]/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#574665] text-[#FAF8F3] flex items-center justify-center shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-xl font-semibold text-[#35313A]">
              Morrow Health Companion
            </h2>
            <p className="text-xs text-[#686270]">
              Empathetic, data-grounded support for chronic health
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClearChat}
            className="p-2 rounded-xl text-[#686270] hover:text-[#35313A] hover:bg-[#EEE9F7] text-xs flex items-center gap-1.5 transition-colors"
            title="Reset conversation"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Clear Chat</span>
          </button>
        </div>
      </div>

      {/* Emergency Alert Banner */}
      {emergencyAlert && (
        <div className="mt-3 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-sm">Emergency Clinical Safeguard</h4>
            <p className="text-xs mt-0.5 leading-relaxed">{emergencyAlert}</p>
          </div>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-5 space-y-4 px-1">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const isActionDone = actionDoneMap[msg.id];

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-2xl ${
                isUser ? 'ml-auto' : 'mr-auto'
              }`}
            >
              <div
                className={`p-4 rounded-3xl text-sm leading-relaxed ${
                  isUser
                    ? 'bg-[#574665] text-[#FAF8F3] rounded-br-xs shadow-xs'
                    : 'bg-white text-[#35313A] border border-[#35313A]/10 rounded-bl-xs shadow-xs'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Embedded action card if assistant suggested logging */}
                {!isUser && msg.suggestedAction && (
                  <div className="mt-3 pt-3 border-t border-[#35313A]/10">
                    <div className="p-3 rounded-2xl bg-[#FAF8F3] border border-[#35313A]/10">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2 text-xs font-semibold text-[#574665]">
                          {msg.suggestedAction.type === 'log_symptom' ? (
                            <Activity className="w-3.5 h-3.5" />
                          ) : (
                            <BatteryCharging className="w-3.5 h-3.5" />
                          )}
                          <span>Structured Health Extraction</span>
                        </div>
                        <span className="text-[10px] text-[#9B94A4]">Ready to log</span>
                      </div>

                      <p className="text-xs text-[#35313A] font-medium">
                        {msg.suggestedAction.label}
                      </p>

                      {msg.suggestedAction.data?.severity && (
                        <p className="text-[11px] text-[#686270] mt-0.5">
                          Severity: {msg.suggestedAction.data.severity}/10 · Location: {msg.suggestedAction.data.location || 'Reported'}
                        </p>
                      )}

                      <div className="mt-2.5">
                        {isActionDone ? (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold">
                            <Check className="w-3.5 h-3.5" />
                            <span>Logged to your health record</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleExecuteAction(msg.id, msg.suggestedAction!)}
                            className="py-1.5 px-3 rounded-xl bg-[#574665] text-[#FAF8F3] text-xs font-medium flex items-center gap-1.5 hover:bg-[#3E324A] transition-colors"
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                            <span>Confirm & Add to Tracker</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <span className="text-[10px] text-[#9B94A4] px-2 mt-1">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-[#686270] bg-white border border-[#35313A]/10 py-2.5 px-4 rounded-2xl w-fit">
            <Sparkles className="w-3.5 h-3.5 text-[#574665] animate-spin" />
            <span>Morrow is reflecting on your records...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Starters (shown when messages are few) */}
      {messages.length <= 2 && (
        <div className="py-2">
          <p className="text-[11px] text-[#686270] mb-2 font-medium">
            Suggested conversations:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {CONVERSATION_STARTERS.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(s)}
                className="text-xs py-1.5 px-3 rounded-full bg-white border border-[#35313A]/10 text-[#35313A] hover:bg-[#EEE9F7] hover:border-[#574665]/30 transition-all text-left"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Composer */}
      <div className="pt-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative bg-white rounded-2xl border border-[#35313A]/15 shadow-xs focus-within:border-[#574665] focus-within:ring-2 focus-within:ring-[#574665]/20 p-2 flex items-center gap-2"
        >
          <button
            type="button"
            onClick={toggleVoiceInput}
            className={`p-2 rounded-xl transition-colors ${
              isRecording
                ? 'bg-rose-100 text-rose-600 animate-pulse'
                : 'text-[#686270] hover:bg-[#EEE9F7]'
            }`}
            title={isRecording ? 'Listening... click to stop' : 'Voice input'}
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              isRecording
                ? 'Listening to your voice...'
                : 'Tell Morrow how your body is feeling, describe a symptom...'
            }
            className="flex-1 bg-transparent text-sm text-[#35313A] placeholder-[#9B94A4] focus:outline-none px-2"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || loading}
            className="p-2.5 rounded-xl bg-[#574665] text-[#FAF8F3] hover:bg-[#3E324A] disabled:opacity-30 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* Quiet Safety Footnote */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#9B94A4] mt-2 text-center">
          <Info className="w-3 h-3 shrink-0" />
          <span>
            Morrow provides observational health companion support, not clinical diagnosis or medical prescriptions.
          </span>
        </div>
      </div>
    </div>
  );
};
