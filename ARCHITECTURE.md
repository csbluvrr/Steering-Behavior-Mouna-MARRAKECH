# ARCHITECTURE TECHNIQUE & GUIDE DE CONCEPTION

Ce document établit les règles architecturales impératives, les standards de conception orientée objet et la spécification formelle des **Steering Behaviors** de Craig Reynolds pour l'ensemble des projets et sketches du dépôt.

---

## 1. Principes Fondamentaux et Règles d'Or

### Règle 1 : Unicité de Classe par Fichier
* **Une seule classe par fichier `.js`** (à l'exception exclusive de mini-classes d'assistance purement internes non exportées).
* Le nom du fichier doit refléter fidèlement le nom de la classe en minuscules ou kebab-case (ex. `Vehicle` dans `vehicle.js`, `Obstacle` dans `obstacle.js`, `Player` dans `player.js`, `Missile` dans `missile.js`).
* Déclarer les scripts dans `index.html` dans l'ordre strict de la dépendance (classe parente avant classe enfant).

### Règle 2 : Le Modèle Universel `Vehicle`
* **Tout élément graphique animé à l'écran doit être un `Vehicle`** (instance directe de `Vehicle` ou sous-classe spécialisée).
* Aucun objet mobile ne doit être codé en dehors de ce modèle : il dispose d'un vecteur position (`pos`), vitesse (`vel`), accélération (`acc`), d'une vitesse maximale (`maxSpeed`) et d'une force maximale (`maxForce`).
* Les mouvements sont **exclusivement pilotés par des forces de direction (steering forces)**, jamais par téléportation ou incrémentation directe de position.

### Règle 3 : Éléments Fixes et Obstacles comme `Vehicle`
* Même les éléments fixes ou statiques (obstacles, balises, rochers, repères) susceptibles d'interagir avec la simulation ou de devenir mobiles ultérieurement **sont également des `Vehicle`** (ex. `class Obstacle extends Vehicle`).
* Pour les rendre immobiles :
  * On définit `this.maxSpeed = 0;` ou une masse infinie, ou on omet l'appel à `update()`.
  * Avantage architectural : uniformité des interfaces (tous possèdent `pos`, `r`, `show()`, et peuvent participer aux calculs de détection ou devenir mobiles à tout instant).

### Règle 4 : Spécialisation par Sous-Classement
* Tout type d'entité spécifique (joueur, missile, ennemi, vaisseau spatial, particule d'effet, texte/score flottant animé) **doit obligatoirement dériver de `Vehicle`** :
  * `class Player extends Vehicle { ... }`
  * `class Enemy extends Vehicle { ... }`
  * `class Spaceship extends Vehicle { ... }`
  * `class Missile extends Vehicle { ... }`
  * `class AnimatedScore extends Vehicle { ... }`
  * `class Obstacle extends Vehicle { ... }`
* Chaque sous-classe surcharge `show()` pour son rendu propre et `applyBehaviors()` pour sa composition de forces spécifique.

---

## 2. Le Modèle de Locomotion de Craig Reynolds (1999)

D'après l'article de référence de Craig W. Reynolds (*Steering Behaviors For Autonomous Characters*, GDC 1999), l'animation autonome se décompose en trois couches indépendantes :

```
+-----------------------------------------------------------+
|                     ACTION SELECTION                      |
| (Stratégie globale, buts : attaquer, fuir, patrouiller)   |
+-----------------------------------------------------------+
                             |
                             v
+-----------------------------------------------------------+
|                    STEERING BEHAVIORS                     |
|    (Calcul des forces géométriques : Seek, Flee, etc.)    |
+-----------------------------------------------------------+
                             |
                             v
+-----------------------------------------------------------+
|                        LOCOMOTION                         |
| (Intégration physique Euler : accélération, vitesse, pos) |
+-----------------------------------------------------------+
```

### La Formule Fondamentale du Pilotage
Pour tout comportement de pilotage, la force de guidage $\vec{F}_{\text{steering}}$ est calculée comme suit :

