import { LinearGradient } from 'expo-linear-gradient'
import { Fish, Lock, Mail, Shield, Waves } from 'lucide-react-native'
import React, { useEffect, useRef, useState } from 'react'
import {
    ActivityIndicator,
    Animated,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from 'react-native'
import { useAlert } from '../components/ui/Alert'
import { supabase } from '../services/supabase'
import { fonts, iconSize, radius, scale, spacing } from '../utils/responsive'

// ─── Ambient Bubble ───────────────────────────────────────────────────────────
function AmbientBubble({ size, xPct, delay, screenHeight }: { size: number; xPct: number; delay: number; screenHeight: number }) {
  const floatAnim = useRef(new Animated.Value(0)).current
  const opacAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    setTimeout(() => {
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
  }, [])

  const translateY = floatAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -screenHeight * 1.1] })
  const scaledSize = scale(size)

  return (
    <Animated.View
      style={[
        ab.bubble,
        {
          width: scaledSize,
          height: scaledSize,
          borderRadius: scaledSize / 2,
          left: `${xPct}%` as any,
          bottom: -scaledSize,
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
}: {
  icon: React.ReactNode
  placeholder: string
  value: string
  onChangeText: (t: string) => void
  secureTextEntry?: boolean
  keyboardType?: any
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

  return (
    <Animated.View style={[inf.wrap, { borderColor, backgroundColor: bgColor }]}>
      <View style={[inf.iconWrap, focused && inf.iconFocused]}>{icon}</View>
      <TextInput
        style={inf.input}
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
    height: scale(48),
    borderRadius: radius.md,
    borderWidth: 1.5,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  iconWrap: { opacity: 0.5 },
  iconFocused: { opacity: 1 },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: fonts.lg,
    fontWeight: '600',
  },
})

// ─── Bubble Config ────────────────────────────────────────────────────────────
const BUBBLES = [
  { size: 12, xPct: 10, delay: 0 },
  { size: 22, xPct: 25, delay: 1200 },
  { size: 8, xPct: 40, delay: 700 },
  { size: 18, xPct: 55, delay: 2000 },
  { size: 14, xPct: 70, delay: 400 },
  { size: 28, xPct: 82, delay: 1600 },
  { size: 10, xPct: 92, delay: 900 },
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
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) alert({ type: 'error', title: 'Erro no Login', message: error.message })
    setLoading(false)
  }

  const handleSignUp = async () => {
    if (!email || !password) return alert({ type: 'warning', title: 'Atenção', message: 'Preencha todos os campos!' })
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) alert({ type: 'error', title: 'Erro no Cadastro', message: error.message })
    else alert({ type: 'success', title: 'Conta criada!', message: 'Bem-vindo ao Ocean Life!' })
    setLoading(false)
  }

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
        <ScrollView contentContainerStyle={s.scrollContent} style={s.scroll} showsVerticalScrollIndicator={false}>
          {/* Logo / Hero */}
        <Animated.View
          style={[
            s.logoSection,
            {
              opacity: logoAnim,
              transform: [{ translateY: logoAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }],
            },
          ]}
        >
          <View style={s.logoIconWrap}>
            <LinearGradient colors={['#00E5FF', '#0090FF']} style={s.logoGrad}>
              <Waves color="#fff" size={iconSize.xl} strokeWidth={2} />
            </LinearGradient>
          </View>
          <Text style={s.gameTitle}>Ocean Life</Text>
          <Text style={s.gameTagline}>Seu paraíso aquático te espera</Text>
        </Animated.View>

        {/* Card */}
        <Animated.View
          style={[
            s.card,
            {
              opacity: cardAnim,
              transform: [{ translateY: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
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
            icon={<Mail color="#00E5FF" size={iconSize.md} strokeWidth={2} />}
            placeholder="E-mail"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <InputField
            icon={<Lock color="#00E5FF" size={iconSize.md} strokeWidth={2} />}
            placeholder="Senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {/* Submit */}
          {loading ? (
            <View style={s.loadingWrap}>
              <ActivityIndicator color="#00E5FF" size="large" />
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
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                  {mode === 'login'
                    ? <Waves color="#fff" size={iconSize.md} strokeWidth={2} />
                    : <Fish color="#fff" size={iconSize.md} strokeWidth={2} />
                  }
                  <Text style={s.submitText}>
                    {mode === 'login' ? 'Mergulhar' : 'Criar Conta'}
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </Animated.View>

        <View style={s.footerRow}>
          <Shield color="rgba(255,255,255,0.25)" size={iconSize.xs} strokeWidth={2} />
          <Text style={s.footer}>Seus dados estão seguros e criptografados</Text>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1 },
  kav: { flex: 1 },
  scroll: { flex: 1, width: '100%' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: spacing.xxxl, paddingHorizontal: spacing.xxl },

  // Logo
  logoSection: { alignItems: 'center', marginBottom: spacing.xxl, gap: spacing.sm },
  logoIconWrap: {
    width: scale(72),
    height: scale(72),
    borderRadius: radius.xxl,
    overflow: 'hidden',
    marginBottom: spacing.xs,
    ...Platform.select({
      ios: { shadowColor: '#00E5FF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.7, shadowRadius: 16 },
      android: { elevation: 10 },
    }),
  },
  logoGrad: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  gameTitle: {
    fontSize: fonts.hero,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,229,255,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  gameTagline: {
    fontSize: fonts.base,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  // Card
  card: {
    width: '100%',
    backgroundColor: 'rgba(8,20,45,0.9)',
    borderRadius: radius.xxl,
    padding: spacing.xl,
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
    borderRadius: radius.md,
    padding: spacing.xxs,
    marginBottom: spacing.xl,
  },
  modeBtn: { flex: 1, paddingVertical: spacing.sm, borderRadius: radius.md - 2, alignItems: 'center' },
  modeBtnActive: { backgroundColor: 'rgba(0,229,255,0.15)', borderWidth: 1, borderColor: 'rgba(0,229,255,0.3)' },
  modeBtnText: { fontSize: fonts.base, fontWeight: '800', color: 'rgba(255,255,255,0.35)', letterSpacing: 0.3 },
  modeBtnTextActive: { color: '#00E5FF' },

  // Submit
  submitBtn: { borderRadius: radius.md, overflow: 'hidden', marginTop: spacing.xs },
  submitGrad: { paddingVertical: spacing.lg, alignItems: 'center', justifyContent: 'center' },
  submitText: { color: '#fff', fontSize: fonts.lg, fontWeight: '900', letterSpacing: 0.5 },

  // Loading
  loadingWrap: { alignItems: 'center', paddingVertical: spacing.xl, gap: spacing.sm },
  loadingText: { color: 'rgba(255,255,255,0.5)', fontSize: fonts.base, fontWeight: '700' },

  // Footer
  footerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.xl },
  footer: {
    color: 'rgba(255,255,255,0.25)',
    fontSize: fonts.md,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
})
