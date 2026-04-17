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
    <View style={s.containerRow}>
      {/* Left Sidebar */}
      <View style={s.sidePanel}>
        <View style={s.headerLeft}>
          <View style={s.headerIcon}>
            <Backpack color="#B29DFF" size={18} strokeWidth={2} />
          </View>
          <View>
            <Text style={s.title}>Mochila</Text>
            <Text style={s.subtitle}>{fishes.length} peixes</Text>
          </View>
        </View>

        <View style={s.divider} />

        <View style={{ padding: 14 }}>
          {fishes.length > 0 && <SummaryBar fishes={fishes} />}
        </View>
      </View>

      {/* Right Content */}
      <View style={s.mainPanel}>
        {/* Absolute Close Button */}
        <TouchableOpacity style={s.closeBtnAbs} onPress={onClose}>
          <X color="rgba(255,255,255,0.6)" size={16} strokeWidth={2.5} />
        </TouchableOpacity>

        {/* Grid */}
        {fishes.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyEmoji}>🌊</Text>
            <Text style={s.emptyTitle}>Aquário vazio</Text>
            <Text style={s.emptyDesc}>Compre seu peixe na loja!</Text>
          </View>
        ) : (
          <FlatList
            style={{ flex: 1 }}
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
    </View>
  )
}

const s = StyleSheet.create({
  containerRow: { flex: 1, flexDirection: 'row', position: 'relative' },
  sidePanel: { width: 250, backgroundColor: 'rgba(0,0,0,0.15)', borderRightWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  mainPanel: { flex: 1 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(178,157,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(178,157,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 13, fontWeight: '900', color: '#fff', letterSpacing: 0.3 },
  subtitle: { fontSize: 9, color: 'rgba(255,255,255,0.4)', fontWeight: '700', letterSpacing: 0.5, marginTop: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 10, padding: 14, paddingBottom: 0 },
  closeBtnAbs: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 28,
    height: 28,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99,
  },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.07)', marginHorizontal: 14 },
  list: { padding: 10, paddingTop: 30, paddingBottom: 40 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  emptyEmoji: { fontSize: 52 },
  emptyTitle: { fontSize: 18, fontWeight: '900', color: 'rgba(255,255,255,0.7)' },
  emptyDesc: { fontSize: 13, color: 'rgba(255,255,255,0.35)', fontWeight: '600' },
})






