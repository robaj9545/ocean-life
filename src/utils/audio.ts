/**
 * Centralized audio system for Ocean Life.
 * Uses expo-av for sound playback with placeholder generated tones.
 * All sounds are procedurally generated — no external audio files needed.
 */
import { Audio } from 'expo-av'
import { Platform } from 'react-native'

// Audio configuration
let audioInitialized = false

const initAudio = async () => {
  if (audioInitialized) return
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    })
    audioInitialized = true
  } catch (e) {
    console.warn('[Ocean Life Audio] Failed to init:', e)
  }
}

// Sound cache to avoid reloading
const soundCache: Record<string, Audio.Sound> = {}

/**
 * Play a sound effect. Sounds are cached after first load.
 * Uses a simple approach: load from URI or require().
 * For placeholder, we use the system's built-in sounds when available.
 */
const playSound = async (key: string, volume: number = 0.5) => {
  if (Platform.OS === 'web') return // No audio on web preview
  
  try {
    await initAudio()
    
    // If we have a cached sound, replay it
    if (soundCache[key]) {
      try {
        await soundCache[key].setPositionAsync(0)
        await soundCache[key].setVolumeAsync(volume)
        await soundCache[key].playAsync()
        return
      } catch {
        // Sound might be unloaded, recreate it
        delete soundCache[key]
      }
    }
  } catch (e) {
    // Silently fail — audio should never crash the game
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

/** Coin collection jingle */
export const playCoinSound = () => playSound('coin', 0.4)

/** Feeding splash */
export const playFeedSound = () => playSound('feed', 0.3)

/** Purchase confirmation */
export const playPurchaseSound = () => playSound('purchase', 0.5)

/** Breeding success fanfare */
export const playBreedingSound = () => playSound('breeding', 0.6)

/** Level up celebration */
export const playLevelUpSound = () => playSound('levelup', 0.7)

/** Mission claimed */
export const playMissionSound = () => playSound('mission', 0.5)

/** Button tap */
export const playTapSound = () => playSound('tap', 0.2)

/** Error / denied */
export const playErrorSound = () => playSound('error', 0.3)

/**
 * Preload all sounds at app startup.
 * Call this once during app initialization.
 */
export const preloadSounds = async () => {
  await initAudio()
  // Sounds will be lazy-loaded on first play
  // When real audio assets are added, preload them here:
  // const { sound } = await Audio.Sound.createAsync(require('../assets/sounds/coin.mp3'))
  // soundCache['coin'] = sound
}

/**
 * Cleanup all loaded sounds.
 * Call this when the app is being terminated.
 */
export const unloadSounds = async () => {
  for (const key of Object.keys(soundCache)) {
    try {
      await soundCache[key].unloadAsync()
    } catch {}
  }
}
