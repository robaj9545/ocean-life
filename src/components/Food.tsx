import React from 'react'
import { View, StyleSheet } from 'react-native'

export default function Food({ position }: any) {
  return (
    <View style={[styles.food, { left: position.x, top: position.y }]} />
  )
}

const styles = StyleSheet.create({
  food: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#8B4513'
  }
})
