import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useGameStore } from '../store/useGameStore'
import { createFish } from '../entities/createFish'
import ClownfishSVG from '../components/fishes/Clownfish'
import BlueTangSVG from '../components/fishes/BlueTang'

export default function ShopScreen() {
  const [activeTab, setActiveTab] = useState<'shop' | 'cemetery'>('shop')
  const coins = useGameStore(state => state.coins)
  const deadFishes = useGameStore(state => state.deadFishes)
  const addCoins = useGameStore(state => state.addCoins)
  const addFish = useGameStore(state => state.addFish)
  const reviveFish = useGameStore(state => state.reviveFish)

  const buyFish = (price: number, species: string, rarity: string) => {
    if (coins >= price) {
      addCoins(-price)
      addFish(createFish({ species, rarity, stage: 'baby' }))
      Alert.alert('Sucesso!', `Você comprou um ${species}! Ele já está no Aquário como filhote.`)
    } else {
      Alert.alert('Poxa...', 'Você não tem moedas suficientes!')
    }
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={activeTab === 'shop' ? ['#00BFFF', '#1E90FF', '#00008B'] : ['#2c3e50', '#000000']} style={StyleSheet.absoluteFillObject} />
      
      <View style={styles.header}>
        <Text style={styles.title}>{activeTab === 'shop' ? 'Loja Submarina' : 'Necrotério'}</Text>
        <View style={styles.coinBadge}>
          <Text style={styles.coinText}>💰 {Math.floor(coins)}</Text>
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tab, activeTab === 'shop' && styles.activeTab]} onPress={() => setActiveTab('shop')}>
          <Text style={styles.tabText}>Loja</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'cemetery' && styles.activeTabNemetry]} onPress={() => setActiveTab('cemetery')}>
          <Text style={styles.tabText}>Necrotério ({deadFishes.length})</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        
        {activeTab === 'shop' ? (
          <>
            {/* Clownfish Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                 <Text style={styles.fishName}>Peixe-Palhaço</Text>
                 <Text style={styles.rarityBadge}>Comum</Text>
              </View>
              <View style={styles.previewBox}>
                 <ClownfishSVG size={100} isBaby={true} />
              </View>
              <Text style={styles.desc}>Um peixinho alegre e resistente. Gera moedas em ritmo moderado.</Text>
              <TouchableOpacity style={styles.buyBtn} onPress={() => buyFish(50, 'clownfish', 'common')}>
                 <Text style={styles.buyText}>Comprar por 50 💰</Text>
              </TouchableOpacity>
            </View>

            {/* Blue Tang Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                 <Text style={styles.fishName}>Cirurgião-Patela</Text>
                 <Text style={[styles.rarityBadge, { backgroundColor: '#9370DB' }]}>Raro</Text>
              </View>
              <View style={styles.previewBox}>
                 <BlueTangSVG size={110} isBaby={true} />
              </View>
              <Text style={styles.desc}>Lindo, porém esquecido. Cresce rápido e gera mais moedas!</Text>
              <TouchableOpacity style={styles.buyBtn} onPress={() => buyFish(150, 'bluetang', 'rare')}>
                 <Text style={styles.buyText}>Comprar por 150 💰</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          deadFishes.length > 0 ? deadFishes.map((ghost) => {
            const reviveCost = ghost.species === 'clownfish' ? 25 : 75;
            const daysLeft = ghost.deathTime ? Math.max(0, Math.ceil((30 * 24 * 60 * 60 * 1000 - (Date.now() - ghost.deathTime)) / (1000 * 60 * 60 * 24))) : 30;

            return (
              <View key={ghost.id} style={[styles.card, { backgroundColor: 'rgba(255,255,255,0.7)' }]}>
                <View style={styles.cardHeader}>
                   <Text style={[styles.fishName, { textDecorationLine: 'line-through' }]}>Fantasma de {ghost.species === 'clownfish' ? 'Peixe-Palhaço' : 'Cirurgião-Patela'}</Text>
                   <Text style={[styles.rarityBadge, { backgroundColor: '#000' }]}>Morto</Text>
                </View>
                <View style={[styles.previewBox, { backgroundColor: '#333', borderColor: '#000' }]}>
                   {ghost.species === 'bluetang' ? <BlueTangSVG size={100} isBaby={ghost.stage === 'baby'} /> : <ClownfishSVG size={100} isBaby={ghost.stage === 'baby'} />}
                </View>
                <Text style={styles.desc}>Expirará e será apagado do servidor eternamente em {daysLeft} dias.</Text>
                <TouchableOpacity style={[styles.buyBtn, { backgroundColor: '#8B008B' }]} onPress={() => {
                   if (coins >= reviveCost) {
                     reviveFish(ghost.id, reviveCost);
                     Alert.alert('Milagre!', 'O peixe foi ressuscitado e está voltando nadando para o seu aquário!');
                   } else {
                     Alert.alert('Erro', 'Você não tem moedas suficientes para essa magia!');
                   }
                }}>
                   <Text style={styles.buyText}>Reviver por {reviveCost} 💰</Text>
                </TouchableOpacity>
              </View>
            );
          }) : (
            <Text style={{ textAlign: 'center', color: '#fff', fontSize: 18, marginTop: 40, padding: 20 }}>Ufa! Nenhum peixe morreu de fome... ainda.</Text>
          )
        )}

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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  tabContainer: { flexDirection: 'row', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.4)', padding: 10 },
  tab: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, marginHorizontal: 5 },
  activeTab: { backgroundColor: '#1E90FF' },
  activeTabNemetry: { backgroundColor: '#8B0000' },
  tabText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  title: { fontSize: 28, fontWeight: '900', color: '#fff', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 },
  coinBadge: { backgroundColor: '#FFD700', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, elevation: 5 },
  coinText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
  scroll: { padding: 20, paddingBottom: 100 },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  fishName: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  rarityBadge: { backgroundColor: '#32CD32', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, color: '#fff', fontWeight: 'bold', fontSize: 12, overflow: 'hidden' },
  previewBox: { height: 140, backgroundColor: '#E0F7FA', borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 15, borderWidth: 1, borderColor: '#B2EBF2' },
  desc: { color: '#666', fontSize: 14, marginBottom: 15, lineHeight: 20, textAlign: 'center' },
  buyBtn: { backgroundColor: '#1E90FF', padding: 15, borderRadius: 12, alignItems: 'center' },
  buyText: { color: '#fff', fontSize: 18, fontWeight: '900' }
})
