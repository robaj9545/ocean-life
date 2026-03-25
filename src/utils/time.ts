export const calculateOfflineProgress = (lastTime) => {
  const now = Date.now()
  const diff = (now - lastTime) / 1000

  return {
    coins: diff * 0.1,
    growth: diff * 0.01
  }
}
