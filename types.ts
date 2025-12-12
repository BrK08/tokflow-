export interface VideoItem {
  id: string;
  url: string;
  thumbnail: string;
  title: string;
  platform: 'TikTok' | 'Instagram' | 'YouTube' | 'Twitter' | 'Unknown' | 'Upload';
  status: 'queued' | 'downloading' | 'completed' | 'analyzing' | 'analyzed' | 'error';
  progress: number;
  file?: File; // Gerçek analiz için dosya objesi
  analysis?: AnalysisResult;
}

export interface AnalysisResult {
  viralScore: number;
  contentAnalysis: {
    lighting: string;
    quality: string;
    hookStrength: string;
  };
  textAnalysis: {
    detectedText: string[];
    textStyle: string;
    textSentiment: string;
    textAudioSync: string;
    coreMessage: string;
  };
  music: {
    song: string;
    timestamp: string;
    reason: string;
  }[];
  hashtags: {
    niche: string[];
    broad: string[];
    locationBased: string[];
  };
  captions: string[];
  bestPostingTime: string;
  suggestions: string[];
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}