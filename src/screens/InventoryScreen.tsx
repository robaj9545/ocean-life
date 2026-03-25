import React from 'react'
import { View, Text, StyleSheet, FlatList } from 'react-native'
import { useGameStore } from '../store/useGameStore'

export default function InventoryScreen() {
  const fishes = useGameStore(state => state.fishes)

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inventário ({fishes.length})</Text>

      {fishes.length === 0 ? (
        <Text style={{ marginTop: 20 }}>Você ainda não tem peixes. Compre na Loja!</Text>
      ) : (
        <FlatList
          data={fishes}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.fishName}>🐟 {item.species} ({item.rarity})</Text>
              <Text>Fome: {Math.floor(item.hunger)}% | Felicidade: {Math.floor(item.happiness)}%</Text>
              <Text>Idade: {Math.floor(item.age)} | Tamanho: {Math.floor(item.size)}</Text>
              <View style={[styles.colorBox, { backgroundColor: item.color }]} />
            </View>
          )}
        />
      )}
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
    fontWeight: 'bold',
    marginBottom: 20
  },
  card: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2
  },
  fishName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
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
