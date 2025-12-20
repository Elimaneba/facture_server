# Étape de build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Étape d'exécution
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Installer uniquement les dépendances de production
RUN npm ci --only=production

# Exposer le port
EXPOSE 3001

# Démarrer l'application
CMD ["node", "dist/main"]