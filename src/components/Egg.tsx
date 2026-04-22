import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Egg as EggIcon } from 'lucide-react-native'
import { iconSize } from '../utils/responsive'

export default function Egg(props: any) {
  const { position } = props

  return (
    <View style={[styles.egg, { left: position.x, top: position.y }]}>
       <EggIcon color="#FFF8DC" size={iconSize.lg} strokeWidth={1.5} />
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
