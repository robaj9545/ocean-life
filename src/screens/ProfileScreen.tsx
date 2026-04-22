import { LinearGradient } from 'expo-linear-gradient'
import { Coins, Fish, LogOut, Medal, Skull, User, X } from 'lucide-react-native'
import React, { useEffect, useState } from 'react'
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native'
import { supabase } from '../services/supabase'
import { useGameStore } from '../store/useGameStore'
import { XPRing, StatCard, AchievementRow } from '../components/screens/ProfileComponents'
import { useAlert } from '../components/ui/Alert';
import { scale, sidePanel, fonts, spacing, radius, iconSize } from '../utils/responsive'

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ProfileScreen({ onClose }: { onClose?: () => void }) {
  const coins = useGameStore(state => state.coins)
  const fishes = useGameStore(state => state.fishes)
  const deadFishes = useGameStore(state => state.deadFishes)
  const level = useGameStore(state => state.level)
  const xpVal = useGameStore(state => state.xp)

  const [email, setEmail] = useState<string>('Carregando...')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setEmail(user?.email ?? 'Mergulhador Misterioso')
    })
  }, [])

  const xpNeeded = level * 1000
  const xpPct = Math.min(100, (xpVal / xpNeeded) * 100)

  const { alert } = useAlert();

  const handleLogout = () => {
    alert({
      type: 'warning',
      title: 'Sair',
      message: 'Deseja realmente sair da sua conta?',
      buttons: [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: () => supabase.auth.signOut() }
      ]
    });
  }

  return (
    <View style={s.containerRow}>
      {/* Left Sidebar */}
      <View style={[s.sidePanel, { width: sidePanel }]}>
        <View style={s.headerLeft}>
          <View style={s.headerIcon}>
            <User color="#00E5FF" size={iconSize.md} strokeWidth={2} />
          </View>
          <View>
            <Text style={s.title}>Meu Perfil</Text>
            <Text style={s.subtitle}>Mestre dos Mares</Text>
          </View>
        </View>

        <View style={s.divider} />

        <ScrollView contentContainerStyle={s.leftContent} showsVerticalScrollIndicator={false}>
          {/* Hero section */}
          <View style={s.hero}>
            <LinearGradient
              colors={['rgba(0,229,255,0.08)', 'transparent']}
              style={StyleSheet.absoluteFillObject}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
            />

            <XPRing level={level} pct={xpPct} />

            <View style={s.heroInfo}>
              {/* Email */}
              <View style={s.emailRow}>
                <View style={s.emailDot} />
                <Text style={s.emailText} numberOfLines={1}>{email}</Text>
              </View>

              {/* XP bar */}
              <View style={s.xpSection}>
                <View style={s.xpLabelRow}>
                  <Text style={s.xpLabel}>XP</Text>
                  <Text style={s.xpVal}>{Math.floor(xpVal).toLocaleString()}</Text>
                </View>
                <View style={s.xpTrack}>
                  <Animated.View style={[s.xpFill, { width: `${xpPct}%` }]} />
                  <View style={s.xpGloss} />
                </View>
              </View>
            </View>
          </View>

          {/* Logout */}
          <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
            <LinearGradient
              colors={['rgba(220,20,60,0.25)', 'rgba(139,0,0,0.2)']}
              style={s.logoutGrad}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <LogOut color="#FF6B6B" size={iconSize.sm} strokeWidth={2.5} />
              <Text style={s.logoutText}>Desconectar</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Right Content */}
      <View style={s.mainPanel}>
        {/* Absolute Close Button */}
        <TouchableOpacity style={s.closeBtnAbs} onPress={onClose}>
          <X color="rgba(255,255,255,0.6)" size={iconSize.sm} strokeWidth={2.5} />
        </TouchableOpacity>

      <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>

        {/* Stats row */}
        <View style={s.statsRow}>
          <StatCard
            index={0}
            icon={<Coins color="#FFD700" size={iconSize.md} strokeWidth={2} />}
            value={Math.floor(coins).toLocaleString()}
            label="Fortuna"
            color="#FFD700"
          />
          <StatCard
            index={1}
            icon={<Fish color="#00E5A0" size={iconSize.md} strokeWidth={2} />}
            value={fishes.length}
            label="Vivos"
            color="#00E5A0"
          />
          <StatCard
            index={2}
            icon={<Skull color="#A855F7" size={iconSize.md} strokeWidth={2} />}
            value={deadFishes.length}
            label="Necrotério"
            color="#A855F7"
          />
        </View>

        {/* Achievements */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Medal color="#FFD700" size={iconSize.sm} strokeWidth={2} />
            <Text style={s.sectionTitle}>Conquistas</Text>
          </View>
          <AchievementRow fishes={fishes} deadFishes={deadFishes} />
        </View>

      </ScrollView>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  containerRow: { flex: 1, flexDirection: 'row', position: 'relative' },
  sidePanel: { backgroundColor: 'rgba(0,0,0,0.15)', borderRightWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  mainPanel: { flex: 1 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md },
  headerIcon: {
    width: scale(30),
    height: scale(30),
    borderRadius: radius.sm,
    backgroundColor: 'rgba(0,229,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: fonts.base, fontWeight: '900', color: '#fff', letterSpacing: 0.3 },
  subtitle: { fontSize: fonts.xxs, color: 'rgba(255,255,255,0.4)', fontWeight: '700', letterSpacing: 0.5, marginTop: 1 },
  closeBtnAbs: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: scale(28),
    height: scale(28),
    borderRadius: scale(14),
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99,
  },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.07)', marginHorizontal: spacing.md },
  leftContent: { flexGrow: 1, padding: spacing.md, justifyContent: 'space-between', gap: spacing.md, paddingBottom: spacing.xl },

  body: { padding: spacing.md, paddingTop: spacing.xxxl, gap: spacing.md, paddingBottom: spacing.xxxl },

  // Hero
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: spacing.lg,
    gap: spacing.lg,
    overflow: 'hidden',
  },
  heroInfo: { flex: 1, gap: spacing.sm },
  emailRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  emailDot: { width: scale(7), height: scale(7), borderRadius: scale(4), backgroundColor: '#00E5A0' },
  emailText: { fontSize: fonts.md, color: 'rgba(255,255,255,0.6)', fontWeight: '700', flex: 1 },

  xpSection: { gap: spacing.xs },
  xpLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  xpLabel: { fontSize: fonts.xxs, fontWeight: '800', color: 'rgba(255,255,255,0.4)', letterSpacing: 1, textTransform: 'uppercase' },
  xpVal: { fontSize: fonts.sm, fontWeight: '900', color: '#00E5FF' },
  xpTrack: {
    height: scale(8),
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: radius.xs,
    overflow: 'hidden',
    position: 'relative',
  },
  xpFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: radius.xs,
    backgroundColor: '#00E5FF',
  },
  xpGloss: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: scale(4),
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.xs,
  },

  // Stats
  statsRow: { flexDirection: 'row', gap: spacing.sm },

  // Section
  section: { gap: spacing.sm },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  sectionTitle: {
    fontSize: fonts.md,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },

  // Logout
  logoutBtn: { borderRadius: radius.md, overflow: 'hidden', marginTop: 'auto' as any },
  logoutGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(220,20,60,0.3)',
    borderRadius: radius.md,
  },
  logoutText: { color: '#FF6B6B', fontWeight: '900', fontSize: fonts.base, letterSpacing: 0.8, textTransform: 'uppercase' },
})
