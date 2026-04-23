import React, { useEffect, useRef } from 'react'
import {
  Animated,
  StyleSheet,
  Text,
  View,
  Modal,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Loader } from 'lucide-react-native'
import { scale, fonts, spacing, radius, iconSize } from '../../utils/responsive'

interface LoadingOverlayProps {
  visible: boolean
  message?: string
}

export function LoadingOverlay({ visible, message = 'Carregando...' }: LoadingOverlayProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const spinAnim = useRef(new Animated.Value(0)).current
  const barAnim = useRef(new Animated.Value(0)).current
  const pulseAnim = useRef(new Animated.Value(1)).current

  // PERF FIX: Store animation refs so we can stop them properly
  const animsRef = useRef<Animated.CompositeAnimation[]>([]);

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start()

      // Spinner rotation
      const spin = Animated.loop(
        Animated.timing(spinAnim, { toValue: 1, duration: 1200, useNativeDriver: true })
      );
      spin.start();

      // Progress bar sweep
      const bar = Animated.loop(
        Animated.sequence([
          Animated.timing(barAnim, { toValue: 1, duration: 1500, useNativeDriver: false }),
          Animated.timing(barAnim, { toValue: 0, duration: 0, useNativeDriver: false }),
        ])
      );
      bar.start();

      // Pulse glow
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.1, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      );
      pulse.start();

      animsRef.current = [spin, bar, pulse];
    } else {
      // FIX: Actually stop the loops instead of just resetting values
      animsRef.current.forEach(a => a.stop());
      animsRef.current = [];
      fadeAnim.setValue(0)
      spinAnim.setValue(0)
      barAnim.setValue(0)
      pulseAnim.setValue(1)
    }
  }, [visible])

  if (!visible) return null

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })

  const barLeft = barAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-30%' as any, '100%' as any],
  })

  return (
    <Modal transparent visible={visible} statusBarTranslucent animationType="none">
      <Animated.View style={[s.backdrop, { opacity: fadeAnim }]}>
        <Animated.View style={[s.card, { transform: [{ scale: pulseAnim }] }]}>
          <LinearGradient
            colors={['rgba(10,30,70,0.98)', 'rgba(5,15,40,0.98)']}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />

          {/* Glow accent top */}
          <View style={s.glowTop} />

          {/* Spinner */}
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <Loader color="#00E5FF" size={iconSize.xl} strokeWidth={2.5} />
          </Animated.View>

          {/* Message */}
          <Text style={s.message}>{message}</Text>

          {/* Progress bar */}
          <View style={s.barContainer}>
            <Animated.View style={[s.barFill, { left: barLeft }]}>
              <LinearGradient
                colors={['transparent', '#00E5FF', '#00E5FF', 'transparent']}
                style={s.barGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </Animated.View>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  )
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: scale(220),
    backgroundColor: 'rgba(10,30,70,0.98)',
    borderRadius: radius.xxl,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    gap: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.2)',
    overflow: 'hidden',
  },
  glowTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: scale(3),
    backgroundColor: '#00E5FF',
  },
  message: {
    color: '#fff',
    fontSize: fonts.base,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  barContainer: {
    width: '100%',
    height: scale(4),
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radius.xxs,
    overflow: 'hidden',
  },
  barFill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '30%',
  },
  barGradient: {
    flex: 1,
    borderRadius: radius.xxs,
  },
})
