import React from 'react';

export const TriangleFigure = ({ a = 'a', b = 'b', c = 'c', h = 'h' }) => (
  <svg viewBox="0 0 100 80" className="w-32 h-24 text-white/40 fill-none stroke-current stroke-2">
    <path d="M 10 70 L 90 70 L 50 10 Z" />
    <path d="M 50 10 L 50 70" strokeDasharray="4" />
    <text x="50" y="78" className="fill-current stroke-none text-[8px] text-center" textAnchor="middle">base (b)</text>
    <text x="52" y="40" className="fill-current stroke-none text-[8px]">height (h)</text>
  </svg>
);

export const RightTriangleFigure = () => (
    <svg viewBox="0 0 100 80" className="w-32 h-24 text-white/40 fill-none stroke-current stroke-2">
      <path d="M 20 10 L 20 70 L 80 70 Z" />
      <path d="M 20 60 L 30 60 L 30 70" />
      <text x="10" y="40" className="fill-current stroke-none text-[10px]">p</text>
      <text x="50" y="78" className="fill-current stroke-none text-[10px]">b</text>
      <text x="50" y="35" className="fill-current stroke-none text-[10px]">h</text>
    </svg>
);

export const CircleFigure = () => (
  <svg viewBox="0 0 100 100" className="w-24 h-24 text-white/40 fill-none stroke-current stroke-2">
    <circle cx="50" cy="50" r="40" />
    <line x1="50" y1="50" x2="90" y2="50" />
    <circle cx="50" cy="50" r="2" className="fill-current" />
    <text x="65" y="45" className="fill-current stroke-none text-[10px]">r</text>
  </svg>
);

export const CylinderFigure = () => (
  <svg viewBox="0 0 100 120" className="w-24 h-32 text-white/40 fill-none stroke-current stroke-2">
    <ellipse cx="50" cy="20" rx="30" ry="10" />
    <ellipse cx="50" cy="100" rx="30" ry="10" />
    <line x1="20" y1="20" x2="20" y2="100" />
    <line x1="80" y1="20" x2="80" y2="100" />
    <line x1="50" y1="100" x2="80" y2="100" strokeDasharray="2" />
    <text x="60" y="95" className="fill-current stroke-none text-[8px]">r</text>
    <text x="85" y="60" className="fill-current stroke-none text-[8px]">h</text>
  </svg>
);

export const ConeFigure = () => (
  <svg viewBox="0 0 100 120" className="w-24 h-32 text-white/40 fill-none stroke-current stroke-2">
    <ellipse cx="50" cy="100" rx="30" ry="10" />
    <line x1="20" y1="100" x2="50" y2="10" />
    <line x1="80" y1="100" x2="50" y2="10" />
    <line x1="50" y1="10" x2="50" y2="100" strokeDasharray="2" />
    <text x="55" y="60" className="fill-current stroke-none text-[8px]">h</text>
    <text x="65" y="45" className="fill-current stroke-none text-[8px]">l</text>
  </svg>
);

export const SphereFigure = () => (
  <svg viewBox="0 0 100 100" className="w-24 h-24 text-white/40 fill-none stroke-current stroke-2">
    <circle cx="50" cy="50" r="40" />
    <ellipse cx="50" cy="50" rx="40" ry="15" strokeDasharray="4" />
    <line x1="50" y1="50" x2="90" y2="50" />
    <text x="65" y="45" className="fill-current stroke-none text-[10px]">r</text>
  </svg>
);

export const ParallelogramFigure = () => (
  <svg viewBox="0 0 100 80" className="w-32 h-24 text-white/40 fill-none stroke-current stroke-2">
    <path d="M 30 10 L 90 10 L 70 70 L 10 70 Z" />
    <line x1="30" y1="10" x2="30" y2="70" strokeDasharray="4" />
    <text x="35" y="45" className="fill-current stroke-none text-[8px]">h</text>
    <text x="40" y="78" className="fill-current stroke-none text-[8px]">base (b)</text>
  </svg>
);

export const SetVennFigure = () => (
    <svg viewBox="0 0 100 80" className="w-32 h-24 text-white/40 fill-none stroke-current stroke-2">
        <rect x="5" y="5" width="90" height="70" />
        <circle cx="40" cy="40" r="25" />
        <circle cx="60" cy="40" r="25" />
        <text x="25" y="30" className="fill-current stroke-none text-[10px]">A</text>
        <text x="70" y="30" className="fill-current stroke-none text-[10px]">B</text>
        <text x="85" y="15" className="fill-current stroke-none text-[10px]">U</text>
    </svg>
);
