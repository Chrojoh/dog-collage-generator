// services/geminiService.ts
// REPLACE your entire geminiService.ts file with this code

interface ImagePart {
  mimeType: string;
  data: string;
}

export const generateCollage = async (prompt: string, images: ImagePart[]): Promise<string> => {
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        images,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate collage');
    }

    const data = await response.json();
    return data.imageData;
    
  } catch (error) {
    console.error("Error calling generate API:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to generate collage: ${error.message}`);
    }
    throw new Error('An unknown error occurred while generating the collage.');
  }
};