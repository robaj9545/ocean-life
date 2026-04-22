import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Drumstick, HeartPulse } from 'lucide-react-native'
import ClownfishSVG from './fishes/Clownfish'
import BlueTangSVG from './fishes/BlueTang'
import { scale, iconSize } from '../utils/responsive'

// Memoize deeply to prevent expensive SVG re-renders 60x per second
const MemoizedFishSVG = React.memo(({ species, size, isBaby }: any) => {
  if (species === 'bluetang') {
    return <BlueTangSVG size={size} isBaby={isBaby} />
  }
  return <ClownfishSVG size={size} isBaby={isBaby} />
}, (prev, next) => prev.species === next.species && prev.size === next.size && prev.isBaby === next.isBaby)

export default function Fish(props: any) {
  const { position, size, direction, hunger, species, stage, health } = props

  const renderSize = Math.max(20, size)
  const isBaby = stage === 'baby' || stage === 'egg'

  return (
    <View style={[styles.fish, { left: position.x - renderSize/2, top: position.y - renderSize/2, width: renderSize, height: renderSize, borderRadius: renderSize / 2 }]}>
      
       {/* Needs food? Show drumstick icon floating above the fish */}
       {hunger < 40 && (
         <View style={styles.hungerBubble}>
           <Drumstick color="#FF4444" size={iconSize.xs} strokeWidth={2.5} />
         </View>
       )}

       {/* Sick? Show health icon */}
       {health < 50 && (
         <View style={[styles.hungerBubble, { top: scale(-40), borderColor: 'green' }]}>
           <HeartPulse color="#00CC00" size={iconSize.xs} strokeWidth={2.5} />
         </View>
       )}

       {/* Fast native transform replacement, avoiding Animated collisions with 60FPS tick */}
       <View style={[styles.sprite, { transform: [{ scaleX: direction }], opacity: health < 20 ? 0.7 : 1 }]}>
          <MemoizedFishSVG species={species} size={renderSize * 1.5} isBaby={isBaby} />
       </View>

    </View>
  )
}

const styles = StyleSheet.create({
  fish: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sprite: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hungerBubble: {
    position: 'absolute',
    top: scale(-22),
    backgroundColor: '#fff',
    borderRadius: scale(8),
    padding: scale(2),
    borderWidth: 1,
    borderColor: '#ff0000',
    zIndex: 100
  },
})
