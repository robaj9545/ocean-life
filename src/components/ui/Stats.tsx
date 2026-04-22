import React, { useEffect, useRef } from 'react'
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Plus, Coins, Zap, ChevronUp } from 'lucide-react-native'
import { scale, moderateScale, fontScale, spacing, fonts, radius, iconSize } from '../../utils/responsive'

// ─── StatBar ─────────────────────────────────────────────────────────────────
export function StatBar({
  label,
  value,
  color,
  icon,
}: {
  label: string
  value: number
  color: string
  icon: React.ReactNode
}) {
  const anim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.spring(anim, {
      toValue: Math.min(Math.max(value, 0), 100) / 100,
      useNativeDriver: false,
      tension: 40,
      friction: 8,
    }).start()
  }, [value])

  const barWidth = anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] })

  return (
    <View style={sb.row}>
      <View style={sb.iconWrap}>{icon}</View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs }}>
          <Text style={sb.label}>{label}</Text>
          <Text style={[sb.val, { color }]}>{Math.floor(value)}%</Text>
        </View>
        <View style={sb.track}>
          <Animated.View style={[sb.fill, { width: barWidth, backgroundColor: color }]} />
          <View style={sb.gloss} />
        </View>
      </View>
    </View>
  )
}

const sb = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, gap: spacing.sm },
  iconWrap: { width: scale(22), alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: fonts.md, fontWeight: '700', color: 'rgba(255,255,255,0.6)', letterSpacing: 0.8, textTransform: 'uppercase' },
  val: { fontSize: fonts.md, fontWeight: '900', letterSpacing: 0.5 },
  track: { height: scale(8), backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: radius.xs, overflow: 'hidden', position: 'relative' },
  fill: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: radius.xs },
  gloss: { position: 'absolute', top: 0, left: 0, right: 0, height: scale(4), backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: radius.xs },
})

// ─── CurrencyChip ───────────────────────────────────────────────────────────
export function CurrencyChip({
  icon,
  value,
  color,
  onAdd,
}: {
  icon: React.ReactNode
  value: number
  color: string
  onAdd: () => void
}) {
  const pressAnim = useRef(new Animated.Value(1)).current

  const onPressIn = () => Animated.spring(pressAnim, { toValue: 0.92, useNativeDriver: true, tension: 300 }).start()
  const onPressOut = () => Animated.spring(pressAnim, { toValue: 1, useNativeDriver: true, tension: 300 }).start()

  return (
    <Animated.View style={[cc.chip, { transform: [{ scale: pressAnim }] }]}>
      <View style={[cc.iconWrap, { backgroundColor: `${color}22` }]}>{icon}</View>
      <Text style={[cc.val, { color }]}>{Math.floor(value).toLocaleString()}</Text>
      <TouchableOpacity style={[cc.plus, { backgroundColor: color }]} onPress={onAdd} onPressIn={onPressIn} onPressOut={onPressOut}>
        <Plus color="#fff" size={iconSize.xs} strokeWidth={3.5} />
      </TouchableOpacity>
    </Animated.View>
  )
}

const cc = StyleSheet.create({
  chip: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: radius.pill, paddingLeft: spacing.xs, paddingRight: spacing.xs, paddingVertical: spacing.xs,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', gap: spacing.xs,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8 },
      android: { elevation: 6 },
    }),
  },
  iconWrap: { width: scale(26), height: scale(26), borderRadius: scale(13), alignItems: 'center', justifyContent: 'center' },
  val: { fontSize: fonts.lg, fontWeight: '900', letterSpacing: 0.5, minWidth: scale(36) },
  plus: { width: scale(20), height: scale(20), borderRadius: scale(10), alignItems: 'center', justifyContent: 'center' },
})

// ─── LevelBadge ─────────────────────────────────────────────────────────────
export function LevelBadge({ level, xp, onPress }: { level: number; xp: number; onPress: () => void }) {
  const maxXp = level * 1000
  const pct = Math.min((xp / maxXp) * 100, 100)

  return (
    <TouchableOpacity style={lv.wrap} onPress={onPress} activeOpacity={0.85}>
      <View style={lv.inner}>
        <View style={lv.circle}>
          <LinearGradient colors={['#00E5FF', '#0090FF']} style={lv.circleGrad}>
            <Text style={lv.lvNum}>{level}</Text>
          </LinearGradient>
        </View>
        <View style={lv.xpCol}>
          <Text style={lv.xpLabel}>NÍVEL {level}</Text>
          <View style={lv.barTrack}>
            <View style={[lv.barFill, { width: `${pct}%` }]} />
          </View>
          <Text style={lv.xpSub}>{xp} / {maxXp} XP</Text>
        </View>
        <ChevronUp color="rgba(255,255,255,0.4)" size={iconSize.xs} />
      </View>
    </TouchableOpacity>
  )
}

