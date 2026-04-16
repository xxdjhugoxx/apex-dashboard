const fs = require('fs')
let html = fs.readFileSync('WEB-OFFICE.html', 'utf8')

// Current bad state: after }, (line 392) there's:
// ,
//   social: `...  (lines 394-428)
// then nothing — ADMIN_TABS already closed
// 
// Fix: 
// 1. Change }, to }, (keep comma for object entry)  
// 2. Remove the standalone , on line 393
// 3. Make sure social: ends with `, (comma, closing ADMIN_TABS)

// Current lines 391-428:
// 391:     </div>`,
// 392: }
// 393: ,
// 394:   social: `
// ...
// 428:   `,

// The social tab was inserted OUTSIDE the ADMIN_TABS closing brace
// because the script found the wrong `,  (inside METRICS.map)

const lines = html.split('\n')
console.log('Line 391:', JSON.stringify(lines[390]))
console.log('Line 392:', JSON.stringify(lines[391]))
console.log('Line 393:', JSON.stringify(lines[392]))
console.log('Line 394:', JSON.stringify(lines[393]))
console.log('Line 427:', JSON.stringify(lines[426]))
console.log('Line 428:', JSON.stringify(lines[427]))
console.log('Line 429:', JSON.stringify(lines[428]))
console.log('Line 430:', JSON.stringify(lines[429]))

// The social: ` block at 394-428 was inserted AFTER the closing }
// We need to move it BEFORE the closing }

// Strategy:
// - Remove line 393 (the standalone comma)
// - Change line 392 from } to }, (comma stays inside object)
// - The social: block (394-428) stays in place BUT needs to be moved BEFORE line 392

// Actually simpler:
// Remove the standalone , on line 393 and change } on 392 to nothing?
// No wait - the pres: entry ends with `, (template literal close + comma)
// Then the object itself closes with }

// The issue: social: was inserted AFTER } so it's outside
// Fix: move social: block (394-428) BEFORE line 392's }

// Lines 1-391 + pres content + social block + closing brace of ADMIN_TABS
const beforePres = lines.slice(0, 391) // lines 1-391 (0-indexed: 0-390)
const presClosing = lines.slice(391, 392) // line 391: `</div>`, (closes METRICS + pres template)
const closingBrace = '}' // line 392: } - closes ADMIN_TABS
const socialBlock = lines.slice(393, 428) // lines 394-428 (0-indexed: 393-427) - social: template
const afterAdminTabs = lines.slice(428) // after ADMIN_TABS closes

console.log('socialBlock[0]:', JSON.stringify(socialBlock[0]))
console.log('socialBlock[34]:', JSON.stringify(socialBlock[34]))
console.log('afterAdminTabs[0]:', JSON.stringify(afterAdminTabs[0]))

// Build corrected html
const newLines = [
  ...beforePres,        // everything up to and including line 391
  ...socialBlock,       // social: template
  closingBrace,         // } to close ADMIN_TABS
  ...afterAdminTabs     // rest of file
]

const newHtml = newLines.join('\n')
fs.writeFileSync('WEB-OFFICE.html', newHtml)
console.log('Done! New line count:', newLines.length)
