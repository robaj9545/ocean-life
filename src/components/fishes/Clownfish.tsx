import React from 'react';
import Svg, { Ellipse, Path, Circle, G, Defs, ClipPath } from 'react-native-svg';

export default function ClownfishSVG({ size = 50, isBaby = false }) {
  // Baby is rounder and smaller fins. Adult is more stretched.
  const rx = isBaby ? 40 : 55;
  const ry = isBaby ? 30 : 30;
  
  return (
    <Svg width={size} height={size} viewBox="0 0 140 100">
      <G transform="translate(70, 50)">
        {/* Back Fin (Tail) */}
        <Path 
          d={isBaby ? "M-35 0 L-60 -15 Q-65 0 -60 15 Z" : "M-45 0 L-80 -30 Q-90 0 -80 30 Z"} 
          fill="#ff6600" stroke="#000" strokeWidth="2" strokeLinejoin="round"
        />
        {/* Top Fin */}
        <Path d={isBaby ? "M-10 -25 Q0 -45 15 -25 Z" : "M-15 -25 Q10 -60 30 -25 Z"} fill="#ff6600" stroke="#000" strokeWidth="2" strokeLinejoin="round" />
        {/* Bottom Fin */}
        <Path d={isBaby ? "M-10 25 Q0 45 15 25 Z" : "M-5 25 Q15 60 25 25 Z"} fill="#ff6600" stroke="#000" strokeWidth="2" strokeLinejoin="round" />
        
        {/* Body clipping for stripes */}
        <Defs>
          <ClipPath id="bodyClip">
            <Ellipse cx="0" cy="0" rx={rx} ry={ry} />
          </ClipPath>
        </Defs>

        {/* Main Body */}
        <Ellipse cx="0" cy="0" rx={rx} ry={ry} fill="#ff7f00" stroke="#000" strokeWidth="2" />
        
        {/* Stripes */}
        <G clipPath="url(#bodyClip)">
           {/* Stripe 1 (Head) */}
           <Path d={isBaby ? "M 15 -40 Q 25 0 15 40 Q 30 0 30 -40 Z" : "M 10 -50 Q 25 0 10 50 Q 30 0 30 -50 Z"} fill="#ffffff" stroke="#000" strokeWidth="2" />
           {/* Stripe 2 (Middle) */}
           <Path d={isBaby ? "M -10 -40 Q 0 0 -10 40 Q -2 0 -2 -40 Z" : "M -15 -50 Q 0 0 -15 50 Q -5 0 -5 -50 Z"} fill="#ffffff" stroke="#000" strokeWidth="2" />
           {/* Stripe 3 (Tail) */}
           <Path d={isBaby ? "M -30 -30 Q -20 0 -30 30 Q -25 0 -25 -30 Z" : "M -35 -40 Q -25 0 -35 40 Q -28 0 -28 -40 Z"} fill="#ffffff" stroke="#000" strokeWidth="2" />
        </G>

        {/* Eye */}
        <Circle cx={isBaby ? 22 : 35} cy="-8" r={isBaby ? 7 : 6} fill="#ffffff" stroke="#000" strokeWidth="1.5" />
        <Circle cx={isBaby ? 24 : 37} cy="-8" r={isBaby ? 3.5 : 3} fill="#000000" />
        
        {/* Mouth */}
        <Path d={isBaby ? "M 32 8 Q 36 12 40 8" : "M 45 10 Q 50 15 55 10"} fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" />
        
        {/* Pectoral Fin */}
        <Path d={isBaby ? "M0 5 Q10 15 -5 12 Z" : "M5 5 Q20 25 -5 15 Z"} fill="#ff7f00" stroke="#000" strokeWidth="1.5" strokeLinejoin="round" />
      </G>
    </Svg>
  );
}
