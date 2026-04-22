import { LinearGradient } from 'expo-linear-gradient'
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
  const speciesLabel = item.nickname || speciesNameMap[item.species] || item.species
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
        {renderPreview(item.species, 52)}
      </View>

      {/* Info */}
      <View style={fc.info}>
        <Text style={fc.name} numberOfLines={1}>{speciesLabel}</Text>

        <View style={fc.stagePill}>
          <Text style={[fc.stageText, { color: isAdult ? '#FFD700' : '#00E5A0' }]}>
            {isAdult ? '⭐ ADULTO' : '🌱 FILHOTE'}
          </Text>
        </View>

        {/* Stats */}
        <View style={fc.stats}>
          <View style={fc.statRow}>
            <Text style={fc.statIcon}>❤️</Text>
            <MiniBar value={item.health ?? 100} color="#FF6B6B" />
          </View>
          <View style={fc.statRow}>
            <Text style={fc.statIcon}>🍖</Text>
            <MiniBar value={item.hunger} color={isHungry ? '#FF4444' : '#FFA500'} />
          </View>
          <View style={fc.statRow}>
            <Text style={fc.statIcon}>✨</Text>
            <MiniBar value={item.happiness} color="#00E5A0" />
          </View>
        </View>

        {/* Status badge */}
        <View style={[fc.badge, { backgroundColor: isHungry ? 'rgba(255,68,68,0.2)' : 'rgba(50,205,50,0.15)' }]}>
          <Text style={[fc.badgeText, { color: isHungry ? '#FF6B6B' : '#00E5A0' }]}>
            {isHungry ? '⚠ Com Fome' : '✓ Satisfeito'}
          </Text>
        </View>
      </View>
    </Animated.View>
  )
}

const fc = StyleSheet.create({
  wrap: {
    width: '46%', // makes it responsive with flexWrap
    maxWidth: 160,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    margin: '2%',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6 },
      android: { elevation: 5 },
    }),
  },
  accentBar: { height: 3, width: '100%' },
  preview: {
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  info: { padding: 8, gap: 5 },
  name: { fontSize: 12, fontWeight: '900', color: '#fff', letterSpacing: 0.2 },
  stagePill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 5,
    paddingVertical: 2,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 6,
  },
  stageText: { fontSize: 8, fontWeight: '800', letterSpacing: 0.5 },
  stats: { gap: 4 },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statIcon: { fontSize: 9, width: 14 },
  badge: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3, alignItems: 'center' },
  badgeText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.3 },
})

// ─── SummaryBar ─────────────────────────────────────────────────────────────
export function SummaryBar({ fishes }: { fishes: any[] }) {
  const adults = fishes.filter(f => f.stage === 'adult').length
  const babies = fishes.filter(f => f.stage === 'baby').length
  const hungry = fishes.filter(f => f.hunger <= 40).length

  const stats = [
    { label: 'ADULTOS', value: adults, color: '#FFD700', emoji: '⭐' },
    { label: 'FILHOTES', value: babies, color: '#00E5A0', emoji: '🌱' },
    { label: 'COM FOME', value: hungry, color: '#FF6B6B', emoji: '⚠️' },
  ]

  return (
    <View style={sum.row}>
      {stats.map(st => (
        <View key={st.label} style={sum.chip}>
          <Text style={sum.emoji}>{st.emoji}</Text>
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
    paddingHorizontal: 18,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  chip: {
    flexBasis: '30%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 8,
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  emoji: { fontSize: 12 },
  val: { fontSize: 15, fontWeight: '900' },
  label: { fontSize: 8, fontWeight: '700', color: 'rgba(255,255,255,0.4)', letterSpacing: 0.8, flex: 1 },
})
