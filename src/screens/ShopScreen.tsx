import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useGameStore } from '../store/useGameStore'
import { createFish } from '../entities/createFish'

export default function ShopScreen() {
  const coins = useGameStore(state => state.coins)
  const addCoins = useGameStore(state => state.addCoins)
  const addFish = useGameStore(state => state.addFish)

  const buyFish = (price: number, rarity: any) => {
    if (coins >= price) {
      addCoins(-price)
      addFish(createFish({ rarity }))
      alert(`Você comprou um peixe ${rarity}! Ele já está no Aquário.`)
    } else {
      alert('Moedas insuficientes!')
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Loja</Text>
      <Text style={styles.subtitle}>Moedas: 🪙 {coins}</Text>

      <View style={styles.itemContainer}>
        <Text style={styles.itemText}>🐟 Peixe Comum</Text>
        <TouchableOpacity style={styles.buyButton} onPress={() => buyFish(50, 'common')}>
          <Text style={styles.buyText}>50 🪙</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.itemContainer}>
        <Text style={styles.itemText}>🐠 Peixe Raro</Text>
        <TouchableOpacity style={styles.buyButton} onPress={() => buyFish(200, 'rare')}>
          <Text style={styles.buyText}>200 🪙</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.itemContainer}>
        <Text style={styles.itemText}>🦈 Peixe Épico</Text>
        <TouchableOpacity style={styles.buyButton} onPress={() => buyFish(1000, 'epic')}>
          <Text style={styles.buyText}>1000 🪙</Text>
        </TouchableOpacity>
      </View>
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
    marginBottom: 5
  },
  subtitle: {
    fontSize: 18,
    color: '#555',
    marginBottom: 20
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginBottom: 10
  },
  itemText: {
    fontSize: 20
  },
  buyButton: {
    backgroundColor: '#1ca3ec',
    padding: 10,
    borderRadius: 8
  },
  buyText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  }
})
