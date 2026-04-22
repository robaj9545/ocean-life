export const createBubble = () => ({
  id: `bubble_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  type: 'bubble',
  position: { x: Math.random()*300, y: 600 },
  speed: Math.random() * 2 + 1
})
