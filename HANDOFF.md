# HANDOFF.md - Protocole de Transmission Inter-IA

> Ce document sert de point de passage de relais technique entre assistants IA (Claude, Gemini, OpenAI Codex, GitHub Copilot, Cursor, Windsurf, etc.) ou entre sessions de travail.
> **Toute IA reprenant ce projet DOIT lire ce fichier, ainsi que [ARCHITECTURE.md](ARCHITECTURE.md), avant d'écrire ou de modifier la moindre ligne de code.**

---

## 1. Contexte du Projet

- **Projet** : Suite d'applications interactives p5.js démontrant les **Steering Behaviors** d'agents autonomes.
- **Référence Théorique** : Craig W. Reynolds, *Steering Behaviors For Autonomous Characters* (GDC 1999).
  - Emplacement de l'article : `article craig reynolds/Steering Behaviors For Autonomous Characters.pdf`.
- **Niveau / Cadre** : 5e année / Master IA & Jeu Vidéo.

---

## 2. Invariants Architecturaux Inviolables (Règles d'Or)

| Règle | Spécification Impérative |
|---|---|
| **1 Classe / Fichier** | Chaque fichier `.js` doit héberger une seule et unique classe (ex: `Vehicle` dans `vehicle.js`, `Obstacle` dans `obstacle.js`). Ne jamais empiler plusieurs classes dans le même fichier. |
| **Entité Universelle : `Vehicle`** | Tout élément visuel mobile **doit** être une instance ou une sous-classe de `Vehicle`. Le mouvement est obligatoirement piloté par des steering forces ($\vec{F} = \vec{v}_{\text{desired}} - \vec{v}$). |
| **Obstacles Fixes = `Vehicle`** | Les obstacles statiques (rochers, murs, cibles fixes) sont aussi des sous-classes de `Vehicle` (ex: `Obstacle extends Vehicle`) avec `maxSpeed = 0` par défaut. |
| **Objets Spécialisés** | Joueur (`Player`), Ennemis (`Enemy`), Vaisseaux (`Spaceship`), Missiles (`Missile`), Scores flottants (`AnimatedScore`) dérivent tous obligatoirement de `Vehicle`. |
| **Performance p5.js** | Ne jamais instancier d'éléments DOM dans `draw()`. Éviter la création de nouveaux objets `p5.Vector` à chaque frame dans `draw()`. Utiliser `distSq` pour les seuils de proximité. |

---

## 3. Cartographie des Dossiers et État Actuel

1. **`1-Seek/`** :
   - Implémente `seek(target)` et `flee(target)`.
   - Classes : `Vehicle`, `Target extends Vehicle`.
2. **`2-PursueEvade/` & `2-PursueEvade_correction/`** :
   - Implémente la prédiction de position future pour la poursuite (`pursue`) et l'évasion (`evade`).
   - Classes : `Vehicle`, `Target extends Vehicle`, `BouncingBall extends Vehicle`.
3. **`3-Arrival/` & `3-Arrival_correction/`** :
   - Implémente `arrive(target, slowingRadius)` avec décélération douce.
   - Variantes avancées en correction : `Snake extends Vehicle`, `SnakeWander extends Vehicle`.
4. **`4-Wander/`** :
   - Implémente l'errance autonome (`wander`) avec projection de cercle virtuel devant le véhicule, perturbation angulaire $\theta \pm \Delta\theta$, et mode debug visuel.
   - Classe : `Vehicle`.
5. **Dossiers d'infrastructure** :
   - `docs/P5_BEST_PRACTICES.md` : Standards de performance et de style p5.js.
   - `scripts/update-readme.js` : Script de scan et mise à jour automatique du `README.md`.
   - `.github/copilot-instructions.md` & `CLAUDE.md` / `GEMINI.md` / `CODEX.md` / `AGENTS.md` : Consignes pour chaque assistant.

---

## 4. Prochains Comportements & Modules à Implémenter (Roadmap Reynolds)

Lors de la création de nouveaux modules ou exercices, suivre la numérotation séquentielle et créer un dossier propre par comportement :

- [ ] **`5-ObstacleAvoidance/`** : Évitement d'obstacles circulaires/sphériques (`Obstacle extends Vehicle`) par sondes frontales (*feelers*), force latérale et freinage.
- [ ] **`6-WallFollowing-Containment/`** : Maintien dans une zone fermée ou suivi de murs par détection normale.
- [ ] **`7-PathFollowing/`** : Suivi d'un chemin (segments / polyline) avec projection orthogonale et point d'anticipation.
- [ ] **`8-FlowField/`** : Navigation par champ de vecteurs (grille de bruit de Perlin).
- [ ] **`9-Flocking/`** : Simulation de banc/boids combinant Séparation, Cohésion et Alignement.
- [ ] **`10-LeaderFollowing-Queuing/`** : Suivi d'un leader avec formation en file et gestion des étranglements.

