const fs = require('fs')
let html = fs.readFileSync('WEB-OFFICE.html', 'utf8')

// Find the double-inserted social tab pattern: },\n,\n  social:
const badPattern = '},\n,\n  social:'
const goodPattern = '},\n  social:'

const idx = html.indexOf(badPattern)
if (idx !== -1) {
  html = html.replace(badPattern, goodPattern)
  console.log('Fixed double-insert pattern')
} else {
  console.log('Pattern not found. Checking file structure...')
  // Check if social is properly inside ADMIN_TABS
  const adminClose = html.indexOf('function openAdmin()')
  const socialIdx = html.indexOf('social:')
  if (socialIdx < adminClose && socialIdx > 0) {
    console.log('social: appears to be inside ADMIN_TABS (good)')
  } else {
    console.log('social: may be outside ADMIN_TABS at position', socialIdx)
  }
}

fs.writeFileSync('WEB-OFFICE.html', html)
console.log('Done')
