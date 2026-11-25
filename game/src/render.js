// render.js — every picture in Warteg Bahari Express is drawn here with
// canvas code: green ceramic tiles, a steel counter, a glass display case
// full of trays, plates being filled, the wok, and the ready pass.

import { DISHES, RICE_SIZES, dishById } from './recipes.js';

export const TRAY_RECTS = [];
export const WOK_RECT = { x: 872, y: 300, w: 380, h: 118 };
export const PASS_RECT = { x: 872, y: 452, w: 380, h: 150 };

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function text(ctx, s, x, y, size, color, align = 'left', bold = true) {
  ctx.fillStyle = color;
  ctx.font = `${bold ? '700' : '400'} ${size}px 'Trebuchet MS', sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(s, x, y);
}

// One portion of a dish, drawn as a little mound with its own silhouette.
export function drawPortion(ctx, cx, cy, s, dish) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = dish.color;
  ctx.beginPath();
  ctx.ellipse(0, 0, s, s * 0.62, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = dish.dark;
  if (dish.id === 'ayam') { // drumstick bone
    ctx.fillRect(-s * 0.1, -s * 0.15, s * 0.75, s * 0.22);
    ctx.fillStyle = '#f3e6cf';
    ctx.beginPath(); ctx.arc(s * 0.72, -s * 0.04, s * 0.16, 0, Math.PI * 2); ctx.fill();
  } else if (dish.id === 'rendang') {
    for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.arc(i * s * 0.4, (i % 2) * 3, s * 0.3, 0, Math.PI * 2); ctx.fill(); }
  } else if (dish.id === 'telur') { // egg half with yolk
    ctx.fillStyle = '#fdf6e3';
    ctx.beginPath(); ctx.ellipse(0, 0, s * 0.72, s * 0.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f2a81d';
    ctx.beginPath(); ctx.arc(0, 0, s * 0.28, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(216,75,42,.55)';
    ctx.beginPath(); ctx.ellipse(0, -s * 0.3, s * 0.8, s * 0.18, 0, 0, Math.PI * 2); ctx.fill();
  } else if (dish.id === 'tempe') {
    for (let i = 0; i < 3; i++) ctx.fillRect(-s * 0.7 + i * s * 0.45, -s * 0.28, s * 0.36, s * 0.56);
  } else if (dish.id === 'lodeh') {
    ctx.strokeStyle = '#7fae4c'; ctx.lineWidth = 3;
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-s * 0.6, i * 4 - 4); ctx.lineTo(s * 0.6, i * 5 - 5); ctx.stroke(); }
    ctx.fillStyle = '#e2703a';
    ctx.beginPath(); ctx.arc(s * 0.3, -s * 0.2, s * 0.18, 0, Math.PI * 2); ctx.fill();
  } else if (dish.id === 'tongkol') { // fish steak cross-section
    ctx.fillStyle = '#d9c8b4';
    ctx.beginPath(); ctx.ellipse(0, 0, s * 0.66, s * 0.44, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = dish.dark;
    ctx.beginPath(); ctx.arc(0, 0, s * 0.14, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function drawPlateContents(ctx, cx, cy, plate) {
  // rice mound
  if (plate.rice) {
    const r = plate.rice === 'jumbo' ? 44 : 34;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.ellipse(cx, cy + 6, r, r * 0.66, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#e9e4d8';
    ctx.beginPath(); ctx.ellipse(cx, cy - 2, r * 0.6, r * 0.4, 0, 0, Math.PI * 2); ctx.fill();
  }
  plate.dishes.forEach((id, i) => {
    const a = (i / Math.max(3, plate.dishes.length)) * Math.PI * 2 - 0.6;
    drawPortion(ctx, cx + Math.cos(a) * 52, cy + Math.sin(a) * 26 + 4, 21, dishById(id));
  });
  if (plate.sambal > 0) {
    ctx.fillStyle = '#c1270f';
    ctx.beginPath(); ctx.ellipse(cx - 58, cy - 24, 13 + plate.sambal * 3, 9, 0, 0, Math.PI * 2); ctx.fill();
  }
  if (plate.kerupuk) {
    ctx.fillStyle = '#f6e3bb';
    ctx.strokeStyle = '#d9b878'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(cx + 60, cy - 26, 17, 12, 0.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(cx + 70, cy - 14, 13, 9, -0.4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  }
}

function drawPlate(ctx, cx, cy, plate, label) {
  ctx.fillStyle = 'rgba(0,0,0,.18)';
  ctx.beginPath(); ctx.ellipse(cx, cy + 52, 96, 14, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fdfdf8';
  ctx.beginPath(); ctx.ellipse(cx, cy, 92, 52, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#2e7d5b'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.ellipse(cx, cy, 92, 52, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(cx, cy, 70, 38, 0, 0, Math.PI * 2);
  ctx.strokeStyle = '#bcd8cc'; ctx.lineWidth = 2; ctx.stroke();
  if (plate) drawPlateContents(ctx, cx, cy, plate);
  if (label) text(ctx, label, cx, cy + 72, 17, '#173d2c', 'center');
}

function drawTicket(ctx, t, x, y, w, active) {
  ctx.fillStyle = active ? '#fffbe8' : '#f4efdd';
  rr(ctx, x, y, w, 104, 8); ctx.fill();
  ctx.strokeStyle = active ? '#d9930d' : '#b9ac83'; ctx.lineWidth = active ? 3 : 1.5; ctx.stroke();
  text(ctx, (active ? '▶ AKTIF · ' : 'TIKET · ') + (t.rice === 'jumbo' ? 'NASI JUMBO' : 'NASI BIASA'), x + 12, y + 15, 13.5, '#5b4512');
  t.dishes.forEach((id, i) => {
    const d = dishById(id);
    ctx.fillStyle = d.color;
    ctx.beginPath(); ctx.arc(x + 20, y + 33 + i * 15, 5.5, 0, Math.PI * 2); ctx.fill();
    text(ctx, d.name, x + 34, y + 33 + i * 15, 13, '#33302a', 'left', false);
  });
  const extras = [];
  if (t.sambal) extras.push(`sambal ×${t.sambal}`);
  if (t.kerupuk) extras.push('kerupuk');
  text(ctx, extras.join('  +  ') || 'tanpa ekstra', x + 12, y + 33 + t.dishes.length * 15 + 4, 12, '#7a4a12', 'left', false);
  // patience bar (bottom-right, clear of the title)
  const frac = Math.max(0, t.patience / t.patienceMax);
  ctx.fillStyle = '#ddd3ae'; rr(ctx, x + w - 104, y + 82, 92, 11, 5); ctx.fill();
  ctx.fillStyle = frac > 0.45 ? '#3f9e4d' : frac > 0.22 ? '#e09a1f' : '#d33a1f';
  if (frac > 0) { rr(ctx, x + w - 104, y + 82, 92 * frac, 11, 5); ctx.fill(); }
  text(ctx, 'sabar', x + w - 58, y + 70, 10.5, '#8a7a4a', 'center', false);
}

export function drawScene(ctx, W, H, s) {
  // wall of green ceramic tiles
  ctx.fillStyle = '#dcefe4'; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(46,125,91,.16)'; ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 42) { ctx.beginPath(); ctx.moveTo(x, 74); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 74; y < H; y += 42) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

  // top banner — hand-painted style sign
  const grad = ctx.createLinearGradient(0, 0, 0, 72);
  grad.addColorStop(0, '#1d6a48'); grad.addColorStop(1, '#145236');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, W, 72);
  ctx.fillStyle = '#f7c948'; ctx.fillRect(0, 68, W, 4);
  text(ctx, 'WARTEG BAHARI EXPRESS', 26, 30, 30, '#ffffff');
  text(ctx, 'nasi + 3 lauk · sambal · kerupuk — ambil sendiri dari etalase!', 27, 56, 14.5, '#cdeeda', 'left', false);
  // shift clock — the big visible timer
  ctx.fillStyle = '#0d3524'; rr(ctx, 872, 10, 180, 52, 10); ctx.fill();
  text(ctx, '⏱ SHIFT ' + s.clockText, 962, 30, 23, '#ffd94d', 'center');
  text(ctx, 'jam makan siang', 962, 52, 11.5, '#a8d8bf', 'center', false);
  text(ctx, `🪙 Rp ${s.coins.toLocaleString('id-ID')}`, 1072, 24, 19, '#ffffff');
  text(ctx, `skor ${s.served} saji · strike ${s.strikes}/3`, 1072, 50, 14, '#ffe9a8', 'left', false);

  // order board (left)
  ctx.fillStyle = '#8a5a2b'; rr(ctx, 12, 84, 300, 330, 10); ctx.fill();
  ctx.fillStyle = '#6e4520'; rr(ctx, 20, 92, 284, 314, 8); ctx.fill();
  text(ctx, '📋 PAPAN PESANAN', 162, 112, 18, '#ffe9a8', 'center');
  s.board.tickets.slice(0, 2).forEach((t, i) => drawTicket(ctx, t, 28, 126 + i * 116, 268, i === 0));
  if (!s.board.tickets.length) text(ctx, 'menunggu pelanggan…', 162, 250, 15, '#ffe9a8', 'center', false);

  // glass display case with six trays (centre)
  ctx.fillStyle = '#9aa7ad'; rr(ctx, 326, 84, 530, 330, 12); ctx.fill();
  ctx.fillStyle = '#cfe8dd'; rr(ctx, 336, 94, 510, 310, 9); ctx.fill();
  text(ctx, 'ETALASE LAUK — klik nampan untuk menyendok', 591, 112, 16.5, '#145236', 'center');
  TRAY_RECTS.length = 0;
  DISHES.forEach((d, i) => {
    const tx = 348 + (i % 3) * 168, ty = 126 + Math.floor(i / 3) * 138;
    TRAY_RECTS.push({ x: tx, y: ty, w: 156, h: 126, id: d.id });
    ctx.fillStyle = '#7c8a90'; rr(ctx, tx, ty, 156, 126, 8); ctx.fill();
    ctx.fillStyle = '#e8ecec'; rr(ctx, tx + 6, ty + 6, 144, 78, 6); ctx.fill();
    const stock = s.station.stock[d.id];
    for (let p = 0; p < Math.min(stock, 5); p++) {
      drawPortion(ctx, tx + 34 + (p % 3) * 44, ty + 30 + Math.floor(p / 3) * 30, 17, d);
    }
    if (stock === 0) text(ctx, 'HABIS!', tx + 78, ty + 45, 20, '#d33a1f', 'center');
    text(ctx, d.name, tx + 78, ty + 98, 14.5, '#20312a', 'center');
    const crit = s.station.isCritical(d.id);
    ctx.fillStyle = crit ? '#d33a1f' : '#2e7d5b';
    rr(ctx, tx + 38, ty + 108, 80, 13, 6); ctx.fill();
    text(ctx, `stok ${stock}`, tx + 78, ty + 114.5, 11, '#ffffff', 'center');
  });
  // glass shine
  ctx.fillStyle = 'rgba(255,255,255,.14)';
  ctx.beginPath(); ctx.moveTo(360, 404); ctx.lineTo(560, 94); ctx.lineTo(660, 94); ctx.lineTo(460, 404); ctx.fill();

  // wok reheating station (right top)
  ctx.fillStyle = '#54636a'; rr(ctx, 866, 84, 392, 120, 10); ctx.fill();
  text(ctx, '🔥 WAJAN PANAS ULANG', 1062, 104, 16.5, '#ffd9a8', 'center');
  ctx.fillStyle = '#2b2f31';
  ctx.beginPath(); ctx.ellipse(1062, 152, 92, 30, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#3d4448';
  ctx.beginPath(); ctx.ellipse(1062, 146, 80, 24, 0, 0, Math.PI * 2); ctx.fill();
  if (s.station.wok) {
    const d = dishById(s.station.wok.dishId);
    drawPortion(ctx, 1042, 144, 20, d); drawPortion(ctx, 1080, 148, 18, d);
    const f = 1 - s.station.wok.left / s.station.wok.total;
    ctx.fillStyle = '#222'; rr(ctx, 916, 182, 292, 13, 6); ctx.fill();
    ctx.fillStyle = '#ff8c2e'; rr(ctx, 916, 182, 292 * f, 13, 6); ctx.fill();
    text(ctx, `memanaskan ${d.name}… ${Math.ceil(s.station.wok.left)} dtk`, 1062, 168, 13, '#ffffff', 'center');
  } else {
    text(ctx, 'klik nampan stok kritis', 1062, 138, 13.5, '#d7dee1', 'center', false);
    text(ctx, 'untuk goreng/panaskan ulang', 1062, 160, 13.5, '#d7dee1', 'center', false);
  }
  text(ctx, 'stok kritis = merah · wajan sibuk = tunggu', 1062, 214, 12, '#54636a', 'center', false);

  // rice + extras counter (right middle)
  ctx.fillStyle = '#b9c4c7'; rr(ctx, 866, 228, 392, 130, 10); ctx.fill();
  text(ctx, 'MEJA NASI & EKSTRA', 1062, 248, 16, '#145236', 'center');
  RICE_SIZES.forEach((r, i) => {
    const bx = 884 + i * 128;
    ctx.fillStyle = s.plate.rice === r.id ? '#ffd94d' : '#ffffff';
    rr(ctx, bx, 264, 116, 44, 9); ctx.fill();
    ctx.strokeStyle = '#2e7d5b'; ctx.lineWidth = 2; ctx.stroke();
    text(ctx, r.name, bx + 58, 286, 14.5, '#20312a', 'center');
  });
  ctx.fillStyle = s.plate.sambal > 0 ? '#ffd94d' : '#ffffff';
  rr(ctx, 1140, 264, 100, 44, 9); ctx.fill(); ctx.strokeStyle = '#c1270f'; ctx.stroke();
  text(ctx, `Sambal ×${s.plate.sambal}`, 1190, 286, 14, '#8f1d0a', 'center');
  ctx.fillStyle = '#fff4d6'; rr(ctx, 884, 316, 170, 34, 9); ctx.fill();
  ctx.strokeStyle = '#d9b878'; ctx.stroke();
  text(ctx, s.plate.kerupuk ? '✓ Kerupuk di piring' : '+ Kerupuk', 969, 333, 14, '#7a5a12', 'center');
  ctx.fillStyle = '#e8f3ec'; rr(ctx, 1066, 316, 174, 34, 9); ctx.fill();
  ctx.strokeStyle = '#2e7d5b'; ctx.stroke();
  text(ctx, 'klik piring = cek tiket', 1153, 333, 12.5, '#145236', 'center', false);

  // steel assembly counter (bottom)
  ctx.fillStyle = '#aeb9bd'; ctx.fillRect(0, 428, W, H - 428);
  ctx.fillStyle = '#98a5a9'; ctx.fillRect(0, 428, W, 8);
  for (let x = 0; x < W; x += 90) { ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fillRect(x, 436, 2, H - 436); }

  // plate being assembled
  text(ctx, '🍽 PIRING SEDANG DIISI', 240, 458, 18, '#145236', 'center');
  drawPlate(ctx, 240, 548, s.plate, s.plateHint);
  // serve + trash buttons
  ctx.fillStyle = '#1d6a48'; rr(ctx, 396, 500, 150, 52, 12); ctx.fill();
  text(ctx, 'SAJIKAN ⏎', 471, 526, 19, '#ffffff', 'center');
  ctx.fillStyle = '#8a3b2a'; rr(ctx, 396, 564, 150, 40, 10); ctx.fill();
  text(ctx, 'Buang piring ⌫', 471, 584, 14.5, '#ffffff', 'center');
  text(ctx, 'tombol 1–6 lauk · R nasi · J jumbo', 471, 632, 12.5, '#44565c', 'center', false);
  text(ctx, 'S sambal · K kerupuk · W panaskan', 471, 652, 12.5, '#44565c', 'center', false);

  // ready pass (right bottom)
  ctx.fillStyle = '#7c5a33'; rr(ctx, PASS_RECT.x - 6, PASS_RECT.y - 26, PASS_RECT.w + 12, PASS_RECT.h + 78, 10); ctx.fill();
  text(ctx, '⭐ PASS — SIAP SAJI', 1062, 452, 17, '#ffe9a8', 'center');
  if (s.readyPlate) {
    drawPlate(ctx, 1062, 548, s.readyPlate, s.readyLabel);
  } else {
    text(ctx, 'belum ada piring jadi', 1062, 548, 15, '#e8dcc0', 'center', false);
  }

  if (s.banner) {
    ctx.fillStyle = 'rgba(13,53,36,.88)'; rr(ctx, 330, 660, 620, 108, 14); ctx.fill();
    ctx.strokeStyle = '#f7c948'; ctx.lineWidth = 3; ctx.stroke();
    text(ctx, s.banner, 640, 700, 30, '#ffd94d', 'center');
    text(ctx, s.subBanner || '', 640, 738, 16, '#eaf7ef', 'center', false);
  }
  if (s.flash) {
    ctx.fillStyle = 'rgba(255,251,232,.92)';
    const fw = Math.min(760, 24 + s.flash.length * 11.5);
    rr(ctx, 640 - fw / 2, 392, fw, 34, 17); ctx.fill();
    text(ctx, s.flash, 640, 409, 20, s.flashColor || '#145236', 'center');
  }
}
