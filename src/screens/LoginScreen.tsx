import { LinearGradient } from 'expo-linear-gradient'
import { Fish, Lock, Mail, Shield, Waves } from 'lucide-react-native'
import React, { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native'
import { useAlert } from '../components/ui/Alert'
import { supabase } from '../services/supabase'
import { hapticLight } from '../utils/haptics'

// ─── Ambient Bubble ───────────────────────────────────────────────────────────
function AmbientBubble({ size, xPct, delay, screenHeight }: { size: number; xPct: number; delay: number; screenHeight: number }) {
  const floatAnim = useRef(new Animated.Value(0)).current
  const opacAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(opacAnim, { toValue: 0.7, duration: 800, useNativeDriver: true }),
            Animated.timing(floatAnim, { toValue: 1, duration: 6000 + Math.random() * 4000, useNativeDriver: true }),
            Animated.timing(opacAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
          ]),
          Animated.timing(floatAnim, { toValue: 1, duration: 7000 + Math.random() * 3000, useNativeDriver: true }),
        ]),
      ).start()
      floatAnim.setValue(0)
      opacAnim.setValue(0)
    }, delay)
    return () => clearTimeout(timer)
  }, [])

  const translateY = floatAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -screenHeight * 1.1] })

  return (
    <Animated.View
      style={[
        ab.bubble,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          left: `${xPct}%` as any,
          bottom: -size,
          opacity: opacAnim,
          transform: [{ translateY }],
        },
      ]}
    />
  )
}

const ab = StyleSheet.create({
  bubble: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
})

// ─── Input Field ──────────────────────────────────────────────────────────────
function InputField({
  icon,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  compact,
}: {
  icon: React.ReactNode
  placeholder: string
  value: string
  onChangeText: (t: string) => void
  secureTextEntry?: boolean
  keyboardType?: any
  compact?: boolean
}) {
  const [focused, setFocused] = useState(false)
  const borderAnim = useRef(new Animated.Value(0)).current

  const onFocus = () => {
    setFocused(true)
    Animated.spring(borderAnim, { toValue: 1, useNativeDriver: false, tension: 200 }).start()
  }
  const onBlur = () => {
    setFocused(false)
    Animated.spring(borderAnim, { toValue: 0, useNativeDriver: false, tension: 200 }).start()
  }

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255,255,255,0.1)', 'rgba(0,229,255,0.6)'],
  })

  const bgColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(0,0,0,0.35)', 'rgba(0,229,255,0.08)'],
  })

  const h = compact ? 36 : 44

  return (
    <Animated.View style={[inf.wrap, { borderColor, backgroundColor: bgColor, height: h, marginBottom: compact ? 8 : 12 }]}>
      <View style={[inf.iconWrap, focused && inf.iconFocused]}>{icon}</View>
      <TextInput
        style={[inf.input, { fontSize: compact ? 13 : 15 }]}
        placeholder={placeholder}
        placeholderTextColor="rgba(255,255,255,0.3)"
        autoCapitalize="none"
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        onBlur={onBlur}
      />
    </Animated.View>
  )
}

const inf = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    gap: 8,
  },
  iconWrap: { opacity: 0.5 },
  iconFocused: { opacity: 1 },
  input: {
    flex: 1,
    color: '#fff',
    fontWeight: '600',
  },
})

