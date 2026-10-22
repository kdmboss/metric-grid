import { registryFor, DUKE, NC211 } from '../data/registries.js';
import { KEYS, readJSON, writeJSON } from '../shell/store.js';

export const HOUSEHOLD_KEY = KEYS.household;
export const QUESTIONS = [
  {
    key: 'heat',
    title: 'How is your home heated?',
    options: [
      ['electric', 'Electric', 'bolt'],
      ['gas', 'Gas', 'flame'],
      ['oil', 'Oil or propane', 'flame'],
      ['wood', 'Wood', 'wind'],
      ['unsure', 'Not sure', 'info'],
    ],
  },
  {
    key: 'medical',
    title: 'Does anyone at home use powered medical equipment?',
    hint: 'Oxygen, CPAP, dialysis, a powered wheelchair, refrigerated medicine.',
    options: [
      ['yes', 'Yes', 'pill'],
      ['no', 'No', 'check'],
      ['skip', 'Prefer not to say', 'shield'],
    ],
  },
  {
    key: 'help',
    title: 'Is anyone 65 or older, or would need help leaving in an outage?',
    options: [
      ['yes', 'Yes', 'people'],
      ['no', 'No', 'check'],
      ['skip', 'Prefer not to say', 'shield'],
    ],
  },
  {
    key: 'past',
    title: 'In past winter outages, how long did your power stay off?',
    options: [
      ['never', 'Never lost power', 'check'],
      ['lt1', 'Under 1 hour', 'clock'],
      ['h1to4', '1–4 hours', 'clock'],
      ['gt4', 'More than 4 hours', 'clock'],
      ['unsure', 'Not sure', 'info'],
    ],
  },
  {
    key: 'warm',
    title: 'If your home got too cold, could you get somewhere warm?',
    options: [
      ['easy', 'Yes, easily', 'home'],
      ['maybe', 'Maybe', 'info'],
      ['no', 'No', 'close'],
      ['unsure', 'Not sure', 'info'],
    ],
  },
  {
    key: 'backup',
    title: 'Do you have a backup?',
    hint: 'Choose all that apply.',
    multi: true,
    options: [
      ['generator', 'Generator', 'bolt'],
      ['battery', 'Power bank or batteries', 'battery'],
      ['stove', 'Fireplace or wood stove', 'flame'],
      ['none', 'None', 'close'],
    ],
  },
];
export const emptyHousehold = () => ({ answers: {}, completed: false });

export function loadHousehold() {
  const saved = readJSON(HOUSEHOLD_KEY, null);
  return saved && typeof saved === 'object' && saved.answers ? saved : emptyHousehold();
}
export function saveHousehold(next) {
  writeJSON(HOUSEHOLD_KEY, next);
}
/** Delete every answer from this phone. Returns the cleared state. */
export function deleteHousehold() {
  try {
    localStorage.removeItem(HOUSEHOLD_KEY);
  } catch {
    /* Nothing stored, nothing to delete. */
  }
  return emptyHousehold();
}
export const answered = (a, key) => {
  const v = a?.[key];
  return Array.isArray(v) ? v.length > 0 : Boolean(v);
};
export const hasAnyAnswer = (a) => QUESTIONS.some((q) => answered(a, q.key));
const noBackup = (a) =>
  answered(a, 'backup') && (a.backup.includes('none') || a.backup.length === 0);

/**
 * Outage-need level from the household's own answers only (no model data):
 *   Higher need = medical equipment YES, OR (electric heat AND no way to get warm),
 *                 OR (65+/needs help AND no way to get warm)
 *   Some need   = electric heat, OR 65+/needs help, OR past outages of an hour or more,
 *                 OR no way to get warm, OR no backup  (and not Higher)
 *   Lower need  = answered, none of the above
 * "Prefer not to say" and "Not sure" count as no information, never as a risk.
 */
export function needLevel(a = {}) {
  if (!hasAnyAnswer(a)) return null;
  const electric = a.heat === 'electric',
    cold = a.warm === 'no',
    medical = a.medical === 'yes',
    help = a.help === 'yes';
  if (medical || (electric && cold) || (help && cold)) return 'higher';
  if (electric || help || cold || ['h1to4', 'gt4'].includes(a.past) || noBackup(a)) return 'some';
  return 'lower';
}
export const NEED_LABEL = { higher: 'Higher need', some: 'Some need', lower: 'Lower need' };
/** Reason chips: generic labels only, never the detail of a health answer. */
export function needReasons(a = {}) {
  const out = [];
  if (a.heat === 'electric') out.push('Electric heat');
  if (a.medical === 'yes') out.push('Medical equipment');
  if (a.help === 'yes') out.push('65+ or needs help');
  if (a.past === 'gt4') out.push('Long past outages');
  else if (a.past === 'h1to4') out.push('Past outages');
  if (a.warm === 'no') out.push('No warm place');
  if (noBackup(a)) out.push('No backup');
  return out;
}
/** Which checklist categories the answers switch on. */
export function enabledFlags(a = {}) {
  return {
    heat: a.heat === 'electric',
    medical: a.medical === 'yes',
    help: a.help === 'yes' || a.warm === 'no',
  };
}
/** Official-lists card: only for medical equipment or 65+/needs help. */
export function showsOfficialLists(a = {}) {
  return a.medical === 'yes' || a.help === 'yes';
}
/** Only verified entries: Duke program, the county's page when one is verified, and NC 211. */
export function officialLists(a, county) {
  if (!showsOfficialLists(a)) return [];
  const rows = [
    {
      id: 'duke',
      icon: 'bolt',
      title: DUKE.name,
      detail:
        'Duke Energy. Flags medical accounts before disconnection. It does not speed up restoration.',
      href: DUKE.url,
    },
  ];
  const county_ = registryFor(county);
  if (county_)
    rows.push({
      id: 'county',
      icon: county_.kind === 'registry' ? 'list' : 'shield',
      title: county_.name,
      detail:
        county_.kind === 'registry'
          ? `${county_.detail}. Lets responders know you may need help.`
          : `${county_.detail}.`,
      href: county_.url,
    });
  rows.push({
    id: '211',
    icon: 'phone',
    title: `${NC211.name} · call 2-1-1`,
    detail: 'Free local help, by phone or at nc211.org.',
    href: NC211.url,
  });
  return rows;
}
const label = (key, value) =>
  QUESTIONS.find((q) => q.key === key)?.options.find((o) => o[0] === value)?.[1];
/** Plain-text household summary the user may send; built only when they tap Share. */
export function householdSummary(a = {}, placeName = '') {
  const lines = ['My household (from HEARTH, stays on my phone unless I share it):'];
  if (placeName) lines.push(`Town: ${placeName}`);
  for (const q of QUESTIONS) {
    if (!answered(a, q.key)) continue;
    const v = a[q.key];
    const text = Array.isArray(v) ? v.map((x) => label(q.key, x)).join(', ') : label(q.key, v);
    lines.push(`- ${q.title} ${text}`);
  }
  lines.push('Based on my own answers. Not a medical or official assessment.');
  return lines.join('\n');
}
