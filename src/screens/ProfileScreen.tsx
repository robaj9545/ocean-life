import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import { User, Coins, Fish, Skull, LogOut, X } from 'lucide-react-native'
import { useGameStore } from '../store/useGameStore'
import { supabase } from '../services/supabase'

export default function ProfileScreen({ onClose }: { onClose?: () => void }) {
  const coins = useGameStore(state => state.coins)
  const fishes = useGameStore(state => state.fishes)
  const deadFishes = useGameStore(state => state.deadFishes)
  const level = useGameStore(state => state.level)
  const xp = useGameStore(state => state.xp)
  
  const [email, setEmail] = useState<string | null>('Carregando...')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setEmail(user?.email || 'Mergulhador Misterioso')
    })
  }, [])

  const handleLogout = async () => {
    Alert.alert('Sair', 'Deseja realmente sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: async () => await supabase.auth.signOut() }
    ])
  }

  const xpNeeded = level * 1000;
  const xpPercent = Math.min(100, (xp / xpNeeded) * 100);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <User color="#fff" size={20} style={{ marginRight: 8 }} />
          <Text style={styles.title}>Meu Perfil</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.emailText}>{email}</Text>
          <TouchableOpacity onPress={onClose} style={{ marginLeft: 25, padding: 5, backgroundColor: 'rgba(255,0,0,0.6)', borderRadius: 12 }}>
            <X color="#fff" size={24} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.contentRow}>
        <View style={styles.card}>
          <View style={styles.levelCircle}><Text style={styles.levelText}>{level}</Text></View>
          <Text style={styles.xpTitle}>Nível Mestre dos Mares</Text>
          
          <View style={styles.xpBarContainer}>
             <View style={[styles.xpBarFill, { width: `${xpPercent}%` }]} />
          </View>
          <Text style={styles.xpLabel}>{Math.floor(xp)} / {xpNeeded} XP</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
                <Text style={styles.statValue}>{Math.floor(coins)}</Text>
                <Coins color="#FFD700" size={16} style={{ marginLeft: 4 }} />
              </View>
              <Text style={styles.statLabel}>Fortuna</Text>
            </View>
            <View style={styles.statBox}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
                <Text style={styles.statValue}>{fishes.length}</Text>
                <Fish color="#32CD32" size={16} style={{ marginLeft: 4 }} />
              </View>
              <Text style={styles.statLabel}>Vivos</Text>
            </View>
            <View style={styles.statBox}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
                <Text style={styles.statValue}>{deadFishes.length}</Text>
                <Skull color="#ccc" size={16} style={{ marginLeft: 4 }} />
              </View>
              <Text style={styles.statLabel}>Necrotério</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <LogOut color="#fff" size={16} style={{ marginRight: 6 }} />
              <Text style={styles.logoutText}>Desconectar</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    padding: 15, 
    borderBottomWidth: 1, 
    borderBottomColor: 'rgba(255,255,255,0.2)', 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  title: { fontSize: 20, fontWeight: '900', color: '#fff', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 },
  emailText: { color: '#ddd', fontSize: 13, fontWeight: 'bold' },
  contentRow: { flex: 1, flexDirection: 'row', padding: 15 },
  card: { flex: 1, backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 15, padding: 20, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.15, shadowRadius: 5, elevation: 4, marginRight: 15 },
  levelCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFD700', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#FFA500', marginBottom: 15, shadowColor: '#FF8C00', shadowOpacity: 0.5, shadowRadius: 5, elevation: 3 },
  levelText: { fontSize: 32, fontWeight: '900', color: '#8B4513' },
  xpTitle: { fontSize: 16, fontWeight: '900', color: '#333', marginBottom: 10 },
  xpBarContainer: { width: '90%', height: 12, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 6, overflow: 'hidden', marginBottom: 6 },
  xpBarFill: { height: '100%', backgroundColor: '#32CD32', borderRadius: 6 },
  xpLabel: { color: '#666', fontSize: 12, fontWeight: 'bold' },
  statsContainer: { flex: 1, justifyContent: 'space-between' },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  statBox: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', marginHorizontal: 6, paddingVertical: 15, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  statValue: { color: '#fff', fontSize: 18, fontWeight: '900', marginBottom: 3 },
  statLabel: { color: '#ddd', fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  logoutBtn: { backgroundColor: '#DC143C', paddingVertical: 12, borderRadius: 10, alignItems: 'center', elevation: 3 },
  logoutText: { color: '#fff', fontSize: 14, fontWeight: '900', textTransform: 'uppercase' }
})
