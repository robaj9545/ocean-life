import React, { useState } from 'react'
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { Store, Drumstick, Skull, X, PackageOpen, Tag, Bird, Bug, Crown, Flame, Ghost, Anchor } from 'lucide-react-native'
import BlueTangSVG from '../components/fishes/BlueTang'
import ClownfishSVG from '../components/fishes/Clownfish'
import { createFish } from '../entities/createFish'
import { fishService } from '../services/fishService'
import { useGameStore, LEVEL_UNLOCKS } from '../store/useGameStore'

import { ShopCard } from '../components/ui/Cards'
import { TabBar } from '../components/ui/Buttons'
import { BalancePill } from '../components/ui/Stats'
import { useAlert } from '../components/ui/Alert'
import { ConfirmModal } from '../components/ui/ConfirmModal'
import { LoadingOverlay } from '../components/ui/LoadingOverlay'
import RenameFishModal from '../components/screens/RenameFishModal'
import { getSpeciesName, getReviveCost, getSpeciesIcon, getSpeciesColor } from '../data/species'
import { scale, sidePanel, fonts, spacing, radius, iconSize } from '../utils/responsive'

type Tab = 'shop' | 'food' | 'cemetery' | 'decorations'

// Pending action for confirm modal
interface PendingAction {
  title: string
  message: string
  price: number
  accentColor?: string
  destructive?: boolean
  action: () => void | Promise<void>
}

