import { prisma } from './prisma'
import { TransactionType, TransactionStatus, PaymentMethod } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

export interface CreateTransactionParams {
  userId: string
  type: TransactionType
  amount: number
  paymentMethod?: PaymentMethod
  reference?: string
  description?: string
  metadata?: any
}

/**
 * Crea una transacción y actualiza el balance de la billetera
 */
export async function createTransaction(params: CreateTransactionParams) {
  const { userId, type, amount, paymentMethod, reference, description, metadata } = params

  // Calcular fee basado en el tipo
  const feePercentage = getFeePercentage(type)
  const fee = amount * feePercentage
  const netAmount = amount - fee

  return await prisma.$transaction(async (tx) => {
    // Crear transacción
    const transaction = await tx.transaction.create({
      data: {
        userId,
        type,
        amount: new Decimal(amount),
        fee: new Decimal(fee),
        netAmount: new Decimal(netAmount),
        paymentMethod,
        reference,
        description,
        metadata,
        status: TransactionStatus.PENDING,
      },
    })

    // Actualizar balance (si es necesario)
    if (shouldUpdateBalance(type)) {
      await updateWalletBalance(tx, userId, type, netAmount)
    }

    return transaction
  })
}

/**
 * Completa una transacción pendiente
 */
export async function completeTransaction(transactionId: string) {
  return await prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.update({
      where: { id: transactionId },
      data: { status: TransactionStatus.COMPLETED },
    })

    // Si era una transacción pendiente que afecta el balance, actualizarlo ahora
    if (shouldUpdateBalance(transaction.type) && transaction.status === TransactionStatus.COMPLETED) {
      await updateWalletBalance(
        tx,
        transaction.userId,
        transaction.type,
        transaction.netAmount.toNumber()
      )
    }

    return transaction
  })
}

/**
 * Actualiza el balance de la billetera según el tipo de transacción
 */
async function updateWalletBalance(
  tx: any,
  userId: string,
  type: TransactionType,
  amount: number
) {
  const wallet = await tx.wallet.findUnique({ where: { userId } })

  if (!wallet) {
    throw new Error('Billetera no encontrada')
  }

  const updates: any = {}

  switch (type) {
    case TransactionType.DEPOSIT:
      updates.balance = { increment: amount }
      updates.totalDeposits = { increment: amount }
      break

    case TransactionType.WITHDRAWAL:
      if (wallet.balance.toNumber() < amount) {
        throw new Error('Balance insuficiente')
      }
      updates.balance = { decrement: amount }
      updates.totalWithdrawals = { increment: amount }
      break

    case TransactionType.CARD_PURCHASE:
      if (wallet.balance.toNumber() < amount) {
        throw new Error('Balance insuficiente')
      }
      updates.balance = { decrement: amount }
      updates.lockedBalance = { increment: amount }
      break

    case TransactionType.PRIZE_WIN:
      updates.lockedBalance = { decrement: Math.min(wallet.lockedBalance.toNumber(), amount) }
      updates.balance = { increment: amount }
      updates.totalWinnings = { increment: amount }
      break

    case TransactionType.HOST_COMMISSION:
    case TransactionType.PLATFORM_FEE:
      // Estos se procesan de manera diferente
      break
  }

  await tx.wallet.update({
    where: { userId },
    data: updates,
  })
}

/**
 * Obtiene el porcentaje de fee según el tipo de transacción
 */
function getFeePercentage(type: TransactionType): number {
  switch (type) {
    case TransactionType.WITHDRAWAL:
      return parseFloat(process.env.WITHDRAWAL_FEE_PERCENTAGE || '2') / 100
    case TransactionType.DEPOSIT:
      return 0 // Sin fee en depósitos
    default:
      return 0
  }
}

/**
 * Determina si el tipo de transacción debe actualizar el balance inmediatamente
 */
function shouldUpdateBalance(type: TransactionType): boolean {
  return [
    TransactionType.DEPOSIT,
    TransactionType.WITHDRAWAL,
    TransactionType.CARD_PURCHASE,
    TransactionType.PRIZE_WIN,
  ].includes(type)
}

/**
 * Obtiene el balance disponible de un usuario
 */
export async function getUserBalance(userId: string) {
  const wallet = await prisma.wallet.findUnique({
    where: { userId },
  })

  return {
    balance: wallet?.balance.toNumber() || 0,
    lockedBalance: wallet?.lockedBalance.toNumber() || 0,
    availableBalance: wallet ? wallet.balance.toNumber() - wallet.lockedBalance.toNumber() : 0,
  }
}

/**
 * Libera el balance bloqueado después de que termine una sesión
 */
export async function unlockSessionBalance(sessionId: string) {
  const session = await prisma.bingoSession.findUnique({
    where: { id: sessionId },
    include: {
      participants: true,
      cards: true,
    },
  })

  if (!session) {
    throw new Error('Sesión no encontrada')
  }

  // Agrupar por usuario para calcular el total bloqueado
  const userLocks = new Map<string, number>()

  for (const card of session.cards) {
    const current = userLocks.get(card.userId) || 0
    userLocks.set(card.userId, current + session.cardPrice.toNumber())
  }

  // Desbloquear balance para cada usuario
  for (const [userId, amount] of userLocks) {
    await prisma.wallet.update({
      where: { userId },
      data: {
        lockedBalance: { decrement: amount },
      },
    })
  }
}
