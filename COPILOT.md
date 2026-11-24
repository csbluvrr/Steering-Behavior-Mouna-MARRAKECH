# GitHub Copilot Instructions - Steering Behaviors p5.js

See [.github/copilot-instructions.md](file:///c:/Users/jaimi/Documents/skl/5th%20year/double%20diplo/GAMES/Steering-Behavior-Mouna-MARRAKECH/.github/copilot-instructions.md) for full details.

## Summary Checklist
- [x] Maximum 1 class per file.
- [x] Any animated element is an instance or subclass of `Vehicle`.
- [x] Static elements and obstacles inherit from `Vehicle` (`class Obstacle extends Vehicle`) with `maxSpeed = 0`.
- [x] Specialized entities (`Player`, `Enemy`, `Missile`, `Spaceship`) inherit from `Vehicle`.
- [x] Motion driven strictly by Craig Reynolds' steering behaviors.
- [x] p5.js performance best practices (no DOM creation in `draw()`, avoid vector allocation spam).
