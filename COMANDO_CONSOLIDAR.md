# 🚀 Comando para Consolidar Todo en Main

## ⚡ Ejecuta Este Comando (Copia y Pega)

Desde tu computadora local, en el directorio del proyecto:

```bash
git fetch origin && \
git checkout main && \
git merge origin/claude/main-019zgqhDjwqV4EuCz2JaoEFL --no-ff -m "Merge: Consolidar todo el código en main

- Sistema completo de Bingo con 32 modelos
- Engagement: Promociones, lealtad, referidos
- Gamificación: Niveles, logros, badges
- Competencias: Torneos, eventos, jackpots
- Prisma Accelerate 5.22.0 configurado
- Documentación completa
- Listo para Vercel" && \
git push origin main && \
echo "✅ Main actualizada!" && \
git push origin --delete claude/main-019zgqhDjwqV4EuCz2JaoEFL 2>/dev/null; \
git push origin --delete claude/code-review-019zgqhDjwqV4EuCz2JaoEFL 2>/dev/null; \
git push origin --delete claude/kash-in-bingo-app-01FoUqCgrhK8JzShYFK9cKxy 2>/dev/null; \
git branch -D claude/main-019zgqhDjwqV4EuCz2JaoEFL 2>/dev/null; \
git branch -D claude/code-review-019zgqhDjwqV4EuCz2JaoEFL 2>/dev/null; \
git branch -D claude/kash-in-bingo-app-01FoUqCgrhK8JzShYFK9cKxy 2>/dev/null; \
git remote prune origin && \
echo "" && \
echo "🎉 ¡Consolidación completada!" && \
echo "" && \
echo "Ramas restantes:" && \
git branch -a
```

---

## 📋 Qué Hace Este Comando

1. ✅ Descarga todas las ramas del remoto
2. ✅ Cambia a la rama `main`
3. ✅ Mergea `claude/main-019zgqhDjwqV4EuCz2JaoEFL` con todo el código
4. ✅ Pushea `main` al remoto
5. ✅ Elimina todas las ramas `claude/*` del remoto
6. ✅ Elimina todas las ramas `claude/*` locales
7. ✅ Limpia referencias obsoletas
8. ✅ Muestra las ramas restantes (solo debe quedar `main`)

---

## 🎯 Output Esperado

```
✅ Main actualizada!
🎉 ¡Consolidación completada!

Ramas restantes:
* main
  remotes/origin/main
```

---

## ⚡ Después del Comando

Crear las tablas:
```bash
npm install && npm run prisma:push
```

Deploy a Vercel:
```bash
vercel --prod
```

---

**¡Un solo comando y listo! 🚀**
