import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Alert } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useGameStore, FishEntity } from '../store/useGameStore'
import { breed } from '../utils/breeding'
import ClownfishSVG from '../components/fishes/Clownfish'
import BlueTangSVG from '../components/fishes/BlueTang'

const { width } = Dimensions.get('window')
const CARD_WIDTH = (width - 60) / 2

export default function BreedingScreen() {
  const fishes = useGameStore(state => state.fishes)
  const addFish = useGameStore(state => state.addFish)
  const [selected, setSelected] = useState<FishEntity[]>([])

  const adults = fishes.filter(f => f.stage === 'adult')

  const toggleSelect = (fish: FishEntity) => {
    const isSelected = selected.find(f => f.id === fish.id)
    if (isSelected) {
      setSelected(selected.filter(f => f.id !== fish.id))
    } else {
      if (selected.length < 2) {
        setSelected([...selected, fish])
      } else {
        Alert.alert('Atenção', 'Você só pode selecionar 2 peixes para cruzar!')
      }
    }
  }

  const handleBreed = () => {
    if (selected.length === 2) {
      const newFish = breed(selected[0], selected[1])
      addFish(newFish) 
      Alert.alert('Sucesso! 💕', `Nasceu um lindo ${newFish.species === 'clownfish' ? 'Peixe-Palhaço' : 'Cirurgião-Patela'} filhote! Ele já está no Aquário.`)
      setSelected([])
    }
  }

  const renderFishPreview = (fish: FishEntity | undefined) => {
    if (!fish) return <View style={styles.emptyPreview}><Text style={styles.questionMark}>?</Text></View>
    return (
      <View style={styles.previewBox}>
        {fish.species === 'bluetang' ? <BlueTangSVG size={60} isBaby={false} /> : <ClownfishSVG size={60} isBaby={false} />}
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#FF1493', '#FF69B4', '#FFB6C1']} style={StyleSheet.absoluteFillObject} />

      <View style={styles.header}>
        <Text style={styles.title}>Berçário 🧬</Text>
        <Text style={styles.subtitle}>Cruze 2 peixes adultos!</Text>
      </View>

      <View style={styles.loveBox}>
        <View style={styles.heartsContainer}>
           {renderFishPreview(selected[0])}
           <Text style={styles.heartIcon}>💖</Text>
           {renderFishPreview(selected[1])}
        </View>
        <TouchableOpacity 
          style={[styles.breedBtn, selected.length !== 2 && { backgroundColor: '#ccc' }]}
          disabled={selected.length !== 2}
          onPress={handleBreed}
        >
          <Text style={styles.breedText}>Cruzar!</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.listContainer}>
        {adults.length === 0 && (
          <Text style={styles.emptyText}>Nenhum peixe adulto disponível. Espere eles crescerem no aquário primeiro!</Text>
        )}
        <View style={styles.grid}>
          {adults.map(item => {
            const isSelected = selected.find(f => f.id === item.id)
            return (
              <TouchableOpacity 
                key={item.id} 
                style={[styles.card, isSelected && styles.cardSelected]}
                onPress={() => toggleSelect(item)}
              >
                <View style={[styles.previewBoxSmall, isSelected && { backgroundColor: '#FFC0CB', borderColor: '#FF69B4' }]}>
                   {item.species === 'bluetang' ? <BlueTangSVG size={50} isBaby={false} /> : <ClownfishSVG size={50} isBaby={false} />}
                </View>
                <Text style={styles.fishName} numberOfLines={1}>{item.species === 'clownfish' ? 'Peixe-Palhaço' : 'Cirurgião'}</Text>
                {isSelected && <Text style={styles.selectedBadge}>Selecionado</Text>}
              </TouchableOpacity>
            )
          })}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.2)'
  },
  title: { fontSize: 32, fontWeight: '900', color: '#fff', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 },
  subtitle: { color: '#FFE4E1', fontSize: 16, marginTop: 5, fontWeight: 'bold' },
  loveBox: {
    margin: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8
  },
  heartsContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  heartIcon: { fontSize: 40, marginHorizontal: 20 },
  emptyPreview: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#ddd', borderStyle: 'dashed' },
  questionMark: { fontSize: 30, color: '#ccc', fontWeight: 'bold' },
  previewBox: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E0F7FA', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#00BFFF', overflow: 'hidden' },
  breedBtn: { width: '100%', backgroundColor: '#FF1493', padding: 15, borderRadius: 12, alignItems: 'center' },
  breedText: { color: '#fff', fontSize: 18, fontWeight: '900' },
  listContainer: { paddingHorizontal: 20, paddingBottom: 100 },
  emptyText: { color: '#fff', fontSize: 16, textAlign: 'center', marginTop: 20, fontWeight: 'bold', textShadowColor: '#000', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: {
    width: CARD_WIDTH,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent'
  },
  cardSelected: { borderColor: '#FF1493', backgroundColor: '#FFF0F5' },
  previewBoxSmall: { width: '100%', height: 60, backgroundColor: '#E0F7FA', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 10, overflow: 'hidden' },
  fishName: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  selectedBadge: { marginTop: 5, fontSize: 12, color: '#FF1493', fontWeight: 'bold' }
})
