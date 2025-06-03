# Cahier De Veille

Application de gestion des cahiers de veille pour les services de police.

## Fonctionnalités

- Authentification des utilisateurs
- Création et gestion de cahiers de veille
- Enregistrement des communications radio
- Gestion des indicatifs
- Export des cahiers en PDF
- Profils utilisateurs avec signatures et paraphes

## Prérequis

- Node.js 18.x ou supérieur
- NPM ou Yarn

## Installation

1. Clonez ce dépôt :
\`\`\`bash
git clone https://github.com/votre-utilisateur/cahier-de-veille.git
cd cahier-de-veille
\`\`\`

2. Installez les dépendances :
\`\`\`bash
npm install
# ou
yarn install
\`\`\`

3. Copiez le fichier `.env.example` en `.env.local` :
\`\`\`bash
cp .env.example .env.local
\`\`\`

4. Modifiez le fichier `.env.local` avec vos paramètres :
\`\`\`
# Chemin vers la base de données SQLite
SQLITE_PATH=./data/cahier-de-veille.db

# Clé secrète pour JWT (générez une clé aléatoire)
JWT_SECRET=votre_clé_secrète_très_longue_et_aléatoire

# Clé d'encryption (générez une clé aléatoire)
NEXT_PUBLIC_ENCRYPTION_KEY=votre_clé_d_encryption_aléatoire
\`\`\`

5. Lancez l'application en mode développement :
\`\`\`bash
npm run dev
# ou
yarn dev
\`\`\`

6. Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## Déploiement

Pour déployer l'application en production :

1. Construisez l'application :
\`\`\`bash
npm run build
# ou
yarn build
\`\`\`

2. Lancez l'application en mode production :
\`\`\`bash
npm start
# ou
yarn start
\`\`\`

## Structure de la base de données

L'application utilise SQLite pour stocker les données. La base de données est initialisée automatiquement au démarrage de l'application avec les tables suivantes :

- `users` : Informations d'authentification des utilisateurs
- `profiles` : Profils des utilisateurs (nom, matricule, service, signature, paraphe)
- `cahiers_de_veille` : Cahiers de veille
- `communications` : Communications enregistrées dans les cahiers
- `indicatifs` : Indicatifs utilisés dans les communications

## Licence

Ce projet est sous licence MIT.
\`\`\`

Let's create a .env.example file:

```plaintext file=".env.example"
# Chemin vers la base de données SQLite
SQLITE_PATH=./data/cahier-de-veille.db

# Clé secrète pour JWT (générez une clé aléatoire)
JWT_SECRET=votre_clé_secrète_très_longue_et_aléatoire

# Clé d'encryption (générez une clé aléatoire)
NEXT_PUBLIC_ENCRYPTION_KEY=votre_clé_d_encryption_aléatoire
