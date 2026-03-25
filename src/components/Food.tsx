import React from 'react'
import { View, StyleSheet } from 'react-native'

export default function Food({ position }: any) {
  return (
    <View style={[styles.foodContainer, { left: position.x - 5, top: position.y - 5 }]}>
      <View style={[styles.pellet, { backgroundColor: '#ff6347', transform: [{ translateY: -2 }] }]} />
      <View style={[styles.pellet, { backgroundColor: '#ffd700', transform: [{ translateX: -3 }, { translateY: 2 }] }]} />
      <View style={[styles.pellet, { backgroundColor: '#98fb98', transform: [{ translateX: 3 }, { translateY: 2 }] }]} />
    </View>
  )
}

const styles = StyleSheet.create({
  foodContainer: {
    position: 'absolute',
    width: 10,
    height: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pellet: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 2.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 1,
    elevation: 2,
  }
})
