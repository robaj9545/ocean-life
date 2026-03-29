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
  icon: string
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
      <Text style={sb.icon}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
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
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
  icon: { fontSize: 16, width: 22, textAlign: 'center' },
  label: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.6)', letterSpacing: 0.8, textTransform: 'uppercase' },
  val: { fontSize: 11, fontWeight: '900', letterSpacing: 0.5 },
  track: { height: 8, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 4, overflow: 'hidden', position: 'relative' },
  fill: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 4 },
  gloss: { position: 'absolute', top: 0, left: 0, right: 0, height: 4, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 4 },
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
        <Plus color="#fff" size={12} strokeWidth={3.5} />
      </TouchableOpacity>
    </Animated.View>
  )
}

const cc = StyleSheet.create({
  chip: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 24, paddingLeft: 6, paddingRight: 6, paddingVertical: 6,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', gap: 6,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8 },
      android: { elevation: 6 },
    }),
  },
  iconWrap: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  val: { fontSize: 15, fontWeight: '900', letterSpacing: 0.5, minWidth: 40 },
  plus: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
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
        <ChevronUp color="rgba(255,255,255,0.4)" size={14} />
      </View>
    </TouchableOpacity>
  )
}

const lv = StyleSheet.create({
  wrap: {
    backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8 },
      android: { elevation: 6 },
    }),
  },
  inner: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 8, gap: 8 },
  circle: { width: 36, height: 36, borderRadius: 18, overflow: 'hidden' },
  circleGrad: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  lvNum: { color: '#fff', fontWeight: '900', fontSize: 16, letterSpacing: -0.5 },
  xpCol: { flexDirection: 'column', gap: 3 },
  xpLabel: { fontSize: 9, fontWeight: '800', color: '#00E5FF', letterSpacing: 1, textTransform: 'uppercase' },
  barTrack: { width: 72, height: 5, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#00E5FF', borderRadius: 3 },
  xpSub: { fontSize: 8, color: 'rgba(255,255,255,0.4)', fontWeight: '600' },
})

// ─── BalancePill ────────────────────────────────────────────────────────────
export function BalancePill({ coins }: { coins: number }) {
  return (
    <View style={bp.pill}>
      <Coins color="#FFD700" size={14} strokeWidth={2.5} />
      <Text style={bp.text}>{Math.floor(coins).toLocaleString()}</Text>
    </View>
  )
}
const bp = StyleSheet.create({
  pill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,215,0,0.12)', borderWidth: 1, borderColor: 'rgba(255,215,0,0.25)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  text: { color: '#FFD700', fontSize: 13, fontWeight: '900' },
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
  track: { height: 4, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' },
  fill: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 2 },
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

  return (
    <Animated.View style={[xr.wrap, { transform: [{ scale: scaleAnim }] }]}>
      <Animated.View style={[xr.spinRing, { transform: [{ rotate }] }]}>
        <LinearGradient
          colors={['#00E5FF', 'transparent', '#B29DFF', 'transparent']}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>
      <View style={xr.inner}>
        <LinearGradient colors={['#0A2A6E', '#0D4FA0']} style={xr.innerGrad}>
          <Zap color="#FFD700" size={18} strokeWidth={2.5} style={{ marginBottom: 2 }} />
          <Text style={xr.levelNum}>{level}</Text>
          <Text style={xr.levelLabel}>NÍVEL</Text>
        </LinearGradient>
      </View>
    </Animated.View>
  )
}
const xr = StyleSheet.create({
  wrap: { width: 140, height: 140, alignItems: 'center', justifyContent: 'center' },
  spinRing: { position: 'absolute', width: 140, height: 140, borderRadius: 70, opacity: 0.8 },
  inner: { width: 130, height: 130, borderRadius: 65, padding: 4, backgroundColor: '#020D1F' },
  innerGrad: { flex: 1, borderRadius: 60, alignItems: 'center', justifyContent: 'center' },
  levelNum: { fontSize: 48, fontWeight: '900', color: '#fff', letterSpacing: -2 },
  levelLabel: { fontSize: 12, fontWeight: '900', color: 'rgba(255,255,255,0.5)', letterSpacing: 2 },
})
