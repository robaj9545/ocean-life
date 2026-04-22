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
import { Coins, Drumstick, X } from 'lucide-react-native'
import { StatBar } from './Stats'
import { getSpeciesName, getSpeciesEmoji } from '../../data/species'

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
  const speciesEmoji = getSpeciesEmoji(fish.species)
  const speciesName = getSpeciesName(fish.species)

  return (
    <Animated.View style={[fp.container, { transform: [{ translateY: slideAnim }], opacity: opacAnim }]}>
      <View style={fp.header}>
        <View style={fp.fishTitle}>
          <Text style={fp.emoji}>{speciesEmoji}</Text>
          <View>
            <Text style={fp.name}>{speciesName.toUpperCase()}</Text>
            <View style={fp.badgeRow}>
              <View style={[fp.badge, { backgroundColor: isAdult ? '#FFD70033' : '#00CED133' }]}>
                <Text style={[fp.badgeText, { color: isAdult ? '#FFD700' : '#00CED1' }]}>
                  {isAdult ? '⭐ ADULTO' : '🌱 FILHOTE'}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <TouchableOpacity style={fp.closeBtn} onPress={dismiss}>
          <X color="rgba(255,255,255,0.7)" size={16} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <View style={fp.divider} />

      <View style={{ paddingTop: 4 }}>
        <StatBar label="Saúde" value={fish.health ?? 100} color="#FF6B6B" icon="❤️" />
        <StatBar label="Fome" value={fish.hunger} color="#FFA500" icon="🍖" />
        <StatBar label="Alegria" value={fish.happiness} color="#00E5A0" icon="✨" />
      </View>

      {isAdult && (
        <TouchableOpacity style={fp.sellBtn} onPress={onSell} activeOpacity={0.85}>
          <LinearGradient colors={['#FFD700', '#FFA500']} style={fp.sellGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Coins color="#000" size={18} strokeWidth={2.5} />
            <Text style={fp.sellText}>VENDER POR {displayPrice.toLocaleString()}</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </Animated.View>
  )
}

const fp = StyleSheet.create({
  container: { position: 'absolute', bottom: 20, left: 14, right: 14, backgroundColor: 'rgba(8, 20, 45, 0.97)', borderRadius: 24, padding: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', zIndex: 20,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.7, shadowRadius: 20 },
      android: { elevation: 14 },
    }),
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  fishTitle: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  emoji: { fontSize: 40 },
  name: { fontSize: 20, fontWeight: '900', color: '#fff', letterSpacing: 1 },
  badgeRow: { flexDirection: 'row', marginTop: 4, gap: 6 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  badgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: 14 },
  sellBtn: { marginTop: 14, borderRadius: 14, overflow: 'hidden' },
  sellGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, gap: 8 },
  sellText: { color: '#000', fontWeight: '900', fontSize: 15, letterSpacing: 1.2 },
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

  return (
    <Animated.View style={[hb.wrap, { left: spot.x - 24, top: spot.y - 52, transform: [{ scale: pulseAnim }] }]}>
      <TouchableOpacity style={hb.bubble} onPress={onFeed} activeOpacity={0.8}>
        <Drumstick color="#FFA500" size={20} />
      </TouchableOpacity>
      <View style={hb.tail} />
    </Animated.View>
  )
}

const hb = StyleSheet.create({
  wrap: { position: 'absolute', zIndex: 20, alignItems: 'center' },
  bubble: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.95)', alignItems: 'center', justifyContent: 'center', borderWidth: 2.5, borderColor: '#FFA500',
    ...Platform.select({
      ios: { shadowColor: '#FFA500', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 8 },
      android: { elevation: 8 },
    }),
  },
  tail: { width: 8, height: 8, backgroundColor: '#FFA500', borderRadius: 2, transform: [{ rotate: '45deg' }], marginTop: -4 },
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

    // Gentle bounce entrance
    Animated.spring(bounceAnim, { toValue: 1, useNativeDriver: true, tension: 120, friction: 8 }).start()
  }, [])

  // If the fish is also hungry, position the coin icon ABOVE the hungry icon
  const yOffset = hasHungry ? -100 : -52;

  return (
    <Animated.View style={[
      cb.wrap,
      {
        left: spot.x - 22,
        top: spot.y + yOffset,
        transform: [
          { scale: Animated.multiply(pulseAnim, bounceAnim) },
        ],
      },
    ]}>
      <TouchableOpacity style={cb.bubble} onPress={onCollect} activeOpacity={0.8}>
        <Coins color="#FFD700" size={20} strokeWidth={2.5} />
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
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,245,200,0.97)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2.5, borderColor: '#FFD700',
    ...Platform.select({
      ios: { shadowColor: '#FFD700', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 10 },
      android: { elevation: 10 },
    }),
  },
  tail: { width: 8, height: 8, backgroundColor: '#FFD700', borderRadius: 2, transform: [{ rotate: '45deg' }], marginTop: -4 },
  valueBadge: {
    position: 'absolute', top: -6, right: -8,
    backgroundColor: '#FFD700', borderRadius: 8,
    paddingHorizontal: 4, paddingVertical: 1,
    minWidth: 18, alignItems: 'center',
  },
  valueText: { color: '#000', fontSize: 9, fontWeight: '900' },
})

