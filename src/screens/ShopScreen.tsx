import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Dimensions } from 'react-native'
import { ShoppingCart, Skull, Store, ArrowUpCircle, Coins, X } from 'lucide-react-native'
import { useGameStore } from '../store/useGameStore'
import { createFish } from '../entities/createFish'
import ClownfishSVG from '../components/fishes/Clownfish'
import BlueTangSVG from '../components/fishes/BlueTang'

const { width } = Dimensions.get('window')

export default function ShopScreen({ onClose }: { onClose?: () => void }) {
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
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {activeTab === 'shop' ? <ShoppingCart color="#fff" size={24} style={{ marginRight: 8 }} /> : <Skull color="#fff" size={24} style={{ marginRight: 8 }} />}
          <Text style={styles.title}>{activeTab === 'shop' ? 'Loja Submarina' : 'Necrotério'}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={[styles.tab, activeTab === 'shop' && styles.activeTab]} onPress={() => setActiveTab('shop')}>
            <Store color="#fff" size={18} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, activeTab === 'cemetery' && styles.activeTabNemetry]} onPress={() => setActiveTab('cemetery')}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Skull color="#fff" size={18} />
              <Text style={[styles.tabText, { marginLeft: 6 }]}>{deadFishes.length}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={{ marginLeft: 25, padding: 5, backgroundColor: 'rgba(255,0,0,0.6)', borderRadius: 12 }}>
            <X color="#fff" size={24} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {activeTab === 'shop' ? (
          <View style={styles.grid}>
            {/* Clownfish Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                 <Text style={styles.fishName}>Peixe-Palhaço</Text>
                 <Text style={styles.rarityBadge}>Comum</Text>
              </View>
              <View style={styles.previewBox}>
                 <ClownfishSVG size={80} isBaby={true} />
              </View>
              <Text style={styles.desc}>Alegre e resistente. Gera moedas em ritmo moderado.</Text>
              <TouchableOpacity style={styles.buyBtn} onPress={() => buyFish(50, 'clownfish', 'common')}>
                 <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <ShoppingCart color="#fff" size={14} style={{ marginRight: 4 }} />
                    <Text style={styles.buyText}>50</Text>
                    <Coins color="#FFD700" size={14} style={{ marginLeft: 4 }} />
                 </View>
              </TouchableOpacity>
            </View>

            {/* Blue Tang Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                 <Text style={styles.fishName}>Cirurgião-Patela</Text>
                 <Text style={[styles.rarityBadge, { backgroundColor: '#9370DB' }]}>Raro</Text>
              </View>
              <View style={styles.previewBox}>
                 <BlueTangSVG size={90} isBaby={true} />
              </View>
              <Text style={styles.desc}>Esquecido mas cresce rápido e gera mais moedas!</Text>
              <TouchableOpacity style={[styles.buyBtn, { backgroundColor: '#8A2BE2' }]} onPress={() => buyFish(150, 'bluetang', 'rare')}>
                 <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <ShoppingCart color="#fff" size={14} style={{ marginRight: 4 }} />
                    <Text style={styles.buyText}>150</Text>
                    <Coins color="#FFD700" size={14} style={{ marginLeft: 4 }} />
                 </View>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.grid}>
            {deadFishes.length > 0 ? deadFishes.map((ghost) => {
              const reviveCost = ghost.species === 'clownfish' ? 25 : 75;
              const daysLeft = ghost.deathTime ? Math.max(0, Math.ceil((30 * 24 * 60 * 60 * 1000 - (Date.now() - ghost.deathTime)) / (1000 * 60 * 60 * 24))) : 30;

              return (
                <View key={ghost.id} style={[styles.card, { backgroundColor: 'rgba(255,255,255,0.4)', borderWidth: 1, borderColor: '#ccc' }]}>
                  <View style={styles.cardHeader}>
                     <Text style={[styles.fishName, { textDecorationLine: 'line-through', color: '#555' }]}>{ghost.species}</Text>
                     <Text style={[styles.rarityBadge, { backgroundColor: '#333' }]}>Morto</Text>
                  </View>
                  <View style={[styles.previewBox, { backgroundColor: 'transparent', opacity: 0.5 }]}>
                     {ghost.species === 'bluetang' ? <BlueTangSVG size={80} isBaby={ghost.stage === 'baby'} /> : <ClownfishSVG size={80} isBaby={ghost.stage === 'baby'} />}
                  </View>
                  <Text style={styles.desc}>Expirará em {daysLeft} dias.</Text>
                  <TouchableOpacity style={[styles.buyBtn, { backgroundColor: '#8B008B' }]} onPress={() => {
                     if (coins >= reviveCost) {
                       reviveFish(ghost.id, reviveCost);
                       Alert.alert('Milagre!', 'Peixe ressuscitado com sucesso!');
                     } else {
                       Alert.alert('Erro', 'Moedas insuficientes!');
                     }
                  }}>
                     <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <ArrowUpCircle color="#fff" size={14} style={{ marginRight: 4 }} />
                        <Text style={styles.buyText}>{reviveCost}</Text>
                        <Coins color="#FFD700" size={14} style={{ marginLeft: 4 }} />
                     </View>
                  </TouchableOpacity>
                </View>
              );
            }) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Nenhum peixe morreu de fome... ainda.</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)'
  },
  headerRight: {
    flexDirection: 'row'
  },
  tab: { paddingHorizontal: 15, paddingVertical: 6, borderRadius: 15, marginLeft: 10, backgroundColor: 'rgba(0,0,0,0.3)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  activeTab: { backgroundColor: '#1E90FF', borderColor: '#4da6ff' },
  activeTabNemetry: { backgroundColor: '#8B0000', borderColor: '#FF0000' },
  tabText: { color: '#fff', fontWeight: 'bold', fontSize: 12, textTransform: 'uppercase' },
  title: { fontSize: 20, fontWeight: '900', color: '#fff', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 },
  scroll: { padding: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  card: {
    width: (width * 0.7) / 4 - 20, // 4 columns compact
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 15,
    padding: 10,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
    justifyContent: 'space-between'
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  fishName: { fontSize: 13, fontWeight: '900', color: '#333' },
  rarityBadge: { backgroundColor: '#32CD32', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, color: '#fff', fontWeight: 'bold', fontSize: 9 },
  previewBox: { height: 80, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  desc: { color: '#555', fontSize: 11, marginBottom: 10, textAlign: 'center', height: 35, lineHeight: 14 },
  buyBtn: { backgroundColor: '#1E90FF', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, alignItems: 'center', elevation: 2 },
  buyText: { color: '#fff', fontSize: 11, fontWeight: '900', textTransform: 'uppercase' },
  emptyState: { alignItems: 'center', padding: 40 },
  emptyText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
})

