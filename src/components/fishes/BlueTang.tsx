import React from 'react';
import Svg, { Circle, ClipPath, Defs, Ellipse, G, Line, Path, RadialGradient, Stop } from 'react-native-svg';

export default function BlueTangSVG({ size = 50, isBaby = false }) {
  const rx = isBaby ? 44 : 58;
  const ry = isBaby ? 34 : 34;
  const id = isBaby ? 'bt-baby' : 'bt-adult';

  return (
    <Svg width={size} height={size} viewBox="0 0 140 100">
      <Defs>
        <RadialGradient id={`${id}-body`} cx="40%" cy="35%" r="65%">
          <Stop offset="0%" stopColor="#5bb8ff" />
          <Stop offset="60%" stopColor="#1a7de8" />
          <Stop offset="100%" stopColor="#0a4fa0" />
        </RadialGradient>
        <RadialGradient id={`${id}-eye`} cx="35%" cy="35%" r="60%">
          <Stop offset="0%" stopColor="#ffffff" />
          <Stop offset="100%" stopColor="#e0e8ff" />
        </RadialGradient>
        <RadialGradient id={`${id}-fin`} cx="30%" cy="30%" r="70%">
          <Stop offset="0%" stopColor="#ffe866" />
          <Stop offset="100%" stopColor="#c8900a" />
        </RadialGradient>
        <RadialGradient id="bt-finblue" cx="40%" cy="30%" r="70%">
          <Stop offset="0%" stopColor="#4a9fff" />
          <Stop offset="100%" stopColor="#0a4fa0" />
        </RadialGradient>
        <ClipPath id={`${id}-clip`}>
          <Ellipse cx="0" cy="0" rx={rx} ry={ry} />
        </ClipPath>
      </Defs>
      <G transform="translate(70, 50)">
        {/* Tail – forked & expressive */}
        <Path
          d={isBaby
            ? "M-38,0 L-64,-18 Q-70,0 -64,18 Z"
            : "M-50,0 L-82,-28 L-74,0 L-82,28 Z"}
          fill={`url(#${id}-fin)`} stroke="#6b4000" strokeWidth="2.5" strokeLinejoin="round"
        />

        {/* Dorsal fin with rays */}
        <Path
          d={isBaby ? "M-18,-34 Q-2,-50 18,-34" : "M-28,-30 Q12,-58 36,-26"}
          fill="url(#bt-finblue)" stroke="#1a1a5a" strokeWidth="2.5" strokeLinejoin="round"
        />
        {/* Fin rays */}
        {isBaby ? (
          <>
            <Line x1="-14" y1="-34" x2="-10" y2="-46" stroke="#3a5fcd" strokeWidth="0.8" opacity="0.6" />
            <Line x1="0"   y1="-36" x2="2"   y2="-49" stroke="#3a5fcd" strokeWidth="0.8" opacity="0.6" />
            <Line x1="14"  y1="-34" x2="12"  y2="-46" stroke="#3a5fcd" strokeWidth="0.8" opacity="0.6" />
          </>
        ) : (
          <>
            <Line x1="-22" y1="-30" x2="-16" y2="-48" stroke="#3a5fcd" strokeWidth="0.9" opacity="0.6" />
            <Line x1="-4"  y1="-36" x2="2"   y2="-54" stroke="#3a5fcd" strokeWidth="0.9" opacity="0.6" />
            <Line x1="16"  y1="-36" x2="20"  y2="-52" stroke="#3a5fcd" strokeWidth="0.9" opacity="0.6" />
          </>
        )}

        {/* Anal fin */}
        <Path
          d={isBaby ? "M-18,34 Q-2,50 18,34" : "M-28,30 Q12,58 36,26"}
          fill="url(#bt-finblue)" stroke="#1a1a5a" strokeWidth="2.5" strokeLinejoin="round"
        />

        {/* Body */}
        <Ellipse cx="0" cy="0" rx={rx} ry={ry}
          fill={`url(#${id}-body)`} stroke="#0a2a66" strokeWidth="3"
        />
        {/* Sheen highlight */}
        <Ellipse cx={isBaby ? -5 : -8} cy={isBaby ? -8 : -10}
          rx={isBaby ? 13 : 18} ry={isBaby ? 8 : 11}
          fill="white" opacity="0.18"
        />

        {/* Black pattern */}
        <Path
          d={isBaby
            ? "M18,-9 C4,-14 -8,-7 -26,-9 C-12,-7 -10,10 18,-9 Z"
            : "M36,-15 C12,-22 -10,-12 -36,-12 C-16,-10 -6,16 36,-15 Z"}
          fill="#111" clipPath={`url(#${id}-clip)`}
        />

        {/* Pectoral fin */}
        <Path
          d={isBaby ? "M-4,6 Q12,17 14,7 Q6,4 -4,6 Z" : "M0,6 Q22,22 24,7 Q10,3 0,6 Z"}
          fill={`url(#${id}-fin)`} stroke="#6b4000" strokeWidth="1.8" strokeLinejoin="round"
        />

        {/* Spine accent (blue tang's caudal spine) */}
        <Path
          d={isBaby ? "M-32,0 L-27,-5 L-27,5 Z" : "M-42,0 L-36,-6 L-36,6 Z"}
          fill="#ffd700" stroke="#6b4000" strokeWidth="1.4"
        />

        {/* Eye: sclera → iris → pupil → catchlights */}
        <Circle cx={isBaby ? 22 : 36} cy="-8" r={isBaby ? 9 : 10}
          fill={`url(#${id}-eye)`} stroke="#0a2a66" strokeWidth="2.2"
        />
        <Circle cx={isBaby ? 23 : 37} cy="-8" r={isBaby ? 5.5 : 6.5}
          fill="#1a6bcc" stroke="#0a2a66" strokeWidth="0.8"
        />
        <Circle cx={isBaby ? 24 : 38} cy="-8.5" r={isBaby ? 3 : 3.5}
          fill="#000"
        />
        <Circle cx={isBaby ? 25.5 : 40} cy={isBaby ? -11 : -12} r={isBaby ? 1.4 : 1.8}
          fill="white"
        />
        <Circle cx={isBaby ? 22.5 : 36.5} cy={isBaby ? -6.5 : -6} r="0.8"
          fill="white"
        />

        {/* Mouth */}
        <Path
          d={isBaby ? "M37,11 Q40,14 43,11" : "M52,14 Q56,18 60,14"}
          fill="none" stroke="#0a2a66" strokeWidth="2.2" strokeLinecap="round"
        />
      </G>
    </Svg>
  );
}
