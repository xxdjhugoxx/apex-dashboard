const fs = require('fs')
let html = fs.readFileSync('WEB-OFFICE.html', 'utf8')

// 1. Add socialAccounts to CFG
html = html.replace(
  "presenceToken: '',",
  "presenceToken: '',\n  socialAccounts: [],"
)

// 2. Find where pres: section ends (at `,\n}) 
const presStart = html.indexOf('pres: `')
const presEnd = html.indexOf('`,\n})', presStart)
// Insert social tab after pres section end, before function openAdmin
const insertAt = presEnd + 5

const socialTab = ",\n  social: `<div class=\"api-sec\"><div class=\"api-sec-title\">📸 SOCIAL ACCOUNTS</div><p class=\"api-note\">Add social platform accounts. Instagram agent uses these to post content and manage DMs.</p></div><div class=\"api-sec\"><div class=\"api-sec-title\">➕ ADD ACCOUNT</div><div class=\"api-grid\"><div class=\"api-field\"><label>PLATFORM</label><select id=\"f-social-platform\"><option value=\"instagram\">Instagram</option><option value=\"tiktok\">TikTok</option><option value=\"twitter\">Twitter / X</option><option value=\"facebook\">Facebook</option><option value=\"linkedin\">LinkedIn</option><option value=\"youtube\">YouTube</option></select></div><div class=\"api-field\"><label>USERNAME</label><input type=\"text\" id=\"f-social-username\" placeholder=\"@yourhandle\" /></div></div><div class=\"api-field\"><label>PASSWORD / ACCESS TOKEN</label><input type=\"password\" id=\"f-social-token\" placeholder=\"Password or access token\" /></div><button class=\"test-btn\" onclick=\"addSocialAccount()\" style=\"width:100%;margin-top:4px\">➕ Add Account</button></div><div class=\"api-sec\"><div class=\"api-sec-title\">📋 CONFIGURED ACCOUNTS</div><div id=\"social-accounts-list\"><span style=\"font-size:11px;color:var(--muted)\">No accounts yet.</span></div></div>`,"

html = html.slice(0, insertAt) + socialTab + html.slice(insertAt)

// 3. Add socialAccounts save to saveConfig
html = html.replace(
  "CFG.presenceToken = document.getElementById('f-pres-token')?.value || CFG.presenceToken",
  "CFG.presenceToken = document.getElementById('f-pres-token')?.value || CFG.presenceToken\n  if (typeof CFG.socialAccounts === 'undefined') CFG.socialAccounts = []"
)

// 4. Add functions before PRESENCE section
const presenceSection = '// ═══════════════════════════════════════════════════════════════\n// PRESENCE'
const addSocialFn = `// ═══════════════════════════════════════════════════════════════
// SOCIAL ACCOUNTS
function addSocialAccount() {
  const platform = document.getElementById('f-social-platform')?.value
  const username = document.getElementById('f-social-username')?.value.trim()
  const token = document.getElementById('f-social-token')?.value.trim()
  if (!username || !token) { alert('Fill in username and token'); return }
  if (!CFG.socialAccounts) CFG.socialAccounts = []
  CFG.socialAccounts.push({ platform, username, token })
  localStorage.setItem('apex_config', JSON.stringify(CFG))
  renderSocialAccounts()
  document.getElementById('f-social-username').value = ''
  document.getElementById('f-social-token').value = ''
}
function renderSocialAccounts() {
  const list = document.getElementById('social-accounts-list')
  if (!list) return
  if (!CFG.socialAccounts || CFG.socialAccounts.length === 0) {
    list.innerHTML = '<span style="font-size:11px;color:var(--muted)">No accounts yet.</span>'
    return
  }
  const icons = { instagram: '📸', tiktok: '🎵', twitter: '🐦', facebook: '👤', linkedin: '💼', youtube: '▶️' }
  list.innerHTML = CFG.socialAccounts.map((a, i) => '<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border)"><span style="font-size:14px">' + (icons[a.platform] || '🔗') + '</span><div style="flex:1"><div style="font-size:11px;font-weight:700">' + a.username + '</div><div style="font-size:9px;color:var(--muted)">' + a.platform + '</div></div><button onclick="removeSocialAccount(' + i + ')" style="background:none;border:none;color:#DC2626;font-size:12px;cursor:pointer">✕</button></div>').join('')
}
function removeSocialAccount(i) {
  CFG.socialAccounts.splice(i, 1)
  localStorage.setItem('apex_config', JSON.stringify(CFG))
  renderSocialAccounts()
}

`

const presIdx = html.indexOf(presenceSection)
if (presIdx === -1) { console.log('ERROR: PRESENCE section not found'); process.exit(1) }
html = html.slice(0, presIdx) + addSocialFn + html.slice(presIdx)

// 5. Call renderSocialAccounts after loadCfg
html = html.replace('loadCfg()\n', 'loadCfg()\n  setTimeout(renderSocialAccounts, 100)\n')

fs.writeFileSync('WEB-OFFICE.html', html)
console.log('Done!')
