import { GamePattern } from '@prisma/client'

/**
 * Genera un cartón de bingo único de 5x5
 * Formato: B(1-15), I(16-30), N(31-45), G(46-60), O(61-75)
 * La celda central (índice 12) es FREE SPACE
 */
export function generateBingoCard(): number[] {
  const card: number[] = []

  // Rangos por columna: B, I, N, G, O
  const ranges = [
    [1, 15],    // B
    [16, 30],   // I
    [31, 45],   // N
    [46, 60],   // G
    [61, 75],   // O
  ]

  // Generar números para cada columna
  for (let col = 0; col < 5; col++) {
    const [min, max] = ranges[col]
    const columnNumbers = getRandomNumbers(min, max, 5)

    for (let row = 0; row < 5; row++) {
      const index = row * 5 + col
      // Free space en el centro (índice 12)
      if (index === 12) {
        card.push(0) // 0 representa FREE SPACE
      } else {
        card.push(columnNumbers.shift()!)
      }
    }
  }

  return card
}

/**
 * Obtiene números aleatorios únicos en un rango
 */
function getRandomNumbers(min: number, max: number, count: number): number[] {
  const numbers: number[] = []
  const available = Array.from({ length: max - min + 1 }, (_, i) => min + i)

  for (let i = 0; i < count; i++) {
    const index = Math.floor(Math.random() * available.length)
    numbers.push(available.splice(index, 1)[0])
  }

  return numbers
}

/**
 * Verifica si un cartón tiene un patrón ganador
 */
export function checkWinningPattern(
  cardNumbers: number[],
  markedCells: number[],
  pattern: GamePattern
): boolean {
  const marked = new Set(markedCells)

  // Siempre marcar el centro como FREE SPACE
  marked.add(12)

  switch (pattern) {
    case 'LINE':
      return checkLine(marked)

    case 'TWO_LINES':
      return checkTwoLines(marked)

    case 'FOUR_CORNERS':
      return checkFourCorners(marked)

    case 'FULL_CARD':
    case 'BLACKOUT':
      return checkFullCard(marked)

    case 'X_PATTERN':
      return checkXPattern(marked)

    default:
      return false
  }
}

function checkLine(marked: Set<number>): boolean {
  // Verificar filas
  for (let row = 0; row < 5; row++) {
    let complete = true
    for (let col = 0; col < 5; col++) {
      if (!marked.has(row * 5 + col)) {
        complete = false
        break
      }
    }
    if (complete) return true
  }

  // Verificar columnas
  for (let col = 0; col < 5; col++) {
    let complete = true
    for (let row = 0; row < 5; row++) {
      if (!marked.has(row * 5 + col)) {
        complete = false
        break
      }
    }
    if (complete) return true
  }

  // Verificar diagonales
  const diagonal1 = [0, 6, 12, 18, 24]
  const diagonal2 = [4, 8, 12, 16, 20]

  if (diagonal1.every(i => marked.has(i))) return true
  if (diagonal2.every(i => marked.has(i))) return true

  return false
}

function checkTwoLines(marked: Set<number>): boolean {
  let linesFound = 0

  // Verificar filas
  for (let row = 0; row < 5; row++) {
    let complete = true
    for (let col = 0; col < 5; col++) {
      if (!marked.has(row * 5 + col)) {
        complete = false
        break
      }
    }
    if (complete) linesFound++
  }

  // Verificar columnas
  for (let col = 0; col < 5; col++) {
    let complete = true
    for (let row = 0; row < 5; row++) {
      if (!marked.has(row * 5 + col)) {
        complete = false
        break
      }
    }
    if (complete) linesFound++
  }

  // Verificar diagonales
  const diagonal1 = [0, 6, 12, 18, 24]
  const diagonal2 = [4, 8, 12, 16, 20]

  if (diagonal1.every(i => marked.has(i))) linesFound++
  if (diagonal2.every(i => marked.has(i))) linesFound++

  return linesFound >= 2
}

function checkFourCorners(marked: Set<number>): boolean {
  const corners = [0, 4, 20, 24]
  return corners.every(i => marked.has(i))
}

function checkFullCard(marked: Set<number>): boolean {
  return marked.size >= 25
}

function checkXPattern(marked: Set<number>): boolean {
  const diagonal1 = [0, 6, 12, 18, 24]
  const diagonal2 = [4, 8, 12, 16, 20]

  return diagonal1.every(i => marked.has(i)) && diagonal2.every(i => marked.has(i))
}

/**
 * Genera un número aleatorio de bingo (1-75)
 */
export function generateBingoNumber(excludeNumbers: number[] = []): number {
  const available = Array.from({ length: 75 }, (_, i) => i + 1)
    .filter(n => !excludeNumbers.includes(n))

  if (available.length === 0) {
    throw new Error('No hay más números disponibles')
  }

  const index = Math.floor(Math.random() * available.length)
  return available[index]
}

/**
 * Obtiene la letra del número de bingo (B, I, N, G, O)
 */
export function getBingoLetter(number: number): string {
  if (number >= 1 && number <= 15) return 'B'
  if (number >= 16 && number <= 30) return 'I'
  if (number >= 31 && number <= 45) return 'N'
  if (number >= 46 && number <= 60) return 'G'
  if (number >= 61 && number <= 75) return 'O'
  return ''
}

/**
 * Formatea el número de bingo con su letra (ej: "B-12", "N-45")
 */
export function formatBingoNumber(number: number): string {
  const letter = getBingoLetter(number)
  return `${letter}-${number}`
}
