import { LinearGradient } from 'expo-linear-gradient'
import React, { useEffect, useRef } from 'react'
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import BlueTangSVG from '../../components/fishes/BlueTang'
import ClownfishSVG from '../../components/fishes/Clownfish'
import { FishEntity } from '../../store/useGameStore'

const renderPreview = (species: string, size: number) => {
  if (species === 'bluetang') return <BlueTangSVG size={size} />
  if (species === 'spiderfish') return <Text style={{fontSize: size * 0.7}}>🕷️</Text>
  if (species === 'lionfish') return <Text style={{fontSize: size * 0.7}}>🦁</Text>
  if (species === 'dragonfish') return <Text style={{fontSize: size * 0.7}}>🐉</Text>
  if (species === 'ghostshark') return <Text style={{fontSize: size * 0.7}}>👻</Text>
  if (species === 'leviathan') return <Text style={{fontSize: size * 0.7}}>🦑</Text>
  return <ClownfishSVG size={size} />
}

const speciesNameMap: Record<string, string> = { clownfish: 'Palhaço', bluetang: 'Cirurgião', spiderfish: 'Peixe Aranha', lionfish: 'Peixe-Leão', dragonfish: 'Peixe-Dragão', ghostshark: 'Tubarão-Fantasma', leviathan: 'Leviatã' }

// ─── Pulsing Heart ───────────────────────────────────────────────────────────
export function PulseHeart({ active }: { active: boolean }) {
  const pulse = useRef(new Animated.Value(1)).current
  const glow = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (active) {
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.spring(pulse, { toValue: 1.3, useNativeDriver: true, tension: 200 }),
            Animated.timing(glow, { toValue: 1, duration: 300, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.spring(pulse, { toValue: 1, useNativeDriver: true, tension: 200 }),
            Animated.timing(glow, { toValue: 0, duration: 300, useNativeDriver: true }),
          ]),
        ]),
      ).start()
    } else {
      pulse.setValue(1)
      glow.setValue(0)
    }
  }, [active])

  const glowOp = glow.interpolate({ inputRange: [0, 1], outputRange: [0, 0.6] })

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: 50, height: 50 }}>
      <Animated.View style={[ph.glow, { opacity: glowOp, transform: [{ scale: pulse }] }]} />
      <Animated.Text style={[ph.heart, { transform: [{ scale: pulse }] }]}>
        {active ? '💕' : '🤍'}
      </Animated.Text>
    </View>
  )
}
const ph = StyleSheet.create({
  glow: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FF69B4',
  },
  heart: { fontSize: 28, zIndex: 1 },
})

// ─── Fish Slot ────────────────────────────────────────────────────────────────
export function FishSlot({ fish, label }: { fish: FishEntity | undefined; label: string }) {
  const shimmer = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (!fish) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmer, { toValue: 1, duration: 1200, useNativeDriver: true }),
          Animated.timing(shimmer, { toValue: 0, duration: 1200, useNativeDriver: true }),
        ]),
      ).start()
    }
  }, [fish])

  const emptyOp = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.9] })

  return (
    <View style={fs.wrap}>
      <Text style={fs.label}>{label}</Text>
      {fish ? (
        <View style={fs.filled}>
          <LinearGradient colors={['rgba(255,105,180,0.2)', 'rgba(100,149,237,0.2)']} style={fs.grad} />
          {renderPreview(fish.species, 56)}
          <Text style={fs.species} numberOfLines={1}>
            {fish.nickname || speciesNameMap[fish.species] || fish.species}
          </Text>
        </View>
      ) : (
        <Animated.View style={[fs.empty, { opacity: emptyOp }]}>
          <Text style={fs.qmark}>?</Text>
        </Animated.View>
      )}
    </View>
  )
}

const fs = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 6 },
  label: {
    fontSize: 9,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  filled: {
    width: 80,
    height: 90,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,105,180,0.5)',
    overflow: 'hidden',
    gap: 2,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  grad: { ...StyleSheet.absoluteFillObject },
  species: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  empty: {
    width: 80,
    height: 90,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  qmark: { fontSize: 28, color: 'rgba(255,255,255,0.25)' },
})

// ─── Fish Card ────────────────────────────────────────────────────────────────
export function FishCard({
  fish,
  isSelected,
  onPress,
  index,
}: {
  fish: FishEntity
  isSelected: boolean
  onPress: () => void
  index: number
}) {
  const scaleAnim = useRef(new Animated.Value(0)).current
  const pressAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay: index * 60,
      useNativeDriver: true,
      tension: 60,
      friction: 9,
    }).start()
  }, [])

  const onPressIn = () =>
    Animated.spring(pressAnim, { toValue: 0.9, useNativeDriver: true, tension: 300 }).start()
  const onPressOut = () =>
    Animated.spring(pressAnim, { toValue: 1, useNativeDriver: true, tension: 300 }).start()

  return (
    <Animated.View style={{ flexBasis: '28%', flexGrow: 1, maxWidth: 120, margin: 4, transform: [{ scale: scaleAnim }, { scale: pressAnim }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
        style={[fc.card, isSelected && fc.cardSel]}
      >
        {isSelected && (
          <LinearGradient
            colors={['rgba(255,105,180,0.3)', 'rgba(255,105,180,0.05)']}
            style={StyleSheet.absoluteFillObject}
          />
        )}
        <View style={fc.preview}>
          {renderPreview(fish.species, 40)}
        </View>
        <Text style={fc.name} numberOfLines={1}>
          {fish.nickname || speciesNameMap[fish.species] || fish.species}
        </Text>
        {isSelected && (
          <View style={fc.checkBadge}>
            <Text style={{ fontSize: 10 }}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  )
}

const fc = StyleSheet.create({
  card: {
    width: '100%',
    aspectRatio: 0.9,
    borderRadius: 14,
    padding: 8,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 5 },
      android: { elevation: 4 },
    }),
  },
  cardSel: {
    borderColor: '#FF69B4',
    borderWidth: 2,
  },
  preview: {
    width: '100%',
    height: 50,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginBottom: 5,
  },
  name: { fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.7)', letterSpacing: 0.3 },
  checkBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FF69B4',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
