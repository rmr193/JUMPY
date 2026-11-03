// Jumping Shell - 24 Complete Levels (with exact pixel-faithful Level 5 from reference screenshot)
// Coordinate system:
// Interior grid is 58 columns wide (c = 0..57, left to right)
// and 37 rows tall (r = 0..36, bottom to top; r = 0 rests on the bottom floor).
// Solid walls/platforms: [c, r, w, h]
// Shells: { c, r, size: 2|3|4, type: 'normal'|'striped'|'explosive' }
// Spikes: { c, r, w, dir: 'up'|'down'|'left'|'right' }
// Buttons: { c, r, id }
// Lasers: { c, r, h, id } (or horizontal { c, r, w, id, horiz: true })
// Weak blocks: [c, r, w, h, maxSize] (breaks if touched by entity with size > maxSize, default maxSize=1)
// Orbs: { c, r, type: 'grow'|'shrink' }
// Paint gates: { c, r, h, color: 'blue'|'red' }
// Runners: { c, r, size: 1|2, minC, maxC }
// WeightMeters: { c, r, w, targetWeight, doorRect: [dc, dr, dw, dh] }
// CrackedWalls (destroyed by explosive shells): [c, r, w, h]

window.LEVELS = [
  // =========================================================================
  // LEVEL 1: Tutorial - Basic Jump & Double Jump (Shedding Shell)
  // =========================================================================
  {
    name: "Level 1: Shed Your Shell",
    hintText: "Move right with A/D or Arrow keys. Jump up the steps with W/Up. At the top step, press W/Up a SECOND time in mid-air to jump out of your shell and reach the high portal!",
    hintPath: [[14, 6], [22, 10], [30, 14], [36, 18], [41, 24]],
    player: { c: 13, r: 6, size: 2 },
    portal: { c: 41, r: 22 },
    walls: [
      [0, 0, 58, 6],    // Floor base
      [0, 6, 10, 31],   // Left border wall
      [48, 6, 10, 31],  // Right border wall
      [0, 31, 58, 6],   // Ceiling
      [20, 6, 18, 4],   // Step 1 (top at r=10)
      [28, 10, 10, 4],  // Step 2 (top at r=14)
      [38, 6, 10, 16]   // High portal platform (top at r=22, +8 above r=14 -> requires double jump!)
    ],
    arrows: [
      { c: 33, r: 16 }
    ],
    tutorialText: [
      { c: 15, r: 18, text: "A / D or ◀ / ▶ : Move" },
      { c: 23, r: 27, text: "Press W / ▲ twice in mid-air to jump out of shell!" }
    ]
  },

  // =========================================================================
  // LEVEL 2: Tutorial - Run & Double Jump Across Gap
  // =========================================================================
  {
    name: "Level 2: Leap of Faith",
    hintText: "Run right and jump from the edge, then double-jump at the peak of your jump to shed your 2x2 shell and land on the right ledge. Hop up the floating blocks to the portal!",
    hintPath: [[12, 11], [20, 16], [27, 19], [36, 22], [44, 25]],
    player: { c: 11, r: 11, size: 2 },
    portal: { c: 43, r: 24 },
    walls: [
      [0, 0, 58, 4],    // Bottom floor
      [0, 4, 8, 33],    // Left wall
      [50, 4, 8, 33],   // Right wall
      [0, 32, 58, 5],   // Ceiling
      [8, 4, 11, 7],    // Spawn platform (top at r=11)
      [19, 4, 3, 3],    // Recovery step 1 if player falls (top at r=7)
      [26, 4, 24, 13],  // High right platform (top at r=17, +6 with horizontal gap -> double jump!)
      [35, 20, 4, 1],   // Floating stair 1 (top at r=21)
      [42, 23, 8, 1]    // Portal platform (top at r=24)
    ],
    shells: [
      { c: 15, r: 4, size: 2 } // Extra shell at bottom in case player falls
    ],
    arrows: [
      { c: 21, r: 14 }
    ]
  },

  // =========================================================================
  // LEVEL 3: Nesting Into a Larger 3x3 Shell
  // =========================================================================
  {
    name: "Level 3: Russian Dolls",
    hintText: "Hop up the right floating platforms while keeping your 2x2 shell to nest into the larger 3x3 shell at the top-right. Then drop back down to the left and triple-jump into the high left portal!",
    hintPath: [[18, 5], [27, 10], [36, 15], [44, 19], [18, 5], [12, 24]],
    player: { c: 17, r: 5, size: 2 },
    portal: { c: 10, r: 23 },
    walls: [
      [0, 0, 58, 5],    // Floor
      [0, 5, 8, 32],    // Left wall
      [50, 5, 8, 32],   // Right wall
      [0, 32, 58, 5],   // Ceiling
      [8, 22, 8, 1],    // High left portal ledge (top at r=23, +18 above floor -> needs 3x3 triple jump!)
      [25, 9, 5, 1],    // Floating step 1 (top at r=10)
      [34, 14, 5, 1],   // Floating step 2 (top at r=15)
      [42, 18, 8, 1]    // Right ledge with 3x3 shell (top at r=19)
    ],
    shells: [
      { c: 44, r: 19, size: 3 }
    ]
  },

  // =========================================================================
  // LEVEL 4: Double-Jump to Upgrade Shells
  // =========================================================================
  {
    name: "Level 4: Step by Step",
    hintText: "Jump onto the middle platform, double-jump to the upper-left ledge to grab the 2x2 shell, then jump right into the 3x3 shell. Drop to the floor and triple-jump up the right shaft to the portal!",
    hintPath: [[20, 5], [20, 10], [12, 18], [26, 21], [38, 5], [44, 24]],
    player: { c: 19, r: 5, size: 2 },
    portal: { c: 43, r: 25 },
    walls: [
      [0, 0, 58, 5],    // Floor
      [0, 5, 8, 32],    // Left wall
      [50, 5, 8, 32],   // Right wall
      [0, 32, 58, 5],   // Ceiling
      [18, 9, 6, 1],    // Low middle platform (top at r=10)
      [8, 17, 8, 1],    // Upper-left platform (top at r=18, +8 above r=10 -> double jump!)
      [22, 20, 8, 1],   // Upper-middle platform with 3x3 shell (top at r=21, +3 above r=18)
      [34, 5, 2, 17],   // Dividing wall
      [41, 24, 9, 1]    // High right portal platform (top at r=25)
    ],
    shells: [
      { c: 10, r: 18, size: 2 },
      { c: 25, r: 21, size: 3 }
    ]
  },

  // =========================================================================
  // LEVEL 5: EXACT PIXEL-FOR-PIXEL MATCH OF UPLOADED SCREENSHOT!
  // =========================================================================
  {
    name: "Level 5: The Shell Citadel",
    hintText: "1) Climb the middle platforms to get the 2x2 shell. 2) Go to the right room, climb up and double-jump to the right 2x2 shell, then jump to the top-left 3x3 shell. 3) Bring the 3x3 shell to the far-left room, double-jump from the floor to the middle 3x3 shell, then jump up to the 4x4 shell. 4) Walk back to the center shaft and quadruple-jump into the portal!",
    hintPath: [
      [37, 0], [23, 3], [22, 9], [28, 12],
      [55, 6], [45, 12], [56, 19], [44, 24],
      [10, 0], [11, 15], [1, 23],
      [36, 0], [36, 27]
    ],
    player: { c: 37, r: 0, size: 1 },
    portal: { c: 35, r: 27 },
    walls: [
      // Outer room ceilings (exact match of screenshot)
      [0, 35, 15, 2],   // Left room ceiling (r=35..36)
      [14, 22, 17, 15], // Middle room ceiling block (c=14..30, r=22..36)
      [30, 31, 14, 6],  // Center shaft ceiling block (c=30..43, r=31..36)
      // Vertical dividing walls
      [14, 5, 1, 30],   // Left dividing wall (c=14, r=5..34)
      [30, 7, 1, 15],   // Middle-right dividing wall (c=30, r=7..21)
      [43, 7, 1, 24],   // Right dividing wall (c=43, r=7..30)
      // Left room platforms
      [0, 22, 5, 1],    // Top-left platform under 4x4 shell (c=0..4, r=22)
      [7, 13, 8, 2],    // Middle-left platform under 3x3 shell (c=7..14, r=13..14)
      // Middle room platforms
      [14, 5, 4, 1],    // Foot sticking right from left dividing wall (c=14..17, r=5)
      [22, 2, 4, 1],    // Lower floating platform (c=22..25, r=2)
      [21, 8, 4, 1],    // Upper floating platform (c=21..24, r=8)
      [28, 11, 3, 1],   // Middle-right ledge under 2x2 shell (c=28..30, r=11)
      // Right room platforms
      [54, 5, 4, 1],    // Bottom-right foot (c=54..57, r=5)
      [43, 11, 6, 1],   // Lower-left ledge (c=43..48, r=11)
      [52, 17, 6, 2],   // Middle-right platform under 2x2 shell (c=52..57, r=17..18)
      [43, 23, 6, 1]    // Top-left ledge under 3x3 shell (c=43..48, r=23)
    ],
    shells: [
      { c: 0, r: 23, size: 4 },  // Top-left 4x4 shell
      { c: 11, r: 15, size: 3 }, // Left-middle 3x3 shell
      { c: 28, r: 12, size: 2 }, // Middle 2x2 shell
      { c: 44, r: 24, size: 3 }, // Top-right 3x3 shell
      { c: 56, r: 19, size: 2 }  // Far-right 2x2 shell
    ]
  },

  // =========================================================================
  // LEVEL 6: Debut of Spikes
  // =========================================================================
  {
    name: "Level 6: Sharp Edges",
    hintText: "Spikes kill you on contact! Jump over the bottom spikes, double-jump out of your 2x2 shell to squeeze through the narrow 1-tile tunnel, then nest into the right 2x2 shell and double-jump to the portal.",
    hintPath: [[10, 6], [22, 10], [32, 14], [42, 6], [45, 19]],
    player: { c: 10, r: 6, size: 2 },
    portal: { c: 44, r: 19 },
    walls: [
      [0, 0, 58, 6],
      [0, 6, 8, 31],
      [50, 6, 8, 31],
      [0, 30, 58, 7],
      [20, 6, 8, 4],    // Step before tunnel (top at r=10)
      [28, 6, 8, 8],    // Lower tunnel wall (top at r=14)
      [28, 15, 8, 15],  // Upper tunnel wall (leaves 1-tile gap at r=14! Only 1x1 fits!)
      [42, 18, 8, 1]    // Portal platform (top at r=19)
    ],
    spikes: [
      { c: 15, r: 6, w: 4 },
      { c: 37, r: 6, w: 4 }
    ],
    shells: [
      { c: 44, r: 6, size: 2 }
    ]
  },

  // =========================================================================
  // LEVEL 7: Shells Fall Through Spikes
  // =========================================================================
  {
    name: "Level 7: Spike Sieve",
    hintText: "Empty shells pass harmlessly through spikes! Jump over the spike shaft and double-jump directly above it so your 2x2 shell falls through the spikes to the bottom floor. Take the right passage down, reclaim your shell, and double-jump to the portal!",
    hintPath: [[12, 20], [23, 24], [32, 20], [32, 6], [23, 6], [14, 14]],
    player: { c: 11, r: 20, size: 2 },
    portal: { c: 42, r: 15 },
    walls: [
      [0, 0, 58, 6],
      [0, 6, 8, 31],
      [50, 6, 8, 31],
      [0, 30, 58, 7],
      [8, 19, 12, 1],   // Top-left spawn ledge (top at r=20)
      [20, 12, 2, 8],   // Left wall of spike shaft
      [26, 12, 4, 8],   // Right wall of spike shaft (top at r=20)
      [35, 10, 3, 20],  // Dividing wall (leaves 4-tile gap at r=6..9)
      [40, 14, 10, 1]   // Portal ledge on right (top at r=15)
    ],
    spikes: [
      { c: 22, r: 19, w: 4 } // Spikes across shaft at r=19!
    ]
  },

  // =========================================================================
  // LEVEL 8: Debut of Green Buttons & Orange Lasers
  // =========================================================================
  {
    name: "Level 8: Laser Lock",
    hintText: "Drop your 2x2 shell onto the green floor button to turn off the orange laser! Then walk through the open gate, grab the spare 2x2 shell, and double-jump up to the portal.",
    hintPath: [[12, 6], [20, 11], [20, 6], [36, 6], [44, 16]],
    player: { c: 11, r: 6, size: 2 },
    portal: { c: 43, r: 16 },
    walls: [
      [0, 0, 58, 6],
      [0, 6, 8, 31],
      [50, 6, 8, 31],
      [0, 30, 58, 7],
      [27, 12, 3, 18],  // Wall above laser gate
      [41, 15, 9, 1]    // Portal ledge (top at r=16)
    ],
    buttons: [
      { c: 20, r: 6, id: 1 }
    ],
    lasers: [
      { c: 28, r: 6, h: 6, id: 1 }
    ],
    shells: [
      { c: 34, r: 6, size: 2 }
    ]
  },

  // =========================================================================
  // LEVEL 9: Dual Laser Gates
  // =========================================================================
  {
    name: "Level 9: Double Security",
    hintText: "Collect both 2x2 shells and drop one on each green button to disable both orange lasers guarding the portal!",
    hintPath: [[12, 6], [18, 12], [28, 12], [25, 6], [35, 6], [45, 6]],
    player: { c: 11, r: 6, size: 2 },
    portal: { c: 45, r: 6 },
    walls: [
      [0, 0, 58, 6],
      [0, 6, 8, 31],
      [50, 6, 8, 31],
      [0, 30, 58, 7],
      [16, 11, 5, 1],   // Floating platform 1 (top at r=12)
      [26, 11, 6, 1],   // Floating platform 2 with second shell (top at r=12)
      [38, 12, 2, 18],  // Wall above laser 1
      [42, 12, 2, 18]   // Wall above laser 2
    ],
    buttons: [
      { c: 23, r: 6, id: 1 },
      { c: 33, r: 6, id: 2 }
    ],
    lasers: [
      { c: 38, r: 6, h: 6, id: 1 },
      { c: 42, r: 6, h: 6, id: 2 }
    ],
    shells: [
      { c: 28, r: 12, size: 2 }
    ]
  },

  // =========================================================================
  // LEVEL 10: Cramped Laser Tunnel
  // =========================================================================
  {
    name: "Level 10: Tight Squeeze",
    hintText: "Grab the 2x2 shell on the left, drop it onto the button in the pit to disable the laser in the 1-tile-tall tunnel, then slip through as 1x1 to reach the portal!",
    hintPath: [[25, 12], [12, 12], [19, 10], [38, 12], [45, 12]],
    player: { c: 25, r: 12, size: 1 },
    portal: { c: 44, r: 12 },
    walls: [
      [0, 0, 58, 8],
      [0, 8, 8, 29],
      [50, 8, 8, 29],
      [0, 28, 58, 9],
      [8, 8, 10, 4],    // Left floor (top at r=12)
      [18, 8, 4, 1],    // Pit floor for button (top at r=9)
      [22, 8, 12, 4],   // Center floor (top at r=12)
      [34, 8, 8, 4],    // Tunnel floor (top at r=12)
      [34, 13, 8, 15],  // Tunnel ceiling (1-tile gap at r=12!)
      [42, 8, 8, 4]     // Portal floor (top at r=12)
    ],
    buttons: [
      { c: 19, r: 9, id: 1 }
    ],
    lasers: [
      { c: 37, r: 12, h: 1, id: 1 }
    ],
    shells: [
      { c: 11, r: 12, size: 2 }
    ]
  },

  // =========================================================================
  // LEVEL 11: Spike Pit Button Drop
  // =========================================================================
  {
    name: "Level 11: Precision Drop",
    hintText: "Jump across the spike pit and double-jump right above the green button so your shed shell drops through the spikes onto the button, turning off the laser on the right!",
    hintPath: [[12, 14], [26, 18], [38, 14], [45, 14]],
    player: { c: 11, r: 14, size: 2 },
    portal: { c: 44, r: 14 },
    walls: [
      [0, 0, 58, 6],
      [0, 6, 8, 31],
      [50, 6, 8, 31],
      [0, 30, 58, 7],
      [8, 6, 12, 8],    // Left platform (top at r=14)
      [32, 6, 18, 8],   // Right platform (top at r=14)
      [40, 20, 2, 10]   // Laser top wall
    ],
    spikes: [
      { c: 20, r: 13, w: 12 }
    ],
    buttons: [
      { c: 25, r: 6, id: 1 }
    ],
    lasers: [
      { c: 40, r: 14, h: 6, id: 1 }
    ]
  },

  // =========================================================================
  // LEVEL 12: Multi-Layer Shell Relay
  // =========================================================================
  {
    name: "Level 12: Shell Relay",
    hintText: "Drop your outer 3x3 shell onto the left button to open the first laser, then drop your 2x2 shell onto the middle button to open the second laser and enter the portal!",
    hintPath: [[12, 6], [18, 6], [28, 6], [36, 6], [45, 6]],
    player: { c: 11, r: 6, size: 3 },
    portal: { c: 44, r: 6 },
    walls: [
      [0, 0, 58, 6],
      [0, 6, 8, 31],
      [50, 6, 8, 31],
      [0, 30, 58, 7],
      [24, 12, 2, 18],
      [39, 12, 2, 18]
    ],
    buttons: [
      { c: 18, r: 6, id: 1 },
      { c: 32, r: 6, id: 2 }
    ],
    lasers: [
      { c: 24, r: 6, h: 6, id: 1 },
      { c: 39, r: 6, h: 6, id: 2 }
    ]
  },

  // =========================================================================
  // LEVEL 13: Debut of Weak Platforms (Hollow Purple Blocks)
  // =========================================================================
  {
    name: "Level 13: Fragile Bridges",
    hintText: "Hollow purple blocks break if touched by anything larger than 1x1! Shed your 2x2 shell down the shaft before the weak bridge so it lands near the portal, then walk lightly across the purple bridge as 1x1, reclaim your shell, and jump to the portal!",
    hintPath: [[12, 16], [20, 20], [32, 16], [38, 6], [45, 14]],
    player: { c: 11, r: 16, size: 2 },
    portal: { c: 44, r: 14 },
    walls: [
      [0, 0, 58, 6],
      [0, 6, 8, 31],
      [50, 6, 8, 31],
      [0, 30, 58, 7],
      [8, 6, 12, 10],   // Left platform (top at r=16)
      [34, 6, 4, 10],   // Right pillar after weak bridge (top at r=16)
      [42, 6, 8, 8]     // Portal platform (top at r=14)
    ],
    weakBlocks: [
      // [c, r, w, h, maxSize] -> breaks if entity size > 1
      [23, 15, 11, 1, 1]
    ],
    spikes: [
      { c: 23, r: 6, w: 11 } // Spikes under the weak bridge!
    ]
  },

  // =========================================================================
  // LEVEL 14: Bust Through Weak Floor, Walk Across Weak Bridge
  // =========================================================================
  {
    name: "Level 14: Heavy Impact",
    hintText: "Step onto the first purple floor while wearing your 2x2 shell to smash through it to the lower room! Then double-jump to shed your shell onto the button and walk across the lower purple bridge as 1x1.",
    hintPath: [[12, 20], [20, 20], [20, 6], [28, 6], [44, 6]],
    player: { c: 11, r: 20, size: 2 },
    portal: { c: 44, r: 6 },
    walls: [
      [0, 0, 58, 6],
      [0, 6, 8, 31],
      [50, 6, 8, 31],
      [0, 30, 58, 7],
      [8, 19, 10, 1],   // Top-left ledge (top at r=20)
      [24, 19, 26, 11], // Upper right solid block
      [26, 6, 4, 2],    // Step before weak bridge (top at r=8)
      [40, 12, 2, 7]    // Laser mount
    ],
    weakBlocks: [
      [18, 19, 6, 1, 1], // Weak floor to smash through as 2x2
      [30, 7, 10, 1, 1]  // Weak bridge over spikes to cross as 1x1
    ],
    spikes: [
      { c: 30, r: 6, w: 10 }
    ],
    buttons: [
      { c: 21, r: 6, id: 1 }
    ],
    lasers: [
      { c: 40, r: 8, h: 4, id: 1 }
    ]
  },

  // =========================================================================
  // LEVEL 15: Selective Bridge Carving
  // =========================================================================
  {
    name: "Level 15: Surgical Strike",
    hintText: "Jump and shed your 2x2 shell mid-air over the button gap so the falling 2x2 shell smashes ONLY the purple blocks above the button while you land on the intact purple bridge as 1x1!",
    hintPath: [[12, 16], [24, 21], [36, 16], [44, 16]],
    player: { c: 11, r: 16, size: 2 },
    portal: { c: 44, r: 16 },
    walls: [
      [0, 0, 58, 6],
      [0, 6, 8, 31],
      [50, 6, 8, 31],
      [0, 30, 58, 7],
      [8, 6, 10, 10],   // Left platform (top at r=16)
      [36, 6, 14, 10],  // Right platform (top at r=16)
      [40, 22, 2, 8]
    ],
    weakBlocks: [
      [18, 15, 18, 1, 1] // Continuous weak bridge from c=18 to c=35
    ],
    spikes: [
      { c: 18, r: 6, w: 5 },
      { c: 28, r: 6, w: 8 }
    ],
    buttons: [
      { c: 25, r: 6, id: 1 }
    ],
    lasers: [
      { c: 40, r: 16, h: 6, id: 1 }
    ]
  },

  // =========================================================================
  // LEVEL 16: Weak Stepping Stones
  // =========================================================================
  {
    name: "Level 16: Tiptoe & Stomp",
    hintText: "Tiptoe across the fragile purple blocks as 1x1 to the right room, nest into the 2x2 and 3x3 shells, then use the high solid platforms to return and triple-jump into the top portal!",
    hintPath: [[12, 8], [26, 8], [42, 8], [45, 14], [32, 18], [18, 24]],
    player: { c: 11, r: 8, size: 1 },
    portal: { c: 14, r: 23 },
    walls: [
      [0, 0, 58, 6],
      [0, 6, 8, 31],
      [50, 6, 8, 31],
      [0, 32, 58, 5],
      [8, 6, 8, 2],     // Left start platform (top at r=8)
      [36, 6, 14, 2],   // Right room floor (top at r=8)
      [44, 13, 6, 1],   // Right ledge with 3x3 shell (top at r=14)
      [27, 17, 11, 1],  // High return platform (top at r=18)
      [12, 22, 9, 1]    // High portal platform (top at r=23)
    ],
    weakBlocks: [
      [18, 7, 4, 1, 1],
      [25, 7, 4, 1, 1],
      [31, 7, 4, 1, 1]
    ],
    spikes: [
      { c: 16, r: 6, w: 20 }
    ],
    shells: [
      { c: 39, r: 8, size: 2 },
      { c: 45, r: 14, size: 3 }
    ]
  },

  // =========================================================================
  // LEVEL 17: Weak Trapdoor Smash
  // =========================================================================
  {
    name: "Level 17: Crash Down",
    hintText: "Climb up as 1x1 over the weak stairs, grab the 2x2 shell at the top, and stomp through the purple trapdoor protecting the portal!",
    hintPath: [[12, 6], [18, 10], [24, 14], [30, 18], [42, 18], [42, 8]],
    player: { c: 11, r: 6, size: 1 },
    portal: { c: 41, r: 6 },
    walls: [
      [0, 0, 58, 6],
      [0, 6, 8, 31],
      [50, 6, 8, 31],
      [0, 30, 58, 7],
      [28, 17, 10, 1],  // Top platform with 2x2 shell (top at r=18)
      [36, 6, 2, 11],   // Left wall of portal vault
      [48, 6, 2, 12]    // Right wall of portal vault
    ],
    weakBlocks: [
      [16, 9, 4, 1, 1],
      [22, 13, 4, 1, 1],
      [38, 17, 10, 1, 1] // Trapdoor roof over the portal vault!
    ],
    shells: [
      { c: 31, r: 18, size: 2 }
    ]
  },

  // =========================================================================
  // LEVEL 18: Debut of Red Grow Orbs (+)
  // =========================================================================
  {
    name: "Level 18: Power Growth",
    hintText: "Red (+) Orbs instantly grow your character by one shell layer! Collect the three (+) Orbs to grow from 1x1 up to 4x4, then quadruple-jump up the shaft to the portal!",
    hintPath: [[12, 6], [20, 6], [28, 6], [36, 6], [42, 26]],
    player: { c: 11, r: 6, size: 1 },
    portal: { c: 41, r: 25 },
    walls: [
      [0, 0, 58, 6],
      [0, 6, 8, 31],
      [50, 6, 8, 31],
      [0, 32, 58, 5],
      [39, 24, 9, 1]    // High portal ledge at r=25
    ],
    orbs: [
      { c: 19, r: 7, type: 'grow' },
      { c: 27, r: 8, type: 'grow' },
      { c: 35, r: 9, type: 'grow' }
    ]
  },

  // =========================================================================
  // LEVEL 19: Farming Shells with Grow Orbs
  // =========================================================================
  {
    name: "Level 19: Shell Factory",
    hintText: "Touch the first (+) Orb to become 2x2, double-jump to drop that shell onto the first button, touch the second (+) Orb, drop that shell onto the second button, and touch the third (+) Orb to double-jump to the portal!",
    hintPath: [[12, 6], [16, 7], [22, 6], [28, 7], [34, 6], [39, 7], [45, 16]],
    player: { c: 11, r: 6, size: 1 },
    portal: { c: 44, r: 15 },
    walls: [
      [0, 0, 58, 6],
      [0, 6, 8, 31],
      [50, 6, 8, 31],
      [0, 30, 58, 7],
      [25, 12, 2, 18],
      [37, 12, 2, 18],
      [42, 14, 8, 1]
    ],
    orbs: [
      { c: 16, r: 7, type: 'grow' },
      { c: 29, r: 7, type: 'grow' },
      { c: 40, r: 7, type: 'grow' }
    ],
    buttons: [
      { c: 21, r: 6, id: 1 },
      { c: 33, r: 6, id: 2 }
    ],
    lasers: [
      { c: 25, r: 6, h: 6, id: 1 },
      { c: 37, r: 6, h: 6, id: 2 }
    ]
  },

  // =========================================================================
  // LEVEL 20: Grow Orbs & Fragile Ceilings
  // =========================================================================
  {
    name: "Level 20: Size Matters",
    hintText: "Cross the weak bridge as 1x1 before touching the (+) Orbs on the right. Once grown to 3x3, stomp through the weak floor to reach the lower portal!",
    hintPath: [[12, 16], [26, 16], [42, 16], [30, 16], [30, 6]],
    player: { c: 11, r: 16, size: 1 },
    portal: { c: 28, r: 6 },
    walls: [
      [0, 0, 58, 6],
      [0, 6, 8, 31],
      [50, 6, 8, 31],
      [0, 30, 58, 7],
      [8, 6, 14, 10],
      [36, 6, 14, 10]
    ],
    weakBlocks: [
      [22, 15, 14, 1, 1]
    ],
    orbs: [
      { c: 40, r: 17, type: 'grow' },
      { c: 45, r: 17, type: 'grow' }
    ]
  },

  // =========================================================================
  // LEVEL 21: Debut of Purple Shrink Orbs (-)
  // =========================================================================
  {
    name: "Level 21: Downsizing",
    hintText: "Purple (-) Orbs remove your outer shell without dropping it (and kill you if you are already 1x1!). Jump up as 3x3, touch the (-) Orbs to shrink down to 1x1 so you can cross the fragile purple bridge to the portal!",
    hintPath: [[12, 6], [20, 13], [28, 20], [38, 20], [45, 20]],
    player: { c: 11, r: 6, size: 3 },
    portal: { c: 44, r: 20 },
    walls: [
      [0, 0, 58, 6],
      [0, 6, 8, 31],
      [50, 6, 8, 31],
      [0, 30, 58, 7],
      [17, 12, 6, 1],   // Step 1 (+7 from 6 -> 3x3 single jump reaches!)
      [25, 19, 8, 1],   // Step 2 (+7 from 13 -> 3x3 single jump reaches!)
      [42, 19, 8, 1]    // Portal ledge (top at r=20)
    ],
    weakBlocks: [
      [33, 19, 9, 1, 1] // Weak bridge at r=19 requiring size 1!
    ],
    orbs: [
      { c: 27, r: 21, type: 'shrink' },
      { c: 30, r: 21, type: 'shrink' }
    ],
    spikes: [
      { c: 25, r: 6, w: 25 }
    ]
  },

  // =========================================================================
  // LEVEL 22: Debut of Blue & Red Paint Gates
  // =========================================================================
  {
    name: "Level 22: Coat of Paint",
    hintText: "Blue Paint locks your shell so you cannot double-jump or trigger size orbs! Walk through the Blue Paint Gate to safely pass through the deadly (-) Shrink Orbs, then pass through the Red Paint Gate to unlock your shell and double-jump to the portal!",
    hintPath: [[11, 6], [18, 6], [28, 6], [38, 6], [44, 16]],
    player: { c: 10, r: 6, size: 2 },
    portal: { c: 43, r: 15 },
    walls: [
      [0, 0, 58, 6],
      [0, 6, 8, 31],
      [50, 6, 8, 31],
      [0, 30, 58, 7],
      [22, 10, 12, 20], // Low ceiling forcing player through the shrink orbs
      [41, 14, 9, 1]    // Portal ledge (top at r=15)
    ],
    paintGates: [
      { c: 17, r: 6, h: 5, color: 'blue' },
      { c: 36, r: 6, h: 5, color: 'red' }
    ],
    orbs: [
      { c: 25, r: 7, type: 'shrink' },
      { c: 29, r: 7, type: 'shrink' },
      { c: 32, r: 7, type: 'shrink' }
    ]
  },

  // =========================================================================
  // LEVEL 23: Red Square Runners & Weight Meters
  // =========================================================================
  {
    name: "Level 23: Heavyweight Champion",
    hintText: "Grab the 2x2 and 3x3 shells on the left so you are larger than the angry Red Square enemy and crush it! Then stand on the Orange Weight Meter as a 3x3 player (weight = 9) to open the '9' numbered door!",
    hintPath: [[12, 6], [12, 12], [20, 17], [30, 6], [38, 6], [45, 6]],
    player: { c: 11, r: 6, size: 1 },
    portal: { c: 45, r: 6 },
    walls: [
      [0, 0, 58, 6],
      [0, 6, 8, 31],
      [50, 6, 8, 31],
      [0, 30, 58, 7],
      [10, 11, 6, 1],   // Step 1 with 2x2 shell (top at r=12)
      [18, 16, 6, 1],   // Step 2 with 3x3 shell (top at r=17)
      [41, 12, 3, 18]   // Wall above numbered door
    ],
    shells: [
      { c: 12, r: 12, size: 2 },
      { c: 20, r: 17, size: 3 }
    ],
    runners: [
      { c: 28, r: 6, size: 2, minC: 22, maxC: 35 }
    ],
    weightMeters: [
      { c: 36, r: 6, w: 4, targetWeight: 9, doorRect: [41, 6, 3, 6] }
    ]
  },

  // =========================================================================
  // LEVEL 24: Grand Finale - Striped Shells & Explosive Gray Shells
  // =========================================================================
  {
    name: "Level 24: Explosive Finale",
    hintText: "Yellow-striped shells let you enter even if you skip a size! Enter the 2x2 Gray Explosive Shell, jump and shed it on top of the cracked wall to blast it open, then grab the Striped 3x3 Shell and triple-jump into the final portal!",
    hintPath: [[12, 14], [18, 14], [28, 18], [28, 6], [36, 6], [44, 22]],
    player: { c: 11, r: 14, size: 1 },
    portal: { c: 43, r: 22 },
    walls: [
      [0, 0, 58, 6],
      [0, 6, 8, 31],
      [50, 6, 8, 31],
      [0, 30, 58, 7],
      [8, 6, 18, 8],    // Left elevated floor (top at r=14)
      [32, 6, 18, 8],   // Right elevated floor (top at r=14)
      [41, 21, 9, 1]    // High portal ledge (top at r=22)
    ],
    crackedWalls: [
      [26, 11, 6, 3]    // Cracked bridge blocking the pit where the striped shell is!
    ],
    shells: [
      { c: 18, r: 14, size: 2, type: 'explosive' },
      { c: 28, r: 6, size: 3, type: 'striped' }
    ]
  }
];
