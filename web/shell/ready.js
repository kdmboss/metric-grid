import { enabledFlags } from '../household/household.js';

/**
 * The "get ready" checklist. Advice is limited to what ReadyNC and Ready.gov state on their winter-weather
 * pages (layers, closing off rooms, never heating with a stove or grill, generators outdoors 20 ft from
 * openings, CO detectors with battery backup, spare batteries, medications, public shelters) plus
 * plain-sense items (charge phones, check on neighbors). Household answers (see household.js) switch on
 * extra categories and move the most important ones to the front.
 */
export const CATEGORIES = [
  ['before', 'Before a storm'],
  ['out', 'If power goes out'],
  ['heat', 'Electric heat'],
  ['medical', 'Medical needs'],
  ['help', 'Getting help leaving'],
  ['after', 'After'],
];
const ITEMS = [
  {
    id: 'layers',
    cat: 'before',
    icon: 'shirt',
    title: 'Set out warm layers',
    why: 'Dress warm before the power fails.',
    short: 'set out warm layers',
  },
  {
    id: 'charge',
    cat: 'before',
    icon: 'battery',
    title: 'Charge phones and power banks',
    why: 'Keep calls and alerts working.',
    short: 'charge power banks',
  },
  {
    id: 'light',
    cat: 'before',
    icon: 'flashlight',
    title: 'Stock flashlight batteries',
    why: 'Extra batteries for flashlights and radios.',
    short: 'stock flashlight batteries',
  },
  {
    id: 'center',
    cat: 'before',
    icon: 'pin',
    title: 'Know your nearest shelter',
    why: 'Call 2-1-1 if you’re not sure.',
    short: 'find your nearest shelter',
  },
  {
    id: 'room',
    cat: 'out',
    icon: 'home',
    title: 'Close off unused rooms',
    why: 'Conserves heat in one room.',
    short: 'close off unused rooms',
  },
  {
    id: 'stove',
    cat: 'out',
    icon: 'flame',
    title: 'Never heat with a stove',
    why: 'Grills and camp stoves too.',
    short: 'review stove safety',
  },
  {
    id: 'outdoors',
    cat: 'out',
    icon: 'wind',
    title: 'Run generators outdoors only',
    why: 'At least 20 feet from windows.',
    short: 'plan generator safety',
  },
  {
    id: 'co',
    cat: 'out',
    icon: 'shield',
    title: 'Check your CO alarm',
    why: 'Use battery backups on every level.',
    short: 'check your CO alarm',
  },
  {
    id: 'noheat',
    cat: 'heat',
    icon: 'thermometer',
    title: 'Plan for no electric heat',
    why: 'Heat stops when the power does.',
    short: 'plan for no electric heat',
    when: (a) => enabledFlags(a).heat,
  },
  {
    id: 'warm',
    cat: 'heat',
    icon: 'pin',
    title: 'Pick a warm place to go',
    why: 'Public shelters open in extreme cold.',
    short: 'pick a warm place to go',
    when: (a) => enabledFlags(a).heat,
  },
  {
    id: 'meds',
    cat: 'medical',
    icon: 'pill',
    title: 'Gather your medications',
    why: 'Keep each person’s needs in mind.',
    short: 'gather your medications',
    when: (a) => enabledFlags(a).medical,
  },
  {
    id: 'devices',
    cat: 'medical',
    icon: 'bolt',
    title: 'Plan power for medical devices',
    why: 'Ask your provider about backup.',
    short: 'plan power for medical devices',
    when: (a) => enabledFlags(a).medical,
  },
  {
    id: 'numbers',
    cat: 'medical',
    icon: 'phone',
    title: 'Save key phone numbers',
    why: 'Doctor, pharmacy, and a friend.',
    short: 'save key phone numbers',
    when: (a) => enabledFlags(a).medical,
  },
  {
    id: 'ride',
    cat: 'help',
    icon: 'people',
    title: 'Line up a ride',
    why: 'Someone who can drive you out.',
    short: 'line up a ride',
    when: (a) => enabledFlags(a).help,
  },
  {
    id: 'buddy',
    cat: 'help',
    icon: 'phone',
    title: 'Ask someone to check on you',
    why: 'A neighbor or family member.',
    short: 'ask someone to check on you',
    when: (a) => enabledFlags(a).help,
  },
  {
    id: 'neighbors',
    cat: 'after',
    icon: 'people',
    title: 'Check on your neighbors',
    why: 'Especially older adults.',
    short: 'check on your neighbors',
  },
  {
    id: 'restock',
    cat: 'after',
    icon: 'battery',
    title: 'Restock batteries and supplies',
    why: 'Be ready for the next outage.',
    short: 'restock supplies',
  },
];
export function readyItems(answers = {}) {
  return ITEMS.filter((item) => !item.when || item.when(answers));
}
/** Most important first: medical, getting help, electric heat, then the standard order. */
export function enabledCategories(answers = {}) {
  const used = new Set(readyItems(answers).map((i) => i.cat));
  const front = ['medical', 'help', 'heat'];
  const rank = (id) =>
    front.includes(id) ? front.indexOf(id) - 10 : CATEGORIES.findIndex((c) => c[0] === id);
  return CATEGORIES.filter(([id]) => used.has(id)).sort((a, b) => rank(a[0]) - rank(b[0]));
}
export function readyProgress(answers, checked) {
  const cats = enabledCategories(answers).map(([id]) => id);
  const items = readyItems(answers).sort((a, b) => cats.indexOf(a.cat) - cats.indexOf(b.cat));
  const done = items.filter((item) => checked.includes(item.id));
  const next = items.find((item) => !checked.includes(item.id));
  return { total: items.length, done: done.length, next: next || null };
}
export function readyStatus({ done, total }) {
  if (!total || done === 0) return 'Let’s get started';
  if (done === total) return 'You’re ready';
  return done / total >= 0.6 ? 'Almost ready' : 'Keep going';
}
