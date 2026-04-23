import React from 'react';
import Svg, { Circle, ClipPath, Defs, G, Path } from 'react-native-svg';

export default function ClownfishSVG({ size = 50, isBaby = false }: { size?: number; isBaby?: boolean }) {
  const outline = 3;

  return (
    <Svg width={size} height={size} viewBox="0 0 160 110">
      <G transform="translate(80,55)">

        {/* Tail */}
        <Path
          d="M -65 0 C -95 -35 -95 35 -65 0"
          fill="#FF7A00"
          stroke="#111"
          strokeWidth={outline}
        />

        {/* Body */}
        <Path
          id="body"
          d="M -55 0 
             C -35 -45 55 -45 75 0
             C 55 45 -35 45 -55 0 Z"
          fill="#FF7A00"
          stroke="#111"
          strokeWidth={outline}
        />

        {/* Stripes clipped */}
        <Defs>
          <ClipPath id="clip">
            <Path d="M -55 0 C -35 -45 55 -45 75 0 C 55 45 -35 45 -55 0 Z"/>
          </ClipPath>
        </Defs>

        <G clipPath="url(#clip)">
          <Path d="M 30 -60 Q 15 0 30 60" stroke="#fff" strokeWidth="22" />
          <Path d="M -5 -60 Q -20 0 -5 60" stroke="#fff" strokeWidth="22" />
          <Path d="M -35 -50 Q -45 0 -35 50" stroke="#fff" strokeWidth="22" />
        </G>

        {/* Eye */}
        <Circle cx="45" cy="-10" r="10" fill="#fff" stroke="#111" strokeWidth="2"/>
        <Circle cx="48" cy="-10" r="5" fill="#111"/>

        {/* Mouth */}
        <Path
          d="M 60 12 Q 70 18 78 12"
          stroke="#111"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
      </G>
    </Svg>
  );
}
