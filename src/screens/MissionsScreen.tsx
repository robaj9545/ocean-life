import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native'
import { CheckSquare, X, Trophy } from 'lucide-react-native'
import { MissionCard } from '../components/screens/MissionsComponents'
import { DAILY_MISSIONS, ACHIEVEMENTS } from '../data/missions'
import { useGameStore } from '../store/useGameStore'

export default function MissionsScreen({ onClose }: { onClose?: () => void }) {
  const [activeTab, setActiveTab] = useState<'daily' | 'achievements'>('daily')
  const stats = useGameStore(state => state.stats)
  const dailyProgress = useGameStore(state => state.dailyProgress)
  const claimedMissions = useGameStore(state => state.claimedMissions)
  const claimMission = useGameStore(state => state.claimMission)

  // Force reset check on mount just in case
  React.useEffect(() => {
    useGameStore.getState().checkDailyReset()
  }, [])

  const handleClaim = (id: string, coins: number, xp: number, isDaily: boolean) => {
    claimMission(id, coins, xp, isDaily)
  }

  const renderList = (sourceList: any[], isDaily: boolean) => {
    const list = [...sourceList].sort((a, b) => {
      const aClaimed = claimedMissions.includes(a.id)
      const bClaimed = claimedMissions.includes(b.id)
      if (aClaimed && !bClaimed) return 1
      if (!aClaimed && bClaimed) return -1
      return 0
    })

    return list.map(mission => {
      const isClaimed = claimedMissions.includes(mission.id)
      const currentVal = isDaily 
        ? (dailyProgress[mission.action] || 0) 
        : (stats[mission.action as keyof typeof stats] || 0)

      return (
        <MissionCard
          key={mission.id}
          mission={mission}
          progress={currentVal}
          isClaimed={isClaimed}
          onClaim={() => handleClaim(mission.id, mission.rewardCoins, mission.rewardXp, isDaily)}
        />
      )
    })
  }

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <View style={s.headerIcon}>
            <CheckSquare color="#00E5A0" size={18} strokeWidth={2} />
          </View>
          <View>
            <Text style={s.title}>Quadro de Missões</Text>
            <Text style={s.subtitle}>Cumpra tarefas e ganhe recompensas</Text>
          </View>
        </View>
        <TouchableOpacity style={s.closeBtn} onPress={onClose}>
          <X color="rgba(255,255,255,0.6)" size={16} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <View style={s.divider} />

      {/* Tabs */}
      <View style={s.tabsWrap}>
        <View style={s.tabs}>
          <TouchableOpacity 
            style={[s.tab, activeTab === 'daily' && s.tabActive]} 
            onPress={() => setActiveTab('daily')}
          >
            <CheckSquare size={14} color={activeTab === 'daily' ? '#00E5FF' : 'rgba(255,255,255,0.4)'} />
            <Text style={[s.tabText, activeTab === 'daily' && s.tabTextActive]}>Diárias</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[s.tab, activeTab === 'achievements' && s.tabActive]} 
            onPress={() => setActiveTab('achievements')}
          >
            <Trophy size={14} color={activeTab === 'achievements' ? '#FFD700' : 'rgba(255,255,255,0.4)'} />
            <Text style={[s.tabText, activeTab === 'achievements' && s.tabTextActive]}>Conquistas</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
         {activeTab === 'daily' && renderList(DAILY_MISSIONS, true)}
         {activeTab === 'achievements' && renderList(ACHIEVEMENTS, false)}
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
    backgroundColor: 'rgba(0,229,160,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(0,229,160,0.3)',
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
  
  tabsWrap: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 4,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  tabActive: { backgroundColor: 'rgba(255,255,255,0.1)' },
  tabText: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' },
  tabTextActive: { color: '#fff' },

  scroll: { padding: 14, paddingBottom: 40 },
})
