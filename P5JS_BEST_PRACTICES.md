# Bonnes pratiques de codage et d'optimisation p5.js

> Synthèse issue de la documentation officielle p5.js (*How to Optimize Your Sketches* — Greg Benedis-Grab & Dave Pagurek, et le wiki officiel *Optimizing p5.js Code for Performance*).
> Sources :
> - <https://p5js.org/tutorials/how-to-optimize-your-sketches/>
> - <https://github.com/processing/p5.js/wiki/Optimizing-p5.js-Code-for-Performance>

---

## 1. Organisation et structure du code

- **Une classe maximum par fichier** (voir [ARCHITECTURE.md](./ARCHITECTURE.md)). Par exemple : `vehicle.js` pour `Vehicle`, `target.js` pour `Target`, `obstacle.js` pour `Obstacle`.
- **Ordre de chargement dans `index.html`** : charger `p5.min.js` (et addons), puis les classes de base (`vehicle.js`), puis les sous-classes spécialisées, et enfin `sketch.js`.
- **Séparation des responsabilités dans le cycle de vie p5.js** :
  - `preload()` : chargement des images, polices, sons et données JSON avant le démarrage.
  - `setup()` : initialisation du canvas, création des instances, pré-calculs lourds, mise en cache des références DOM (`select()`).
  - `draw()` : boucle de rendu/simulation à 60 FPS — doit rester la plus légère et lisible possible.
- **Isolation de l'état graphique** : toujours encadrer les transformations (`translate`, `rotate`, `scale`) et styles locaux (`fill`, `stroke`, `strokeWeight`) par `push()` et `pop()` dans chaque méthode `show()`.
- **Fonctions nommées** : éviter les fonctions anonymes dans les chemins critiques afin de faciliter la lecture des profils CPU dans Chrome DevTools.

---

## 2. Performance et optimisation de la boucle `draw()`

### 2.1 « Optimize the algorithm, not the code »
- Avant de micro-optimiser, identifier la complexité algorithmique (ex. : détection de collisions ou voisinage $O(n^2)$ sur 1 000 agents = 1 000 000 de paires).
- Si le nombre d'entités augmente fortement (flocking, particules, évitement), utiliser un **partitionnement spatial** (grille uniforme ou Quadtree) pour ne tester que les voisins proches.

### 2.2 Gestion mémoire et `p5.Vector`
- **Éviter les allocations répétées dans `draw()`** : `p5.Vector.copy()`, `createVector()` et `p5.Vector.sub()` appelés dans des boucles internes créent de nouveaux objets à chaque frame et sollicitent le *garbage collector*.
- Dans les boucles critiques ($O(n^2)$), privilégier les calculs sur composantes ou les méthodes qui réutilisent des vecteurs, et utiliser **la distance au carré** (`magSq()` ou `dx * dx + dy * dy < r * r`) plutôt que `dist()` ou `mag()` (évite `Math.sqrt()`).

### 2.3 Désactiver le Friendly Error System (FES) en développement
- Si l'on utilise `p5.js` non minifié (utile pour avoir les noms de fonctions dans le profiler), le FES vérifie les types d'arguments à chaque appel, ce qui peut ralentir le sketch jusqu'à ~10x.
- Ajouter en haut de `sketch.js` lorsque le sketch est stable ou critique en performances :
  ```js
  p5.disableFriendlyErrors = true;
  ```
- En production ou pour des démos fluides, préférer `libraries/p5.min.js`.

### 2.4 Utiliser JavaScript natif dans les goulots d'étranglement
- Les wrappers p5 (`random()`, `min()`, `max()`, `sin()`, `cos()`) vérifient les surcharges ou le mode degrés/radians à chaque appel.
- Dans les boucles très fréquentes, préférer `Math.random()`, `Math.min()`, `Math.max()`, `Math.sin()`, `Math.cos()`.

### 2.5 Pré-calculer et mettre en cache (Frontloading)
- Effectuer le traitement d'images, le découpage de sprites, l'extraction de couleurs (`p5.Color`) et la génération de textures statiques dans `setup()` (ou sur un `createGraphics()` hors écran), jamais à chaque frame dans `draw()`.
- Redimensionner les images avant exécution (ou via `img.resize()` une seule fois) pour éviter de parcourir des millions de pixels inutilement.

### 2.6 Manipulation du DOM
- **Mettre en cache les sélecteurs DOM** : appeler `select('#id')` dans `setup()`, jamais dans `draw()`.
- **Limiter les reflows** : regrouper les mises à jour DOM (sliders, compteurs texte, HUD) et éviter de modifier le DOM à 60 Hz si la valeur n'a pas changé.

---

## 3. Mesure, profilage et débogage

1. **Afficher ou mesurer les FPS** :
   ```js
   let fps = frameRate();
   ```
   Viser un framerate stable entre **30 et 60 FPS**.
2. **Profilage manuel avec `millis()`** :
   Mesurer un bloc suspect avant/après modification (moyenne sur plusieurs frames), puis **supprimer les `console.log()` / `print()`** dans la version finale (ils ralentissent fortement l'exécution).
3. **Profilage automatisé (Chrome DevTools)** :
   - Onglet **Performance** (Ctrl+E / Cmd+E) → vue *Bottom-Up* et *Flame Chart* pour repérer les fonctions les plus coûteuses.
   - Option **Show FPS meter** dans DevTools pour suivre la stabilité temporelle.
4. **Mode Debug visuel dédié** :
   - Utiliser un drapeau statique (ex. `Vehicle.debug = false`) activable au clavier ou via UI pour afficher les vecteurs de vitesse, forces, rayons de freinage et zones de détection sans polluer le rendu normal.
