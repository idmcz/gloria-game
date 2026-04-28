// ─────────────────────────────────────────────────────────────────────────────
// game.js — Gloria's Loop Adventure
//
// LEVEL MAP:
//   Level 0 "The Test Run"      — tutorial, no limits. Do J→M→J→M to advance.
//   Level 1 "Walk It Out"       — walk 5 steps to the exit portal. 1 move block.
//   Level 2 "The Grid Pt.1"     — 3 rows of 4 bananas, alternating direction.
//                                 Row 1: left→right, Row 2: right→left, Row 3: left→right.
//                                 Use "Move to Next Row" to drop between rows.
//                                 Exit portal is at end of Row 3 (right side).
//   Level 3 "Mixed Obstacles"   — bananas (jump), puddles (duck), boxes (kick).
//   Level 4 "Mixed Obstacles"   — bananas (jump), puddles (duck), boxes (kick).
//   Level 5 "The Gauntlet"      — 3 rows, each: 2 bananas → 2 spiders → 2 bananas. Jump+Kick+Jump pattern.
//   Level 6 "Helicopter Rescue" — climb 5 staircase steps using only Jump.
// ─────────────────────────────────────────────────────────────────────────────

window.CURRENT_LEVEL = 0;
window.MOVE_LIMITS   = { move: 999, jump: 999, duck: 999, kick: 999, nextrow: 999 };

// ── Aspect-ratio-correct sizes for each asset ─────────────────────────────────
// Gloria: 512×900  → ratio 0.569  → at H=70: W=40
// Exit:   1536×1024 → ratio 1.5   → at H=60: W=90
// Banana: 1536×1024 → ratio 1.5   → at H=28: W=42
const GLORIA_W  = 40;
const GLORIA_H  = 70;
const EXIT_W    = 120;
const EXIT_H    = 80;
const BANANA_W  = 42;
const BANANA_H  = 28;

// Encode asset filenames with spaces
function ap(filename) {
  return 'assets/' + encodeURIComponent(filename);
}

