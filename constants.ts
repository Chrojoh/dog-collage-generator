import { StyleOption, SizeOption } from './types';

export const STYLES: StyleOption[] = [
  { id: 'silhouette', name: 'Silhouette', description: 'Incorporate dramatic silhouettes of the main subject against a stylized background.' },
  { id: 'grunge', name: 'Grunge', description: 'Apply a gritty, textured grunge overlay for a raw, edgy feel.' },
  { id: 'smoke', name: 'Smoke Overlay', description: 'Add ethereal smoke or fog effects to create depth and mystery.' },
  { id: 'spotlight', name: 'Focused Spotlight', description: 'Use a focused spotlight effect to draw attention to the main subject.' },
  { id: 'shadows', name: 'Text Shadows', description: 'Cast long, dramatic shadows from the text to integrate it with the background.' },
  { id: 'vibrant', name: 'Vibrant Colors', description: 'Use a bold, vibrant color palette to make the image pop.' },
];

export const SIZES: SizeOption[] = [
  { id: '8.5x11-portrait', name: '8.5" x 11" (Portrait)', promptText: 'Orientation: Portrait. Aspect Ratio: 8.5:11. The image MUST be taller than it is wide. Do NOT generate a landscape image.' },
  { id: '11x8.5-landscape', name: '11" x 8.5" (Landscape)', promptText: 'Orientation: Landscape. Aspect Ratio: 11:8.5. The image MUST be wider than it is tall. Do NOT generate a portrait image.' },
  { id: '5x7-portrait', name: '5" x 7" (Portrait)', promptText: 'Orientation: Portrait. Aspect Ratio: 5:7. The image MUST be taller than it is wide. Do NOT generate a landscape image.' },
  { id: '7x5-landscape', name: '7" x 5" (Landscape)', promptText: 'Orientation: Landscape. Aspect Ratio: 7:5. The image MUST be wider than it is tall. Do NOT generate a portrait image.' },
];