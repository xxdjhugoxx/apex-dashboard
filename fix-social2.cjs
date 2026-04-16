const fs = require('fs')
let html = fs.readFileSync('WEB-OFFICE.html', 'utf8')

// Find the pattern: }, on its own line, followed by , on its own line, then   social:
const badPattern = '},\n,\n  social:'
const goodPattern = '},\n  social:'

const idx = html.indexOf(badPattern)
if (idx !== -1) {
  html = html.replace(badPattern, goodPattern)
  console.log('Fixed at index', idx)
} else {
  console.log('Pattern not found')
}

// Now check syntax
fs.writeFileSync('WEB-OFFICE.html', html)

// Verify by checking lines around the fix
const lines = html.split('\n')
console.log('Lines 391-396:')
for (let i = 390; i < 396; i++) {
  console.log((i+1) + ': ' + JSON.stringify(lines[i]))
}
