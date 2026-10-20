import {readFileSync} from 'node:fs';
import postcss from 'postcss';
import {uiStyleInventory,unusedSelectorNames} from './ui-style-inventory.mjs';
const inventory=uiStyleInventory(),css=readFileSync('web/app.css','utf8'),problems=[];
postcss.parse(css).walkRules(rule=>{
  problems.push(...unusedSelectorNames(rule.selector,inventory));
});
if(css.includes('!important'))problems.push('Stylesheet contains !important');
if(problems.length)throw Error([...new Set(problems)].join('\n'));
console.log('UI source checks passed: one stylesheet, no !important, no stale class or tag selectors.');
