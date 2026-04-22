export interface FishDNA {
  colorGene: 'A' | 'a';
  sizeGene: 'B' | 'b';
  speedGene: 'C' | 'c';
  patternGene: 'D' | 'd';
  tailGene: 'E' | 'e';
  finGene: 'F' | 'f';
}

export const generateDNA = (): FishDNA => ({
  colorGene: Math.random() > 0.5 ? 'A' : 'a',
  sizeGene: Math.random() > 0.5 ? 'B' : 'b',
  speedGene: Math.random() > 0.5 ? 'C' : 'c',
  patternGene: Math.random() > 0.5 ? 'D' : 'd',
  tailGene: Math.random() > 0.5 ? 'E' : 'e',
  finGene: Math.random() > 0.5 ? 'F' : 'f',
})

// Mendelian-style crossover: dominant alleles (uppercase) win
export const combineDNA = (dnaA: FishDNA, dnaB: FishDNA): FishDNA => {
  const pick = (a: string, b: string): string => {
    // Each parent randomly contributes either their dominant or recessive allele
    const fromA = Math.random() > 0.5 ? a : a.toLowerCase();
    const fromB = Math.random() > 0.5 ? b : b.toLowerCase();
    
    const aIsDominant = fromA === fromA.toUpperCase();
    const bIsDominant = fromB === fromB.toUpperCase();
    
    // If only one is dominant, that one wins
    if (aIsDominant && !bIsDominant) return fromA;
    if (bIsDominant && !aIsDominant) return fromB;
    // Both dominant or both recessive — random pick
    return Math.random() > 0.5 ? fromA : fromB;
  }

  return {
    colorGene: pick(dnaA.colorGene, dnaB.colorGene) as 'A' | 'a',
    sizeGene: pick(dnaA.sizeGene, dnaB.sizeGene) as 'B' | 'b',
    speedGene: pick(dnaA.speedGene, dnaB.speedGene) as 'C' | 'c',
    patternGene: pick(dnaA.patternGene, dnaB.patternGene) as 'D' | 'd',
    tailGene: pick(dnaA.tailGene, dnaB.tailGene) as 'E' | 'e',
    finGene: pick(dnaA.finGene, dnaB.finGene) as 'F' | 'f',
  }
}

// Count dominant genes for quality score
export const getDNAQuality = (dna: FishDNA): number => {
  let score = 0;
  if (dna.colorGene === 'A') score++;
  if (dna.sizeGene === 'B') score++;
  if (dna.speedGene === 'C') score++;
  if (dna.patternGene === 'D') score++;
  if (dna.tailGene === 'E') score++;
  if (dna.finGene === 'F') score++;
  return score; // 0-6
}
