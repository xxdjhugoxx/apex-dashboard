import React, { useState, useEffect } from 'react'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'

const INTEGRATIONS = [
  {
    id: 'meta_ads',
    name: 'Meta Ads',
    description: 'Facebook & Instagram ad campaigns',
    icon: '📘',
    color: '#1877F2',
    hasAds: true,
    setupInstructions: 'Connect your Meta Business Manager to run Facebook and Instagram ad campaigns. APEX will create and manage campaigns using YOUR ad account.'
  },
  {
    id: 'google_ads',
    name: 'Google Ads',
    description: 'Search, Display, and YouTube ads',
    icon: '🔎',
    color: '#4285F4',
    hasAds: true,
    setupInstructions: 'Connect your Google Ads account to run search, display, and YouTube campaigns. APEX will manage campaigns using YOUR ad account.'
  },
  {
    id: 'instagram',
    name: 'Instagram',
    description: 'Automated posting & engagement',
    icon: '📸',
    color: '#E4405F',
    hasAds: false,
    setupInstructions: 'Connect your Instagram Business account to enable automated posting. APEX will post on your behalf (no manual work required).'
  }
]

export function IntegrationsPage() {
  const { user } = useAuth()
  const [integrations, setIntegrations] = useState({})
  const [loading, setLoading] = useState(true)
  const [expandedIntegration, setExpandedIntegration] = useState(null)
  const [settings, setSettings] = useState({})

  useEffect(() => {
    if (user) {
      loadIntegrations()
    }
  }, [user])

  async function loadIntegrations() {
    try {
      const { data, error } = await supabase
        .from('integrations')
        .select('*')
        .eq('user_id', user.id)

      if (error) throw error

      const mapped = {}
      const settingsMap = {}
      data?.forEach(integration => {
        mapped[integration.provider] = integration
        settingsMap[integration.provider] = {
          daily_budget: integration.metadata?.daily_budget || '',
          lifetime_budget: integration.metadata?.lifetime_budget || '',
          enable_ads: integration.metadata?.enable_ads ?? true,
          enable_dm_replies: integration.metadata?.enable_dm_replies ?? true,
          enable_lead_routing: integration.metadata?.enable_lead_routing ?? true
        }
      })
      setIntegrations(mapped)
      setSettings(settingsMap)
    } catch (err) {
      console.error('Error loading integrations:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleConnect(providerId) {
    alert('OAuth setup coming soon!\n\nOnce App IDs are configured, you\'ll be redirected to connect your ' + INTEGRATIONS.find(i => i.id === providerId).name + ' account.')
    setExpandedIntegration(providerId)
  }

  async function handleSaveSettings(providerId) {
    try {
      const integrationSettings = settings[providerId] || {}
      
      const { error } = await supabase
        .from('integrations')
        .update({
          metadata: {
            daily_budget: integrationSettings.daily_budget,
            lifetime_budget: integrationSettings.lifetime_budget,
            enable_ads: integrationSettings.enable_ads,
            enable_dm_replies: integrationSettings.enable_dm_replies,
            enable_lead_routing: integrationSettings.enable_lead_routing
          },
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('provider', providerId)

      if (error) throw error

      alert('Settings saved!')
      await loadIntegrations()
    } catch (err) {
      alert('Failed to save settings: ' + err.message)
    }
  }

  function updateSetting(providerId, key, value) {
    setSettings(prev => ({
      ...prev,
      [providerId]: {
        ...(prev[providerId] || {}),
        [key]: value
      }
    }))
  }

  async function handleDisconnect(providerId) {
    if (!confirm('Disconnect this integration? APEX will no longer be able to manage campaigns or post content.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('integrations')
        .delete()
        .eq('user_id', user.id)
        .eq('provider', providerId)

      if (error) throw error

      await loadIntegrations()
    } catch (err) {
      alert('Failed to disconnect: ' + err.message)
    }
  }

  function getIntegrationStatus(providerId) {
    const integration = integrations[providerId]
    if (!integration) return 'disconnected'
    return integration.status
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#111118] to-[#0a0a0f] text-white flex items-center justify-center">
        <div className="text-white/60">Loading integrations...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#111118] to-[#0a0a0f] text-white">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black mb-2">Integrations</h1>
          <p className="text-white/60">Connect your ad accounts and social platforms</p>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <div className="text-2xl">💡</div>
            <div className="flex-1">
              <h3 className="font-bold text-blue-200 mb-2">About Ad Spend</h3>
              <p className="text-sm text-blue-100/80 leading-relaxed">
                <strong>Ad spend is billed to YOUR ad account.</strong> APEX never pays or invoices ad spend. 
                We connect to your existing Meta Ads, Google Ads, and Instagram accounts to run campaigns on your behalf. 
                You maintain full control and visibility of all spending through your own ad platform dashboards.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {INTEGRATIONS.map((integration) => {
            const status = getIntegrationStatus(integration.id)
            const isConnected = status === 'connected'
            const needsReauth = status === 'needs_reauth'

            return (
              <div
                key={integration.id}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
                      style={{ backgroundColor: integration.color + '20' }}
                    >
                      {integration.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-1">{integration.name}</h3>
                      <p className="text-sm text-white/60">{integration.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {isConnected && (
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-bold">
                        <div className="w-2 h-2 rounded-full bg-green-400" />
                        Connected
                      </div>
                    )}
                    {needsReauth && (
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-bold">
                        <div className="w-2 h-2 rounded-full bg-yellow-400" />
                        Needs Reauth
                      </div>
                    )}
                    {!isConnected && !needsReauth && (
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/40 text-xs font-bold">
                        <div className="w-2 h-2 rounded-full bg-white/40" />
                        Disconnected
                      </div>
                    )}

                    {isConnected || needsReauth ? (
                      <button
                        onClick={() => handleDisconnect(integration.id)}
                        className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-200 rounded-lg text-sm font-bold transition-all"
                      >
                        Disconnect
                      </button>
                    ) : (
                      <button
                        onClick={() => handleConnect(integration.id)}
                        className="px-4 py-2 bg-[#FF6B35] hover:bg-[#FF8855] text-white rounded-lg text-sm font-bold transition-all"
                      >
                        Connect
                      </button>
                    )}
                  </div>
                </div>

                {!isConnected && (
                  <div className="bg-white/5 border border-white/10 rounded-lg p-4 mt-4">
                    <h4 className="text-sm font-bold text-white mb-3">Setup Steps:</h4>
                    <div className="space-y-3 text-xs text-white/80">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-[#FF6B35]/20 text-[#FF6B35] flex items-center justify-center font-bold flex-shrink-0">1</div>
                        <div>
                          <strong className="text-white">Connect your {integration.name} account</strong>
                          <p className="text-white/60 mt-1">{integration.setupInstructions}</p>
                        </div>
                      </div>
                      
                      {integration.hasAds && (
                        <>
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-[#FF6B35]/20 text-[#FF6B35] flex items-center justify-center font-bold flex-shrink-0">2</div>
                            <div>
                              <strong className="text-white">Set your budget in {integration.name} Manager</strong>
                              <p className="text-white/60 mt-1">
                                <strong>APEX does not charge or hold ad spend.</strong> You'll set daily/lifetime budgets 
                                directly in your {integration.name} account. APEX workers will create ads within the limits you set.
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-[#FF6B35]/20 text-[#FF6B35] flex items-center justify-center font-bold flex-shrink-0">3</div>
                            <div>
                              <strong className="text-white">Tell APEX your recommended budget</strong>
                              <p className="text-white/60 mt-1">
                                After connecting, you can specify recommended daily/lifetime budgets. 
                                This helps APEX workers know what limits you've set in your ad account.
                              </p>
                            </div>
                          </div>
                        </>
                      )}
                      
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-[#FF6B35]/20 text-[#FF6B35] flex items-center justify-center font-bold flex-shrink-0">{integration.hasAds ? '4' : '2'}</div>
                        <div>
                          <strong className="text-white">Enable APEX worker features</strong>
                          <p className="text-white/60 mt-1">
                            Choose what APEX can do: create/boost ads, reply to DMs, route leads to your dashboard.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-white/10 text-xs text-white/40">
                      <strong>Coming soon:</strong> OAuth flow will be enabled once App IDs are configured.
                    </div>
                  </div>
                )}

                {isConnected && integrations[integration.id] && (
                  <div className="space-y-4 mt-4">
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <div className="text-white/40 mb-1">Account ID</div>
                          <div className="font-mono text-green-200">
                            {integrations[integration.id].account_id || 'N/A'}
                          </div>
                        </div>
                        <div>
                          <div className="text-white/40 mb-1">Connected</div>
                          <div className="text-green-200">
                            {integrations[integration.id].connected_at
                              ? new Date(integrations[integration.id].connected_at).toLocaleDateString()
                              : 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {integration.hasAds && (
                      <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                        <h4 className="text-sm font-bold mb-3">Budget Guidance (Set in {integration.name} Manager)</h4>
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-4 text-xs text-yellow-200">
                          💡 These are recommended amounts YOU will set in your {integration.name} account. 
                          APEX does not charge or hold these funds. Your ad platform bills you directly.
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-white/60 mb-1 block">Daily Budget (USD)</label>
                            <input
                              type="number"
                              value={settings[integration.id]?.daily_budget || ''}
                              onChange={(e) => updateSetting(integration.id, 'daily_budget', e.target.value)}
                              placeholder="e.g., 50"
                              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm focus:outline-none focus:border-[#FF6B35]"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-white/60 mb-1 block">Lifetime Budget (USD)</label>
                            <input
                              type="number"
                              value={settings[integration.id]?.lifetime_budget || ''}
                              onChange={(e) => updateSetting(integration.id, 'lifetime_budget', e.target.value)}
                              placeholder="e.g., 1000"
                              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm focus:outline-none focus:border-[#FF6B35]"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <h4 className="text-sm font-bold mb-3">APEX Worker Features</h4>
                      <div className="space-y-3">
                        {integration.hasAds && (
                          <label className="flex items-center justify-between cursor-pointer">
                            <div>
                              <div className="text-sm font-medium">Enable Worker Ads</div>
                              <div className="text-xs text-white/60">APEX workers can create, boost, and manage ads</div>
                            </div>
                            <input
                              type="checkbox"
                              checked={settings[integration.id]?.enable_ads ?? true}
                              onChange={(e) => updateSetting(integration.id, 'enable_ads', e.target.checked)}
                              className="w-5 h-5"
                            />
                          </label>
                        )}
                        
                        <label className="flex items-center justify-between cursor-pointer">
                          <div>
                            <div className="text-sm font-medium">Enable DM Replies</div>
                            <div className="text-xs text-white/60">APEX workers can reply to direct messages</div>
                          </div>
                          <input
                            type="checkbox"
                            checked={settings[integration.id]?.enable_dm_replies ?? true}
                            onChange={(e) => updateSetting(integration.id, 'enable_dm_replies', e.target.checked)}
                            className="w-5 h-5"
                          />
                        </label>
                        
                        <label className="flex items-center justify-between cursor-pointer">
                          <div>
                            <div className="text-sm font-medium">Enable Lead Routing</div>
                            <div className="text-xs text-white/60">Route ad leads and inquiries to your dashboard</div>
                          </div>
                          <input
                            type="checkbox"
                            checked={settings[integration.id]?.enable_lead_routing ?? true}
                            onChange={(e) => updateSetting(integration.id, 'enable_lead_routing', e.target.checked)}
                            className="w-5 h-5"
                          />
                        </label>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSaveSettings(integration.id)}
                      className="w-full py-3 bg-[#FF6B35] hover:bg-[#FF8855] rounded-lg font-bold transition-all"
                    >
                      Save Settings
                    </button>
                  </div>
                )}

                {needsReauth && (
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mt-4">
                    <p className="text-xs text-yellow-200">
                      <strong>Action Required:</strong> This integration needs to be reconnected. 
                      Click "Disconnect" and then "Connect" again to reauthorize.
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="font-bold mb-3">How APEX Uses These Integrations</h3>
          <div className="space-y-3 text-sm text-white/80">
            <div className="flex items-start gap-3">
              <div className="text-lg">📘</div>
              <div>
                <strong className="text-white">Meta Ads:</strong> APEX creates, launches, and optimizes Facebook 
                and Instagram ad campaigns. Ad spend is charged directly to your Meta Business account.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-lg">🔎</div>
              <div>
                <strong className="text-white">Google Ads:</strong> APEX manages search, display, and YouTube campaigns. 
                Ad spend is charged directly to your Google Ads account.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-lg">📸</div>
              <div>
                <strong className="text-white">Instagram:</strong> APEX posts content automatically on your behalf. 
                No manual posting required. Content is generated based on your brand voice and approved work requests.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
