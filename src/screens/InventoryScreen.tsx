import React from 'react'
import { View, Text, StyleSheet, FlatList, Dimensions, TouchableOpacity } from 'react-native'
import { Backpack, X } from 'lucide-react-native'
import { useGameStore } from '../store/useGameStore'
import ClownfishSVG from '../components/fishes/Clownfish'
import BlueTangSVG from '../components/fishes/BlueTang'

const { width } = Dimensions.get('window')
const CARD_WIDTH = (width * 0.7) / 5 - 16 // 5 columns compactodal (70% screen width)

export default function InventoryScreen({ onClose }: { onClose?: () => void }) {
  const fishes = useGameStore(state => state.fishes)

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Backpack color="#fff" size={20} style={{ marginRight: 8 }} />
          <Text style={styles.title}>Meus Peixes</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.subtitle}>{fishes.length} Nadando no Aquário</Text>
          <TouchableOpacity onPress={onClose} style={{ marginLeft: 25, padding: 5, backgroundColor: 'rgba(255,0,0,0.6)', borderRadius: 12 }}>
            <X color="#fff" size={24} />
          </TouchableOpacity>
        </View>
      </View>

      {fishes.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Você ainda não tem peixes. Compre na Loja!</Text>
        </View>
      ) : (
        <FlatList
          data={fishes}
          keyExtractor={item => item.id.toString()}
          numColumns={4}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.previewBox}>
                 {item.species === 'bluetang' ? <BlueTangSVG size={60} isBaby={item.stage === 'baby'} /> : <ClownfishSVG size={60} isBaby={item.stage === 'baby'} />}
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
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: { fontSize: 20, fontWeight: '900', color: '#fff', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 },
  subtitle: { color: '#e0e0e0', fontSize: 13, fontWeight: 'bold' },
  listContainer: { padding: 15, alignItems: 'center', paddingBottom: 40 },
  card: {
    width: CARD_WIDTH,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 10,
    margin: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3
  },
  previewBox: { width: '100%', height: 70, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  fishName: { fontSize: 13, fontWeight: '900', color: '#333', marginBottom: 4 },
  infoText: { fontSize: 10, color: '#555', marginBottom: 2, fontWeight: 'bold' },
  statusBadge: { marginTop: 6, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, width: '100%', alignItems: 'center' },
  statusText: { color: '#fff', fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
})
