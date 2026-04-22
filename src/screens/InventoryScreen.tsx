import { Backpack, X, Waves, Tag } from 'lucide-react-native'
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
import RenameFishModal from '../components/screens/RenameFishModal'
import { useState } from 'react'
import { scale, sidePanel, fonts, spacing, radius, iconSize } from '../utils/responsive'

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function InventoryScreen({ onClose }: { onClose?: () => void }) {
  const [showRenameModal, setShowRenameModal] = useState(false)
  const fishes = useGameStore(state => state.fishes)
  const stats = useGameStore(state => state.stats)
  const nicknameItems = stats.nickname_items || 0
  const { width } = useWindowDimensions();
  const numCols = width > 600 ? 3 : 2;

  return (
    <View style={s.containerRow}>
      {/* Left Sidebar */}
      <View style={[s.sidePanel, { width: sidePanel }]}>
        <View style={s.headerLeft}>
          <View style={s.headerIcon}>
            <Backpack color="#B29DFF" size={iconSize.md} strokeWidth={2} />
          </View>
          <View>
            <Text style={s.title}>Mochila</Text>
            <Text style={s.subtitle}>{fishes.length} peixes</Text>
          </View>
        </View>

        <View style={s.divider} />

        <View style={{ padding: spacing.md }}>
          {fishes.length > 0 && <SummaryBar fishes={fishes} />}
          
          {nicknameItems > 0 && (
            <TouchableOpacity 
              style={s.nicknameBtn}
              onPress={() => setShowRenameModal(true)}
            >
              <Tag color="#fff" size={iconSize.sm} strokeWidth={2} />
              <Text style={s.nicknameBtnText}>Usar "Apelido" ({nicknameItems})</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Right Content */}
      <View style={s.mainPanel}>
        {/* Absolute Close Button */}
        <TouchableOpacity style={s.closeBtnAbs} onPress={onClose}>
          <X color="rgba(255,255,255,0.6)" size={iconSize.sm} strokeWidth={2.5} />
        </TouchableOpacity>

        {/* Grid */}
        {fishes.length === 0 ? (
          <View style={s.empty}>
            <Waves color="rgba(0,229,255,0.4)" size={iconSize.xxl} strokeWidth={1.5} />
            <Text style={s.emptyTitle}>Aquário vazio</Text>
            <Text style={s.emptyDesc}>Compre seu peixe na loja!</Text>
          </View>
        ) : (
          <FlatList
            style={{ flex: 1 }}
            key={numCols}
            data={fishes}
            keyExtractor={item => item.id.toString()}
            numColumns={numCols}
            columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: spacing.sm, gap: spacing.sm }}
            contentContainerStyle={s.list}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => <FishCard item={item} index={index} />}
          />
        )}
      </View>
      
      {showRenameModal && <RenameFishModal onClose={() => setShowRenameModal(false)} />}
    </View>
  )
}

const s = StyleSheet.create({
  containerRow: { flex: 1, flexDirection: 'row', position: 'relative' },
  sidePanel: { backgroundColor: 'rgba(0,0,0,0.15)', borderRightWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  mainPanel: { flex: 1 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md },
  headerIcon: {
    width: scale(30),
    height: scale(30),
    borderRadius: radius.sm,
    backgroundColor: 'rgba(178,157,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(178,157,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: fonts.base, fontWeight: '900', color: '#fff', letterSpacing: 0.3 },
  subtitle: { fontSize: fonts.xxs, color: 'rgba(255,255,255,0.4)', fontWeight: '700', letterSpacing: 0.5, marginTop: 1 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.07)', marginHorizontal: spacing.md },
  nicknameBtn: {
    marginTop: spacing.xl,
    backgroundColor: 'rgba(255,105,180,0.2)',
    borderWidth: 1,
    borderColor: '#FF69B4',
    padding: spacing.md,
    borderRadius: radius.sm,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  nicknameBtnText: { color: '#fff', fontWeight: 'bold', fontSize: fonts.base },
  closeBtnAbs: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: scale(28),
    height: scale(28),
    borderRadius: scale(14),
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99,
  },
  list: { padding: spacing.sm, paddingTop: scale(30), paddingBottom: spacing.xxxl },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  emptyTitle: { fontSize: fonts.xl, fontWeight: '900', color: 'rgba(255,255,255,0.7)' },
  emptyDesc: { fontSize: fonts.base, color: 'rgba(255,255,255,0.35)', fontWeight: '600' },
})
