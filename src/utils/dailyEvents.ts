export const getDailyEvent = () => {
  const day = new Date().getDate()

  const events = [
    { type: 'coin_boost', multiplier: 2 },
    { type: 'rare_spawn', chance: 0.3 },
    { type: 'fast_growth', multiplier: 1.5 }
  ]

  return events[day % events.length]
}
