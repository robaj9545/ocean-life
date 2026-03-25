import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export default function Coin(props: any) {
  const { position } = props

  return (
    <View style={[styles.coin, { left: position.x, top: position.y }]}>
       <Text style={{fontSize: 20}}>🪙</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  coin: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center'
  }
})
