/** The "get ready" checklist: a short base list, plus items that depend on the setup answers. */
export const SECTIONS = [
  ['warmth', 'Warmth', 'snowflake'],
  ['power', 'Power', 'bolt'],
  ['safety', 'Safety', 'shield'],
  ['people', 'People', 'people'],
];
const ITEMS = [
  {
    id: 'layers',
    section: 'warmth',
    title: 'Set out warm layers and blankets',
    short: 'set out warm layers',
  },
  {
    id: 'room',
    section: 'warmth',
    title: 'Pick one room to stay in',
    short: 'pick a room to stay in',
  },
  {
    id: 'center',
    section: 'warmth',
    title: 'Know your nearest warming center',
    short: 'find a warming center',
  },
  {
    id: 'charge',
    section: 'power',
    title: 'Charge phones and power banks',
    short: 'charge power banks',
  },
  {
    id: 'light',
    section: 'power',
    title: 'Keep flashlights and batteries handy',
    short: 'find flashlights',
  },
  {
    id: 'backup',
    section: 'power',
    title: 'Test your generator or battery',
    short: 'test your backup power',
    when: (a) => a.backup && a.backup !== 'none',
  },
  {
    id: 'stove',
    section: 'safety',
    title: 'Never heat with a stove, oven, or grill',
    short: 'review stove safety',
  },
  {
    id: 'co',
    section: 'safety',
    title: 'Check your carbon monoxide alarm',
    short: 'check your CO alarm',
  },
  {
    id: 'outdoors',
    section: 'safety',
    title: 'Run generators outdoors only',
    short: 'plan generator safety',
    when: (a) => a.backup === 'generator',
  },
  {
    id: 'pipes',
    section: 'safety',
    title: 'Know how to protect your pipes',
    short: 'protect your pipes',
  },
  {
    id: 'neighbors',
    section: 'people',
    title: 'Check on older neighbors',
    short: 'check on a neighbor',
  },
  {
    id: 'medical',
    section: 'people',
    title: 'Plan power for medical devices',
    short: 'plan for medical devices',
    when: (a) => (a.people || []).includes('medical'),
  },
  {
    id: 'care',
    section: 'people',
    title: 'Pack supplies for kids and pets',
    short: 'pack supplies for kids and pets',
    when: (a) => (a.people || []).some((p) => p === 'kids' || p === 'pets'),
  },
];
export const SETUP_STEPS = [
  {
    key: 'heat',
    title: 'How do you heat your home?',
    multi: false,
    options: [
      ['electric', 'Electric'],
      ['gas', 'Gas or oil'],
      ['other', 'Wood or other'],
    ],
  },
  {
    key: 'people',
    title: 'Who needs extra care?',
    multi: true,
    options: [
      ['older', 'Older adult'],
      ['kids', 'Young kids'],
      ['medical', 'Medical device'],
      ['pets', 'Pets'],
    ],
  },
  {
    key: 'backup',
    title: 'Do you have backup power?',
    multi: false,
    options: [
      ['generator', 'Generator'],
      ['battery', 'Battery pack'],
      ['none', 'None'],
    ],
  },
];
export function readyItems(answers = {}) {
  return ITEMS.filter((item) => !item.when || item.when(answers));
}
export function readyProgress(answers, checked) {
  const items = readyItems(answers);
  const done = items.filter((item) => checked.includes(item.id));
  const next = items.find((item) => !checked.includes(item.id));
  return { total: items.length, done: done.length, next: next || null };
}
