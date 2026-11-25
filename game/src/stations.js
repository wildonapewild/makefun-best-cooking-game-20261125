// stations.js — tray stock and the reheating wok.
// Scooping empties trays; an empty (or nearly empty) tray can be sent to the
// wide wok, where a visible timer cooks a fresh batch back to full stock.

import { DISHES } from './recipes.js';

export class TrayStation {
  constructor() {
    this.stock = {};
    for (const d of DISHES) this.stock[d.id] = d.trayStock;
    this.wok = null; // { dishId, left, total }
  }

  scoop(id) {
    if (this.stock[id] <= 0) return false;
    this.stock[id] -= 1;
    return true;
  }

  isCritical(id) {
    return this.stock[id] <= 1;
  }

  // Start reheating a dish in the wok; only one batch at a time.
  startReheat(id) {
    if (this.wok) return false;
    const d = DISHES.find((x) => x.id === id);
    this.wok = { dishId: id, left: d.reheatSec, total: d.reheatSec };
    return true;
  }

  update(dt) {
    if (!this.wok) return;
    this.wok.left -= dt;
    if (this.wok.left <= 0) {
      const d = DISHES.find((x) => x.id === this.wok.dishId);
      this.stock[this.wok.dishId] = d.trayStock;
      this.wok = null;
    }
  }
}
