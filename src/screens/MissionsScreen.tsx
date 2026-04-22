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
import { scale, sidePanel, fonts, spacing, radius, iconSize } from '../utils/responsive'

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
    <View style={s.containerRow}>
      {/* Left Sidebar */}
      <View style={[s.sidePanel, { width: sidePanel }]}>
        <View style={s.headerLeft}>
          <View style={s.headerIcon}>
            <CheckSquare color="#00E5A0" size={iconSize.md} strokeWidth={2} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.title}>Quadro de Missões</Text>
            <Text style={s.subtitle}>Tarefas diárias e raras</Text>
          </View>
        </View>

        <View style={s.divider} />

        <View style={s.tabsWrap}>
          <View style={s.tabs}>
            <TouchableOpacity 
              style={[s.tab, activeTab === 'daily' && s.tabActive]} 
              onPress={() => setActiveTab('daily')}
            >
              <CheckSquare size={iconSize.xs} color={activeTab === 'daily' ? '#00E5FF' : 'rgba(255,255,255,0.4)'} />
              <Text style={[s.tabText, activeTab === 'daily' && s.tabTextActive]}>Diárias</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[s.tab, activeTab === 'achievements' && s.tabActive]} 
              onPress={() => setActiveTab('achievements')}
            >
              <Trophy size={iconSize.xs} color={activeTab === 'achievements' ? '#FFD700' : 'rgba(255,255,255,0.4)'} />
              <Text style={[s.tabText, activeTab === 'achievements' && s.tabTextActive]}>Conquistas</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Right Content */}
      <View style={s.mainPanel}>
        {/* Absolute Close Button */}
        <TouchableOpacity style={s.closeBtnAbs} onPress={onClose}>
          <X color="rgba(255,255,255,0.6)" size={iconSize.sm} strokeWidth={2.5} />
        </TouchableOpacity>

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {activeTab === 'daily' && renderList(DAILY_MISSIONS, true)}
          {activeTab === 'achievements' && renderList(ACHIEVEMENTS, false)}
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
    backgroundColor: 'rgba(0,229,160,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(0,229,160,0.3)',
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
  
  tabsWrap: {
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
    flex: 1,
  },
  tabs: {
    flexDirection: 'column',
    backgroundColor: 'transparent',
    gap: spacing.xs,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    gap: spacing.xs,
  },
  tabActive: { backgroundColor: 'rgba(255,255,255,0.1)' },
  tabText: { fontSize: fonts.sm, fontWeight: '700', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' },
  tabTextActive: { color: '#fff' },

  scroll: { padding: spacing.md, paddingTop: spacing.xxxl, paddingBottom: spacing.xxxl },
})
