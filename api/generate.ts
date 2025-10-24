// api/generate.ts
// Copy this ENTIRE file into your new api/generate.ts

import type { VercelRequest, VercelResponse } from '@vercel/node';

interface ImagePart {
  mimeType: string;
  data: string;
}

interface GenerateRequest {
  prompt: string;
  images: ImagePart[];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, images }: GenerateRequest = req.body;

    if (!prompt || !images || images.length === 0) {
      return res.status(400).json({ error: 'Missing prompt or images' });
    }

    // Get API key from environment variable
    const API_KEY = process.env.GEMINI_API_KEY;
    
    if (!API_KEY) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    // Import the Google GenAI module
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const imageParts = images.map((image: ImagePart) => ({
      inlineData: {
        data: image.data,
        mimeType: image.mimeType,
      },
    }));

    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [textPart, ...imageParts],
      },
      config: {
        responseModalities: ['IMAGE' as any],
      },
    });
    
    // Find the first part that is an image
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData && part.inlineData.data) {
        const base64ImageBytes: string = part.inlineData.data;
        return res.status(200).json({ 
          imageData: `data:${part.inlineData.mimeType};base64,${base64ImageBytes}` 
        });
      }
    }
    
    return res.status(500).json({ error: 'No image was generated' });
    
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};