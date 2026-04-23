import React, { useEffect, useRef, useState } from 'react'
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Coins, Drumstick, X, Star, Sprout, Heart, Sparkles } from 'lucide-react-native'
import { StatBar } from './Stats'
import { ConfirmModal } from './ConfirmModal'
import { getSpeciesName, getSpeciesIcon, getSpeciesColor } from '../../data/species'
import { scale, moderateScale, fonts, spacing, radius, iconSize } from '../../utils/responsive'
import { hapticLight, hapticSuccess, hapticMedium } from '../../utils/haptics'

// ─── FishPanel ───────────────────────────────────────────────────────────────
export function FishPanel({
  fish,
  onClose,
  onSell,
  sellPrice,
}: {
  fish: any
  onClose: () => void
  onSell: () => void
  sellPrice?: number
}) {
  const slideAnim = useRef(new Animated.Value(300)).current
  const opacAnim = useRef(new Animated.Value(0)).current
  const [showSellConfirm, setShowSellConfirm] = useState(false)

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 60, friction: 10 }),
      Animated.timing(opacAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start()
  }, [])

  const dismiss = () => {
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 300, useNativeDriver: true, tension: 60, friction: 10 }),
      Animated.timing(opacAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start(onClose)
  }

  const displayPrice = sellPrice ?? 0
  const isAdult = fish.stage === 'adult'
  const speciesName = getSpeciesName(fish.species)
  const SpeciesIcon = getSpeciesIcon(fish.species)
  const speciesColor = getSpeciesColor(fish.species)

  return (
    <Animated.View style={[fp.container, { transform: [{ translateY: slideAnim }], opacity: opacAnim }]}>
      <View style={fp.header}>
        <View style={fp.fishTitle}>
          <View style={[fp.iconCircle, { backgroundColor: `${speciesColor}22`, borderColor: `${speciesColor}55` }]}>
            {SpeciesIcon
              ? <SpeciesIcon color={speciesColor} size={iconSize.lg} strokeWidth={2} />
              : <Coins color={speciesColor} size={iconSize.lg} strokeWidth={2} />
            }
          </View>
          <View>
            <Text style={fp.name}>{speciesName.toUpperCase()}</Text>
            <View style={fp.badgeRow}>
              <View style={[fp.badge, { backgroundColor: isAdult ? '#FFD70033' : '#00CED133' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xxs }}>
                  {isAdult
                    ? <Star color="#FFD700" size={iconSize.xs} strokeWidth={2.5} />
                    : <Sprout color="#00CED1" size={iconSize.xs} strokeWidth={2.5} />
                  }
                  <Text style={[fp.badgeText, { color: isAdult ? '#FFD700' : '#00CED1' }]}>
                    {isAdult ? 'ADULTO' : 'FILHOTE'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
        <TouchableOpacity style={fp.closeBtn} onPress={dismiss}>
          <X color="rgba(255,255,255,0.7)" size={iconSize.sm} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <View style={fp.divider} />

      <View style={{ paddingTop: spacing.xs }}>
        <StatBar label="Saúde" value={fish.health ?? 100} color="#FF6B6B" icon={<Heart color="#FF6B6B" size={iconSize.sm} strokeWidth={2.5} />} />
        <StatBar label="Fome" value={fish.hunger} color="#FFA500" icon={<Drumstick color="#FFA500" size={iconSize.sm} strokeWidth={2.5} />} />
        <StatBar label="Alegria" value={fish.happiness} color="#00E5A0" icon={<Sparkles color="#00E5A0" size={iconSize.sm} strokeWidth={2.5} />} />
      </View>

      {isAdult && (
        <TouchableOpacity style={fp.sellBtn} onPress={() => setShowSellConfirm(true)} activeOpacity={0.85}>
          <LinearGradient colors={['#FFD700', '#FFA500']} style={fp.sellGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Coins color="#000" size={iconSize.md} strokeWidth={2.5} />
            <Text style={fp.sellText}>VENDER POR {displayPrice.toLocaleString()}</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* FIX: Sell confirmation modal to prevent accidental sales */}
      <ConfirmModal
        visible={showSellConfirm}
        title="Vender Peixe?"
        message={`Tem certeza que deseja vender ${speciesName}? Esta ação é irreversível.`}
        price={displayPrice}
        confirmLabel="Vender"
        cancelLabel="Cancelar"
        accentColor="#FFD700"
        destructive={false}
        onConfirm={() => { setShowSellConfirm(false); onSell(); }}
        onCancel={() => setShowSellConfirm(false)}
      />
    </Animated.View>
  )
}

const fp = StyleSheet.create({
  container: { position: 'absolute', bottom: scale(20), left: scale(14), right: scale(14), backgroundColor: 'rgba(8, 20, 45, 0.97)', borderRadius: radius.xxl, padding: scale(18), borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', zIndex: 20,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.7, shadowRadius: 20 },
      android: { elevation: 14 },
    }),
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  fishTitle: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconCircle: { width: scale(44), height: scale(44), borderRadius: scale(22), borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: fonts.xl, fontWeight: '900', color: '#fff', letterSpacing: 1 },
  badgeRow: { flexDirection: 'row', marginTop: spacing.xs, gap: spacing.xs },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xxs, borderRadius: radius.sm },
  badgeText: { fontSize: fonts.sm, fontWeight: '700', letterSpacing: 0.8 },
  closeBtn: { width: scale(32), height: scale(32), borderRadius: scale(16), backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: spacing.md },
  sellBtn: { marginTop: spacing.md, borderRadius: radius.md, overflow: 'hidden' },
  sellGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.md, gap: spacing.sm },
  sellText: { color: '#000', fontWeight: '900', fontSize: fonts.lg, letterSpacing: 1.2 },
})