// ─── Bubble Config ────────────────────────────────────────────────────────────
const BUBBLES = [
  { size: 10, xPct: 10, delay: 0 },
  { size: 18, xPct: 25, delay: 1200 },
  { size: 7, xPct: 40, delay: 700 },
  { size: 14, xPct: 55, delay: 2000 },
  { size: 11, xPct: 70, delay: 400 },
  { size: 22, xPct: 82, delay: 1600 },
  { size: 8, xPct: 92, delay: 900 },
]

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const { width, height } = useWindowDimensions()

  const cardAnim = useRef(new Animated.Value(0)).current
  const logoAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.stagger(150, [
      Animated.spring(logoAnim, { toValue: 1, useNativeDriver: true, tension: 55, friction: 9 }),
      Animated.spring(cardAnim, { toValue: 1, useNativeDriver: true, tension: 55, friction: 9 }),
    ]).start()
  }, [])

  const { alert } = useAlert()

  const handleLogin = async () => {
    if (!email || !password) return alert({ type: 'warning', title: 'Atenção', message: 'Preencha todos os campos!' })
    setLoading(true)
    hapticLight()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) alert({ type: 'error', title: 'Erro no Login', message: error.message })
    setLoading(false)
  }

  const handleSignUp = async () => {
    if (!email || !password) return alert({ type: 'warning', title: 'Atenção', message: 'Preencha todos os campos!' })
    setLoading(true)
    hapticLight()
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) alert({ type: 'error', title: 'Erro no Cadastro', message: error.message })
    else alert({ type: 'success', title: 'Conta criada!', message: 'Bem-vindo ao Ocean Life!' })
    setLoading(false)
  }

  // Landscape layout: logo LEFT, form RIGHT
  // Compact sizing to fit everything without scrolling
  const isLandscape = width > height
  const logoSize = Math.min(height * 0.18, 56)
  const titleSize = Math.min(height * 0.08, 26)
  const taglineSize = Math.min(height * 0.04, 12)
  const cardMaxWidth = isLandscape ? Math.min(width * 0.42, 380) : Math.min(width * 0.9, 400)

  return (
    <View style={s.container}>
      {/* Deep ocean gradient */}
      <LinearGradient
        colors={['#020D1F', '#0A2A6E', '#0D4FA0', '#0A8AD0']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0.7, y: 1 }}
      />

      {/* Floating bubbles */}
      {BUBBLES.map((b, i) => (
        <AmbientBubble key={i} size={b.size} xPct={b.xPct} delay={b.delay} screenHeight={height} />
      ))}

      {/* Subtle bottom sand */}
      <LinearGradient
        colors={['transparent', 'rgba(15,40,80,0.8)']}
        style={[StyleSheet.absoluteFillObject, { top: height * 0.75 }]}
      />

      <KeyboardAvoidingView
        style={s.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[s.landscapeRow, !isLandscape && s.portraitColumn]}>
          {/* Logo / Hero — left side in landscape */}
          <Animated.View
            style={[
              s.logoSection,
              isLandscape && { flex: 1, justifyContent: 'center' },
              {
                opacity: logoAnim,
                transform: [{ translateY: logoAnim.interpolate({ inputRange: [0, 1], outputRange: [-15, 0] }) }],
              },
            ]}
          >
            <View style={[s.logoIconWrap, { width: logoSize, height: logoSize, borderRadius: logoSize * 0.3 }]}>
              <LinearGradient colors={['#00E5FF', '#0090FF']} style={s.logoGrad}>
                <Waves color="#fff" size={logoSize * 0.5} strokeWidth={2} />
              </LinearGradient>
            </View>
            <Text style={[s.gameTitle, { fontSize: titleSize }]}>Ocean Life</Text>
            <Text style={[s.gameTagline, { fontSize: taglineSize }]}>Seu paraíso aquático te espera</Text>
          </Animated.View>

          {/* Card — right side in landscape */}
          <Animated.View
            style={[
              s.card,
              { maxWidth: cardMaxWidth },
              isLandscape && { flex: 1.2 },
              {
                opacity: cardAnim,
                transform: [{ translateY: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
              },
            ]}
          >
            {/* Mode toggle */}
            <View style={s.modeToggle}>
              <TouchableOpacity
                style={[s.modeBtn, mode === 'login' && s.modeBtnActive]}
                onPress={() => setMode('login')}
              >
                <Text style={[s.modeBtnText, mode === 'login' && s.modeBtnTextActive]}>Entrar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.modeBtn, mode === 'signup' && s.modeBtnActive]}
                onPress={() => setMode('signup')}
              >
                <Text style={[s.modeBtnText, mode === 'signup' && s.modeBtnTextActive]}>Criar Conta</Text>
              </TouchableOpacity>
            </View>

            {/* Inputs */}
            <InputField
              icon={<Mail color="#00E5FF" size={16} strokeWidth={2} />}
              placeholder="E-mail"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              compact
            />
            <InputField
              icon={<Lock color="#00E5FF" size={16} strokeWidth={2} />}
              placeholder="Senha"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              compact
            />

            {/* Submit */}
            {loading ? (
              <View style={s.loadingWrap}>
                <ActivityIndicator color="#00E5FF" size="small" />
                <Text style={s.loadingText}>Mergulhando...</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={s.submitBtn}
                onPress={mode === 'login' ? handleLogin : handleSignUp}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={mode === 'login' ? ['#00E5FF', '#0090FF'] : ['#00E5A0', '#00A86B']}
                  style={s.submitGrad}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    {mode === 'login'
                      ? <Waves color="#fff" size={16} strokeWidth={2} />
                      : <Fish color="#fff" size={16} strokeWidth={2} />
                    }
                    <Text style={s.submitText}>
                      {mode === 'login' ? 'Mergulhar' : 'Criar Conta'}
                    </Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            )}

            {/* Footer inside card */}
            <View style={s.footerRow}>
              <Shield color="rgba(255,255,255,0.25)" size={10} strokeWidth={2} />
              <Text style={s.footer}>Dados seguros e criptografados</Text>
            </View>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1 },
  kav: { flex: 1 },

  // Landscape: horizontal row layout
  landscapeRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    gap: 24,
  },
  // Portrait fallback: vertical column
  portraitColumn: {
    flexDirection: 'column',
    paddingHorizontal: 24,
    gap: 16,
  },

  // Logo
  logoSection: { alignItems: 'center', gap: 6 },
  logoIconWrap: {
    overflow: 'hidden',
    marginBottom: 4,
    ...Platform.select({
      ios: { shadowColor: '#00E5FF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.7, shadowRadius: 16 },
      android: { elevation: 10 },
    }),
  },
  logoGrad: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  gameTitle: {
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,229,255,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  gameTagline: {
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  // Card
  card: {
    width: '100%',
    backgroundColor: 'rgba(8,20,45,0.9)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.15)',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.6, shadowRadius: 24 },
      android: { elevation: 14 },
    }),
  },

  // Mode toggle
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 10,
    padding: 2,
    marginBottom: 12,
  },
  modeBtn: { flex: 1, paddingVertical: 7, borderRadius: 8, alignItems: 'center' },
  modeBtnActive: { backgroundColor: 'rgba(0,229,255,0.15)', borderWidth: 1, borderColor: 'rgba(0,229,255,0.3)' },
  modeBtnText: { fontSize: 12, fontWeight: '800', color: 'rgba(255,255,255,0.35)', letterSpacing: 0.3 },
  modeBtnTextActive: { color: '#00E5FF' },

  // Submit
  submitBtn: { borderRadius: 10, overflow: 'hidden', marginTop: 4 },
  submitGrad: { paddingVertical: 10, alignItems: 'center', justifyContent: 'center' },
  submitText: { color: '#fff', fontSize: 14, fontWeight: '900', letterSpacing: 0.5 },

  // Loading
  loadingWrap: { alignItems: 'center', paddingVertical: 12, gap: 6 },
  loadingText: { color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: '700' },

  // Footer
  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 10 },
  footer: {
    color: 'rgba(255,255,255,0.25)',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
})
