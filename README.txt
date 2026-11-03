========================================================================
SHELL // Minimalist Puzzle Platformer
========================================================================

TEAM MEMBERS
------------
1. Afrina Afrose Yousha
2. Sajjad Hossain Hridoy
3. Rajesh Mozumder

------------------------------------------------------------------------
1. CORE CONCEPT & DESIGN RATIONALE
------------------------------------------------------------------------
In most platformers, "double jumping" is just an abstract ability with no
physical consequence. In SHELL, every extra mid-air jump comes from wearing
nested outer shells (up to 4 layers, like Russian nesting dolls):

- Shedding a shell in mid-air propels the smaller inner character upward,
  while the shed shell falls to the ground as a physical object in the world.
- Size is a double-edged sword:
  * Larger shells jump higher, crush smaller enemies, smash fragile floors,
    and weigh more on pressure scales.
  * Smaller sizes fit through tight 1-tile tunnels and can walk across
    fragile purple bridges without breaking them.
- Every shed shell remains interactive: it falls harmlessly through spikes,
  holds down green laser buttons, and can be re-entered later.

------------------------------------------------------------------------
2. CONTROLS & SHORTCUTS
------------------------------------------------------------------------
- Move Left / Right : A / D  or  Left / Right Arrow Keys
- Jump              : W, Up Arrow, or Spacebar
- Shed Shell (Air)  : Press W, Up Arrow, or Spacebar again while in mid-air
- Restart Level     : R (or click the Restart icon in the top HUD bar)
- Toggle Hint       : H (displays the numbered solution path & Skip button)
- Level Select      : Esc or B (or click the grid icon in the top HUD bar)
- Mute / Unmute     : M (or click the speaker icon in the top HUD bar)
- Mobile / Tablet   : On-screen D-Pad and Jump/Shed buttons (auto-hidden on
                      laptop/desktop screens)

------------------------------------------------------------------------
3. GAME MECHANICS & 24-LEVEL PROGRESSION
------------------------------------------------------------------------
- Levels 01-05 (Nesting & Shedding):
  Learn mid-air shell shedding, re-entering larger shells (2x2, 3x3, 4x4),
  and chaining multi-stage jumps (culminating in "The Shell Citadel").
- Levels 06-07 (Spikes & Shell Sieves):
  Spikes are fatal to the player, but empty shells pass through spikes
  harmlessly so they can be dropped into lower rooms and reclaimed.
- Levels 08-12 (Buttons & Laser Gates):
  Shed shells onto green floor buttons to hold open orange laser barriers.
- Levels 13-17 (Fragile Purple Blocks):
  Hollow purple tiles support a 1x1 player but shatter when touched by a
  player or falling shell of size 2x2 or larger.
- Levels 18-22 (Grow/Shrink Orbs & Paint Gates):
  Red (+) orbs add a shell layer; Purple (-) orbs strip a layer (fatal at
  size 1x1). Blue Paint Gates lock your shell so you can pass through orbs
  safely without triggering them; Red Paint Gates unlock your shell.
- Levels 23-24 (Runners, Weight Meters, Striped & Explosive Shells):
  Weight meters require exact mass (player weight = size^2; empty shell
  weight = 2*size - 1) to open numbered doors. Gold-striped shells allow
  skipping sizes when nesting; Gray explosive shells detonate on landing
  to destroy cracked walls.

------------------------------------------------------------------------
4. ARCHITECTURE OVERVIEW (FOR LIVE PRESENTATION & DEMO)
------------------------------------------------------------------------
- index.html : App layout, top HUD bar (level indicator, shell-layer dots,
               hint/skip controls), main 928x592 canvas stage, and mobile
               touch controls.
- style.css  : Responsive flexbox layout, HUD styling, and media queries
               that hide touch buttons on desktop/laptop devices.
- levels.js  : Declarative data for all 24 levels on a 58x37 tile grid
               (15px per tile), including walls, shells, spikes, buttons,
               lasers, weak blocks, orbs, paint gates, runners, weight
               meters, cracked walls, and hint paths.
- game.js    : Custom HTML5 Canvas 2D engine featuring:
               * Offscreen background caching (bgCanvas) & High-DPI scaling
               * Sub-stepped AABB physics (gravity, coyote time, jump input
                 buffering, ledge step-up, and squash-and-stretch feedback)
               * Entity state machine for nesting, shedding, and puzzles
- audio.js   : Zero-dependency Web Audio API synthesizer generating real-time
               sound effects (jump, shed, nest, laser, explosion, win) and
               ambient background music.
