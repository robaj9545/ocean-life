import { LinearGradient } from 'expo-linear-gradient'
import { Dna, Sparkles, X } from 'lucide-react-native'
import React, { useRef, useState } from 'react'
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { fishService } from '../services/fishService'
import { FishEntity, useGameStore, LEVEL_UNLOCKS } from '../store/useGameStore'
import { breed } from '../utils/breeding'
import { FishCard, FishSlot, PulseHeart } from '../components/screens/BreedingComponents'
import { useAlert } from '../components/ui/Alert'
import { getSpeciesName } from '../data/species'

// ─── Main ─────────────────────────────────────────────────────────────────────

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function BreedingScreen({ onClose }: { onClose?: () => void }) {
  const fishes = useGameStore(state => state.fishes)
  const addFish = useGameStore(state => state.addFish)
  const incrementStat = useGameStore(state => state.incrementStat)
  const [selected, setSelected] = useState<FishEntity[]>([])
  const [breeding, setBreeding] = useState(false)
  const breedAnim = useRef(new Animated.Value(1)).current
  const { alert } = useAlert()
  const level = useGameStore(state => state.level)
  const breedingLocked = level < LEVEL_UNLOCKS.breeding

  const adults = fishes.filter(f => f.stage === 'adult')
  const canBreed = selected.length === 2 && !breedingLocked

  const toggleSelect = (fish: FishEntity) => {
    if (breedingLocked) return
    const already = selected.find(f => f.id === fish.id)
    if (already) {
      setSelected(selected.filter(f => f.id !== fish.id))
    } else if (selected.length < 2) {
      setSelected([...selected, fish])
    } else {
      alert({ type: 'warning', title: 'Atenção', message: 'Selecione apenas 2 peixes!' })
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
      alert({
        type: 'success',
        title: '💕 Nascimento!',
        message: `Um lindo ${getSpeciesName(data.species)} filhote chegou!`,
      })
      setSelected([])
    } else {
      alert({ type: 'error', title: 'Erro', message: 'Não foi possível cruzar os peixes.' })
    }
    setBreeding(false)
  }

  return (
    <View style={s.containerRow}>
      {/* Left Sidebar */}
      <View style={s.sidePanel}>
        <View style={s.headerLeft}>
          <View style={s.headerIcon}>
            <Dna color="#FF69B4" size={18} strokeWidth={2} />
          </View>
          <View>
            <Text style={s.title}>Criadouro</Text>
            <Text style={s.subtitle}>Genética</Text>
          </View>
        </View>

        <View style={s.divider} />

        {/* LEFT: Breeding station */}
        <View style={s.stationWrap}>
          <View style={s.station}>
            {/* Fish slots */}
            <View style={s.slotRow}>
              <FishSlot fish={selected[0]} label="Pai / Mãe" />
              <PulseHeart active={canBreed} />
              <FishSlot fish={selected[1]} label="Pai / Mãe" />
            </View>

            {/* Counter */}
            <Text style={s.counter}>
              {selected.length} <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>/ 2</Text>
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
                    {breeding ? 'Cruzando...' : 'Cruzar'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            {/* Info pill */}
            {breedingLocked ? (
               <View style={[s.infoPill, { backgroundColor: 'rgba(255,100,100,0.12)', borderWidth: 1, borderColor: 'rgba(255,100,100,0.25)' }]}>
                 <Text style={[s.infoText, { color: 'rgba(255,100,100,0.8)' }]}>🔒 Desbloqueie no Nível {LEVEL_UNLOCKS.breeding}</Text>
               </View>
            ) : !canBreed && (
               <View style={s.infoPill}>
                 <Text style={s.infoText}>Selecione 2 adultos</Text>
               </View>
            )}
          </View>
        </View>
      </View>

      {/* Right Content */}
      <View style={s.mainPanel}>
        {/* Absolute Close Button */}
        <TouchableOpacity style={s.closeBtnAbs} onPress={onClose}>
          <X color="rgba(255,255,255,0.6)" size={16} strokeWidth={2.5} />
        </TouchableOpacity>


        <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>

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
    </View>
  )
}

const s = StyleSheet.create({
  containerRow: { flex: 1, flexDirection: 'row', position: 'relative' },
  sidePanel: { width: 270, backgroundColor: 'rgba(0,0,0,0.15)', borderRightWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  mainPanel: { flex: 1 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255,105,180,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,105,180,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 13, fontWeight: '900', color: '#fff', letterSpacing: 0.3 },
  subtitle: { fontSize: 9, color: 'rgba(255,255,255,0.4)', fontWeight: '700', letterSpacing: 0.8, marginTop: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 10, padding: 14, paddingBottom: 0 },
  closeBtnAbs: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 28,
    height: 28,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99,
  },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.07)', marginHorizontal: 14 },

  stationWrap: { flex: 1, padding: 14 },
  body: { padding: 14, paddingTop: 40, gap: 12, paddingBottom: 40 },

  // Station (left)
  station: {
    flex: 1,
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
  gridWrap: { flex: 1, gap: 8 },
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













