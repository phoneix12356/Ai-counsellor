import { useRef, useState } from 'react';
import startListening, { stopListening, TextToSpeech, getAIResponseFromBackend } from "../utils/speechUtils";

const SpeechListener = () => {
  const stopListeningRef = useRef(null);
  const [aiResponse, setAiResponse] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStartListening = () => {
    // Start listening and store the returned stop function
    const stopFunction = startListening(async (text) => {
      console.log("🎤 User said:", text);

      setIsProcessing(true);
      const response = await getAIResponseFromBackend(text);
      setIsProcessing(false);

      setAiResponse(response);
      TextToSpeech(response);
    });
    stopListeningRef.current = stopFunction;
  };

  const handleStopListening = () => {
    // If we have a stop function, call it
    if (stopListeningRef.current) {
      stopListeningRef.current();
      stopListening();
      stopListeningRef.current = null;
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <p className="text-2xl font-black mb-6 text-slate-800 tracking-tight">AI Voice Assistant</p>

      <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-2xl shadow-slate-100 mb-8">
        <div className="flex items-center gap-4 mb-8">
          <div className={`w-3 h-3 rounded-full ${stopListeningRef.current ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`} />
          <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">
            {stopListeningRef.current ? "Listening..." : "Microphone Off"}
          </span>
        </div>

        <div className="min-h-[120px] bg-slate-50 rounded-2xl p-6 mb-8 flex flex-col justify-center items-center text-center">
          {isProcessing ? (
            <div className="flex flex-col items-center gap-2">
              <div className="h-6 w-6 border-2 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
              <p className="text-sm font-bold text-indigo-600">AI is thinking...</p>
            </div>
          ) : aiResponse ? (
            <p className="text-lg font-medium text-slate-700 leading-relaxed italic">"{aiResponse}"</p>
          ) : (
            <p className="text-slate-400 font-medium italic">Your conversation will appear here...</p>
          )}
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleStartListening}
            disabled={!!stopListeningRef.current}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-black py-4 px-6 rounded-2xl transition-all shadow-xl shadow-indigo-100 active:scale-95 flex items-center justify-center gap-2"
          >
            Start Session
          </button>
          <button
            onClick={handleStopListening}
            className="bg-red-50 hover:bg-red-100 text-red-600 font-black py-4 px-8 rounded-2xl transition-all active:scale-95"
          >
            Stop
          </button>
        </div>
      </div>

      <div className="text-center">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">
          Powered by Gemini 1.5 Flash
        </p>
      </div>
    </div>
  )
}

export default SpeechListener;