# Spécification — Exemple 6-ObstacleAvoidance

## 1. Objectif général

Améliorer le sketch `6-ObstacleAvoidance` avec deux modes d'évitement entre vaisseaux et un algorithme `avoid()` multi-rayons capable de gérer plusieurs obstacles proches simultanément.

---

## 2. Tâche 1 — Toggle Séparation / Vaisseaux-Obstacles & Évitement multi-rayons [DONE]

### 2.1 Deux modes d'évitement (bouton toggle dans la UI)
1. **Mode 1 — Séparation entre vaisseaux** (défaut) :
   - applique `separate(vehicules)` avec un poids réglable par curseur (`0` à `3`, défaut `0.5`) ;
   - `avoid()` ne traite que les `obstacles`.
2. **Mode 2 — Vaisseaux = Obstacles** :
   - désactive `separate(vehicules)` ;
   - injecte les autres vaisseaux (`v !== this`) comme obstacles dans `avoid()`.

### 2.2 Évitement multi-rayons (`avoid()`)
- Menu déroulant **Nombre de rayons** uniquement impair (`1` par défaut, choix `1, 3, 5, 7, 9, 11, 13`) garantissant toujours un rayon central droit devant le vaisseau.
- Curseur **Amplitude vue (°)** (`10°` à `360°`, pas `5°`, défaut `100°`) réglant l'ouverture angulaire des rayons (répartition uniforme sans chevauchement à `360°`).
- Curseur **Largeur zone côtés** (`20%` à `150%`, pas `5%`, défaut `100%`) modulant la largeur latérale de l'hexagone et du rectangle avant.
- Curseur **Force max** (`0.05` à `1.50`, pas `0.05`, défaut `0.20`) réglant `maxForce` sur l'ensemble des vaisseaux.
- Lorsque le nombre de rayons est `> 1`, les rayons sont répartis à **angles égaux** dans un cône devant le vaisseau.
- Chaque rayon porte **deux points de détection** (`50 %` et `100 %` de la portée).
- Le comportement `avoid()` évalue les distances sur les 3 points (`pos`, `ahead2`, `ahead`) envers **tous les obstacles / vaisseaux menaçants** (avec visualisation en jaune du vecteur de plus petite distance `obs.pos -> closestSample`).
- En mode multi-rayons (`> 1`), le risque réel est filtré par une zone de danger combinant un **hexagone de rayon `r * 1.2`** autour du vaisseau et un **rectangle devant le vaisseau** allant jusqu'au bout du rayon colinéaire à la vitesse.
- En mode debug (`D` ou checkbox), tous les rayons, leurs deux points, le vecteur `ahead`/`ahead2`, l'hexagone `r * 1.2` et le rectangle avant sont tracés.
