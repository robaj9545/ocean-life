import { LinearGradient } from 'expo-linear-gradient'
import { Heart, HeartOff, Check } from 'lucide-react-native'
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
import { getSpeciesName, getSpeciesIcon, getSpeciesColor } from '../../data/species'
import { scale, fonts, spacing, radius, iconSize } from '../../utils/responsive'

const renderPreview = (species: string, size: number) => {
  if (species === 'bluetang') return <BlueTangSVG size={size} />
  if (species === 'clownfish') return <ClownfishSVG size={size} />
  const Icon = getSpeciesIcon(species)
  const color = getSpeciesColor(species)
  if (Icon) return <Icon color={color} size={size * 0.7} strokeWidth={1.5} />
  return <ClownfishSVG size={size} />
}

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
  const heartSize = scale(46)

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: heartSize, height: heartSize }}>
      <Animated.View style={[ph.glow, { width: heartSize, height: heartSize, borderRadius: heartSize / 2, opacity: glowOp, transform: [{ scale: pulse }] }]} />
      <Animated.View style={{ transform: [{ scale: pulse }], zIndex: 1 }}>
        {active
          ? <Heart color="#FF69B4" size={iconSize.lg} strokeWidth={2} fill="#FF69B4" />
          : <HeartOff color="rgba(255,255,255,0.3)" size={iconSize.lg} strokeWidth={2} />
        }
      </Animated.View>
    </View>
  )
}
const ph = StyleSheet.create({
  glow: {
    position: 'absolute',
    backgroundColor: '#FF69B4',
  },
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
  const slotW = scale(75)
  const slotH = scale(85)

  return (
    <View style={fs.wrap}>
      <Text style={fs.label}>{label}</Text>
      {fish ? (
        <View style={[fs.filled, { width: slotW, height: slotH }]}>
          <LinearGradient colors={['rgba(255,105,180,0.2)', 'rgba(100,149,237,0.2)']} style={fs.grad} />
          {renderPreview(fish.species, scale(52))}
          <Text style={fs.species} numberOfLines={1}>
            {fish.nickname || getSpeciesName(fish.species)}
          </Text>
        </View>
      ) : (
        <Animated.View style={[fs.empty, { width: slotW, height: slotH, opacity: emptyOp }]}>
          <Text style={fs.qmark}>?</Text>
        </Animated.View>
      )}
    </View>
  )
}

const fs = StyleSheet.create({
  wrap: { alignItems: 'center', gap: spacing.xs },
  label: {
    fontSize: fonts.xxs,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  filled: {
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,105,180,0.5)',
    overflow: 'hidden',
    gap: spacing.xxs,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  grad: { ...StyleSheet.absoluteFillObject },
  species: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: fonts.xxs,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  empty: {
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  qmark: { fontSize: fonts.xxl, color: 'rgba(255,255,255,0.25)' },
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
    <Animated.View style={{ flexBasis: '28%', flexGrow: 1, maxWidth: scale(115), margin: spacing.xxs, transform: [{ scale: scaleAnim }, { scale: pressAnim }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
        style={[fcc.card, isSelected && fcc.cardSel]}
      >
        {isSelected && (
          <LinearGradient
            colors={['rgba(255,105,180,0.3)', 'rgba(255,105,180,0.05)']}
            style={StyleSheet.absoluteFillObject}
          />
        )}
        <View style={fcc.preview}>
          {renderPreview(fish.species, scale(38))}
        </View>
        <Text style={fcc.name} numberOfLines={1}>
          {fish.nickname || getSpeciesName(fish.species)}
        </Text>
        {isSelected && (
          <View style={fcc.checkBadge}>
            <Check color="#fff" size={iconSize.xs} strokeWidth={3} />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  )
}

const fcc = StyleSheet.create({
  card: {
    width: '100%',
    aspectRatio: 0.9,
    borderRadius: radius.md,
    padding: spacing.sm,
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
    height: scale(46),
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginBottom: spacing.xs,
  },
  name: { fontSize: fonts.sm, fontWeight: '800', color: 'rgba(255,255,255,0.7)', letterSpacing: 0.3 },
  checkBadge: {
    position: 'absolute',
    top: scale(5),
    right: scale(5),
    width: scale(18),
    height: scale(18),
    borderRadius: scale(9),
    backgroundColor: '#FF69B4',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
