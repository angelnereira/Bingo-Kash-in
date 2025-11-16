# Kash-in - Plataforma de Bingo Interactivo en Vivo

## 🎯 Descripción

**Kash-in** es la plataforma líder de bingo social en vivo donde cualquier persona puede ser anfitrión de su propia noche de bingo. La aplicación se centra en la facilidad de uso, la interacción en tiempo real (voz del anfitrión) y un sistema de billetera "en-app" seguro con capacidades de monetización real.

## ✨ Características Principales

### Para Jugadores
- 🎲 **Juego en Tiempo Real**: Participa en sesiones de bingo en vivo
- 🔊 **Audio del Anfitrión**: Escucha al anfitrión cantando los números en vivo
- ⚡ **Auto-Daub**: Marcado automático de números en tus cartones
- 💬 **Chat en Vivo**: Interactúa con otros jugadores
- 💰 **Billetera Digital**: Recarga saldo, compra cartones y retira ganancias
- 🏆 **Premios Reales**: Gana dinero real en cada sesión

### Para Anfitriones
- 🎤 **Streaming de Voz**: Transmite tu voz en vivo usando Agora
- 🎮 **Control Total**: Crea sesiones, define precios y estructura de premios
- 📊 **Panel de Control**: Gestiona tu sesión en tiempo real
- 💵 **Comisiones**: Gana un porcentaje de las ventas de cartones

### Para la Plataforma
- 🔐 **Seguridad**: Sistema robusto de autenticación y autorizaciones
- 💳 **Pagos Integrados**: Yappy (Panamá) y tarjetas de crédito/débito
- 📈 **Escalable**: Arquitectura preparada para miles de usuarios
- 🛡️ **Juego Justo**: Verificación automática de ganadores

## 💰 Sistema de Precios Flexible

Kash-in implementa un sistema de precios de 4 tiers optimizado para maximizar conversiones:

### Tiers de Precios

| Tier | Rango | Precio Popular | Descuentos | Público |
|------|-------|----------------|------------|---------|
| 🎲 **CASUAL** | $0.50 - $1.99 | $0.99 | Hasta 25% | Principiantes |
| ⭐ **STANDARD** | $2.00 - $4.99 | $2.99 | Hasta 20% | Jugadores regulares |
| 💎 **PREMIUM** | $5.00 - $7.99 | $5.99 | Hasta 15% | Experimentados |
| 👑 **VIP** | $8.00 - $10.00 | $9.99 | Hasta 12% | High rollers |

### Descuentos por Paquetes

Compra más cartones y ahorra automáticamente:

- **3 cartones**: 5-10% de descuento
- **5 cartones**: 10-15% de descuento
- **10 cartones**: 15-25% de descuento

**Ejemplo:** En tier STANDARD ($2.99):
- 1 cartón: $2.99
- 5 cartones: $13.16 (en lugar de $14.95) - Ahorra $1.79 (12%)
- 10 cartones: $23.92 (en lugar de $29.90) - Ahorra $5.98 (20%)

Ver [PRICING_GUIDE.md](./PRICING_GUIDE.md) para estrategias detalladas.

## 🏗️ Arquitectura Técnica

### Stack Tecnológico

```
Frontend:
├── Next.js 14 (App Router)
├── React 18
├── TypeScript
├── Tailwind CSS
└── Socket.io Client

Backend:
├── Next.js API Routes
├── Prisma ORM
├── PostgreSQL (Neon)
├── Socket.io Server
└── NextAuth.js

Servicios Externos:
├── Stripe (Pagos con tarjeta)
├── Yappy API (Pagos locales Panamá)
├── Agora.io (Streaming de voz)
└── Vercel (Hosting)
```

### Estructura del Proyecto

```
Bingo-Kash-in/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   │   ├── auth/            # Autenticación
│   │   ├── wallet/          # Billetera y transacciones
│   │   └── sessions/        # Sesiones de bingo
│   ├── auth/                # Páginas de autenticación
│   ├── dashboard/           # Dashboard principal
│   ├── session/             # Sala de juego
│   ├── host/                # Panel de anfitrión
│   └── wallet/              # Gestión de billetera
├── components/              # Componentes React
├── lib/                     # Utilidades y helpers
│   ├── prisma.ts           # Cliente de Prisma
│   ├── auth.ts             # Configuración NextAuth
│   ├── bingo-utils.ts      # Lógica de bingo
│   ├── wallet-utils.ts     # Gestión de billetera
│   ├── stripe.ts           # Integración Stripe
│   ├── yappy.ts            # Integración Yappy
│   └── agora.ts            # Integración Agora
├── prisma/                  # Esquema de base de datos
│   └── schema.prisma
├── types/                   # Tipos TypeScript
├── server.js               # Servidor Socket.io
└── package.json
```