$$\vec{v}_{\text{desired}} = \text{calcul de la vitesse désirée idéale (orientée vers l'objectif, norme } \text{maxSpeed})$$

$$\vec{F}_{\text{steering}} = \vec{v}_{\text{desired}} - \vec{v}_{\text{current}}$$

$$\vec{F}_{\text{steering}} = \text{truncate}(\vec{F}_{\text{steering}}, \text{maxForce})$$

Puis application physique :
$$\vec{a} = \vec{a} + \frac{\vec{F}}{\text{mass}}$$
$$\vec{v} = \text{truncate}(\vec{v} + \vec{a} \cdot \Delta t, \text{maxSpeed})$$
$$\vec{p} = \vec{p} + \vec{v} \cdot \Delta t$$
$$\vec{a} = \vec{0} \quad \text{(réinitialisation de l'accélération)}$$

---

## 3. Inventaire Exhaustif des Comportements de Craig Reynolds

Chaque méthode de comportement dans la classe `Vehicle` calcule et retourne un `p5.Vector` représentant une force de pilotage bridée par `maxForce`.

| # | Comportement | Description Mathématique & Algorithmique | Usage & Rôle |
|---|---|---|---|
| **1** | **Seek** | $\vec{v}_{\text{desired}} = \text{normalize}(\vec{p}_{\text{target}} - \vec{p}) \times v_{\text{max}}$. $\vec{F} = \vec{v}_{\text{desired}} - \vec{v}$. | Attraction directe vers une position fixe ou mobile. |
| **2** | **Flee** | Inverse de Seek : $\vec{v}_{\text{desired}} = \text{normalize}(\vec{p} - \vec{p}_{\text{target}}) \times v_{\text{max}}$. | Fuite en ligne droite d'une menace ou d'un danger. |
| **3** | **Pursuit** | Prédit la position future de la cible : $T = \frac{\|\vec{p}_{\text{target}} - \vec{p}\|}{v_{\text{max}}}$, $\vec{p}_{\text{future}} = \vec{p}_{\text{target}} + \vec{v}_{\text{target}} \times T$. Applique ensuite `seek(`$\vec{p}_{\text{future}}$`)`. | Poursuite fluide d'une proie mobile en anticipant sa trajectoire. |
| **4** | **Evasion** | Même prédiction future que Pursuit, puis applique `flee(`$\vec{p}_{\text{future}}$`)`. | Esquive intelligente d'un prédateur en mouvement. |
| **5** | **Arrival** | Si la distance $d$ à la cible est inférieure à un rayon de ralentissement $r_{\text{slow}}$, $v_{\text{desired}} = \text{map}(d, 0, r_{\text{slow}}, 0, v_{\text{max}})$, sinon $v_{\text{max}}$. | Approche et arrêt doux sans dépassement ni oscillation. |
| **6** | **Wander** | Projette un cercle virtuel de rayon $r_{\text{wander}}$ à une distance $d_{\text{wander}}$ devant le véhicule. Un angle $\theta$ sur ce cercle varie légèrement chaque frame ($\pm \Delta\theta$). Le véhicule vise ce point. | Déplacement d'exploration erratique fluide et naturel. |
| **7** | **Obstacle Avoidance** | Projette un cylindre de vision ou une sonde (*feeler*) devant le véhicule. Identifie l'obstacle sécant le plus proche. Génère une force latérale d'éloignement perpendiculaire à l'axe d'approche et une force de freinage. | Évitement d'obstacles circulaires/sphériques sans blocage. |
| **8** | **Wall Following & Containment** | Projette une sonde en avant. Si elle touche ou dépasse une limite (mur, boîte, périmètre), calcule une force perpendiculaire au mur orientée vers l'intérieur. | Maintien dans une arène ou suivi de parois/couloirs. |
| **9** | **Path Following** | Projette la position future du véhicule, trouve sa projection orthogonale sur le segment de chemin le plus proche. Si l'écart dépasse le rayon du chemin, calcule une cible projetée en avant sur la ligne médiane et applique `seek()`. | Déplacement le long d'un tracé, circuit ou patrouille. |
| **10** | **Flow Field Following** | Discrétise l'espace en une grille de vecteurs unitaires (ex. bruit de Perlin). Le véhicule lit la direction de la cellule courante et l'adopte comme vitesse désirée. | Déplacement collectif dans des courants, vents, fluides ou foules. |
| **11** | **Unaligned Collision Avoidance** | Détecte le risque d'intersection future de trajectoires entre deux véhicules en mouvement dans une fenêtre temporelle $T$. Si collision imminente, applique une force d'esquive latérale d'écartement. | Prévention des chocs entre agents croisant leurs routes. |
| **12** | **Separation** | Calcule un vecteur répulsif sommé pour tous les voisins situés à une distance $d < r_{\text{sep}}$, avec une intensité inversement proportionnelle à la distance ($1/d$). | Évite l'agglutination et maintient une bulle de confort. |
| **13** | **Cohesion** | Calcule le centre de gravité (barycentre) des positions des voisins dans un rayon donné, puis applique `seek()` vers ce centre. | Maintient le regroupement d'un banc ou d'une harde. |
| **14** | **Alignment** | Calcule la vitesse moyenne des voisins dans un rayon donné. La force tend à faire coïncider la direction et la vitesse du véhicule avec ce flux moyen. | Harmonise l'orientation d'un groupe en déplacement. |
| **15** | **Flocking (Boids)** | Combinaison équilibrée des trois règles de Reynolds : $\vec{F}_{\text{total}} = w_1 \vec{F}_{\text{separation}} + w_2 \vec{F}_{\text{alignment}} + w_3 \vec{F}_{\text{cohesion}}$. | Simulation réaliste de vol d'oiseaux ou bancs de poissons. |
| **16** | **Leader Following** | Le suiveur applique `arrival()` sur un point situé à l'arrière du leader ($\vec{p}_{\text{leader}} - \text{normalize}(\vec{v}_{\text{leader}}) \times d$). S'il se trouve sur la trajectoire avant du leader, il applique une force de dégagement latérale. | Déplacement en file indienne ou escorte. |
| **17** | **Queuing** | À l'approche d'un goulet d'étranglement ou d'une porte, si un véhicule détecte un autre véhicule devant lui dans son cône de vision, il freine proportionnellement à la proximité. | Évite les télescopages dans les passages étroits. |
| **18** | **Offset Pursuit** | Poursuit une cible en maintenant un décalage géométrique fixe exprimé dans le repère local de la cible. | Formations tactiques en escadrille (ailiers V-shape). |

---

## 4. Combinaison des Comportements (Arbitration & Blending)

Deux approches normalisées doivent être supportées dans `applyBehaviors()` :

### Approche A : Somme Pondérée (Weighted Blending)
```javascript
let seekForce = this.seek(target).mult(1.0);
let separateForce = this.separate(vehicles).mult(1.5);
let avoidForce = this.avoidObstacles(obstacles).mult(2.5);

this.applyForce(seekForce);
this.applyForce(separateForce);
this.applyForce(avoidForce);
```

### Approche B : Priorité avec Budget de Force (Prioritized Truncation)
Pour éviter qu'une force mineure (ex. errance) n'annule un évitement vital d'obstacle, on alloue le budget de `maxForce` par ordre de criticité :
1. Évitement d'obstacle / Collision urgente
2. Séparation
3. Objectif principal (Seek / Path Following)
4. Errance (Wander)

---

## 5. Patron de Conception des Sous-Classes (Exemple d'Application)

```javascript
// missile.js
class Missile extends Vehicle {
  constructor(x, y, target) {
    super(x, y);
    this.target = target;
    this.maxSpeed = 10;
    this.maxForce = 0.8;
    this.r = 6;
    this.life = 180; // durée de vie en frames
  }

  applyBehaviors() {
    if (this.target) {
      let pursuitForce = this.pursue(this.target);
      this.applyForce(pursuitForce);
    }
  }

  update() {
    super.update();
    this.life--;
    if (this.life <= 0) {
      this.isDead = true;
    }
  }

  show() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading());
    fill(255, 100, 0);
    noStroke();
    rect(-this.r, -2, this.r * 2, 4);
    pop();
  }
}
```

```javascript
// obstacle.js
class Obstacle extends Vehicle {
  constructor(x, y, r = 40) {
    super(x, y);
    this.r = r;
    this.maxSpeed = 0; // Fixe par défaut
    this.maxForce = 0;
    this.color = color(120, 120, 120);
  }

  show() {
    push();
    fill(this.color);
    stroke(200);
    strokeWeight(2);
    circle(this.pos.x, this.pos.y, this.r * 2);
    pop();
  }
}
```

---

## 6. Structure Recommandée d'un Projet / Module de Démonstration

```
X-NomDuProjet/
├── index.html        # Déclare les scripts dans l'ordre hiérarchique
├── style.css         # Reset CSS, canvas en plein écran ou centré
├── vehicle.js        # Classe de base Vehicle (physique + comportements Reynolds)
├── obstacle.js       # Sous-classe spécialisée pour les obstacles (même fixes)
├── target.js         # Sous-classe spécialisée pour la cible (mobile/interactive)
├── sketch.js         # Orchestration (setup, draw, listeners)
└── libraries/
    ├── p5.min.js
    └── p5.sound.min.js
```
