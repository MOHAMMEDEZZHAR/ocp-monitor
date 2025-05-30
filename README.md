# 🖥️ Supervision des Données en Temps Réel

Ce projet a pour objectif de mettre en place une application de supervision en temps réel des données industrielles provenant d’un serveur OPC UA, en utilisant **Node-RED** pour la collecte et le traitement, et **React** pour l’interface utilisateur.

## 🔧 Technologies utilisées

- **Node-RED** : lecture des données depuis le serveur OPC UA, détection de seuils, génération d'alertes, envoi des données via WebSocket.
- **React** : affichage dynamique des données en temps réel, visualisation des alertes, graphiques, paramètres configurables.
- **WebSocket** : communication en temps réel entre Node-RED et le frontend React.
- **JavaScript / TypeScript**, **HTML/CSS**, **TailwindCSS** pour le style.
- **Email/SMS** (optionnel) pour l’envoi automatique d’alertes.

## 🎯 Fonctionnalités principales

- 🔄 Lecture continue des données depuis un serveur OPC UA.
- ⚠️ Détection automatique de seuils critiques.
- 🔔 Affichage d’alertes temps réel avec acquittement.
- 📈 Graphiques et historiques des données supervisées.
- ⚙️ Modification des seuils depuis l’interface utilisateur.
- 🌙 Mode sombre / clair.

- 📤 Exportation des données en CSV ou Excel.
- 🔐 Authentification intelegent .
- 🛠️ Mode édition du dashboard pour personnalisation.

## 🚀 Lancement du projet

```bash
cd frontend
npm install
npm run dev
```

### Prérequis

- Node.js et npm
- Node-RED
- Un serveur OPC UA de simulation (ex. : [Prosys OPC UA Simulation Server](https://www.prosysopc.com/products/opc-ua-simulation-server/))

### 1. Lancer Node-RED

1. Installer les dépendances nécessaires (node-red-contrib-opcua, node-red-dashboard, node-red-websocket, etc.).
2. Importer le flux Node-RED fourni (`flows.json`).
3. Démarrer Node-RED :
   ```bash
   node-red
