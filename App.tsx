import React, { useState, useCallback } from 'react';
import { ImageFile } from './types';
import { STYLES, SIZES } from './constants';
import { generateCollage } from './services/geminiService';
import ImageUploader from './components/ImageUploader';
import StyleSelector from './components/StyleSelector';
import SizeSelector from './components/SizeSelector';
import LoadingSpinner from './components/LoadingSpinner';
import { SparklesIcon, DownloadIcon, TrashIcon, PlusIcon } from './components/Icons';

interface Stat {
  id: number;
  key: string;
  value: string;
}

const App: React.FC = () => {
  const [callName, setCallName] = useState<string>('Hiro');
  const [regName, setRegName] = useState<string>("Attra Dea's Holding out for a Hiro");
  const [preTitles, setPreTitles] = useState<string>('');
  const [postTitles, setPostTitles] = useState<string>('SIN, SDN, SD-S, CW-SP, CW-SPA, CW-SD, CW-SI, CW-ScR1, CW-ScR2, CW-ScR3, CW-SD3, RAT, HRDN, NTD, ITD, ATD');
  const [breeder, setBreeder] = useState<string>('');
  const [owner, setOwner] = useState<string>('');
  const [stats, setStats] = useState<Stat[]>([
    { id: 1, key: 'DOB', value: '' },
    { id: 2, key: 'Hips', value: '' },
    { id: 3, key: 'Eyes', value: '' },
    { id: 4, key: 'OFA', value: '' },
  ]);
  
  const [images, setImages] = useState<ImageFile[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([STYLES[0].id, STYLES[2].id]);
  const [selectedSize, setSelectedSize] = useState<string>(SIZES[0].id);

  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleStyleChange = (styleId: string) => {
    setSelectedStyles(prev =>
      prev.includes(styleId)
        ? prev.filter(id => id !== styleId)
        : [...prev, styleId]
    );
  };

  const handleStatChange = (id: number, field: 'key' | 'value', text: string) => {
    setStats(stats.map(stat => stat.id === id ? { ...stat, [field]: text } : stat));
  };

  const addStat = () => {
    setStats([...stats, { id: Date.now(), key: '', value: '' }]);
  };

  const removeStat = (id: number) => {
    setStats(stats.filter(stat => stat.id !== id));
  };

  const handleSave = () => {
    if (!generatedImage) return;

    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        setError("Could not create a canvas to save the image. Your browser might not be supported.");
        return;
      }
      
      ctx.drawImage(image, 0, 0);
      const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.9);
      
      const link = document.createElement('a');
      const fileName = `${callName.replace(/\s+/g, '_') || 'collage'}.jpeg`;
      link.href = jpegDataUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    image.onerror = () => {
        setError("Could not load the generated image for saving.");
    };
    image.src = generatedImage;
  };
  
  const handleGenerate = useCallback(async () => {
    if (images.length === 0) {
      setError('Please upload at least one image.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    const styleDescriptions = STYLES.filter(s => selectedStyles.includes(s.id)).map(s => s.description).join(', ');
    const selectedSizeDetails = SIZES.find(s => s.id === selectedSize);

    const statsString = stats
      .filter(s => s.key && s.value)
      .map(s => `- ${s.key}: ${s.value}`)
      .join('\n');

    const prompt = `
      IMAGE SHAPE AND ORIENTATION (ABSOLUTE COMMAND):
      ${selectedSizeDetails?.promptText}
      This is the most important instruction. Failure to follow this specific orientation and aspect ratio will result in a failed generation. It is not a suggestion.

      Create a dynamic and professional collage suitable for a dog breeder's advertisement or an athlete's poster.
      
      Objective:
      Seamlessly meld the provided images into a single, cohesive artwork. Use advanced masking and blending techniques to create a smooth, unified composition without hard edges between images.
      
      Image Content Integrity (CRITICAL RULE):
      - You MUST only use the visual information present in the provided images.
      - You are permitted to mask, cut out, and blend parts of the images to create the collage.
      - You are STRICTLY PROHIBITED from altering the physical structure, conformation, or appearance of the dogs. Do not change their body shape, add or remove features, or modify them in any way that would misrepresent the animal. The dogs must look exactly as they do in the photos.

      Text Layout and Styling (VERY IMPORTANT - follow this structure precisely):
      - Call Name (Most Prominent): "${callName}"
        - Font: Use a large, bold, flashy, high-impact display font (e.g., Anton, Bebas Neue).
        - Placement: This is the main textual focus. Make it the largest and most eye-catching text element on the collage.

      - Registered Name Group (This group should be less prominent and visually distinct from the Call Name):
        - Line 1: Pre-Titles: "${preTitles}" (Only include this line if text is provided for it).
          - Font: Use a small, elegant serif font (e.g., Lora, Times New Roman).
        - Line 2: Registered Name: "${regName}"
          - Font: Use a clean, modern sans-serif font (e.g., Inter, Helvetica). This should be larger than the titles, but significantly smaller than the Call Name.
        - Line 3: Post-Titles: "${postTitles}" (Only include this line if text is provided for it).
          - Font: Use the same small, elegant serif font as the Pre-Titles.
      
      Additional Information Block (IMPORTANT):
      - Create a distinct, well-organized block of text for the following details. This block should be legible but significantly less prominent than the names. Use a clean, simple sans-serif font. Arrange it neatly, possibly in columns if space allows.
      - Breeder: "${breeder}"
      - Owner: "${owner}"
      ${statsString ? `${statsString}` : ''}
      - IMPORTANT RULE: For "Breeder", "Owner", and any other stats, ONLY display the label and content if text has been provided for them. If a field is empty (e.g., no breeder name was given), DO NOT include its label or any placeholder on the final image.

      Artistic Styles to Apply:
      Incorporate the following styles: ${styleDescriptions}. The overall mood should be dramatic and powerful.
      
      Compositional Guidelines:
      - The main subject(s) from the images should be the focal point.
      - Ensure all text is legible and artistically integrated into the design, including dramatic shadows or glows on the text to make it pop.
      - The final output must be a single, complete image.
    `;

    try {
      const imageParts = images.map(img => ({
        mimeType: img.file.type,
        data: img.base64,
      }));

      const result = await generateCollage(prompt, imageParts);
      setGeneratedImage(result);
    } catch (err) {
      setError(err instanceof Error ? `An error occurred: ${err.message}` : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [images, callName, regName, preTitles, postTitles, selectedStyles, selectedSize, breeder, owner, stats]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="font-display text-5xl md:text-6xl font-bold tracking-wider text-white uppercase">
            Creative Collage <span className="text-cyan-400">Generator</span>
          </h1>
          <p className="mt-2 text-lg text-gray-400">
            AI-powered posters and advertisements, crafted in seconds.
          </p>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Controls Panel */}
          <div className="bg-gray-800/50 p-6 rounded-2xl shadow-lg border border-gray-700 flex flex-col gap-6 h-fit">
            <h2 className="text-2xl font-bold font-display text-cyan-400 border-b-2 border-cyan-500/30 pb-2">1. Add Content</h2>
            
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-300" htmlFor="callName">Call Name</label>
              <input type="text" id="callName" value={callName} onChange={e => setCallName(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all" placeholder="e.g., MAVERICK" />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-300">Registered Name & Titles</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input type="text" value={preTitles} onChange={e => setPreTitles(e.target.value)} className="flex-1 bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all" placeholder="Pre-titles (e.g., GCH CH)" />
                <input type="text" value={regName} onChange={e => setRegName(e.target.value)} className="flex-2 bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all" placeholder="Registered Name" />
                <input type="text" value={postTitles} onChange={e => setPostTitles(e.target.value)} className="flex-1 bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all" placeholder="Post-titles (e.g., ROM)" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-300" htmlFor="breeder">Breeder</label>
              <input type="text" id="breeder" value={breeder} onChange={e => setBreeder(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all" placeholder="Breeder Name" />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-300" htmlFor="owner">Owner</label>
              <input type="text" id="owner" value={owner} onChange={e => setOwner(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all" placeholder="Owner Name" />
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-300">Additional Stats</label>
              <div className="space-y-2">
                {stats.map((stat) => (
                  <div key={stat.id} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={stat.key}
                      onChange={(e) => handleStatChange(stat.id, 'key', e.target.value)}
                      className="w-1/3 bg-gray-900 border border-gray-600 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all text-sm"
                      placeholder="Stat Name"
                    />
                    <input
                      type="text"
                      value={stat.value}
                      onChange={(e) => handleStatChange(stat.id, 'value', e.target.value)}
                      className="flex-1 bg-gray-900 border border-gray-600 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all text-sm"
                      placeholder="Value"
                    />
                    <button
                      onClick={() => removeStat(stat.id)}
                      className="p-2 bg-gray-700 hover:bg-red-800/80 rounded-full transition-colors"
                      aria-label="Remove stat"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={addStat}
                className="mt-3 text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
              >
                <PlusIcon /> Add Stat
              </button>
            </div>
            
            <ImageUploader onImagesSelected={setImages} />

            <h2 className="text-2xl font-bold font-display text-cyan-400 border-b-2 border-cyan-500/30 pb-2 mt-4">2. Choose Style</h2>
            <StyleSelector styles={STYLES} selectedStyles={selectedStyles} onStyleChange={handleStyleChange} />
            
            <h2 className="text-2xl font-bold font-display text-cyan-400 border-b-2 border-cyan-500/30 pb-2 mt-4">3. Choose Size</h2>
            <SizeSelector sizes={SIZES} selectedSize={selectedSize} onSizeChange={setSelectedSize} />

            <button
              onClick={handleGenerate}
              disabled={isLoading || images.length === 0}
              className="w-full mt-4 bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 text-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-900/50"
            >
              {isLoading ? 'Generating...' : <> <SparklesIcon /> Generate Collage </>}
            </button>
          </div>

          {/* Output Panel */}
          <div className="bg-gray-800/50 p-6 rounded-2xl shadow-lg border border-gray-700 flex flex-col items-center justify-center min-h-[60vh]">
            {isLoading && (
              <div className="text-center">
                <LoadingSpinner />
                <p className="mt-4 text-lg text-gray-400">AI is crafting your masterpiece... <br/>This may take a moment.</p>
              </div>
            )}
            
            {error && <p className="text-red-400 bg-red-900/50 p-4 rounded-lg">{error}</p>}
            
            {generatedImage && (
              <div className="w-full">
                <h2 className="text-2xl font-bold font-display text-cyan-400 mb-4 text-center">Your Collage is Ready!</h2>
                <img src={generatedImage} alt="Generated collage" className="w-full h-auto object-contain rounded-lg shadow-2xl" />
                <button
                  onClick={handleSave}
                  className="mt-4 w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 text-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-900/50"
                >
                  <DownloadIcon /> Save as JPEG
                </button>
              </div>
            )}
            
            {!isLoading && !generatedImage && !error && (
              <div className="text-center text-gray-500">
                <p className="text-2xl">Your generated collage will appear here.</p>
                <p>Fill out the details, upload images, and click generate!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
