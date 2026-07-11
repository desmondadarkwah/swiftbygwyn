import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createOrder } from '../utils/api'

const DELIVERY_TYPES = [
  { value: 'standard', label: 'Standard Delivery', icon: '🚶', desc: 'Delivered within the day' },
  { value: 'same-day', label: 'Same-Day Delivery', icon: '⚡', desc: 'Book before noon' },
  { value: 'express', label: 'Express / Urgent', icon: '🚀', desc: 'Fastest option' },
  { value: 'scheduled', label: 'Scheduled', icon: '📅', desc: 'Pick date & time' },
]

const FEES = { standard: 30, 'same-day': 50, express: 80, scheduled: 40 }

export default function BookDelivery() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(null)

  const [form, setForm] = useState({
    customerName: '', customerPhone: '',
    recipientName: '', recipientPhone: '',
    pickupLocation: '', dropoffLocation: '',
    deliveryType: 'standard',
    scheduledDate: '', scheduledTime: '',
    packageDescription: '', additionalNotes: '',
    paymentMethod: 'cash',
  })
  const [packageImage, setPackageImage] = useState(null)

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const deliveryFee = FEES[form.deliveryType] || 30

  const handleSubmit = async () => {
    setLoading(true); setError('')
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      fd.append('deliveryFee', deliveryFee)
      if (packageImage) fd.append('packageImage', packageImage)
      const order = await createOrder(fd)
      setSuccess(order)
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.')
    } finally { setLoading(false) }
  }

  const nextStep = () => {
    if (step === 1) {
      if (!form.customerName || !form.customerPhone) { setError('Please fill in your name and phone.'); return }
      if (!form.recipientName || !form.recipientPhone) { setError('Please fill in recipient details.'); return }
    }
    if (step === 2) {
      if (!form.pickupLocation || !form.dropoffLocation) { setError('Please fill in both locations.'); return }
      if (!form.packageDescription) { setError('Please describe the package.'); return }
      if (form.deliveryType === 'scheduled' && (!form.scheduledDate || !form.scheduledTime)) {
        setError('Please select a date and time for scheduled delivery.'); return
      }
    }
    setError('')
    setStep(prev => prev + 1)
  }

  if (success) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Syne:wght@600;700;800&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: #0b0f1a; }
          .suc-root { min-height: 100vh; background: #0b0f1a; display: flex; align-items: center; justify-content: center; padding: 40px 24px; font-family: 'Inter', sans-serif; }
          .suc-card { width: 100%; max-width: 480px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 48px 36px; text-align: center; }
          .suc-icon { font-size: 56px; margin-bottom: 20px; }
          .suc-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 28px; color: #fff; margin-bottom: 12px; }
          .suc-sub { font-size: 14px; color: rgba(240,244,255,0.5); line-height: 1.7; margin-bottom: 32px; }
          .suc-id-box { background: rgba(249,115,22,0.1); border: 1px solid rgba(249,115,22,0.3); border-radius: 12px; padding: 20px; margin-bottom: 32px; }
          .suc-id-label { font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(240,244,255,0.35); margin-bottom: 8px; }
          .suc-id { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 36px; color: #f97316; letter-spacing: 0.05em; }
          .suc-btn { display: block; padding: 14px; background: #f97316; color: #fff; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; text-decoration: none; margin-bottom: 12px; width: 100%; }
          .suc-btn-ghost { display: block; padding: 14px; background: transparent; color: rgba(240,244,255,0.5); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; font-size: 14px; cursor: pointer; text-decoration: none; width: 100%; }
        `}</style>
        <div className="suc-root">
          <div className="suc-card">
            <div className="suc-icon">🎉</div>
            <div className="suc-title">Booking Confirmed!</div>
            <p className="suc-sub">Your delivery has been booked successfully. Save your Order ID to track your package.</p>
            <div className="suc-id-box">
              <div className="suc-id-label">Your Order ID</div>
              <div className="suc-id">{success.orderID}</div>
            </div>
            <a href={`/track/${success.orderID}`} className="suc-btn">Track My Order</a>
            <a href="/" className="suc-btn-ghost">Back to Home</a>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Syne:wght@600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .bk-root { min-height: 100vh; background: #0b0f1a; font-family: 'Inter', sans-serif; color: #f0f4ff; padding: 40px 24px 80px; }
        .bk-inner { max-width: 600px; margin: 0 auto; }
        .bk-nav { display: flex; align-items: center; justify-content: space-between; margin-bottom: 40px; }
        .bk-logo { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 18px; color: #fff; text-decoration: none; display: flex; align-items: center; gap: 8px; }
        .bk-logo-icon { width: 32px; height: 32px; background: #f97316; border-radius: 7px; display: flex; align-items: center; justify-content: center; font-size: 14px; }
        .bk-back { font-size: 13px; color: rgba(240,244,255,0.4); text-decoration: none; }
        .bk-back:hover { color: #f97316; }
        .bk-steps { display: flex; align-items: center; gap: 0; margin-bottom: 36px; }
        .bk-step { display: flex; align-items: center; gap: 10px; flex: 1; }
        .bk-step-circle { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; flex-shrink: 0; transition: all 0.3s; }
        .bk-step-circle.active { background: #f97316; color: #fff; }
        .bk-step-circle.done { background: rgba(249,115,22,0.2); color: #f97316; border: 1px solid rgba(249,115,22,0.4); }
        .bk-step-circle.inactive { background: rgba(255,255,255,0.06); color: rgba(240,244,255,0.3); }
        .bk-step-label { font-size: 12px; font-weight: 500; color: rgba(240,244,255,0.4); }
        .bk-step-label.active { color: #fff; }
        .bk-step-line { flex: 1; height: 1px; background: rgba(255,255,255,0.08); margin: 0 12px; }
        .bk-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 20px; padding: 32px; margin-bottom: 16px; }
        .bk-card-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 20px; color: #fff; margin-bottom: 24px; }
        .bk-field { margin-bottom: 18px; }
        .bk-label { display: block; font-size: 12px; font-weight: 500; color: rgba(240,244,255,0.45); margin-bottom: 8px; letter-spacing: 0.02em; }
        .bk-input { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); border-radius: 10px; padding: 12px 16px; font-size: 14px; color: #fff; outline: none; transition: border-color 0.2s; font-family: 'Inter', sans-serif; }
        .bk-input:focus { border-color: #f97316; }
        .bk-input::placeholder { color: rgba(240,244,255,0.2); }
        .bk-textarea { resize: vertical; min-height: 90px; }
        .bk-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .bk-type-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 18px; }
        .bk-type-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 16px; cursor: pointer; transition: all 0.2s; text-align: left; }
        .bk-type-card.selected { border-color: #f97316; background: rgba(249,115,22,0.08); }
        .bk-type-icon { font-size: 22px; margin-bottom: 8px; }
        .bk-type-name { font-size: 13px; font-weight: 600; color: #fff; margin-bottom: 3px; }
        .bk-type-desc { font-size: 11px; color: rgba(240,244,255,0.35); }
        .bk-payment-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .bk-payment-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 16px; cursor: pointer; transition: all 0.2s; text-align: center; }
        .bk-payment-card.selected { border-color: #f97316; background: rgba(249,115,22,0.08); }
        .bk-payment-icon { font-size: 24px; margin-bottom: 6px; }
        .bk-payment-label { font-size: 13px; font-weight: 600; color: #fff; }
        .bk-fee-box { background: rgba(249,115,22,0.08); border: 1px solid rgba(249,115,22,0.2); border-radius: 12px; padding: 16px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
        .bk-fee-label { font-size: 13px; color: rgba(240,244,255,0.5); }
        .bk-fee-amount { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 22px; color: #f97316; }
        .bk-error { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25); border-radius: 10px; padding: 12px 16px; font-size: 13px; color: #fca5a5; margin-bottom: 16px; }
        .bk-actions { display: flex; gap: 10px; }
        .bk-btn-primary { flex: 1; padding: 14px; background: #f97316; color: #fff; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; transition: opacity 0.2s; }
        .bk-btn-primary:hover:not(:disabled) { opacity: 0.88; }
        .bk-btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }
        .bk-btn-ghost { padding: 14px 24px; background: transparent; color: rgba(240,244,255,0.4); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; font-size: 14px; cursor: pointer; }
        .bk-file-input { width: 100%; background: rgba(255,255,255,0.05); border: 1px dashed rgba(255,255,255,0.15); border-radius: 10px; padding: 20px; text-align: center; cursor: pointer; color: rgba(240,244,255,0.35); font-size: 13px; }
        @media (max-width: 480px) {
          .bk-row { grid-template-columns: 1fr; }
          .bk-type-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      <div className="bk-root">
        <div className="bk-inner">
          {/* Nav */}
          <div className="bk-nav">
            <a href="/" className="bk-logo">
              <div className="bk-logo-icon">🚀</div>
              SwiftByGwyn
            </a>
            <a href="/" className="bk-back">← Back</a>
          </div>

          {/* Steps */}
          <div className="bk-steps">
            {['Your Details', 'Package Info', 'Confirm'].map((label, i) => (
              <div key={label} className="bk-step">
                {i > 0 && <div className="bk-step-line" />}
                <div className={`bk-step-circle ${step === i+1 ? 'active' : step > i+1 ? 'done' : 'inactive'}`}>
                  {step > i+1 ? '✓' : i+1}
                </div>
                <div className={`bk-step-label ${step === i+1 ? 'active' : ''}`}>{label}</div>
              </div>
            ))}
          </div>

          {/* STEP 1 — Contact Details */}
          {step === 1 && (
            <div className="bk-card">
              <div className="bk-card-title">Your Details</div>
              <div className="bk-row">
                <div className="bk-field">
                  <label className="bk-label">Your Full Name *</label>
                  <input className="bk-input" placeholder="John Mensah" value={form.customerName} onChange={e => set('customerName', e.target.value)} />
                </div>
                <div className="bk-field">
                  <label className="bk-label">Your Phone Number *</label>
                  <input className="bk-input" placeholder="0244000000" value={form.customerPhone} onChange={e => set('customerPhone', e.target.value)} />
                </div>
              </div>
              <div style={{ height:1, background:'rgba(255,255,255,0.06)', margin:'8px 0 20px' }} />
              <div className="bk-card-title" style={{ fontSize:16, marginBottom:18 }}>Recipient Details</div>
              <div className="bk-row">
                <div className="bk-field">
                  <label className="bk-label">Recipient Name *</label>
                  <input className="bk-input" placeholder="Ama Asante" value={form.recipientName} onChange={e => set('recipientName', e.target.value)} />
                </div>
                <div className="bk-field">
                  <label className="bk-label">Recipient Phone *</label>
                  <input className="bk-input" placeholder="0554000000" value={form.recipientPhone} onChange={e => set('recipientPhone', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 — Package Info */}
          {step === 2 && (
            <div className="bk-card">
              <div className="bk-card-title">Package & Delivery Info</div>
              <div className="bk-field">
                <label className="bk-label">Pickup Location *</label>
                <input className="bk-input" placeholder="e.g. Madina Estate, Accra" value={form.pickupLocation} onChange={e => set('pickupLocation', e.target.value)} />
              </div>
              <div className="bk-field">
                <label className="bk-label">Drop-off Location *</label>
                <input className="bk-input" placeholder="e.g. East Legon, Accra" value={form.dropoffLocation} onChange={e => set('dropoffLocation', e.target.value)} />
              </div>
              <div className="bk-field">
                <label className="bk-label">Delivery Type *</label>
                <div className="bk-type-grid">
                  {DELIVERY_TYPES.map(t => (
                    <div key={t.value} className={`bk-type-card${form.deliveryType === t.value ? ' selected' : ''}`} onClick={() => set('deliveryType', t.value)}>
                      <div className="bk-type-icon">{t.icon}</div>
                      <div className="bk-type-name">{t.label}</div>
                      <div className="bk-type-desc">{t.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
              {form.deliveryType === 'scheduled' && (
                <div className="bk-row">
                  <div className="bk-field">
                    <label className="bk-label">Delivery Date *</label>
                    <input type="date" className="bk-input" value={form.scheduledDate} onChange={e => set('scheduledDate', e.target.value)} min={new Date().toISOString().split('T')[0]} />
                  </div>
                  <div className="bk-field">
                    <label className="bk-label">Delivery Time *</label>
                    <input type="time" className="bk-input" value={form.scheduledTime} onChange={e => set('scheduledTime', e.target.value)} />
                  </div>
                </div>
              )}
              <div className="bk-field">
                <label className="bk-label">Package Description *</label>
                <textarea className="bk-input bk-textarea" placeholder="e.g. Documents, clothing, food items..." value={form.packageDescription} onChange={e => set('packageDescription', e.target.value)} />
              </div>
              <div className="bk-field">
                <label className="bk-label">Package Image (Optional)</label>
                <div className="bk-file-input" onClick={() => document.getElementById('pkg-img').click()}>
                  {packageImage ? `📷 ${packageImage.name}` : '📷 Click to upload package photo'}
                  <input id="pkg-img" type="file" accept="image/*" style={{ display:'none' }} onChange={e => setPackageImage(e.target.files[0])} />
                </div>
              </div>
              <div className="bk-field">
                <label className="bk-label">Additional Notes (Optional)</label>
                <textarea className="bk-input bk-textarea" style={{ minHeight:70 }} placeholder="Any special instructions..." value={form.additionalNotes} onChange={e => set('additionalNotes', e.target.value)} />
              </div>
            </div>
          )}

          {/* STEP 3 — Confirm */}
          {step === 3 && (
            <div className="bk-card">
              <div className="bk-card-title">Confirm & Pay</div>

              {/* Summary */}
              <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:24 }}>
                {[
                  { label:'From', value: form.customerName },
                  { label:'Pickup', value: form.pickupLocation },
                  { label:'Drop-off', value: form.dropoffLocation },
                  { label:'Recipient', value: `${form.recipientName} · ${form.recipientPhone}` },
                  { label:'Delivery Type', value: DELIVERY_TYPES.find(t => t.value === form.deliveryType)?.label },
                  form.deliveryType === 'scheduled' && { label:'Scheduled', value: `${form.scheduledDate} at ${form.scheduledTime}` },
                  { label:'Package', value: form.packageDescription },
                ].filter(Boolean).map(item => (
                  <div key={item.label} style={{ display:'flex', gap:16, padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ width:90, fontSize:12, color:'rgba(240,244,255,0.35)', flexShrink:0 }}>{item.label}</div>
                    <div style={{ fontSize:13, color:'#f0f4ff' }}>{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Delivery Fee */}
              <div className="bk-fee-box">
                <div className="bk-fee-label">Estimated Delivery Fee</div>
                <div className="bk-fee-amount">GHS {deliveryFee}</div>
              </div>

              {/* Payment Method */}
              <div className="bk-field">
                <label className="bk-label">Payment Method</label>
                <div className="bk-payment-row">
                  <div className={`bk-payment-card${form.paymentMethod === 'cash' ? ' selected' : ''}`} onClick={() => set('paymentMethod', 'cash')}>
                    <div className="bk-payment-icon">💵</div>
                    <div className="bk-payment-label">Cash on Delivery</div>
                  </div>
                  <div className={`bk-payment-card${form.paymentMethod === 'mobile-money' ? ' selected' : ''}`} onClick={() => set('paymentMethod', 'mobile-money')}>
                    <div className="bk-payment-icon">📱</div>
                    <div className="bk-payment-label">Mobile Money</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && <div className="bk-error">⚠ {error}</div>}

          <div className="bk-actions">
            {step > 1 && <button className="bk-btn-ghost" onClick={() => { setStep(prev => prev - 1); setError('') }}>Back</button>}
            {step < 3
              ? <button className="bk-btn-primary" onClick={nextStep}>Continue →</button>
              : <button className="bk-btn-primary" onClick={handleSubmit} disabled={loading}>{loading ? 'Booking...' : '✓ Confirm Booking'}</button>
            }
          </div>
        </div>
      </div>
    </>
  )
}