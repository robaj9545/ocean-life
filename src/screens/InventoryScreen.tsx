import React from 'react'
import { View, Text, StyleSheet, FlatList, Dimensions } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useGameStore } from '../store/useGameStore'
import ClownfishSVG from '../components/fishes/Clownfish'
import BlueTangSVG from '../components/fishes/BlueTang'

const { width } = Dimensions.get('window')
const CARD_WIDTH = (width - 60) / 2

export default function InventoryScreen() {
  const fishes = useGameStore(state => state.fishes)

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#00BFFF', '#1E90FF', '#00008B']} style={StyleSheet.absoluteFillObject} />

      <View style={styles.header}>
        <Text style={styles.title}>Meus Peixes</Text>
        <Text style={styles.subtitle}>{fishes.length} Nadando no Aquário</Text>
      </View>

      {fishes.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Você ainda não tem peixes. Compre na Loja!</Text>
        </View>
      ) : (
        <FlatList
          data={fishes}
          keyExtractor={item => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.previewBox}>
                 {item.species === 'bluetang' ? <BlueTangSVG size={70} isBaby={item.stage === 'baby'} /> : <ClownfishSVG size={70} isBaby={item.stage === 'baby'} />}
              </View>
              <Text style={styles.fishName} numberOfLines={1}>{item.species === 'clownfish' ? 'Peixe-Palhaço' : 'Cirurgião-Patela'}</Text>
              <Text style={styles.infoText}>Fome: {Math.floor(item.hunger)}%</Text>
              <Text style={styles.infoText}>{item.stage === 'baby' ? 'Filhote' : 'Adulto'}</Text>
              <View style={[styles.statusBadge, { backgroundColor: item.hunger > 50 ? '#32CD32' : '#FF4500' }]}>
                <Text style={styles.statusText}>{item.hunger > 50 ? 'Satisfeito' : 'Com Fome'}</Text>
              </View>
            </View>
          )}
        />
      )}
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
  subtitle: { color: '#e0e0e0', fontSize: 16, marginTop: 5, fontWeight: 'bold' },
  listContainer: { padding: 20, paddingBottom: 100 },
  card: {
    width: CARD_WIDTH,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    padding: 15,
    marginRight: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5
  },
  previewBox: { width: '100%', height: 80, backgroundColor: '#E0F7FA', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#B2EBF2' },
  fishName: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  infoText: { fontSize: 12, color: '#666', marginBottom: 2, fontWeight: 'bold' },
  statusBadge: { marginTop: 10, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  statusText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { color: '#fff', fontSize: 18, textAlign: 'center', fontWeight: 'bold' }
})
