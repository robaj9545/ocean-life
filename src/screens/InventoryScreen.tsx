import { Backpack, X } from 'lucide-react-native'
import React from 'react'
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native'
import { useGameStore } from '../store/useGameStore'
import { FishCard, SummaryBar } from '../components/screens/InventoryComponents'

// ─── Main ─────────────────────────────────────────────────────────────────────

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function InventoryScreen({ onClose }: { onClose?: () => void }) {
  const fishes = useGameStore(state => state.fishes)
  const { width } = useWindowDimensions();
  const numCols = width > 600 ? 3 : 2;

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <View style={s.headerIcon}>
            <Backpack color="#B29DFF" size={18} strokeWidth={2} />
          </View>
          <View>
            <Text style={s.title}>Mochila</Text>
            <Text style={s.subtitle}>{fishes.length} peixes no aquário</Text>
          </View>
        </View>
        <TouchableOpacity style={s.closeBtn} onPress={onClose}>
          <X color="rgba(255,255,255,0.6)" size={16} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <View style={s.divider} />

      {/* Summary */}
      {fishes.length > 0 && <SummaryBar fishes={fishes} />}

      {/* Grid */}
      {fishes.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyEmoji}>🌊</Text>
          <Text style={s.emptyTitle}>Aquário vazio</Text>
          <Text style={s.emptyDesc}>Compre seu primeiro peixe na loja!</Text>
        </View>
      ) : (
        <FlatList
          key={numCols} // Required to force re-render when changing columns
          data={fishes}
          keyExtractor={item => item.id.toString()}
          numColumns={numCols}
          columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 10, gap: 10 }}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => <FishCard item={item} index={index} />}
        />
      )}
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(178,157,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(178,157,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 17, fontWeight: '900', color: '#fff', letterSpacing: 0.3 },
  subtitle: { fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: '700', letterSpacing: 0.5, marginTop: 1 },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.07)', marginHorizontal: 18 },
  list: { padding: 10, paddingBottom: 40 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  emptyEmoji: { fontSize: 52 },
  emptyTitle: { fontSize: 18, fontWeight: '900', color: 'rgba(255,255,255,0.7)' },
  emptyDesc: { fontSize: 13, color: 'rgba(255,255,255,0.35)', fontWeight: '600' },
})






