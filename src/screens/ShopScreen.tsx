import React, { useEffect, useRef, useState } from 'react'
import {
  Alert,
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
import { useGameStore } from '../store/useGameStore'

// Módulos UI Importados
import { ShopCard } from '../components/ui/Cards'
import { TabBar } from '../components/ui/Buttons'
import { BalancePill } from '../components/ui/Stats'

type Tab = 'shop' | 'food' | 'cemetery'

export default function ShopScreen({ onClose }: { onClose?: () => void }) {
  const [activeTab, setActiveTab] = useState<Tab>('shop')
  const coins = useGameStore(state => state.coins)
  const deadFishes = useGameStore(state => state.deadFishes)
  const addCoins = useGameStore(state => state.addCoins)
  const addFish = useGameStore(state => state.addFish)
  const reviveFish = useGameStore(state => state.reviveFish)
  const addFood = useGameStore(state => state.addFood)
  const incrementStat = useGameStore(state => state.incrementStat)

  const tabOptions = [
    { id: 'shop', icon: <Store size={15} />, label: 'Loja', accent: '#00E5FF' },
    { id: 'food', icon: <Drumstick size={15} />, label: 'Ração', accent: '#FFA500' },
    { id: 'cemetery', icon: <Skull size={15} />, label: 'Necrotério', accent: '#A855F7' },
  ]

  const buyFood = (price: number, amount: number) => {
    if (coins >= price) {
      addCoins(-price)
      addFood(amount)
      incrementStat('buy_food', 1)
      Alert.alert('✅ Comprado!', `${amount} porções de ração adicionadas!`)
    } else {
      Alert.alert('❌ Saldo insuficiente', 'Você não tem moedas suficientes!')
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
        Alert.alert('🎉 Comprado!', `Seu ${species} filhote já está no aquário!`)
      } else {
        addCoins(price)
        Alert.alert('Erro', 'Não foi possível salvar. Tente novamente.')
      }
    } else {
      Alert.alert('❌ Saldo insuficiente', 'Você não tem moedas suficientes!')
    }
  }

  const handleRevive = (ghost: any) => {
    const cost = ghost.species === 'clownfish' ? 25 : 75
    if (coins >= cost) {
      reviveFish(ghost.id, cost)
      Alert.alert('✨ Milagre!', 'Peixe ressuscitado com sucesso!')
    } else {
      Alert.alert('❌ Saldo insuficiente', 'Você não tem moedas suficientes!')
    }
  }

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <View style={s.headerIcon}>
            <Store color="#00E5FF" size={18} strokeWidth={2} />
          </View>
          <View>
            <Text style={s.title}>
              {activeTab === 'shop' ? 'Loja de Peixes' : activeTab === 'food' ? 'Mercado de Ração' : 'Necrotério'}
            </Text>
            <Text style={s.subtitle}>Sua carteira • <Text style={{ color: '#FFD700' }}>{Math.floor(coins).toLocaleString()} coins</Text></Text>
          </View>
        </View>
        <View style={s.headerRight}>
          <BalancePill coins={coins} />
          <TouchableOpacity style={s.closeBtn} onPress={onClose}>
            <X color="rgba(255,255,255,0.6)" size={16} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={s.divider} />

      {/* Tabs */}
      <TabBar tabs={tabOptions} active={activeTab} setActive={setActiveTab} deadCount={deadFishes.length} />

      {/* Content */}
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.grid}>

          {activeTab === 'shop' && (
            <>
              <ShopCard
                index={0}
                title="Peixe-Palhaço"
                description="Alegre e resistente. Gera moedas em ritmo moderado."
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
                description="Cresce rápido e gera mais moedas. Um investimento raro!"
                rarity="RARO"
                rarityColor="#A855F7"
                accentColor="#29B6F6"
                price={150}
                preview={<BlueTangSVG size={80} />}
                onBuy={() => buyFish(150, 'bluetang', 'rare')}
                disabled={coins < 150}
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
                const reviveCost = ghost.species === 'clownfish' ? 25 : 75
                const daysLeft = ghost.deathTime
                  ? Math.max(0, Math.ceil((30 * 24 * 60 * 60 * 1000 - (Date.now() - ghost.deathTime)) / (1000 * 60 * 60 * 24)))
                  : 30

                return (
                  <ShopCard
                    key={`${ghost.id}-${i}`}
                    index={i}
                    title={ghost.species === 'clownfish' ? 'Peixe-Palhaço' : 'Cirurgião-Patela'}
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
        </View>
      </ScrollView>
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
    backgroundColor: 'rgba(0,229,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 17, fontWeight: '900', color: '#fff', letterSpacing: 0.3 },
  subtitle: { fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: '700', marginTop: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.07)', marginHorizontal: 18 },
  scroll: { paddingVertical: 10, paddingHorizontal: 8, paddingBottom: 40 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  empty: { width: '100%', alignItems: 'center', paddingVertical: 40, gap: 10 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '900', color: 'rgba(255,255,255,0.7)' },
  emptyDesc: { fontSize: 13, color: 'rgba(255,255,255,0.35)', fontWeight: '600' },
})


