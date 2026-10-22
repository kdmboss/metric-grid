/**
 * Verified official pages for the "Get on the official lists" card. Only entries whose page I opened or
 * whose official page text I could read are included; counties without a verifiable official page
 * (Stanly, Anson) are omitted on purpose. Checked 2026-10-21.
 *
 * kind: 'registry' = the county runs a registry/form for people who need help; 'office' = the county's
 * emergency management page (no registry found on it).
 */
export const NC211 = {
  name: 'NC 211',
  // Home page states: "Families and individuals can call 2-1-1 or 1-888-892-1162". No text option is stated.
  url: 'https://nc211.org/',
  phone: '211',
};
export const DUKE = {
  name: 'Medically Essential Program',
  // Duke Energy page title and program name: "Medically Essential Program" (the page redirects to
  // /home/billing/assistance/medically-essential). It flags accounts for careful handling before a
  // disconnection for non-payment; the page says it does not guarantee restoration order in an outage.
  url: 'https://www.duke-energy.com/home/billing/special-assistance/medically-essential',
};
export const COUNTY_REGISTRIES = {
  'Mecklenburg County': {
    kind: 'registry',
    name: 'Special Needs Registry',
    detail: 'Charlotte-Mecklenburg Emergency Management',
    // City of Charlotte Emergency Management page describes the CMEMO Special Needs Registry and its form.
    url: 'https://www.charlottenc.gov/Public-Safety/Emergency-Management',
  },
  'Union County': {
    kind: 'registry',
    name: 'Emergency Access and Functional Needs Registry',
    detail: 'Union County Public Health and Emergency Management',
    // Union County Public Health "Emergency Preparedness" page (describes the registry and who qualifies).
    url: 'https://www.unioncountync.gov/government/departments-f-p/public-health/emergency-preparedness',
  },
  'Robeson County': {
    kind: 'registry',
    name: 'Robeson County Special Needs Registry',
    detail: 'Robeson County Emergency Management',
    // Page loads; title "Robeson County Special Needs Registry | Emergency Assistance Registration".
    url: 'https://www.robesoncountync.gov/robeson-special-needs-registry',
  },
  'Montgomery County': {
    kind: 'registry',
    name: 'Special Needs Form',
    detail: 'Montgomery County Emergency Services',
    // Page loads; its document list links a "Special Needs Form".
    url: 'https://www.montgomerycountync.gov/departments/e911/emergency-services-documents',
  },
  'Richmond County': {
    kind: 'registry',
    name: 'Special Needs Form',
    detail: 'Richmond County government',
    // PDF on richmondnc.com loads: the county's voluntary special needs form for emergency responders.
    url: 'https://www.richmondnc.com/DocumentCenter/View/91/Special-Needs-Form-Final-PDF',
  },
  'Cabarrus County': {
    kind: 'office',
    name: 'Emergency Management',
    detail: 'Ask about help during emergencies',
    // Page loads; it mentions people with functional needs but lists no registry (phone 704-920-2143).
    url: 'https://www.cabarruscounty.us/Government/Departments/Emergency-Management',
  },
  'Scotland County': {
    kind: 'office',
    name: 'Emergency Management',
    detail: 'Ask about help during emergencies',
    // Page loads: "Emergency Management | Scotland County, NC". No registry is listed on it.
    url: 'https://scotlandcounty.org/272/Emergency-Management',
  },
};
export const registryFor = (county) => COUNTY_REGISTRIES[county] || null;
