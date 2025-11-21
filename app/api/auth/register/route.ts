import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  username: z.string().min(3, 'El username debe tener al menos 3 caracteres').optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, name, username } = registerSchema.parse(body)

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          ...(username ? [{ username }] : []),
        ],
      },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'El email o username ya está en uso' },
        { status: 400 }
      )
    }

    // Hash de la contraseña
    const hashedPassword = await hash(password, 12)

    // Preparar datos del usuario, omitiendo username si no se envía
    const userData: any = {
      email,
      password: hashedPassword,
      name,
    }
    if (username) {
      userData.username = username
    }

    // Crear usuario y billetera
    const user = await prisma.user.create({
      data: {
        ...userData,
        wallet: {
          create: {},
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        role: true,
        createdAt: true,
      },
    })

    return NextResponse.json(
      { user, message: 'Usuario creado exitosamente' },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Error en registro:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al crear usuario' },
      { status: 500 }
    )
  }
}
