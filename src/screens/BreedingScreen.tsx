import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { useGameStore, FishEntity } from '../store/useGameStore'
import { breed } from '../utils/breeding'

export default function BreedingScreen() {
  const fishes = useGameStore(state => state.fishes)
  const addFish = useGameStore(state => state.addFish)
  const [selected, setSelected] = useState<FishEntity[]>([])

  const toggleSelect = (fish: FishEntity) => {
    const isSelected = selected.find(f => f.id === fish.id)
    if (isSelected) {
      setSelected(selected.filter(f => f.id !== fish.id))
    } else {
      if (selected.length < 2) {
        setSelected([...selected, fish])
      }
    }
  }

  const handleBreed = () => {
    if (selected.length === 2) {
      const newFish = breed(selected[0], selected[1])
      addFish(newFish) // We add it directly to store for simplicity. (Wait, we should emit ADD_EGG event, but screens don't have GameEngine ref. So we just add it to store and next reload it will show up, or we can just say it hatched instantly for now).
      alert(`Cruzamento realizado! Nasceu um ${newFish.species} (${newFish.rarity})! Feche o app e abra novamente para ver ele (por enquanto) ou olhe no inventário.`)
      setSelected([])
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cruzamento 🧬</Text>
      <Text style={styles.subtitle}>Selecione 2 peixes para cruzar</Text>
      
      <View style={styles.selectedBox}>
        <Text style={styles.selectedText}>Peixe 1: {selected[0]?.species || '...'}</Text>
        <Text style={styles.selectedText}>Peixe 2: {selected[1]?.species || '...'}</Text>
        <TouchableOpacity 
          style={[styles.actionBtn, selected.length !== 2 && { backgroundColor: '#ccc' }]}
          disabled={selected.length !== 2}
          onPress={handleBreed}
        >
          <Text style={styles.actionText}>Cruzar!</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }}>
        {fishes.filter(f => f.age > 100).length === 0 && (
          <Text>Nenhum peixe com idade suficiente para cruzar (idade &gt; 100).</Text>
        )}
        {fishes.filter(f => f.age > 100).map(item => {
          const isSelected = selected.find(f => f.id === item.id)
          return (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.card, isSelected && styles.cardSelected]}
              onPress={() => toggleSelect(item)}
            >
              <Text style={styles.fishName}>🐟 {item.species} ({item.rarity})</Text>
              <View style={[styles.colorBox, { backgroundColor: item.color }]} />
            </TouchableOpacity>
          )
        })}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 40
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold'
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20
  },
  selectedBox: {
    backgroundColor: '#e6f7ff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20
  },
  selectedText: {
    fontSize: 18,
    marginBottom: 5
  },
  actionBtn: {
    marginTop: 10,
    backgroundColor: '#d86f0c',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  actionText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18
  },
  card: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: '#1ca3ec',
    backgroundColor: '#e6f7ff'
  },
  fishName: {
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'capitalize'
  },
  colorBox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    position: 'absolute',
    top: 15,
    right: 15
  }
})
