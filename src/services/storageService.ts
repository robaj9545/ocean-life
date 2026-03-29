import AsyncStorage from '@react-native-async-storage/async-storage'

export const saveGame = async (data: any) => {
  try {
    await AsyncStorage.setItem('game', JSON.stringify(data))
  } catch (error) {
    console.warn('Erro ao salvar no AsyncStorage:', error)
  }
}

export const loadGame = async () => {
  try {
    const data = await AsyncStorage.getItem('game')
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.warn('Erro ao ler AsyncStorage:', error)
    return null
  }
}
