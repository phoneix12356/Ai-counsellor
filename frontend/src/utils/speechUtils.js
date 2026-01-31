import api from "../Config/api";

let recognition = null;
let isSpeaking = false;
let autoRestart = false;

/**
 * Communicates with the backend to get AI responses
 */
export const getAIResponseFromBackend = async (message) => {
  try {
    const { data } = await api.post("/counsellor/chat", { message });
    return data.success ? data.response : "I couldn't get a response right now.";
  } catch (error) {
    console.error("AI Communication Error:", error);
    return "I'm having trouble connecting to my counsellor services.";
  }
};

export default function startListening(onResult) {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Speech Recognition not supported in this browser.");
    return;
  }

  autoRestart = true;

  if (recognition) {
    recognition.abort();
  }

  recognition = new SpeechRecognition();
  recognition.lang = "en-IN";
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = (event) => {
    if (isSpeaking) return;
    const result = event.results[event.results.length - 1];
    if (result.isFinal) {
      const text = result[0].transcript.trim();
      if (text) {
        onResult(text);
      }
    }
  };

  recognition.onend = () => {
    if (autoRestart && !isSpeaking) {
      try {
        recognition.start();
      } catch (e) {
        console.warn("Recognition restart failed:", e);
      }
    }
  };

  recognition.onerror = (event) => {
    console.error("Speech Recognition Error:", event.error);
    if (event.error === 'not-allowed') {
      autoRestart = false;
      alert("Microphone access denied.");
    }
  };

  recognition.start();

  return () => {
    autoRestart = false;
    if (recognition) recognition.stop();
  };
}

export const stopListening = () => {
  autoRestart = false;
  if (recognition) {
    recognition.stop();
    recognition = null;
  }
}

export const TextToSpeech = (text) => {
  if (!text) return;

  window.speechSynthesis.cancel();
  isSpeaking = true;
  if (recognition) recognition.stop();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-IN";
  utterance.rate = 1.1;
  utterance.pitch = 1;

  utterance.onend = () => {
    isSpeaking = false;
    if (autoRestart) {
      setTimeout(() => {
        if (!isSpeaking) recognition?.start();
      }, 300);
    }
  };

  utterance.onerror = () => {
    isSpeaking = false;
  };

  window.speechSynthesis.speak(utterance);
}