const lv = StyleSheet.create({
  wrap: {
    backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: radius.xl, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8 },
      android: { elevation: 6 },
    }),
  },
  inner: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.xs, paddingHorizontal: spacing.sm, gap: spacing.sm },
  circle: { width: scale(34), height: scale(34), borderRadius: scale(17), overflow: 'hidden' },
  circleGrad: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  lvNum: { color: '#fff', fontWeight: '900', fontSize: fonts.lg, letterSpacing: -0.5 },
  xpCol: { flexDirection: 'column', gap: spacing.xxs },
  xpLabel: { fontSize: fonts.xxs, fontWeight: '800', color: '#00E5FF', letterSpacing: 1, textTransform: 'uppercase' },
  barTrack: { width: scale(65), height: scale(5), backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: radius.xs, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#00E5FF', borderRadius: radius.xs },
  xpSub: { fontSize: fontScale(8), color: 'rgba(255,255,255,0.4)', fontWeight: '600' },
})

// ─── BalancePill ────────────────────────────────────────────────────────────
export function BalancePill({ coins }: { coins: number }) {
  return (
    <View style={bp.pill}>
      <Coins color="#FFD700" size={iconSize.xs} strokeWidth={2.5} />
      <Text style={bp.text}>{Math.floor(coins).toLocaleString()}</Text>
    </View>
  )
}
const bp = StyleSheet.create({
  pill: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, backgroundColor: 'rgba(255,215,0,0.12)', borderWidth: 1, borderColor: 'rgba(255,215,0,0.25)', paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.xl },
  text: { color: '#FFD700', fontSize: fonts.base, fontWeight: '900' },
})

// ─── MiniBar ────────────────────────────────────────────────────────────────
export function MiniBar({ value, color }: { value: number; color: string }) {
  const anim = useRef(new Animated.Value(0)).current
  useEffect(() => {
    Animated.spring(anim, { toValue: Math.max(0, Math.min(value, 100)) / 100, useNativeDriver: false, tension: 40, friction: 8 }).start()
  }, [value])
  const w = anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] })
  return (
    <View style={mb.track}>
      <Animated.View style={[mb.fill, { width: w, backgroundColor: color }]} />
    </View>
  )
}
const mb = StyleSheet.create({
  track: { height: scale(4), backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: radius.xxs, overflow: 'hidden', flex: 1 },
  fill: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: radius.xxs },
})

// ─── XPRing ─────────────────────────────────────────────────────────────────
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
  const ringSize = scale(130)
  const innerSize = scale(120)

  return (
    <Animated.View style={[xr.wrap, { width: ringSize, height: ringSize, transform: [{ scale: scaleAnim }] }]}>
      <Animated.View style={[xr.spinRing, { width: ringSize, height: ringSize, borderRadius: ringSize / 2, transform: [{ rotate }] }]}>
        <LinearGradient
          colors={['#00E5FF', 'transparent', '#B29DFF', 'transparent']}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>
      <View style={[xr.inner, { width: innerSize, height: innerSize, borderRadius: innerSize / 2 }]}>
        <LinearGradient colors={['#0A2A6E', '#0D4FA0']} style={[xr.innerGrad, { borderRadius: innerSize / 2 - scale(4) }]}>
          <Zap color="#FFD700" size={iconSize.md} strokeWidth={2.5} style={{ marginBottom: 2 }} />
          <Text style={xr.levelNum}>{level}</Text>
          <Text style={xr.levelLabel}>NÍVEL</Text>
        </LinearGradient>
      </View>
    </Animated.View>
  )
}
const xr = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  spinRing: { position: 'absolute', opacity: 0.8 },
  inner: { padding: scale(4), backgroundColor: '#020D1F' },
  innerGrad: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  levelNum: { fontSize: fonts.display, fontWeight: '900', color: '#fff', letterSpacing: -2 },
  levelLabel: { fontSize: fonts.sm, fontWeight: '900', color: 'rgba(255,255,255,0.5)', letterSpacing: 2 },
})
