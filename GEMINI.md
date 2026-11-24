# Directives d'Assistance Gemini / Antigravity - Steering Behaviors p5.js

Ce dépôt implémente les **Steering Behaviors de Craig Reynolds** dans un ensemble d'applications et démonstrations interactives développées avec **p5.js**.

## Principes Directeurs
- **Règle 1 : Une classe maximum par fichier** (fichiers modulaires `vehicle.js`, `obstacle.js`, `player.js`, etc.).
- **Règle 2 : L'entité fondamentale est le `Vehicle`** :
  - Tout élément animé est une instance directe ou dérivée de `Vehicle`.
  - Pas de modification directe de `pos` : tout passe par l'intégration Euler standard ($\vec{F}_{\text{steering}} = \vec{v}_{\text{desired}} - \vec{v}_{\text{current}}$ bridé par `maxForce`).
- **Règle 3 : Les éléments fixes sont des sous-classes de `Vehicle`** (ex: `Obstacle extends Vehicle` avec `maxSpeed = 0`).
- **Règle 4 : Objets spécialisés par sous-classement** (`Player`, `Enemy`, `Missile`, `AnimatedScore`, `Spaceship` dérivent de `Vehicle`).
- **Règle 5 : Performance p5.js** :
  - Éviter `new p5.Vector()` à répétition dans `draw()`.
  - Réutiliser des vecteurs membres ou opérer en place.
  - Distances au carré pour les calculs de détection de seuil.
  - Ordonnancement strict des dépendances dans `index.html`.

## Documentation Clé
- [ARCHITECTURE.md](file:///c:/Users/jaimi/Documents/skl/5th%20year/double%20diplo/GAMES/Steering-Behavior-Mouna-MARRAKECH/ARCHITECTURE.md) : Modèle conceptuel à 3 niveaux et formules détaillées des 18 comportements de Craig Reynolds.
- [docs/P5_BEST_PRACTICES.md](file:///c:/Users/jaimi/Documents/skl/5th%20year/double%20diplo/GAMES/Steering-Behavior-Mouna-MARRAKECH/docs/P5_BEST_PRACTICES.md) : Guide de performance p5.js.
- [HANDOFF.md](file:///c:/Users/jaimi/Documents/skl/5th%20year/double%20diplo/GAMES/Steering-Behavior-Mouna-MARRAKECH/HANDOFF.md) : État des travaux et passation inter-agents.
- [README.md](file:///c:/Users/jaimi/Documents/skl/5th%20year/double%20diplo/GAMES/Steering-Behavior-Mouna-MARRAKECH/README.md) : Index actualisable des modules.
