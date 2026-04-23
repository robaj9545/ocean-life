/**
 * Centralized audio system for Ocean Life.
 * Uses expo-audio (replaces deprecated expo-av).
 * All sounds are lazy-loaded and cached.
 */
import { createAudioPlayer, AudioPlayer } from 'expo-audio'
import { Platform } from 'react-native'

// Sound cache to avoid recreating players
const soundCache: Record<string, AudioPlayer> = {}

/**
 * Play a sound effect. Players are cached after first creation.
 * When real audio assets are added, replace the require() paths below.
 */
const playSound = async (key: string, volume: number = 0.5) => {
  if (Platform.OS === 'web') return // No audio on web preview
  
  try {
    // If we have a cached player, replay it
    if (soundCache[key]) {
      try {
        soundCache[key].seekTo(0)
        soundCache[key].volume = volume
        soundCache[key].play()
        return
      } catch {
        // Player might be released, recreate it
        delete soundCache[key]
      }
    }
    // When real audio files are added:
    // const player = createAudioPlayer(require('../assets/sounds/coin.mp3'))
    // soundCache[key] = player
    // player.volume = volume
    // player.play()
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
  // Sounds will be lazy-loaded on first play.
  // When real audio assets are added, preload them here:
  // soundCache['coin'] = createAudioPlayer(require('../assets/sounds/coin.mp3'))
}

/**
 * Cleanup all loaded sounds.
 * Call this when the app is being terminated.
 */
export const unloadSounds = async () => {
  for (const key of Object.keys(soundCache)) {
    try {
      soundCache[key].release()
    } catch {}
  }
}
