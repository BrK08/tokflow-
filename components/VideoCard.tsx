import React from 'react';
import { VideoItem } from '../types';
import { Loader2, Sparkles, CheckCheck, FileDown, ExternalLink } from 'lucide-react';

interface VideoCardProps {
  item: VideoItem;
  onDownload: (id: string) => void;
  onAnalyze: (item: VideoItem) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({ item, onDownload, onAnalyze }) => {
  const getStatusIcon = () => {
    switch (item.status) {
      case 'downloading': return <Loader2 className="animate-spin text-accent" size={20} />;
      case 'completed': return <CheckCheck className="text-green-500" size={20} />;
      case 'analyzing': return <Loader2 className="animate-spin text-purple-400" size={20} />;
      case 'analyzed': return <Sparkles className="text-purple-400" size={20} />;
      case 'error': return <span className="text-red-500 text-sm font-bold">!</span>;
      default: return <FileDown className="text-slate-500" size={20} />;
    }
  };

  const getStatusText = () => {
     switch (item.status) {
      case 'downloading': return 'İndiriliyor...';
      case 'completed': return 'Hazır';
      case 'analyzing': return 'Analiz Ediliyor...';
      case 'analyzed': return 'Analiz Tamamlandı';
      case 'error': return 'Hata';
      default: return 'Sırada';
    }
  };

  return (
    <div className="bg-surface border border-slate-700 rounded-xl p-4 flex gap-4 hover:border-slate-600 transition-all group">
      {/* Thumbnail */}
      <div className="w-24 h-32 bg-slate-800 rounded-lg overflow-hidden shrink-0 relative">
        <img 
          src={item.thumbnail} 
          alt={item.title} 
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[10px] text-white p-1 text-center truncate">
          {item.platform === 'Upload' ? 'Yükleme' : item.platform}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-between py-1">
        <div>
          <h3 className="text-slate-100 font-medium line-clamp-2 mb-1" title={item.title}>
            {item.title}
          </h3>
          {item.platform !== 'Upload' && (
             <a href={item.url} target="_blank" rel="noreferrer" className="text-xs text-slate-500 hover:text-accent flex items-center gap-1">
               {item.url} <ExternalLink size={10} />
             </a>
          )}
        </div>

        {/* Actions */}
        <div className="mt-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-400">
               {getStatusIcon()}
               <span>{getStatusText()}</span>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => onAnalyze(item)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2
                  ${item.status === 'analyzed' 
                    ? 'bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30' 
                    : 'bg-primary hover:bg-primaryHover text-slate-950 font-bold'
                  }`}
              >
                <Sparkles size={16} /> 
                {item.status === 'analyzed' ? 'Raporu Gör' : 'Analiz Et'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};