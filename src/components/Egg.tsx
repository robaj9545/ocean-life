import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export default function Egg(props: any) {
  const { position } = props

  return (
    <View style={[styles.egg, { left: position.x, top: position.y }]}>
       <Text style={{fontSize: 24}}>🥚</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  egg: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center'
  }
})
