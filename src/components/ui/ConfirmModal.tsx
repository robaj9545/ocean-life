import React, { useEffect, useRef } from 'react'
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { AlertTriangle, Coins } from 'lucide-react-native'
import { scale, fonts, spacing, radius, iconSize } from '../../utils/responsive'

interface ConfirmModalProps {
  visible: boolean
  title: string
  message: string
  price?: number
  confirmLabel?: string
  cancelLabel?: string
  accentColor?: string
  destructive?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({
  visible,
  title,
  message,
  price,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  accentColor = '#00E5FF',
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.85)).current

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 100, friction: 10 }),
      ]).start()
    } else {
      fadeAnim.setValue(0)
      scaleAnim.setValue(0.85)
    }
  }, [visible])

  if (!visible) return null

  const confirmColors: [string, string] = destructive
    ? ['#FF4444', '#CC2222']
    : [accentColor, shadeColor(accentColor, -30)]

  return (
    <Modal transparent visible={visible} statusBarTranslucent animationType="none">
      <Animated.View style={[s.backdrop, { opacity: fadeAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />

        <Animated.View style={[s.card, { transform: [{ scale: scaleAnim }] }]}>
          {/* Accent top bar */}
          <View style={[s.glowTop, { backgroundColor: destructive ? '#FF4444' : accentColor }]} />

          {/* Icon */}
          <View style={[s.iconCircle, { backgroundColor: destructive ? 'rgba(255,68,68,0.15)' : `${accentColor}22` }]}>
            {destructive
              ? <AlertTriangle color="#FF4444" size={iconSize.lg} strokeWidth={2.5} />
              : <Coins color={accentColor} size={iconSize.lg} strokeWidth={2.5} />
            }
          </View>

          {/* Title */}
          <Text style={s.title}>{title}</Text>

          {/* Message */}
          <Text style={s.message}>{message}</Text>

          {/* Price display */}
          {price !== undefined && (
            <View style={s.priceRow}>
              <Coins color="#FFD700" size={iconSize.sm} strokeWidth={2.5} />
              <Text style={s.priceText}>{price.toLocaleString()} moedas</Text>
            </View>
          )}

          {/* Buttons */}
          <View style={s.buttonRow}>
            <TouchableOpacity style={s.cancelBtn} onPress={onCancel} activeOpacity={0.8}>
              <Text style={s.cancelText}>{cancelLabel}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.confirmBtn} onPress={onConfirm} activeOpacity={0.85}>
              <LinearGradient
                colors={confirmColors}
                style={s.confirmGrad}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={s.confirmText}>{confirmLabel}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  )
}

function shadeColor(hex: string, percent: number) {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, Math.max(0, (num >> 16) + percent))
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + percent))
  const b = Math.min(255, Math.max(0, (num & 0xff) + percent))
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: scale(280),
    maxWidth: '85%',
    backgroundColor: 'rgba(10,25,55,0.98)',
    borderRadius: radius.xxl,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  glowTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: scale(3),
  },
  iconCircle: {
    width: scale(52),
    height: scale(52),
    borderRadius: scale(26),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  title: {
    color: '#fff',
    fontSize: fonts.xl,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  message: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: fonts.base,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: fonts.base * 1.5,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(255,215,0,0.1)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.2)',
  },
  priceText: {
    color: '#FFD700',
    fontSize: fonts.lg,
    fontWeight: '900',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
    marginTop: spacing.sm,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: fonts.base,
    fontWeight: '800',
  },
  confirmBtn: {
    flex: 1,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  confirmGrad: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmText: {
    color: '#fff',
    fontSize: fonts.base,
    fontWeight: '900',
  },
})