export default function ShopScreen({ onClose }: { onClose?: () => void }) {
  const [activeTab, setActiveTab] = useState<Tab>('shop')
  const [showRenameModal, setShowRenameModal] = useState(false)
  const [isBuying, setIsBuying] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState('')
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)
  
  const coins = useGameStore(state => state.coins)
  const level = useGameStore(state => state.level)
  const deadFishes = useGameStore(state => state.deadFishes)
  const addCoins = useGameStore(state => state.addCoins)
  const addFish = useGameStore(state => state.addFish)
  const reviveFish = useGameStore(state => state.reviveFish)
  const addFood = useGameStore(state => state.addFood)
  const incrementStat = useGameStore(state => state.incrementStat)

  const tabOptions = [
    { id: 'shop', icon: <Store size={iconSize.sm} />, label: 'Peixes', accent: '#00E5FF' },
    { id: 'food', icon: <Drumstick size={iconSize.sm} />, label: 'Ração', accent: '#FFA500' },
    { id: 'cemetery', icon: <Skull size={iconSize.sm} />, label: 'Necrotério', accent: '#A855F7' },
    { id: 'decorations', icon: <Store size={iconSize.sm} />, label: 'Decorações', accent: '#FF69B4' },
  ]

  const { alert } = useAlert()
  const buyNicknameItem = useGameStore(state => state.buyNicknameItem)

  // ─── Standardized async pattern ────────────────────────────────────────────
  const executeWithLoading = async (msg: string, fn: () => void | Promise<void>) => {
    setIsBuying(true)
    setLoadingMsg(msg)
    try {
      await fn()
    } catch (e: any) {
      console.error('Shop action error:', e)
      alert({ type: 'error', title: 'Erro', message: e?.message || 'Erro desconhecido' })
    } finally {
      setIsBuying(false)
      setLoadingMsg('')
    }
  }

  // ─── Buy Food ──────────────────────────────────────────────────────────────
  const requestBuyFood = (price: number, amount: number, qty: number = 1) => {
    const totalCost = price * qty
    const totalAmount = amount * qty
    if (coins < totalCost) {
      return alert({ type: 'error', title: 'Saldo insuficiente', message: 'Você não tem moedas suficientes!' })
    }
    setPendingAction({
      title: 'Comprar Ração',
      message: `Deseja comprar ${totalAmount} porções de ração?`,
      price: totalCost,
      accentColor: '#FFA500',
      action: () => {
        addCoins(-totalCost)
        addFood(totalAmount)
        incrementStat('buy_food', qty)
        alert({ type: 'success', title: 'Comprado!', message: `${totalAmount} porções de ração adicionadas!` })
      }
    })
  }

  // ─── Buy Nickname ──────────────────────────────────────────────────────────
  const requestBuyNickname = () => {
    if (coins < 1000) {
      return alert({ type: 'error', title: 'Saldo insuficiente', message: 'Você não tem moedas suficientes!' })
    }
    setPendingAction({
      title: 'Apelidar Peixe',
      message: 'Deseja comprar um item de apelido para nomear um peixe?',
      price: 1000,
      accentColor: '#FF69B4',
      action: () => {
        buyNicknameItem()
        setShowRenameModal(true)
      }
    })
  }

  // ─── Buy Fish (async) ─────────────────────────────────────────────────────
  const requestBuyFish = (price: number, species: string, rarity: 'common' | 'rare' | 'epic' | 'legendary', qty: number = 1) => {
    const totalCost = price * qty
    const name = getSpeciesName(species)
    if (coins < totalCost) {
      return alert({ type: 'error', title: 'Saldo insuficiente', message: 'Você não tem moedas suficientes!' })
    }
    setPendingAction({
      title: `Comprar ${name}`,
      message: qty === 1
        ? `Deseja comprar um ${name} filhote?`
        : `Deseja comprar ${qty}x ${name} filhotes?`,
      price: totalCost,
      accentColor: getSpeciesColor(species) || '#00E5FF',
      action: async () => {
        await executeWithLoading('Comprando...', async () => {
          addCoins(-totalCost)
          const fishDataArray = Array.from({ length: qty }, () => createFish({ species, rarity, stage: 'baby' }))
          const { data, error } = await fishService.createManyFishOnServer(fishDataArray)
          if (error) console.error('createManyFishOnServer error:', error)
          if (data && data.length > 0) {
            data.forEach(fish => addFish(fish))
            incrementStat('buy_fish', data.length)
            alert({
              type: 'success',
              title: 'Comprado!',
              message: data.length === 1
                ? `Seu ${name} filhote já está no aquário!`
                : `${data.length}x ${name} filhotes adicionados ao aquário!`
            })
          } else {
            addCoins(totalCost)
            alert({ type: 'error', title: 'Erro', message: `Não foi possível salvar. ${error?.message || 'Tente novamente.'}` })
          }
        })
      }
    })
  }

  // ─── Revive Fish ───────────────────────────────────────────────────────────
  const requestRevive = (ghost: any) => {
    const cost = getReviveCost(ghost.species)
    const name = getSpeciesName(ghost.species)
    if (coins < cost) {
      return alert({ type: 'error', title: 'Saldo insuficiente', message: 'Você não tem moedas suficientes!' })
    }
    setPendingAction({
      title: 'Reviver Peixe',
      message: `Deseja ressuscitar seu ${name}?`,
      price: cost,
      accentColor: '#A855F7',
      action: () => {
        reviveFish(ghost.id, cost)
        alert({ type: 'success', title: 'Milagre!', message: `${name} ressuscitado com sucesso!` })
      }
    })
  }

  // ─── Confirm handler ──────────────────────────────────────────────────────
  const handleConfirm = async () => {
    if (!pendingAction) return
    const action = pendingAction.action
    setPendingAction(null)
    await action()
  }

  const renderSpeciesPreview = (species: string, size: number) => {
    if (species === 'bluetang') return <BlueTangSVG size={size} />
    if (species === 'clownfish') return <ClownfishSVG size={size} />
    const Icon = getSpeciesIcon(species)
    const color = getSpeciesColor(species)
    if (Icon) return <Icon color={color} size={size * 0.7} strokeWidth={1.5} />
    return <ClownfishSVG size={size} />
  }

  return (
    <View style={s.containerRow}>
      {/* Left Sidebar */}
      <View style={[s.sidePanel, { width: sidePanel }]}>
        <View style={s.headerLeft}>
          <View style={s.headerIcon}>
            <Store color="#00E5FF" size={iconSize.md} strokeWidth={2} />
          </View>
          <View style={{ flex: 1 }}>
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
          <X color="rgba(255,255,255,0.6)" size={iconSize.sm} strokeWidth={2.5} />
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
                preview={<ClownfishSVG size={scale(68)} />}
                onBuy={(qty) => requestBuyFish(50, 'clownfish', 'common', qty)}
                disabled={coins < 50 || isBuying}
                showQuantity
              />
              <ShopCard
                index={1}
                title="Cirurgião-Patela"
                description="Cresce rápido e gera mais moedas."
                rarity="COMUM"
                rarityColor="#00E5A0"
                accentColor="#29B6F6"
                price={150}
                preview={<BlueTangSVG size={scale(76)} />}
                onBuy={(qty) => requestBuyFish(150, 'bluetang', 'common', qty)}
                disabled={coins < 150 || isBuying}
                showQuantity
              />
              <ShopCard
                index={2}
                title="Peixe Aranha"
                description="Sombrio, cheio de espetos."
                rarity="RARO"
                rarityColor="#A855F7"
                accentColor="#8B008B"
                price={500}
                preview={<Bug color="#8B008B" size={iconSize.xxl} strokeWidth={1.5} />}
                onBuy={(qty) => requestBuyFish(500, 'spiderfish', 'rare', qty)}
                disabled={coins < 500 || isBuying}
                locked={level < LEVEL_UNLOCKS.spiderfish}
                lockedLevel={LEVEL_UNLOCKS.spiderfish}
                showQuantity
              />
              <ShopCard
                index={3}
                title="Peixe-Leão"
                description="Perigoso e belo."
                rarity="RARO"
                rarityColor="#A855F7"
                accentColor="#B22222"
                price={750}
                preview={<Crown color="#B22222" size={iconSize.xxl} strokeWidth={1.5} />}
                onBuy={(qty) => requestBuyFish(750, 'lionfish', 'rare', qty)}
                disabled={coins < 750 || isBuying}
                locked={level < LEVEL_UNLOCKS.lionfish}
                lockedLevel={LEVEL_UNLOCKS.lionfish}
                showQuantity
              />
              <ShopCard
                index={4}
                title="Peixe-Dragão"
                description="Majestoso e brilhante."
                rarity="ÉPICO"
                rarityColor="#FF007F"
                accentColor="#00FA9A"
                price={2000}
                preview={<Flame color="#00FA9A" size={iconSize.xxl} strokeWidth={1.5} />}
                onBuy={(qty) => requestBuyFish(2000, 'dragonfish', 'epic', qty)}
                disabled={coins < 2000 || isBuying}
                locked={level < LEVEL_UNLOCKS.dragonfish}
                lockedLevel={LEVEL_UNLOCKS.dragonfish}
                showQuantity
              />
              <ShopCard
                index={5}
                title="Tubarão-Fantasma"
                description="Transparente, de outra dimensão."
                rarity="ÉPICO"
                rarityColor="#FF007F"
                accentColor="#E0FFFF"
                price={2500}
                preview={<Ghost color="#E0FFFF" size={iconSize.xxl} strokeWidth={1.5} />}
                onBuy={(qty) => requestBuyFish(2500, 'ghostshark', 'epic', qty)}
                disabled={coins < 2500 || isBuying}
                locked={level < LEVEL_UNLOCKS.ghostshark}
                lockedLevel={LEVEL_UNLOCKS.ghostshark}
                showQuantity
              />
              <ShopCard
                index={6}
                title="Leviatã"
                description="Lenda viva dos oceanos antigos."
                rarity="LENDÁRIO"
                rarityColor="#FFD700"
                accentColor="#4B0082"
                price={10000}
                preview={<Anchor color="#4B0082" size={iconSize.xxl} strokeWidth={1.5} />}
                onBuy={(qty) => requestBuyFish(10000, 'leviathan', 'legendary', qty)}
                disabled={coins < 10000 || isBuying}
                locked={level < LEVEL_UNLOCKS.leviathan}
                lockedLevel={LEVEL_UNLOCKS.leviathan}
                showQuantity
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
                preview={<Drumstick color="#FF8C00" size={iconSize.xxl} strokeWidth={1.5} />}
                onBuy={(qty) => requestBuyFood(30, 10, qty)}
                disabled={coins < 30 || isBuying}
                showQuantity
              />
              <ShopCard
                index={1}
                title="Saco Premium"
                description="50 porções. Para criadores experientes que não param!"
                rarity="+50 FOOD"
                rarityColor="#FF4500"
                accentColor="#FF4500"
                price={120}
                preview={<PackageOpen color="#FF4500" size={iconSize.xxl} strokeWidth={1.5} />}
                onBuy={(qty) => requestBuyFood(120, 50, qty)}
                disabled={coins < 120 || isBuying}
                showQuantity
              />
              <ShopCard
                index={2}
                title="Mega Estoque"
                description="200 porções. Nunca mais deixe seus peixes passarem fome."
                rarity="+200 FOOD"
                rarityColor="#FF1493"
                accentColor="#FF1493"
                price={400}
                preview={<PackageOpen color="#FF1493" size={iconSize.xxl} strokeWidth={1.5} />}
                onBuy={(qty) => requestBuyFood(400, 200, qty)}
                disabled={coins < 400 || isBuying}
                showQuantity
              />
            </>
          )}

          {activeTab === 'cemetery' && (
            deadFishes.length === 0 ? (
              <View style={s.empty}>
                <Bird color="rgba(168,85,247,0.6)" size={iconSize.xxl} strokeWidth={1.5} />
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
                    preview={renderSpeciesPreview(ghost.species, scale(68))}
                    onRevive={() => requestRevive(ghost)}
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
                preview={<Tag color="#FF69B4" size={iconSize.xxl} strokeWidth={1.5} />}
                onBuy={() => requestBuyNickname()}
                disabled={coins < 1000 || isBuying}
              />
            </>
          )}
        </View>
      </ScrollView>
      </View>
      
      {showRenameModal && <RenameFishModal onClose={() => setShowRenameModal(false)} />}

      {/* Confirm Modal */}
      <ConfirmModal
        visible={!!pendingAction}
        title={pendingAction?.title || ''}
        message={pendingAction?.message || ''}
        price={pendingAction?.price}
        accentColor={pendingAction?.accentColor}
        destructive={pendingAction?.destructive}
        confirmLabel="Comprar"
        onConfirm={handleConfirm}
        onCancel={() => setPendingAction(null)}
      />

      {/* Loading Overlay */}
      <LoadingOverlay visible={isBuying} message={loadingMsg} />
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
    backgroundColor: 'rgba(0,229,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: fonts.lg, fontWeight: '900', color: '#fff', letterSpacing: 0.3 },
  subtitle: { fontSize: fonts.xxs, color: 'rgba(255,255,255,0.4)', fontWeight: '700', marginTop: 1 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.07)', marginHorizontal: spacing.md },
  tabWrap: { flex: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: spacing.sm, padding: spacing.md, paddingBottom: 0, paddingRight: scale(46) },
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
  scroll: { paddingVertical: spacing.sm, paddingHorizontal: spacing.sm, paddingBottom: spacing.xxxl },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  empty: { width: '100%', alignItems: 'center', paddingVertical: spacing.xxxl, gap: spacing.sm },
  emptyTitle: { fontSize: fonts.xl, fontWeight: '900', color: 'rgba(255,255,255,0.7)' },
  emptyDesc: { fontSize: fonts.base, color: 'rgba(255,255,255,0.35)', fontWeight: '600' },
})
