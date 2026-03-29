import { LinearGradient } from 'expo-linear-gradient'
import { Lock, Mail, Waves } from 'lucide-react-native'
import React, { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { supabase } from '../services/supabase'

const { width, height } = Dimensions.get('window')

// ─── Ambient Bubble ───────────────────────────────────────────────────────────
function AmbientBubble({ size, x, delay }: { size: number; x: number; delay: number }) {
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

  const translateY = floatAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -height * 1.1] })

  return (
    <Animated.View
      style={[
        ab.bubble,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          left: x,
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
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    gap: 10,
    marginBottom: 12,
  },
  iconWrap: { opacity: 0.5 },
  iconFocused: { opacity: 1 },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
})

// ─── Main ─────────────────────────────────────────────────────────────────────
const BUBBLES = [
  { size: 12, x: width * 0.1, delay: 0 },
  { size: 22, x: width * 0.25, delay: 1200 },
  { size: 8, x: width * 0.4, delay: 700 },
  { size: 18, x: width * 0.55, delay: 2000 },
  { size: 14, x: width * 0.7, delay: 400 },
  { size: 28, x: width * 0.82, delay: 1600 },
  { size: 10, x: width * 0.92, delay: 900 },
]

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'login' | 'signup'>('login')

  const cardAnim = useRef(new Animated.Value(0)).current
  const logoAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.stagger(150, [
      Animated.spring(logoAnim, { toValue: 1, useNativeDriver: true, tension: 55, friction: 9 }),
      Animated.spring(cardAnim, { toValue: 1, useNativeDriver: true, tension: 55, friction: 9 }),
    ]).start()
  }, [])

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Atenção', 'Preencha todos os campos!')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) Alert.alert('Erro no Login', error.message)
    setLoading(false)
  }

  const handleSignUp = async () => {
    if (!email || !password) return Alert.alert('Atenção', 'Preencha todos os campos!')
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) Alert.alert('Erro no Cadastro', error.message)
    else Alert.alert('✅ Conta criada!', 'Bem-vindo ao Segredos do Mar!')
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
        <AmbientBubble key={i} size={b.size} x={b.x} delay={b.delay} />
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
              <Waves color="#fff" size={32} strokeWidth={2} />
            </LinearGradient>
          </View>
          <Text style={s.gameTitle}>Segredos do Mar</Text>
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
            icon={<Mail color="#00E5FF" size={18} strokeWidth={2} />}
            placeholder="E-mail"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <InputField
            icon={<Lock color="#00E5FF" size={18} strokeWidth={2} />}
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
                <Text style={s.submitText}>
                  {mode === 'login' ? '🌊 Mergulhar' : '🐠 Criar Conta'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </Animated.View>

        <Text style={s.footer}>🔒 Seus dados estão seguros e criptografados</Text>
      </KeyboardAvoidingView>
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1 },
  kav: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 28 },

  // Logo
  logoSection: { alignItems: 'center', marginBottom: 32, gap: 10 },
  logoIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 6,
    ...Platform.select({
      ios: { shadowColor: '#00E5FF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.7, shadowRadius: 16 },
      android: { elevation: 10 },
    }),
  },
  logoGrad: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  gameTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,229,255,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  gameTagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  // Card
  card: {
    width: '100%',
    backgroundColor: 'rgba(8,20,45,0.9)',
    borderRadius: 24,
    padding: 22,
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
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
  },
  modeBtn: { flex: 1, paddingVertical: 10, borderRadius: 11, alignItems: 'center' },
  modeBtnActive: { backgroundColor: 'rgba(0,229,255,0.15)', borderWidth: 1, borderColor: 'rgba(0,229,255,0.3)' },
  modeBtnText: { fontSize: 14, fontWeight: '800', color: 'rgba(255,255,255,0.35)', letterSpacing: 0.3 },
  modeBtnTextActive: { color: '#00E5FF' },

  // Submit
  submitBtn: { borderRadius: 14, overflow: 'hidden', marginTop: 6 },
  submitGrad: { paddingVertical: 15, alignItems: 'center', justifyContent: 'center' },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },

  // Loading
  loadingWrap: { alignItems: 'center', paddingVertical: 20, gap: 8 },
  loadingText: { color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '700' },

  // Footer
  footer: {
    color: 'rgba(255,255,255,0.25)',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 20,
    letterSpacing: 0.3,
  },
})





