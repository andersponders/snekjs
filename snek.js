/*
Copyright 2021 anders wahlberg
License: MIT
*/

// stateful vars
var SNEK_DIRECTION;
var STARTED = false;

var snek = {
    x: 0,
    y: 0,
    next: null
}

var food = {
  x: null,
  y: null,
}

const world_map = {
  width: null,
  height: null,
  px_width: 40,
  px_height: 40,
  el: null
}

// end: stateful vars

const CELL_PADDING = 4;

const TICK_DURATION = 200;

const Direction = {
  UP: "up",
  DOWN: "down",
  RIGHT: "right",
  LEFT: "left",
}

const outOfBounds = (head) => {
  return head.x < 0
      || head.y < 0
      || head.x > world_map.width
      || head.y > world_map.height
}

const snekCollision = (snek, other) => {
  let cur = snek;
  while (cur) {
    if (cur.x == other.x && cur.y == other.y) {
      return true;
    }
    cur = cur.next;
  }
  return false;
}

const moveSnek = (head) => {
  let px = head.x;
  let py = head.y;

  switch (SNEK_DIRECTION) {
    case Direction.UP:
      head.y -= 1;
      break;
    case Direction.DOWN:
      head.y += 1;
      break;
    case Direction.LEFT:
      head.x -= 1;
      break;
    case Direction.RIGHT:
      head.x += 1;
      break;
  }

  let tx;
  let ty;
  let cur = head.next;
  
  while (cur) {
    tx = cur.x;
    ty = cur.y;
    cur.x = px;
    cur.y = py;
    px = tx;
    py = ty;

    cur = cur.next;
  }
}

const foodCollision = (head) => {
  return head.x == food.x
    && head.y == food.y;
}

const copyTail = (head) => {
  let cur = head;
  while (cur.next) {
    cur = cur.next;
  }
  let newTail = {
    x: cur.x,
    y: cur.y,
    next: null
  }
  cur.next = newTail
}

const moveFood = () => {
  food.x = Math.floor(Math.random() * world_map.width)
  food.y = Math.floor(Math.random() * world_map.height)
  if (snekCollision(snek, food)) {
    moveFood()
  }
}

const render = (obj) => {
  if (!obj.el) {
    obj.el = document.createElement("div");
    obj.el.className = "gameNode"
    world_map.el.appendChild(obj.el);
    obj.el.style.width = `${world_map.px_width - 2 * CELL_PADDING}px`;
    obj.el.style.height = `${world_map.px_height - 2 * CELL_PADDING}px`;
  }
  obj.el.style.left = `${obj.x * world_map.px_width + CELL_PADDING}px`;
  obj.el.style.top = `${obj.y * world_map.px_height + CELL_PADDING}px`;
}

const renderSnek = (head) => {
  let cur = head;
  while (cur) {
    render(cur);
    cur = cur.next;
  }
}

const snekSize = (snek) => {
  let size = 1;
  let cur = snek;
  while (cur.next) {
    size++;
    cur = cur.next;
  }
  return size;
}

const gameOver = (old_snek) => {
  console.log(`game over :( snek: ${old_snek.x},${old_snek.y}`)
  window.alert(`game over :( snek was ${snekSize(old_snek)} feet long\n\nso sad :(`)
}

const newGame = () => {
  snek = {
    x: 0,
    y: 0,
    next: null
  }
  moveFood();
  event_loop();
}

function event_loop() {
  // move the snake
  moveSnek(snek)

  // check collision with map boundary
  // check collision with other parts of snek
  if (outOfBounds(snek)
    || snekCollision(snek.next, snek)) {
      // gameOver with the snek head, so it can count length etc.
      gameOver(snek);
      return;
  }

  // check collision with food
  if (foodCollision(snek)) {
    copyTail(snek)
    moveFood()
  }

  // MARK: render updated game state
  renderSnek(snek)
  render(food)

  console.log(`snek pos: ${snek.x},${snek.y} ------ food pos: ${food.x},${food.y}`)
  // run ev loop again
  setTimeout(event_loop, TICK_DURATION)
}


const bootstrap = () => {
  let body = document.getElementsByTagName("body")[0];
  let s = document.createElement("style");
  s.innerText = `
  .gameNode {
    background: #000;
    position: absolute;
  }

  #world {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    z-index: 999999;
    pointer-events: none;
  }`.replaceAll(" ", "").replaceAll("\n", "");
  body.appendChild(s);
  world_map.el = document.createElement("div");
  world_map.el.id = "world"
  body.appendChild(world_map.el);
  world_map.width = Math.floor(world_map.el.offsetWidth / world_map.px_width);
  world_map.height = Math.floor(world_map.el.offsetHeight / world_map.px_height);
  moveFood();
  event_loop();
}

document.addEventListener('readystatechange', (event) => {
  if (!STARTED) {
    STARTED = true;
    bootstrap();
  }
});

document.addEventListener('keyup', (event) => {
  switch (event.key) {
    case "ArrowUp":
      SNEK_DIRECTION = Direction.UP
    break;
    case "ArrowDown":
      SNEK_DIRECTION = Direction.DOWN
    break;
    case "ArrowLeft":
      SNEK_DIRECTION = Direction.LEFT
    break;
    case "ArrowRight":
      SNEK_DIRECTION = Direction.RIGHT
    break;
  }
  event.preventDefault();
});