
import { GoogleGenAI, Type, Modality } from "@google/genai";

// Initialize AI client. 
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateProductDescription = async (productName: string, category: string): Promise<string> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite-latest',
      contents: `Write a sophisticated, 2-sentence marketing description for a premium product named "${productName}" in the "${category}" category. Focus on innovation and quality.`,
    });
    return response.text?.trim() || "Quality product for modern lifestyles.";
  } catch (error) {
    return "High-performance product designed with excellence in mind.";
  }
};

export const generateHeroCopy = async (siteName: string): Promise<{ title: string; subtitle: string }> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Write a powerful, short hero headline (max 5 words) and a compelling subtitle (max 15 words) for a high-end showcase website named "${siteName}". Format as JSON with "title" and "subtitle" keys.`,
      config: { 
        responseMimeType: "application/json"
      },
    });
    return JSON.parse(response.text || '{"title": "The Future of Design", "subtitle": "Excellence in every single detail."}');
  } catch (error) {
    return { title: "Curated Excellence", subtitle: "Handpicked essentials for the discerning modern lifestyle." };
  }
};

export const editImageWithAI = async (base64Image: string, prompt: string): Promise<string | null> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/jpeg' } },
        { text: prompt }
      ]
    }
  });
  
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};

export const generateProImage = async (prompt: string, aspectRatio: string = "1:1", imageSize: string = "1K"): Promise<string | null> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: { parts: [{ text: prompt }] },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio as any,
        imageSize: imageSize as any
      }
    }
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};

export const generateVeoVideo = async (prompt: string, imageBase64?: string, aspectRatio: '16:9' | '9:16' = '16:9'): Promise<string | null> => {
  const ai = getAI();
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    image: imageBase64 ? {
      imageBytes: imageBase64.split(',')[1],
      mimeType: 'image/jpeg'
    } : undefined,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: aspectRatio
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (downloadLink) {
    return `${downloadLink}&key=${process.env.API_KEY}`;
  }
  return null;
};

// --- New Feature: Media Understanding (Gemini 3 Pro) ---
export const analyzeMedia = async (mediaBase64: string, mimeType: string, prompt: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        { inlineData: { data: mediaBase64.split(',')[1], mimeType } },
        { text: prompt }
      ]
    }
  });
  return response.text || "No analysis generated.";
};

// --- New Feature: Audio Transcription (Gemini 3 Flash) ---
export const transcribeAudio = async (audioBase64: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { data: audioBase64.split(',')[1], mimeType: 'audio/wav' } },
        { text: "Transcribe this audio accurately. If it is empty, say so." }
      ]
    }
  });
  return response.text || "Transcription failed.";
};

// --- New Feature: Speech Generation (Gemini 2.5 TTS) ---
export const generateSpeech = async (text: string, voiceName: string = 'Kore'): Promise<string | null> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName },
        },
      },
    },
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
};

// --- New Feature: Deep Thinking Mode ---
export const deepThink = async (query: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: query,
    config: {
      thinkingConfig: { thinkingBudget: 32768 }
    }
  });
  return response.text || "Thinking session yielded no results.";
};

export const createChat = (useThinking: boolean = false) => {
  const ai = getAI();
  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: 'You are the Mizo Candle AI concierge. Help users with questions about our artisanal candles, lighting, and creating a peaceful atmosphere. Be warm, professional, and sophisticated.',
      ...(useThinking ? { thinkingConfig: { thinkingBudget: 32768 } } : {})
    }
  });
};
