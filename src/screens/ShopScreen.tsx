import React, { useEffect, useRef, useState } from 'react'
import {
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { Store, Drumstick, Skull, X, PackageOpen } from 'lucide-react-native'
import BlueTangSVG from '../components/fishes/BlueTang'
import ClownfishSVG from '../components/fishes/Clownfish'
import { createFish } from '../entities/createFish'
import { fishService } from '../services/fishService'
import { useGameStore, LEVEL_UNLOCKS } from '../store/useGameStore'

import { ShopCard } from '../components/ui/Cards'
import { TabBar } from '../components/ui/Buttons'
import { BalancePill } from '../components/ui/Stats'
import { useAlert } from '../components/ui/Alert'
import RenameFishModal from '../components/screens/RenameFishModal'
import { getSpeciesName, getReviveCost } from '../data/species'

type Tab = 'shop' | 'food' | 'cemetery' | 'decorations'

export default function ShopScreen({ onClose }: { onClose?: () => void }) {
  const [activeTab, setActiveTab] = useState<Tab>('shop')
  const [showRenameModal, setShowRenameModal] = useState(false)
  const coins = useGameStore(state => state.coins)
  const level = useGameStore(state => state.level)
  const deadFishes = useGameStore(state => state.deadFishes)
  const addCoins = useGameStore(state => state.addCoins)
  const addFish = useGameStore(state => state.addFish)
  const reviveFish = useGameStore(state => state.reviveFish)
  const addFood = useGameStore(state => state.addFood)
  const incrementStat = useGameStore(state => state.incrementStat)

  const tabOptions = [
    { id: 'shop', icon: <Store size={15} />, label: 'Peixes', accent: '#00E5FF' },
    { id: 'food', icon: <Drumstick size={15} />, label: 'Ração', accent: '#FFA500' },
    { id: 'cemetery', icon: <Skull size={15} />, label: 'Necrotério', accent: '#A855F7' },
    { id: 'decorations', icon: <Store size={15} />, label: 'Decorações', accent: '#FF69B4' },
  ]

  const { alert } = useAlert()

  const buyNicknameItem = useGameStore(state => state.buyNicknameItem)

  const buyFood = (price: number, amount: number) => {
    if (coins >= price) {
      addCoins(-price)
      addFood(amount)
      incrementStat('buy_food', 1)
      alert({ type: 'success', title: '✅ Comprado!', message: `${amount} porções de ração adicionadas!` })
    } else {
      alert({ type: 'error', title: '❌ Saldo insuficiente', message: 'Você não tem moedas suficientes!' })
    }
  }

  const handleBuyNickname = () => {
    if (coins >= 1000) {
      buyNicknameItem()
      setShowRenameModal(true)
    } else {
      alert({ type: 'error', title: '❌ Saldo insuficiente', message: 'Você não tem moedas suficientes!' })
    }
  }

  const buyFish = async (price: number, species: string, rarity: 'common' | 'rare' | 'epic' | 'legendary') => {
    if (coins >= price) {
      addCoins(-price)
      const fishData = createFish({ species, rarity, stage: 'baby' })
      const { data } = await fishService.createFishOnServer(fishData)
      if (data) {
        addFish(data)
        incrementStat('buy_fish', 1)
        alert({ type: 'success', title: '🎉 Comprado!', message: `Seu ${species} filhote já está no aquário!` })
      } else {
        addCoins(price)
        alert({ type: 'error', title: 'Erro', message: 'Não foi possível salvar. Tente novamente.' })
      }
    } else {
      alert({ type: 'error', title: '❌ Saldo insuficiente', message: 'Você não tem moedas suficientes!' })
    }
  }

  const handleRevive = (ghost: any) => {
    const cost = getReviveCost(ghost.species)
    if (coins >= cost) {
      reviveFish(ghost.id, cost)
      alert({ type: 'success', title: '✨ Milagre!', message: 'Peixe ressuscitado com sucesso!' })
    } else {
      alert({ type: 'error', title: '❌ Saldo insuficiente', message: 'Você não tem moedas suficientes!' })
    }
  }

  return (
    <View style={s.containerRow}>
      {/* Left Sidebar */}
      <View style={s.sidePanel}>
        <View style={s.headerLeft}>
          <View style={s.headerIcon}>
            <Store color="#00E5FF" size={18} strokeWidth={2} />
          </View>
          <View>
            <Text style={s.title}>
              {activeTab === 'shop' ? 'Peixes' : activeTab === 'food' ? 'Ração' : activeTab === 'decorations' ? 'Decorações' : 'Necrotério'}
            </Text>
            <Text style={s.subtitle}>Carteira • <Text style={{ color: '#FFD700' }}>{Math.floor(coins).toLocaleString()}</Text></Text>
          </View>
        </View>

        <View style={s.divider} />

        <View style={s.tabWrap}>
          <TabBar vertical tabs={tabOptions} active={activeTab} setActive={setActiveTab} deadCount={deadFishes.length} />
        </View>
      </View>

      {/* Right Content */}
      <View style={s.mainPanel}>
        {/* Absolute Close Button */}
        <TouchableOpacity style={s.closeBtnAbs} onPress={onClose}>
          <X color="rgba(255,255,255,0.6)" size={16} strokeWidth={2.5} />
        </TouchableOpacity>

        <View style={s.headerRight}>
          <BalancePill coins={coins} />
        </View>

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.grid}>

          {activeTab === 'shop' && (
            <>
              <ShopCard
                index={0}
                title="Peixe-Palhaço"
                description="Alegre e resistente."
                rarity="COMUM"
                rarityColor="#00E5A0"
                accentColor="#FF7043"
                price={50}
                preview={<ClownfishSVG size={72} />}
                onBuy={() => buyFish(50, 'clownfish', 'common')}
                disabled={coins < 50}
              />
              <ShopCard
                index={1}
                title="Cirurgião-Patela"
                description="Cresce rápido e gera mais moedas."
                rarity="COMUM"
                rarityColor="#00E5A0"
                accentColor="#29B6F6"
                price={150}
                preview={<BlueTangSVG size={80} />}
                onBuy={() => buyFish(150, 'bluetang', 'common')}
                disabled={coins < 150}
              />
              <ShopCard
                index={2}
                title="Peixe Aranha"
                description="Sombrio, cheio de espetos."
                rarity="RARO"
                rarityColor="#A855F7"
                accentColor="#8B008B"
                price={500}
                preview={<Text style={{fontSize: 50}}>🕷️</Text>}
                onBuy={() => buyFish(500, 'spiderfish', 'rare')}
                disabled={coins < 500}
                locked={level < LEVEL_UNLOCKS.spiderfish}
                lockedLevel={LEVEL_UNLOCKS.spiderfish}
              />
              <ShopCard
                index={3}
                title="Peixe-Leão"
                description="Perigoso e belo."
                rarity="RARO"
                rarityColor="#A855F7"
                accentColor="#B22222"
                price={750}
                preview={<Text style={{fontSize: 50}}>🦁</Text>}
                onBuy={() => buyFish(750, 'lionfish', 'rare')}
                disabled={coins < 750}
                locked={level < LEVEL_UNLOCKS.lionfish}
                lockedLevel={LEVEL_UNLOCKS.lionfish}
              />
              <ShopCard
                index={4}
                title="Peixe-Dragão"
                description="Majestoso e brilhante."
                rarity="ÉPICO"
                rarityColor="#FF007F"
                accentColor="#00FA9A"
                price={2000}
                preview={<Text style={{fontSize: 50}}>🐉</Text>}
                onBuy={() => buyFish(2000, 'dragonfish', 'epic')}
                disabled={coins < 2000}
                locked={level < LEVEL_UNLOCKS.dragonfish}
                lockedLevel={LEVEL_UNLOCKS.dragonfish}
              />
              <ShopCard
                index={5}
                title="Tubarão-Fantasma"
                description="Transparente, de outra dimensão."
                rarity="ÉPICO"
                rarityColor="#FF007F"
                accentColor="#E0FFFF"
                price={2500}
                preview={<Text style={{fontSize: 50}}>👻</Text>}
                onBuy={() => buyFish(2500, 'ghostshark', 'epic')}
                disabled={coins < 2500}
                locked={level < LEVEL_UNLOCKS.ghostshark}
                lockedLevel={LEVEL_UNLOCKS.ghostshark}
              />
              <ShopCard
                index={6}
                title="Leviatã"
                description="Lenda viva dos oceanos antigos."
                rarity="LENDÁRIO"
                rarityColor="#FFD700"
                accentColor="#4B0082"
                price={10000}
                preview={<Text style={{fontSize: 50}}>🦑</Text>}
                onBuy={() => buyFish(10000, 'leviathan', 'legendary')}
                disabled={coins < 10000}
                locked={level < LEVEL_UNLOCKS.leviathan}
                lockedLevel={LEVEL_UNLOCKS.leviathan}
              />
            </>
          )}

          {activeTab === 'food' && (
            <>
              <ShopCard
                index={0}
                title="Pote de Ração"
                description="10 porções. Suficiente para realimentar crias."
                rarity="+10 FOOD"
                rarityColor="#FFA500"
                accentColor="#FF8C00"
                price={30}
                preview={<Drumstick color="#FF8C00" size={52} strokeWidth={1.5} />}
                onBuy={() => buyFood(30, 10)}
                disabled={coins < 30}
              />
              <ShopCard
                index={1}
                title="Saco Premium"
                description="50 porções. Para criadores experientes que não param!"
                rarity="+50 FOOD"
                rarityColor="#FF4500"
                accentColor="#FF4500"
                price={120}
                preview={<PackageOpen color="#FF4500" size={52} strokeWidth={1.5} />}
                onBuy={() => buyFood(120, 50)}
                disabled={coins < 120}
              />
              <ShopCard
                index={2}
                title="Mega Estoque"
                description="200 porções. Nunca mais deixe seus peixes passarem fome."
                rarity="+200 FOOD"
                rarityColor="#FF1493"
                accentColor="#FF1493"
                price={400}
                preview={<PackageOpen color="#FF1493" size={52} strokeWidth={1.5} />}
                onBuy={() => buyFood(400, 200)}
                disabled={coins < 400}
              />
            </>
          )}

          {activeTab === 'cemetery' && (
            deadFishes.length === 0 ? (
              <View style={s.empty}>
                <Text style={s.emptyEmoji}>🕊️</Text>
                <Text style={s.emptyTitle}>Todos vivos!</Text>
                <Text style={s.emptyDesc}>Nenhum peixe morreu de fome... ainda.</Text>
              </View>
            ) : (
            deadFishes.map((ghost, i) => {
                const reviveCost = getReviveCost(ghost.species)
                const daysLeft = ghost.deathTime
                  ? Math.max(0, Math.ceil((30 * 24 * 60 * 60 * 1000 - (Date.now() - ghost.deathTime)) / (1000 * 60 * 60 * 24)))
                  : 30

                return (
                  <ShopCard
                    key={`${ghost.id}-${i}`}
                    index={i}
                    title={getSpeciesName(ghost.species)}
                    description="Pode ser ressuscitado com uma dose de magia."
                    rarity="MORTO"
                    rarityColor="#A855F7"
                    accentColor="#7C3AED"
                    price={reviveCost}
                    dead
                    daysLeft={daysLeft}
                    preview={
                      ghost.species === 'bluetang'
                        ? <BlueTangSVG size={72} />
                        : <ClownfishSVG size={72} />
                    }
                    onRevive={() => handleRevive(ghost)}
                  />
                )
              })
            )
          )}

          {activeTab === 'decorations' && (
            <>
              <ShopCard
                index={0}
                title="Apelidar Peixe"
                description="Dê um nome único a um dos seus peixes! Se não usar agora, vai para o inventário."
                rarity="DECORAÇÃO"
                rarityColor="#FF69B4"
                accentColor="#FF69B4"
                price={1000}
                preview={<Text style={{fontSize: 50}}>🏷️</Text>}
                onBuy={handleBuyNickname}
                disabled={coins < 1000}
              />
            </>
          )}
        </View>
      </ScrollView>
      </View>
      
      {showRenameModal && <RenameFishModal onClose={() => setShowRenameModal(false)} />}
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
    backgroundColor: 'rgba(0,229,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 15, fontWeight: '900', color: '#fff', letterSpacing: 0.3 },
  subtitle: { fontSize: 9, color: 'rgba(255,255,255,0.4)', fontWeight: '700', marginTop: 1 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.07)', marginHorizontal: 14 },
  tabWrap: { flex: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 10, padding: 14, paddingBottom: 0, paddingRight: 50 },
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
  scroll: { paddingVertical: 10, paddingHorizontal: 10, paddingBottom: 40 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  empty: { width: '100%', alignItems: 'center', paddingVertical: 40, gap: 10 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '900', color: 'rgba(255,255,255,0.7)' },
  emptyDesc: { fontSize: 13, color: 'rgba(255,255,255,0.35)', fontWeight: '600' },
})


