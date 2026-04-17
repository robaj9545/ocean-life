import { LinearGradient } from 'expo-linear-gradient'
import { Coins, Fish, LogOut, Skull, User, X } from 'lucide-react-native'
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
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <View style={s.headerIcon}>
            <User color="#00E5FF" size={18} strokeWidth={2} />
          </View>
          <View>
            <Text style={s.title}>Meu Perfil</Text>
            <Text style={s.subtitle}>Mestre dos Mares</Text>
          </View>
        </View>
        <TouchableOpacity style={s.closeBtn} onPress={onClose}>
          <X color="rgba(255,255,255,0.6)" size={16} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <View style={s.divider} />

      <ScrollView contentContainerStyle={s.body} style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
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
                <Text style={s.xpLabel}>Experiência</Text>
                <Text style={s.xpVal}>{Math.floor(xpVal).toLocaleString()} / {xpNeeded.toLocaleString()} XP</Text>
              </View>
              <View style={s.xpTrack}>
                <Animated.View style={[s.xpFill, { width: `${xpPct}%` }]} />
                <View style={s.xpGloss} />
              </View>
            </View>
          </View>
        </View>

        {/* Stats row */}
        <View style={s.statsRow}>
          <StatCard
            index={0}
            icon={<Coins color="#FFD700" size={18} strokeWidth={2} />}
            value={Math.floor(coins).toLocaleString()}
            label="Fortuna"
            color="#FFD700"
          />
          <StatCard
            index={1}
            icon={<Fish color="#00E5A0" size={18} strokeWidth={2} />}
            value={fishes.length}
            label="Vivos"
            color="#00E5A0"
          />
          <StatCard
            index={2}
            icon={<Skull color="#A855F7" size={18} strokeWidth={2} />}
            value={deadFishes.length}
            label="Necrotério"
            color="#A855F7"
          />
        </View>

        {/* Achievements */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>🏅 Conquistas</Text>
          <AchievementRow fishes={fishes} deadFishes={deadFishes} />
        </View>

        {/* Logout */}
        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <LinearGradient
            colors={['rgba(220,20,60,0.25)', 'rgba(139,0,0,0.2)']}
            style={s.logoutGrad}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <LogOut color="#FF6B6B" size={16} strokeWidth={2.5} />
            <Text style={s.logoutText}>Desconectar</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(0,229,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 17, fontWeight: '900', color: '#fff', letterSpacing: 0.3 },
  subtitle: { fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: '700', letterSpacing: 0.5, marginTop: 1 },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.07)', marginHorizontal: 18 },

  body: { flexGrow: 1, padding: 14, gap: 12, paddingBottom: 40 },

  // Hero
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 16,
    gap: 16,
    overflow: 'hidden',
  },
  heroInfo: { flex: 1, gap: 10 },
  emailRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  emailDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#00E5A0' },
  emailText: { fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: '700', flex: 1 },

  xpSection: { gap: 5 },
  xpLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  xpLabel: { fontSize: 9, fontWeight: '800', color: 'rgba(255,255,255,0.4)', letterSpacing: 1, textTransform: 'uppercase' },
  xpVal: { fontSize: 10, fontWeight: '900', color: '#00E5FF' },
  xpTrack: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  xpFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 4,
    backgroundColor: '#00E5FF',
  },
  xpGloss: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 4,
  },

  // Stats
  statsRow: { flexDirection: 'row', gap: 8 },

  // Section
  section: { gap: 8 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },

  // Logout
  logoutBtn: { borderRadius: 14, overflow: 'hidden', marginTop: 'auto' as any },
  logoutGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(220,20,60,0.3)',
    borderRadius: 14,
  },
  logoutText: { color: '#FF6B6B', fontWeight: '900', fontSize: 14, letterSpacing: 0.8, textTransform: 'uppercase' },
})





