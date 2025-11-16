# 🚀 Guía de Inicio Rápido - Kash-in

Esta guía te ayudará a tener Kash-in funcionando en menos de 5 minutos.

## Prerrequisitos

- Node.js 18+ instalado
- Una base de datos PostgreSQL (local o [Neon](https://neon.tech) - recomendado)
- Cuenta en [Stripe](https://stripe.com) (para pagos)

## Pasos de Instalación

### 1. Clonar e Instalar

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/Bingo-Kash-in.git
cd Bingo-Kash-in

# Instalar dependencias
npm install
```

### 2. Configurar Variables de Entorno

```bash
# Copiar el archivo de ejemplo
cp .env.local.example .env.local
```

Edita `.env.local` con tus credenciales:

```env
# Base de datos (usar Neon para desarrollo rápido)
DATABASE_URL="postgresql://user:password@host/database"

# NextAuth (genera un secret con: openssl rand -base64 32)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="tu-secret-aleatorio-aqui"

# Stripe (obtén keys de: https://dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Opcional (puedes dejarlos vacíos para desarrollo)
YAPPY_API_KEY=""
AGORA_APP_ID=""
```

### 3. Setup de Base de Datos

```bash
# Generar cliente de Prisma
npx prisma generate

# Crear tablas en la base de datos
npx prisma db push
```

### 4. Iniciar la Aplicación

```bash
# Modo desarrollo (incluye Socket.io)
npm run dev
```

La aplicación estará disponible en: **http://localhost:3000**

## 🎮 Primeros Pasos

### Crear tu Primera Cuenta

1. Ve a http://localhost:3000
2. Haz clic en "Registrarse"
3. Completa el formulario
4. Inicia sesión

### Convertirte en Anfitrión

Por defecto, los usuarios tienen rol de PLAYER. Para ser HOST:

```bash
# Abre Prisma Studio
npx prisma studio

# En la tabla User, cambia el campo "role" de "PLAYER" a "HOST"
```

### Crear tu Primera Sesión de Bingo

1. Como HOST, ve al dashboard
2. Haz clic en "Crear Sesión"
3. Define:
   - Título y descripción
   - Precio del cartón ($1-$10 recomendado)
   - Comisión del anfitrión (5-15%)
   - Rondas y premios
4. Programa la fecha y hora
5. ¡Publica!

### Agregar Balance de Prueba

Para pruebas locales, puedes agregar balance manualmente:

```bash
# Abre Prisma Studio
npx prisma studio

# En la tabla Wallet:
# - Encuentra tu wallet (por userId)
# - Modifica el campo "balance" a 100.00
```

## 🧪 Datos de Prueba

### Crear Usuarios de Prueba

Puedes usar estos scripts SQL directamente en tu base de datos:

```sql
-- Usuario Jugador
INSERT INTO "User" (id, email, password, name, role)
VALUES (
  'test-player-1',
  'jugador@test.com',
  '$2a$12$...',  -- hash de "password123"
  'Jugador Test',
  'PLAYER'
);

-- Usuario Anfitrión
INSERT INTO "User" (id, email, password, name, role)
VALUES (
  'test-host-1',
  'host@test.com',
  '$2a$12$...',
  'Anfitrión Test',
  'HOST'
);
```

## 🔧 Comandos Útiles

```bash
# Ver base de datos en el navegador
npm run prisma:studio

# Ver logs en tiempo real
npm run dev

# Limpiar y reconstruir
rm -rf .next
npm run build

# Ver estructura de BD
npx prisma db pull
```

## 🐛 Solución de Problemas

### Error: "Cannot find module '@prisma/client'"
```bash
npx prisma generate
```

### Error: "Database connection failed"
- Verifica que DATABASE_URL esté correcta
- Asegúrate que la base de datos existe
- Revisa que el servidor PostgreSQL está corriendo

### Error: "NEXTAUTH_SECRET is not defined"
```bash
# Genera un nuevo secret
openssl rand -base64 32
# Cópialo a .env.local como NEXTAUTH_SECRET
```

### Socket.io no conecta
- Asegúrate de estar usando `npm run dev` (no `next dev`)
- Verifica que el puerto 3000 esté libre
- Revisa la consola del navegador

## 📚 Siguientes Pasos

1. **Lee la documentación completa**: [README.md](./README.md)
2. **Explora el código**: Comienza por `app/page.tsx`
3. **Personaliza**: Modifica colores en `tailwind.config.ts`
4. **Integra servicios**: Configura Stripe, Yappy y Agora
5. **Despliega**: Sube a Vercel siguiendo [DEPLOYMENT.md](./DEPLOYMENT.md)

## 💡 Tips de Desarrollo

- Usa **Prisma Studio** para ver y editar datos fácilmente
- Los archivos de tipo se auto-generan con Prisma
- Hot reload está activo - los cambios se reflejan automáticamente
- Revisa los logs en la consola para debugging

## 🆘 Necesitas Ayuda?

- 📖 [Documentación completa](./README.md)
- 🐛 [Reportar un bug](https://github.com/tu-usuario/Bingo-Kash-in/issues)
- 💬 [Discusiones](https://github.com/tu-usuario/Bingo-Kash-in/discussions)

---

**¡Listo! Ya tienes Kash-in funcionando localmente. Ahora crea tu primera sesión de bingo! 🎉**
