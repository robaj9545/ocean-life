import { create } from 'zustand'

export const useMissionStore = create((set) => ({
  missions: [
    {
      id: 'feed_10',
      title: 'Alimente 10 peixes',
      progress: 0,
      goal: 10,
      reward: 50,
      completed: false
    }
  ],

  updateProgress: (id, amount) =>
    set(state => ({
      missions: state.missions.map(m =>
        m.id === id
          ? { ...m, progress: m.progress + amount }
          : m
      )
    }))
}))
