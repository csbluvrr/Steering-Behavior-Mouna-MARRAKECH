# Steering Behaviors - Craig Reynolds (p5.js)

Ce projet rassemble une suite d'applications, d'exercices et de simulations interactives développées avec **p5.js**, implémentant les **Steering Behaviors** d'après le papier fondateur de Craig W. Reynolds (*Steering Behaviors For Autonomous Characters*, GDC 1999).

L'article original est consultable dans le dossier :
`article craig reynolds/Steering Behaviors For Autonomous Characters.pdf`

<!-- START:LAST_UPDATED --> *Dernière actualisation automatique : 2026-11-24 12:05:47 UTC* <!-- END:LAST_UPDATED -->

---

## 🏛️ Règles d'Or de l'Architecture

Conformément à la spécification définie dans [ARCHITECTURE.md](ARCHITECTURE.md) :

1. **Une seule classe par fichier** : Tout fichier JavaScript définit une unique classe (ex. `Vehicle` dans `vehicle.js`, `Obstacle` dans `obstacle.js`).
2. **Tout élément graphique animé est un `Vehicle`** :
   - Tout objet visuel mobile est une instance de `Vehicle` ou d'une sous-classe.
   - Les mouvements sont exclusivement régis par la formule de Reynolds :
     $$\vec{F}_{\text{steering}} = \text{truncate}(\vec{v}_{\text{desired}} - \vec{v}_{\text{actuelle}}, \text{maxForce})$$
3. **Même les obstacles fixes sont des `Vehicle`** :
   - Les éléments statiques (murs, rochers, repères) dérivent de `Vehicle` (`class Obstacle extends Vehicle`) avec `maxSpeed = 0` par défaut. Cela garantit une interface physique commune et permet de les rendre mobiles ultérieurement.
4. **Spécialisation par héritage** :
   - Tout objet spécialisé (`Player`, `Enemy`, `Spaceship`, `Missile`, `AnimatedScore`, `Target`) doit être une sous-classe de `Vehicle`.
5. **Bonnes pratiques p5.js** :
   - Aucune instanciation DOM dans `draw()`.
   - Pas de création massive de vecteurs temporaires à 60 FPS (prévention du ramasse-miettes).
   - Utilisation systématique de `push()` / `pop()` pour le rendu.

Consulter également [docs/P5_BEST_PRACTICES.md](docs/P5_BEST_PRACTICES.md) pour les détails d'optimisation.

---

## 📋 Inventaire des Modules & Applications

Ce tableau est **automatiquement synchronisé** à chaque modification ou ajout d'un dossier de sketch dans le projet.

<!-- START:PROJECTS_TABLE -->

| Module / Application | Type | Classes Détectées | Comportements Détectés | Lien Direct |
|---|---|---|---|---|
| **1-Seek** | Exercice / Démo | `ComicBoom, Particle, Target, Vehicle` | `flee, seek` | [1-Seek](./1-Seek/index.html) |
| **2-PursueEvade** | Exercice / Démo | `BouncingBall, ComicBoom, GameAudio, Particle, Target, TrailParticle, Vehicle` | `pursue, evade, seek, flee` | [2-PursueEvade](./2-PursueEvade/index.html) |
| **2-PursueEvade_correction** | Correction / Avancé | `BouncingBall, Target, Vehicle` | `pursue, evade, seek, flee` | [2-PursueEvade_correction](./2-PursueEvade_correction/index.html) |
| **3-Arrival** | Exercice / Démo | `ComicBoom, GameAudio, Particle, Snake, SnakeHead, SnakeSegment, Target, TrailParticle, Vehicle` | `evade, arrive, follow, flee, seek` | [3-Arrival](./3-Arrival/index.html) |
| **3-Arrival_correction** | Correction / Avancé | `Snake, SnakeWander, Vehicle, Target` | `arrive, wander, seek, flee, pursue, evade` | [3-Arrival_correction](./3-Arrival_correction/index.html) |
| **4-Wander** | Exercice / Démo | `Vehicle` | `wander, seek, flee, pursue, evade, arrive` | [4-Wander](./4-Wander/index.html) |

<!-- END:PROJECTS_TABLE -->

---

## 🔄 Comment Mettre à Jour le README ?

Le fichier `README.md` dispose d'un script d'auto-mise à jour qui scanne les dossiers, détecte les nouvelles classes créées et les comportements Reynolds implémentés :

```bash
node scripts/update-readme.js
```

### Automatisation via Git Pre-Commit Hook
Pour que le README se mette à jour tout seul lors de chaque `git commit`, le hook pre-commit exécute automatiquement ce script et ajoute le `README.md` actualisé au commit.

---

## 📂 Navigation & Documents Clés

- **[ARCHITECTURE.md](ARCHITECTURE.md)** : Spécifications complètes des 18 comportements de Craig Reynolds, formules mathématiques et patrons de conception.
- **[HANDOFF.md](HANDOFF.md)** : Fichier de passation pour basculer facilement d'un assistant IA à un autre (contexte, checklist, journal de bord).
- **[docs/P5_BEST_PRACTICES.md](docs/P5_BEST_PRACTICES.md)** : Guide d'optimisation des performances et de style de code pour p5.js.
- **Guides IA dédiés** :
  - Claude : [CLAUDE.md](CLAUDE.md)
  - Gemini / Antigravity : [GEMINI.md](GEMINI.md)
  - GitHub Copilot : [.github/copilot-instructions.md](.github/copilot-instructions.md) / [COPILOT.md](COPILOT.md)
  - OpenAI Codex : [CODEX.md](CODEX.md)
  - Multi-Agents : [AGENTS.md](AGENTS.md)

---

## 🚀 Lancer un Sketch Localement

Les sketches p5.js requièrent un serveur web local pour charger les assets (images, sons, polices) sans blocage CORS :

```bash
# Avec npx serve (ou tout serveur HTTP statique)
npx serve .

# Ou avec Python
python -m http.server 8000
```
Ouvrez ensuite votre navigateur sur `http://localhost:8000` et cliquez sur le module désiré.
