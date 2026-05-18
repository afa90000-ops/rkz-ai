'use client'
import { useCallback, useRef, useState } from 'react'
import { Send, Mic, MicOff, Image, AlertTriangle, Bot, Upload, RefreshCw } from 'lucide-react'
import { useVoiceCommands } from '@/hooks/useVoiceCommands'
import { getDashboardStats, getAlerts, getEquipment, getMaterials } from '@/lib/queries'

type Message = { role: 'user' | 'assistant'; content: string }

type Tab = 'chat' | 'vision' | 'risks'

const tabs: { id: Tab; label: string; icon: React.ComponentType<{ size?: number; color?: string }> }[] = [
  { id: 'chat', label: 'المساعد الذكي', icon: Bot },
  { id: 'vision', label: 'تحليل الصور', icon: Image },
  { id: 'risks', label: 'التنبؤ بالمخاطر', icon: AlertTriangle },
]

const RISK_SEVERITY_COLORS: Record<string, string> = {
  low: '#00e676',
  medium: '#ffb300',
  high: '#ff6b35',
  critical: '#ff3366',
}

export default function AIPage() {
  const [activeTab, setActiveTab] = useState<Tab>('chat')

  // ── Chat state ──
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // ── Vision state ──
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [imageType, setImageType] = useState('image/jpeg')
  const [visionQuestion, setVisionQuestion] = useState('')
  const [visionResult, setVisionResult] = useState<string | null>(null)
  const [visionLoading, setVisionLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Risk state ──
  const [riskResult, setRiskResult] = useState<Record<string, unknown> | null>(null)
  const [riskLoading, setRiskLoading] = useState(false)
  const [riskSiteData, setRiskSiteData] = useState<Record<string, unknown> | null>(null)

  // ── Voice ──
  const { listening, transcript, supported: voiceSupported, start: startVoice, stop: stopVoice } = useVoiceCommands({
    commands: [
      { keywords: ['أرسل', 'إرسال'], action: () => handleSend() },
      { keywords: ['امسح', 'مسح'], action: () => { setInput(''); setMessages([]) } },
    ],
  })

  // fill input from transcript
  const prevTranscript = useRef('')
  if (transcript && transcript !== prevTranscript.current) {
    prevTranscript.current = transcript
    setInput(transcript)
  }

  const handleSend = useCallback(async (text?: string) => {
    const msg = (text ?? input).trim()
    if (!msg || streaming) return
    const newMessages: Message[] = [...messages, { role: 'user', content: msg }]
    setMessages(newMessages)
    setInput('')
    setStreaming(true)

    const assistantMsg: Message = { role: 'assistant', content: '' }
    setMessages([...newMessages, assistantMsg])

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages.map(m => ({ role: m.role, content: m.content })) }),
      })
      if (!res.ok) throw new Error('فشل الاتصال')
      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let full = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        for (const line of chunk.split('\n')) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const { text } = JSON.parse(line.slice(6))
              full += text
              setMessages(prev => {
                const updated = [...prev]
                updated[updated.length - 1] = { role: 'assistant', content: full }
                return updated
              })
              messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
            } catch { /* ignore */ }
          }
        }
      }
    } catch (e: unknown) {
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = { role: 'assistant', content: `حدث خطأ: ${e instanceof Error ? e.message : 'خطأ غير معروف'}` }
        return updated
      })
    } finally {
      setStreaming(false)
    }
  }, [input, messages, streaming])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageType(file.type || 'image/jpeg')
    const reader = new FileReader()
    reader.onload = ev => {
      const result = ev.target?.result as string
      setImagePreview(result)
      setImageBase64(result.split(',')[1])
      setVisionResult(null)
    }
    reader.readAsDataURL(file)
  }

  const handleAnalyze = async () => {
    if (!imageBase64) return
    setVisionLoading(true)
    setVisionResult(null)
    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, mediaType: imageType, question: visionQuestion || undefined }),
      })
      const data = await res.json()
      setVisionResult(data.analysis || data.error)
    } catch { setVisionResult('حدث خطأ في التحليل') } finally { setVisionLoading(false) }
  }

  const handleRiskAnalysis = async () => {
    setRiskLoading(true)
    setRiskResult(null)
    try {
      const [stats, alerts, equipment, materials] = await Promise.all([
        getDashboardStats(),
        getAlerts(),
        getEquipment(),
        getMaterials(),
      ])
      type AlertRow = { severity: string; status: string; alert_type: string }
      type EquipRow = { status: string }
      type MatRow = { quantity: number; minimum_quantity: number }

      const siteData = {
        totalCameras: stats.totalCameras,
        onlineCameras: stats.onlineCameras,
        totalWorkers: stats.totalWorkers,
        activeWorkers: stats.activeWorkers,
        openAlerts: stats.openAlerts,
        criticalAlerts: stats.criticalAlerts,
        totalProjects: stats.totalProjects,
        activeProjects: stats.activeProjects,
        resolvedAlerts: (alerts as AlertRow[]).filter(a => a.status === 'resolved').length,
        noHelmetAlerts: (alerts as AlertRow[]).filter(a => a.alert_type === 'no_helmet' && a.status === 'open').length,
        noVestAlerts: (alerts as AlertRow[]).filter(a => a.alert_type === 'no_vest' && a.status === 'open').length,
        fireAlerts: (alerts as AlertRow[]).filter(a => a.alert_type === 'fire' && a.status === 'open').length,
        intrusionAlerts: (alerts as AlertRow[]).filter(a => a.alert_type === 'intrusion' && a.status === 'open').length,
        equipmentTotal: (equipment as EquipRow[]).length,
        equipmentInMaintenance: (equipment as EquipRow[]).filter(e => e.status === 'maintenance').length,
        equipmentBreakdown: (equipment as EquipRow[]).filter(e => e.status === 'breakdown').length,
        lowStockMaterials: (materials as MatRow[]).filter(m => m.quantity <= m.minimum_quantity).length,
        totalMaterials: (materials as MatRow[]).length,
      }
      setRiskSiteData(siteData)
      const res = await fetch('/api/ai/risks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteData }),
      })
      const data = await res.json()
      setRiskResult(data)
    } catch { setRiskResult({ error: 'فشل تحليل المخاطر' }) } finally { setRiskLoading(false) }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', background: 'rgba(4,8,18,.8)',
    border: '1px solid #1a2540', borderRadius: '9px', color: '#e8f0ff',
    fontSize: '13px', outline: 'none', fontFamily: "'Cairo',sans-serif",
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>

      <div>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#e8f0ff' }}>ميزات الذكاء الاصطناعي</h1>
        <p style={{ fontSize: '12px', color: '#3d4f6e', marginTop: '3px' }}>مدعوم بـ Claude AI من Anthropic</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', background: '#070d1a', border: '1px solid #1a2540', borderRadius: '14px', padding: '6px' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer',
            fontFamily: "'Cairo',sans-serif", fontSize: '13px', fontWeight: activeTab === t.id ? 700 : 400,
            background: activeTab === t.id ? 'linear-gradient(135deg,#0066ff22,#00d4ff22)' : 'transparent',
            color: activeTab === t.id ? '#00d4ff' : '#3d4f6e',
            transition: 'all .2s',
          }}>
            <t.icon size={15} color={activeTab === t.id ? '#00d4ff' : '#3d4f6e'} />
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Chat Tab ── */}
      {activeTab === 'chat' && (
        <div style={{ background: '#070d1a', border: '1px solid #1a2540', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '600px' }}>
          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#3d4f6e' }}>
                <Bot size={48} strokeWidth={1} style={{ margin: '0 auto 16px', display: 'block', color: '#1a2540' }} />
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#6b7fa3', marginBottom: '8px' }}>مساعد RKZ الذكي</div>
                <div style={{ fontSize: '12px' }}>اسألني عن السلامة، المشاريع، المعدات أو أي شيء يخص موقع البناء</div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-start' : 'flex-end', animation: `fadeUp .3s ease both` }}>
                <div style={{
                  maxWidth: '75%', padding: '12px 16px', borderRadius: '14px',
                  background: m.role === 'user' ? 'rgba(0,102,255,.15)' : 'rgba(0,212,255,.08)',
                  border: `1px solid ${m.role === 'user' ? 'rgba(0,102,255,.3)' : 'rgba(0,212,255,.2)'}`,
                  color: '#e8f0ff', fontSize: '13px', lineHeight: 1.6, whiteSpace: 'pre-wrap',
                  borderBottomRightRadius: m.role === 'user' ? '4px' : '14px',
                  borderBottomLeftRadius: m.role === 'assistant' ? '4px' : '14px',
                }}>
                  {m.content}
                  {m.role === 'assistant' && streaming && i === messages.length - 1 && (
                    <span style={{ display: 'inline-block', width: '8px', height: '14px', background: '#00d4ff', borderRadius: '2px', marginRight: '3px', animation: 'blink 1s infinite', verticalAlign: 'middle' }} />
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{ borderTop: '1px solid #1a2540', padding: '12px 16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            {voiceSupported && (
              <button onClick={listening ? stopVoice : startVoice} style={{
                width: '40px', height: '40px', borderRadius: '10px', border: `1px solid ${listening ? 'rgba(255,51,102,.4)' : '#1a2540'}`,
                background: listening ? 'rgba(255,51,102,.15)' : 'transparent', color: listening ? '#ff3366' : '#3d4f6e',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
              }}>
                {listening ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
            )}
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder={listening ? 'جاري الاستماع...' : 'اكتب سؤالك هنا...'}
              style={{ ...inputStyle, flex: 1 }}
            />
            <button onClick={() => handleSend()} disabled={!input.trim() || streaming} style={{
              width: '40px', height: '40px', borderRadius: '10px', border: 'none',
              background: input.trim() && !streaming ? 'linear-gradient(135deg,#0066ff,#00d4ff)' : '#1a2540',
              color: input.trim() && !streaming ? 'white' : '#3d4f6e',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: input.trim() && !streaming ? 'pointer' : 'default', flexShrink: 0,
            }}>
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── Vision Tab ── */}
      {activeTab === 'vision' && (
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                background: '#070d1a', border: `2px dashed ${imagePreview ? '#0066ff' : '#1a2540'}`,
                borderRadius: '16px', height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', overflow: 'hidden', position: 'relative', transition: 'border-color .2s',
              }}>
              {imagePreview ? (
                <img src={imagePreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ textAlign: 'center', color: '#3d4f6e' }}>
                  <Upload size={32} strokeWidth={1} style={{ margin: '0 auto 12px', display: 'block' }} />
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>انقر لرفع صورة</div>
                  <div style={{ fontSize: '11px', marginTop: '4px' }}>JPG, PNG, WebP مدعومة</div>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
            </div>
            <textarea
              value={visionQuestion}
              onChange={e => setVisionQuestion(e.target.value)}
              placeholder="سؤال اختياري عن الصورة... (مثال: ما هي مخاطر السلامة في هذه الصورة؟)"
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
            <button onClick={handleAnalyze} disabled={!imageBase64 || visionLoading} style={{
              padding: '12px', borderRadius: '10px', border: 'none',
              background: imageBase64 && !visionLoading ? 'linear-gradient(135deg,#0066ff,#00d4ff)' : '#1a2540',
              color: imageBase64 && !visionLoading ? 'white' : '#3d4f6e',
              fontSize: '14px', fontWeight: 700, cursor: imageBase64 && !visionLoading ? 'pointer' : 'default',
              fontFamily: "'Cairo',sans-serif",
            }}>
              {visionLoading ? 'جاري التحليل...' : 'تحليل الصورة بالذكاء الاصطناعي'}
            </button>
          </div>

          <div style={{ width: '380px', background: '#070d1a', border: '1px solid #1a2540', borderRadius: '16px', padding: '20px', overflowY: 'auto', maxHeight: '420px' }}>
            {!visionResult && !visionLoading && (
              <div style={{ textAlign: 'center', color: '#3d4f6e', padding: '40px 0' }}>
                <Image size={32} strokeWidth={1} style={{ margin: '0 auto 12px', display: 'block' }} />
                <div style={{ fontSize: '13px' }}>ارفع صورة للبدء في التحليل</div>
              </div>
            )}
            {visionLoading && (
              <div style={{ textAlign: 'center', color: '#3d4f6e', padding: '40px 0' }}>
                <div style={{ fontSize: '22px', marginBottom: '12px' }}>🔍</div>
                <div style={{ fontSize: '13px' }}>يتم تحليل الصورة...</div>
              </div>
            )}
            {visionResult && (
              <div style={{ fontSize: '13px', color: '#c8d8f0', lineHeight: 1.7, whiteSpace: 'pre-wrap', animation: 'fadeUp .4s ease' }}>
                {visionResult}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Risks Tab ── */}
      {activeTab === 'risks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: '#070d1a', border: '1px solid #1a2540', borderRadius: '16px', padding: '20px' }}>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#e8f0ff', marginBottom: '4px' }}>بيانات الموقع الحقيقية</div>
              <div style={{ fontSize: '12px', color: riskSiteData ? '#00e676' : '#3d4f6e' }}>
                {riskSiteData ? '✓ تم تحميل البيانات من قاعدة البيانات' : 'سيتم تحميل البيانات الحقيقية عند الضغط على التحليل'}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', marginBottom: '16px' }}>
              {[
                { label: 'تنبيهات مفتوحة', value: riskSiteData ? String(riskSiteData.openAlerts) : '—', color: '#ff6b35' },
                { label: 'تنبيهات حرجة',   value: riskSiteData ? String(riskSiteData.criticalAlerts) : '—', color: '#ff3366' },
                { label: 'عمال نشطون',     value: riskSiteData ? String(riskSiteData.activeWorkers) : '—', color: '#00d4ff' },
                { label: 'معدات بالصيانة', value: riskSiteData ? String(riskSiteData.equipmentInMaintenance) : '—', color: '#ffb300' },
              ].map((s, i) => (
                <div key={i} style={{ background: `${s.color}08`, border: `1px solid ${s.color}20`, borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: '10px', color: '#6b7fa3', marginTop: '2px' }}>{s.label}</div>
                </div>
              ))}
            </div>
            <button onClick={handleRiskAnalysis} disabled={riskLoading} style={{
              width: '100%', padding: '12px', borderRadius: '10px', border: 'none',
              background: riskLoading ? '#1a2540' : 'linear-gradient(135deg,#ff6b35,#ff3366)',
              color: riskLoading ? '#3d4f6e' : 'white', fontSize: '14px', fontWeight: 700,
              cursor: riskLoading ? 'default' : 'pointer', fontFamily: "'Cairo',sans-serif",
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}>
              <RefreshCw size={15} style={{ animation: riskLoading ? 'spin 1s linear infinite' : 'none' }} />
              {riskLoading ? 'جاري التحليل بالذكاء الاصطناعي...' : 'تحليل المخاطر الآن'}
            </button>
          </div>

          {riskResult && !('error' in riskResult) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', animation: 'fadeUp .4s ease' }}>
              {/* Overall score */}
              <div style={{ background: '#070d1a', border: `1px solid ${RISK_SEVERITY_COLORS[riskResult.overallRisk as string] ?? '#1a2540'}30`, borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: `4px solid ${RISK_SEVERITY_COLORS[riskResult.overallRisk as string] ?? '#6b7fa3'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <div style={{ fontSize: '24px', fontWeight: 900, color: RISK_SEVERITY_COLORS[riskResult.overallRisk as string] ?? '#6b7fa3' }}>{riskResult.riskScore as number}</div>
                </div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#e8f0ff', marginBottom: '4px' }}>مستوى الخطر الإجمالي</div>
                  <div style={{ fontSize: '13px', color: RISK_SEVERITY_COLORS[riskResult.overallRisk as string] ?? '#6b7fa3', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase' }}>{riskResult.overallRisk as string}</div>
                  <div style={{ fontSize: '12px', color: '#6b7fa3', lineHeight: 1.5 }}>{riskResult.summary as string}</div>
                </div>
              </div>

              {/* Individual risks */}
              <div style={{ background: '#070d1a', border: '1px solid #1a2540', borderRadius: '16px', overflow: 'hidden' }}>
                <div style={{ padding: '14px 20px', borderBottom: '1px solid #1a2540', fontSize: '13px', fontWeight: 700, color: '#e8f0ff' }}>المخاطر المحددة</div>
                {(riskResult.risks as Array<Record<string, unknown>>)?.map((risk, i) => (
                  <div key={i} style={{ padding: '14px 20px', borderBottom: i < (riskResult.risks as unknown[]).length - 1 ? '1px solid #0d1428' : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#e8f0ff' }}>{risk.category as string}</div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', color: '#6b7fa3' }}>احتمالية: {risk.probability as number}%</span>
                        <span style={{ padding: '2px 8px', borderRadius: '5px', fontSize: '10px', fontWeight: 700, background: `${RISK_SEVERITY_COLORS[risk.severity as string]}15`, color: RISK_SEVERITY_COLORS[risk.severity as string], border: `1px solid ${RISK_SEVERITY_COLORS[risk.severity as string]}30` }}>{risk.severity as string}</span>
                      </div>
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7fa3', marginBottom: '4px' }}>{risk.description as string}</div>
                    <div style={{ fontSize: '11px', color: '#00d4ff', background: 'rgba(0,212,255,.06)', border: '1px solid rgba(0,212,255,.15)', borderRadius: '6px', padding: '6px 10px' }}>💡 {risk.recommendation as string}</div>
                  </div>
                ))}
              </div>

              {/* Immediate actions */}
              {(riskResult.immediateActions as string[])?.length > 0 && (
                <div style={{ background: 'rgba(255,51,102,.06)', border: '1px solid rgba(255,51,102,.2)', borderRadius: '14px', padding: '16px 20px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#ff3366', marginBottom: '10px' }}>⚡ إجراءات فورية مطلوبة</div>
                  {(riskResult.immediateActions as string[]).map((action, i) => (
                    <div key={i} style={{ fontSize: '12px', color: '#c8d8f0', marginBottom: '6px', display: 'flex', gap: '8px' }}>
                      <span style={{ color: '#ff3366', flexShrink: 0 }}>{i + 1}.</span> {action}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
