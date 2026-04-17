import React, { useRef } from 'react'
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'

// ─── NavButton ───────────────────────────────────────────────────────────────
export function NavButton({
  icon,
  label,
  onPress,
  accent,
  badge,
}: {
  icon: React.ReactNode
  label: string
  onPress: () => void
  accent: string
  badge?: number | boolean
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current
  const onPressIn = () => Animated.spring(scaleAnim, { toValue: 0.88, useNativeDriver: true, tension: 300 }).start()
  const onPressOut = () => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 300 }).start()

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable style={nb.btn} onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
        <LinearGradient
          colors={[`${accent}55`, `${accent}22`]}
          style={nb.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
        <View style={[nb.iconWrap, { borderColor: `${accent}80` }]}>
           {icon}
           {!!badge && (
             <View style={nb.badge}>
               {typeof badge === 'number' && badge > 0 ? <Text style={nb.badgeText}>{badge}</Text> : null}
             </View>
           )}
        </View>
        <Text style={nb.label}>{label}</Text>
      </Pressable>
    </Animated.View>
  )
}

const nb = StyleSheet.create({
  btn: { alignItems: 'center', width: 60, paddingVertical: 10, borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(0,0,0,0.5)', position: 'relative',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.5, shadowRadius: 8 },
      android: { elevation: 8 },
    }),
  },
  gradient: { ...StyleSheet.absoluteFillObject },
  iconWrap: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, backgroundColor: 'rgba(255,255,255,0.07)', marginBottom: 4, position: 'relative' },
  label: { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.7)', letterSpacing: 0.5, textTransform: 'uppercase' },
  badge: { position: 'absolute', top: -4, right: -4, backgroundColor: '#FF3B30', minWidth: 14, height: 14, borderRadius: 7, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#fff' },
  badgeText: { color: '#fff', fontSize: 8, fontWeight: '900' },
})

// ─── TabBar ─────────────────────────────────────────────────────────────────
export function TabBar({
  tabs,
  active,
  setActive,
  deadCount,
  vertical,
}: {
  tabs: { id: string; icon: React.ReactNode; label: string; accent: string }[]
  active: string
  setActive: (t: any) => void
  deadCount?: number
  vertical?: boolean
}) {
  return (
    <View style={[tb.row, vertical && tb.col]}>
      {tabs.map(t => {
        const isActive = active === t.id
        return (
          <TouchableOpacity
            key={t.id}
            style={[tb.tab, vertical && tb.tabVertical, isActive && { borderColor: `${t.accent}80`, backgroundColor: `${t.accent}18` }]}
            onPress={() => setActive(t.id)}
            activeOpacity={0.75}
          >
            <View style={{ flexDirection: vertical ? 'column' : 'row', alignItems: 'center', gap: 5 }}>
              <View style={{ opacity: isActive ? 1 : 0.4 }}>
                {React.cloneElement(t.icon as any, { color: isActive ? t.accent : '#fff' })}
              </View>
              <Text style={[tb.label, vertical && tb.labelVertical, isActive && { color: t.accent }]} numberOfLines={1}>{t.label}</Text>
              {t.id === 'cemetery' && deadCount && deadCount > 0 ? (
                <View style={[tb.dot, vertical && tb.dotVertical, { backgroundColor: t.accent }]}>
                   <Text style={tb.dotText}>{deadCount}</Text>
                </View>
              ) : null}
            </View>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const tb = StyleSheet.create({
  row: { flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 10, gap: 8, backgroundColor: 'rgba(0,0,0,0.2)' },
  col: { flexDirection: 'column', height: '100%', paddingHorizontal: 10, alignContent: 'center', justifyContent: 'flex-start', flex: 1 },
  tab: { flex: 1, paddingVertical: 8, paddingHorizontal: 6, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.04)', alignItems: 'center' },
  tabVertical: { flex: 0, width: '100%', paddingVertical: 10, marginBottom: 4 },
  label: { fontSize: 11, fontWeight: '800', color: 'rgba(255,255,255,0.45)', letterSpacing: 0.3 },
  labelVertical: { fontSize: 10 },
  dot: { width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  dotVertical: { position: 'absolute', top: -4, right: -4 },
  dotText: { fontSize: 9, fontWeight: '900', color: '#fff' },
})
