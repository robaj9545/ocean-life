import { LinearGradient } from 'expo-linear-gradient'
import { Zap, Trophy, Crown, Skull, Waves } from 'lucide-react-native'
import React, { useEffect, useRef } from 'react'
import { Animated, Platform, StyleSheet, Text, View } from 'react-native'
import { scale, fonts, spacing, radius, iconSize } from '../../utils/responsive'

// ─── XPRing ──────────────────────────────────────────────────────────────────
export function XPRing({ level, pct }: { level: number; pct: number }) {
  const spinAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.7)).current

  useEffect(() => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 9 }).start()
    Animated.loop(
      Animated.timing(spinAnim, { toValue: 1, duration: 8000, useNativeDriver: true }),
    ).start()
  }, [])

  const rotate = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] })
  const ringSize = scale(105)
  const innerSize = scale(85)

  return (
    <Animated.View style={[xp.wrap, { width: ringSize, height: ringSize, transform: [{ scale: scaleAnim }] }]}>
      <Animated.View style={[xp.spinRing, { width: ringSize, height: ringSize, borderRadius: ringSize / 2, transform: [{ rotate }] }]}>
        <LinearGradient
          colors={['#00E5FF', 'transparent', '#B29DFF', 'transparent']}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      <View style={[xp.inner, { width: innerSize, height: innerSize, borderRadius: innerSize / 2 }]}>
        <LinearGradient colors={['#0A2A6E', '#0D4FA0']} style={[xp.innerGrad, { borderRadius: innerSize / 2 - scale(4) }]}>
          <Zap color="#FFD700" size={iconSize.md} strokeWidth={2.5} style={{ marginBottom: 2 }} />
          <Text style={xp.levelNum}>{level}</Text>
          <Text style={xp.levelLabel}>NÍVEL</Text>
        </LinearGradient>
      </View>

      <View style={xp.arcMask}>
        <View style={[xp.arcFill, { width: `${pct}%`, backgroundColor: '#00E5FF' }]} />
      </View>
    </Animated.View>
  )
}

const xp = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  spinRing: {
    position: 'absolute',
    overflow: 'hidden',
  },
  inner: {
    overflow: 'hidden',
    zIndex: 2,
    ...Platform.select({
      ios: { shadowColor: '#00E5FF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 10 },
      android: { elevation: 8 },
    }),
  },
  innerGrad: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0,229,255,0.3)',
  },
  levelNum: { fontSize: fonts.hero, fontWeight: '900', color: '#fff', lineHeight: fonts.hero + 2 },
  levelLabel: { fontSize: fonts.xxs, fontWeight: '900', color: 'rgba(255,255,255,0.5)', letterSpacing: 2 },
  arcMask: {
    position: 'absolute',
    bottom: scale(-2),
    left: spacing.sm,
    right: spacing.sm,
    height: scale(6),
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: radius.xs,
    overflow: 'hidden',
  },
  arcFill: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: radius.xs },
})

// ─── StatCard ────────────────────────────────────────────────────────────────
export function StatCard({
  icon,
  value,
  label,
  color,
  index,
}: {
  icon: React.ReactNode
  value: string | number
  label: string
  color: string
  index: number
}) {
  const enter = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.spring(enter, {
      toValue: 1,
      delay: 100 + index * 80,
      useNativeDriver: true,
      tension: 55,
      friction: 9,
    }).start()
  }, [])

  return (
    <Animated.View
      style={[
        st.card,
        {
          opacity: enter,
          transform: [{ scale: enter.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }],
        },
      ]}
    >
      <View style={[st.iconWrap, { backgroundColor: `${color}22`, borderColor: `${color}44` }]}>
        {icon}
      </View>
      <Text style={[st.value, { color }]}>{value}</Text>
      <Text style={st.label}>{label}</Text>
    </Animated.View>
  )
}

const st = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    gap: spacing.xs,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 5 },
      android: { elevation: 4 },
    }),
  },
  iconWrap: {
    width: scale(34),
    height: scale(34),
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  value: { fontSize: fonts.xl, fontWeight: '900', letterSpacing: -0.5 },
  label: {
    fontSize: fonts.xxs,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
})

// ─── AchievementRow ──────────────────────────────────────────────────────────
export function AchievementRow({ fishes, deadFishes }: { fishes: any[]; deadFishes: any[] }) {
  const adults = fishes.filter(f => f.stage === 'adult').length
  const items = [
    { icon: <Trophy color="#FFD700" size={iconSize.md} strokeWidth={2} />, label: 'Primeiro Peixe', done: fishes.length >= 1 },
    { icon: <Crown color="#FFD700" size={iconSize.md} strokeWidth={2} />, label: '5 Adultos', done: adults >= 5 },
    { icon: <Skull color="#FFD700" size={iconSize.md} strokeWidth={2} />, label: '1 Morte', done: deadFishes.length >= 1 },
    { icon: <Waves color="#FFD700" size={iconSize.md} strokeWidth={2} />, label: '10 Peixes', done: fishes.length >= 10 },
  ]

  return (
    <View style={ar.row}>
      {items.map((it, i) => (
        <View key={i} style={[ar.badge, !it.done && ar.badgeLocked]}>
          <View style={!it.done ? { opacity: 0.25 } : undefined}>
            {it.icon}
          </View>
          <Text style={[ar.label, !it.done && ar.lockedLabel]} numberOfLines={1}>{it.label}</Text>
        </View>
      ))}
    </View>
  )
}

const ar = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  badge: {
    flexBasis: '22%',
    flexGrow: 1,
    backgroundColor: 'rgba(255,215,0,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.25)',
    borderRadius: radius.md,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.xxs,
  },
  badgeLocked: { backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' },
  label: { fontSize: fonts.xxs, fontWeight: '800', color: 'rgba(255,215,0,0.8)', letterSpacing: 0.3, textAlign: 'center' },
  lockedLabel: { color: 'rgba(255,255,255,0.25)' },
})
