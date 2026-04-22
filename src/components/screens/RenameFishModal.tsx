import React, { useState } from 'react'
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native'
import { X, CheckCircle2 } from 'lucide-react-native'
import { useGameStore } from '../../store/useGameStore'
import ClownfishSVG from '../fishes/Clownfish'
import BlueTangSVG from '../fishes/BlueTang'

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
    if (species === 'clownfish') return <ClownfishSVG size={40} />
    if (species === 'bluetang') return <BlueTangSVG size={45} />
    if (species === 'spiderfish') return <Text style={{fontSize:30}}>🕷️</Text>
    if (species === 'lionfish') return <Text style={{fontSize:30}}>🦁</Text>
    if (species === 'dragonfish') return <Text style={{fontSize:30}}>🐉</Text>
    if (species === 'ghostshark') return <Text style={{fontSize:30}}>👻</Text>
    if (species === 'leviathan') return <Text style={{fontSize:30}}>🦑</Text>
    return <ClownfishSVG size={40} />
  }

  return (
    <Modal transparent animationType="fade">
      <View style={s.overlay}>
        <View style={s.modal}>
          <TouchableOpacity style={s.closeBtn} onPress={onClose}>
            <X color="#fff" size={24} />
          </TouchableOpacity>
          
          <Text style={s.title}>Usar "Apelidar Peixe"</Text>
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
              <Text style={{color: '#aaa', marginTop: 20}}>Nenhum peixe vivo no aquário.</Text>
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
                <CheckCircle2 color="#fff" size={20} />
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
  modal: { width: '80%', maxWidth: 400, backgroundColor: '#1a1a2e', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#FF69B4' },
  closeBtn: { position: 'absolute', top: 15, right: 15, zIndex: 10 },
  title: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 5, textAlign: 'center' },
  subtitle: { color: '#FF69B4', fontSize: 13, marginBottom: 20, textAlign: 'center' },
  list: { flexGrow: 0, marginBottom: 20 },
  fishCard: { width: 100, height: 120, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 15, alignItems: 'center', justifyContent: 'center', padding: 10, marginRight: 10, borderWidth: 2, borderColor: 'transparent' },
  fishCardSelected: { borderColor: '#FF69B4', backgroundColor: 'rgba(255,105,180,0.1)' },
  fishName: { color: '#fff', fontSize: 12, marginTop: 10, fontWeight: 'bold', textTransform: 'capitalize' },
  inputWrapper: { alignItems: 'center' },
  label: { color: '#fff', fontSize: 14, alignSelf: 'flex-start', marginBottom: 8 },
  input: { width: '100%', height: 45, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 10, color: '#fff', paddingHorizontal: 15, borderWidth: 1, borderColor: '#333', marginBottom: 15 },
  confirmBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FF69B4', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, gap: 8 },
  confirmBtnDisabled: { opacity: 0.5 },
  confirmText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
})
