import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Compass,
  Send,
  ArrowLeft,
  User,
  Bot,
  GraduationCap,
  Target,
  Shield,
  RefreshCw,
  Mic,
  Volume2,
  X,
  Menu,
  MapPin,
  Sparkles,
  BarChart,
  DollarSign,
  Users,
  Globe
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../Config/api";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { clsx } from "clsx";

/* -------------------- Helper: SpeechRecognition Config -------------------- */
const getSpeechRecognitionConfig = () => {
  const browser = {
    isChrome: /chrome|chromium|crios/i.test(navigator.userAgent),
    isFirefox: /firefox|fxios/i.test(navigator.userAgent),
    isSafari:
      /safari/i.test(navigator.userAgent) &&
      !/chrome|chromium|crios/i.test(navigator.userAgent),
    isEdge: /edg/i.test(navigator.userAgent),
  };

  return {
    continuous: true,
    interimResults: true,
    lang: navigator.language || "en-US",
    maxAlternatives: 1,
  };
};

/* ------------------------------ UniversityCard ------------------------------ */
const UniversityCard = ({ uni, type }) => {
  const navigate = useNavigate();

  const colors = {
    dream: {
      bg: "from-purple-900/20 to-pink-900/20",
      border: "border-purple-800/50",
      badge: "from-purple-600 to-pink-600",
      text: "text-purple-300",
      icon: "text-purple-400"
    },
    target: {
      bg: "from-blue-900/20 to-cyan-900/20",
      border: "border-blue-800/50",
      badge: "from-blue-600 to-cyan-600",
      text: "text-blue-300",
      icon: "text-blue-400"
    },
    safe: {
      bg: "from-green-900/20 to-emerald-900/20",
      border: "border-green-800/50",
      badge: "from-green-600 to-emerald-600",
      text: "text-green-300",
      icon: "text-green-400"
    }
  };

  const typeConfig = colors[type];

  const handleCardClick = () => {
    if (uni.id) {
      navigate(`/universities/${uni.id}`);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={clsx(
        "group rounded-2xl border backdrop-blur-sm transition-all hover:scale-[1.02] cursor-pointer overflow-hidden",
        typeConfig.border,
        typeConfig.bg,
        "hover:shadow-xl hover:shadow-purple-500/10"
      )}
    >
      <div className="h-40 w-full relative overflow-hidden">
        {uni.imageUrl ? (
          <img
            src={uni.imageUrl}
            alt={uni.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = "none";
              if (e.target.nextSibling) e.target.nextSibling.style.display = "flex";
            }}
          />
        ) : null}

        <div
          className={clsx(
            "absolute inset-0 bg-gradient-to-br flex items-center justify-center",
            typeConfig.bg,
            uni.imageUrl ? 'hidden' : 'flex'
          )}
        >
          <GraduationCap className="w-12 h-12 text-white/20" />
        </div>

        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4">
          <div className={clsx(
            "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r",
            typeConfig.badge
          )}>
            {type === "dream" && <Sparkles className="w-3 h-3" />}
            {type === "target" && <Target className="w-3 h-3" />}
            {type === "safe" && <Shield className="w-3 h-3" />}
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4">
          <div className="flex justify-between items-end">
            <div>
              <h4 className="font-bold text-white text-sm leading-tight mb-1">{uni.name}</h4>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <MapPin className="w-3 h-3" />
                {uni.country || "International"}
              </div>
            </div>
            {uni.matchScore && (
              <div className="text-xl font-bold bg-gradient-to-r bg-clip-text text-transparent" style={{
                backgroundImage: `linear-gradient(to right, ${typeConfig.badge.replace("from-", "").replace("to-", "").replace(" to ", ", ")})`
              }}>
                {uni.matchScore}%
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-4">
        {uni.reason ? (
          <p className={clsx("text-sm leading-relaxed", typeConfig.text)}>
            {uni.reason}
          </p>
        ) : (
          <div className="space-y-3">
            {uni.fees && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-400 text-xs">
                  <DollarSign className="w-3 h-3" />
                  <span>Annual Tuition</span>
                </div>
                <div className="text-xs font-bold text-white">
                  ${uni.fees.toLocaleString()}
                </div>
              </div>
            )}

            {uni.ranking && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-400 text-xs">
                  <BarChart className="w-3 h-3" />
                  <span>World Rank</span>
                </div>
                <div className="text-xs font-bold text-white">
                  #{uni.ranking}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/* ------------------------------- TTS Controls ------------------------------- */
const TTSControls = ({
  isSpeaking,
  stopAllSpeech,
}) => {
  const [isStopping, setIsStopping] = useState(false);

  const handleStop = () => {
    if (isStopping) return;
    setIsStopping(true);
    stopAllSpeech();
    setTimeout(() => setIsStopping(false), 300);
  };

  return (
    <div className="flex items-center gap-3 text-xs">
      {isSpeaking && (
        <button
          type="button"
          onClick={handleStop}
          disabled={isStopping}
          className="px-3 py-2 bg-red-900/50 text-red-400 hover:bg-red-900/70 rounded-xl transition-all text-xs font-medium flex items-center gap-2 border border-red-800/50"
          title="Stop AI Speaker"
        >
          <X className="w-3 h-3" />
          <span>{isStopping ? "Stopping..." : "Stop"}</span>
        </button>
      )}
    </div>
  );
};

/* ============================== MAIN COMPONENT ============================== */
const AICounsellor = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [universities, setUniversities] = useState(null);
  const [loadingUniversities, setLoadingUniversities] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const messagesEndRef = useRef(null);

  // STT
  const [isRecording, setIsRecording] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const recognitionRef = useRef(null);
  const preSpeechInputRef = useRef("");
  const lastFinalRef = useRef("");

  // Recording timer
  const [elapsedMs, setElapsedMs] = useState(0);
  const recordingStartRef = useRef(null);
  const recordingIntervalRef = useRef(null);

  // TTS
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState(0);
  const [continuousListening, setContinuousListening] = useState(false);

  const currentUtteranceRef = useRef(null);
  const isTTSProcessingRef = useRef(false);
  const lastSpokenMessageIdRef = useRef(null);
  const ttsAbortControllerRef = useRef(null);

  const manualStopRef = useRef(false);

  useEffect(() => {
    if (user && !user.onboardingComplete) {
      navigate("/onboarding");
    }
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, user, navigate]);

  useEffect(() => {
    loadChatHistory();
    loadUniversities();
  }, []);

  /* -------------------------- Setup voices & STT -------------------------- */
  useEffect(() => {
    const loadVoices = () => {
      const available = window.speechSynthesis?.getVoices() ?? [];
      setVoices(available);
      if (available.length > 0 && selectedVoiceIndex >= available.length) {
        setSelectedVoiceIndex(0);
      }
    };

    if (window.speechSynthesis) {
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition || null;
    if (SpeechRecognition) {
      const config = getSpeechRecognitionConfig();
      const recog = new SpeechRecognition();

      recog.continuous = config.continuous;
      recog.interimResults = config.interimResults;
      recog.lang = config.lang;
      recog.maxAlternatives = config.maxAlternatives;

      recog.onresult = (event) => {
        let interim = "";
        let final = "";
        let isFinalInThisEvent = false;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const res = event.results[i];
          if (res.isFinal) {
            final = res[0].transcript;
            isFinalInThisEvent = true;
          } else {
            interim = res[0].transcript;
          }
        }

        if (interim) {
          setLiveTranscript(interim);
          setInput((prev) => {
            const base = preSpeechInputRef.current ?? "";
            return base ? `${base} ${interim}` : interim;
          });
        } else if (!isFinalInThisEvent) {
          setLiveTranscript("");
        }

        if (final && final !== lastFinalRef.current) {
          lastFinalRef.current = final;
          setLiveTranscript("");

          const currentBase = preSpeechInputRef.current ?? "";
          const combined = currentBase ? `${currentBase} ${final.trim()}` : final.trim();

          setInput(combined);
          preSpeechInputRef.current = combined;

          // Auto-restart recognition when continuous
          if (continuousListening && isRecording) {
            try {
              setTimeout(() => {
                if (isRecording && recognitionRef.current && !manualStopRef.current) {
                  try {
                    recognitionRef.current.stop();
                    setTimeout(() => {
                      if (isRecording && !manualStopRef.current) {
                        recognitionRef.current.start();
                      }
                    }, 300);
                  } catch (e) {
                    console.warn("Auto-restart failed:", e);
                  }
                }
              }, 800);
            } catch (e) {
              console.warn("Could not auto-restart:", e);
            }
          }
        }
      };

      recog.onerror = (err) => {
        console.warn("Speech recognition error:", err.error, err.message);

        const criticalErrors = ['no-speech', 'audio-capture', 'not-allowed'];
        if (criticalErrors.includes(err.error)) {
          setIsRecording(false);
          stopRecordingTimer();
          manualStopRef.current = false;

          if (err.error === 'no-speech') {
            setLiveTranscript("No speech detected. Please speak louder.");
            setTimeout(() => setLiveTranscript(""), 2000);
          } else if (err.error === 'not-allowed') {
            setLiveTranscript("Microphone access denied. Please allow microphone permission.");
            setTimeout(() => setLiveTranscript(""), 3000);
          }
        } else if (err.error === 'network') {
          console.log("Network error, pausing recognition");
          if (recognitionRef.current && !manualStopRef.current) {
            try {
              recognitionRef.current.stop();
              setTimeout(() => {
                if (isRecording && !manualStopRef.current) {
                  recognitionRef.current.start();
                }
              }, 1000);
            } catch (e) {
              console.warn("Failed to restart after network error:", e);
            }
          }
        } else {
          if (isRecording && !manualStopRef.current) {
            setTimeout(() => {
              if (recognitionRef.current && !manualStopRef.current) {
                try {
                  recognitionRef.current.start();
                } catch (e) {
                  console.warn("Failed to restart after error:", e);
                }
              }
            }, 500);
          }
        }
      };

      recog.onend = () => {
        if (continuousListening && isRecording && !manualStopRef.current) {
          setTimeout(() => {
            if (isRecording && recognitionRef.current && !manualStopRef.current) {
              try {
                recognitionRef.current.start();
              } catch (e) {
                console.warn("Failed to auto-restart:", e);
                try {
                  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
                  const fresh = new SpeechRec();
                  Object.assign(fresh, {
                    continuous: true,
                    interimResults: true,
                    lang: navigator.language || "en-US",
                    onresult: recog.onresult,
                    onerror: recog.onerror,
                    onend: recog.onend
                  });
                  recognitionRef.current = fresh;
                  fresh.start();
                } catch (e2) {
                  console.error("Completely failed to restart:", e2);
                  setIsRecording(false);
                  stopRecordingTimer();
                  manualStopRef.current = false;
                }
              }
            }
          }, 300);
        } else if (!continuousListening) {
          setIsRecording(false);
          stopRecordingTimer();
        }
      };

      recognitionRef.current = recog;
    } else {
      recognitionRef.current = null;
      console.warn("Speech recognition not supported in this browser");
    }

    return () => {
      try {
        if (recognitionRef.current) {
          recognitionRef.current.onresult = null;
          recognitionRef.current.onend = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.abort?.();
        }
      } catch (e) { }
      stopAllSpeech();
      stopRecordingTimer();
      preSpeechInputRef.current = "";
      lastFinalRef.current = "";
      manualStopRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [continuousListening]);

  useEffect(() => {
    if (recognitionRef.current && isRecording) {
      try {
        recognitionRef.current.stop();
        setTimeout(() => {
          if (isRecording) recognitionRef.current.start();
        }, 100);
      } catch (e) {
        console.warn("Failed to update recognition settings:", e);
      }
    }
  }, [continuousListening, isRecording]);

  /* ---------------------- Chat history & load functions ---------------------- */
  const loadChatHistory = async () => {
    try {
      const response = await api.get("/counsellor/history");
      if (response.data.success && response.data.history.length > 0) {
        const formattedHistory = [];
        response.data.history.forEach((item) => {
          formattedHistory.push({ role: "user", content: item.message });
          formattedHistory.push({ role: "assistant", content: item.response });
        });
        setMessages(formattedHistory);
      } else {
        setMessages([
          {
            role: "assistant",
            content: `Hello **${user?.name?.split(" ")[0] || "there"}**! 👋 I'm your AI Study Abroad Counsellor. I'm here to help you navigate your international education journey.\n\n## 🎯 What I can help you with:\n- **Analyzing your profile strengths and gaps**\n- **Recommending universities (Dream, Target, Safe)**\n- **Preparing for exams (IELTS, GRE, etc.)**\n- **SOP and application guidance**\n- **Scholarship and funding advice**\n\n## 💡 How to use me:\n- Ask me specific questions about your profile\n- Request university recommendations\n- Get help with application documents\n- Use voice input for hands-free chatting\n\nWhat would you like to explore today?`,
          },
        ]);
      }
    } catch (error) {
      console.error("Failed to load chat history:", error);
      setMessages([
        {
          role: "assistant",
          content: `Hello! I'm your AI Counsellor. How can I help you today?`,
        },
      ]);
    }
  };

  /* --------------------------- Recording Timer --------------------------- */
  const startRecordingTimer = () => {
    recordingStartRef.current = Date.now();
    setElapsedMs(0);
    recordingIntervalRef.current = setInterval(() => {
      setElapsedMs(Date.now() - recordingStartRef.current);
    }, 250);
  };

  const stopRecordingTimer = () => {
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
    recordingStartRef.current = null;
  };

  const formatElapsed = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  /* -------------------------- Toggle Recording -------------------------- */
  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Try Chrome, Edge, or Safari.");
      return;
    }

    if (isRecording) {
      manualStopRef.current = true;
      setIsRecording(false);
      stopRecordingTimer();
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.warn("Error stopping recognition:", e);
      }
      setLiveTranscript("");
      setTimeout(() => {
        lastFinalRef.current = "";
        manualStopRef.current = false;
      }, 300);
    } else {
      manualStopRef.current = false;
      lastFinalRef.current = "";
      const currentInput = (input || "").trim();
      preSpeechInputRef.current = currentInput;
      if (currentInput) setInput(currentInput + " ");
      setLiveTranscript("");
      try {
        try {
          recognitionRef.current.abort();
        } catch (e) { }
        setTimeout(() => {
          recognitionRef.current.start();
          setIsRecording(true);
          startRecordingTimer();
        }, 100);
      } catch (e) {
        console.warn("Could not start recognition:", e);
        setIsRecording(false);
        setTimeout(() => {
          if (window.SpeechRecognition || window.webkitSpeechRecognition) {
            try {
              const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
              const freshRec = new SpeechRec();
              const config = getSpeechRecognitionConfig();
              Object.assign(freshRec, {
                continuous: config.continuous,
                interimResults: config.interimResults,
                lang: config.lang,
                maxAlternatives: config.maxAlternatives,
                onresult: recognitionRef.current?.onresult,
                onerror: recognitionRef.current?.onerror,
                onend: recognitionRef.current?.onend
              });
              recognitionRef.current = freshRec;
              freshRec.start();
              setIsRecording(true);
              startRecordingTimer();
            } catch (e2) {
              console.warn("Second attempt failed:", e2);
              alert("Could not initialize speech recognition. Please refresh the page and try again.");
            }
          }
        }, 300);
      }
    }
  };

  /* --------------------------- TTS Helpers --------------------------- */
  const stopAllSpeech = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    setIsSpeaking(false);
    currentUtteranceRef.current = null;
    isTTSProcessingRef.current = false;
    lastSpokenMessageIdRef.current = null;

    if (ttsAbortControllerRef.current) {
      clearTimeout(ttsAbortControllerRef.current);
      ttsAbortControllerRef.current = null;
    }
  };

  const cleanTextForTTS = (text) => {
    if (!text) return "";
    return text
      .replace(/```[\s\S]*?```/g, "")
      .replace(/`[^`]*`/g, "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/#{1,6}\s?/g, "")
      .replace(/!\[.*?\]\(.*?\)/g, "")
      .replace(/<[^>]*>/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/\s+/g, " ")
      .trim();
  };

  const speakText = (text, messageId = null) => {
    if (!autoSpeak || !window.speechSynthesis || !text.trim()) return;

    stopAllSpeech();

    const cleanedText = cleanTextForTTS(text);
    if (!cleanedText) return;

    const utter = new SpeechSynthesisUtterance(cleanedText);

    const v = window.speechSynthesis.getVoices();
    if (v && v.length > 0) {
      utter.voice = v[selectedVoiceIndex] || v[0];
    }

    utter.rate = 1;
    utter.pitch = 1;

    // Set refs before speaking
    currentUtteranceRef.current = utter;
    if (messageId !== null) lastSpokenMessageIdRef.current = messageId;

    utter.onstart = () => {
      setIsSpeaking(true);
    };

    utter.onend = () => {
      setIsSpeaking(false);
      currentUtteranceRef.current = null;
      lastSpokenMessageIdRef.current = null;
    };

    utter.onerror = (e) => {
      console.warn("TTS error:", e);
      setIsSpeaking(false);
      currentUtteranceRef.current = null;
      lastSpokenMessageIdRef.current = null;
    };

    setTimeout(() => {
      try {
        window.speechSynthesis.speak(utter);
      } catch (e) {
        console.warn("speak() failed:", e);
        setIsSpeaking(false);
        currentUtteranceRef.current = null;
      }
    }, 50);
  };

  /* --------------------------- Sending Messages --------------------------- */
  const sendMessage = async (e) => {
    e?.preventDefault?.();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setLiveTranscript("");
    preSpeechInputRef.current = "";
    lastFinalRef.current = "";
    manualStopRef.current = true;

    stopAllSpeech();

    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const response = await fetch(`${api.defaults.baseURL}/counsellor/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        throw new Error("Failed to connect to counsellor");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        assistantResponse += chunk;

        setMessages((prev) => {
          const newMessages = [...prev];
          if (newMessages.length > 0 && newMessages[newMessages.length - 1].role === "assistant") {
            newMessages[newMessages.length - 1] = {
              ...newMessages[newMessages.length - 1],
              content: assistantResponse,
            };
          }
          return newMessages;
        });

        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }

      // Use a stable unique id for the spoken chunk
      if (autoSpeak && assistantResponse.trim()) {
        const messageId = `message-${Date.now()}`;
        speakText(assistantResponse, messageId);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => {
        if (prev.length > 0 && prev[prev.length - 1].role === "assistant" && !prev[prev.length - 1].content) {
          return prev.slice(0, -1);
        }
        return prev;
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I apologize, but I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
      manualStopRef.current = false;
    }
  };

  /* ------------------------ Speak specific message ------------------------ */
  const speakMessage = (messageContent, index) => {
    if (!autoSpeak || !messageContent.trim()) return;
    const messageId = `message-${Date.now()}-${index}`;
    speakText(messageContent, messageId);
  };

  /* ------------------------- Load universities ------------------------- */
  const loadUniversities = async () => {
    setLoadingUniversities(true);
    try {
      const response = await api.get("/counsellor/universities");
      if (response.data.success && response.data.recommendations) {
        setUniversities(response.data.recommendations);
      }
    } catch (error) {
      console.error("Failed to load universities:", error);
    } finally {
      setLoadingUniversities(false);
    }
  };

  /* ----------------------------- Render UI ----------------------------- */
  return (
    <div className="min-h-screen bg-black text-white flex overflow-hidden relative">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-black to-blue-900/10 -z-10" />

      <AnimatePresence>
        {showMobileSidebar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowMobileSidebar(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside className={clsx(
        "w-80 bg-black/80 backdrop-blur-xl border-r border-gray-800 flex flex-col fixed h-full z-[60] transition-transform duration-300 ease-in-out",
        showMobileSidebar ? 'translate-x-0 shadow-2xl shadow-purple-500/10' : '-translate-x-full',
        "lg:translate-x-0"
      )}>
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </button>
          <button
            onClick={() => setShowMobileSidebar(false)}
            className="p-2 -mr-2 text-gray-500 hover:text-white lg:hidden hover:bg-gray-800/50 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              AI Recommendations
            </h3>
            <button
              onClick={loadUniversities}
              disabled={loadingUniversities}
              className={clsx(
                "p-2 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 transition-all border border-gray-700",
                loadingUniversities && "opacity-50 cursor-not-allowed"
              )}
            >
              <RefreshCw className={clsx("w-4 h-4 text-purple-400", loadingUniversities && "animate-spin")} />
            </button>
          </div>

          {!universities && !loadingUniversities && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-purple-800/50">
                <GraduationCap className="w-10 h-10 text-purple-400" />
              </div>
              <p className="text-sm text-gray-400 mb-6">Get AI-powered university recommendations based on your profile</p>
              <button
                onClick={loadUniversities}
                className="px-5 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl text-sm font-bold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg shadow-purple-500/20"
              >
                Generate Matches
              </button>
            </div>
          )}

          {loadingUniversities && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-sm text-gray-400">Analyzing your profile...</p>
            </div>
          )}

          {universities && (
            <div className="space-y-8">
              {universities.dream?.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-purple-600 to-pink-600">
                      🎯 Dream Universities
                    </div>
                  </div>
                  <div className="space-y-4">
                    {universities.dream.map((uni, idx) => (
                      <UniversityCard key={idx} uni={uni} type="dream" />
                    ))}
                  </div>
                </div>
              )}

              {universities.target?.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-blue-600 to-cyan-600">
                      🎯 Target Universities
                    </div>
                  </div>
                  <div className="space-y-4">
                    {universities.target.map((uni, idx) => (
                      <UniversityCard key={idx} uni={uni} type="target" />
                    ))}
                  </div>
                </div>
              )}

              {universities.safe?.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-green-600 to-emerald-600">
                      ✅ Safe Universities
                    </div>
                  </div>
                  <div className="space-y-4">
                    {universities.safe.map((uni, idx) => (
                      <UniversityCard key={idx} uni={uni} type="safe" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>

      <main className="flex-1 w-full min-h-screen flex flex-col relative transition-all duration-300 lg:ml-80">
        <header className="h-16 bg-black/80 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-30 px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowMobileSidebar(true)}
              className="p-2 -ml-2 rounded-xl hover:bg-gray-800/50 lg:hidden text-gray-400"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-2 rounded-xl">
                <Compass className="text-white w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bold text-xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  AI Counsellor
                </h1>
                <p className="text-xs text-gray-400">Your personal study abroad guide</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse" />
                <span className="text-xs font-bold text-purple-400">Online</span>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <TTSControls
                isSpeaking={isSpeaking}
                stopAllSpeech={stopAllSpeech}
              />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!recognitionRef.current && (
            <div className="text-xs text-amber-400 bg-amber-900/20 p-4 rounded-xl mb-4 mx-4 border border-amber-800/50">
              ⚠️ Speech recognition is not available in this browser.
              Try Chrome, Edge, or Safari for voice input.
            </div>
          )}

          <div className="max-w-4xl mx-auto space-y-6">
            <AnimatePresence>
              {messages.map((message, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={clsx(
                    "flex gap-4",
                    message.role === "user" ? "flex-row-reverse" : ""
                  )}
                >
                  <div className={clsx(
                    "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                    message.role === "user"
                      ? "bg-gradient-to-br from-purple-600 to-pink-600"
                      : "bg-gradient-to-br from-blue-600 to-cyan-600"
                  )}>
                    {message.role === "user" ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
                  </div>
                  <div className={clsx(
                    "max-w-[70%] p-5 rounded-2xl backdrop-blur-sm",
                    message.role === "user"
                      ? "bg-gradient-to-r from-purple-900/50 to-pink-900/30 border border-purple-800/50 rounded-tr-sm"
                      : "bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border border-blue-800/50 rounded-tl-sm"
                  )}>
                    <div className="prose prose-invert max-w-none text-gray-200">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content}
                      </ReactMarkdown>
                    </div>

                    {message.role === "assistant" && message.content && (
                      <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between">
                        <button
                          onClick={() => speakMessage(message.content, idx)}
                          className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
                          title="Speak this message"
                        >
                          <Volume2 className="w-4 h-4" />
                          <span>Speak Message</span>
                        </button>

                        {isSpeaking && lastSpokenMessageIdRef.current === `message-${idx}` && (
                          <div className="flex items-center gap-2 text-sm text-emerald-400">
                            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                            <span>Speaking...</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border border-blue-800/50 rounded-2xl rounded-tl-sm p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <div className="space-y-2">
                      <div className="text-sm text-blue-400 font-medium">Analyzing your query...</div>
                      <div className="text-xs text-gray-400">I'm thinking about the best advice for you</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="p-6 bg-black/80 backdrop-blur-xl border-t border-gray-800">
          <form onSubmit={sendMessage} className="max-w-4xl mx-auto">
            <div className="flex gap-4 items-center">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    if (!isRecording) preSpeechInputRef.current = e.target.value;
                  }}
                  placeholder="Ask me anything about your study abroad journey..."
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-2xl py-4 px-5 pr-32 text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all backdrop-blur-sm"
                  disabled={isLoading}
                />

                <div className="absolute right-16 top-1/2 -translate-y-1/2 flex items-center gap-3">
                  {isRecording ? (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <div className="text-xs text-rose-400 font-semibold">{formatElapsed(elapsedMs)}</div>
                    </div>
                  ) : null}
                  <button
                    type="button"
                    onClick={toggleRecording}
                    title={isRecording ? "Stop recording" : "Start voice input"}
                    className={clsx(
                      "p-2.5 rounded-xl transition-all border backdrop-blur-sm",
                      isRecording
                        ? "bg-red-900/50 text-red-400 hover:bg-red-900/70 border-red-800/50"
                        : "bg-blue-900/50 text-blue-400 hover:bg-blue-900/70 border-blue-800/50"
                    )}
                  >
                    {isRecording ? <X className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg shadow-purple-500/20"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

            {liveTranscript && (
              <div className="mt-4 p-3 bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl border border-purple-800/30">
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                  <Mic className="w-3 h-3" />
                  <span>Listening...</span>
                </div>
                <div className="text-sm text-white">{liveTranscript}</div>
              </div>
            )}
          </form>
        </div>
      </main>
    </div>
  );
};

export default AICounsellor;