/**
 * The "get ready" checklist. Advice is limited to what ReadyNC and Ready.gov state on their winter-weather
 * pages (layers, closing off rooms, never heating with a stove or grill, generators outdoors 20 ft from
 * openings, CO detectors with battery backup, spare batteries, medications, public shelters) plus
 * plain-sense items (charge phones, check on neighbors).
 */
export const CATEGORIES = [
  ['before', 'Before a storm'],
  ['out', 'If power goes out'],
  ['heat', 'Electric heat'],
  ['medical', 'Medical needs'],
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
    id: 'care',
    cat: 'before',
    icon: 'people',
    title: 'Plan for kids and pets',
    why: 'Warm gear, food, and a safe spot.',
    short: 'plan for kids and pets',
    when: (a) => (a.people || []).some((p) => p === 'kids' || p === 'pets'),
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
    when: (a) => a.heat === 'electric',
  },
  {
    id: 'warm',
    cat: 'heat',
    icon: 'pin',
    title: 'Pick a warm place to go',
    why: 'Public shelters open in extreme cold.',
    short: 'pick a warm place to go',
    when: (a) => a.heat === 'electric',
  },
  {
    id: 'meds',
    cat: 'medical',
    icon: 'pill',
    title: 'Gather your medications',
    why: 'Keep each person’s needs in mind.',
    short: 'gather your medications',
    when: (a) => a.medical === 'yes',
  },
  {
    id: 'devices',
    cat: 'medical',
    icon: 'bolt',
    title: 'Plan power for medical devices',
    why: 'Ask your provider about backup.',
    short: 'plan power for medical devices',
    when: (a) => a.medical === 'yes',
  },
  {
    id: 'numbers',
    cat: 'medical',
    icon: 'phone',
    title: 'Save key phone numbers',
    why: 'Doctor, pharmacy, and a friend.',
    short: 'save key phone numbers',
    when: (a) => a.medical === 'yes',
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
export const SETUP_STEPS = [
  {
    key: 'heat',
    title: 'How do you heat your home?',
    multi: false,
    options: [
      ['electric', 'Electric', 'bolt'],
      ['gas', 'Gas or oil', 'flame'],
      ['other', 'Wood or other', 'home'],
    ],
  },
  {
    key: 'medical',
    title: 'Does anyone rely on medical equipment?',
    multi: false,
    options: [
      ['yes', 'Yes', 'pill'],
      ['no', 'No', 'check'],
    ],
  },
  {
    key: 'people',
    title: 'Who else lives with you?',
    multi: true,
    options: [
      ['older', 'Older adult', 'people'],
      ['kids', 'Young kids', 'home'],
      ['pets', 'Pets', 'flame'],
    ],
  },
];
export function readyItems(answers = {}) {
  return ITEMS.filter((item) => !item.when || item.when(answers));
}
export function enabledCategories(answers = {}) {
  const used = new Set(readyItems(answers).map((i) => i.cat));
  return CATEGORIES.filter(([id]) => used.has(id));
}
export function readyProgress(answers, checked) {
  const items = readyItems(answers);
  const done = items.filter((item) => checked.includes(item.id));
  const next = items.find((item) => !checked.includes(item.id));
  return { total: items.length, done: done.length, next: next || null };
}
export function readyStatus({ done, total }) {
  if (!total || done === 0) return 'Let’s get started';
  if (done === total) return 'You’re ready';
  return done / total >= 0.6 ? 'Almost ready' : 'Keep going';
}
