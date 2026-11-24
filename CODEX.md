# OpenAI Codex / ChatGPT Instructions - Steering Behaviors p5.js

You are assisting in developing a suite of p5.js applications demonstrating Craig Reynolds' Steering Behaviors.

## Critical Project Constraints
1. **Single class per file rule**: Each `.js` file must define and export exactly one class (e.g. `Vehicle` in `vehicle.js`, `Obstacle` in `obstacle.js`).
2. **Universal Vehicle pattern**: Every animated graphic entity MUST be an instance of `Vehicle` or a subclass of `Vehicle`. Movement must strictly occur via steering behaviors and Newtonian Euler integration (`pos += vel`, `vel += acc`, `acc = force / mass`).
3. **Obstacles & static elements are Vehicles**: Even stationary obstacles or landmarks must inherit from `Vehicle` (e.g., `class Obstacle extends Vehicle`) with `maxSpeed = 0` by default.
4. **Specialized objects as subclasses**: Players, missiles, enemies, boids, floating scores, spaceships must subclass `Vehicle` and implement their specific `applyBehaviors()` and `show()` methods.
5. **p5.js best practices**:
   - Never create DOM elements in `draw()`.
   - Minimize garbage collection by avoiding vector allocations inside the 60 FPS animation loop.
   - Use squared distances (`distSq`) instead of `dist()` for threshold detection.
   - Properly sequence `<script>` tags in `index.html`.

## Architecture & Resources
- Read [ARCHITECTURE.md](file:///c:/Users/jaimi/Documents/skl/5th%20year/double%20diplo/GAMES/Steering-Behavior-Mouna-MARRAKECH/ARCHITECTURE.md) for Craig Reynolds' standard behaviors formulas.
- Read [docs/P5_BEST_PRACTICES.md](file:///c:/Users/jaimi/Documents/skl/5th%20year/double%20diplo/GAMES/Steering-Behavior-Mouna-MARRAKECH/docs/P5_BEST_PRACTICES.md) for p5.js performance guidelines.
- Read [HANDOFF.md](file:///c:/Users/jaimi/Documents/skl/5th%20year/double%20diplo/GAMES/Steering-Behavior-Mouna-MARRAKECH/HANDOFF.md) for current progress and next steps.
