export const createBubble = () => ({
  id: Math.random(),
  type: 'bubble',
  position: { x: Math.random()*300, y: 600 },
  speed: Math.random() * 2 + 1
})
