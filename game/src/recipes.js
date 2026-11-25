// recipes.js — menu data for Warteg Bahari Express.
// Every dish lives in a steel tray inside the glass display case; the player
// scoops portions onto a plate until the plate matches the ticket exactly.

export const DISHES = [
  { id: 'ayam',    name: 'Ayam Goreng',  short: 'AYAM',    color: '#c97b2d', dark: '#8a4d14', trayStock: 6, reheatSec: 6, price: 7000 },
  { id: 'rendang', name: 'Rendang Sapi', short: 'RENDANG', color: '#7a3b1e', dark: '#4c2110', trayStock: 5, reheatSec: 8, price: 9000 },
  { id: 'telur',   name: 'Telur Balado', short: 'TELUR',   color: '#d84b2a', dark: '#93301a', trayStock: 6, reheatSec: 5, price: 5000 },
  { id: 'tempe',   name: 'Tempe Orek',   short: 'TEMPE',   color: '#b98a3e', dark: '#7d5a22', trayStock: 7, reheatSec: 4, price: 4000 },
  { id: 'lodeh',   name: 'Sayur Lodeh',  short: 'LODEH',   color: '#e8dcc0', dark: '#a89468', trayStock: 6, reheatSec: 7, price: 5000 },
  { id: 'tongkol', name: 'Ikan Tongkol', short: 'TONGKOL', color: '#8a97a5', dark: '#57626e', trayStock: 5, reheatSec: 7, price: 8000 },
];

export const RICE_SIZES = [
  { id: 'biasa', name: 'Nasi Biasa', price: 4000 },
  { id: 'jumbo', name: 'Nasi Jumbo', price: 6000 },
];

// A buffet ticket: one rice size, a set of dishes, sambal spoons, kerupuk.
export function makeTicket(rng, dishCount) {
  const pool = DISHES.map((d) => d.id);
  const picked = [];
  while (picked.length < dishCount) {
    const id = pool[Math.floor(rng() * pool.length)];
    if (!picked.includes(id)) picked.push(id);
  }
  return {
    rice: rng() < 0.4 ? 'jumbo' : 'biasa',
    dishes: picked,
    sambal: 1 + Math.floor(rng() * 2), // 1 or 2 spoonfuls
    kerupuk: rng() < 0.75,
    patienceMax: 55,
    patience: 55,
  };
}

export function ticketPrice(ticket) {
  let total = RICE_SIZES.find((r) => r.id === ticket.rice).price;
  for (const id of ticket.dishes) total += DISHES.find((d) => d.id === id).price;
  total += ticket.sambal * 1000 + (ticket.kerupuk ? 2000 : 0);
  return total;
}

export function dishById(id) {
  return DISHES.find((d) => d.id === id);
}
