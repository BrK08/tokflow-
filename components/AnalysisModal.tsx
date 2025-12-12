import React from 'react';
import { AnalysisResult } from '../types';
import { X, TrendingUp, Music, Hash, Clock, Lightbulb, CheckCircle2, FileText, AlignLeft } from 'lucide-react';

interface AnalysisModalProps {
  result: AnalysisResult | null;
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
}

export const AnalysisModal: React.FC<AnalysisModalProps> = ({ result, isOpen, onClose, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-surface border border-slate-700 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl relative flex flex-col [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-slate-800 [&::-webkit-scrollbar-thumb]:bg-accent/50 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-accent">
        
        {/* Header */}
        <div className="sticky top-0 bg-surface/95 backdrop-blur z-10 border-b border-slate-700 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="text-accent">AI</span> Viral Analiz Raporu
          </h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-700 rounded-full"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-400 animate-pulse">
                Video kareleri taranıyor ve metinler okunuyor...
              </p>
            </div>
          ) : result ? (
            <>
              {/* Score & Core Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700 flex flex-col items-center justify-center text-center">
                  <div className="text-slate-400 text-sm font-medium mb-2 uppercase tracking-wider">Viral Puanı</div>
                  <div className={`text-5xl font-black ${result.viralScore >= 80 ? 'text-green-400' : result.viralScore >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {result.viralScore}
                  </div>
                </div>
                
                <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700 col-span-2 space-y-3">
                  <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">Teknik Kontrol</h3>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="bg-slate-800 p-3 rounded-lg">
                      <span className="block text-slate-500 text-xs mb-1">Işık</span>
                      <span className="font-medium text-slate-200">{result.contentAnalysis.lighting}</span>
                    </div>
                    <div className="bg-slate-800 p-3 rounded-lg">
                      <span className="block text-slate-500 text-xs mb-1">Kalite</span>
                      <span className="font-medium text-slate-200">{result.contentAnalysis.quality}</span>
                    </div>
                    <div className="bg-slate-800 p-3 rounded-lg">
                      <span className="block text-slate-500 text-xs mb-1">Kanca (Hook)</span>
                      <span className="font-medium text-slate-200">{result.contentAnalysis.hookStrength}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Text Analysis Section - NEW */}
              <div className="bg-slate-900/50 border border-slate-700 p-6 rounded-xl space-y-4">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <FileText size={20} className="text-indigo-400" /> Metin Analizi (OCR)
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Videoda Tespit Edilen Yazılar</span>
                    <div className="bg-slate-800 p-3 rounded-lg max-h-40 overflow-y-auto border border-slate-700/50">
                      {result.textAnalysis.detectedText && result.textAnalysis.detectedText.length > 0 ? (
                        <ul className="list-disc list-inside space-y-1 text-slate-300 text-sm">
                          {result.textAnalysis.detectedText.map((text, idx) => (
                            <li key={idx} className="leading-relaxed">{text}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-slate-500 text-sm italic">Videoda belirgin bir metin tespit edilemedi.</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="block text-slate-500 text-xs mb-1 font-bold">Ana Mesaj</span>
                      <p className="text-slate-200 bg-slate-800/50 p-2 rounded">{result.textAnalysis.coreMessage}</p>
                    </div>
                     <div>
                      <span className="block text-slate-500 text-xs mb-1 font-bold">Stil & Uyum</span>
                      <p className="text-slate-300">{result.textAnalysis.textStyle}</p>
                      <p className="text-slate-400 text-xs mt-1">{result.textAnalysis.textAudioSync}</p>
                    </div>
                     <div>
                      <span className="block text-slate-500 text-xs mb-1 font-bold">Duygu</span>
                      <p className="text-slate-300 flex items-center gap-2">
                        <AlignLeft size={14} /> {result.textAnalysis.textSentiment}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Suggestions */}
              <div className="bg-cyan-900/10 border border-cyan-900/50 p-6 rounded-xl">
                <h3 className="text-accent font-semibold mb-4 flex items-center gap-2">
                  <Lightbulb size={20} /> Optimizasyon Önerileri
                </h3>
                <ul className="space-y-2">
                  {result.suggestions.map((s, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-300 text-sm">
                      <CheckCircle2 size={16} className="text-accent mt-0.5 shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Captions */}
              <div>
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp size={20} className="text-purple-400" /> Viral Açıklamalar
                </h3>
                <div className="grid gap-3">
                  {result.captions.map((caption, i) => (
                    <div key={i} className="bg-slate-900/50 border border-slate-700 p-4 rounded-lg relative group transition-all hover:bg-slate-800">
                      <p className="text-slate-300 font-medium">{caption}</p>
                      <button 
                        onClick={() => navigator.clipboard.writeText(caption)}
                        className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 bg-accent text-slate-900 text-xs px-2 py-1 rounded font-bold transition-opacity"
                      >
                        Kopyala
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hashtags & Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Hash size={20} className="text-blue-400" /> Hashtag Seti
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Niş / Konu</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {result.hashtags.niche.map(tag => (
                          <span key={tag} className="bg-slate-800 text-blue-200 px-2 py-1 rounded text-xs">#{tag}</span>
                        ))}
                      </div>
                    </div>
                     <div>
                      <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Konum / Trend</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {result.hashtags.locationBased.map(tag => (
                          <span key={tag} className="bg-slate-800 text-green-200 px-2 py-1 rounded text-xs">#{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <Clock size={20} className="text-orange-400" /> En İyi Paylaşım Saati
                    </h3>
                    <div className="bg-slate-800 p-4 rounded-lg text-center">
                      <span className="text-xl font-bold text-orange-200">{result.bestPostingTime}</span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <Music size={20} className="text-pink-400" /> Trend Sesler
                    </h3>
                    <div className="space-y-2">
                       {result.music.slice(0, 2).map((m, i) => (
                         <div key={i} className="bg-slate-800 p-3 rounded-lg text-sm">
                           <div className="font-medium text-pink-200">{m.song}</div>
                           <div className="text-slate-500 text-xs mt-1">{m.timestamp} • {m.reason}</div>
                         </div>
                       ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
             <div className="text-center text-red-400 py-10">Analiz başarısız. Lütfen tekrar deneyin.</div>
          )}
        </div>
      </div>
    </div>
  );
};