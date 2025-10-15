# Image officielle Playwright (contient déjà Node.js + navigateurs)
FROM mcr.microsoft.com/playwright:v1.47.2-jammy

# Définir le dossier de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances Node.js
RUN npm ci

# Copier le reste du projet
COPY . .

# Variable d’environnement
ENV CI=true

# Démarrer dans un terminal Bash interactif
CMD ["/bin/bash"]
