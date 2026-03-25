import React from 'react';
import Svg, { Ellipse, Path, Circle, G } from 'react-native-svg';

export default function BlueTangSVG({ size = 50, isBaby = false }) {
  const rx = isBaby ? 45 : 60;
  const ry = isBaby ? 35 : 35;
  
  return (
    <Svg width={size} height={size} viewBox="0 0 140 100">
      <G transform="translate(70, 50)">
        {/* Tail (Yellow) */}
        <Path 
          d={isBaby ? "M-40 0 L-65 -15 Q-70 0 -65 15 Z" : "M-50 0 L-85 -25 L-75 0 L-85 25 Z"} 
          fill="#ffd700" stroke="#000" strokeWidth="2" strokeLinejoin="round"
        />
        
        {/* Top/Bottom Fins (Blue/Black) */}
        <Path d={isBaby ? "M-20 -30 Q 0 -45 20 -30 Z" : "M-30 -30 Q 10 -55 35 -25 Z"} fill="#0000cd" stroke="#000" strokeWidth="2" strokeLinejoin="round" />
        <Path d={isBaby ? "M-20 30 Q 0 45 20 30 Z" : "M-30 30 Q 10 55 35 25 Z"} fill="#0000cd" stroke="#000" strokeWidth="2" strokeLinejoin="round" />

        {/* Main Body (Blue) */}
        <Ellipse cx="0" cy="0" rx={rx} ry={ry} fill="#1e90ff" stroke="#000" strokeWidth="2" />
        
        {/* Black Pattern */}
        <Path d={isBaby ? "M 20 -10 C 0 -15 -10 -5 -25 -8 C -10 -5 -10 10 20 -10 Z" : "M 35 -15 C 10 -20 -10 -10 -35 -10 C -15 -10 -5 15 35 -15 Z"} fill="#000000" />
        
        {/* Eye */}
        <Circle cx={isBaby ? 20 : 35} cy="-8" r={isBaby ? 8 : 7} fill="#ffffff" stroke="#000" strokeWidth="1.5" />
        <Circle cx={isBaby ? 22 : 37} cy="-8" r={isBaby ? 4 : 3.5} fill="#000000" />
        
        {/* Pectoral Fin (Yellow tip) */}
        <Path d={isBaby ? "M -5 5 C 10 15 15 5 -5 5 Z" : "M 0 5 C 20 20 25 5 0 5 Z"} fill="#ffd700" stroke="#000" strokeWidth="1.5" strokeLinejoin="round" />
        
        {/* Mouth */}
        <Path d={isBaby ? "M 35 12 Q 40 15 42 12" : "M 50 15 Q 55 18 58 15"} fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" />
      </G>
    </Svg>
  );
}
