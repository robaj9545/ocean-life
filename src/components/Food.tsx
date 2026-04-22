import React from 'react'
import { View, StyleSheet } from 'react-native'
import { scale } from '../utils/responsive'

const PELLET_SIZE = scale(5)
const CONTAINER_SIZE = scale(10)

export default function Food({ position }: any) {
  return (
    <View style={[styles.foodContainer, { left: position.x - CONTAINER_SIZE / 2, top: position.y - CONTAINER_SIZE / 2 }]}>
      <View style={[styles.pellet, { backgroundColor: '#ff6347', transform: [{ translateY: -2 }] }]} />
      <View style={[styles.pellet, { backgroundColor: '#ffd700', transform: [{ translateX: -3 }, { translateY: 2 }] }]} />
      <View style={[styles.pellet, { backgroundColor: '#98fb98', transform: [{ translateX: 3 }, { translateY: 2 }] }]} />
    </View>
  )
}

const styles = StyleSheet.create({
  foodContainer: {
    position: 'absolute',
    width: CONTAINER_SIZE,
    height: CONTAINER_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pellet: {
    position: 'absolute',
    width: PELLET_SIZE,
    height: PELLET_SIZE,
    borderRadius: PELLET_SIZE / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 1,
    elevation: 2,
  }
})
