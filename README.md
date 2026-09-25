# Tournesol — Mon Compagnon d'Étude 🌻
*Cahier de textes intelligent, gestion d'emploi du temps et révision active (du CM1 à la Terminale)*

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live%20Demo-amber?style=for-the-badge&logo=github)](https://diego-costanzo.github.io/tournesol-scolaire/)
[![License: MIT](https://img.shields.io/badge/Licence-MIT-green.svg?style=for-the-badge)](LICENSE)
[![Zero Cloud](https://img.shields.io/badge/Privacy-100%25%20Zero%20Cloud-blue?style=for-the-badge)](https://diego-costanzo.github.io/tournesol-scolaire/)
[![PWA](https://img.shields.io/badge/PWA-Installable%20%26%20Hors%20Ligne-purple?style=for-the-badge)](https://diego-costanzo.github.io/tournesol-scolaire/)

---

### 🌐 Utiliser Tournesol directement en ligne (Sans rien installer !)
> **Accès immédiat sans téléchargement ni configuration :**  
> 🔗 **[https://diego-costanzo.github.io/tournesol-scolaire/](https://diego-costanzo.github.io/tournesol-scolaire/)**  
> *(Ouvrez simplement ce lien dans votre navigateur sur PC, Mac, iPad, iPhone ou Android pour commencer instantanément !)*

*(🇮🇹 Leggi la documentazione in italiano in [README_IT.md](README_IT.md))*

---

## 🔒 Confidentialité Absolue & Vos Données Personnelles

Tournesol a été conçu selon le principe fondamental du **Zero Cloud / Privacy First** :
- **Aucun serveur distant :** L'application n'utilise aucune base de données externe et ne transmet aucune information sur Internet.
- **Données de Test vs Données Personnelles :** Lors de la première ouverture, l'application vous accueille chaleureusement et vous propose d'explorer un **Mode Démo** (avec des devoirs et horaires factices pour découvrir l'interface) ou de **Commencer de Zéro**. Dès que vous commencez sérieusement, les données de test sont supprimées et vos données personnelles s'enregistrent en toute sécurité.
- **Stockage 100% Local (Navigateur) :** Si vous utilisez la version Web, tous vos devoirs et notes sont enregistrés **exclusivement dans la mémoire de votre appareil**.
- **Sauvegarde Physique (Exécution depuis le code source) :** Si vous exécutez l'application localement sur votre ordinateur (via les scripts `avvia_mac_linux` / `avvia_windows`), Tournesol active une sauvegarde automatique directement sur votre disque dur (`dati_salvati_pc/tournesol_dati_disco.json`). Cette méthode garantit une persistance absolue, totalement immunisée contre le nettoyage du cache du navigateur !
- **Synchronisation entre plusieurs appareils :** Comme l'application ne stocke rien en ligne, pour transférer vos données d'un appareil à l'autre (par exemple de votre PC vers votre tablette ou smartphone) :
  1. Allez dans l'onglet **Préférences / Sauvegarde** de l'appareil source.
  2. Cliquez sur **"Exporter Sauvegarde (.json)"** (ou téléchargez le fichier en un clic).
  3. Ouvrez Tournesol sur votre autre appareil et cliquez sur **"Restaurer depuis un fichier (.json)"**.
  4. Vos devoirs et votre emploi du temps sont instantanément à jour !
- 💡 **Conseil d'entretien :** Effectuez régulièrement une sauvegarde en un clic, notamment si vous prévoyez de vider l'historique ou les données de navigation de votre navigateur.

---

## ✨ Fonctionnalités Principales

1. **📖 Cahier de Textes Intelligent (Devoirs & Suivi)**
   - Planification automatique par matière avec badges de couleur officiels de l'Éducation Nationale.
   - Estimation dynamique du temps de travail et du niveau d'effort requis selon le cycle scolaire.
   - Saisie rapide par texte naturel (ex. *"Maths : ex 34 p 142 pour jeudi"*).

2. **📅 Emploi du Temps Semaine A / Semaine B**
   - Grille hebdomadaire officielle complète (du lundi au vendredi).
   - Prise en charge native des alternances Semaine A et Semaine B.
   - Intégration Pronote (import de fichiers ou d'URL iCal d'agenda scolaire).

3. **🧠 Espace Révision & Méthode (Outils d'Étude)**
   - **Générateur de Quiz Didactiques Calibrés :** Plus de 180 questions réparties sur 9 niveaux scolaires (du CM1 à la Terminale) et 3 niveaux de difficulté (Facile, Moyen, Défi).
   - **Formulaires & Fiches Repères :** Accès instantané aux formules essentielles de Mathématiques (théorème de Pythagore, puissances, fractions) et de Sciences.
   - **Minuteur Pomodoro & Sons Doux :** Pour travailler avec une concentration optimale par sessions de 25 minutes.

4. **📱 Expérience PWA Hors Ligne (Progressive Web App)**
   - L'application est installable comme une vraie application de bureau ou mobile.
   - Une fois la page ouverte une première fois, elle fonctionne **sans aucune connexion Internet (100% hors ligne)**.

---

## 📲 Comment l'installer sur Smartphone et Tablette (iOS & Android)

Il n'y a **aucun fichier zip à décompresser** ni logiciel compliqué à installer :

### Sur iPhone et iPad (iOS / iPadOS) :
1. Ouvrez [https://diego-costanzo.github.io/tournesol-scolaire/](https://diego-costanzo.github.io/tournesol-scolaire/) dans **Safari**.
2. Appuyez sur le bouton **Partager** (le carré avec la flèche vers le haut ⬆️ en bas de l'écran).
3. Faites défiler vers le bas et sélectionnez **"Sur l'écran d'accueil"**.
4. L'icône Tournesol 🌻 apparaît sur votre écran d'accueil. L'application s'ouvrira en plein écran sans les barres de Safari.

### Sur Smartphones et Tablettes Android (Samsung, Xiaomi, Pixel...) :
1. Ouvrez [https://diego-costanzo.github.io/tournesol-scolaire/](https://diego-costanzo.github.io/tournesol-scolaire/) dans **Google Chrome**.
2. Appuyez sur le menu à trois points verticaux (**⋮**) en haut à droite.
3. Choisissez **"Installer l'application"** (ou *"Ajouter à l'écran d'accueil"*).
4. L'application est installée dans vos applications et fonctionne même en mode avion.

---

## 💻 Utilisation sur Ordinateur (Windows, Linux, macOS)

### Option A : Accès Direct par le Navigateur (Recommandé)
Ouvrez simplement le lien web dans votre navigateur (Chrome, Edge, Firefox, Brave, Safari). Vous pouvez également cliquer sur l'icône **"Installer l'application"** dans la barre d'adresse pour obtenir une fenêtre dédiée sans distractions.

### Option B : Lancement en Local depuis les Fichiers
Si vous préférez exécuter l'application entièrement depuis votre disque dur en mode autonome :
- **Sur Windows 🪟 :** Double-cliquez simplement sur **`avvia_windows.bat`**. Le script configure l'environnement et ouvre l'application automatiquement dans votre navigateur.
- **Sur Linux / macOS 🐧 🍏 :** Exécutez le script **`avvia_mac_linux.sh`** (ou lancez `./avvia_mac_linux.sh` dans un terminal).

---

## 🛠️ Stack Technique

- **Framework :** React 19 + TypeScript + Vite
- **Styles :** Tailwind CSS
- **Icônes :** Lucide React
- **PWA & Offline :** Vite Plugin PWA (Service Workers + Web App Manifest)
- **Zero-Cloud Engine :** LocalStorage réactif + export JSON chiffrable
- **CI/CD :** GitHub Actions (déploiement automatique sur GitHub Pages)

---

## 📄 Licence

Projet open source distribué sous licence MIT. Créé par [Diego Costanzo](https://github.com/diego-costanzo).
