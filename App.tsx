import React, { useState, useEffect, useRef } from 'react';
import { VideoItem, AnalysisResult } from './types';
import { VideoCard } from './components/VideoCard';
import { AnalysisModal } from './components/AnalysisModal';
import { analyzeVideoContent } from './services/geminiService';
import { 
  Layers, 
  Trash2, 
  Zap,
  Github,
  UploadCloud,
  FileVideo,
  Info,
  X,
  ExternalLink,
  Film
} from 'lucide-react';

function App() {
  const [queue, setQueue] = useState<VideoItem[]>([]);
  const [userLocation, setUserLocation] = useState<string>('Bilinmeyen Konum');
  const [dragActive, setDragActive] = useState(false);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Info Modal State
  const [showInfoModal, setShowInfoModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Attempt to get location for better context
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => setUserLocation('Istanbul, Turkey'), // Mock success for privacy/simplicity in this demo env
        () => setUserLocation('Global')
      );
    }
  }, []);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newItems: VideoItem[] = Array.from(files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      url: URL.createObjectURL(file),
      thumbnail: `https://picsum.photos/seed/${Math.random()}/300/400`, // Placeholder thumbnail
      title: file.name,
      platform: 'Upload',
      status: 'queued',
      progress: 0,
      file: file // Store the actual file object for analysis
    }));

    setQueue(prev => [...prev, ...newItems]);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleDownload = (id: string) => {
    console.log("Download requested for", id);
  };

  const handleAnalyze = async (item: VideoItem) => {
    // If already analyzed, just show results
    if (item.analysis) {
        setCurrentAnalysis(item.analysis);
        setIsModalOpen(true);
        return;
    }

    if (!item.file) {
      alert("Analiz edilecek dosya bulunamadı.");
      return;
    }

    // Dosya boyutu kontrolü (Client-side base64 limitleri için güvenlik önlemi)
    if (item.file.size > 20 * 1024 * 1024) {
      alert("Demo sürümünde şu an için maksimum 20MB dosya boyutu desteklenmektedir.");
      return;
    }

    setIsModalOpen(true);
    setIsAnalyzing(true);
    setCurrentAnalysis(null);
    
    // Update item status
    setQueue(prev => prev.map(i => i.id === item.id ? { ...i, status: 'analyzing' } : i));

    try {
      // Pass the FILE object instead of title string
      const result = await analyzeVideoContent(item.file, userLocation);
      
      setCurrentAnalysis(result);
      
      setQueue(prev => prev.map(i => 
        i.id === item.id ? { ...i, status: 'analyzed', analysis: result } : i
      ));
    } catch (error) {
      console.error("Analysis failed", error);
      setQueue(prev => prev.map(i => i.id === item.id ? { ...i, status: 'error' } : i));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClearQueue = () => {
    setQueue([]);
  };

  return (
    <div className="min-h-screen bg-background text-slate-200 font-sans">
      <AnalysisModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        result={currentAnalysis}
        isLoading={isAnalyzing}
      />

      {/* Info Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="bg-surface border border-slate-700 max-w-md w-full rounded-2xl p-6 relative shadow-2xl">
             <button 
               onClick={() => setShowInfoModal(false)}
               className="absolute right-4 top-4 text-slate-400 hover:text-white"
             >
               <X size={20} />
             </button>
             <div className="flex items-center gap-3 mb-4 text-accent">
               <Info size={24} />
               <h3 className="text-lg font-semibold text-white">Konum İzni Neden Gerekli?</h3>
             </div>
             <p className="text-slate-300 leading-relaxed">
               Şehrinize veya bölgenize özel trend hashtag'leri ve içerik önerilerini göstermek için konum bilgisini kullanıyoruz. Bu, videonuzun yerel kitlelere ulaşmasına yardımcı olur.
             </p>
             <button 
               onClick={() => setShowInfoModal(false)}
               className="mt-6 w-full bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 rounded-lg transition-colors"
             >
               Tamam, Anladım
             </button>
           </div>
        </div>
      )}

      {/* Navigation / Header */}
      <header className="border-b border-slate-800 bg-background/50 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-tr from-primary to-accent p-1.5 rounded-lg text-slate-900">
              <Film size={20} strokeWidth={2.5} />
            </div>
            <h1 className="font-bold text-2xl tracking-tighter text-white">Berk</h1>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-slate-400">
             <a 
               href="https://brk08.github.io/tokbatch-downloader/" 
               target="_blank" 
               rel="noreferrer"
               className="hidden sm:flex items-center gap-1.5 hover:text-accent transition-colors font-medium"
             >
               TokBatch Downloader <ExternalLink size={14} />
             </a>

             <button 
               onClick={() => setShowInfoModal(true)}
               className="hover:text-white transition-colors p-1"
               title="Konum hakkında bilgi"
             >
               <Info size={20} />
             </button>

             <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface border border-slate-700">
               <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
               API Bağlı
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Input */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-surface border border-slate-700 rounded-2xl p-6 shadow-xl shadow-black/20">
              <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                <FileVideo size={18} className="text-accent"/> Video Yükle
              </h2>
              <p className="text-slate-400 text-sm mb-4">
                Paylaşmadan önce videonu yükle ve yapay zeka ile analiz et.
              </p>
              
              <div 
                className={`w-full h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-200 mb-4 text-center p-4
                  ${dragActive 
                    ? 'border-accent bg-accent/5 scale-[1.02]' 
                    : 'border-slate-600 bg-slate-900/50 hover:border-slate-500 hover:bg-slate-900'
                  }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={onButtonClick}
              >
                <input 
                  ref={fileInputRef}
                  type="file" 
                  className="hidden" 
                  multiple 
                  accept=".mp4,.mov,.avi" 
                  onChange={handleChange}
                />
                <div className="bg-slate-800 p-4 rounded-full mb-3 text-accent">
                   <UploadCloud size={32} />
                </div>
                <p className="text-slate-300 font-medium mb-1">
                  Videoyu sürükleyip bırakın
                </p>
                <p className="text-slate-500 text-xs">
                  veya seçmek için tıklayın (.mp4, .mov, .avi)
                </p>
              </div>

              <button
                onClick={onButtonClick}
                className="w-full bg-primary hover:bg-primaryHover text-slate-950 font-bold py-3 rounded-xl transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <UploadCloud size={20} /> Dosya Seç
              </button>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface/50 border border-slate-800 p-4 rounded-xl">
                 <Zap className="text-yellow-400 mb-2" size={24} />
                 <h3 className="font-semibold text-white text-sm">AI Analiz</h3>
                 <p className="text-xs text-slate-500 mt-1">Viral tahminler & optimizasyon.</p>
              </div>
              <div className="bg-surface/50 border border-slate-800 p-4 rounded-xl">
                 <Layers className="text-purple-400 mb-2" size={24} />
                 <h3 className="font-semibold text-white text-sm">Akıllı Sıra</h3>
                 <p className="text-xs text-slate-500 mt-1">Çoklu video yönetimi.</p>
              </div>
            </div>
          </div>

          {/* Right Column: Queue */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Layers size={18} className="text-accent"/> Bekleme Listesi 
                <span className="bg-slate-800 text-slate-400 text-xs px-2 py-0.5 rounded-full">{queue.length}</span>
              </h2>
              {queue.length > 0 && (
                <button 
                  onClick={handleClearQueue}
                  className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 px-2 py-1 hover:bg-red-500/10 rounded transition-colors"
                >
                  <Trash2 size={12} /> Temizle
                </button>
              )}
            </div>

            <div className="space-y-3">
              {queue.length === 0 ? (
                <div className="h-64 border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-500 gap-3">
                   <div className="w-12 h-12 rounded-full bg-slate-800/50 flex items-center justify-center">
                     <FileVideo size={20} className="opacity-50" />
                   </div>
                   <p className="text-sm">Henüz video yüklenmedi</p>
                </div>
              ) : (
                queue.map(item => (
                  <VideoCard 
                    key={item.id} 
                    item={item} 
                    onDownload={handleDownload}
                    onAnalyze={handleAnalyze}
                  />
                ))
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;