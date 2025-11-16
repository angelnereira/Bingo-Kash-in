import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET: Obtener detalles de una sesión
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await prisma.bingoSession.findUnique({
      where: { id: params.id },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        rounds: {
          orderBy: {
            roundNumber: 'asc',
          },
        },
        _count: {
          select: {
            participants: true,
            cards: true,
          },
        },
      },
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Sesión no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(session)
  } catch (error) {
    console.error('Error obteniendo sesión:', error)
    return NextResponse.json(
      { error: 'Error al obtener sesión' },
      { status: 500 }
    )
  }
}

// PATCH: Actualizar sesión
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authSession = await getServerSession(authOptions)

    if (!authSession?.user?.id) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const session = await prisma.bingoSession.findUnique({
      where: { id: params.id },
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Sesión no encontrada' },
        { status: 404 }
      )
    }

    // Verificar que el usuario sea el host
    if (session.hostId !== authSession.user.id) {
      return NextResponse.json(
        { error: 'No tienes permisos para modificar esta sesión' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Solo permitir actualizar ciertos campos
    const updatedSession = await prisma.bingoSession.update({
      where: { id: params.id },
      data: {
        title: body.title,
        description: body.description,
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : undefined,
      },
    })

    return NextResponse.json(updatedSession)
  } catch (error) {
    console.error('Error actualizando sesión:', error)
    return NextResponse.json(
      { error: 'Error al actualizar sesión' },
      { status: 500 }
    )
  }
}

// DELETE: Cancelar sesión
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authSession = await getServerSession(authOptions)

    if (!authSession?.user?.id) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const session = await prisma.bingoSession.findUnique({
      where: { id: params.id },
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Sesión no encontrada' },
        { status: 404 }
      )
    }

    // Verificar que el usuario sea el host
    if (session.hostId !== authSession.user.id) {
      return NextResponse.json(
        { error: 'No tienes permisos para cancelar esta sesión' },
        { status: 403 }
      )
    }

    // Solo permitir cancelar si no ha comenzado
    if (session.status !== 'SCHEDULED' && session.status !== 'WAITING') {
      return NextResponse.json(
        { error: 'Solo se pueden cancelar sesiones que no han comenzado' },
        { status: 400 }
      )
    }

    const updatedSession = await prisma.bingoSession.update({
      where: { id: params.id },
      data: { status: 'CANCELLED' },
    })

    return NextResponse.json({
      session: updatedSession,
      message: 'Sesión cancelada exitosamente',
    })
  } catch (error) {
    console.error('Error cancelando sesión:', error)
    return NextResponse.json(
      { error: 'Error al cancelar sesión' },
      { status: 500 }
    )
  }
}
