import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Alert } from 'react-native'
import { Heart, Dna, X } from 'lucide-react-native'
import { useGameStore, FishEntity } from '../store/useGameStore'
import { breed } from '../utils/breeding'
import ClownfishSVG from '../components/fishes/Clownfish'
import BlueTangSVG from '../components/fishes/BlueTang'

const { width } = Dimensions.get('window')
const CARD_WIDTH = (width * 0.7 - 100) / 4

export default function BreedingScreen({ onClose }: { onClose?: () => void }) {
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
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Dna color="#fff" size={20} style={{ marginRight: 8 }} />
          <Text style={styles.title}>Laboratório de Genética</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.subtitle}>Selecione 2 peixes para cruzar</Text>
          <TouchableOpacity onPress={onClose} style={{ marginLeft: 25, padding: 5, backgroundColor: 'rgba(255,0,0,0.6)', borderRadius: 12 }}>
            <X color="#fff" size={24} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.contentRow}>
        <View style={styles.loveBox}>
          <Text style={styles.loveBoxTitle}>Pais Selecionados</Text>
          <View style={styles.heartsContainer}>
             {renderFishPreview(selected[0])}
             <View style={{ marginHorizontal: 15 }}>
               <Heart color="#FF1493" fill="#FF1493" size={32} />
             </View>
             {renderFishPreview(selected[1])}
          </View>
          <TouchableOpacity 
            style={[styles.breedBtn, selected.length !== 2 && { backgroundColor: '#ccc' }]}
            disabled={selected.length !== 2}
            onPress={handleBreed}
          >
            <Text style={styles.breedText}>Cruzar Agora!</Text>
          </TouchableOpacity>
        </View>

        <View style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.listContainer}>
            {adults.length === 0 && (
              <Text style={styles.emptyText}>Nenhum peixe adulto disponível no Aquário.</Text>
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
                       {item.species === 'bluetang' ? <BlueTangSVG size={45} isBaby={false} /> : <ClownfishSVG size={45} isBaby={false} />}
                    </View>
                    <Text style={styles.fishName} numberOfLines={1}>{item.species === 'clownfish' ? 'Peixe-Palhaço' : 'Cirurgião'}</Text>
                    {isSelected && <Text style={styles.selectedBadge}>Selecionado</Text>}
                  </TouchableOpacity>
                )
              })}
            </View>
          </ScrollView>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: { fontSize: 20, fontWeight: '900', color: '#fff', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 },
  subtitle: { color: '#FFE4E1', fontSize: 13, fontWeight: 'bold' },
  contentRow: { flex: 1, flexDirection: 'row' },
  loveBox: {
    width: '35%',
    margin: 15,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4
  },
  loveBoxTitle: { fontSize: 15, fontWeight: '900', color: '#333', marginBottom: 15 },
  heartsContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  heartIcon: { fontSize: 28, marginHorizontal: 10 },
  emptyPreview: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.5)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#ccc', borderStyle: 'dashed' },
  questionMark: { fontSize: 22, color: '#999', fontWeight: 'bold' },
  previewBox: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#E0F7FA', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#00BFFF', overflow: 'hidden' },
  breedBtn: { width: '100%', backgroundColor: '#FF1493', paddingVertical: 12, borderRadius: 10, alignItems: 'center', elevation: 3 },
  breedText: { color: '#fff', fontSize: 14, fontWeight: '900', textTransform: 'uppercase' },
  listContainer: { padding: 15 },
  emptyText: { color: '#fff', fontSize: 14, textAlign: 'center', marginTop: 20, fontWeight: 'bold' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' },
  card: {
    width: CARD_WIDTH,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 10,
    marginRight: 10,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2
  },
  cardSelected: { borderColor: '#FF1493', backgroundColor: '#FFF0F5' },
  previewBoxSmall: { width: '100%', height: 50, backgroundColor: '#E0F7FA', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 5, overflow: 'hidden' },
  fishName: { fontSize: 12, fontWeight: 'bold', color: '#333' },
  selectedBadge: { marginTop: 2, fontSize: 10, color: '#FF1493', fontWeight: 'bold' }
})
