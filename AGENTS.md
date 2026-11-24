# Directives Multi-Agents - Steering Behaviors p5.js

Ce fichier s'applique à tous les agents autonomes travaillant sur ce dépôt (Cursor, Antigravity, Cline, Windsurf, Devin, etc.).

## 1. Règles d'Architecture Strictes
- **Une seule classe par fichier source** : Chaque fichier `.js` définit une unique classe.
- **Tout élément animé est un `Vehicle`** : Héritage direct ou indirect de `Vehicle.js`. Les entités se déplacent exclusivement via les steering behaviors.
- **Les éléments fixes sont des `Vehicle`** : Les obstacles dérivent de `Vehicle` (`class Obstacle extends Vehicle`), avec `maxSpeed = 0` par défaut.
- **Spécialisation par sous-classes** : Toute entité interactive ou décorative (`Player`, `Enemy`, `Missile`, `AnimatedScore`, `Spaceship`, etc.) doit sous-classer `Vehicle`.

## 2. Standards de Code p5.js
- Ne jamais instancier d'éléments DOM dans la boucle `draw()`.
- Optimiser la gestion de la mémoire à 60 FPS : éviter les allocations intempestives de vecteurs ou d'objets temporaires dans `draw()`.
- Rendre les transformations géométriques hermétiques avec `push()` et `pop()`.
- Calculer les seuils de distance avec la distance au carré (`distSq`).

## 3. Documents de Référence
- Spécifications complètes : [ARCHITECTURE.md](file:///c:/Users/jaimi/Documents/skl/5th%20year/double%20diplo/GAMES/Steering-Behavior-Mouna-MARRAKECH/ARCHITECTURE.md)
- Bonnes pratiques p5.js : [docs/P5_BEST_PRACTICES.md](file:///c:/Users/jaimi/Documents/skl/5th%20year/double%20diplo/GAMES/Steering-Behavior-Mouna-MARRAKECH/docs/P5_BEST_PRACTICES.md)
- Suivi de projet et transmission : [HANDOFF.md](file:///c:/Users/jaimi/Documents/skl/5th%20year/double%20diplo/GAMES/Steering-Behavior-Mouna-MARRAKECH/HANDOFF.md)
- Actualisation du README : `node scripts/update-readme.js`
