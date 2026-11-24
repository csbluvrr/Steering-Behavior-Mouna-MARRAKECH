# GitHub Copilot Instructions - Steering Behaviors p5.js

Apply these core rules when suggesting or generating code in this repository:

1. **Architecture Rule - Single Class Per File**: Put at most one class in each JavaScript file (except internal helper classes).
2. **Architecture Rule - Universal Vehicle**: All animated graphic entities must inherit from `Vehicle` or be instances of `Vehicle.js`.
3. **Architecture Rule - Obstacles as Vehicles**: Fixed/static obstacles must inherit from `Vehicle` (e.g. `class Obstacle extends Vehicle`) with `maxSpeed = 0` by default.
4. **Architecture Rule - Subclasses for Specialization**: Player, Enemy, Spaceship, Missile, AnimatedScore, etc. must inherit from `Vehicle`.
5. **Steering Behavior Standard**: All movement must follow Craig Reynolds' model: $\vec{F}_{\text{steering}} = \text{truncate}(\vec{v}_{\text{desired}} - \vec{v}, \text{maxForce})$.
6. **p5.js Performance**: Avoid frequent memory allocations (like `p5.Vector.sub()`) in the 60 FPS `draw()` loop; mutate vectors in place or use cached vectors.
7. See [ARCHITECTURE.md](file:///c:/Users/jaimi/Documents/skl/5th%20year/double%20diplo/GAMES/Steering-Behavior-Mouna-MARRAKECH/ARCHITECTURE.md) and [docs/P5_BEST_PRACTICES.md](file:///c:/Users/jaimi/Documents/skl/5th%20year/double%20diplo/GAMES/Steering-Behavior-Mouna-MARRAKECH/docs/P5_BEST_PRACTICES.md) for full guidelines.
