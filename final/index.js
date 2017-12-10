const synth = new Tone.Synth().toMaster();
synth.triggerAttackRelease('C4', '8n');

const SLOT_WIDTH = 30;
const SLOT_HEIGHT = 30;
const NUM_WIDTH = 20;
const NUM_HEIGHT = 20;
const $board = document.querySelector('.board');

const Slot = {
  EMPTY: 'empty',
  ROAD: 'road',
  WALL: 'wall', // sound on bump
  HOLE: 'hole', // sound on 1-distance - continuous
  TRAP: 'trap', // sound on [0,1]-distance - pattern, same position on 0-distance
};

const board = new Array(NUM_HEIGHT);
for (let y = 0; y < NUM_HEIGHT; y++) {
  board[y] = new Array(NUM_WIDTH);
}

const $fragment = document.createDocumentFragment();

function getSlotId(x, y) { return `slot-${ x }-${ y }`; }

for (let x = 0; x < NUM_WIDTH; x++) {
for (let y = 0; y < NUM_HEIGHT; y++) {
    const $slot = document.createElement('div');
    $slot.setAttribute('id', getSlotId(x, y));
    $slot.classList.add('slot');
    $slot.style.left = `${ x * SLOT_WIDTH }px`;
    $slot.style.top = `${ y * SLOT_HEIGHT }px`;
    $fragment.appendChild($slot);
}
}

$board.appendChild($fragment);

let points = [
  [0, 0],
  [5, 0],
  [5, 5],
  [10, 5],
  [10, 19],
  [19, 19],
];

const MaxLengthRatio = {
  FORWARD: 0.7,
  NEUTRAL: 0.6,
  BACKWARD: 0.3,
};

function calculateMaxLengthRatio(direction, start, end) {
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  const forward = [
    dx > 0 ? 1 : (dx < 0 ? -1 : 0),
    dy > 0 ? 1 : (dy < 0 ? -1 : 0),
  ];

  if ((direction[0] !== 0 && direction[0] === forward[0]) ||
      (direction[1] !== 0 && direction[1] === forward[1])) {
    return MaxLengthRatio.FORWARD;
  }

  return MaxLengthRatio.BACKWARD;
}

function generatePath() {
  // pick start & end point
  const choices = [
    [[0, 0], [NUM_WIDTH - 1, NUM_HEIGHT - 1]],
    [[0, NUM_HEIGHT - 1], [NUM_WIDTH - 1, 0]],
  ];

  const choice = choices[Math.random() > 0.5 ? 0 : 1];
  if (Math.random() > 0.5) choice.reverse();

  const [start, end] = choice;

  console.log(start, ' -> ', end);
  points = [start];

  let lastDirection = [0, 0];
  let current = start;

  let counter = 0;
  let MAX = 30;

  // loop until it reachs to the end
  while ((current[0] !== end[0] || current[1] !== end[1]) && counter++ < MAX) {
    const directions = [
      [+1, 0], [-1, 0], [0, +1], [0, -1],
    ].filter(d => (
      Math.abs(d[0]) !== Math.abs(lastDirection[0])
    ));

    console.log(JSON.stringify(directions));

    const direction = directions[Math.floor(Math.random() * directions.length)];
    console.log('direction', direction);
    const ratio = calculateMaxLengthRatio(direction, start, end);
    const length = 2 + Math.floor(Math.random() * Math.min(NUM_WIDTH, NUM_HEIGHT) * ratio);
    console.log('direction', direction, 'ratio', ratio, 'length', length);
    const newX = current[0] + direction[0] * length;
    const newY = current[1] + direction[1] * length;

    const newCurrent = [
      Math.max(Math.min(NUM_WIDTH - 1, newX), 0),
      Math.max(Math.min(NUM_HEIGHT - 1, newY), 0),
    ];

    if (newCurrent[0] === current[0] && newCurrent[1] === current[1]) {
      console.log('same!');
      continue;
    }

    current = newCurrent;
    lastDirection = direction;
    points.push(newCurrent);
  }

  console.log('last point', current);
  console.log(current[0] === end[0] && current[1] === end[1])
  generate();
}

function generate() {
  const start = points[0];
  const end = points[points.length - 1];
  const $start = document.getElementById(getSlotId(start[0], start[1]));
  const $end = document.getElementById(getSlotId(end[0], end[1]));
  $start.classList.add('start');
  $end.classList.add('end');

  board[start[0]][start[1]] = Slot.ROAD;
  board[end[0]][end[1]] = Slot.ROAD;

  for (let i = 0; i < points.length - 1; i++) {
    _generate(points[i], points[i + 1]);
  }
}

function _generate(p0, p1) {
  const [minX, maxX] = p0[0] < p1[0] ? [p0[0], p1[0]] : [p1[0], p0[0]];
  const [minY, maxY] = p0[1] < p1[1] ? [p0[1], p1[1]] : [p1[1], p0[1]];

  for (let x = minX; x <= maxX; x++) {
  for (let y = minY; y <= maxY; y++) {
    if (board[x][y] === Slot.EMPTY) {
      board[x][y] = Math.random() < 0.7 ? Slot.ROAD : Slot.TRAP;
    }

    const $slot = document.getElementById(getSlotId(x, y));
    if (!$slot.classList.contains('path')) {
      $slot.classList.add('path');
    }
  }
  }
}

function pickSlotType() {
  // ROAD, WALL, HOLE, TRAP
  const value = Math.random();
  if (value < 0.3) return Slot.ROAD;
  else if (value < 0.50) return Slot.TRAP;
  else if (value < 0.75) return Slot.HOLE;

  return Slot.WALL;
}

function fillEmptySlots() {
  for (let x = 0; x < NUM_WIDTH; x++) {
  for (let y = 0; y < NUM_HEIGHT; y++) {
    if (board[x][y] !== Slot.EMPTY) continue;

    const type = pickSlotType();
    board[x][y] = type;
  }
  }
}

function renderSlots() {
  for (let x = 0; x < NUM_WIDTH; x++) {
  for (let y = 0; y < NUM_HEIGHT; y++) {
    document.getElementById(getSlotId(x, y)).classList.add(board[x][y]);
  }
  }
}

function reset() {
  for (let x = 0; x < NUM_WIDTH; x++) {
  for (let y = 0; y < NUM_HEIGHT; y++) {
    board[x][y] = Slot.EMPTY;

    document.getElementById(getSlotId(x, y)).classList
      .remove('path', 'start', 'end', Slot.ROAD, Slot.WALL, Slot.HOLE, Slot.TRAP);
  }
  }

  generatePath();
  fillEmptySlots();
  renderSlots();
}

reset();

window._reset = reset;
