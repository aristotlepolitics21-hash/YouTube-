// Every constant the renderer reads. Change these, re-render, get the same pixels every time.
export const W = 1920;
export const H = 1080;
export const FPS = 30;

export const BG = '#0b0b0f';
export const INK = '#f4f2ec';
export const ACCENT = '#c8ff3d';

export const FONT_FAMILY = 'Space Grotesk';
export const FONT_WEIGHT = 700;
export const FONT_SIZE = 168;        // max size; a line that won't fit the safe area is scaled down
export const LETTER_SPACING = -0.02; // em
export const MARGIN = 144;           // all text stays inside this margin

// One card per line. Wrap exactly one word in *asterisks* to make it the accent word.
export const LINES = [
  'Every frame is *code*',
  'Nothing is *filmed*',
  'Same *input*',
  'Same *pixels*',
  'Render it *free*',
];

// Card motion (seconds / pixels)
export const IN = 0.5;    // fade in while rising
export const RISE = 40;
export const OUT = 0.25;  // fade out
export const hold = (words) => Math.max(1.2, 0.35 + words / 3.2);

// Sequence pacing
export const LEAD = 0.6;  // empty frames before the first card
export const GAP = 0.9;   // empty frames between cards
export const TAIL = 1.0;  // empty frames after the last card
