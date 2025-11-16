/**
 * Servidor personalizado para Next.js con Socket.io
 * Este servidor maneja la comunicación en tiempo real para las sesiones de bingo
 */

const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = parseInt(process.env.PORT || '3000', 10)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

// Estado de las sesiones activas
const activeSessions = new Map()

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error handling request:', err)
      res.statusCode = 500
      res.end('Internal server error')
    }
  })

  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXTAUTH_URL || `http://localhost:${port}`,
      methods: ['GET', 'POST'],
    },
  })

  io.on('connection', (socket) => {
    console.log('Cliente conectado:', socket.id)

    // Unirse a una sesión
    socket.on('join-session', ({ sessionId, userId, role }) => {
      socket.join(`session:${sessionId}`)

      // Inicializar sesión si no existe
      if (!activeSessions.has(sessionId)) {
        activeSessions.set(sessionId, {
          participants: new Map(),
          calledNumbers: [],
          currentRound: 0,
        })
      }

      const session = activeSessions.get(sessionId)
      session.participants.set(socket.id, { userId, role })

      // Notificar a todos
      io.to(`session:${sessionId}`).emit('participant-joined', {
        userId,
        totalParticipants: session.participants.size,
      })

      // Enviar estado actual al nuevo participante
      socket.emit('session-state', {
        calledNumbers: session.calledNumbers,
        currentRound: session.currentRound,
        totalParticipants: session.participants.size,
      })

      console.log(`Usuario ${userId} se unió a sesión ${sessionId}`)
    })

    // Salir de una sesión
    socket.on('leave-session', ({ sessionId }) => {
      handleLeaveSession(socket, sessionId)
    })

    // Host: Iniciar sesión
    socket.on('start-session', ({ sessionId }) => {
      io.to(`session:${sessionId}`).emit('session-started', {
        timestamp: Date.now(),
      })
      console.log(`Sesión ${sessionId} iniciada`)
    })

    // Host: Cantar número
    socket.on('call-number', ({ sessionId, number }) => {
      const session = activeSessions.get(sessionId)
      if (session) {
        session.calledNumbers.push(number)

        io.to(`session:${sessionId}`).emit('number-called', {
          number,
          calledNumbers: session.calledNumbers,
          timestamp: Date.now(),
        })

        console.log(`Sesión ${sessionId}: Número cantado ${number}`)
      }
    })

    // Jugador: Cantar BINGO
    socket.on('claim-bingo', ({ sessionId, userId, cardId, pattern }) => {
      io.to(`session:${sessionId}`).emit('bingo-claimed', {
        userId,
        cardId,
        pattern,
        timestamp: Date.now(),
      })
      console.log(`Usuario ${userId} cantó BINGO en sesión ${sessionId}`)
    })

    // Bingo verificado
    socket.on('bingo-verified', ({ sessionId, userId, cardId, pattern, isValid }) => {
      io.to(`session:${sessionId}`).emit('bingo-result', {
        userId,
        cardId,
        pattern,
        isValid,
        timestamp: Date.now(),
      })
    })

    // Chat
    socket.on('send-message', ({ sessionId, userId, username, message }) => {
      io.to(`session:${sessionId}`).emit('chat-message', {
        userId,
        username,
        message,
        timestamp: Date.now(),
      })
    })

    // Reacción (emoji)
    socket.on('send-reaction', ({ sessionId, userId, reaction }) => {
      io.to(`session:${sessionId}`).emit('reaction', {
        userId,
        reaction,
        timestamp: Date.now(),
      })
    })

    // Host: Finalizar sesión
    socket.on('end-session', ({ sessionId }) => {
      io.to(`session:${sessionId}`).emit('session-ended', {
        timestamp: Date.now(),
      })
      activeSessions.delete(sessionId)
      console.log(`Sesión ${sessionId} finalizada`)
    })

    // Desconexión
    socket.on('disconnect', () => {
      console.log('Cliente desconectado:', socket.id)

      // Buscar y limpiar de todas las sesiones
      activeSessions.forEach((session, sessionId) => {
        if (session.participants.has(socket.id)) {
          handleLeaveSession(socket, sessionId)
        }
      })
    })
  })

  function handleLeaveSession(socket, sessionId) {
    const session = activeSessions.get(sessionId)
    if (session) {
      const participant = session.participants.get(socket.id)
      session.participants.delete(socket.id)

      socket.leave(`session:${sessionId}`)

      if (participant) {
        io.to(`session:${sessionId}`).emit('participant-left', {
          userId: participant.userId,
          totalParticipants: session.participants.size,
        })
      }

      // Limpiar sesión si no hay participantes
      if (session.participants.size === 0) {
        activeSessions.delete(sessionId)
        console.log(`Sesión ${sessionId} eliminada (sin participantes)`)
      }
    }
  }

  httpServer
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
      console.log('> Socket.io server running')
    })
})
