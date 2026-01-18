
import React, { useState, useRef } from 'react';
import { generateProImage, generateVeoVideo, editImageWithAI, analyzeMedia, transcribeAudio, generateSpeech } from '../services/geminiService';
import { Product } from '../types';

interface AILaboratoryProps {
  hasApiKey: boolean;
  onOpenKeySelector: () => void;
  onUpdateProducts: (products: Product[]) => void;
  products: Product[];
}

const AILaboratory: React.FC<AILaboratoryProps> = ({ hasApiKey, onOpenKeySelector, onUpdateProducts, products }) => {
  const [activeTool, setActiveTool] = useState<'image' | 'video' | 'edit' | 'analyze' | 'audio'>('image');
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [imageSize, setImageSize] = useState('1K');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [mediaFile, setMediaFile] = useState<{data: string, type: string} | null>(null);
  const [audioBlob, setAudioBlob] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const handleGenerateImage = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    const res = await generateProImage(prompt, aspectRatio, imageSize);
    setResult(res);
    setIsGenerating(false);
  };

  const handleGenerateVideo = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    const res = await generateVeoVideo(prompt, mediaFile?.data || undefined, aspectRatio as any);
    setResult(res);
    setIsGenerating(false);
  };

  const handleAnalyze = async () => {
    if (!prompt || !mediaFile) return;
    setIsGenerating(true);
    const res = await analyzeMedia(mediaFile.data, mediaFile.type, prompt);
    setResult(res);
    setIsGenerating(false);
  };

  const handleTranscription = async () => {
    if (!audioBlob) return;
    setIsGenerating(true);
    const res = await transcribeAudio(audioBlob);
    setResult(res);
    setIsGenerating(false);
  };

  const handleTTS = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    const res = await generateSpeech(prompt);
    if (res) {
      setResult(`data:audio/pcm;base64,${res}`);
    }
    setIsGenerating(false);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.onloadend = () => setAudioBlob(reader.result as string);
        reader.readAsDataURL(blob);
      };
      recorder.start();
      setIsRecording(true);
    } catch (e) {
      alert("Microphone access denied.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setMediaFile({ data: reader.result as string, type: file.type });
      reader.readAsDataURL(file);
    }
  };

  if (!hasApiKey) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-6 text-center">
        <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-amber-50">
          <div className="text-6xl mb-6">🔑</div>
          <h2 className="text-3xl font-black mb-4">Elite Creative Suite</h2>
          <p className="text-gray-500 mb-8 font-medium">To use Gemini 3 Pro and Veo models, you must link your paid Google Cloud API key.</p>
          <button onClick={onOpenKeySelector} className="px-8 py-4 bg-amber-500 text-white rounded-2xl font-black shadow-lg shadow-amber-100 hover:scale-105 transition-all">
            Authenticate with API Key
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 pb-32 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
        <div>
          <h2 className="text-5xl font-black text-gray-900 tracking-tight">Mizo AI Studio</h2>
          <p className="text-gray-500 font-medium">Advanced multimodal creative engines powered by Gemini 3.</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl border shadow-sm flex-wrap gap-1">
          {[
            { id: 'image', label: 'Pro Images', icon: '🎨' },
            { id: 'video', label: 'Veo Cinema', icon: '🎬' },
            { id: 'analyze', label: 'Deep Vision', icon: '👁️' },
            { id: 'audio', label: 'Audio Lab', icon: '🔊' }
          ].map(tool => (
            <button
              key={tool.id}
              onClick={() => { setActiveTool(tool.id as any); setResult(null); }}
              className={`px-4 py-2 rounded-xl text-[10px] font-black flex items-center gap-2 transition-all ${
                activeTool === tool.id ? 'bg-black text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <span>{tool.icon}</span>
              <span className="uppercase tracking-widest">{tool.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-6">
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 block">AI Prompt / Text Input</label>
              <textarea 
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder={activeTool === 'audio' ? "Enter text for speech generation..." : "Describe your vision or ask a question about the media..."}
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none h-40 font-medium text-lg focus:ring-4 focus:ring-amber-500/5 transition-all"
              />
            </div>

            {(activeTool === 'image' || activeTool === 'video') && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 block">Aspect Ratio</label>
                  <select value={aspectRatio} onChange={e => setAspectRatio(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border rounded-xl font-bold text-sm">
                    {['1:1', '3:4', '4:3', '9:16', '16:9', '21:9'].map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                {activeTool === 'image' && (
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 block">Resolution</label>
                    <select value={imageSize} onChange={e => setImageSize(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border rounded-xl font-bold text-sm">
                      {['1K', '2K', '4K'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                )}
              </div>
            )}

            {(activeTool === 'analyze' || activeTool === 'video') && (
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 block">Source Media (Photo or Video)</label>
                <div className="relative group">
                  <input type="file" onChange={handleMediaUpload} accept="image/*,video/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                  <div className="border-2 border-dashed border-gray-200 rounded-3xl p-8 text-center group-hover:border-amber-500 transition-colors">
                    {mediaFile ? (
                      <div className="text-xs font-bold text-amber-600 truncate">{mediaFile.type.includes('video') ? '🎬 Video Loaded' : '🖼️ Photo Loaded'}</div>
                    ) : (
                      <span className="text-gray-400 font-bold uppercase text-xs tracking-widest">Drop Image/Video or Click</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTool === 'audio' && (
              <div className="p-4 bg-gray-50 rounded-3xl border border-gray-100 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-black uppercase text-gray-400 mb-1">Microphone Input</div>
                  <div className="text-xs font-bold text-gray-600">{audioBlob ? 'Recording Ready for Transcription' : 'No audio recorded'}</div>
                </div>
                <button 
                  onMouseDown={startRecording}
                  onMouseUp={stopRecording}
                  onTouchStart={startRecording}
                  onTouchEnd={stopRecording}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 animate-pulse text-white' : 'bg-black text-white'}`}
                >
                  {isRecording ? '⏹️' : '🎙️'}
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {activeTool === 'audio' ? (
                <>
                  <button disabled={isGenerating || !prompt} onClick={handleTTS} className="py-4 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest disabled:opacity-50">Generate Speech</button>
                  <button disabled={isGenerating || !audioBlob} onClick={handleTranscription} className="py-4 bg-amber-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest disabled:opacity-50">Transcribe Audio</button>
                </>
              ) : (
                <button 
                  disabled={isGenerating}
                  onClick={activeTool === 'image' ? handleGenerateImage : activeTool === 'video' ? handleGenerateVideo : handleAnalyze}
                  className="col-span-2 py-5 bg-amber-500 text-white rounded-3xl font-black text-lg shadow-xl shadow-amber-100 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isGenerating ? 'Gemini is Crafting...' : 'Fire Up Engine 🚀'}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="relative min-h-[500px] bg-gray-100 rounded-[2.5rem] overflow-hidden flex items-center justify-center border border-gray-200 shadow-inner group p-8">
          {isGenerating ? (
            <div className="text-center space-y-4 animate-pulse">
              <div className="text-4xl">🧪</div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Processing Data</p>
            </div>
          ) : result ? (
            <div className="w-full h-full flex flex-col items-center justify-center">
              {result.startsWith('data:image') ? (
                <img src={result} className="max-w-full max-h-full object-contain rounded-2xl shadow-xl" />
              ) : result.includes('googlevideo') || result.startsWith('http') && result.includes('key=') ? (
                <video src={result} controls className="max-w-full max-h-full rounded-2xl shadow-xl" />
              ) : result.startsWith('data:audio') ? (
                <div className="text-center space-y-6">
                  <div className="text-6xl">🔊</div>
                  <audio src={result} controls className="mx-auto" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Speech Generation Complete</p>
                </div>
              ) : (
                <div className="bg-white p-8 rounded-[2rem] border shadow-sm w-full max-h-full overflow-y-auto">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-4">Gemini Intelligence Output</h4>
                  <p className="text-gray-800 font-medium leading-relaxed whitespace-pre-wrap">{result}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center opacity-20">
              <div className="text-8xl mb-4">✨</div>
              <p className="text-sm font-black uppercase tracking-widest">Awaiting Command</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AILaboratory;
