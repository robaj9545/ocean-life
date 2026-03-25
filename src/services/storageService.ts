import AsyncStorage from '@react-native-async-storage/async-storage'

export const saveGame = async (data) => {
  await AsyncStorage.setItem('game', JSON.stringify(data))
}

export const loadGame = async () => {
  const data = await AsyncStorage.getItem('game')
  return data ? JSON.parse(data) : null
}
