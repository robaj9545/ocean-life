import React, { useState } from 'react'
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native'
import { X, CheckCircle2 } from 'lucide-react-native'
import { useGameStore } from '../../store/useGameStore'
import ClownfishSVG from '../fishes/Clownfish'
import BlueTangSVG from '../fishes/BlueTang'
import { getSpeciesIcon, getSpeciesColor } from '../../data/species'
import { scale, fonts, spacing, radius, iconSize } from '../../utils/responsive'

export default function RenameFishModal({ onClose }: { onClose: () => void }) {
  const fishes = useGameStore(state => state.fishes)
  const useNicknameItem = useGameStore(state => state.useNicknameItem)
  const stats = useGameStore(state => state.stats)
  const nicknameItemsCount = stats.nickname_items || 0
  
  const [selectedFish, setSelectedFish] = useState<string | null>(null)
  const [newName, setNewName] = useState('')

  const handleConfirm = () => {
    if (!selectedFish || !newName.trim()) return;
    const success = useNicknameItem(selectedFish, newName.trim());
    if (success) {
      onClose();
    }
  }

  const renderFishPreview = (species: string) => {
    if (species === 'clownfish') return <ClownfishSVG size={scale(38)} />
    if (species === 'bluetang') return <BlueTangSVG size={scale(42)} />
    const Icon = getSpeciesIcon(species)
    const color = getSpeciesColor(species)
    if (Icon) return <Icon color={color} size={iconSize.xl} strokeWidth={1.5} />
    return <ClownfishSVG size={scale(38)} />
  }

  return (
    <Modal transparent animationType="fade" statusBarTranslucent>
      <View style={s.overlay}>
        <View style={s.modal}>
          <TouchableOpacity style={s.closeBtn} onPress={onClose}>
            <X color="#fff" size={iconSize.lg} />
          </TouchableOpacity>
          
          <Text style={s.title}>Apelidar Peixe</Text>
          <Text style={s.subtitle}>Você tem {nicknameItemsCount} item(s) de apelido. Escolha um peixe:</Text>
          
          <ScrollView style={s.list} horizontal showsHorizontalScrollIndicator={false}>
            {fishes.map(fish => {
              const isSelected = selectedFish === fish.id;
              return (
                <TouchableOpacity 
                  key={fish.id} 
                  style={[s.fishCard, isSelected && s.fishCardSelected]} 
                  onPress={() => setSelectedFish(fish.id)}
                >
                  {renderFishPreview(fish.species)}
                  <Text style={s.fishName} numberOfLines={1}>
                    {fish.nickname || fish.species}
                  </Text>
                </TouchableOpacity>
              )
            })}
            {fishes.length === 0 && (
              <Text style={{color: '#aaa', marginTop: spacing.xl}}>Nenhum peixe vivo no aquário.</Text>
            )}
          </ScrollView>

          {selectedFish && (
            <View style={s.inputWrapper}>
              <Text style={s.label}>Novo Apelido:</Text>
              <TextInput 
                style={s.input}
                value={newName}
                onChangeText={setNewName}
                placeholder="Ex: Nemo"
                placeholderTextColor="#666"
                maxLength={15}
              />
              <TouchableOpacity 
                style={[s.confirmBtn, !newName.trim() && s.confirmBtnDisabled]} 
                onPress={handleConfirm}
                disabled={!newName.trim()}
              >
                <CheckCircle2 color="#fff" size={iconSize.md} />
                <Text style={s.confirmText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  )
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modal: { width: '85%', maxWidth: scale(380), backgroundColor: '#1a1a2e', borderRadius: radius.xl, padding: spacing.xl, borderWidth: 1, borderColor: '#FF69B4' },
  closeBtn: { position: 'absolute', top: spacing.lg, right: spacing.lg, zIndex: 10 },
  title: { color: '#fff', fontSize: fonts.xl, fontWeight: 'bold', marginBottom: spacing.xs, textAlign: 'center' },
  subtitle: { color: '#FF69B4', fontSize: fonts.base, marginBottom: spacing.xl, textAlign: 'center' },
  list: { flexGrow: 0, marginBottom: spacing.xl },
  fishCard: { width: scale(95), height: scale(110), backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', padding: spacing.sm, marginRight: spacing.sm, borderWidth: 2, borderColor: 'transparent' },
  fishCardSelected: { borderColor: '#FF69B4', backgroundColor: 'rgba(255,105,180,0.1)' },
  fishName: { color: '#fff', fontSize: fonts.sm, marginTop: spacing.sm, fontWeight: 'bold', textTransform: 'capitalize' },
  inputWrapper: { alignItems: 'center' },
  label: { color: '#fff', fontSize: fonts.base, alignSelf: 'flex-start', marginBottom: spacing.sm },
  input: { width: '100%', height: scale(42), backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: radius.sm, color: '#fff', paddingHorizontal: spacing.lg, borderWidth: 1, borderColor: '#333', marginBottom: spacing.lg },
  confirmBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FF69B4', paddingVertical: spacing.md, paddingHorizontal: spacing.xl, borderRadius: radius.md, gap: spacing.sm },
  confirmBtnDisabled: { opacity: 0.5 },
  confirmText: { color: '#fff', fontWeight: 'bold', fontSize: fonts.lg }
})
