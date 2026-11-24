# Bonnes Pratiques de Développement p5.js

Ce document synthétise les standards officiels de développement, de style et d'optimisation de performance pour la bibliothèque **p5.js** (JavaScript ES6+), particulièrement adaptés aux simulations physiques, systèmes multi-agents et Steering Behaviors.

---

## 1. Cycle de Vie et Architecture des Scripts

### A. Rôle strict de `setup()` et `draw()`
* **`setup()` (Initialisation)** :
  * Création du canvas (`createCanvas(w, h)`).
  * Configuration globale unique des styles statiques par défaut (`angleMode(RADIANS)`, `imageMode(CENTER)`).
  * Allocation et pré-dimensionnement des collections d'objets (véhicules, obstacles, buffers graphiques).
  * Instanciation des éléments d'interface utilisateur (DOM : sliders, boutons, labels) — **ne jamais instancier d'éléments DOM dans `draw()`**.
* **`draw()` (Boucle d'animation à 60 FPS)** :
  * Doit agir uniquement comme un **chef d'orchestre** (ticker).
  * Effacement ou rafraîchissement d'arrière-plan (`background(...)`).
  * Appel aux étapes de mise à jour physique (`applyBehaviors()`, `update()`).
  * Appel aux méthodes de rendu (`show()`, `render()`).
  * **Ne doit contenir aucune logique métier lourde ni allocation d'objets temporaires.**

### B. Découpage Modulaire et Inclusions HTML
* Chaque classe métier réside dans son propre fichier `.js` (ex. `vehicle.js`, `obstacle.js`, `target.js`).
* L'ordre des scripts dans `index.html` doit impérativement respecter la hiérarchie d'héritage :
  1. Bibliothèques p5 (`p5.min.js`, etc.)
  2. Classe de base (`vehicle.js`)
  3. Sous-classes dérivées (`obstacle.js`, `target.js`, `enemy.js`, `player.js`)
  4. Script principal d'orchestration (`sketch.js`)

---

## 2. Optimisation des Performances Graphiques (Canvas HTML5)

### A. Réduction des Changements d'État du Contexte Canvas
Les changements d'état du canvas (`fill()`, `stroke()`, `strokeWeight()`, `blendMode()`) sont parmi les opérations les plus coûteuses en GPU/CPU.
* **Batching de dessin** : Grouper les dessins partageant les mêmes styles. Si 200 véhicules partagent la même couleur, fixer `fill()` et `stroke()` **avant** la boucle d'itération plutôt qu'à chaque véhicule.
* **Désactivation globale** : Si un sketch ou une classe n'utilise pas de contour, appeler `noStroke()` une seule fois dans `setup()` ou au début du batch.
* **Encapsulation `push()` / `pop()`** : Isoler strictement les transformations géométriques locales (`translate`, `rotate`, `scale`) afin d'éviter les dérives de matrice de transformation.

### B. Buffers Hors-Écran (`createGraphics`)
* Pour les arrière-plans statiques complexes, les grilles, ou les traces permanentes, dessiner sur un buffer dédié :
  ```javascript
  let bgBuffer;
  function setup() {
    createCanvas(800, 600);
    bgBuffer = createGraphics(800, 600);
    // Dessin statique lourd exécuté une seule fois
    bgBuffer.background(20);
    bgBuffer.stroke(40);
    for (let x = 0; x < width; x += 40) bgBuffer.line(x, 0, x, height);
  }
  function draw() {
    image(bgBuffer, 0, 0); // Très rapide
    // Rendu des véhicules par-dessus
  }
  ```

---

## 3. Gestion de la Mémoire et du Garbage Collector (GC)

Dans une boucle à 60 FPS, allouer des dizaines ou centaines d'objets par frame provoque des interruptions périodiques brutales dues au ramasse-miettes (Garbage Collector stuttering).

### A. Éviter la Création Fréquente de Vecteurs Temporaires
* Privilégier les opérations **in-place** ou réutiliser des vecteurs de travail internes plutôt que de chaîner des allocations statiques `p5.Vector.sub()`, `p5.Vector.add()`, `.copy()` :
  ```javascript
  // ❌ Inefficace dans une boucle de 500 agents à 60 FPS (génère 500 nouveaux vecteurs/frame) :
  let desired = p5.Vector.sub(target, this.pos);

  // ✅ Optimisé : Réutilisation de vecteurs membres ou modification contrôlée
  this.desiredSpeed.set(target).sub(this.pos);
  ```

### B. Proscription de `Array.splice()` dans les Boucles Actives
* Appeler `array.splice(i, 1)` décale l'ensemble du tableau en mémoire.
* **Bonne pratique** : Utiliser un drapeau de vie (`isDead = true`), recycler les objets via un **Object Pool**, ou filtrer en fin de frame :
  ```javascript
  // Nettoyage en un seul passage rapide en fin de frame
  vehicles = vehicles.filter(v => !v.isDead);
  ```

---

## 4. Raccourcis Mathématiques et Géométriques

### A. Comparaison de Distances au Carré (`distSq`)
* Le calcul de la racine carrée (`Math.sqrt` ou `dist()`) est lourd. Pour comparer une distance à un seuil (rayon de détection, collision), comparer les **carrés des distances** :
  ```javascript
  // ❌ Lent
  if (dist(x1, y1, x2, y2) < radius) { ... }

  // ✅ Rapide
  let dx = x2 - x1;
  let dy = y2 - y1;
  let distSq = dx * dx + dy * dy;
  if (distSq < radius * radius) { ... }
  ```

### B. Fonctions Trigonométriques Négociées
* Pour les calculs angulaires purs, `Math.cos()` et `Math.sin()` évitent les surcouches de vérification d'unité d'angle de p5.js.

---

## 5. Partitionnement Spatial pour les Systèmes Multi-Agents ($O(n^2) \rightarrow O(n)$)
* Dès que le nombre de véhicules dépasse ~150-200 pour des comportements collectifs (séparation, cohésion, évitement d'obstacles mutuel), la comparaison double boucle naïve $O(n^2)$ s'effondre.
* **Recommandation** : Implémenter une grille spatiale uniforme (Spatial Hash Grid) ou un Quadtree afin de restreindre les tests de voisinage aux cellules adjacentes.

---

## 6. Checklist de Qualité de Code pour chaque Sketch p5.js
- [ ] Une seule classe par fichier source.
- [ ] Tout élément animé hérite directement ou indirectement de `Vehicle`.
- [ ] Aucun `new` superflu ni instanciation DOM dans la méthode `draw()`.
- [ ] Utilisation de `push()` et `pop()` dans la méthode `show()` du véhicule.
- [ ] Mode debug basculable via une touche clavier (ex. touche `d` pour afficher les rayons, forces, vecteurs vitesse).
- [ ] Responsive canvas (`windowResized()`) si l'application est en plein écran.
