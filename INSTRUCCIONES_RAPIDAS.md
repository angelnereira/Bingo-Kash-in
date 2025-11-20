# ⚡ Instrucciones Rápidas - Consolidar en Main

## 🎯 Objetivo

Consolidar todo el código en la rama `main` y eliminar todas las demás ramas para tener un repositorio limpio que Vercel pueda deployar.

---

## 🚀 3 Pasos Simples

### Paso 1: Descargar el repositorio

```bash
git clone https://github.com/angelnereira/Bingo-Kash-in.git
cd Bingo-Kash-in
```

### Paso 2: Ejecutar el script de consolidación

```bash
chmod +x consolidate-to-main.sh
./consolidate-to-main.sh
```

### Paso 3: Crear las tablas de la base de datos

```bash
npm install
npm run prisma:push
```

---

## ✅ Resultado

Después de ejecutar estos 3 pasos tendrás:

- ✅ Solo la rama `main` (todas las demás eliminadas)
- ✅ Todo el código consolidado en `main`
- ✅ 32 tablas creadas en PostgreSQL
- ✅ Repositorio listo para Vercel

---

## 🚀 Deploy a Vercel

```bash
npm install -g vercel
vercel login
vercel --prod
```

O desde Vercel Dashboard:
1. Import repository
2. Vercel detecta automáticamente `main`
3. Deploy!

---

## 📋 Si Tienes Problemas

Lee la documentación completa en: `CONSOLIDAR_MAIN.md`

---

**¡Todo listo en 3 comandos! 🎉**
