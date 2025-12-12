import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Dosyayı Base64 string'e çeviren yardımcı fonksiyon
const fileToGenerativePart = async (file: File) => {
  return new Promise<{ inlineData: { data: string; mimeType: string } }>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve({
        inlineData: {
          data: base64String,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    viralScore: { type: Type.NUMBER, description: "0-100 arası viral potansiyel puanı" },
    contentAnalysis: {
      type: Type.OBJECT,
      properties: {
        lighting: { type: Type.STRING, description: "Görsel kalite, renk ve aydınlatma analizi" },
        quality: { type: Type.STRING, description: "Video türü ve çözünürlük algısı" },
        hookStrength: { type: Type.STRING, description: "İlk 3 saniye analizi: İzleyiciyi tutuyor mu?" }
      },
      required: ["lighting", "quality", "hookStrength"]
    },
    textAnalysis: {
      type: Type.OBJECT,
      properties: {
        detectedText: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Video karelerinde tespit edilen tüm yazılı metinler (OCR)"
        },
        textStyle: { type: Type.STRING, description: "Yazı tipi, renk, konum ve animasyon analizi" },
        textSentiment: { type: Type.STRING, description: "Metinlerin duygusal tonu (Heyecanlı, Bilgilendirici vb.)" },
        textAudioSync: { type: Type.STRING, description: "Metinlerin müzik ve görsel akışla uyumu" },
        coreMessage: { type: Type.STRING, description: "Metinlerden çıkarılan ana mesaj özeti" }
      },
      required: ["detectedText", "textStyle", "textSentiment", "textAudioSync", "coreMessage"]
    },
    music: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          song: { type: Type.STRING },
          timestamp: { type: Type.STRING },
          reason: { type: Type.STRING }
        },
        required: ["song", "timestamp", "reason"]
      }
    },
    hashtags: {
      type: Type.OBJECT,
      properties: {
        niche: { type: Type.ARRAY, items: { type: Type.STRING } },
        broad: { type: Type.ARRAY, items: { type: Type.STRING } },
        locationBased: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["niche", "broad", "locationBased"]
    },
    captions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "3 doğal Türkçe açıklama"
    },
    bestPostingTime: { type: Type.STRING },
    suggestions: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    }
  },
  required: ["viralScore", "contentAnalysis", "textAnalysis", "music", "hashtags", "captions", "bestPostingTime", "suggestions"]
};

export const analyzeVideoContent = async (
  file: File, 
  location: string
): Promise<AnalysisResult> => {
  
  // 1. Videoyu hazırla
  const videoPart = await fileToGenerativePart(file);

  // 2. Prompt'u hazırla
  const prompt = `
    Bu videoyu izle ve bir sosyal medya uzmanı olarak detaylı analiz et.
    Kullanıcının Konumu: ${location}
    
    ÖNEMLİ GÖREV: Videoyu kare kare (frame by frame) tarayarak video üzerindeki TÜM YAZILARI (Text Overlay / Altyazı / Başlık) tespit et.
    
    Lütfen şu adımları izle:
    1. VİDEO TÜRÜ: Bu ne videosu? (Yemek, Dans, Komedi, Eğitim, Vlog vb.)
    2. METİN OKUMA (OCR): Video içinde görünen tüm metinleri Türkçe olarak çıkar. Eğer metin yabancı dildeyse Türkçe'ye çevirerek ne anlattığını belirt.
    3. METİN ANALİZİ: 
       - Yazıların fontu, rengi ve ekrandaki konumu profesyonel mi?
       - Metinler müzikle veya hareketle senkronize mi?
       - Metinlerin duygusal tonu nedir?
       - Metinlerden yola çıkarak videonun vermeye çalıştığı ANA MESAJI özetle.
    4. GÖRSEL & HOOK: Görsel kalite ve ilk 3 saniyenin gücü.
    
    ÇIKTI STRATEJİSİ:
    - Captionlar: Videodaki metinleri ve ana mesajı temel alan, ilgi çekici 3 Türkçe açıklama.
    - Hashtagler: Videodaki METİNLERDEN çıkan anahtar kelimeleri hashtag olarak kullan.
    - Viral Puanı: Metin kullanımı, okunabilirlik ve içerik kalitesine göre puanla.
    
    Yanıtın SADECE tanımlanan JSON şemasına uygun olmalı.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [videoPart, { text: prompt }]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        systemInstruction: "Sen Türkçe konuşan, videodaki yazıları en ince detayına kadar okuyabilen uzman bir video analistisin."
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};