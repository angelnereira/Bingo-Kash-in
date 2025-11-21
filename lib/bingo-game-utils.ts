// Utilidades para generar y gestionar juegos de bingo

export interface BingoCell {
  number: number | null
  marked: boolean
}

export interface BingoCardData {
  id: string
  cells: BingoCell[][]
  cardNumber: number
}

// Generar un cartón de bingo 5x5 estándar
export function generateBingoCard(cardNumber: number): BingoCardData {
  const card: BingoCell[][] = []

  // Rangos para cada columna: B(1-15), I(16-30), N(31-45), G(46-60), O(61-75)
  const columnRanges = [
    { min: 1, max: 15 },   // B
    { min: 16, max: 30 },  // I
    { min: 31, max: 45 },  // N
    { min: 46, max: 60 },  // G
    { min: 61, max: 75 },  // O
  ]

  // Generar números para cada columna
  for (let col = 0; col < 5; col++) {
    const { min, max } = columnRanges[col]
    const columnNumbers = getRandomNumbers(min, max, 5)

    for (let row = 0; row < 5; row++) {
      if (!card[row]) card[row] = []

      // El centro (2,2) es el espacio libre
      if (row === 2 && col === 2) {
        card[row][col] = {
          number: null, // FREE space
          marked: true  // Siempre marcado
        }
      } else {
        card[row][col] = {
          number: columnNumbers[row],
          marked: false
        }
      }
    }
  }

  return {
    id: `card-${cardNumber}`,
    cells: card,
    cardNumber,
  }
}

// Obtener números aleatorios únicos en un rango
function getRandomNumbers(min: number, max: number, count: number): number[] {
  const numbers: number[] = []
  const available = Array.from({ length: max - min + 1 }, (_, i) => min + i)

  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * available.length)
    numbers.push(available[randomIndex])
    available.splice(randomIndex, 1)
  }

  return numbers.sort((a, b) => a - b)
}

// Generar secuencia de números para el juego (1-75 aleatorios)
export function generateNumberSequence(): number[] {
  const numbers = Array.from({ length: 75 }, (_, i) => i + 1)

  // Shuffle using Fisher-Yates algorithm
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]]
  }

  return numbers
}

// Verificar si hay bingo (línea completa)
export function checkBingo(card: BingoCell[][]): {
  hasBingo: boolean
  pattern: string | null
} {
  // Verificar filas
  for (let row = 0; row < 5; row++) {
    if (card[row].every(cell => cell.marked)) {
      return { hasBingo: true, pattern: `Línea Horizontal ${row + 1}` }
    }
  }

  // Verificar columnas
  for (let col = 0; col < 5; col++) {
    if (card.every(row => row[col].marked)) {
      return { hasBingo: true, pattern: `Línea Vertical ${col + 1}` }
    }
  }

  // Verificar diagonal principal (top-left to bottom-right)
  if (card.every((row, i) => row[i].marked)) {
    return { hasBingo: true, pattern: 'Diagonal \\' }
  }

  // Verificar diagonal secundaria (top-right to bottom-left)
  if (card.every((row, i) => row[4 - i].marked)) {
    return { hasBingo: true, pattern: 'Diagonal /' }
  }

  return { hasBingo: false, pattern: null }
}

// Verificar patrones especiales
export function checkPattern(card: BingoCell[][], patternType: string): boolean {
  switch (patternType) {
    case 'FOUR_CORNERS':
      return (
        card[0][0].marked &&
        card[0][4].marked &&
        card[4][0].marked &&
        card[4][4].marked
      )

    case 'X_PATTERN':
      return card.every((row, i) => row[i].marked && row[4 - i].marked)

    case 'FULL_CARD':
      return card.every(row => row.every(cell => cell.marked))

    case 'POSTAGE_STAMP': // 2x2 en cualquier esquina
      // Top-left
      if (
        card[0][0].marked && card[0][1].marked &&
        card[1][0].marked && card[1][1].marked
      ) return true

      // Top-right
      if (
        card[0][3].marked && card[0][4].marked &&
        card[1][3].marked && card[1][4].marked
      ) return true

      // Bottom-left
      if (
        card[3][0].marked && card[3][1].marked &&
        card[4][0].marked && card[4][1].marked
      ) return true

      // Bottom-right
      if (
        card[3][3].marked && card[3][4].marked &&
        card[4][3].marked && card[4][4].marked
      ) return true

      return false

    default:
      return false
  }
}

// Obtener la letra de columna (B-I-N-G-O)
export function getColumnLetter(colIndex: number): string {
  const letters = ['B', 'I', 'N', 'G', 'O']
  return letters[colIndex] || ''
}

// Marcar un número en el cartón
export function markNumber(card: BingoCell[][], number: number): BingoCell[][] {
  return card.map(row =>
    row.map(cell =>
      cell.number === number ? { ...cell, marked: true } : cell
    )
  )
}

// Contar números marcados
export function countMarkedCells(card: BingoCell[][]): number {
  return card.reduce(
    (count, row) => count + row.filter(cell => cell.marked).length,
    0
  )
}
