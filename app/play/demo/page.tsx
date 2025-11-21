'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { InteractiveBingoCard } from '@/components/InteractiveBingoCard'
import {
  generateBingoCard,
  generateNumberSequence,
  markNumber,
  checkBingo,
  BingoCardData,
  BingoCell,
} from '@/lib/bingo-game-utils'

export default function DemoGamePage() {
  const [cards, setCards] = useState<BingoCardData[]>([])
  const [numberSequence, setNumberSequence] = useState<number[]>([])
  const [currentNumberIndex, setCurrentNumberIndex] = useState(0)
  const [calledNumbers, setCalledNumbers] = useState<number[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [speed, setSpeed] = useState(2000) // milliseconds
  const [winner, setWinner] = useState<{ cardNumber: number; pattern: string } | null>(null)
  const [highlightNumber, setHighlightNumber] = useState<number | null>(null)

  // Initialize game
  useEffect(() => {
    const newCards = [
      generateBingoCard(1),
      generateBingoCard(2),
    ]
    setCards(newCards)
    setNumberSequence(generateNumberSequence())
  }, [])

  // Auto-call numbers
  useEffect(() => {
    if (!isPlaying || isPaused || winner) return

    const timer = setTimeout(() => {
      callNextNumber()
    }, speed)

    return () => clearTimeout(timer)
  }, [isPlaying, isPaused, currentNumberIndex, speed, winner])

  const callNextNumber = useCallback(() => {
    if (currentNumberIndex >= numberSequence.length) {
      setIsPlaying(false)
      return
    }

    const number = numberSequence[currentNumberIndex]
    setCalledNumbers(prev => [...prev, number])
    setHighlightNumber(number)
    setCurrentNumberIndex(prev => prev + 1)

    // Auto-mark the number on all cards
    setCards(prevCards =>
      prevCards.map(card => ({
        ...card,
        cells: markNumber(card.cells, number),
      }))
    )

    // Check for winners
    setTimeout(() => {
      setCards(prevCards => {
        prevCards.forEach(card => {
          const result = checkBingo(card.cells)
          if (result.hasBingo && !winner) {
            setWinner({
              cardNumber: card.cardNumber,
              pattern: result.pattern!,
            })
            setIsPlaying(false)
          }
        })
        return prevCards
      })
    }, 100)

    setTimeout(() => setHighlightNumber(null), 1000)
  }, [currentNumberIndex, numberSequence, winner])

  const handleStart = () => {
    if (winner) {
      // Reset game
      const newCards = [
        generateBingoCard(1),
        generateBingoCard(2),
      ]
      setCards(newCards)
      setNumberSequence(generateNumberSequence())
      setCurrentNumberIndex(0)
      setCalledNumbers([])
      setWinner(null)
      setHighlightNumber(null)
    }
    setIsPlaying(true)
    setIsPaused(false)
  }

  const handlePause = () => {
    setIsPaused(!isPaused)
  }

  const handleStop = () => {
    setIsPlaying(false)
    setIsPaused(false)
  }

  const handleCellClick = (cardIndex: number, row: number, col: number) => {
    setCards(prevCards => {
      const newCards = [...prevCards]
      const cell = newCards[cardIndex].cells[row][col]
      cell.marked = !cell.marked

      // Check for bingo after manual marking
      setTimeout(() => {
        const result = checkBingo(newCards[cardIndex].cells)
        if (result.hasBingo && !winner) {
          setWinner({
            cardNumber: newCards[cardIndex].cardNumber,
            pattern: result.pattern!,
          })
          setIsPlaying(false)
        }
      }, 100)

      return newCards
    })
  }

  const currentNumber = calledNumbers[calledNumbers.length - 1]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 dark:from-gray-900 dark:to-gray-800 transition-colors">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 shadow-lg transition-colors">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <Link
                href="/dashboard"
                className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 mb-2 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Volver al Dashboard
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Modo Práctica</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Juega gratis para familiarizarte con el bingo</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 dark:text-gray-400">Números Cantados</div>
              <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                {calledNumbers.length} / 75
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Control Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 sticky top-6 transition-colors">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Panel de Control</h2>

              {/* Current Number Display */}
              <div className="bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl p-8 text-white mb-6 text-center transform transition-all duration-300 hover:scale-105">
                <div className="text-sm mb-2 opacity-90">Último Número</div>
                <div className="text-6xl font-bold mb-2">
                  {currentNumber || '--'}
                </div>
                {currentNumber && (
                  <div className="text-sm opacity-90">
                    {'BINGO'[Math.floor((currentNumber - 1) / 15)]}
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="space-y-3 mb-6">
                {!isPlaying ? (
                  <button
                    onClick={handleStart}
                    className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                    {winner ? 'Nuevo Juego' : 'Iniciar Juego'}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handlePause}
                      className="w-full px-6 py-3 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700 transition-colors flex items-center justify-center gap-2"
                    >
                      {isPaused ? (
                        <>
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                          </svg>
                          Continuar
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V4z" />
                          </svg>
                          Pausar
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleStop}
                      className="w-full px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V4z" />
                      </svg>
                      Detener
                    </button>
                  </>
                )}

                <button
                  onClick={callNextNumber}
                  disabled={isPlaying || winner !== null}
                  className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente Número Manual
                </button>
              </div>

              {/* Speed Control */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Velocidad: {speed / 1000}s
                </label>
                <input
                  type="range"
                  min="500"
                  max="5000"
                  step="500"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Winner Announcement */}
              {winner && (
                <div className="bg-gradient-to-r from-green-500 to-green-700 rounded-xl p-6 text-white text-center animate-pulse">
                  <div className="text-4xl mb-2">🎉</div>
                  <div className="text-xl font-bold mb-1">¡BINGO!</div>
                  <div className="text-sm">Cartón #{winner.cardNumber}</div>
                  <div className="text-xs opacity-90 mt-1">{winner.pattern}</div>
                </div>
              )}

              {/* Called Numbers Grid */}
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Números Cantados
                </h3>
                <div className="grid grid-cols-7 gap-1 max-h-48 overflow-y-auto">
                  {calledNumbers.map((num) => (
                    <div
                      key={num}
                      className="aspect-square bg-primary-600 dark:bg-primary-700 text-white rounded flex items-center justify-center text-xs font-bold"
                    >
                      {num}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bingo Cards */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {cards.map((card, index) => (
                <InteractiveBingoCard
                  key={card.id}
                  card={card.cells}
                  cardNumber={card.cardNumber}
                  onCellClick={(row, col) => handleCellClick(index, row, col)}
                  highlightNumber={highlightNumber}
                  readonly={false}
                />
              ))}
            </div>

            {/* Info Box */}
            <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 transition-colors">
              <div className="flex">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-1">Modo Práctica</h4>
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    Este es un modo de práctica gratuito. Los números se marcan automáticamente,
                    pero también puedes hacer clic en las celdas para marcar/desmarcar manualmente.
                    ¡Perfecto para familiarizarte con el juego antes de jugar con dinero real!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
