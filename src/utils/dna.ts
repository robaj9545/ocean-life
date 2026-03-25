export const generateDNA = () => ({
  colorGene: Math.random() > 0.5 ? 'A' : 'a',
  sizeGene: Math.random() > 0.5 ? 'B' : 'b',
  speedGene: Math.random() > 0.5 ? 'C' : 'c'
})

export const combineDNA = (dnaA, dnaB) => {
  return {
    colorGene: Math.random() > 0.5 ? dnaA.colorGene : dnaB.colorGene,
    sizeGene: Math.random() > 0.5 ? dnaA.sizeGene : dnaB.sizeGene,
    speedGene: Math.random() > 0.5 ? dnaA.speedGene : dnaB.speedGene
  }
}