---

## 5. Checklist pour l'Assistant IA Entrant

Avant de répondre à l'utilisateur ou d'ajouter du code :
- [ ] Vérifier que toute nouvelle classe a son propre fichier `.js`.
- [ ] Vérifier que tout objet graphique hérite de `Vehicle`.
- [ ] Mettre à jour les balises `<script>` dans le `index.html` concerné.
- [ ] Lancer `node scripts/update-readme.js` après avoir ajouté ou modifié un module pour garder le `README.md` à jour.
- [ ] Noter la tâche accomplie dans la section *Journal des modifications* ci-dessous.

---

## 6. Journal des Modifications (Changelog de Session)

### Session 23 Novembre 2026
- **Architecture** : Création de [ARCHITECTURE.md](ARCHITECTURE.md) synthétisant les règles d'or (classe unique, Vehicle universel, obstacles comme Vehicle, spécialisation) et inventaire complet des 18 comportements de Craig Reynolds.
- **Bonnes Pratiques p5.js** : Rédaction et structuration de [docs/P5_BEST_PRACTICES.md](docs/P5_BEST_PRACTICES.md) (performance canvas, GC, batching, math).
- **Directives IA** : Création des fichiers standards [CLAUDE.md](CLAUDE.md), [GEMINI.md](GEMINI.md), [CODEX.md](CODEX.md), [.github/copilot-instructions.md](.github/copilot-instructions.md), [COPILOT.md](COPILOT.md) et [AGENTS.md](AGENTS.md).
- **Automatisation README** : Création de [scripts/update-readme.js](scripts/update-readme.js), configuration du hook `.git/hooks/pre-commit`, création de [package.json](package.json), et génération dynamique de la table dans [README.md](README.md).
- **Module 1-Seek** :
  - Implémentation de la fonction `creerVehicules(nb)` pour instancier une flottille de véhicules suiveurs avec positions aléatoires.
  - Activation de la méthode `edges()` dans la boucle `draw()` pour assurer le wrapping torique des véhicules aux bords de l'écran.
  - **Cibles autonomes Scorbunnies (`Target extends Vehicle`)** :
    - Direction et vitesse aléatoires entre -7 et +7.
    - Rayon aléatoire entre 10 et 100 px.
    - Rebond physique sur les bords de l'écran (`bounceEdges`).
    - Curseur pour régler le nombre de cibles en direct (entre 0 et 20).
  - **Détection & Chasse par les Gengars (`Vehicle`)** :
    - Cercle de détection propre à chaque Gengar, rayon par défaut de 150 px (curseur entre 20 et 200 px), affiché en mode debug.
    - Lorsqu'une cible est détectée dans le cercle, le Gengar applique `seek` sur la cible la plus proche.
    - Si le Gengar touche la cible (distance < 5 px), la cible disparaît et réapparaît à une position aléatoire (`respawn()`).
  - **Comportement de Fuite d'Urgence des Cibles (`flee`)** :
    - Cercle de détection de danger propre à Scorbunny (rayon par défaut 100 px, réglable par curseur, affiché en debug).
    - Dès qu'un Gengar entre dans ce cercle, Scorbunny fuit (`flee`) en augmentant temporairement sa vitesse max (12) et son accélération (2.5x).
    - La fuite active est maintenue jusqu'à ce que la distance au Gengar dépasse 300 px (distance de sécurité réglable par curseur).
  - **Effet d'Explosion, Onomatopée Comic & Son Pop (`Particle`, `ComicBoom extends Vehicle`)** :
    - Classe [1-Seek/particle.js](file:///c:/Users/jaimi/Documents/skl/5th%20year/double%20diplo/GAMES/Steering-Behavior-Mouna-MARRAKECH/1-Seek/particle.js) : 35 particules incandescentes projetées en éventail.
    - Classe [1-Seek/comicBoom.js](file:///c:/Users/jaimi/Documents/skl/5th%20year/double%20diplo/GAMES/Steering-Behavior-Mouna-MARRAKECH/1-Seek/comicBoom.js) : Onomatopée cartoon style comic book ("BOOM !", "POP !", "POW !", "KAPOW !") avec étoile crénelée, rebond élastique (pop-in) et dérive ascendante.
    - Synthétiseur audio Web Audio API : Génération instantanée d'un son mignon de bulle/pop lors de chaque capture/explosion, sans dépendance de fichier externe.
    - Le Scorbunny touché disparaît et réapparaît instantanément à une position aléatoire avec une nouvelle vitesse (`respawn()`).
  - Interface complète avec deux rangées de curseurs (Gengars & Scorbunnies), case à cocher debug avec touche <kbd>D</kbd>, et fond d'écran `seekbackground.jpg`.
- **Module 2-PursueEvade** :
  - Implémentation du jeu complet du chat et de la souris avec **Gengar (Seeker/Pursuer)** et **Scorbunny (Evader/Target)**.
  - **Machine à états de sprites dynamiques (`ressources 2/`)** :
    - Mode Normal (hors de portée) : `gengar normal.png` et `scorbunny normal.png`.
    - Mode Chasse (dans le champ de vision) : `gengar seeking.png` pour Gengar.
    - Mode Alerte/Évasion (dans le champ de vision) : `scorbunny evading.png` pour Scorbunny.
  - **Optimisation des performances et résilience** :
    - Compression et redimensionnement web des images de `ressources 2/` (de 22 Mo à ~1 Mo au total, textures passées de 3072x3072 à 512x512) éliminant tout blocage au chargement.
    - Ajout de fallbacks d'erreur asynchrones dans `preload()` et replis vectoriels graphiques soignés dans `Vehicle` et `Target` si un sprite met du temps à se charger.
    - Vérification du serveur HTTP local sur le port 8000 pour un rendu immédiat et sans erreur CORS.
  - **Comportements de pilotage de Reynolds** :
    - `pursue(target, predictionFrames)` : vise le point futur anticipé $\vec{p} + \vec{v} \times T$.
    - `evade(threat, predictionFrames)` : fuit le point futur anticipé en inversant la vitesse désirée (et non simplement la force).
  - **Gestion des bords asymétrique** : Scorbunny réapparaît du côté opposé (`edges()`), tandis que Gengar reste confiné dans l'arène (`bounceEdges()`).
  - **Multi-Agents & Gestion de Flottes** :
    - **Contrôle du nombre d'entités** : Curseurs dynamiques pour régler le nombre de Gengars (1 à 10) et de Scorbunnies (1 à 20).
    - **Vitesses découplées** : Sliders dédiés pour la **vitesse normale** (croisière passive) et la **vitesse d'accélération** (poursuite active pour Gengar, évasion pour Scorbunny).
    - **Déplacement passif fluide** : Gengar et Scorbunny patrouillent en permanence sur le canvas sans temps d'arrêt.
    - **Sprites agrandis** : Dimensions accrues ($r=65$ pour Gengar, $r=55$ pour Scorbunny) pour une lisibilité et un impact visuel maximum.
    - **Destruction permanente & Game Over** : Chaque Scorbunny capturé par un Gengar explose et est définitivement détruit de la manche. Lorsque **tous les Scorbunnies sont détruits** (`scorbunnies.length === 0`), l'écran de **Game Over** apparaît avec le score total, un compte à rebours de 4 secondes ou une relance instantanée via la touche <kbd>ESPACE</kbd> / clic. L'IHM affiche le compteur en direct : `🐰 Scorbunnies : X / Total | 💥 Détruits : Y`.
  - **Décors & Ambiance Vaisseaux Spatiaux** :
    - Image d'arrière-plan animée `background.gif` intégrée (lecture en boucle continue sous le canvas et dans le style CSS).
    - **Traînées de réacteurs (`TrailParticle extends Vehicle`)** : Émission de particules de plasma fluide à l'arrière des vaisseaux (traînée spectrale violette pour Gengar, traînée solaire jaune électrique pour Scorbunny, avec surcroît de poussée lors des phases de poursuite/fuite).
  - **Système Audio Synthétique Chiptune & FX (`GameAudio`)** :
    - **Musique de fond rétro-synthétique (BGM)** générée procéduralement en temps réel via Web Audio API (boucle chiptune en Ré mineur avec basse triangulaire, arpèges cosmiques carrés et percussions rétro), avec bouton marche/arrêt et curseur de volume dédié.
    - **Son de panique cartoon** : Double pépiement aigu affolé déclenché instantanément dès que Scorbunny détecte Gengar dans son champ de vision.
    - **Son d'explosion comics multicouche** : Impact sub-bass percutant + blast de bruit filtré + pop cartoon lors de la capture.
  - **Effets Spéciaux & Juice Comics** :
    - Écran de secousse dynamique (*Screen Shake*) à l'impact.
    - Étoile d'explosion comics enrichie ([comicBoom.js](2-PursueEvade/comicBoom.js)) avec double dentelure colorée, rayons d'impact comiques et rebond pop-in.
  - **Menu Burger Ergonomique & Badge Persistant** : L'interface des curseurs est désormais escamotable via un bouton burger stylisé (`☰ Paramètres` / `✕ Fermer`). Un badge d'état compact (`🐰 Scorbunnies : X / Total | 💥 Détruits : Y | 🔊 BGM`) reste visible en permanence sans obstruer l'espace de jeu. Le panneau déroulant regroupe 4 sections distinctes (Gengar, Scorbunny, Reynolds, Audio).
- **Module 3-Arrival** :
  - **Jeu Snake Pokémon : Onix vs Scorbunnies** :
    - Onix est composé d'une tête (`SnakeHead extends Vehicle`), d'anneaux (`SnakeSegment extends Vehicle`) et d'une queue effilée (`isTail`), orchestrés par la classe [3-Arrival/snake.js](3-Arrival/snake.js) (`Snake extends Vehicle`).
    - **Comportement Arrival & Contrôles Hybrides** :
      - Mode Flèches / ZQSD (<kbd>↑</kbd> <kbd>↓</kbd> <kbd>←</kbd> <kbd>→</kbd>) : Déplacement directionnel continu avec intégration Euler de Reynolds ($\vec{v}_{\text{desired}} = \vec{d} \times v_{\text{max}}$). La marche arrière instantanée à 180° est bridée.
      - Mode Souris : La tête applique la force d'arrivée douce sur la position du curseur avec rayon de décélération (`slowingRadius`).
      - Bouton de bascule `🕹️ Mode : Clavier (Flèches)` / `🖱️ Mode : Souris` accessible dans le menu burger.
    - **Anneaux Soudés & Cohésion Corporelle** :
      - Remplacement du suivi élastique flottant par une contrainte de distance cinématique rigide (`spacing = 22px`).
      - Les segments restent parfaitement collés et imbriqués sans se distendre lors des accélérations ou des virages serrés.
    - **Règles Classiques du Snake** :
      - **Collision avec les Murs** : Franchir les limites de l'écran provoque un crash fatal (`checkWallCollision()`) avec son de choc rocheux (`playCrashSound()`) et Game Over.
      - **Auto-Collision** : Toucher son propre corps rocheux (à partir du 4ème anneau) est mortel (`checkSelfCollision()`).
      - **Bordure visuelle de danger** : Cadre néon rouge d'avertissement autour de l'arène.
    - **Protection & Évitement des Coins pour Scorbunny** :
      - **Interdiction de toucher les coins de l'écran** : Les Scorbunnies sont dotés d'un comportement d'évitement actif (`avoidCorners`) repoussant les 4 angles morts de l'écran (`detectionRadius = 220px`).
      - **Barrière physique infranchissable (`containAndBounce`)** : Rayon d'exclusion absolu de 120 px aux 4 coins avec projection et réflexion de la vitesse, interdisant physiquement tout contact avec les coins.
      - **Confinement dans l'arène (`avoidWalls`)** : Remplacement de la boucle torique par un confinement intérieur rebondissant pour que les proies restent toujours chassables sans forcer Onix à s'écraser sur les parois.
      - **Génération sûre (`positionSureScorbunny`)** : Les Scorbunnies apparaissent toujours à plus de 200 px des 4 coins.
      - **Visualisation Debug** : Affichage des arcs d'exclusion des 4 coins en mode debug (<kbd>D</kbd>).
    - **Mécanique Snake "Eat & Grow"** : Chaque fois qu'Onix intercepte un Scorbunny avec sa tête :
      - Effet **NOM !** : Déclenchement d'un son de mastication / croquage cartoon (`playNomSound()`), onomatopée comics (*NOM !*, *CRUNCH !*, *CHOMP !*, *MIAM !*), gerbe de particules rocheuses et secousse d'écran.
      - **Onix grandit** immédiatement d'un nouvel anneau rocheux (`grow()`).
      - Le Scorbunny est retiré de la manche.
    - **Condition de Victoire / Défaite** :
      - Défaite : Crash contre un mur ou auto-collision avec décompte de 4s et relance par <kbd>ESPACE</kbd>.
      - Victoire : Tous les Scorbunnies dévorés avec célébration de la taille maximale atteinte.
  - **Héritage visuel et sonore complet de 2-PursueEvade** :
    - Décor animé `background.gif` en boucle continue.
    - Scorbunnies autonomes (`Target extends Vehicle`) avec traînées plasma jaune, fuite d'urgence (`evade`) et son de panique aigu à la détection.
    - Menu Burger ergonomique avec tiroir escamotable (`☰ Paramètres`), badge d'état persistant (`🐰 Scorbunnies | 🐍 Anneaux Onix | 💥 Miam | 🕹️ Contrôles | 🔊 BGM`), et contrôles complets.
- **Transmission** : Création du présent fichier [HANDOFF.md](HANDOFF.md).
