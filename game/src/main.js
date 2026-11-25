// main.js — Warteg Bahari Express game loop.
// Lunch rush at a modern Tegal buffet stall: read the ticket, scoop exactly
// the dishes it asks for from the glass case, watch tray stock (reheat in
// the wok before a tray runs dry), add sambal and kerupuk, then serve.

import { DISHES, makeTicket, ticketPrice } from './recipes.js';
import { OrderBoard } from './orders.js';
import { TrayStation } from './stations.js';
import { drawScene, TRAY_RECTS } from './render.js';
import { bindInput, trayAt } from './input.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;

function mulberry(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const params = new URLSearchParams(location.search);
const shot = params.get('shot');
const seed = parseInt(params.get('seed') || '7', 10);

class Game {
  constructor() { this.restart(); }

  restart() {
    this.rng = mulberry(seed * 977 + 13);
    this.board = new OrderBoard(this.rng);
    this.station = new TrayStation();
    this.plate = { rice: null, dishes: [], sambal: 0, kerupuk: false };
    this.readyPlate = null;
    this.readyLabel = '';
    this.coins = 0; this.served = 0; this.strikes = 0;
    this.shiftLeft = 180; this.over = false;
    this.flash = ''; this.flashColor = '#145236'; this.flashT = 0;
    this.banner = ''; this.subBanner = '';
    this.board.tickets.push(makeTicket(this.rng, 3));
    this.board.tickets.push(makeTicket(this.rng, 3));
  }

  get clockText() {
    const m = Math.max(0, Math.ceil(this.shiftLeft));
    return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;
  }

  get plateHint() {
    const t = this.board.active();
    if (!t) return 'tunggu tiket…';
    const need = t.dishes.filter((id) => !this.plate.dishes.includes(id)).length;
    return need ? `masih kurang ${need} lauk` : 'lauk lengkap — cek ekstra!';
  }

  scoop(id) {
    if (this.plate.dishes.includes(id)) { this.say('lauk itu sudah di piring', '#b3541e'); return; }
    if (this.plate.dishes.length >= 4) { this.say('piring penuh!', '#b3541e'); return; }
    if (!this.station.scoop(id)) { this.say('nampan HABIS — panaskan ulang di wajan!', '#d33a1f'); return; }
    this.plate.dishes.push(id);
    this.say('', '#145236');
  }

  setRice(id) { this.plate.rice = id; }
  addSambal() { this.plate.sambal = Math.min(2, this.plate.sambal + 1); }
  toggleKerupuk() { this.plate.kerupuk = !this.plate.kerupuk; }
  trashPlate() { this.plate = { rice: null, dishes: [], sambal: 0, kerupuk: false }; }

  reheatCritical() {
    const low = DISHES.map((d) => d.id).find((id) => this.station.isCritical(id));
    if (low) this.station.startReheat(low);
    else this.say('semua stok aman', '#145236');
  }

  matches(t) {
    return this.plate.rice === t.rice
      && this.plate.dishes.length === t.dishes.length
      && t.dishes.every((id) => this.plate.dishes.includes(id))
      && this.plate.sambal === t.sambal
      && this.plate.kerupuk === t.kerupuk;
  }

  serve() {
    const t = this.board.active();
    if (!t) return;
    if (!this.plate.rice) { this.say('isi nasi dulu!', '#b3541e'); return; }
    if (this.matches(t)) {
      const pay = ticketPrice(t) + Math.round(t.patience * 25); // patience bonus: fast hands earn more
      this.coins += pay; this.served += 1;
      this.readyPlate = { ...this.plate, dishes: [...this.plate.dishes] };
      this.readyLabel = `lunas Rp ${pay.toLocaleString('id-ID')} ✓`;
      this.board.remove(t);
      this.trashPlate();
      this.say(`+Rp ${pay.toLocaleString('id-ID')} — pas isi tiket!`, '#1d6a48');
    } else {
      this.say('isi piring belum persis tiket — perbaiki dulu', '#d33a1f');
    }
  }

  say(msg, color) { this.flash = msg; this.flashColor = color; this.flashT = 2.2; }

  handleClick(x, y) {
    if (this.over) { this.restart(); return; }
    const tray = trayAt(x, y);
    if (tray) {
      if (this.station.stock[tray.id] === 0) { this.station.startReheat(tray.id); return; }
      if (this.station.stock[tray.id] <= 1 && this.plate.dishes.includes(tray.id)) { this.station.startReheat(tray.id); return; }
      this.scoop(tray.id);
      return;
    }
    if (x >= 884 && x <= 1000 && y >= 264 && y <= 308) this.setRice('biasa');
    else if (x >= 1012 && x <= 1128 && y >= 264 && y <= 308) this.setRice('jumbo');
    else if (x >= 1140 && x <= 1240 && y >= 264 && y <= 308) this.addSambal();
    else if (x >= 884 && x <= 1054 && y >= 316 && y <= 350) this.toggleKerupuk();
    else if (x >= 866 && x <= 1258 && y >= 84 && y <= 204) this.reheatCritical();
    else if (x >= 396 && x <= 546 && y >= 500 && y <= 552) this.serve();
    else if (x >= 396 && x <= 546 && y >= 564 && y <= 604) this.trashPlate();
    else if (x >= 140 && x <= 340 && y >= 490 && y <= 610) {
      const t = this.board.active();
      if (t) this.say(this.matches(t) ? 'persis tiket — SAJIKAN!' : 'belum persis tiket', this.matches(t) ? '#1d6a48' : '#b3541e');
    }
  }

  update(dt) {
    if (this.over) return;
    this.shiftLeft -= dt;
    this.station.update(dt);
    this.board.update(dt, () => {
      this.strikes += 1;
      this.say('pelanggan pergi — strike!', '#d33a1f');
    });
    if (this.flashT > 0) { this.flashT -= dt; if (this.flashT <= 0) this.flash = ''; }
    if (this.shiftLeft <= 0 || this.strikes >= 3) {
      this.over = true;
      this.banner = this.strikes >= 3 ? 'SHIFT GAGAL — 3 STRIKE' : 'SHIFT SELESAI!';
      this.subBanner = `total Rp ${this.coins.toLocaleString('id-ID')} · ${this.served} piring saji · klik / Enter untuk main lagi`;
    }
  }

  draw() { drawScene(ctx, W, H, this); }
}

// --- deterministic screenshot scenes -------------------------------------
function buildShotScene(mode) {
  const g = new Game();
  const rng = mulberry(seed * 31 + 5);
  const t1 = makeTicket(rng, mode === 'cover' ? 3 : 4);
  t1.rice = 'jumbo'; t1.dishes = ['rendang', 'ayam', 'telur', ...(mode === 'cover' ? [] : ['tempe'])];
  t1.sambal = 2; t1.kerupuk = true; t1.patience = mode === 'rush' ? 14 : 38;
  const t2 = makeTicket(rng, 3);
  t2.dishes = ['tongkol', 'lodeh', 'tempe']; t2.sambal = 1; t2.kerupuk = false;
  t2.patience = mode === 'rush' ? 24 : 47;
  g.board.seedScene([t1, t2]);
  // plate mid-assembly: rice + two of the ticket dishes already scooped
  g.plate = { rice: 'jumbo', dishes: ['rendang', 'ayam'], sambal: 1, kerupuk: false };
  // one finished plate waiting on the pass
  g.readyPlate = { rice: 'biasa', dishes: ['telur', 'tempe', 'lodeh'], sambal: 1, kerupuk: true };
  g.readyLabel = 'siap saji — Rp 21.000 ✓';
  g.station.stock.ayam = mode === 'rush' ? 1 : 3;
  g.station.stock.rendang = 2;
  g.station.stock.tongkol = mode === 'rush' ? 0 : 2;
  g.station.stock.telur = 4; g.station.stock.tempe = 5; g.station.stock.lodeh = 3;
  g.station.wok = { dishId: 'tongkol', left: 4, total: 7 };
  g.shiftLeft = mode === 'rush' ? 74 : 132;
  g.coins = mode === 'serve' ? 86500 : 47500;
  g.served = mode === 'serve' ? 6 : 3;
  if (mode === 'cover') {
    g.banner = 'WARTEG BAHARI EXPRESS';
    g.subBanner = 'sendok lauk persis isi tiket — jangan sampai nampan kering!';
  } else if (mode === 'rush') {
    g.flash = 'JAM SIBUK! stok tongkol kritis — wajan bekerja…';
    g.flashColor = '#d33a1f';
  } else {
    g.flash = 'piring di pass siap saji — satu lagi sedang diisi!';
    g.flashColor = '#1d6a48';
  }
  return g;
}

if (shot === 'cover' || shot === 'rush' || shot === 'serve') {
  buildShotScene(shot).draw();
} else {
  const game = new Game();
  window.__warteg = game;
  bindInput(canvas, game);
  let last = performance.now();
  const frame = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    game.update(dt);
    game.draw();
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
