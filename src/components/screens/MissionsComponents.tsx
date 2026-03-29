import { Gift, Coins, CheckCircle, Drumstick, Heart, ShoppingCart, Dna, Skull, Trophy, Check } from 'lucide-react-native'
import React, { useEffect, useRef } from 'react'
import { Animated, View, Text, StyleSheet, TouchableOpacity, Easing } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { MissionDef } from '../../data/missions'

const ICONS: Record<string, React.ReactNode> = {
  Drumstick: <Drumstick color="#FFA500" size={18} strokeWidth={2} />,
  Coins: <Coins color="#FFD700" size={18} strokeWidth={2} />,
  Heart: <Heart color="#FF69B4" size={18} strokeWidth={2} />,
  ShoppingCart: <ShoppingCart color="#00E5FF" size={18} strokeWidth={2} />,
  Dna: <Dna color="#A855F7" size={18} strokeWidth={2} />,
  Skull: <Skull color="#FF4500" size={18} strokeWidth={2} />
}

export function MissionCard({
  mission,
  progress,
  isClaimed,
  onClaim
}: {
  mission: MissionDef;
  progress: number;
  isClaimed: boolean;
  onClaim: () => void;
}) {
  const isCompleted = progress >= mission.targetAmount
  const pct = Math.min(100, (progress / mission.targetAmount) * 100)

  // Floating animation for gift
  const floatAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (isCompleted && !isClaimed) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
          Animated.timing(floatAnim, { toValue: 0, duration: 1000, useNativeDriver: true })
        ])
      ).start()
    }
  }, [isCompleted, isClaimed])

  return (
    <View style={[s.card, isClaimed && s.cardClaimed]}>
      {isCompleted && !isClaimed && (
        <LinearGradient
          colors={['rgba(255,215,0,0.15)', 'transparent']}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
      )}
      
      <View style={s.iconWrap}>
        {mission.icon && ICONS[mission.icon] ? ICONS[mission.icon] : <Trophy color="#FFD700" size={18} />}
      </View>

      <View style={s.info}>
        <Text style={[s.title, isClaimed && s.textDim]}>{mission.title}</Text>
        <Text style={[s.desc, isClaimed && s.textDim]}>{mission.description}</Text>
        
        <View style={s.rewards}>
          <Text style={[s.rewardText, isClaimed && s.textDim]}>+{mission.rewardCoins} 🪙</Text>
          <Text style={[s.rewardText, isClaimed && s.textDim]}>+{mission.rewardXp} XP</Text>
        </View>

        {!isClaimed && (
          <View style={s.trackBtn}>
            <View style={s.barWrap}>
               <View style={[s.barFill, { width: `${pct}%`, backgroundColor: isCompleted ? '#00E5FF' : 'rgba(255,255,255,0.4)' }]} />
            </View>
            <Text style={s.progressText}>{progress}/{mission.targetAmount}</Text>
          </View>
        )}
      </View>

      {/* Button State */}
      <View style={s.actionCol}>
        {isClaimed ? (
          <View style={s.claimedBadge}>
            <CheckCircle color="#00E5A0" size={20} />
            <Text style={s.claimedText}>Coletado</Text>
          </View>
        ) : isCompleted ? (
          <Animated.View style={{ transform: [{ translateY: floatAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) }] }}>
            <TouchableOpacity style={s.claimBtn} onPress={onClaim} activeOpacity={0.8}>
               <LinearGradient colors={['#FFD700', '#FFA500']} style={s.claimGrad}>
                 <Gift color="#fff" size={16} strokeWidth={2.5} />
                 <Text style={s.claimText}>Coletar</Text>
               </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        ) : null}
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden'
  },
  cardClaimed: { opacity: 0.6, backgroundColor: 'rgba(0,0,0,0.2)', borderColor: 'transparent' },
  iconWrap: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  info: { flex: 1, justifyContent: 'center' },
  title: { fontSize: 14, fontWeight: '800', color: '#fff', letterSpacing: 0.3 },
  desc: { fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2, marginBottom: 8 },
  textDim: { color: 'rgba(255,255,255,0.3)' },
  rewards: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  rewardText: { fontSize: 11, fontWeight: '800', color: '#FFD700' },
  trackBtn: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  barWrap: { flex: 1, height: 6, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 3, overflow: 'hidden' },
  barFill: { position: 'absolute', top: 0, bottom: 0, left: 0, borderRadius: 3 },
  progressText: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.4)' },

  actionCol: { marginLeft: 10, alignItems: 'center', justifyContent: 'center' },
  claimBtn: { borderRadius: 12, overflow: 'hidden' },
  claimGrad: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, gap: 6 },
  claimText: { color: '#fff', fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },

  claimedBadge: { alignItems: 'center', gap: 4 },
  claimedText: { color: '#00E5A0', fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
})