// ── Level metadata: objective text + hint ─────────────────────────────────────
const LEVEL_INFO = {
  0: {
    icon: '⭐',
    title: 'The Test Run',
    goal: 'Goal: Jump twice to complete the level!',
    objective: "Jump twice to see what Gloria can do!\nEach Jump moves her forward automatically.\nDrag two Jump blocks and hit RUN!",
    hint: "Jump twice! Drag two Jump blocks and press RUN."
  },
  1: {
    icon: '🚶',
    title: 'Walk It Out',
    goal: 'Goal: Walk 5 steps to reach the exit portal!',
    objective: "Walk 5 steps to the portal!\nGloria needs to reach the glowing exit portal.\nYou only have ONE Move block — how do you walk 5 times?",
    hint: "Use the 🔁 Repeat block! Put Move inside it and set it to repeat 5 times."
  },
  2: {
    icon: '🌀',
    title: 'The Grid Pt.1',
    goal: 'Goal: Jump over all 12 bananas across 3 rows!',
    objective: "The grid is here! 3 rows of 4 bananas.\nJump OVER each banana — don't kick, don't duck, JUMP!\nJump also moves Gloria forward in the row.\nUse Move to Next Row to drop to the next row.",
    hint: "Try: Repeat 3 [ Repeat 4 [Jump], Move to Next Row ]\nJump moves forward — no separate Move needed!"
  },
  3: {
    icon: '⚡',
    title: 'Mixed Obstacles',
    goal: 'Goal: Jump, duck, and kick through every obstacle!',
    objective: "Three zones of trouble!\n5 Bananas → Jump over each (jump moves forward)!\n3 Birds → Duck under each (duck moves forward)!\n4 Spiders → Kick each (kick moves forward)!\nEach group needs its own loop!",
    hint: "Use Repeat 5 [Jump], then Repeat 3 [Duck], then Repeat 4 [Kick].\nEach action moves Gloria forward!"
  },
  4: {
    icon: '🌀',
    title: 'The Grid Pt.2',
    goal: 'Goal: Jump the banana rows, then kick through the spiders!',
    objective: "The Ultimate Grid! Two rows of bananas need Jump (which moves forward).\nThen 5 spiders wait — just Kick through them!\nCombine a nested loop AND a sequential loop!\nYou only have 1 Jump, 1 Kick, and 1 Next Row block.",
    hint: "Try Repeat 2 [ Repeat 5 [Jump], Next Row ], then Repeat 5 [Kick]!\nNested loop for the banana rows, sequential loop for the spiders!"
  },
  5: {
    icon: '🏆',
    title: 'The Gauntlet',
    goal: 'Goal: Conquer all 3 rows — banana, spider, banana!',
    objective: "The MEGA challenge! Every row has the same pattern:\n🍌🍌 Jump over 2 bananas!\n🕷🕷 Kick through 2 spiders!\n🍌🍌 Jump over 2 more bananas!\nRepeat this for all 3 rows!",
    hint: "Try: Repeat 3 [ Repeat 2[Jump], Repeat 2[Kick], Repeat 2[Jump], Next Row ]"
  },
  6: {
    icon: '🚁',
    title: 'Helicopter Rescue!',
    goal: 'Goal: Climb 5 steps to reach the helicopter!',
    objective: "Gloria's brothers arrived on a helicopter!\nClimb up 5 steps to reach the hanging ladder.\nEach Jump goes up AND forward — one block does it all!\nYou only have 1 Jump block!",
    hint: "Use Repeat 5 [Jump] to climb all 5 steps!\nJump now moves forward AND up the staircase!"
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// AHA MOMENTS — one per level (shown after win, before next level loads)
// ─────────────────────────────────────────────────────────────────────────────
const AHA_MOMENTS = {
  0: {
    icon: '⭐',
    concept: 'Jumping = Moving!',
    body: "Did you notice?\nEvery Jump moved Gloria\nforward automatically!\nIn coding, ONE action\ncan do multiple things\nat once!"
  },
  1: {
    icon: '🔁',
    concept: 'You used a LOOP!',
    body: "Instead of writing Move\n5 times, one Repeat\ndid it all!\nLoops help us avoid\nrepeating ourselves —\njust like shortcuts!"
  },
  2: {
    icon: '🌀',
    concept: 'Nested Loops!',
    body: "A loop inside a loop!\nThe inner loop cleared\none row, then the outer\nloop repeated it for\neach row. Loops inside\nloops = SUPER power!"
  },
  3: {
    icon: '⚡',
    concept: 'Multiple Loops!',
    body: "You chained THREE loops\none after another!\nEach loop handled a\ndifferent obstacle.\nSequential loops solve\ncomplex problems step\nby step!"
  },
  4: {
    icon: '🧠',
    concept: 'Nested + Sequential!',
    body: "You combined BOTH!\nA nested loop for the\nbanana rows, then a\nsequential loop for\nspiders.\nThat's real programmer\nthinking!"
  },
  5: {
    icon: '🏆',
    concept: 'The Gauntlet — CLEARED!',
    body: "Jump, Duck, AND Kick\nall inside ONE outer\nloop!\nYou chained THREE\ninner loops together\ninside a single Repeat.\nThat's MEGA coding!"
  },
  6: {
    icon: '🚁',
    concept: 'You\'re a Coder!',
    body: "You beat every level!\nYou learned order,\nloops, nested loops,\nsequential loops, and\nproblem decomposition.\nGloria is SO proud!"
  }
};

// Track whether the nudge has been shown for each level
const _nudgeShown = {};

// Aha moment callback (set when showAhaMoment is called)
let _ahaCallback = null;

function showAhaMoment(levelNum, callback) {
  const data = AHA_MOMENTS[levelNum];
  if (!data) { if (callback) callback(); return; }
  _ahaCallback = callback;
  document.getElementById('aha-icon').textContent    = data.icon;
  document.getElementById('aha-concept').textContent = data.concept;
  document.getElementById('aha-body').textContent    = data.body;
  document.getElementById('aha-overlay').style.display = 'flex';
  if (window.GameAudio) window.GameAudio.aha();
  markProgressDone(levelNum);
}

function markProgressDone(levelNum) {
  const nodes = document.querySelectorAll('.gloria-letter');
  nodes.forEach(n => {
    const lv = parseInt(n.dataset.level);
    if (lv <= levelNum) {
      n.classList.add('done');
      n.classList.remove('active');
    }
  });
}

function markProgressActive(levelNum) {
  const nodes = document.querySelectorAll('.gloria-letter');
  nodes.forEach(n => {
    const lv = parseInt(n.dataset.level);
    n.classList.toggle('active', lv === levelNum && !n.classList.contains('done'));
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// BADGE WALL — builds and shows trophy room after ending
// ─────────────────────────────────────────────────────────────────────────────
function buildBadgeWall() {
  const grid = document.getElementById('badge-grid');
  grid.innerHTML = '';
  Object.keys(AHA_MOMENTS).forEach(key => {
    const m = AHA_MOMENTS[key];
    const item = document.createElement('div');
    item.className = 'badge-item';
    item.innerHTML =
      `<div class="badge-icon">${m.icon}</div>` +
      `<div class="badge-concept">${m.concept}</div>`;
    grid.appendChild(item);
  });
}

function showBadgeWall() {
  buildBadgeWall();
  document.getElementById('badge-wall').style.display = 'flex';
}

// Update the sidebar level indicator
function setLevelUI(num, name) {
  const el = document.getElementById('level-indicator');
  if (el) el.innerHTML = `LEVEL ${num}<span class="level-name">${name}</span>`;
  const gb = document.getElementById('goal-bar');
  if (gb && LEVEL_INFO[num]) gb.textContent = '🎯 ' + LEVEL_INFO[num].goal;
  markProgressActive(num);
  if (typeof window.updateToolboxForLevel === 'function') window.updateToolboxForLevel(num);
}

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 1 — two-step popup content
// Step 1: objective. Step 2: what is the Repeat block?
// ─────────────────────────────────────────────────────────────────────────────
const LEVEL1_POPUP_STEPS = [
  {
    icon: '🚶',
    levelTag: 'LEVEL 1',
    title: 'Walk It Out',
    body: "Gloria needs to walk 5 steps to reach\nthe glowing exit portal!\n\nBut you can only use ONE Move block.\nHow do you make her walk 5 times?",
    img: null,
    closeLabel: 'Next ▶',
    showPrev: false,
  },
  {
    icon: '🎯',
    levelTag: 'LEARNING OBJECTIVE',
    title: 'You can use a Repeat block!',
    body: "Instead of placing the same block\n5 times, wrap it in ONE Repeat!\n\nSet the number to how many\ntimes you want it to run.\nLet the loop do the work!",
    img: 'assets/repeat%20button.png',
    closeLabel: "Let's Go! ▶",
    showPrev: true,
  }
];

let _level1PopupStep = 0;

// Multi-step popup configs for all levels (level 1 uses existing LEVEL1_POPUP_STEPS)
const LEVEL_POPUP_CONFIGS = {
  2: [
    {
      icon: '🌀', levelTag: 'LEVEL 2', title: 'The Grid Pt.1',
      body: "3 rows of bananas ahead!\nUse JUMP to leap over each banana —\nnot Kick, not Duck — JUMP!\nJump also moves Gloria forward.\nUse Next Row to drop between rows.",
      img: null, closeLabel: 'Next ▶', showPrev: false
    },
    {
      icon: '🎯', levelTag: 'LEARNING OBJECTIVE', title: 'You can nest Repeat blocks!',
      body: "You can put a Repeat INSIDE\nanother Repeat!\n\nThe inner loop runs fully\nbefore the outer loop moves on.\nThis is called a NESTED loop!",
      img: null, closeLabel: "Let's Go! ▶", showPrev: true
    }
  ],
  3: [
    {
      icon: '⚡', levelTag: 'LEVEL 3', title: 'Mixed Obstacles!',
      body: "Three zones of obstacles!\nJump over bananas, Duck under birds,\nKick through spiders!\nEach move goes forward.\nYou only have 1 of each block!",
      img: null, closeLabel: 'Next ▶', showPrev: false
    },
    {
      icon: '🎯', levelTag: 'LEARNING OBJECTIVE', title: 'You can use Repeat blocks sequentially!',
      body: "You can stack multiple Repeat\nblocks one after another!\n\nEach loop handles one job,\nthen the next loop takes over.\nThis is called a SEQUENTIAL loop!",
      img: null, closeLabel: "Let's Go! ▶", showPrev: true
    }
  ],
  4: [
    {
      icon: '🌀', levelTag: 'LEVEL 4', title: 'The Grid Pt.2',
      body: "Two banana rows + spiders!\nClear the bananas with Jump,\nthen kick through the spiders.\nBoth moves go forward!",
      img: null, closeLabel: 'Next ▶', showPrev: false
    },
    {
      icon: '🎯', levelTag: 'LEARNING OBJECTIVE', title: 'You can combine nested AND sequential loops!',
      body: "You can use BOTH types together!\n\nUse a nested loop for one part,\nthen a sequential loop for another.\n\nBreaking a big problem into\nsmaller loops is how real\ncoders think!",
      img: null, closeLabel: "Let's Go! ▶", showPrev: true
    }
  ],
  5: [
    {
      icon: '🏆', levelTag: 'LEVEL 5', title: 'The Gauntlet!',
      body: "Every row has the SAME pattern:\n🍌🍌 Jump over 2 Bananas!\n🕷🕷 Kick through 2 Spiders!\n🍌🍌 Jump over 2 more Bananas!\nAll 3 rows. No ducking here!\nYou only have 1 of each block!",
      img: null, closeLabel: 'Next ▶', showPrev: false
    },
    {
      icon: '🎯', levelTag: 'LEARNING OBJECTIVE', title: 'You can chain loops inside one Repeat!',
      body: "You can put MULTIPLE loops\ninside one outer Repeat!\n\nEach inner loop handles\none type of obstacle,\nthen the next inner loop\ntakes over — all inside\none outer loop!",
      img: null, closeLabel: "Let's Go! ▶", showPrev: true
    }
  ],
  6: [
    {
      icon: '🚁', levelTag: 'LEVEL 6', title: 'Helicopter Rescue!',
      body: "Climb 5 steps to the helicopter!\nEach Jump goes UP and FORWARD\nat the same time.\nYou only have 1 Jump block.",
      img: null, closeLabel: 'Next ▶', showPrev: false
    },
    {
      icon: '🎯', levelTag: 'LEARNING OBJECTIVE', title: 'You can solve any problem with loops!',
      body: "You have learned so much!\nRepeat blocks, nested loops,\nsequential loops — you have\ntried them all.\n\nNow put it all together\nand rescue Gloria!",
      img: null, closeLabel: "Let's Go! ▶", showPrev: true
    }
  ]
};

let _genericPopupStep = 0;
let _genericPopupLevel = 0;

function showGenericLevelPopup(levelNum, step) {
  _genericPopupStep = step;
  _genericPopupLevel = levelNum;
  const steps = LEVEL_POPUP_CONFIGS[levelNum];
  if (!steps) return;
  const s = steps[step];
  document.getElementById('popup-icon').textContent      = s.icon;
  document.getElementById('popup-level-tag').textContent = s.levelTag;
  document.getElementById('popup-title').textContent     = s.title;
  document.getElementById('popup-body').textContent      = s.body;
  document.getElementById('popup-close').textContent     = s.closeLabel;
  const img = document.getElementById('popup-img');
  if (s.img) { img.src = s.img; img.style.display = 'block'; }
  else        { img.style.display = 'none'; }
  const prev = document.getElementById('popup-prev');
  prev.style.display = s.showPrev ? 'inline-block' : 'none';
  // Style the popup differently for learning objective slides
  const box = document.getElementById('popup-box');
  if (s.levelTag === 'LEARNING OBJECTIVE') {
    box.classList.add('learning-obj');
  } else {
    box.classList.remove('learning-obj');
  }
  document.getElementById('popup-overlay').classList.add('visible');
}

function showLevel1Popup(step) {
  _level1PopupStep = step;
  const s = LEVEL1_POPUP_STEPS[step];
  document.getElementById('popup-icon').textContent      = s.icon;
  document.getElementById('popup-level-tag').textContent = s.levelTag;
  document.getElementById('popup-title').textContent     = s.title;
  document.getElementById('popup-body').textContent      = s.body;
  document.getElementById('popup-close').textContent     = s.closeLabel;

  const img = document.getElementById('popup-img');
  if (s.img) { img.src = s.img; img.style.display = 'block'; }
  else        { img.style.display = 'none'; }

  const prev = document.getElementById('popup-prev');
  prev.style.display = s.showPrev ? 'inline-block' : 'none';

  // Style the learning objective slide distinctly
  const box = document.getElementById('popup-box');
  if (s.levelTag === 'LEARNING OBJECTIVE') {
    box.classList.add('learning-obj');
  } else {
    box.classList.remove('learning-obj');
  }

  document.getElementById('popup-overlay').classList.add('visible');
}

// ─────────────────────────────────────────────────────────────────────────────
// GENERIC LEVEL OBJECTIVE POPUP (levels 0, 2, 3, 4, 5)
// ─────────────────────────────────────────────────────────────────────────────
// ── Intro popup: shown once before Level 0, explains what a program is ────────
const INTRO_STEPS = [
  {
    icon: '💻',
    tag: 'WELCOME!',
    title: 'What is a Program?',
    body: "A program is a sequence of instructions that tells a computer what to do — in order! Just like a recipe: each step happens one at a time, from top to bottom.",
  },
  {
    icon: '🧩',
    tag: 'HOW IT WORKS',
    title: 'These Blocks are Your Code!',
    body: "Each colourful block is one instruction. Snap them together to build your program! The blocks click together like puzzle pieces — just drag and drop from the panel on the right.",
  },
  {
    icon: '▶',
    tag: 'READY TO CODE',
    title: 'Press RUN to Run Your Code!',
    body: "Once your blocks are connected, press the green ▶ RUN button. Gloria will follow your instructions exactly — one block at a time! Let's go! 🦛",
  },
];
let _introStep = 0;

function showIntroPopup() {
  _introStep = 0;
  _showIntroStep(0);
}

function _showIntroStep(i) {
  const s = INTRO_STEPS[i];
  if (!s) { return; }
  document.getElementById('popup-icon').textContent      = s.icon;
  document.getElementById('popup-level-tag').textContent = s.tag;
  document.getElementById('popup-title').textContent     = s.title;
  document.getElementById('popup-body').textContent      = s.body;
  document.getElementById('popup-img').style.display     = 'none';
  document.getElementById('popup-close').textContent     = i < INTRO_STEPS.length - 1 ? 'Next ▶' : "Let's Play! ▶";
  document.getElementById('popup-prev').style.display    = i > 0 ? 'inline-block' : 'none';
  document.getElementById('popup-overlay').classList.add('visible');
  _introStep = i;
  // mark we're in intro mode so the close handler knows
  window._inIntroPopup = true;
}

function showLevelPopup(levelNum) {
  if (levelNum === 1) { showLevel1Popup(0); return; }
  if (LEVEL_POPUP_CONFIGS[levelNum]) { showGenericLevelPopup(levelNum, 0); return; }

  const info = LEVEL_INFO[levelNum];
  if (!info) return;
  document.getElementById('popup-icon').textContent      = info.icon;
  document.getElementById('popup-level-tag').textContent = `LEVEL ${levelNum}`;
  document.getElementById('popup-title').textContent     = info.title;
  document.getElementById('popup-body').textContent      = info.objective;
  document.getElementById('popup-close').textContent     = "Let's Go! ▶";
  document.getElementById('popup-img').style.display     = 'none';
  document.getElementById('popup-prev').style.display    = 'none';
  document.getElementById('popup-box').classList.remove('learning-obj');
  document.getElementById('popup-overlay').classList.add('visible');
}

// Ending sequence (2 images: storyline2_1 → storyline2_2)
const ENDING_COUNT = 2;
let _endingIdx = 0;

function _showEndingFrame(idx) {
  _endingIdx = idx;
  document.getElementById('ending-img').src =
    'assets/' + encodeURIComponent('storyline2_' + (idx + 1) + '.png');
  document.getElementById('ending-btn').textContent =
    idx < ENDING_COUNT - 1 ? 'Next ▶' : 'Play Again ▶';
}

function showEnding() {
  _showEndingFrame(0);
  document.getElementById('ending-screen').style.display = 'flex';
}

// Show pre-level cutscene placeholder, then call onContinue when dismissed
function showCutscene(levelNum, onContinue) {
  const el = document.getElementById('cutscene-overlay');
  document.getElementById('cutscene-level-tag').textContent = 'LEVEL ' + levelNum;
  el.style.display = 'flex';
  document.getElementById('cutscene-continue-btn').onclick = function () {
    el.style.display = 'none';
    if (onContinue) onContinue();
  };
}

// Show hint toast
function showHint(levelNum) {
  const info = LEVEL_INFO[levelNum];
  if (!info) return;
  const toast = document.getElementById('hint-toast');
  toast.textContent = '💡 ' + info.hint;
  toast.classList.add('visible');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('visible'), 6000);
}

// Show "Try Again!" flash when a run completes without winning
function showTryAgain() {
  const toast = document.getElementById('hint-toast');
  toast.textContent = '❌ Not quite! Try a different order or number.';
  toast.style.background = '#c62828';
  toast.style.borderColor = '#ff5252';
  toast.classList.add('visible');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.remove('visible');
    toast.style.background = '';
    toast.style.borderColor = '';
  }, 2500);
}

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 0 TUTORIAL WALKTHROUGH — 5-step overlay
// Steps: welcome → Moves tab → Loops tab → Hint button → Run button → Info button
// ─────────────────────────────────────────────────────────────────────────────
const TUTORIAL_STEPS = [
  {
    title: 'Welcome to the Moves!',
    body: "See the sidebar on the right?\nThat's where Gloria's moves live!\n\nClick the pink 'Gloria's Moves' tab\nto see all the blocks.\n\n⬆️ Jump — leaps forward AND over things!\n⬇️ Duck — ducks AND moves forward!\n🦵 Kick — kicks AND moves forward!\n⬇️ Next Row — drops to the next row\n\nEvery move includes moving forward!",
    spotlight: 'blockly-workspace',
    img: null,
    hint: null,
  },
  {
    title: 'The Loops Tab! 🔁',
    body: "Now click the orange 'Loops' tab!\n\nInside you'll find the 🔁 Repeat block.\nDrag a number inside it and put\nyour move blocks inside the 'do' slot.\n\nGloria will repeat those moves\nthat many times — like magic!",
    spotlight: 'blockly-workspace',
    img: null,
    hint: null,
  },
  {
    title: 'The 💡 Hint Button',
    body: "Stuck? Hit the yellow 💡 Hint button!\n\nIt will show you a clue about\nhow to solve the current level.\n\nDon't be shy — hints are there\nto help you learn!",
    spotlight: 'hint-btn',
    img: null,
    hint: "Jump twice! Each jump moves Gloria forward automatically!",
  },
  {
    title: 'The ℹ Info Button',
    body: "The pink ℹ circle button reopens\nthe level objective any time!\n\nForget what you're supposed to do?\nJust press ℹ and the goal\nwill pop back up.",
    spotlight: 'info-btn',
    img: null,
    hint: null,
  },
  {
    title: '▶ RUN Button — Go!',
    body: "Once your blocks are ready,\npress the big green ▶ RUN button!\n\nGloria will follow your code\nexactly as you wrote it.\n\nTry: Jump + Jump\nand see what happens!",
    spotlight: 'run-btn',
    img: null,
    hint: null,
  },
];

let _tutorialStep = 0;

function _spotlightEl(elId) {
  const sp = document.getElementById('tutorial-spotlight');
  if (!elId) { sp.style.display = 'none'; return; }
  const el = document.getElementById(elId);
  if (!el) { sp.style.display = 'none'; return; }
  const r = el.getBoundingClientRect();
  const pad = 6;
  sp.style.display = 'block';
  sp.style.left    = (r.left - pad) + 'px';
  sp.style.top     = (r.top  - pad) + 'px';
  sp.style.width   = (r.width  + pad * 2) + 'px';
  sp.style.height  = (r.height + pad * 2) + 'px';
}

function _showTutorialStep(idx) {
  _tutorialStep = idx;
  const s = TUTORIAL_STEPS[idx];
  const total = TUTORIAL_STEPS.length;

  document.getElementById('tutorial-step-tag').textContent = `STEP ${idx + 1} / ${total}`;
  document.getElementById('tutorial-title').textContent    = s.title;
  document.getElementById('tutorial-body').textContent     = s.body;

  // image
  const img = document.getElementById('tutorial-img');
  if (s.img) { img.src = s.img; img.style.display = 'block'; }
  else        { img.style.display = 'none'; }

  // hint preview
  const hp = document.getElementById('tutorial-hint-preview');
  if (s.hint) { hp.textContent = '💡 ' + s.hint; hp.style.display = 'block'; }
  else        { hp.style.display = 'none'; }

  // buttons
  document.getElementById('tutorial-prev').disabled = (idx === 0);
  document.getElementById('tutorial-next').textContent = (idx === total - 1) ? "Let's Play! 🦛" : 'Next ▶';

  // spotlight
  _spotlightEl(s.spotlight);
}

function startTutorial() {
  document.getElementById('tutorial-overlay').classList.add('visible');
  _showTutorialStep(0);
}

function closeTutorial() {
  document.getElementById('tutorial-overlay').classList.remove('visible');
  document.getElementById('tutorial-spotlight').style.display = 'none';
}

// ─────────────────────────────────────────────────────────────────────────────
// DOM WIRING — runs once page is loaded
// ─────────────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {

  // ── Home screen → Storyline → Game screen ─────────────────────────────────
  const STORYLINE_COUNT = 10;
  let _storylineIdx = 0;

  function _showStorylineFrame(idx) {
    _storylineIdx = idx;
    const img  = document.getElementById('storyline-img');
    const card = document.getElementById('storyline-text-card');

    if (idx === 3) {
      // Text card slide — "The morning of the dance..."
      img.style.display  = 'none';
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
      img.style.display  = 'block';
      // idx < 3 → storyline_1..3.png; idx > 3 → storyline_4..8.png (shift back by 1)
      const imgNum = idx < 3 ? idx + 1 : idx;
      img.src = 'assets/' + encodeURIComponent('storyline_' + imgNum + '.png');
    }

    document.getElementById('storyline-counter').textContent =
      (idx + 1) + ' / ' + STORYLINE_COUNT;
    document.getElementById('storyline-next-btn').textContent =
      idx === STORYLINE_COUNT - 1 ? "Let's Play! ▶" : 'Next ▶';
  }

  document.getElementById('play-btn').addEventListener('click', function () {
    if (window.GameAudio) window.GameAudio.levelStart();
    if (window.GameMusic) window.GameMusic.play('home');
    document.getElementById('home-screen').style.display = 'none';
    document.getElementById('storyline-screen').style.display = 'flex';
    _showStorylineFrame(0);
    setTimeout(() => { if (window.GameMusic) window.GameMusic.stop(); }, 1200);
  });

  document.getElementById('storyline-next-btn').addEventListener('click', function () {
    if (window.GameAudio) window.GameAudio.click();
    if (_storylineIdx < STORYLINE_COUNT - 1) {
      _showStorylineFrame(_storylineIdx + 1);
    } else {
      document.getElementById('storyline-screen').style.display = 'none';
      const gs = document.getElementById('game-screen');
      gs.style.display = 'flex';
      setTimeout(() => { initPhaser(); window._initBlockly(); }, 80);
      setTimeout(() => showIntroPopup(), 400);
    }
  });

  // ── Generic popup close ────────────────────────────────────────────────────
  document.getElementById('popup-close').addEventListener('click', function () {
    if (window.GameAudio) window.GameAudio.click();
    // Intro popup navigation
    if (window._inIntroPopup) {
      if (_introStep < INTRO_STEPS.length - 1) { _showIntroStep(_introStep + 1); return; }
      window._inIntroPopup = false;
      document.getElementById('popup-overlay').classList.remove('visible');
      setTimeout(() => showLevelPopup(0), 300);
      return;
    }
    if (window.CURRENT_LEVEL === 1) {
      if (_level1PopupStep === 0) { showLevel1Popup(1); return; }
    }
    // Generic multi-step popups
    const configs = LEVEL_POPUP_CONFIGS[window.CURRENT_LEVEL];
    if (configs && _genericPopupLevel === window.CURRENT_LEVEL && _genericPopupStep < configs.length - 1) {
      showGenericLevelPopup(window.CURRENT_LEVEL, _genericPopupStep + 1);
      return;
    }
    document.getElementById('popup-overlay').classList.remove('visible');
    if (window.CURRENT_LEVEL === 0) {
      setTimeout(startTutorial, 300);
    }
  });

  // ── Popup prev ─────────────────────────────────────────────────────────────
  document.getElementById('popup-prev').addEventListener('click', function () {
    if (window._inIntroPopup && _introStep > 0) { _showIntroStep(_introStep - 1); return; }
    if (window.CURRENT_LEVEL === 1 && _level1PopupStep === 1) {
      showLevel1Popup(0);
    } else if (LEVEL_POPUP_CONFIGS[window.CURRENT_LEVEL] && _genericPopupStep > 0) {
      showGenericLevelPopup(window.CURRENT_LEVEL, _genericPopupStep - 1);
    }
  });

  // ── Info button ────────────────────────────────────────────────────────────
  document.getElementById('info-btn').addEventListener('click', function () {
    showLevelPopup(window.CURRENT_LEVEL);
  });

  // ── Hint button (nudge first, real hint on second click) ──────────────────
  document.getElementById('hint-btn').addEventListener('click', function () {
    const lv = window.CURRENT_LEVEL;
    if (!_nudgeShown[lv]) {
      _nudgeShown[lv] = true;
      const toast = document.getElementById('hint-toast');
      toast.textContent = '🤔 Try it differently! Move the blocks around and see what changes.';
      toast.classList.add('visible');
      clearTimeout(toast._timer);
      toast._timer = setTimeout(() => toast.classList.remove('visible'), 4000);
    } else {
      showHint(lv);
    }
  });

  // ── Aha moment continue ───────────────────────────────────────────────────
  document.getElementById('aha-btn').addEventListener('click', function () {
    if (window.GameAudio) window.GameAudio.click();
    document.getElementById('aha-overlay').style.display = 'none';
    if (_ahaCallback) { const cb = _ahaCallback; _ahaCallback = null; cb(); }
  });

  // ── Music toggle ───────────────────────────────────────────────────────────
  let _musicMuted = false;
  document.getElementById('music-toggle-btn').addEventListener('click', function () {
    _musicMuted = !_musicMuted;
    this.textContent = _musicMuted ? '🔇' : '🎵';
    this.classList.toggle('muted', _musicMuted);
    if (_musicMuted) {
      if (window.GameMusic) window.GameMusic.stop();
    } else {
      // Resume the current level's track
      if (window.GameMusic) window.GameMusic.play('level' + window.CURRENT_LEVEL);
    }
  });

  // ── Tutorial navigation ────────────────────────────────────────────────────
  document.getElementById('tutorial-next').addEventListener('click', function () {
    if (_tutorialStep < TUTORIAL_STEPS.length - 1) {
      _showTutorialStep(_tutorialStep + 1);
    } else {
      closeTutorial();
    }
  });
  document.getElementById('tutorial-prev').addEventListener('click', function () {
    if (_tutorialStep > 0) _showTutorialStep(_tutorialStep - 1);
  });

  // ── Ending screen — step through 2 images then show badge wall ───────────
  document.getElementById('ending-btn').addEventListener('click', function () {
    if (_endingIdx < ENDING_COUNT - 1) {
      _showEndingFrame(_endingIdx + 1);
    } else {
      document.getElementById('ending-screen').style.display = 'none';
      showBadgeWall();
    }
  });

  // ── Badge wall play-again ─────────────────────────────────────────────────
  document.getElementById('badge-play-again').addEventListener('click', function () {
    location.reload();
  });

  // ── Move Dictionary ───────────────────────────────────────────────────────
  document.getElementById('dict-btn').addEventListener('click', function () {
    document.getElementById('move-dict-overlay').style.display = 'flex';
  });
  document.getElementById('move-dict-close').addEventListener('click', function () {
    document.getElementById('move-dict-overlay').style.display = 'none';
  });

});

