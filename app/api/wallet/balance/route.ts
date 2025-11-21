import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserBalance } from '@/lib/wallet-utils'

// Marcar como ruta dinámica (no estática)
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const balance = await getUserBalance(session.user.id)

    return NextResponse.json(balance)
  } catch (error) {
    console.error('Error obteniendo balance:', error)
    return NextResponse.json(
      { error: 'Error al obtener balance' },
      { status: 500 }
    )
  }
}
