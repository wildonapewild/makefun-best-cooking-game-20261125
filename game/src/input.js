// input.js — mouse clicks on trays/buttons and keyboard shortcuts.

import { TRAY_RECTS } from './render.js';
import { DISHES } from './recipes.js';

export function bindInput(canvas, game) {
  canvas.addEventListener('click', (ev) => {
    const r = canvas.getBoundingClientRect();
    const x = (ev.clientX - r.left) * (canvas.width / r.width);
    const y = (ev.clientY - r.top) * (canvas.height / r.height);
    game.handleClick(x, y);
  });
  window.addEventListener('keydown', (ev) => {
    if (game.over) { if (ev.key === 'Enter' || ev.key === ' ') game.restart(); return; }
    const n = parseInt(ev.key, 10);
    if (n >= 1 && n <= DISHES.length) { game.scoop(DISHES[n - 1].id); return; }
    switch (ev.key.toLowerCase()) {
      case 'r': game.setRice('biasa'); break;
      case 'j': game.setRice('jumbo'); break;
      case 's': game.addSambal(); break;
      case 'k': game.toggleKerupuk(); break;
      case 'w': game.reheatCritical(); break;
      case ' ': case 'enter': ev.preventDefault(); game.serve(); break;
      case 'backspace': ev.preventDefault(); game.trashPlate(); break;
    }
  });
}

export function trayAt(x, y) {
  return TRAY_RECTS.find((t) => x >= t.x && x <= t.x + t.w && y >= t.y && y <= t.y + t.h) || null;
}
