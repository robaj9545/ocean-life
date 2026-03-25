import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export default function Fish(props: any) {
  const { position, size, color, direction, hunger } = props

  // Determine standard size scaling (min size 20)
  const renderSize = Math.max(20, size)

  return (
    <View style={[styles.fish, { left: position.x - renderSize/2, top: position.y - renderSize/2, width: renderSize, height: renderSize, borderRadius: renderSize / 2 }]}>
      
       {/* Needs food? Show fork and knife icon floating above the fish! */}
       {hunger < 40 && (
         <View style={styles.hungerBubble}>
           <Text style={styles.hungerIcon}>🍽️</Text>
         </View>
       )}

       <View style={[styles.sprite, { transform: [{ scaleX: direction }] }]}>
          <View style={[styles.body, { backgroundColor: color, width: renderSize, height: renderSize / 1.5, borderRadius: renderSize / 2 }]} />
          <View style={[styles.tail, { borderRightColor: color, left: -renderSize/3, top: renderSize/6, borderTopWidth: renderSize/4, borderBottomWidth: renderSize/4, borderRightWidth: renderSize/3 }]} />
          {/* Eye */}
          <View style={[styles.eye, { right: renderSize/5, top: renderSize/5 }]} />
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
  body: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)'
  },
  tail: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderStyle: 'solid'
  },
  eye: {
    position: 'absolute',
    width: 4,
    height: 4,
    backgroundColor: '#000',
    borderRadius: 2
  },
  hungerBubble: {
    position: 'absolute',
    top: -25,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 2,
    borderWidth: 1,
    borderColor: '#ff0000',
    zIndex: 100
  },
  hungerIcon: {
    fontSize: 12
  }
})
