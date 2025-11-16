# Guía de Contribución

¡Gracias por tu interés en contribuir a Kash-in! 🎉

## Cómo Contribuir

### 1. Reportar Bugs

Si encuentras un bug, por favor crea un issue con:
- Descripción clara del problema
- Pasos para reproducirlo
- Comportamiento esperado vs actual
- Screenshots si es posible
- Información del ambiente (OS, navegador, versión de Node)

### 2. Sugerir Features

Para sugerir nuevas características:
- Describe claramente la funcionalidad
- Explica el problema que resuelve
- Proporciona ejemplos de uso
- Considera el impacto en la experiencia del usuario

### 3. Contribuir Código

#### Setup del Entorno de Desarrollo

```bash
# 1. Fork el repositorio
# 2. Clona tu fork
git clone https://github.com/tu-usuario/Bingo-Kash-in.git

# 3. Instala dependencias
cd Bingo-Kash-in
npm install

# 4. Configura .env.local
cp .env.local.example .env.local
# Edita .env.local con tus credenciales

# 5. Setup de base de datos
npx prisma generate
npx prisma db push

# 6. Inicia el servidor
npm run dev
```

#### Proceso de Desarrollo

1. Crea una rama desde `main`:
```bash
git checkout -b feature/mi-nueva-feature
# o
git checkout -b fix/mi-bug-fix
```

2. Haz tus cambios siguiendo nuestras convenciones de código

3. Asegúrate que todo funciona:
```bash
npm run lint
npm run build
```

4. Commit tus cambios:
```bash
git commit -m "feat: descripción clara del cambio"
```

Usamos [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` nueva funcionalidad
- `fix:` corrección de bug
- `docs:` cambios en documentación
- `style:` formato, punto y coma faltantes, etc
- `refactor:` refactorización de código
- `test:` agregar tests
- `chore:` tareas de mantenimiento

5. Push a tu fork:
```bash
git push origin feature/mi-nueva-feature
```

6. Crea un Pull Request en GitHub

### Convenciones de Código

#### TypeScript
- Usa TypeScript estricto
- Define tipos explícitos para props y retornos de funciones
- Evita `any`, usa `unknown` si es necesario

#### React
- Componentes funcionales con hooks
- Nombra componentes en PascalCase
- Props interfaces con sufijo `Props`
- Usa `'use client'` solo cuando sea necesario

#### Estilos
- Tailwind CSS para estilos
- Clases ordenadas: layout → espaciado → tipografía → colores → otros
- Usa variables de tema del `tailwind.config.ts`

#### Estructura de Archivos
```
componente/
├── ComponentName.tsx       # Componente principal
├── ComponentName.test.tsx  # Tests (próximamente)
└── index.ts               # Re-export
```

### Code Review

Todos los PRs requieren:
- ✅ Pasar los checks de lint
- ✅ Build exitoso
- ✅ Descripción clara de cambios
- ✅ Screenshots para cambios UI
- ✅ Revisión de al menos 1 maintainer

### Licencia

Al contribuir, aceptas que tus contribuciones serán licenciadas bajo la MIT License.

## Preguntas?

- Abre un issue con la etiqueta `question`
- Contacta a los maintainers

¡Gracias por contribuir! 🙏
