/**
 * Centralized haptic feedback system for Ocean Life.
 * Wraps expo-haptics with game-specific presets.
 * Gracefully no-ops on platforms without haptic support.
 */
import * as Haptics from 'expo-haptics'
import { Platform } from 'react-native'

const isHapticsAvailable = Platform.OS === 'ios' || Platform.OS === 'android'

/** Light tap — feeding, tapping a fish, navigation */
export const hapticLight = () => {
  if (!isHapticsAvailable) return
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
}

/** Medium impact — buying, selling, breeding */
export const hapticMedium = () => {
  if (!isHapticsAvailable) return
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {})
}

/** Heavy impact — level up, rare fish obtained */
export const hapticHeavy = () => {
  if (!isHapticsAvailable) return
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {})
}

/** Success notification — coin collected, mission claimed, breeding success */
export const hapticSuccess = () => {
  if (!isHapticsAvailable) return
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {})
}

/** Warning notification — fish hungry, low health */
export const hapticWarning = () => {
  if (!isHapticsAvailable) return
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {})
}

/** Error notification — not enough coins, action failed */
export const hapticError = () => {
  if (!isHapticsAvailable) return
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {})
}

/** Selection changed — scrolling lists, tab switching */
export const hapticSelection = () => {
  if (!isHapticsAvailable) return
  Haptics.selectionAsync().catch(() => {})
}
