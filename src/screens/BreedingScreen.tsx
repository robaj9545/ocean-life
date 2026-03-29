import { LinearGradient } from 'expo-linear-gradient'
import { Dna, Sparkles, X } from 'lucide-react-native'
import React, { useRef, useState } from 'react'
import {
  Alert,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { fishService } from '../services/fishService'
import { FishEntity, useGameStore } from '../store/useGameStore'
import { breed } from '../utils/breeding'
import { FishCard, FishSlot, PulseHeart } from '../components/screens/BreedingComponents'

// ─── Main ─────────────────────────────────────────────────────────────────────

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function BreedingScreen({ onClose }: { onClose?: () => void }) {
  const fishes = useGameStore(state => state.fishes)
  const addFish = useGameStore(state => state.addFish)
  const incrementStat = useGameStore(state => state.incrementStat)
  const [selected, setSelected] = useState<FishEntity[]>([])
  const [breeding, setBreeding] = useState(false)
  const breedAnim = useRef(new Animated.Value(1)).current

  const adults = fishes.filter(f => f.stage === 'adult')
  const canBreed = selected.length === 2

  const toggleSelect = (fish: FishEntity) => {
    const already = selected.find(f => f.id === fish.id)
    if (already) {
      setSelected(selected.filter(f => f.id !== fish.id))
    } else if (selected.length < 2) {
      setSelected([...selected, fish])
    } else {
      Alert.alert('Atenção', 'Selecione apenas 2 peixes!')
    }
  }

  const handleBreed = async () => {
    if (!canBreed) return
    setBreeding(true)
    Animated.sequence([
      Animated.timing(breedAnim, { toValue: 1.08, duration: 200, useNativeDriver: true }),
      Animated.spring(breedAnim, { toValue: 1, useNativeDriver: true, tension: 200 }),
    ]).start()

    const newFishData = breed(selected[0], selected[1])
    const { data } = await fishService.createFishOnServer(newFishData)
    if (data) {
      addFish(data)
      incrementStat('breed', 1)
      Alert.alert(
        '💕 Nascimento!',
        `Um lindo ${data.species === 'clownfish' ? 'Peixe-Palhaço' : 'Cirurgião-Patela'} filhote chegou!`,
      )
      setSelected([])
    } else {
      Alert.alert('Erro', 'Não foi possível cruzar os peixes.')
    }
    setBreeding(false)
  }

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <View style={s.headerIcon}>
            <Dna color="#FF69B4" size={18} strokeWidth={2} />
          </View>
          <View>
            <Text style={s.title}>Criadouro</Text>
            <Text style={s.subtitle}>Laboratório Genético</Text>
          </View>
        </View>
        <TouchableOpacity style={s.closeBtn} onPress={onClose}>
          <X color="rgba(255,255,255,0.6)" size={16} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <View style={s.divider} />

      <ScrollView contentContainerStyle={s.body} style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* LEFT: Breeding station */}
        <View style={s.station}>
          {/* Fish slots */}
          <View style={s.slotRow}>
            <FishSlot fish={selected[0]} label="Pai / Mãe" />
            <PulseHeart active={canBreed} />
            <FishSlot fish={selected[1]} label="Pai / Mãe" />
          </View>

          {/* Counter */}
          <Text style={s.counter}>
            {selected.length} <Text style={{ color: 'rgba(255,255,255,0.4)' }}>/ 2 selecionados</Text>
          </Text>

          {/* Breed Button */}
          <Animated.View style={{ width: '100%', transform: [{ scale: breedAnim }] }}>
            <TouchableOpacity
              style={[s.breedBtn, !canBreed && s.breedBtnDisabled]}
              onPress={handleBreed}
              disabled={!canBreed || breeding}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={canBreed ? ['#FF69B4', '#C71585'] : ['#444', '#333']}
                style={s.breedGrad}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Sparkles color={canBreed ? '#fff' : 'rgba(255,255,255,0.3)'} size={16} strokeWidth={2} />
                <Text style={[s.breedText, !canBreed && { color: 'rgba(255,255,255,0.3)' }]}>
                  {breeding ? 'Cruzando...' : 'Cruzar Agora'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Info pill */}
          {!canBreed && (
            <View style={s.infoPill}>
              <Text style={s.infoText}>Selecione 2 peixes adultos →</Text>
            </View>
          )}
        </View>

        {/* RIGHT: Fish grid */}
        <View style={s.gridWrap}>
          <Text style={s.gridTitle}>Adultos disponíveis</Text>
          <View style={s.grid}>
            {adults.length === 0 ? (
              <View style={s.empty}>
                <Text style={s.emptyEmoji}>🐟</Text>
                <Text style={s.emptyText}>Nenhum adulto{'\n'}no aquário</Text>
              </View>
            ) : (
              <View style={s.gridInner}>
                {adults.map((fish, i) => (
                  <FishCard
                    key={fish.id}
                    fish={fish}
                    index={i}
                    isSelected={!!selected.find(f => f.id === fish.id)}
                    onPress={() => toggleSelect(fish)}
                  />
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(255,105,180,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,105,180,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 17, fontWeight: '900', color: '#fff', letterSpacing: 0.3 },
  subtitle: { fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: '700', letterSpacing: 0.8, marginTop: 1 },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.07)', marginHorizontal: 18 },
  body: { flexDirection: 'row', flexWrap: 'wrap', padding: 14, gap: 12, paddingBottom: 40 },

  // Station (left)
  station: {
    flexBasis: '38%',
    flexGrow: 1,
    minWidth: 260,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 14,
    alignItems: 'center',
    gap: 14,
    justifyContent: 'center',
  },
  slotRow: { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center' },
  counter: { fontSize: 22, fontWeight: '900', color: '#FF69B4' },
  breedBtn: { width: '100%', borderRadius: 14, overflow: 'hidden' },
  breedBtnDisabled: { opacity: 0.5 },
  breedGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    gap: 7,
  },
  breedText: { color: '#fff', fontWeight: '900', fontSize: 13, letterSpacing: 0.8 },
  infoPill: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  infoText: { fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: '600' },

  // Grid (right)
  gridWrap: { flexBasis: '50%', flexGrow: 1, minWidth: 260, gap: 8 },
  gridTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  grid: { paddingBottom: 16 },
  gridInner: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, justifyContent: 'center' },
  empty: { flex: 1, alignItems: 'center', paddingTop: 30, gap: 8 },
  emptyEmoji: { fontSize: 36 },
  emptyText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 18,
  },
})