// ─── HungryBubble ────────────────────────────────────────────────────────────
export function HungryBubble({ spot, onFeed }: { spot: any; onFeed: () => void }) {
  const pulseAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.18, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
    ).start()
  }, [])

  const bubbleSize = scale(42)

  return (
    <Animated.View style={[hb.wrap, { left: spot.x - bubbleSize / 2, top: spot.y - bubbleSize - scale(10), transform: [{ scale: pulseAnim }] }]}>
      <TouchableOpacity
        style={[hb.bubble, { width: bubbleSize, height: bubbleSize, borderRadius: bubbleSize / 2 }]}
        onPress={() => { hapticLight(); onFeed(); }}
        activeOpacity={0.8}
        hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
      >
        <Drumstick color="#FFA500" size={iconSize.md} />
      </TouchableOpacity>
      <View style={hb.tail} />
    </Animated.View>
  )
}

const hb = StyleSheet.create({
  wrap: { position: 'absolute', zIndex: 20, alignItems: 'center' },
  bubble: { backgroundColor: 'rgba(255,255,255,0.95)', alignItems: 'center', justifyContent: 'center', borderWidth: 2.5, borderColor: '#FFA500',
    ...Platform.select({
      ios: { shadowColor: '#FFA500', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 8 },
      android: { elevation: 8 },
    }),
  },
  tail: { width: scale(8), height: scale(8), backgroundColor: '#FFA500', borderRadius: 2, transform: [{ rotate: '45deg' }], marginTop: scale(-4) },
})

// ─── CoinBubble ──────────────────────────────────────────────────────────────
export function CoinBubble({ spot, onCollect, hasHungry }: { spot: any; onCollect: () => void; hasHungry?: boolean }) {
  const pulseAnim = useRef(new Animated.Value(1)).current
  const bounceAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
    ).start()

    Animated.spring(bounceAnim, { toValue: 1, useNativeDriver: true, tension: 120, friction: 8 }).start()
  }, [])

  const bubbleSize = scale(42)
  const yOffset = hasHungry ? -(bubbleSize * 2 + scale(16)) : -(bubbleSize + scale(10));

  return (
    <Animated.View style={[
      cb.wrap,
      {
        left: spot.x - bubbleSize / 2,
        top: spot.y + yOffset,
        transform: [
          { scale: Animated.multiply(pulseAnim, bounceAnim) },
        ],
      },
    ]}>
      <TouchableOpacity
        style={[cb.bubble, { width: bubbleSize, height: bubbleSize, borderRadius: bubbleSize / 2 }]}
        onPress={() => { hapticSuccess(); onCollect(); }}
        activeOpacity={0.8}
        hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
      >
        <Coins color="#FFD700" size={iconSize.md} strokeWidth={2.5} />
        {spot.coinValue > 1 && (
          <View style={cb.valueBadge}>
            <Text style={cb.valueText}>+{spot.coinValue}</Text>
          </View>
        )}
      </TouchableOpacity>
      <View style={cb.tail} />
    </Animated.View>
  )
}

const cb = StyleSheet.create({
  wrap: { position: 'absolute', zIndex: 21, alignItems: 'center' },
  bubble: {
    backgroundColor: 'rgba(255,245,200,0.97)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2.5, borderColor: '#FFD700',
    ...Platform.select({
      ios: { shadowColor: '#FFD700', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 10 },
      android: { elevation: 10 },
    }),
  },
  tail: { width: scale(8), height: scale(8), backgroundColor: '#FFD700', borderRadius: 2, transform: [{ rotate: '45deg' }], marginTop: scale(-4) },
  valueBadge: {
    position: 'absolute', top: scale(-6), right: scale(-8),
    backgroundColor: '#FFD700', borderRadius: radius.sm,
    paddingHorizontal: spacing.xs, paddingVertical: 1,
    minWidth: scale(18), alignItems: 'center',
  },
  valueText: { color: '#000', fontSize: fonts.xxs, fontWeight: '900' },
})
