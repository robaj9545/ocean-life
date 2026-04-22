import { LinearGradient } from 'expo-linear-gradient'
import { Star, Sprout, Heart, Drumstick, Sparkles, AlertTriangle, CheckCircle } from 'lucide-react-native'
import React, { useEffect, useRef } from 'react'
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import BlueTangSVG from '../../components/fishes/BlueTang'
import ClownfishSVG from '../../components/fishes/Clownfish'
import { MiniBar } from '../ui/Stats'
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

// ─── FishCard ────────────────────────────────────────────────────────────────
export function FishCard({ item, index }: { item: any; index: number }) {
  const enter = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.spring(enter, {
      toValue: 1,
      delay: index * 50,
      useNativeDriver: true,
      tension: 55,
      friction: 9,
    }).start()
  }, [])

  const isHungry = item.hunger <= 40
  const isAdult = item.stage === 'adult'
  const speciesLabel = item.nickname || getSpeciesName(item.species)
  const accentColor = item.species === 'clownfish' ? '#FF7043' : '#29B6F6'

  return (
    <Animated.View
      style={[
        fc.wrap,
        {
          opacity: enter,
          transform: [
            { scale: enter.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) },
          ],
        },
      ]}
    >
      {/* Accent top bar */}
      <View style={[fc.accentBar, { backgroundColor: accentColor }]} />

      {/* Fish preview */}
      <View style={fc.preview}>
        <LinearGradient
          colors={[`${accentColor}22`, 'transparent']}
          style={StyleSheet.absoluteFillObject}
        />
        {renderPreview(item.species, scale(48))}
      </View>

      {/* Info */}
      <View style={fc.info}>
        <Text style={fc.name} numberOfLines={1}>{speciesLabel}</Text>

        <View style={fc.stagePill}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xxs }}>
            {isAdult
              ? <Star color="#FFD700" size={iconSize.xs} strokeWidth={2.5} />
              : <Sprout color="#00E5A0" size={iconSize.xs} strokeWidth={2.5} />
            }
            <Text style={[fc.stageText, { color: isAdult ? '#FFD700' : '#00E5A0' }]}>
              {isAdult ? 'ADULTO' : 'FILHOTE'}
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View style={fc.stats}>
          <View style={fc.statRow}>
            <Heart color="#FF6B6B" size={iconSize.xs} strokeWidth={2.5} />
            <MiniBar value={item.health ?? 100} color="#FF6B6B" />
          </View>
          <View style={fc.statRow}>
            <Drumstick color={isHungry ? '#FF4444' : '#FFA500'} size={iconSize.xs} strokeWidth={2.5} />
            <MiniBar value={item.hunger} color={isHungry ? '#FF4444' : '#FFA500'} />
          </View>
          <View style={fc.statRow}>
            <Sparkles color="#00E5A0" size={iconSize.xs} strokeWidth={2.5} />
            <MiniBar value={item.happiness} color="#00E5A0" />
          </View>
        </View>

        {/* Status badge */}
        <View style={[fc.badge, { backgroundColor: isHungry ? 'rgba(255,68,68,0.2)' : 'rgba(50,205,50,0.15)' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xxs }}>
            {isHungry
              ? <AlertTriangle color="#FF6B6B" size={iconSize.xs} strokeWidth={2.5} />
              : <CheckCircle color="#00E5A0" size={iconSize.xs} strokeWidth={2.5} />
            }
            <Text style={[fc.badgeText, { color: isHungry ? '#FF6B6B' : '#00E5A0' }]}>
              {isHungry ? 'Com Fome' : 'Satisfeito'}
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  )
}

const fc = StyleSheet.create({
  wrap: {
    width: '46%',
    maxWidth: scale(160),
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: radius.lg,
    margin: '2%',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6 },
      android: { elevation: 5 },
    }),
  },
  accentBar: { height: scale(3), width: '100%' },
  preview: {
    height: scale(68),
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  info: { padding: spacing.sm, gap: spacing.xs },
  name: { fontSize: fonts.sm, fontWeight: '900', color: '#fff', letterSpacing: 0.2 },
  stagePill: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: radius.xs,
  },
  stageText: { fontSize: fonts.xxs, fontWeight: '800', letterSpacing: 0.5 },
  stats: { gap: spacing.xs },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  badge: { borderRadius: radius.xs, paddingHorizontal: spacing.xs, paddingVertical: spacing.xxs, alignItems: 'center' },
  badgeText: { fontSize: fonts.xxs, fontWeight: '800', letterSpacing: 0.3 },
})

// ─── SummaryBar ─────────────────────────────────────────────────────────────
export function SummaryBar({ fishes }: { fishes: any[] }) {
  const adults = fishes.filter(f => f.stage === 'adult').length
  const babies = fishes.filter(f => f.stage === 'baby').length
  const hungry = fishes.filter(f => f.hunger <= 40).length

  const stats = [
    { icon: <Star color="#FFD700" size={iconSize.xs} strokeWidth={2.5} />, label: 'ADULTOS', value: adults, color: '#FFD700' },
    { icon: <Sprout color="#00E5A0" size={iconSize.xs} strokeWidth={2.5} />, label: 'FILHOTES', value: babies, color: '#00E5A0' },
    { icon: <AlertTriangle color="#FF6B6B" size={iconSize.xs} strokeWidth={2.5} />, label: 'COM FOME', value: hungry, color: '#FF6B6B' },
  ]

  return (
    <View style={sum.row}>
      {stats.map(st => (
        <View key={st.label} style={sum.chip}>
          {st.icon}
          <Text style={[sum.val, { color: st.color }]}>{st.value}</Text>
          <Text style={sum.label}>{st.label}</Text>
        </View>
      ))}
    </View>
  )
}

const sum = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexBasis: '30%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: radius.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  val: { fontSize: fonts.lg, fontWeight: '900' },
  label: { fontSize: fonts.xxs, fontWeight: '700', color: 'rgba(255,255,255,0.4)', letterSpacing: 0.8, flex: 1 },
})