// Clear the Blockly workspace and re-insert the permanent hat block
function clearBlocklyWorkspace() {
  if (window._blocklyWorkspace) {
    window._blocklyWorkspace.clear();
    // Re-add the "When RUN is clicked" hat block after every clear
    const hatXml = Blockly.utils.xml.textToDom(
      '<xml><block type="gloria_when_run" x="20" y="20" deletable="false" movable="false"></block></xml>'
    );
    Blockly.Xml.domToWorkspace(hatXml, window._blocklyWorkspace);
  }
}

// Transition to a new scene, clear Blockly, show cutscene then objective popup
function goToScene(currentScene, key, levelNum) {
  console.clear();
  clearBlocklyWorkspace();
  console.log(`→ Starting ${key}`);
  currentScene.scene.start(key);
  // Show cutscene → popup after brief delay so new scene finishes create()
  setTimeout(() => showCutscene(levelNum, () => showLevelPopup(levelNum)), 400);
}

// ── Shared scene helpers (mixed into each scene via Object.assign) ────────────
const SceneMixin = {
  _enqueue(fn) {
    this._actionQueue = this._actionQueue.then(() => fn());
  },
  _tweenTo(target, props, duration, ease) {
    return new Promise(resolve => {
      this.tweens.add({ targets: target, ...props, duration, ease, onComplete: resolve });
    });
  },
  _jump(onPeak) {
    return new Promise(resolve => {
      const startY = this.gloria.y;
      this.tweens.add({
        targets: this.gloria, y: startY - this.JUMP_HEIGHT,
        duration: 260, ease: 'Sine.easeOut',
        onComplete: () => {
          if (onPeak) onPeak();
          this.tweens.add({
            targets: this.gloria, y: startY,
            duration: 260, ease: 'Sine.easeIn',
            onComplete: resolve
          });
        }
      });
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// BASE SCENE — shared preload & background helpers
// ─────────────────────────────────────────────────────────────────────────────
class BaseScene extends Phaser.Scene {
  preloadShared() {
    this.load.image('gloria',      ap('Gloria Potamus.png'));
    this.load.image('gloria_kick', ap('gloria_kick.png'));
    this.load.image('banana',      ap('banana peel.png'));
    this.load.image('exit',        ap('level exit.png'));
  }

  drawGround(y, color1 = 0x4caf50, color2 = 0x66bb6a) {
    this.add.rectangle(400, y + 18, 800, 36, color1);
    this.add.rectangle(400, y + 4,  800, 10, color2);
  }

  drawCloud(x, y) {
    const g = this.add.graphics();
    g.fillStyle(0xffffff, 0.85);
    g.fillCircle(x,      y,      18);
    g.fillCircle(x + 22, y - 8,  24);
    g.fillCircle(x + 48, y,      18);
    g.fillCircle(x + 24, y + 7,  16);
  }

  // Aspect-ratio-correct Gloria: 512×900 → W=40, H=70
  placeGloria(x, y) {
    const g = this.add.image(x, y, 'gloria');
    g.setDisplaySize(GLORIA_W, GLORIA_H);
    g.setDepth(10);
    return g;
  }

  // Aspect-ratio-correct exit: 1536×1024 → W=120, H=80
  placeExit(x, y) {
    const e = this.add.image(x, y, 'exit');
    e.setDisplaySize(EXIT_W, EXIT_H);
    e.setDepth(1);
    return e;
  }

  // Aspect-ratio-correct banana: 1536×1024 → W=42, H=28
  placeBanana(x, y) {
    const b = this.add.image(x, y, 'banana');
    b.setDisplaySize(BANANA_W, BANANA_H);
    return b;
  }

  levelBanner(text, color = '#ffffffdd', textColor = '#1a237e') {
    this.add.text(400, 10, text, {
      fontSize: '13px', fontStyle: 'bold', color: textColor,
      backgroundColor: color, padding: { x: 10, y: 5 }
    }).setOrigin(0.5, 0);
  }

  statusLabel(text, y) {
    return this.add.text(400, y, text, {
      fontSize: '11px', color: '#222',
      backgroundColor: '#ffffffcc', padding: { x: 6, y: 3 }
    }).setOrigin(0.5, 0);
  }

  applyLimits(limits) {
    window.MOVE_LIMITS = limits;
    if (typeof window.updateBlockLimits === 'function') window.updateBlockLimits();
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 0 — "The Test Run"
// Tutorial. No block limits. Win: do Jump→Move→Jump→Move (anywhere in sequence).
// ─────────────────────────────────────────────────────────────────────────────
class Level0Scene extends BaseScene {
  constructor() { super({ key: 'Level0' }); }
  preload() {
    this.preloadShared();
    this.load.image('lvl0_bg', ap('lvl0_background.png'));
  }

  create() {
    this.GROUND_Y    = 290;
    this.STEP_SIZE   = 100;
    this.JUMP_HEIGHT = 105;

    this.add.image(400, 170, 'lvl0_bg').setDisplaySize(800, 340).setDepth(-1);

    this.drawGround(this.GROUND_Y);

    this.levelBanner('LEVEL 0: The Test Run');

    this.gloriaStartX = 60;
    this.gloriaFloorY = this.GROUND_Y - Math.floor(GLORIA_H / 2) - 2;
    this.gloria = this.placeGloria(this.gloriaStartX, this.gloriaFloorY);
    this.placeExit(330, this.GROUND_Y - Math.floor(EXIT_H / 2) - 2);

    this.statusText = this.statusLabel('', 255);

    this._actionQueue = Promise.resolve();
    this._jumpCount   = 0;
    this._done        = false;

    window._gloriaScene  = this;
    window.CURRENT_LEVEL = 0;
    if (window.GameMusic) window.GameMusic.playIfUnmuted('level0');
    this.applyLimits({ move: 0, jump: 999, duck: 999, kick: 999, nextrow: 999 });
    setLevelUI(0, 'The Test Run');
    // Don't show level popup yet if intro is still showing — intro will chain into it
    if (!window._inIntroPopup) showLevelPopup(0);
  }

  resetPosition() {
    this.gloria.setPosition(this.gloriaStartX, this.gloriaFloorY);
    this._jumpCount = 0; this._done = false;
    this.statusText.setText('Drag the Jump block and press RUN!');
  }

  _enqueue(fn) { this._actionQueue = this._actionQueue.then(() => fn()); }

  // Jump moves Gloria forward AND does arc — no separate Move needed
  jump() {
    this._enqueue(() => new Promise(resolve => {
      this._jumpCount++;
      if (window.GameAudio) window.GameAudio.jump();
      this.statusText.setText(`Jump ${this._jumpCount}! Gloria leaps forward! ⬆️`);
      const startY = this.gloria.y;
      const TOTAL  = 520;
      // Move forward and arc simultaneously
      this.tweens.add({
        targets: this.gloria, x: this.gloria.x + this.STEP_SIZE,
        duration: TOTAL, ease: 'Linear'
      });
      this.tweens.add({
        targets: this.gloria, y: startY - this.JUMP_HEIGHT,
        duration: TOTAL / 2, ease: 'Sine.easeOut',
        onComplete: () => this.tweens.add({
          targets: this.gloria, y: startY,
          duration: TOTAL / 2, ease: 'Sine.easeIn',
          onComplete: () => { this._checkWin(); resolve(); }
        })
      });
    }));
  }

  moveForward() { this._enqueue(() => new Promise(r => { this.statusText.setText("Jump already moves forward!"); r(); })); }
  duck()    { this._enqueue(() => new Promise(r => { this.statusText.setText("Duck isn't needed yet! 🦆"); r(); })); }
  kick()    { this._enqueue(() => new Promise(r => { this.statusText.setText("Kick isn't needed yet! 🦵"); r(); })); }
  nextRow() { this._enqueue(() => new Promise(r => { this.statusText.setText("Next Row isn't needed here!"); r(); })); }

  _checkWin() {
    if (this._done) return;
    if (this._jumpCount >= 2) {
      this._done = true;
      this._actionQueue = this._actionQueue.then(() => {
        this.statusText.setText('🎉 Jump moves forward! Next: use Repeat to do it more!');
        if (window.GameAudio) window.GameAudio.win();
        this.cameras.main.flash(500, 255, 220, 100);
        this.time.delayedCall(2200, () => showAhaMoment(0, () => goToScene(this, 'Level1', 1)));
      });
    }
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 1 — "Walk It Out"
// Walk 5 steps to reach the exit portal. Only 1 move block allowed → must loop.
// ─────────────────────────────────────────────────────────────────────────────
class Level1Scene extends BaseScene {
  constructor() { super({ key: 'Level1' }); }
  preload() {
    this.preloadShared();
    this.load.image('lvl1_bg', ap('lvl1_background.png'));
  }

  create() {
    this.GROUND_Y  = 290;
    this.STEP_SIZE = 110;
    this.NUM_STEPS = 5;

    this.add.image(400, 170, 'lvl1_bg').setDisplaySize(800, 340).setDepth(-1);

    this.drawGround(this.GROUND_Y, 0x558b2f, 0x7cb342);

    this.levelBanner('LEVEL 1: Walk It Out', '#ffffffdd', '#1a237e');

    // Step markers on the ground
    for (let i = 1; i <= 5; i++) {
      const x = 60 + i * this.STEP_SIZE;
      this.add.rectangle(x, this.GROUND_Y + 2, 2, 12, 0xffffff).setAlpha(0.4);
      this.add.text(x, this.GROUND_Y + 10, `${i}`, {
        fontSize: '9px', color: '#ffffffcc'
      }).setOrigin(0.5, 0);
    }

    this.gloriaStartX = 60;
    this.gloriaFloorY = this.GROUND_Y - Math.floor(GLORIA_H / 2) - 2;
    this.gloria = this.placeGloria(this.gloriaStartX, this.gloriaFloorY);
    this.exitX = 60 + this.NUM_STEPS * this.STEP_SIZE;
    this.placeExit(this.exitX, this.GROUND_Y - Math.floor(EXIT_H / 2) - 2);

    this.statusText = this.statusLabel('', 255);

    this._actionQueue = Promise.resolve();
    this._stepCount   = 0;
    this._done        = false;

    window._gloriaScene  = this;
    window.CURRENT_LEVEL = 1;
    if (window.GameMusic) window.GameMusic.playIfUnmuted('level1');
    this.applyLimits({ move: 1, jump: 999, duck: 999, kick: 999, nextrow: 999 });
    setLevelUI(1, 'Walk It Out');
    console.log('Level 1 — 1 move limit');
  }

  resetPosition() {
    this.gloria.setPosition(this.gloriaStartX, this.gloriaFloorY);
    this._stepCount = 0; this._done = false;
    this.statusText.setText('Walk to the exit portal!');
  }

  _enqueue(fn) { this._actionQueue = this._actionQueue.then(() => fn()); }

  moveForward() {
    this._enqueue(() => new Promise(resolve => {
      this._stepCount++;
      this.statusText.setText(`Step ${this._stepCount} of ${this.NUM_STEPS}! 🐾`);
      this.tweens.add({
        targets: this.gloria, x: this.gloria.x + this.STEP_SIZE,
        duration: 380, ease: 'Sine.easeInOut',
        onComplete: () => { this._checkWin(); resolve(); }
      });
    }));
  }

  jump()    { this._enqueue(() => new Promise(r => { this.statusText.setText("No jumping needed here! 🚶"); r(); })); }
  duck()    { this._enqueue(() => new Promise(r => { this.statusText.setText("No ducking here! 🦆"); r(); })); }
  kick()    { this._enqueue(() => new Promise(r => { this.statusText.setText("No kicking here! 🦵"); r(); })); }
  nextRow() { this._enqueue(() => new Promise(r => { this.statusText.setText("No rows here! 🚶"); r(); })); }

  _checkWin() {
    if (this._done) return;
    if (this._stepCount >= this.NUM_STEPS) {
      this._done = true;
      this._actionQueue = this._actionQueue.then(() => {
        this.statusText.setText('🎉 You reached the exit! Loops = power!');
        if (window.GameAudio) window.GameAudio.win();
        this.cameras.main.flash(500, 180, 240, 255);
        this.time.delayedCall(2200, () => showAhaMoment(1, () => goToScene(this, 'Level2', 2)));
      });
    }
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 2 — "The Grid Pt.1"
//
// Layout: 3 rows of platforms, each with 4 banana peels.
//   Row 1: Gloria starts LEFT, moves RIGHT (L→R). Exit of row: right side.
//   Row 2: Gloria drops to RIGHT side, moves LEFT (R→L).
//   Row 3: Gloria drops to LEFT side, moves RIGHT (L→R). Exit portal at right end.
//
// "Move to Next Row" block: drops Gloria to the start of the next row.
// "Gloria Move Forward" block: moves one step in the current direction.
// "Gloria Jump" block: jumps over the banana at current position.
//
// Solution: Repeat 3 [ Repeat 4 [Move, Jump], Move to Next Row ]
// Block limits: 1 jump, 1 move, 1 nextrow
// ─────────────────────────────────────────────────────────────────────────────
class Level2Scene extends BaseScene {
  constructor() { super({ key: 'Level2' }); }
  preload() { this.preloadShared(); }

  create() {
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // ── Layout constants ──────────────────────────────────────────────────────
    this.ROWS        = 3;    // banana rows
    this.COLS        = 4;
    this.ROW_STEP    = 60;   // vertical px between rows (tighter to fit 4 rows)
    this.COL_STEP    = 130;  // horizontal px between steps
    this.ROW_Y0      = 45;   // y of the first platform top
    this.JUMP_HEIGHT = 50;
    this.MOVE_STEP   = this.COL_STEP;

    // Row directions: 1 = left→right, -1 = right→left; portal row continues alternating (R→L)
    this.rowDir = [1, -1, 1, -1];

    this.BANANA_X0   = 160;
    this.BANANA_XEND = this.BANANA_X0 + (this.COLS - 1) * this.COL_STEP; // 550

    // Gloria's start x — one step before first banana (or rightmost for R→L)
    this.rowStartX = [
      this.BANANA_X0 - this.COL_STEP,   // row 0 L→R: 30
      this.BANANA_XEND + this.COL_STEP, // row 1 R→L: 680
      this.BANANA_X0 - this.COL_STEP,   // row 2 L→R: 30
      this.BANANA_XEND + this.COL_STEP, // row 3 portal R→L: 680 (Gloria arrives right side)
    ];

    // ── Draw row platforms (banana rows + portal row) ─────────────────────────
    const platformColors = [0xe91e8c, 0x00cc44, 0x9c27b0, 0x00bcd4];
    this.rowY = [];
    for (let r = 0; r <= this.ROWS; r++) {   // 0..3 inclusive
      const platY = this.ROW_Y0 + r * this.ROW_STEP;
      this.rowY.push(platY);
      this.add.rectangle(400, platY + 6, 800, 12, platformColors[r]);
      const label = r < this.ROWS
        ? `ROW ${r + 1}: ${this.rowDir[r] === 1 ? 'left to right' : 'right to left'}`
        : 'ROW 4: PORTAL ✨';
      this.add.text(14, platY - 22, label, {
        fontSize: '8px', color: '#ffffff88', fontStyle: 'bold'
      });
    }

    // Exit portal on the 4th row (row index 3)
    const exitX = this.BANANA_XEND + this.COL_STEP + 20;
    const exitY  = this.rowY[3] - Math.floor(EXIT_H / 2) + 4;
    this.placeExit(exitX, exitY);

    // ── Place bananas at midpoints so Gloria jumps OVER them ──────────────────
    // Gloria starts at rowStartX (e.g. x=30), each jump moves +COL_STEP.
    // Banana sits at midpoint = rowStartX + COL_STEP/2 + c*COL_STEP
    this.bananaGrid = [];
    for (let r = 0; r < this.ROWS; r++) {
      const rowBananas = [];
      const rowStartX = this.rowDir[r] === 1
        ? this.BANANA_X0 - this.COL_STEP          // L→R: 30
        : this.BANANA_XEND + this.COL_STEP;       // R→L: 680
      for (let c = 0; c < this.COLS; c++) {
        const bx = this.rowDir[r] === 1
          ? rowStartX + this.COL_STEP / 2 + c * this.COL_STEP   // 95,225,355,485
          : rowStartX - this.COL_STEP / 2 - c * this.COL_STEP;  // 615,485,355,225
        const by = this.rowY[r] - 4;
        rowBananas.push(this.placeBanana(bx, by));
      }
      this.bananaGrid.push(rowBananas);
    }

    // ── Direction arrows on banana rows ──────────────────────────────────────
    for (let r = 0; r < this.ROWS; r++) {
      const arrowY = this.rowY[r] - 18;
      const g = this.add.graphics();
      g.fillStyle(platformColors[r], 0.3);
      if (this.rowDir[r] === 1) {
        g.fillTriangle(this.BANANA_XEND + 50, arrowY, this.BANANA_XEND + 35, arrowY - 8, this.BANANA_XEND + 35, arrowY + 8);
      } else {
        g.fillTriangle(this.BANANA_X0 - 50, arrowY, this.BANANA_X0 - 35, arrowY - 8, this.BANANA_X0 - 35, arrowY + 8);
      }
    }

    // ── Level banner ──────────────────────────────────────────────────────────
    this.levelBanner('LEVEL 2: The Grid Pt.1', '#000000cc', '#ff69b4');

    // ── Gloria starts at row 1 start ──────────────────────────────────────────
    this.gloriaStartX = this.rowStartX[0];
    this.gloriaFloorY = this.rowY[0] - Math.floor(GLORIA_H / 2) - 2;
    this.gloria = this.placeGloria(this.gloriaStartX, this.gloriaFloorY);

    // ── Status ────────────────────────────────────────────────────────────────
    this.statusText = this.statusLabel('Build your code and hit RUN! ▶', 300);

    // ── State ────────────────────────────────────────────────────────────────
    this._actionQueue    = Promise.resolve();
    this._currentRow     = 0;
    this._currentCol     = 0;
    this._totalJumps     = 0;   // every jump counts, even wasted ones
    this._clearedBananas = 0;
    this._done           = false;

    window._gloriaScene  = this;
    window.CURRENT_LEVEL = 2;
    if (window.GameMusic) window.GameMusic.playIfUnmuted('level2');
    this.applyLimits({ move: 0, jump: 1, duck: 999, kick: 999, nextrow: 1 });
    setLevelUI(2, 'The Grid Pt.1');
    console.log('Level 2 ready — alternating rows!');
  }

  resetPosition() {
    this._currentRow     = 0;
    this._currentCol     = 0;
    this._totalJumps     = 0;
    this._clearedBananas = 0;
    this._done           = false;
    this.gloria.setPosition(this.gloriaStartX, this.gloriaFloorY);
    for (let r = 0; r < this.ROWS; r++) {
      for (let c = 0; c < this.COLS; c++) {
        this.bananaGrid[r][c].setVisible(true).setAlpha(1);
      }
    }
    this.statusText.setText('Jump over bananas (jump moves forward), then Move to Next Row!');
  }

  _enqueue(fn) { this._actionQueue = this._actionQueue.then(() => fn()); }

  moveForward() {
    this._enqueue(() => new Promise(r => { this.statusText.setText("Jump already moves forward in the row!"); r(); }));
  }

  // Jump: moves forward in row direction AND clears the banana
  jump() {
    this._enqueue(() => new Promise(resolve => {
      const row = this._currentRow;
      const dir = this.rowDir[row] || 1;
      this._currentCol++;
      this._totalJumps++;                        // count every jump, including wasted ones
      const col = this._currentCol - 1;
      if (window.GameAudio) window.GameAudio.jump();
      this.statusText.setText(`Jumping over banana ${col + 1} in row ${row + 1}!`);
      const startY = this.gloria.y;
      const TOTAL  = 450;
      this.tweens.add({
        targets: this.gloria, x: this.gloria.x + dir * this.MOVE_STEP,
        duration: TOTAL, ease: 'Linear'
      });
      this.tweens.add({
        targets: this.gloria, y: startY - this.JUMP_HEIGHT,
        duration: TOTAL / 2, ease: 'Sine.easeOut',
        onComplete: () => {
          if (row < this.ROWS && col >= 0 && col < this.COLS) {
            const b = this.bananaGrid[row][col];
            if (b.visible) {
              this._clearedBananas++;
              this.tweens.add({ targets: b, alpha: 0, duration: 100,
                onComplete: () => b.setVisible(false) });
            }
          }
          // Arc down
          this.tweens.add({
            targets: this.gloria, y: startY,
            duration: TOTAL / 2, ease: 'Sine.easeIn',
            onComplete: resolve
          });
        }
      });
    }));
  }

  // Next Row: drop Gloria to start of next row (row 3 = portal row → win)
  nextRow() {
    this._enqueue(() => new Promise(resolve => {
      this._currentRow++;
      this._currentCol = 0;

      const nextStartX = this.rowStartX[this._currentRow] || this.rowStartX[0];
      const nextY      = this.rowY[this._currentRow] - Math.floor(GLORIA_H / 2) - 2;

      if (window.GameAudio) window.GameAudio.nextRow();
      if (this._currentRow === this.ROWS) {
        // Drop to portal row (row 4) then win
        this.statusText.setText('Dropping to the portal row! ✨');
        this.tweens.add({
          targets: this.gloria, x: nextStartX, y: nextY,
          duration: 500, ease: 'Cubic.easeIn',
          onComplete: () => { this._checkWin(); resolve(); }
        });
        return;
      }

      if (this._currentRow > this.ROWS) {
        this._checkWin(); resolve(); return;
      }

      const nextDir = this.rowDir[this._currentRow];
      this.statusText.setText(`Dropping to Row ${this._currentRow + 1} (goes ${nextDir === 1 ? 'left to right' : 'right to left'})! ⬇️`);
      this.tweens.add({
        targets: this.gloria, x: nextStartX, y: nextY,
        duration: 500, ease: 'Cubic.easeIn',
        onComplete: resolve
      });
    }));
  }

  duck() { this._enqueue(() => new Promise(r => { this.statusText.setText("No ducking here!"); r(); })); }
  kick() { this._enqueue(() => new Promise(r => { this.statusText.setText("No kicking here!"); r(); })); }

  _checkWin() {
    if (this._done) return;
    if (this._currentRow >= this.ROWS &&
        this._totalJumps === this.ROWS * this.COLS &&
        this._clearedBananas >= this.ROWS * this.COLS) {
      this._done = true;
      this._actionQueue = this._actionQueue.then(() => {
        this.statusText.setText('🎉 Grid cleared! Nested loops = POWER! 🧠');
        if (window.GameAudio) window.GameAudio.win();
        this.cameras.main.flash(600, 100, 255, 150);
        this.time.delayedCall(2200, () => showAhaMoment(2, () => goToScene(this, 'Level3', 3)));
      });
    }
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 3 — "Mixed Obstacles"
// 5 bananas (jump), 3 birds (duck), 4 boxes (kick). Separate loops per group.
// ─────────────────────────────────────────────────────────────────────────────
class Level3Scene extends BaseScene {
  constructor() { super({ key: 'Level3' }); }
  preload() {
    this.preloadShared();
    this.load.image('lvl3_bg',     ap('lvl3_background.jpg'));
    this.load.image('bird_spr',    ap('bird.gif'));
    this.load.image('spider_spr',  ap('spider.png'));
  }

  create() {
    this.GROUND_Y    = 290;
    this.JUMP_HEIGHT = 80;

    this.add.image(400, 170, 'lvl3_bg').setDisplaySize(800, 340).setDepth(-1);

    this.drawGround(this.GROUND_Y, 0x6a1b9a, 0x8e24aa);

    this.STEP_SIZE   = 55;
    this.DUCK_SIZE   = 55;
    this.levelBanner('LEVEL 3: Mixed Obstacles', '#ffffffdd', '#4a148c');

    // Zone 1: 5 bananas — placed where Gloria lands after each Jump (start=35, step=55)
    this.bananas = [90, 145, 200, 255, 310].map(x =>
      this.placeBanana(x, this.GROUND_Y - 8));

    // Zone 2: 3 birds — at midpoints of duck zones so Gloria passes OVER them when ducking
    // After 5 jumps from x=35 (step=55): Gloria at 310. Each duck moves +55.
    // Duck midpoints: 310+27=337, 365+27=392, 420+27=447
    // BIRD_Y=205 → bird extends 183-227. Standing Gloria top≈218 (hit). Ducking Gloria top≈232 (clears). ✓
    const BIRD_Y = this.GROUND_Y - 85;   // 290-85=205
    this.birds = [337, 392, 447].map(x => {
      const b = this.add.image(x, BIRD_Y, 'bird_spr').setDisplaySize(52, 44).setDepth(5);
      return b;
    });

    // Zone 3: 4 spiders (kick) — midpoints of kick zones
    // After 3 ducks from 310: Gloria at 475. Each kick moves +55. Midpoints: 502, 557, 612, 667
    const SPIDER_Y = this.GROUND_Y - 28;   // 262 — sitting on ground
    this.boxes = [502, 557, 612, 667].map(x => {
      const s = this.add.image(x, SPIDER_Y, 'spider_spr').setDisplaySize(44, 44).setDepth(5);
      return s;
    });

    // Zone labels
    this.add.text(175, this.GROUND_Y - 52, '5x BANANA',
      { fontSize: '9px', color: '#ffd600', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(392, BIRD_Y - 30, '3x BIRD',
      { fontSize: '9px', color: '#aaaaaa', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(585, this.GROUND_Y - 58, '4x SPIDER',
      { fontSize: '9px', color: '#ff6b6b', fontStyle: 'bold' }).setOrigin(0.5);

    this.gloriaStartX = 35;
    this.gloriaFloorY = this.GROUND_Y - Math.floor(GLORIA_H / 2) - 2;
    this.gloria = this.placeGloria(this.gloriaStartX, this.gloriaFloorY);
    this.placeExit(760, this.GROUND_Y - Math.floor(EXIT_H / 2) - 2);

    this.statusText = this.statusLabel('', 255);

    this._actionQueue = Promise.resolve();
    this._jumpIdx = 0; this._duckIdx = 0; this._kickIdx = 0;
    this._done    = false;

    window._gloriaScene  = this;
    window.CURRENT_LEVEL = 3;
    if (window.GameMusic) window.GameMusic.playIfUnmuted('level3');
    this.applyLimits({ move: 0, jump: 1, duck: 1, kick: 1, nextrow: 999 });
    setLevelUI(3, 'Mixed Obstacles');
  }

  resetPosition() {
    this.gloria.setPosition(this.gloriaStartX, this.gloriaFloorY);
    this._jumpIdx = 0; this._duckIdx = 0; this._kickIdx = 0; this._done = false;
    this.bananas.forEach(b => { b.setVisible(true); b.setAlpha(1); });
    this.birds.forEach(g => { g.setVisible(true); g.setAlpha(1); });
    this.boxes.forEach(g => { g.setVisible(true); g.setAlpha(1); });
    this.statusText.setText('Jump, Duck, Kick — each moves Gloria forward!');
  }

  _enqueue(fn) { this._actionQueue = this._actionQueue.then(() => fn()); }

  moveForward() {
    this._enqueue(() => new Promise(r => { this.statusText.setText("Jump, Duck, and Kick already move forward!"); r(); }));
  }

  jump() {
    this._enqueue(() => new Promise(resolve => {
      const idx = this._jumpIdx++;
      if (window.GameAudio) window.GameAudio.jump();
      this.statusText.setText(`Jumping over banana ${idx + 1}!`);
      const startY = this.gloria.y;
      const TOTAL  = 500;
      this.tweens.add({
        targets: this.gloria, x: this.gloria.x + 55,
        duration: TOTAL, ease: 'Linear'
      });
      this.tweens.add({
        targets: this.gloria, y: startY - this.JUMP_HEIGHT,
        duration: TOTAL / 2, ease: 'Sine.easeOut',
        onComplete: () => {
          if (idx < this.bananas.length) {
            this.tweens.add({ targets: this.bananas[idx], alpha: 0, duration: 100,
              onComplete: () => this.bananas[idx].setVisible(false) });
          }
          this.tweens.add({
            targets: this.gloria, y: startY,
            duration: TOTAL / 2, ease: 'Sine.easeIn',
            onComplete: () => { this._checkWin(); resolve(); }
          });
        }
      });
    }));
  }

  duck() {
    this._enqueue(() => new Promise(resolve => {
      const idx = this._duckIdx++;
      if (window.GameAudio) window.GameAudio.duck();
      this.statusText.setText(`Ducking under bird ${idx + 1}!`);
      const startY = this.gloria.y;
      const TOTAL  = 500;
      this.tweens.add({
        targets: this.gloria, x: this.gloria.x + 55,
        duration: TOTAL, ease: 'Linear'
      });
      this.tweens.add({
        targets: this.gloria, y: startY + 14,
        duration: TOTAL / 2, ease: 'Sine.easeOut',
        onComplete: () => {
          if (idx < this.birds.length) {
            this.tweens.add({ targets: this.birds[idx], alpha: 0, duration: 120,
              onComplete: () => this.birds[idx].setVisible(false) });
          }
          this.tweens.add({
            targets: this.gloria, y: startY,
            duration: TOTAL / 2, ease: 'Sine.easeIn',
            onComplete: () => { this._checkWin(); resolve(); }
          });
        }
      });
    }));
  }

  kick() {
    this._enqueue(() => new Promise(resolve => {
      const idx = this._kickIdx++;
      if (window.GameAudio) window.GameAudio.kick();
      this.statusText.setText(`Kicking spider ${idx + 1} — moving forward!`);
      this.gloria.setTexture('gloria_kick');
      this.tweens.add({
        targets: this.gloria, x: this.gloria.x + 55,
        duration: 340, ease: 'Linear',
        onComplete: () => {
          this.gloria.setTexture('gloria');
          if (idx < this.boxes.length) {
            this.tweens.add({ targets: this.boxes[idx], alpha: 0, duration: 100,
              onComplete: () => this.boxes[idx].setVisible(false) });
          }
          this._checkWin(); resolve();
        }
      });
    }));
  }

  nextRow() { this._enqueue(() => new Promise(r => { this.statusText.setText("No rows here!"); r(); })); }

  _checkWin() {
    if (this._done) return;
    if (this._jumpIdx === 5 && this._duckIdx === 3 && this._kickIdx === 4) {
      this._done = true;
      this._actionQueue = this._actionQueue.then(() => {
        this.statusText.setText('All 3 zones cleared! You are a loop master!');
        if (window.GameAudio) window.GameAudio.win();
        this.cameras.main.flash(800, 255, 200, 255);
        this.time.delayedCall(2200, () => showAhaMoment(3, () => goToScene(this, 'Level4', 4)));
      });
    }
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 4 — "The Grid Pt.2" (THE GRAND GRID)
// 3 rows: rows 0+1 have bananas (L→R, R→L) → [Jump]  (jump moves forward)
//         row 2 has spiders (L→R)           → [Kick]  (kick moves forward)
//
// Solution:  Repeat 2 [ Repeat 5 [Jump], Next Row ]   ← nested loop
//            Repeat 5 [ Kick ]                        ← sequential loop
//
// Block limits: move: 0, jump: 1, kick: 1, nextrow: 1
// ─────────────────────────────────────────────────────────────────────────────
class Level4Scene extends BaseScene {
  constructor() { super({ key: 'Level4' }); }
  preload() {
    this.preloadShared();
    this.load.image('spider_spr', ap('spider.png'));
  }

  create() {
    this.cameras.main.setBackgroundColor('#0d1b2a'); // deep night

    // ── Layout constants ──────────────────────────────────────────────────────
    this.ROWS        = 3;
    this.COLS        = 5;
    this.ROW_STEP    = 72;
    this.COL_STEP    = 100;
    this.ROW_Y0      = 88;
    this.JUMP_HEIGHT = 46;
    this.rowDir      = [1, -1, 1];   // L→R, R→L, L→R

    this.BANANA_X0   = 130;
    this.BANANA_XEND = this.BANANA_X0 + (this.COLS - 1) * this.COL_STEP; // 530

    this.rowStartX = [
      this.BANANA_X0   - this.COL_STEP,   // row 0 L→R: 30
      this.BANANA_XEND + this.COL_STEP,   // row 1 R→L: 630
      this.BANANA_X0   - this.COL_STEP,   // row 2 L→R: 30
    ];

    // ── Stars in background ───────────────────────────────────────────────────
    const sg = this.add.graphics();
    sg.fillStyle(0xffffff, 0.7);
    [40,120,200,350,470,580,680,750,90,310,430,660].forEach((x,i) => {
      sg.fillCircle(x, 12 + (i % 4) * 8, 1.5);
    });

    // ── Row platforms ─────────────────────────────────────────────────────────
    const platColors = [0xe91e8c, 0x00bcd4, 0xff6b35];
    this.rowY = [];
    for (let r = 0; r < this.ROWS; r++) {
      const platY = this.ROW_Y0 + r * this.ROW_STEP;
      this.rowY.push(platY);
      this.add.rectangle(400, platY + 6, 800, 12, platColors[r]);
      const dirLabel = this.rowDir[r] === 1 ? 'left to right' : 'right to left';
      this.add.text(14, platY - 20, `ROW ${r + 1}: ${dirLabel}`, {
        fontSize: '8px', color: '#ffffff88', fontStyle: 'bold'
      });
    }

    // ── Exit portal ───────────────────────────────────────────────────────────
    const exitX = this.BANANA_XEND + 60;
    const exitY = this.rowY[2] - Math.floor(EXIT_H / 2) + 4;
    this.placeExit(exitX, exitY);

    // ── Bananas in rows 0 and 1 ───────────────────────────────────────────────
    this.bananaGrid = [];
    for (let r = 0; r < 2; r++) {
      const rowBananas = [];
      for (let c = 0; c < this.COLS; c++) {
        const x = this.BANANA_X0 + c * this.COL_STEP;
        const y = this.rowY[r] - 4;
        rowBananas.push(this.placeBanana(x, y));
      }
      this.bananaGrid.push(rowBananas);
    }

    // ── Spiders in row 2 — static Phaser image (spider.gif first frame) ─────
    this.spiders = [];
    for (let c = 0; c < this.COLS; c++) {
      const x  = this.BANANA_X0 + c * this.COL_STEP;
      const sy = this.rowY[2] - 14;
      const s  = this.add.image(x, sy, 'spider_spr').setDisplaySize(44, 44).setDepth(5);
      this.spiders.push(s);
    }

    // ── Direction arrows ──────────────────────────────────────────────────────
    for (let r = 0; r < this.ROWS; r++) {
      const arrowY = this.rowY[r] - 16;
      const g = this.add.graphics();
      g.fillStyle(platColors[r], 0.35);
      if (this.rowDir[r] === 1) {
        g.fillTriangle(this.BANANA_XEND+52, arrowY, this.BANANA_XEND+37, arrowY-8, this.BANANA_XEND+37, arrowY+8);
      } else {
        g.fillTriangle(this.BANANA_X0-52, arrowY, this.BANANA_X0-37, arrowY-8, this.BANANA_X0-37, arrowY+8);
      }
    }

    // ── Zone labels ───────────────────────────────────────────────────────────
    this.add.text(330, this.rowY[0] - 32, 'ROWS 1 & 2: Jump the Bananas!',
      { fontSize: '8px', color: '#ffcc00', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(330, this.rowY[2] - 32, 'ROW 3: Kick the Spiders (kick = move forward)!',
      { fontSize: '8px', color: '#ff6b35', fontStyle: 'bold' }).setOrigin(0.5);

    this.levelBanner('LEVEL 4: The Grid Pt.2', '#000000cc', '#ff6b35');

    // ── Gloria starts at row 0 start ──────────────────────────────────────────
    this.gloriaStartX = this.rowStartX[0];
    this.gloriaFloorY = this.rowY[0] - Math.floor(GLORIA_H / 2) - 2;
    this.gloria = this.placeGloria(this.gloriaStartX, this.gloriaFloorY);

    this.statusText = this.statusLabel('Build your code and hit RUN! ▶', 312);

    // ── State ─────────────────────────────────────────────────────────────────
    this._actionQueue  = Promise.resolve();
    this._currentRow   = 0;
    this._currentCol   = 0;
    this._bananaCount  = 0;   // total jump-clears (target: COLS*2 = 10)
    this._kickIdx      = 0;
    this._done         = false;

    window._gloriaScene  = this;
    window.CURRENT_LEVEL = 4;
    if (window.GameMusic) window.GameMusic.playIfUnmuted('level4');
    this.applyLimits({ move: 0, jump: 1, kick: 1, duck: 999, nextrow: 1 });
    setLevelUI(4, 'The Grid Pt.2');
    console.log('Level 4 — The Grand Grid!');
  }

  resetPosition() {
    this._currentRow  = 0;
    this._currentCol  = 0;
    this._bananaCount = 0;
    this._kickIdx     = 0;
    this._done        = false;
    this.gloria.setPosition(this.gloriaStartX, this.gloriaFloorY);
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < this.COLS; c++) {
        this.bananaGrid[r][c].setVisible(true).setAlpha(1);
      }
    }
    this.spiders.forEach(g => { g.setVisible(true); g.setAlpha(1); });
    this.statusText.setText('Jump (moves forward) through banana rows, then Kick the spiders!');
  }

  _enqueue(fn) { this._actionQueue = this._actionQueue.then(() => fn()); }

  moveForward() {
    this._enqueue(() => new Promise(r => { this.statusText.setText("Jump already moves forward in banana rows!"); r(); }));
  }

  jump() {
    this._enqueue(() => new Promise(resolve => {
      const row = this._currentRow;
      if (row >= 2) {
        this.statusText.setText('No jumping in the spider row — use Kick!');
        resolve(); return;
      }
      const dir = this.rowDir[row] || 1;
      this._currentCol++;                        // integrate the move
      const col = this._currentCol - 1;         // banana index
      if (window.GameAudio) window.GameAudio.jump();
      this.statusText.setText(`Jumping over banana in row ${row + 1}!`);
      const startY = this.gloria.y;
      const TOTAL  = 450;
      // Move in row direction simultaneously
      this.tweens.add({
        targets: this.gloria, x: this.gloria.x + dir * this.COL_STEP,
        duration: TOTAL, ease: 'Linear'
      });
      this.tweens.add({
        targets: this.gloria, y: startY - this.JUMP_HEIGHT,
        duration: TOTAL / 2, ease: 'Sine.easeOut',
        onComplete: () => {
          if (col >= 0 && col < this.COLS) {
            const colIdx = this.rowDir[row] === 1 ? col : (this.COLS - 1 - col);
            const b = this.bananaGrid[row][colIdx];
            if (b.visible) {
              this._bananaCount++;
              this.tweens.add({ targets: b, alpha: 0, duration: 100,
                onComplete: () => b.setVisible(false) });
            }
          }
          this.tweens.add({
            targets: this.gloria, y: startY,
            duration: TOTAL / 2, ease: 'Sine.easeIn',
            onComplete: resolve
          });
        }
      });
    }));
  }

  kick() {
    this._enqueue(() => new Promise(resolve => {
      // Kick only works in the spider row (row 2 exactly)
      if (this._currentRow !== 2) {
        this.statusText.setText(this._currentRow < 2
          ? 'No kicking in banana rows — use Jump!'
          : 'Already past the spider row!');
        resolve(); return;
      }
      const idx = this._kickIdx++;
      if (window.GameAudio) window.GameAudio.kick();
      this.statusText.setText(`Kicking spider ${idx + 1} — moving forward!`);
      this.gloria.setTexture('gloria_kick');
      this.tweens.add({
        targets: this.gloria, x: this.gloria.x + this.COL_STEP,
        duration: 320, ease: 'Linear',
        onComplete: () => {
          this.gloria.setTexture('gloria');
          if (idx < this.spiders.length) {
            this.tweens.add({ targets: this.spiders[idx], alpha: 0, duration: 100,
              onComplete: () => this.spiders[idx].setVisible(false) });
          }
          this._checkWin(); resolve();
        }
      });
    }));
  }

  nextRow() {
    this._enqueue(() => new Promise(resolve => {
      this._currentRow++;
      this._currentCol = 0;

      if (this._currentRow >= this.ROWS) {
        this._checkWin(); resolve(); return;
      }

      const nextDir    = this.rowDir[this._currentRow];
      const nextStartX = this.rowStartX[this._currentRow];
      const nextY      = this.rowY[this._currentRow] - Math.floor(GLORIA_H / 2) - 2;
      if (window.GameAudio) window.GameAudio.nextRow();
      this.statusText.setText(`Dropping to Row ${this._currentRow + 1} (goes ${nextDir === 1 ? 'left to right' : 'right to left'})! ⬇️`);

      this.tweens.add({
        targets: this.gloria,
        x: nextStartX,
        y: nextY,
        duration: 480, ease: 'Cubic.easeIn',
        onComplete: resolve
      });
    }));
  }

  duck() { this._enqueue(() => new Promise(r => { this.statusText.setText("No ducking here!"); r(); })); }

  _checkWin() {
    if (this._done) return;
    if (this._bananaCount >= this.COLS * 2 && this._kickIdx >= this.COLS) {
      this._done = true;
      this._actionQueue = this._actionQueue.then(() => {
        this.statusText.setText('THE GRAND GRID CLEARED! Nested + Sequential loops = MASTERY! 🧠');
        if (window.GameAudio) window.GameAudio.win();
        this.cameras.main.flash(800, 255, 180, 50);
        this.time.delayedCall(2200, () => showAhaMoment(4, () => goToScene(this, 'Level5', 5)));
      });
    }
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 5 — "The Gauntlet"
// 3 rows × (banana banana spider spider banana banana). All L→R.
// Pattern per row: JUMP JUMP  KICK KICK  JUMP JUMP
// Solution: Repeat 3 [ Repeat 2[Jump], Repeat 2[Kick], Repeat 2[Jump], Next Row ]
// Block limits: jump:1, kick:1, nextrow:1  (no duck needed)
// ─────────────────────────────────────────────────────────────────────────────
class Level5Scene extends BaseScene {
  constructor() { super({ key: 'Level5' }); }
  preload() {
    this.preloadShared();
    this.load.image('spider_g', ap('spider.png'));
  }

  create() {
    this.ROWS     = 3;
    this.STEP     = 90;       // px per action
    this.JUMP_H   = 55;
    this.ROW_Y0   = 120;
    this.ROW_STEP = 70;
    this.START_X  = 30;

    // bananas per row: 4 (idx 0-1 first half, idx 2-3 second half)
    // spiders per row: 2
    this.BANANAS_PER_ROW = 4;
    this.SPIDERS_PER_ROW = 2;

    this.cameras.main.setBackgroundColor('#1a0a2e');

    // ── Row platforms ──────────────────────────────────────────────────────
    const platColors = [0xe91e8c, 0x00bcd4, 0x9c27b0];
    this.rowY = [];
    for (let r = 0; r < this.ROWS; r++) {
      const py = this.ROW_Y0 + r * this.ROW_STEP;
      this.rowY.push(py);
      this.add.rectangle(400, py + 6, 800, 12, platColors[r]);
      this.add.text(14, py - 22, `ROW ${r + 1}`, { fontSize: '8px', color: '#ffffff88', fontStyle: 'bold' });
    }

    // ── Stars background ──────────────────────────────────────────────────
    const sg = this.add.graphics();
    sg.fillStyle(0xffffff, 0.6);
    [55,150,260,370,480,600,700,30,200,430,650,740].forEach((x,i) => {
      sg.fillCircle(x, 8 + (i % 5) * 6, 1.5);
    });

    // ── Zone labels (row 1 only for readability) ───────────────────────────
    // Gloria start=30, step=90
    // Bananas 1-2 midpoints: 75, 165  (x=30+45, 30+135+45)
    // Spiders midpoints:     255, 345
    // Bananas 3-4 midpoints: 435, 525
    const BANANA_XS = [75, 165, 435, 525];   // 4 bananas: jump×2, then jump×2
    const SPIDER_XS = [255, 345];             // 2 spiders in the middle: kick×2

    this.add.text(120, this.rowY[0] - 36, '🍌 JUMP×2', { fontSize: '8px', color: '#ffd600', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(300, this.rowY[0] - 36, '🕷 KICK×2', { fontSize: '8px', color: '#ff9988', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(480, this.rowY[0] - 36, '🍌 JUMP×2', { fontSize: '8px', color: '#ffd600', fontStyle: 'bold' }).setOrigin(0.5);

    // ── Obstacles ─────────────────────────────────────────────────────────
    this.bananaGrid = [];
    this.spiderGrid = [];

    for (let r = 0; r < this.ROWS; r++) {
      this.bananaGrid.push(
        BANANA_XS.map(x => this.placeBanana(x, this.rowY[r] - 4))
      );
      const spiderY = this.rowY[r] - 25;
      this.spiderGrid.push(
        SPIDER_XS.map(x => this.add.image(x, spiderY, 'spider_g').setDisplaySize(44, 44).setDepth(5))
      );
    }

    this.levelBanner('LEVEL 5: The Gauntlet', '#000000cc', '#ff6b35');

    this.gloriaStartX = this.START_X;
    this.gloriaFloorY = this.rowY[0] - Math.floor(GLORIA_H / 2) - 2;
    this.gloria = this.placeGloria(this.gloriaStartX, this.gloriaFloorY);

    this.statusText = this.statusLabel('Build your code and hit RUN! ▶', 300);

    this._actionQueue    = Promise.resolve();
    this._currentRow     = 0;
    this._jumpIdx        = 0;
    this._kickIdx        = 0;
    this._clearedBananas = 0;
    this._clearedSpiders = 0;
    this._done           = false;

    window._gloriaScene  = this;
    window.CURRENT_LEVEL = 5;
    if (window.GameMusic) window.GameMusic.playIfUnmuted('level5');
    this.applyLimits({ move: 0, jump: 1, duck: 0, kick: 1, nextrow: 1 });
    setLevelUI(5, 'The Gauntlet');
  }

  resetPosition() {
    this._currentRow     = 0;
    this._jumpIdx        = 0;
    this._kickIdx        = 0;
    this._clearedBananas = 0;
    this._clearedSpiders = 0;
    this._done           = false;
    this.gloria.setPosition(this.gloriaStartX, this.gloriaFloorY);
    for (let r = 0; r < this.ROWS; r++) {
      this.bananaGrid[r].forEach(b => { b.setVisible(true); b.setAlpha(1); });
      this.spiderGrid[r].forEach(s => { s.setVisible(true); s.setAlpha(1); });
    }
    this.statusText.setText('Jump, Kick, Jump every row — mix your moves!');
  }

  _enqueue(fn) { this._actionQueue = this._actionQueue.then(() => fn()); }

  jump() {
    this._enqueue(() => new Promise(resolve => {
      const row = this._currentRow;
      if (row >= this.ROWS) { this.statusText.setText('No more rows!'); resolve(); return; }
      const idx = this._jumpIdx++;
      if (window.GameAudio) window.GameAudio.jump();
      this.statusText.setText(`Row ${row + 1}: Jump ${idx + 1}! 🍌`);
      const startY = this.gloria.y;
      const TOTAL  = 440;
      this.tweens.add({ targets: this.gloria, x: this.gloria.x + this.STEP, duration: TOTAL, ease: 'Linear' });
      this.tweens.add({
        targets: this.gloria, y: startY - this.JUMP_H, duration: TOTAL / 2, ease: 'Sine.easeOut',
        onComplete: () => {
          if (idx < this.bananaGrid[row].length) {
            const b = this.bananaGrid[row][idx];
            if (b.visible) {
              this._clearedBananas++;
              this.tweens.add({ targets: b, alpha: 0, duration: 100, onComplete: () => b.setVisible(false) });
            }
          }
          this.tweens.add({ targets: this.gloria, y: startY, duration: TOTAL / 2, ease: 'Sine.easeIn', onComplete: resolve });
        }
      });
    }));
  }

  duck() {
    this._enqueue(() => new Promise(r => { this.statusText.setText('No ducking in The Gauntlet! Try Jump or Kick.'); r(); }));
  }

  kick() {
    this._enqueue(() => new Promise(resolve => {
      const row = this._currentRow;
      if (row >= this.ROWS) { this.statusText.setText('No more rows!'); resolve(); return; }
      const idx = this._kickIdx++;
      if (window.GameAudio) window.GameAudio.kick();
      this.statusText.setText(`Row ${row + 1}: Kick ${idx + 1}! 🕷`);
      this.gloria.setTexture('gloria_kick');
      this.tweens.add({
        targets: this.gloria, x: this.gloria.x + this.STEP, duration: 340, ease: 'Linear',
        onComplete: () => {
          this.gloria.setTexture('gloria');
          if (idx < this.spiderGrid[row].length) {
            const s = this.spiderGrid[row][idx];
            if (s.visible) {
              this._clearedSpiders++;
              this.tweens.add({ targets: s, alpha: 0, duration: 100, onComplete: () => s.setVisible(false) });
            }
          }
          this._checkWin(); resolve();
        }
      });
    }));
  }

  nextRow() {
    this._enqueue(() => new Promise(resolve => {
      this._currentRow++;
      this._jumpIdx = 0;
      this._kickIdx = 0;

      if (this._currentRow >= this.ROWS) {
        this._checkWin(); resolve(); return;
      }

      const nextY = this.rowY[this._currentRow] - Math.floor(GLORIA_H / 2) - 2;
      if (window.GameAudio) window.GameAudio.nextRow();
      this.statusText.setText(`Dropping to Row ${this._currentRow + 1}! ⬇️`);
      this.tweens.add({
        targets: this.gloria, x: this.START_X, y: nextY,
        duration: 500, ease: 'Cubic.easeIn',
        onComplete: resolve
      });
    }));
  }

  moveForward() {
    this._enqueue(() => new Promise(r => { this.statusText.setText('Jump or Kick to move forward!'); r(); }));
  }

  _checkWin() {
    if (this._done) return;
    const B_TARGET = this.ROWS * this.BANANAS_PER_ROW; // 12
    const S_TARGET = this.ROWS * this.SPIDERS_PER_ROW; // 6
    if (this._currentRow >= this.ROWS &&
        this._clearedBananas >= B_TARGET &&
        this._clearedSpiders >= S_TARGET) {
      this._done = true;
      this._actionQueue = this._actionQueue.then(() => {
        this.statusText.setText('🏆 THE GAUNTLET CLEARED! You are a LOOP MASTER!');
        if (window.GameAudio) window.GameAudio.win();
        this.cameras.main.flash(1000, 255, 180, 50);
        this.time.delayedCall(2200, () => showAhaMoment(5, () => goToScene(this, 'Level6', 6)));
      });
    }
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 6 — "Helicopter Rescue!"
// Climb 5 stair steps using Jump (which moves forward AND up). Brothers waiting!
// Solution: Repeat 5 [Jump]
// Block limits: jump: 1, move: 0
// ─────────────────────────────────────────────────────────────────────────────
class Level6Scene extends BaseScene {
  constructor() { super({ key: 'Level6' }); }
  preload() {
    this.preloadShared();
    this.load.image('helicopter', ap('helicopter.png'));
  }

  create() {
    this.NUM_STEPS = 5;
    this.STEP_W    = 110;   // horizontal advance per step
    this.STEP_H    = 46;    // vertical rise per step
    this.JUMP_H    = 64;    // extra arc height above target
    this.cameras.main.setBackgroundColor('#87CEEB');

    this.drawCloud(60, 35); this.drawCloud(310, 18); this.drawCloud(560, 45);
    this.levelBanner('LEVEL 6: Helicopter Rescue!', '#ffffffdd', '#1a237e');

    // Build step Y positions (stepY[0] = ground, stepY[5] = top)
    const BASE_Y = 295;
    this.stepY = [];
    for (let i = 0; i <= this.NUM_STEPS; i++) {
      this.stepY.push(BASE_Y - i * this.STEP_H);
    }

    // Draw staircase platforms
    const STEP_COLORS = [0x5d4037, 0x6d4c41, 0x795548, 0x8d6e63, 0xa1887f, 0xbcaaa4];
    for (let i = 0; i <= this.NUM_STEPS; i++) {
      const px = 30 + i * this.STEP_W;
      const py = this.stepY[i];
      const pw = (this.NUM_STEPS - i + 1) * this.STEP_W + 60;
      const realW = Math.min(pw, 800 - px);
      this.add.rectangle(px + realW / 2, py + 7, realW, 14, STEP_COLORS[i]);
      this.add.rectangle(px + realW / 2, py + 2, realW, 5, 0xd7ccc8);
      if (i > 0) {
        this.add.text(px + 8, py - 14, `STEP ${i}`,
          { fontSize: '7px', color: '#ffffff99', fontStyle: 'bold' });
      }
    }

    // Helicopter at top-right
    const HELI_X = 705;
    const HELI_Y = this.stepY[this.NUM_STEPS] - 52;
    this.add.image(HELI_X, HELI_Y, 'helicopter').setDisplaySize(130, 80).setDepth(5);

    // Hanging ladder from helicopter to top step
    const LAD_X   = HELI_X - 18;
    const LAD_TOP = HELI_Y + 20;
    const LAD_BOT = this.stepY[this.NUM_STEPS] - 2;
    const lg = this.add.graphics();
    lg.lineStyle(3, 0x8d6e63, 1);
    lg.strokeLineShape(new Phaser.Geom.Line(LAD_X - 8, LAD_TOP, LAD_X - 8, LAD_BOT));
    lg.strokeLineShape(new Phaser.Geom.Line(LAD_X + 8, LAD_TOP, LAD_X + 8, LAD_BOT));
    for (let ry = LAD_TOP + 8; ry < LAD_BOT; ry += 12) {
      lg.strokeLineShape(new Phaser.Geom.Line(LAD_X - 8, ry, LAD_X + 8, ry));
    }

    // Gloria starts on ground (step 0)
    this.gloriaStartX = 55;
    this.gloriaStartY = this.stepY[0] - Math.floor(GLORIA_H / 2) - 2;
    this.gloria = this.placeGloria(this.gloriaStartX, this.gloriaStartY);

    this.statusText = this.statusLabel('Build your code and hit RUN! ▶', 260);

    this._actionQueue = Promise.resolve();
    this._jumpCount = 0;
    this._done      = false;

    window._gloriaScene  = this;
    window.CURRENT_LEVEL = 6;
    if (window.GameMusic) window.GameMusic.playIfUnmuted('level6');
    this.applyLimits({ move: 0, jump: 1, duck: 999, kick: 999, nextrow: 999 });
    setLevelUI(6, 'Helicopter Rescue!');
  }

  resetPosition() {
    this.gloria.setPosition(this.gloriaStartX, this.gloriaStartY);
    this._jumpCount = 0; this._done = false;
    this.statusText.setText('Jump to climb each step — jump moves up AND forward!');
  }

  _enqueue(fn) { this._actionQueue = this._actionQueue.then(() => fn()); }

  jump() {
    this._enqueue(() => new Promise(resolve => {
      const stepNum  = Math.min(this._jumpCount + 1, this.NUM_STEPS);
      this._jumpCount++;
      const targetX  = 55 + stepNum * this.STEP_W;
      const targetY  = this.stepY[stepNum] - Math.floor(GLORIA_H / 2) - 2;
      const peakY    = Math.min(this.gloria.y, targetY) - this.JUMP_H;
      if (window.GameAudio) window.GameAudio.jump();
      this.statusText.setText(`Jumping to step ${stepNum}!`);
      // Move forward simultaneously with jump arc
      this.tweens.add({
        targets: this.gloria, x: targetX,
        duration: 560, ease: 'Sine.easeInOut'
      });
      this.tweens.add({
        targets: this.gloria, y: peakY,
        duration: 280, ease: 'Sine.easeOut',
        onComplete: () => this.tweens.add({
          targets: this.gloria, y: targetY,
          duration: 280, ease: 'Sine.easeIn',
          onComplete: () => { this._checkWin(); resolve(); }
        })
      });
    }));
  }

  moveForward() {
    this._enqueue(() => new Promise(r => { this.statusText.setText("Jump already moves up and forward!"); r(); }));
  }

  duck()    { this._enqueue(() => new Promise(r => { this.statusText.setText("No ducking needed!"); r(); })); }
  kick()    { this._enqueue(() => new Promise(r => { this.statusText.setText("No kicking needed!"); r(); })); }
  nextRow() { this._enqueue(() => new Promise(r => { this.statusText.setText("No rows here!"); r(); })); }

  _checkWin() {
    if (this._done) return;
    if (this._jumpCount >= this.NUM_STEPS) {
      this._done = true;
      this._actionQueue = this._actionQueue.then(() => {
        this.statusText.setText('You reached the helicopter! Gloria is saved!');
        if (window.GameAudio) window.GameAudio.win();
        this.cameras.main.flash(1000, 255, 240, 100);
        // Float Gloria up to helicopter then show ending screen
        this.tweens.add({
          targets: this.gloria, y: this.gloria.y - 55,
          duration: 900, ease: 'Sine.easeOut',
          onComplete: () => this.time.delayedCall(600, () => showAhaMoment(6, showEnding))
        });
      });
    }
  }
}


// ── Phaser Game Config ─────────────────────────────────────────────────────────
// Phaser is initialized LAZILY when the Play button is clicked so the canvas
// can size correctly against a visible container.
function initPhaser() {
  if (window.game) return; // already created
  const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 340,
    parent: 'phaser-container',
    dom: { createContainer: true },
    scene: [Level0Scene, Level1Scene, Level2Scene, Level3Scene, Level4Scene, Level5Scene, Level6Scene]
  };
  window.game = new Phaser.Game(config);
}


// ── Bridge ────────────────────────────────────────────────────────────────────
window.runGloriaCode = function(generatedCode) {
  const scene = window._gloriaScene;
  if (!scene) { console.error('Scene not ready!'); return; }

  scene._actionQueue = Promise.resolve();
  scene.resetPosition();

  window.gloriaMove    = () => scene.moveForward();
  window.gloriaJump    = () => scene.jump();
  window.gloriaDuck    = () => scene.duck();
  window.gloriaKick    = () => scene.kick();
  window.gloriaNextRow = () => scene.nextRow();

  console.log("Running:\n", generatedCode);
  try { eval(generatedCode); }
  catch (err) { console.error("Code error:", err); }

  // After all animations finish, check if we won; if not, show try-again
  scene._actionQueue.then(() => {
    if (!scene._done) {
      showTryAgain();
      setTimeout(() => {
        if (!scene._done) scene.resetPosition();
      }, 1800);
    }
  });
};