## 🗄️ Modelo de Datos

### Entidades Principales

- **User**: Usuarios del sistema (Jugador, Anfitrión, Admin)
- **Wallet**: Billetera digital de cada usuario
- **Transaction**: Historial de transacciones
- **BingoSession**: Sesiones de bingo
- **GameRound**: Rondas dentro de una sesión
- **BingoCard**: Cartones de bingo
- **SessionParticipant**: Relación usuario-sesión
- **ChatMessage**: Mensajes de chat

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js 18+
- PostgreSQL (o cuenta en Neon)
- Cuenta en Stripe
- Cuenta en Agora.io (para voz)
- API Key de Yappy (opcional)

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/Bingo-Kash-in.git
cd Bingo-Kash-in
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

Crear archivo `.env` basado en `.env.example`:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/kashin_bingo"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Yappy (opcional)
YAPPY_API_KEY="your-yappy-api-key"
YAPPY_MERCHANT_ID="your-merchant-id"

# Agora
AGORA_APP_ID="your-agora-app-id"
AGORA_APP_CERTIFICATE="your-agora-certificate"

# Platform fees
PLATFORM_FEE_PERCENTAGE="20"
WITHDRAWAL_FEE_PERCENTAGE="2"
```

4. **Configurar base de datos**
```bash
npx prisma generate
npx prisma db push
```

5. **Iniciar servidor de desarrollo**
```bash
npm run dev
```

6. **Iniciar servidor Socket.io** (en otra terminal)
```bash
node server.js
```

La aplicación estará disponible en `http://localhost:3000`

## 📱 Uso de la Aplicación

### Como Jugador

1. **Registro**: Crea tu cuenta en `/auth/register`
2. **Depositar**: Recarga saldo en tu billetera
3. **Explorar**: Busca sesiones activas en el dashboard
4. **Unirse**: Compra cartones para la sesión
5. **Jugar**: Los números se marcan automáticamente
6. **Ganar**: Presiona "¡BINGO!" cuando completes un patrón
7. **Cobrar**: Retira tus ganancias a tu cuenta bancaria

### Como Anfitrión

1. **Solicitar Permiso**: Contacta al admin para obtener rol de HOST
2. **Crear Sesión**: Define título, precio, premios y comisiones
3. **Programar**: Establece fecha y hora de inicio
4. **Iniciar**: Comienza la transmisión de voz
5. **Cantar Números**: Usa la tómbola digital
6. **Validar Ganadores**: El sistema lo hace automáticamente
7. **Cobrar Comisión**: Recibe tu porcentaje al finalizar

## 💰 Modelo de Monetización

### Distribución de Ingresos por Sesión

```
Ventas Totales = Cartones Vendidos × Precio por Cartón

├── Comisión Plataforma (15-25%)  → Kash-in
├── Comisión Anfitrión (5-15%)    → Anfitrión
└── Pozo de Premios (60-80%)      → Ganadores
```

### Fees Adicionales

- **Retiro de Fondos**: 2% del monto retirado
- **Recarga (opcional)**: Varía según método de pago

## 🔐 Seguridad

- Autenticación con NextAuth.js y JWT
- Passwords hasheados con bcrypt
- Validación de datos con Zod
- Transacciones atómicas con Prisma
- Verificación automática de ganadores
- Sistema de roles y permisos

## 🧪 Testing

```bash
# Ejecutar tests (próximamente)
npm test

# Coverage
npm run test:coverage
```

## 📦 Deployment

### Vercel (Recomendado)

1. Conectar repositorio a Vercel
2. Configurar variables de entorno
3. Deploy automático en cada push

### Deployment Manual

```bash
npm run build
npm start
```

## 🛣️ Roadmap

- [x] Sistema de autenticación
- [x] Billetera digital
- [x] Sesiones de bingo
- [x] Socket.io para tiempo real
- [ ] Integración completa con Yappy
- [ ] Integración completa con Agora
- [ ] App móvil (React Native)
- [ ] Sistema de torneos
- [ ] Programa de afiliados
- [ ] Panel de administración
- [ ] Analytics y reportes
- [ ] Notificaciones push

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Autores

- **Tu Nombre** - *Trabajo Inicial* - [tuusuario](https://github.com/tuusuario)

## 📞 Contacto

- Email: soporte@kashin.app
- Website: https://kashin.app
- Twitter: [@KashInApp](https://twitter.com/kashinapp)

## 🙏 Agradecimientos

- Next.js por el excelente framework
- Prisma por el ORM
- Socket.io por la comunicación en tiempo real
- Stripe por el procesamiento de pagos
- Agora por la tecnología de streaming

---

**¡Hecho con ❤️ para la comunidad de bingo!**
