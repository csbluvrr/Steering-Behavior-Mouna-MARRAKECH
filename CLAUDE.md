# Directives d'Assistance Claude - Steering Behaviors p5.js

Ce projet est un environnement pédagogique et applicatif dédié aux **Steering Behaviors de Craig Reynolds** implémentés avec **p5.js**.

## Règles Architecturales Strictes (À Respecter Absolument)
1. **Une seule classe par fichier** : Tout fichier `.js` ne doit contenir qu'une seule classe (sauf mini-classe d'assistance purement locale).
2. **Tout élément graphique animé est un `Vehicle`** :
   - Tout objet mobile doit être une instance de `Vehicle` (ou d'une sous-classe de `Vehicle`).
   - Tout déplacement utilise obligatoirement les steering behaviors (formule de Reynolds : force = vitesse désirée - vitesse actuelle).
3. **Même les obstacles fixes sont des `Vehicle`** :
   - Les éléments statiques dérivent de `Vehicle` (ex. `Obstacle extends Vehicle`), avec `maxSpeed = 0` par défaut, ce qui permet de les rendre dynamiques à tout moment et homogénéise les interfaces physiques (`pos`, `r`, etc.).
4. **Spécialisation par sous-classes** :
   - Joueur (`Player`), Ennemi (`Enemy`), Missile (`Missile`), Score animé (`AnimatedScore`), Vaisseau (`Spaceship`), etc. doivent tous hériter de `Vehicle`.
5. **Respect des bonnes pratiques p5.js** :
   - Ne jamais instancier d'éléments DOM dans `draw()`.
   - Éviter d'allouer de nouveaux objets ou vecteurs à 60 FPS dans `draw()` pour préserver le ramasse-miettes.
   - Utiliser `push()` et `pop()` pour encapsuler les transformations graphiques.
   - Utiliser des distances au carré (`distSq`) pour les tests de proximité intensifs.
   - Ordonner rigoureusement les balises `<script>` dans `index.html` (classes de base avant sous-classes).

## Documents de Référence
- [ARCHITECTURE.md](file:///c:/Users/jaimi/Documents/skl/5th%20year/double%20diplo/GAMES/Steering-Behavior-Mouna-MARRAKECH/ARCHITECTURE.md) : Spécification complète et formules mathématiques des comportements de Craig Reynolds.
- [docs/P5_BEST_PRACTICES.md](file:///c:/Users/jaimi/Documents/skl/5th%20year/double%20diplo/GAMES/Steering-Behavior-Mouna-MARRAKECH/docs/P5_BEST_PRACTICES.md) : Bonnes pratiques et optimisations de performance p5.js.
- [HANDOFF.md](file:///c:/Users/jaimi/Documents/skl/5th%20year/double%20diplo/GAMES/Steering-Behavior-Mouna-MARRAKECH/HANDOFF.md) : Journal de transfert et état du projet.
- [README.md](file:///c:/Users/jaimi/Documents/skl/5th%20year/double%20diplo/GAMES/Steering-Behavior-Mouna-MARRAKECH/README.md) : Index dynamique des exercices et applications.

## Commandes Utiles
- Mettre à jour l'index du README : `node scripts/update-readme.js`
- Lancer un serveur local pour tester les sketches : `npx serve .` ou ouvrir `index.html` avec Live Server.
