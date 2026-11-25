// orders.js — the order board: ticket queue, patience drain, expiry strikes.

import { makeTicket } from './recipes.js';

export class OrderBoard {
  constructor(rng) {
    this.rng = rng;
    this.tickets = [];
    this.spawnTimer = 0;
    this.elapsed = 0;
  }

  // Later in the lunch rush tickets grow from 3 dishes to 4.
  dishCountNow() {
    return this.elapsed > 75 ? 4 : 3;
  }

  update(dt, onExpire) {
    this.elapsed += dt;
    this.spawnTimer -= dt;
    const want = this.elapsed > 40 ? 3 : 2;
    if (this.spawnTimer <= 0 && this.tickets.length < want) {
      this.tickets.push(makeTicket(this.rng, this.dishCountNow()));
      this.spawnTimer = this.elapsed > 40 ? 5 : 8;
    }
    for (const t of this.tickets) t.patience -= dt;
    const gone = this.tickets.filter((t) => t.patience <= 0);
    if (gone.length) {
      this.tickets = this.tickets.filter((t) => t.patience > 0);
      for (const t of gone) onExpire(t);
    }
  }

  active() {
    return this.tickets[0] || null;
  }

  remove(ticket) {
    this.tickets = this.tickets.filter((t) => t !== ticket);
  }

  // Frozen tickets for screenshot scenes.
  seedScene(list) {
    this.tickets = list;
  }
}
