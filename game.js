// SHELL — Minimalist Puzzle Platformer Engine & Mobile-Ready Renderer
(() => {
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');

  // Expanded 928x592 canvas with 15px tiles (58x37 interior grid + 29px architectural border)
  const W = 928;
  const H = 592;
  const COLS = 58;
  const ROWS = 37;
  const TILE = 15.0;
  const X0 = 29;
  const Y0 = H - 18.5; // Bottom floor surface Y coordinate (573.5)

  // Modern Minimalist Palette
  const COLORS = {
    wallFill: '#1b1e28',
    wallEdge: '#32384a',
    bgInterior: '#f4f1ea',
    bgGridDot: 'rgba(27, 30, 40, 0.085)',
    coralBody: '#ff5a5f',
    coralShade: '#d63c41',
    blueBody: '#00b4d8',
    blueShade: '#0086a3',
    grayBody: '#4a4e69',
    grayShade: '#303347',
    stripeGold: '#ffbe0b',
    portalBg: '#1b1e28',
    portalAccent: '#ffbe0b',
    portalCoral: '#ff5a5f',
    spike: '#1b1e28',
    buttonGreen: '#10b981',
    buttonDark: '#059669',
    laserOrange: '#f97316',
    laserCore: '#fde047',
    weakPurple: '#8b5cf6',
    orbGrow: '#ff5a5f',
    orbShrink: '#8b5cf6',
    weightOrange: '#f59e0b'
  };

  // Physics constants (in tiles & seconds)
  const GRAVITY = 42.0;
  const MAX_FALL_SPEED = 32.0;
  const MOVE_SPEED = {
    1: 14.5,
    2: 14.0,
    3: 13.5,
    4: 13.0
  };
  const JUMP_HEIGHTS = {
    1: 6.35,
    2: 6.85,
    3: 8.80,
    4: 10.20
  };
  const JUMP_VY = {
    1: Math.sqrt(2 * GRAVITY * JUMP_HEIGHTS[1]),
    2: Math.sqrt(2 * GRAVITY * JUMP_HEIGHTS[2]),
    3: Math.sqrt(2 * GRAVITY * JUMP_HEIGHTS[3]),
    4: Math.sqrt(2 * GRAVITY * JUMP_HEIGHTS[4])
  };

  // State
  const urlParams = new URLSearchParams(window.location.search);
  const startLvlParam = parseInt(urlParams.get('level'), 10);
  let currentLevelIdx = (!isNaN(startLvlParam) && startLvlParam >= 1 && startLvlParam <= window.LEVELS.length)
    ? startLvlParam - 1
    : 4;

  let completedLevels = new Set();
  let mode = 'play'; // 'play' | 'level_select'
  let showHint = false;
  let globalTime = 0;

  // Input state
  const keys = {
    left: false,
    right: false,
    up: false
  };
  const touchInput = {
    left: false,
    right: false
  };
  let jumpJustPressed = false;
  let mouseX = -1;
  let mouseY = -1;

  // Level entities
  let solidGrid = [];
  let player = null;
  let portal = null;
  let shells = [];
  let spikes = [];
  let buttons = [];
  let lasers = [];
  let weakBlocks = [];
  let orbs = [];
  let paintGates = [];
  let runners = [];
  let weightMeters = [];
  let crackedWalls = [];
  let arrows = [];
  let tutorialText = [];
  let particles = [];
  let deathTimer = 0;
  let winTimer = 0;

  // DOM HUD elements
  const hudLevelNum = document.getElementById('hud-level-num');
  const hudLevelTitle = document.getElementById('hud-level-title');
  const hudLayers = document.getElementById('hud-layers');
  const btnLevels = document.getElementById('btn-levels');
  const btnRestart = document.getElementById('btn-restart');
  const btnMute = document.getElementById('btn-mute');
  const iconSoundOn = document.getElementById('icon-sound-on');
  const iconSoundOff = document.getElementById('icon-sound-off');
  const btnHint = document.getElementById('btn-hint');
  const btnSkip = document.getElementById('btn-skip');
  const jumpLabel = document.getElementById('jump-label');

  function colToX(c) {
    return X0 + c * TILE;
  }

  function rowToY(r, h = 0) {
    return Y0 - (r + h) * TILE;
  }

  function buildShellStack(size) {
    const stack = [];
    for (let s = 2; s <= size; s++) {
      stack.push({ size: s, type: 'normal', paint: 'red' });
    }
    return stack;
  }

  function syncHud() {
    const def = window.LEVELS[currentLevelIdx];
    const numStr = String(currentLevelIdx + 1).padStart(2, '0');
    const totStr = String(window.LEVELS.length).padStart(2, '0');
    if (hudLevelNum) hudLevelNum.textContent = `${numStr} / ${totStr}`;
    if (hudLevelTitle) {
      hudLevelTitle.textContent = def.name.replace(/^Level \d+:\s*/, '');
    }
    if (btnHint) {
      btnHint.classList.toggle('active', showHint);
    }
    if (btnSkip) {
      btnSkip.classList.toggle('hidden', !showHint);
    }
    if (hudLayers && player) {
      hudLayers.innerHTML = '';
      for (let i = 1; i <= 4; i++) {
        const dot = document.createElement('span');
        dot.className = 'layer-dot' +
          (i <= player.size ? (player.paint === 'blue' ? ' blue' : ' filled') : '');
        hudLayers.appendChild(dot);
      }
    }
    if (jumpLabel && player) {
      if (!player.onGround && player.size > 1 && player.paint !== 'blue') {
        jumpLabel.textContent = `SHED (${player.size - 1})`;
      } else {
        jumpLabel.textContent = 'JUMP';
      }
    }
  }

  function loadLevel(idx) {
    currentLevelIdx = ((idx % window.LEVELS.length) + window.LEVELS.length) % window.LEVELS.length;
    const def = window.LEVELS[currentLevelIdx];
    showHint = false;
    deathTimer = 0;
    winTimer = 0;
    particles = [];

    solidGrid = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
    if (def.walls) {
      for (const [wc, wr, ww, wh] of def.walls) {
        for (let r = wr; r < wr + wh; r++) {
          for (let c = wc; c < wc + ww; c++) {
            if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
              solidGrid[r][c] = true;
            }
          }
        }
      }
    }

    const pSize = def.player.size || 1;
    player = {
      c: def.player.c,
      r: def.player.r,
      vx: 0,
      vy: 0,
      size: pSize,
      shellStack: buildShellStack(pSize),
      paint: 'red',
      onGround: false,
      coyoteTimer: 0,
      facing: 1,
      scaleX: 1,
      scaleY: 1,
      dead: false,
      won: false
    };

    portal = {
      c: def.portal.c,
      r: def.portal.r,
      w: 4,
      h: 4
    };

    shells = (def.shells || []).map(s => ({
      c: s.c,
      r: s.r,
      vy: 0,
      size: s.size,
      type: s.type || 'normal',
      paint: s.paint || 'red',
      cooldown: 0,
      armedToExplode: false
    }));

    spikes = (def.spikes || []).map(s => ({
      c: s.c,
      r: s.r,
      w: s.w || 1,
      h: s.h || 1,
      dir: s.dir || 'up'
    }));

    buttons = (def.buttons || []).map(b => ({
      c: b.c,
      r: b.r,
      w: 2,
      h: 0.55,
      id: b.id,
      pressed: false
    }));

    lasers = (def.lasers || []).map(l => ({
      c: l.c,
      r: l.r,
      w: l.w || 1,
      h: l.h || 1,
      id: l.id,
      active: true
    }));

    weakBlocks = [];
    for (const [wc, wr, ww, wh, maxS] of (def.weakBlocks || [])) {
      const limit = maxS || 1;
      for (let r = wr; r < wr + wh; r++) {
        for (let c = wc; c < wc + ww; c++) {
          weakBlocks.push({
            c,
            r,
            w: 1,
            h: 1,
            maxSize: limit,
            broken: false
          });
        }
      }
    }

    orbs = (def.orbs || []).map(o => ({
      c: o.c,
      r: o.r,
      type: o.type,
      collected: false
    }));

    paintGates = (def.paintGates || []).map(g => ({
      c: g.c,
      r: g.r,
      w: 1.2,
      h: g.h || 4,
      color: g.color
    }));

    runners = (def.runners || []).map(ru => ({
      c: ru.c,
      r: ru.r,
      vx: 5.5,
      vy: 0,
      size: ru.size || 1,
      minC: ru.minC ?? 0,
      maxC: ru.maxC ?? COLS,
      alive: true
    }));

    weightMeters = (def.weightMeters || []).map(wm => ({
      c: wm.c,
      r: wm.r,
      w: wm.w || 4,
      h: 1,
      targetWeight: wm.targetWeight,
      currentWeight: 0,
      doorRect: wm.doorRect ? [...wm.doorRect] : null,
      doorOpen: false
    }));

    crackedWalls = (def.crackedWalls || []).map(([cc, cr, cw, ch]) => ({
      c: cc,
      r: cr,
      w: cw,
      h: ch,
      destroyed: false
    }));

    arrows = def.arrows || [];
    tutorialText = def.tutorialText || [];

    syncHud();
  }

  function isCellSolid(c, r) {
    if (c < 0 || c >= COLS || r < 0 || r >= ROWS) return true;
    return solidGrid[r][c];
  }

  function getSolidRects() {
    const rects = [];
    rects.push([-100, -1000, COLS + 200, 1000]); // Bottom floor
    rects.push([-100, ROWS, COLS + 200, 1000]);  // Top ceiling
    rects.push([-1000, -100, 1000, ROWS + 200]); // Left wall
    rects.push([COLS, -100, 1000, ROWS + 200]);  // Right wall

    const def = window.LEVELS[currentLevelIdx];
    if (def.walls) {
      for (const w of def.walls) rects.push(w);
    }
    for (const cw of crackedWalls) {
      if (!cw.destroyed) rects.push([cw.c, cw.r, cw.w, cw.h]);
    }
    for (const wm of weightMeters) {
      if (wm.doorRect && !wm.doorOpen) rects.push(wm.doorRect);
    }
    for (const wb of weakBlocks) {
      if (!wb.broken) rects.push([wb.c, wb.r, wb.w, wb.h, wb]);
    }
    return rects;
  }

  function overlaps(ax, ay, aw, ah, bx, by, bw, bh) {
    return ax < bx + bw - 1e-4 &&
           ax + aw > bx + 1e-4 &&
           ay < by + bh - 1e-4 &&
           ay + ah > by + 1e-4;
  }

  function spawnParticles(c, r, color, count = 12, speed = 8) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const spd = speed * (0.4 + Math.random() * 0.8);
      particles.push({
        c,
        r,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd + 3,
        size: 0.22 + Math.random() * 0.22,
        color,
        life: 0.35 + Math.random() * 0.2,
        maxLife: 0.55
      });
    }
  }

  function killPlayer() {
    if (player.dead || player.won) return;
    player.dead = true;
    deathTimer = 0.6;
    window.sound.die();
    const pColor = player.paint === 'blue' ? COLORS.blueBody : COLORS.coralBody;
    spawnParticles(player.c + player.size / 2, player.r + player.size / 2, pColor, 20, 12);
  }

  function triggerWeakBlockCheck(wb, entitySize) {
    if (wb.broken) return;
    if (entitySize > wb.maxSize) {
      wb.broken = true;
      window.sound.breakBlock();
      spawnParticles(wb.c + 0.5, wb.r + 0.5, COLORS.weakPurple, 8, 6);
    }
  }

  function performDoubleJump() {
    if (player.size <= 1) return false;
    if (player.paint === 'blue') return false;

    const outer = player.shellStack.pop() || { size: player.size, type: 'normal', paint: player.paint };
    const oldSize = player.size;
    const newSize = oldSize - 1;

    shells.push({
      c: player.c,
      r: player.r,
      vy: -2.0,
      size: oldSize,
      type: outer.type || 'normal',
      paint: player.paint,
      cooldown: 0.32,
      armedToExplode: outer.type === 'explosive'
    });

    player.size = newSize;
    player.c += 0.5;

    let targetR = player.r + 0.95;
    const solids = getSolidRects();
    for (const [sx, sy, sw, sh] of solids) {
      if (overlaps(player.c, targetR, newSize, newSize, sx, sy, sw, sh)) {
        targetR = sy - newSize;
      }
    }
    player.r = Math.max(player.r, targetR);

    player.vy = JUMP_VY[newSize];
    player.onGround = false;
    player.scaleX = 0.8;
    player.scaleY = 1.24;

    window.sound.shedShell(oldSize);
    spawnParticles(player.c + newSize / 2, player.r, COLORS.coralBody, 8, 5);
    syncHud();
    return true;
  }

  function update(dt) {
    globalTime += dt;
    if (mode !== 'play') return;

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.c += p.vx * dt;
      p.r += p.vy * dt;
      p.vy -= GRAVITY * 0.5 * dt;
      p.life -= dt;
      if (p.life <= 0) particles.splice(i, 1);
    }

    if (player.dead) {
      deathTimer -= dt;
      if (deathTimer <= 0) loadLevel(currentLevelIdx);
      return;
    }

    if (player.won) {
      winTimer -= dt;
      player.c += (portal.c + 2 - player.size / 2 - player.c) * 10 * dt;
      player.r += (portal.r + 2 - player.size / 2 - player.r) * 10 * dt;
      player.scaleX *= 0.92;
      player.scaleY *= 0.92;
      if (winTimer <= 0) {
        completedLevels.add(currentLevelIdx);
        if (currentLevelIdx + 1 < window.LEVELS.length) {
          loadLevel(currentLevelIdx + 1);
        } else {
          mode = 'level_select';
        }
      }
      return;
    }

    player.scaleX += (1 - player.scaleX) * Math.min(1, 14 * dt);
    player.scaleY += (1 - player.scaleY) * Math.min(1, 14 * dt);

    const moveLeft = keys.left || touchInput.left;
    const moveRight = keys.right || touchInput.right;
    const spd = MOVE_SPEED[player.size] || 14.0;

    if (moveLeft && !moveRight) {
      player.vx = -spd;
      player.facing = -1;
    } else if (moveRight && !moveLeft) {
      player.vx = spd;
      player.facing = 1;
    } else {
      player.vx = 0;
    }

    if (player.onGround) {
      player.coyoteTimer = 0.09;
    } else {
      player.coyoteTimer = Math.max(0, player.coyoteTimer - dt);
    }

    if (jumpJustPressed) {
      if (player.onGround || player.coyoteTimer > 0) {
        player.vy = JUMP_VY[player.size];
        player.onGround = false;
        player.coyoteTimer = 0;
        player.scaleX = 0.84;
        player.scaleY = 1.18;
        window.sound.jump(player.size);
        syncHud();
      } else {
        performDoubleJump();
      }
      jumpJustPressed = false;
    }

    player.vy = Math.max(-MAX_FALL_SPEED, player.vy - GRAVITY * dt);

    // Move Player X
    player.c += player.vx * dt;
    let solids = getSolidRects();
    for (const [sx, sy, sw, sh, wb] of solids) {
      if (overlaps(player.c, player.r, player.size, player.size, sx, sy, sw, sh)) {
        const stepUp = (sy + sh) - player.r;
        if (stepUp > 0 && stepUp <= 0.32 && player.vy <= 0) {
          let canStep = true;
          for (const [ox, oy, ow, oh] of solids) {
            if (overlaps(player.c, sy + sh, player.size, player.size, ox, oy, ow, oh)) {
              canStep = false;
              break;
            }
          }
          if (canStep) {
            player.r = sy + sh;
            continue;
          }
        }
        if (wb) triggerWeakBlockCheck(wb, player.size);
        if (wb && wb.broken) continue;
        if (player.vx > 0) player.c = sx - player.size;
        else if (player.vx < 0) player.c = sx + sw;
      }
    }

    // Move Player Y
    const wasOnGround = player.onGround;
    player.onGround = false;
    player.r += player.vy * dt;
    solids = getSolidRects();
    for (const [sx, sy, sw, sh, wb] of solids) {
      if (overlaps(player.c, player.r, player.size, player.size, sx, sy, sw, sh)) {
        if (wb) triggerWeakBlockCheck(wb, player.size);
        if (wb && wb.broken) continue;
        if (player.vy <= 0) {
          player.r = sy + sh;
          player.vy = 0;
          player.onGround = true;
          if (!wasOnGround) {
            player.scaleX = 1.15;
            player.scaleY = 0.87;
            syncHud();
          }
        } else {
          const overlapLeft = (player.c + player.size) - sx;
          const overlapRight = (sx + sw) - player.c;
          if (overlapLeft > 0 && overlapLeft <= 0.35) {
            player.c = sx - player.size;
            continue;
          } else if (overlapRight > 0 && overlapRight <= 0.35) {
            player.c = sx + sw;
            continue;
          }
          player.r = sy - player.size;
          player.vy = 0;
        }
      }
    }

    // Update Empty Shells
    for (let i = shells.length - 1; i >= 0; i--) {
      const sh = shells[i];
      if (sh.cooldown > 0) sh.cooldown = Math.max(0, sh.cooldown - dt);

      sh.vy = Math.max(-MAX_FALL_SPEED, sh.vy - GRAVITY * dt);
      sh.r += sh.vy * dt;

      const shSolids = getSolidRects();
      let landed = false;
      for (const [sx, sy, sw, shH, wb] of shSolids) {
        if (overlaps(sh.c, sh.r, sh.size, sh.size, sx, sy, sw, shH)) {
          if (wb) triggerWeakBlockCheck(wb, sh.size);
          if (wb && wb.broken) continue;
          if (sh.vy <= 0) {
            sh.r = sy + shH;
            sh.vy = 0;
            landed = true;
          }
        }
      }

      if (landed && sh.armedToExplode) {
        window.sound.explode();
        const cx = sh.c + sh.size / 2;
        const cy = sh.r + sh.size / 2;
        const blastRadius = sh.size + 1.8;
        spawnParticles(cx, cy, COLORS.laserOrange, 24, 15);
        spawnParticles(cx, cy, COLORS.grayBody, 16, 10);

        for (const cw of crackedWalls) {
          if (!cw.destroyed && overlaps(
            cx - blastRadius, cy - blastRadius, blastRadius * 2, blastRadius * 2,
            cw.c, cw.r, cw.w, cw.h
          )) {
            cw.destroyed = true;
          }
        }
        for (const wb of weakBlocks) {
          if (!wb.broken && overlaps(
            cx - blastRadius, cy - blastRadius, blastRadius * 2, blastRadius * 2,
            wb.c, wb.r, wb.w, wb.h
          )) {
            wb.broken = true;
          }
        }
        shells.splice(i, 1);
        continue;
      }

      const canNest = sh.type === 'striped'
        ? (player.size < sh.size)
        : (player.size === sh.size - 1);

      if (canNest && sh.cooldown <= 0 && overlaps(
        player.c, player.r, player.size, player.size,
        sh.c + 0.15, sh.r + 0.1, sh.size - 0.3, sh.size - 0.15
      )) {
        let newC = sh.c;
        let newR = sh.r;
        const checkSolids = getSolidRects();
        for (const [sx, sy, sw, shH, wb] of checkSolids) {
          if (wb && wb.broken) continue;
          if (overlaps(newC, newR, sh.size, sh.size, sx, sy, sw, shH)) {
            if (newC + sh.size > sx && newC < sx) newC = sx - sh.size;
            else if (newC < sx + sw && newC + sh.size > sx + sw) newC = sx + sw;
          }
        }

        while (player.shellStack.length < sh.size - 1) {
          const nextLayerSize = player.shellStack.length + 2;
          player.shellStack.push({
            size: nextLayerSize,
            type: nextLayerSize === sh.size ? sh.type : 'normal',
            paint: sh.paint
          });
        }
        player.size = sh.size;
        player.c = newC;
        player.r = newR;
        player.scaleX = 1.18;
        player.scaleY = 0.85;
        window.sound.nestShell(sh.size);
        shells.splice(i, 1);
        syncHud();
      }
    }

    // Update Runners
    for (const ru of runners) {
      if (!ru.alive) continue;
      ru.c += ru.vx * dt;
      if (ru.c <= ru.minC) {
        ru.c = ru.minC;
        ru.vx = Math.abs(ru.vx);
      } else if (ru.c + ru.size >= ru.maxC) {
        ru.c = ru.maxC - ru.size;
        ru.vx = -Math.abs(ru.vx);
      }

      if (overlaps(player.c, player.r, player.size, player.size, ru.c, ru.r, ru.size, ru.size)) {
        if (player.size > ru.size) {
          ru.alive = false;
          window.sound.breakBlock();
          spawnParticles(ru.c + ru.size / 2, ru.r + ru.size / 2, COLORS.coralBody, 14, 10);
        } else {
          killPlayer();
          return;
        }
      }
    }

    // Paint Gates
    for (const g of paintGates) {
      if (overlaps(player.c, player.r, player.size, player.size, g.c, g.r, g.w, g.h)) {
        if (player.paint !== g.color) {
          player.paint = g.color;
          window.sound.paint(g.color);
          spawnParticles(
            player.c + player.size / 2,
            player.r + player.size / 2,
            g.color === 'blue' ? COLORS.blueBody : COLORS.coralBody,
            10,
            6
          );
          syncHud();
        }
      }
    }

    // Grow / Shrink Orbs
    if (player.paint !== 'blue') {
      for (const o of orbs) {
        if (o.collected) continue;
        if (overlaps(player.c, player.r, player.size, player.size, o.c - 0.7, o.r - 0.7, 1.4, 1.4)) {
          o.collected = true;
          if (o.type === 'grow') {
            if (player.size >= 4) {
              killPlayer();
              return;
            }
            const nextSize = player.size + 1;
            player.shellStack.push({ size: nextSize, type: 'normal', paint: 'red' });
            player.size = nextSize;
            player.scaleX = 1.2;
            player.scaleY = 0.85;
            window.sound.orbGrow();
            spawnParticles(o.c, o.r, COLORS.orbGrow, 12, 7);
            syncHud();
          } else if (o.type === 'shrink') {
            if (player.size <= 1) {
              killPlayer();
              return;
            }
            player.shellStack.pop();
            player.size -= 1;
            player.scaleX = 0.82;
            player.scaleY = 1.2;
            window.sound.orbShrink();
            spawnParticles(o.c, o.r, COLORS.orbShrink, 12, 7);
            syncHud();
          }
        }
      }
    }

    // Buttons & Lasers
    for (const b of buttons) {
      const wasPressed = b.pressed;
      b.pressed = false;
      if (overlaps(player.c, player.r, player.size, player.size, b.c, b.r, b.w, b.h + 0.2)) {
        b.pressed = true;
      }
      if (!b.pressed) {
        for (const sh of shells) {
          if (overlaps(sh.c, sh.r, sh.size, sh.size, b.c, b.r, b.w, b.h + 0.2)) {
            b.pressed = true;
            break;
          }
        }
      }
      if (!b.pressed) {
        for (const ru of runners) {
          if (ru.alive && overlaps(ru.c, ru.r, ru.size, ru.size, b.c, b.r, b.w, b.h + 0.2)) {
            b.pressed = true;
            break;
          }
        }
      }
      if (b.pressed && !wasPressed) window.sound.buttonPress();
      else if (!b.pressed && wasPressed) window.sound.buttonRelease();
    }

    for (const l of lasers) {
      const anyButtonPressed = buttons.some(b => b.id === l.id && b.pressed);
      l.active = !anyButtonPressed;
      if (l.active && overlaps(
        player.c + 0.1, player.r + 0.1, player.size - 0.2, player.size - 0.2,
        l.c + 0.2, l.r, l.w - 0.4, l.h
      )) {
        killPlayer();
        return;
      }
    }

    // Weight Meters
    for (const wm of weightMeters) {
      let totalW = 0;
      if (overlaps(player.c, player.r - 0.1, player.size, player.size + 0.2, wm.c, wm.r, wm.w, wm.h + 0.3)) {
        totalW += player.size * player.size;
      }
      for (const sh of shells) {
        if (overlaps(sh.c, sh.r - 0.1, sh.size, sh.size + 0.2, wm.c, wm.r, wm.w, wm.h + 0.3)) {
          totalW += 2 * sh.size - 1;
        }
      }
      wm.currentWeight = totalW;
      if (totalW === wm.targetWeight && !wm.doorOpen) {
        wm.doorOpen = true;
        window.sound.buttonPress();
      }
    }

    // Spikes
    for (const sp of spikes) {
      if (overlaps(
        player.c + 0.18, player.r + 0.1, player.size - 0.36, player.size - 0.2,
        sp.c + 0.1, sp.r, sp.w - 0.2, sp.h * 0.75
      )) {
        killPlayer();
        return;
      }
    }

    // Portal Victory
    if (overlaps(
      player.c + 0.2, player.r + 0.2, player.size - 0.4, player.size - 0.4,
      portal.c + 0.3, portal.r + 0.3, portal.w - 0.6, portal.h - 0.6
    )) {
      player.won = true;
      winTimer = 0.42;
      window.sound.win();
      spawnParticles(portal.c + 2, portal.r + 2, COLORS.portalAccent, 22, 11);
    }
  }

  // =========================================================================
  // MINIMALIST GEOMETRIC RENDERER
  // =========================================================================
  function drawRoundedRect(x, y, w, h, r) {
    const rad = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rad, y);
    ctx.lineTo(x + w - rad, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + rad);
    ctx.lineTo(x + w, y + h - rad);
    ctx.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
    ctx.lineTo(x + rad, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - rad);
    ctx.lineTo(x, y + rad);
    ctx.quadraticCurveTo(x, y, x + rad, y);
    ctx.closePath();
  }

  function drawPortal(p) {
    const x = colToX(p.c);
    const y = rowToY(p.r, p.h);
    const w = p.w * TILE;
    const h = p.h * TILE;

    ctx.save();
    drawRoundedRect(x, y, w, h, 8);
    ctx.fillStyle = COLORS.portalBg;
    ctx.fill();
    ctx.clip();

    const cx = x + w / 2;
    const cy = y + h / 2;
    const maxR = w * 0.85;
    const pulse = (globalTime * 10) % 7;

    // Minimalist rotating/nested geometric diamond rings
    for (let rad = 3 + pulse; rad <= maxR; rad += 7) {
      ctx.strokeStyle = (Math.floor(rad / 7) % 2 === 0) ? COLORS.portalAccent : COLORS.portalCoral;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy - rad);
      ctx.lineTo(cx + rad, cy);
      ctx.lineTo(cx, cy + rad);
      ctx.lineTo(cx - rad, cy);
      ctx.closePath();
      ctx.stroke();
    }

    // Center glowing core dot
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function drawEmptyShell(sh) {
    const x = colToX(sh.c);
    const y = rowToY(sh.r, sh.size);
    const w = sh.size * TILE;
    const h = sh.size * TILE;

    const armW = 0.44 * TILE;
    const baseH = 0.94 * TILE;

    let mainColor = COLORS.coralBody;
    let shadeColor = COLORS.coralShade;
    if (sh.type === 'explosive') {
      mainColor = COLORS.grayBody;
      shadeColor = COLORS.grayShade;
    } else if (sh.paint === 'blue') {
      mainColor = COLORS.blueBody;
      shadeColor = COLORS.blueShade;
    }

    ctx.save();
    const rOuter = 6;
    const rTip = 3;
    ctx.beginPath();
    ctx.moveTo(x, y + rTip);
    ctx.quadraticCurveTo(x, y, x + rTip, y);
    ctx.lineTo(x + armW - rTip, y);
    ctx.quadraticCurveTo(x + armW, y, x + armW, y + rTip);
    ctx.lineTo(x + armW, y + h - baseH);
    ctx.lineTo(x + w - armW, y + h - baseH);
    ctx.lineTo(x + w - armW, y + rTip);
    ctx.quadraticCurveTo(x + w - armW, y, x + w - armW + rTip, y);
    ctx.lineTo(x + w - rTip, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + rTip);
    ctx.lineTo(x + w, y + h - rOuter);
    ctx.quadraticCurveTo(x + w, y + h, x + w - rOuter, y + h);
    ctx.lineTo(x + rOuter, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - rOuter);
    ctx.closePath();

    ctx.fillStyle = mainColor;
    ctx.fill();
    ctx.clip();

    // Minimalist base shadow bar
    ctx.fillStyle = shadeColor;
    ctx.fillRect(x, y + h - 4, w, 4);

    if (sh.type === 'striped') {
      ctx.fillStyle = COLORS.stripeGold;
      for (let sy = y + 5; sy < y + h - 5; sy += 8) {
        ctx.fillRect(x, sy, w, 2.5);
      }
    }

    ctx.restore();
  }

  function drawPlayer(p) {
    if (p.dead) return;
    const rawW = p.size * TILE;
    const rawH = p.size * TILE;
    const cx = colToX(p.c) + rawW / 2;
    const bottomY = rowToY(p.r, 0);

    const w = rawW * p.scaleX;
    const h = rawH * p.scaleY;
    const x = cx - w / 2;
    const y = bottomY - h;

    const topShell = p.shellStack.length > 0 ? p.shellStack[p.shellStack.length - 1] : null;
    let bodyColor = COLORS.coralBody;
    let shadeColor = COLORS.coralShade;
    if (topShell && topShell.type === 'explosive') {
      bodyColor = COLORS.grayBody;
      shadeColor = COLORS.grayShade;
    } else if (p.paint === 'blue') {
      bodyColor = COLORS.blueBody;
      shadeColor = COLORS.blueShade;
    }

    ctx.save();
    drawRoundedRect(x, y, w, h, p.size === 1 ? 3.5 : 6);
    ctx.fillStyle = bodyColor;
    ctx.fill();
    ctx.clip();

    // Base shadow lip
    ctx.fillStyle = shadeColor;
    ctx.fillRect(x, y + h - 3.5, w, 3.5);

    // Minimalist nested layer lines
    if (p.size >= 2) {
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.16)';
      ctx.lineWidth = 1.6;
      for (let s = 2; s <= p.size; s++) {
        const frac = (s - 1) / p.size;
        const innerW = w * frac;
        const innerH = h * frac;
        ctx.strokeRect(cx - innerW / 2, y - 2, innerW, innerH + 2);
      }
    }

    // Minimalist geometric pill eyes with periodic blink
    const isBlinking = (globalTime % 4.2) > 4.06;
    const eyeY = y + h * (p.size === 1 ? 0.44 : 0.62);
    const eyeSpacing = Math.max(3.2, Math.min(6.2, TILE * 0.24 * (1 + (p.size - 1) * 0.18)));
    const eyeR = Math.max(2.2, Math.min(3.8, TILE * 0.17 * (1 + (p.size - 1) * 0.14)));
    const lookOffset = p.vx !== 0 ? Math.sign(p.vx) * 1.2 : p.facing * 0.4;

    ctx.fillStyle = '#ffffff';
    if (isBlinking) {
      ctx.fillRect(cx - eyeSpacing - eyeR + lookOffset, eyeY - 0.8, eyeR * 2, 1.6);
      ctx.fillRect(cx + eyeSpacing - eyeR + lookOffset, eyeY - 0.8, eyeR * 2, 1.6);
    } else {
      ctx.beginPath();
      ctx.arc(cx - eyeSpacing + lookOffset, eyeY, eyeR, 0, Math.PI * 2);
      ctx.arc(cx + eyeSpacing + lookOffset, eyeY, eyeR, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#14161d';
      ctx.beginPath();
      ctx.arc(cx - eyeSpacing + lookOffset * 1.4, eyeY, eyeR * 0.5, 0, Math.PI * 2);
      ctx.arc(cx + eyeSpacing + lookOffset * 1.4, eyeY, eyeR * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  function drawSpikes() {
    ctx.fillStyle = COLORS.spike;
    for (const sp of spikes) {
      for (let i = 0; i < sp.w; i++) {
        const x = colToX(sp.c + i);
        const y = rowToY(sp.r, 1);
        ctx.beginPath();
        ctx.moveTo(x + 1.5, y + TILE);
        ctx.lineTo(x + TILE / 2, y + 2.5);
        ctx.lineTo(x + TILE - 1.5, y + TILE);
        ctx.closePath();
        ctx.fill();
      }
    }
  }

  function drawButtonsAndLasers() {
    for (const b of buttons) {
      const x = colToX(b.c);
      const baseY = rowToY(b.r, 0);
      const w = b.w * TILE;
      const domeH = (b.pressed ? 0.2 : 0.48) * TILE;

      ctx.fillStyle = COLORS.buttonGreen;
      drawRoundedRect(x + 2, baseY - domeH, w - 4, domeH, 4);
      ctx.fill();
    }

    for (const l of lasers) {
      const cx = colToX(l.c + l.w / 2);
      const topY = rowToY(l.r, l.h);
      const botY = rowToY(l.r, 0);

      ctx.fillStyle = COLORS.wallFill;
      ctx.fillRect(cx - 5, topY, 10, 4);
      ctx.fillRect(cx - 5, botY - 4, 10, 4);

      if (l.active) {
        ctx.save();
        ctx.strokeStyle = COLORS.laserOrange;
        ctx.lineWidth = 4.5 + Math.sin(globalTime * 18) * 1.0;
        ctx.beginPath();
        ctx.moveTo(cx, topY + 3);
        ctx.lineTo(cx, botY - 3);
        ctx.stroke();

        ctx.strokeStyle = COLORS.laserCore;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(cx, topY + 3);
        ctx.lineTo(cx, botY - 3);
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  function drawWeakBlocks() {
    for (const wb of weakBlocks) {
      if (wb.broken) continue;
      const x = colToX(wb.c);
      const y = rowToY(wb.r, wb.h);
      const w = wb.w * TILE;
      const h = wb.h * TILE;

      drawRoundedRect(x + 1.5, y + 1.5, w - 3, h - 3, 3);
      ctx.fillStyle = 'rgba(139, 92, 246, 0.16)';
      ctx.fill();
      ctx.strokeStyle = COLORS.weakPurple;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  function drawOrbs() {
    for (const o of orbs) {
      if (o.collected) continue;
      const cx = colToX(o.c + 0.5);
      const cy = rowToY(o.r + 0.5, 0) + Math.sin(globalTime * 4 + o.c) * 2.5;
      const rad = TILE * 0.58;

      ctx.fillStyle = o.type === 'grow' ? COLORS.orbGrow : COLORS.orbShrink;
      ctx.beginPath();
      ctx.arc(cx, cy, rad, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(cx - rad * 0.45, cy);
      ctx.lineTo(cx + rad * 0.45, cy);
      if (o.type === 'grow') {
        ctx.moveTo(cx, cy - rad * 0.45);
        ctx.lineTo(cx, cy + rad * 0.45);
      }
      ctx.stroke();
    }
  }

  function drawPaintGates() {
    for (const g of paintGates) {
      const x = colToX(g.c);
      const y = rowToY(g.r, g.h);
      const w = g.w * TILE;
      const h = g.h * TILE;
      const col = g.color === 'blue' ? COLORS.blueBody : COLORS.coralBody;

      ctx.save();
      ctx.fillStyle = g.color === 'blue' ? 'rgba(0, 180, 216, 0.2)' : 'rgba(255, 90, 95, 0.2)';
      ctx.fillRect(x, y, w, h);

      ctx.fillStyle = col;
      for (let i = 0; i < 6; i++) {
        const py = y + ((globalTime * 35 + i * (h / 6)) % h);
        const px = x + w * (0.25 + 0.5 * ((i * 7) % 3) / 2);
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  function drawRunnersAndWeights() {
    for (const ru of runners) {
      if (!ru.alive) continue;
      const x = colToX(ru.c);
      const y = rowToY(ru.r, ru.size);
      const w = ru.size * TILE;
      const h = ru.size * TILE;

      ctx.save();
      drawRoundedRect(x, y, w, h, 5);
      ctx.fillStyle = '#e11d48';
      ctx.fill();

      const cx = x + w / 2;
      const eyeY = y + h * 0.46;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx - 4.5, eyeY, 2.8, 0, Math.PI * 2);
      ctx.arc(cx + 4.5, eyeY, 2.8, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#14161d';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 8, eyeY - 4);
      ctx.lineTo(cx - 1.5, eyeY - 1.5);
      ctx.moveTo(cx + 8, eyeY - 4);
      ctx.lineTo(cx + 1.5, eyeY - 1.5);
      ctx.stroke();
      ctx.restore();
    }

    for (const wm of weightMeters) {
      const x = colToX(wm.c);
      const y = rowToY(wm.r, 0);
      const w = wm.w * TILE;

      drawRoundedRect(x, y - 4, w, 15, 4);
      ctx.fillStyle = COLORS.weightOrange;
      ctx.fill();

      ctx.fillStyle = '#14161d';
      ctx.font = '800 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${wm.currentWeight}/${wm.targetWeight}`, x + w / 2, y + 6.5);

      if (wm.doorRect && !wm.doorOpen) {
        const [dc, dr, dw, dh] = wm.doorRect;
        const dx = colToX(dc);
        const dy = rowToY(dr, dh);
        const dWidth = dw * TILE;
        const dHeight = dh * TILE;

        drawRoundedRect(dx, dy, dWidth, dHeight, 5);
        ctx.fillStyle = COLORS.weightOrange;
        ctx.fill();

        ctx.fillStyle = '#14161d';
        ctx.font = '800 15px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(wm.targetWeight), dx + dWidth / 2, dy + dHeight / 2);
      }
    }

    for (const cw of crackedWalls) {
      if (cw.destroyed) continue;
      const x = colToX(cw.c);
      const y = rowToY(cw.r, cw.h);
      const w = cw.w * TILE;
      const h = cw.h * TILE;

      drawRoundedRect(x, y, w, h, 4);
      ctx.fillStyle = '#33384a';
      ctx.fill();

      ctx.strokeStyle = COLORS.coralBody;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(x + w * 0.25, y);
      ctx.lineTo(x + w * 0.48, y + h * 0.5);
      ctx.lineTo(x + w * 0.32, y + h);
      ctx.moveTo(x + w * 0.72, y);
      ctx.lineTo(x + w * 0.55, y + h * 0.6);
      ctx.lineTo(x + w * 0.78, y + h);
      ctx.stroke();
    }
  }

  function drawTutorialHelpers() {
    for (const a of arrows) {
      const x = colToX(a.c);
      const y = rowToY(a.r, 0);
      ctx.save();
      ctx.strokeStyle = 'rgba(27, 30, 40, 0.32)';
      ctx.lineWidth = 2.2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(x - 28, y + 24);
      ctx.quadraticCurveTo(x, y - 16, x + 18, y + 4);
      ctx.quadraticCurveTo(x + 36, y - 34, x + 64, y - 18);
      ctx.stroke();
      ctx.restore();
    }

    for (const t of tutorialText) {
      const x = colToX(t.c);
      const y = rowToY(t.r, 0);
      ctx.save();
      ctx.fillStyle = 'rgba(27, 30, 40, 0.65)';
      ctx.font = '600 13px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(t.text, x, y);
      ctx.restore();
    }
  }

  function drawHintOverlay() {
    if (!showHint) return;
    const def = window.LEVELS[currentLevelIdx];
    ctx.save();

    if (def.hintPath && def.hintPath.length > 1) {
      ctx.strokeStyle = COLORS.coralBody;
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 5]);
      ctx.beginPath();
      def.hintPath.forEach(([hc, hr], idx) => {
        const px = colToX(hc + 0.5);
        const py = rowToY(hr + 0.5, 0);
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();
      ctx.setLineDash([]);

      def.hintPath.forEach(([hc, hr], idx) => {
        const px = colToX(hc + 0.5);
        const py = rowToY(hr + 0.5, 0);
        ctx.fillStyle = COLORS.wallFill;
        ctx.beginPath();
        ctx.arc(px, py, 9.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = COLORS.coralBody;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = '700 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(idx + 1), px, py);
      });
    }

    // Minimalist translucent hint toast at bottom of playfield
    const bw = Math.min(820, W - 60);
    const bh = 42;
    const bx = (W - bw) / 2;
    const by = H - bh - 12;
    drawRoundedRect(bx, by, bw, bh, 10);
    ctx.fillStyle = 'rgba(20, 22, 29, 0.92)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#f3f1ec';
    ctx.font = '500 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(def.hintText || '', W / 2, by + bh / 2, bw - 28);

    ctx.restore();
  }

  function getLevelSelectGridMetrics() {
    const cols = 6;
    const btnW = 116;
    const btnH = 76;
    const gapX = 18;
    const gapY = 18;
    const totalW = cols * btnW + (cols - 1) * gapX;
    const startX = (W - totalW) / 2;
    const startY = 135;
    return { cols, btnW, btnH, gapX, gapY, startX, startY };
  }

  function drawLevelSelectScreen() {
    ctx.fillStyle = COLORS.wallFill;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = '#f3f1ec';
    ctx.font = '800 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SELECT LEVEL', W / 2, 68);

    ctx.fillStyle = '#8b92a5';
    ctx.font = '500 13px sans-serif';
    ctx.fillText('Tap any level to play', W / 2, 96);

    const { cols, btnW, btnH, gapX, gapY, startX, startY } = getLevelSelectGridMetrics();

    window.LEVELS.forEach((lvl, idx) => {
      const c = idx % cols;
      const r = Math.floor(idx / cols);
      const bx = startX + c * (btnW + gapX);
      const by = startY + r * (btnH + gapY);

      const isCurrent = idx === currentLevelIdx;
      const isDone = completedLevels.has(idx);
      const isHover = mouseX >= bx && mouseX <= bx + btnW && mouseY >= by && mouseY <= by + btnH;

      drawRoundedRect(bx, by, btnW, btnH, 12);
      if (isCurrent) {
        ctx.fillStyle = COLORS.coralBody;
      } else if (isDone) {
        ctx.fillStyle = '#252936';
      } else {
        ctx.fillStyle = isHover ? '#2a2f3f' : '#212531';
      }
      ctx.fill();

      ctx.strokeStyle = isCurrent ? '#ffffff' : 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = isCurrent ? 2 : 1;
      ctx.stroke();

      ctx.fillStyle = '#f3f1ec';
      ctx.font = '800 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(idx + 1).padStart(2, '0'), bx + btnW / 2, by + btnH / 2 - 8);

      ctx.font = '500 10.5px sans-serif';
      ctx.fillStyle = isCurrent ? 'rgba(255, 255, 255, 0.9)' : '#8b92a5';
      const shortName = lvl.name.replace(/^Level \d+:\s*/, '');
      ctx.fillText(shortName, bx + btnW / 2, by + btnH - 16, btnW - 14);
    });
  }

  function render() {
    if (mode === 'level_select') {
      drawLevelSelectScreen();
      return;
    }

    // 1. Matte dark architectural background
    ctx.fillStyle = COLORS.wallFill;
    ctx.fillRect(0, 0, W, H);

    // 2. Seamless warm minimalist ivory playfield + solid wall blocks
    ctx.fillStyle = COLORS.bgInterior;
    ctx.fillRect(X0, rowToY(ROWS, 0), COLS * TILE, ROWS * TILE);

    ctx.fillStyle = COLORS.wallFill;
    for (let r = 0; r < ROWS; r++) {
      const y = Math.floor(rowToY(r, 1));
      const h = Math.ceil(rowToY(r, 0)) - y;
      let runStart = -1;
      for (let c = 0; c <= COLS; c++) {
        const solid = (c < COLS) && solidGrid[r][c];
        if (solid && runStart === -1) {
          runStart = c;
        } else if (!solid && runStart !== -1) {
          const rx = Math.floor(colToX(runStart));
          const rw = Math.ceil(colToX(c)) - rx;
          ctx.fillRect(rx, y, rw, h);
          runStart = -1;
        }
      }
    }

    // 3. Subtle minimalist geometric grid dots inside open air
    ctx.fillStyle = COLORS.bgGridDot;
    for (let r = 1; r < ROWS; r += 2) {
      for (let c = 1; c < COLS; c += 2) {
        if (!solidGrid[r][c] && !solidGrid[r - 1][c] && !solidGrid[r][c - 1]) {
          ctx.fillRect(colToX(c) - 1, rowToY(r, 0) - 1, 2, 2);
        }
      }
    }

    // 4. Crisp architectural contour lines along solid wall edges
    ctx.strokeStyle = COLORS.wallEdge;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (solidGrid[r][c]) continue;
        const x = colToX(c);
        const y = rowToY(r, 1);

        if (isCellSolid(c - 1, r)) {
          ctx.moveTo(x, y);
          ctx.lineTo(x, y + TILE);
        }
        if (isCellSolid(c + 1, r)) {
          ctx.moveTo(x + TILE, y);
          ctx.lineTo(x + TILE, y + TILE);
        }
        if (isCellSolid(c, r - 1)) {
          ctx.moveTo(x, y + TILE);
          ctx.lineTo(x + TILE, y + TILE);
        }
        if (isCellSolid(c, r + 1)) {
          ctx.moveTo(x, y);
          ctx.lineTo(x + TILE, y);
        }
      }
    }
    ctx.stroke();

    // 5. Entities
    drawTutorialHelpers();
    drawWeakBlocks();
    drawButtonsAndLasers();
    drawPaintGates();
    drawOrbs();
    drawRunnersAndWeights();
    drawSpikes();
    drawPortal(portal);

    for (const sh of shells) {
      drawEmptyShell(sh);
    }

    drawPlayer(player);

    for (const p of particles) {
      const px = colToX(p.c);
      const py = rowToY(p.r, 0);
      const sz = p.size * TILE * (p.life / p.maxLife);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(px, py, sz / 2, 0, Math.PI * 2);
      ctx.fill();
    }

    drawHintOverlay();
  }

  // =========================================================================
  // KEYBOARD, HUD & MOBILE MULTI-TOUCH CONTROLS
  // =========================================================================
  window.addEventListener('keydown', (e) => {
    const code = e.code;
    if (code === 'ArrowLeft' || code === 'KeyA') {
      keys.left = true;
    } else if (code === 'ArrowRight' || code === 'KeyD') {
      keys.right = true;
    } else if (code === 'ArrowUp' || code === 'KeyW' || code === 'Space') {
      e.preventDefault();
      if (!keys.up) jumpJustPressed = true;
      keys.up = true;
      window.sound.init();
    } else if (code === 'KeyR') {
      mode = 'play';
      loadLevel(currentLevelIdx);
    } else if (code === 'Escape' || code === 'KeyB') {
      mode = (mode === 'play') ? 'level_select' : 'play';
    } else if (code === 'KeyH') {
      showHint = !showHint;
      syncHud();
    } else if (code === 'KeyM') {
      const muted = window.sound.toggleMute();
      if (iconSoundOn) iconSoundOn.classList.toggle('hidden', muted);
      if (iconSoundOff) iconSoundOff.classList.toggle('hidden', !muted);
    } else if (code === 'BracketLeft') {
      mode = 'play';
      loadLevel(currentLevelIdx - 1);
    } else if (code === 'BracketRight') {
      mode = 'play';
      loadLevel(currentLevelIdx + 1);
    }
  });

  window.addEventListener('keyup', (e) => {
    const code = e.code;
    if (code === 'ArrowLeft' || code === 'KeyA') keys.left = false;
    else if (code === 'ArrowRight' || code === 'KeyD') keys.right = false;
    else if (code === 'ArrowUp' || code === 'KeyW' || code === 'Space') keys.up = false;
  });

  // Top Minimalist HUD buttons
  if (btnLevels) {
    btnLevels.addEventListener('click', () => {
      window.sound.init();
      mode = (mode === 'play') ? 'level_select' : 'play';
    });
  }
  if (btnRestart) {
    btnRestart.addEventListener('click', () => {
      window.sound.init();
      mode = 'play';
      loadLevel(currentLevelIdx);
    });
  }
  if (btnMute) {
    btnMute.addEventListener('click', () => {
      const muted = window.sound.toggleMute();
      if (iconSoundOn) iconSoundOn.classList.toggle('hidden', muted);
      if (iconSoundOff) iconSoundOff.classList.toggle('hidden', !muted);
    });
  }
  if (btnHint) {
    btnHint.addEventListener('click', () => {
      window.sound.init();
      showHint = !showHint;
      syncHud();
    });
  }
  if (btnSkip) {
    btnSkip.addEventListener('click', () => {
      window.sound.init();
      completedLevels.add(currentLevelIdx);
      mode = 'play';
      loadLevel(currentLevelIdx + 1);
    });
  }

  // Mobile Touch Controls (Multi-touch D-Pad with slide support + Jump/Shed button)
  const btnTouchLeft = document.getElementById('touch-left');
  const btnTouchRight = document.getElementById('touch-right');
  const btnTouchJump = document.getElementById('touch-jump');
  const dpadZone = document.getElementById('dpad-zone');

  function updateDpadFromTouches(e) {
    e.preventDefault();
    window.sound.init();
    let leftActive = false;
    let rightActive = false;

    const leftRect = btnTouchLeft.getBoundingClientRect();
    const rightRect = btnTouchRight.getBoundingClientRect();

    for (let i = 0; i < e.touches.length; i++) {
      const t = e.touches[i];
      if (t.clientX >= leftRect.left - 12 && t.clientX <= leftRect.right + 6 &&
          t.clientY >= leftRect.top - 16 && t.clientY <= leftRect.bottom + 16) {
        leftActive = true;
      }
      if (t.clientX >= rightRect.left - 6 && t.clientX <= rightRect.right + 12 &&
          t.clientY >= rightRect.top - 16 && t.clientY <= rightRect.bottom + 16) {
        rightActive = true;
      }
    }

    touchInput.left = leftActive;
    touchInput.right = rightActive;
    btnTouchLeft.classList.toggle('pressed', leftActive);
    btnTouchRight.classList.toggle('pressed', rightActive);
  }

  if (dpadZone) {
    dpadZone.addEventListener('touchstart', updateDpadFromTouches, { passive: false });
    dpadZone.addEventListener('touchmove', updateDpadFromTouches, { passive: false });
    dpadZone.addEventListener('touchend', updateDpadFromTouches, { passive: false });
    dpadZone.addEventListener('touchcancel', updateDpadFromTouches, { passive: false });
  }

  // Pointer fallback for desktop clicking on on-screen buttons
  if (btnTouchLeft) {
    btnTouchLeft.addEventListener('mousedown', () => {
      window.sound.init();
      touchInput.left = true;
      btnTouchLeft.classList.add('pressed');
    });
    window.addEventListener('mouseup', () => {
      touchInput.left = false;
      touchInput.right = false;
      btnTouchLeft.classList.remove('pressed');
      if (btnTouchRight) btnTouchRight.classList.remove('pressed');
    });
  }
  if (btnTouchRight) {
    btnTouchRight.addEventListener('mousedown', () => {
      window.sound.init();
      touchInput.right = true;
      btnTouchRight.classList.add('pressed');
    });
  }

  if (btnTouchJump) {
    btnTouchJump.addEventListener('touchstart', (e) => {
      e.preventDefault();
      window.sound.init();
      jumpJustPressed = true;
      btnTouchJump.classList.add('pressed');
    }, { passive: false });
    btnTouchJump.addEventListener('touchend', (e) => {
      e.preventDefault();
      btnTouchJump.classList.remove('pressed');
    }, { passive: false });
    btnTouchJump.addEventListener('mousedown', () => {
      window.sound.init();
      jumpJustPressed = true;
    });
  }

  // Canvas pointer/touch for Level Select Grid
  function getCanvasPos(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left) * (W / rect.width),
      y: (clientY - rect.top) * (H / rect.height)
    };
  }

  function handleCanvasTap(clientX, clientY) {
    window.sound.init();
    const { x, y } = getCanvasPos(clientX, clientY);
    if (mode === 'level_select') {
      const { cols, btnW, btnH, gapX, gapY, startX, startY } = getLevelSelectGridMetrics();
      window.LEVELS.forEach((_, idx) => {
        const c = idx % cols;
        const r = Math.floor(idx / cols);
        const bx = startX + c * (btnW + gapX);
        const by = startY + r * (btnH + gapY);
        if (x >= bx && x <= bx + btnW && y >= by && y <= by + btnH) {
          mode = 'play';
          loadLevel(idx);
        }
      });
    }
  }

  canvas.addEventListener('mousemove', (e) => {
    const pos = getCanvasPos(e.clientX, e.clientY);
    mouseX = pos.x;
    mouseY = pos.y;
  });

  canvas.addEventListener('mousedown', (e) => {
    handleCanvasTap(e.clientX, e.clientY);
  });

  canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length > 0) {
      e.preventDefault();
      handleCanvasTap(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: false });

  // Main loop
  let lastTime = null;
  function loop(now) {
    if (lastTime === null) lastTime = now;
    const dt = Math.max(0, Math.min(0.033, (now - lastTime) / 1000));
    lastTime = now;
    update(dt);
    render();
    requestAnimationFrame(loop);
  }

  loadLevel(currentLevelIdx);
  window.__game = {
    getState: () => ({ currentLevelIdx, mode, showHint, player, portal, shells, buttons, lasers, weakBlocks, orbs, paintGates, runners, weightMeters, crackedWalls }),
    loadLevel,
    update,
    render
  };
  requestAnimationFrame(loop);
})();
