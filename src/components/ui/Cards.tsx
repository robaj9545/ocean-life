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
import { Coins, ArrowUpCircle, Lock, Clock, Minus, Plus } from 'lucide-react-native'
import { scale, fonts, spacing, radius, iconSize } from '../../utils/responsive'

export function ShopCard({
  title,
  description,
  rarity,
  rarityColor,
  price,
  accentColor,
  preview,
  onBuy,
  disabled,
  index,
  dead,
  daysLeft,
  onRevive,
  locked,
  lockedLevel,
  showQuantity,
  maxQuantity = 99,
}: {
  title: string
  description: string
  rarity: string
  rarityColor: string
  price: number
  accentColor: string
  preview: React.ReactNode
  onBuy?: (quantity: number) => void
  disabled?: boolean
  index?: number
  dead?: boolean
  daysLeft?: number
  onRevive?: () => void
  locked?: boolean
  lockedLevel?: number
  showQuantity?: boolean
  maxQuantity?: number
}) {
  const enter = useRef(new Animated.Value(0)).current
  const pressAnim = useRef(new Animated.Value(1)).current
  const [qty, setQty] = useState(1)

  useEffect(() => {
    Animated.spring(enter, {
      toValue: 1,
      delay: (index ?? 0) * 80,
      useNativeDriver: true,
      tension: 55,
      friction: 9,
    }).start()
  }, [])

  const onPressIn = () => Animated.spring(pressAnim, { toValue: 0.95, useNativeDriver: true, tension: 300 }).start()
  const onPressOut = () => Animated.spring(pressAnim, { toValue: 1, useNativeDriver: true, tension: 300 }).start()

  const totalPrice = price * qty
  const canAfford = !disabled || qty === 1 // Will be checked via totalPrice in parent

  return (
    <Animated.View
      style={[
        sc.wrap,
        {
          opacity: enter,
          transform: [
            { scale: pressAnim },
            { translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) },
          ],
        },
        dead && sc.deadWrap,
        locked && sc.lockedWrap,
      ]}
    >
      <View style={[sc.glowTop, { backgroundColor: locked ? '#555' : accentColor }]} />
      <View style={[sc.rarityBadge, { backgroundColor: `${rarityColor}33`, borderColor: `${rarityColor}66` }]}>
        <Text style={[sc.rarityText, { color: rarityColor }]}>{rarity}</Text>
      </View>

      <View style={[sc.preview, dead && { opacity: 0.4 }, locked && { opacity: 0.3 }]}>
        <LinearGradient colors={[`${accentColor}22`, 'transparent']} style={StyleSheet.absoluteFillObject} />
        {preview}
      </View>

      {locked && (
        <View style={sc.lockedOverlay}>
          <Lock color="rgba(255,255,255,0.8)" size={iconSize.lg} strokeWidth={2.5} />
          <Text style={sc.lockedText}>Nível {lockedLevel}</Text>
        </View>
      )}

      <View style={sc.body}>
        <Text style={[sc.title, dead && { textDecorationLine: 'line-through', opacity: 0.6 }]}>{title}</Text>
        <Text style={sc.desc} numberOfLines={2}>{description}</Text>

        {dead && daysLeft !== undefined && (
          <View style={sc.daysRow}>
            <Clock color="rgba(168,85,247,0.8)" size={iconSize.xs} strokeWidth={2} />
            <Text style={sc.daysLeft}>Expira em {daysLeft}d</Text>
          </View>
        )}

        {/* Quantity Selector */}
        {showQuantity && !locked && (
          <View style={sc.qtyRow}>
            <TouchableOpacity
              style={[sc.qtyBtn, qty <= 1 && sc.qtyBtnDisabled]}
              onPress={() => setQty(Math.max(1, qty - 1))}
              disabled={qty <= 1}
              activeOpacity={0.7}
            >
              <Minus color={qty <= 1 ? 'rgba(255,255,255,0.2)' : '#fff'} size={iconSize.xs} strokeWidth={3} />
            </TouchableOpacity>

            <View style={sc.qtyDisplay}>
              <Text style={sc.qtyText}>{qty}</Text>
            </View>

            <TouchableOpacity
              style={[sc.qtyBtn, qty >= maxQuantity && sc.qtyBtnDisabled]}
              onPress={() => setQty(Math.min(maxQuantity, qty + 1))}
              disabled={qty >= maxQuantity}
              activeOpacity={0.7}
            >
              <Plus color={qty >= maxQuantity ? 'rgba(255,255,255,0.2)' : '#fff'} size={iconSize.xs} strokeWidth={3} />
            </TouchableOpacity>
          </View>
        )}

        {onBuy && !locked && (
          <TouchableOpacity
            style={[sc.btn, disabled && sc.btnDisabled]}
            onPress={() => onBuy(qty)}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            disabled={disabled}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={disabled ? ['#333', '#222'] : [accentColor, shadeColor(accentColor, -30)]}
              style={sc.btnGrad}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Coins color={disabled ? 'rgba(255,255,255,0.3)' : '#fff'} size={iconSize.xs} strokeWidth={2.5} />
              <Text style={[sc.btnText, disabled && { opacity: 0.3 }]}>
                {showQuantity ? totalPrice.toLocaleString() : price.toLocaleString()}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
        {locked && (
          <View style={[sc.btn, sc.btnLocked]}>
            <View style={[sc.btnGrad, { backgroundColor: 'rgba(255,255,255,0.06)' }]}>
              <Lock color="rgba(255,255,255,0.25)" size={iconSize.xs} strokeWidth={2.5} />
              <Text style={[sc.btnText, { opacity: 0.25 }]}>Nv. {lockedLevel}</Text>
            </View>
          </View>
        )}
        {onRevive && (
          <TouchableOpacity style={sc.btn} onPress={onRevive} activeOpacity={0.85}>
            <LinearGradient colors={['#A855F7', '#7C3AED']} style={sc.btnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <ArrowUpCircle color="#fff" size={iconSize.xs} strokeWidth={2.5} />
              <Text style={sc.btnText}>{price}</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  )
}

import { shadeColor } from '../../utils/colors'

const sc = StyleSheet.create({
  wrap: {
    flexBasis: scale(130),
    flexGrow: 1,
    maxWidth: scale(190),
    minWidth: scale(130),
    backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: radius.xl, margin: spacing.xs, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.4, shadowRadius: 8 },
      android: { elevation: 6 },
    }),
  },
  deadWrap: { borderColor: 'rgba(168,85,247,0.3)' },
  lockedWrap: { borderColor: 'rgba(255,255,255,0.05)' },
  lockedOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    gap: spacing.xs,
  },
  lockedText: { color: 'rgba(255,255,255,0.8)', fontSize: fonts.sm, fontWeight: '900', letterSpacing: 0.5 },
  btnLocked: { opacity: 1 },
  glowTop: { height: scale(3), width: '100%' },
  rarityBadge: { position: 'absolute', top: spacing.sm, right: spacing.sm, paddingHorizontal: spacing.xs, paddingVertical: spacing.xxs, borderRadius: radius.sm, borderWidth: 1, zIndex: 2 },
  rarityText: { fontSize: fonts.xxs, fontWeight: '900', letterSpacing: 0.8 },
  preview: { height: scale(85), alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  body: { padding: spacing.md, gap: spacing.xs },
  title: { fontSize: fonts.base, fontWeight: '900', color: '#fff', letterSpacing: 0.2 },
  desc: { fontSize: fonts.sm, color: 'rgba(255,255,255,0.45)', lineHeight: fonts.base + 2, fontWeight: '600' },
  daysRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  daysLeft: { fontSize: fonts.sm, color: 'rgba(168,85,247,0.8)', fontWeight: '700' },

  // Quantity selector
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  qtyBtn: {
    width: scale(26),
    height: scale(26),
    borderRadius: radius.sm,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  qtyBtnDisabled: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderColor: 'rgba(255,255,255,0.05)',
  },
  qtyDisplay: {
    minWidth: scale(30),
    height: scale(26),
    borderRadius: radius.xs,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  qtyText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: fonts.base,
    letterSpacing: 0.5,
  },

  btn: { borderRadius: radius.md, overflow: 'hidden', marginTop: spacing.xs },
  btnDisabled: { opacity: 0.5 },
  btnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.sm, gap: spacing.xs },
  btnText: { color: '#fff', fontWeight: '900', fontSize: fonts.base },
})
