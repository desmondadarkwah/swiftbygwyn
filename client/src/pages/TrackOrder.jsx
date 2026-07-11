import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { trackOrder } from '../utils/api'

const STATUSES = [
  { key: 'received',   label: 'Order Received',  icon: '📋', desc: 'Your booking has been confirmed.' },
  { key: 'assigned',   label: 'Rider Assigned',   icon: '🏍️', desc: 'A rider has been assigned to your delivery.' },
  { key: 'picked-up',  label: 'Picked Up',        icon: '📦', desc: 'Your package has been picked up.' },
  { key: 'in-transit', label: 'In Transit',        icon: '🚀', desc: 'Your package is on its way.' },
  { key: 'delivered',  label: 'Delivered',         icon: '✅', desc: 'Your package has been delivered.' },
]

const STATUS_INDEX = { received:0, assigned:1, 'picked-up':2, 'in-transit':3, delivered:4, cancelled:-1 }

export default function TrackOrder() {
  const { orderID } = useParams()
  const navigate    = useNavigate()
  const [order, setOrder]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState('')
  const [searchID, setSearchID] = useState(orderID || '')

  useEffect(() => {
    if (orderID) load(orderID)
    else setLoading(false)
  }, [orderID])

  const load = async (id) => {
    setLoading(true); setError('')
    try {
      const data = await trackOrder(id.toUpperCase())
      setOrder(data)
    } catch (err) {
      setError('Order not found. Please check your Order ID.')
    } finally { setLoading(false) }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchID.trim()) navigate(`/track/${searchID.trim().toUpperCase()}`)
  }

  const currentIndex = order ? STATUS_INDEX[order.status] : -1

  const deliveryTypeLabel = {
    standard: 'Standard Delivery',
    'same-day': 'Same-Day Delivery',
    express: 'Express / Urgent',
    scheduled: 'Scheduled Delivery',
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Syne:wght@600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .tr-root { min-height: 100vh; background: #0b0f1a; font-family: 'Inter', sans-serif; color: #f0f4ff; padding: 40px 24px 80px; }
        .tr-inner { max-width: 620px; margin: 0 auto; }
        .tr-nav { display: flex; align-items: center; justify-content: space-between; margin-bottom: 40px; }
        .tr-logo { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 18px; color: #fff; text-decoration: none; display: flex; align-items: center; gap: 8px; }
        .tr-logo-icon { width: 32px; height: 32px; background: #f97316; border-radius: 7px; display: flex; align-items: center; justify-content: center; font-size: 14px; }
        .tr-back { font-size: 13px; color: rgba(240,244,255,0.4); text-decoration: none; }
        .tr-back:hover { color: #f97316; }

        .tr-search-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 20px; padding: 28px; margin-bottom: 24px; }
        .tr-search-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 20px; color: #fff; margin-bottom: 16px; }
        .tr-search-form { display: flex; gap: 10px; }
        .tr-search-input { flex: 1; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); border-radius: 10px; padding: 12px 16px; font-size: 14px; color: #fff; outline: none; transition: border-color 0.2s; letter-spacing: 0.05em; }
        .tr-search-input:focus { border-color: #f97316; }
        .tr-search-input::placeholder { color: rgba(240,244,255,0.2); letter-spacing: 0; }
        .tr-search-btn { padding: 12px 24px; background: #f97316; color: #fff; border: none; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap; }

        .tr-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 20px; padding: 28px; margin-bottom: 16px; }

        .tr-order-head { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
        .tr-order-id { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 28px; color: #f97316; }
        .tr-order-label { font-size: 11px; color: rgba(240,244,255,0.35); margin-bottom: 4px; letter-spacing: 0.04em; }
        .tr-status-badge { padding: 6px 14px; border-radius: 100px; font-size: 12px; font-weight: 600; }
        .tr-status-badge.received   { background: rgba(99,102,241,0.15); color: #a5b4fc; border: 1px solid rgba(99,102,241,0.3); }
        .tr-status-badge.assigned   { background: rgba(249,115,22,0.15); color: #fdba74; border: 1px solid rgba(249,115,22,0.3); }
        .tr-status-badge.picked-up  { background: rgba(234,179,8,0.15); color: #fde047; border: 1px solid rgba(234,179,8,0.3); }
        .tr-status-badge.in-transit { background: rgba(59,130,246,0.15); color: #93c5fd; border: 1px solid rgba(59,130,246,0.3); }
        .tr-status-badge.delivered  { background: rgba(34,197,94,0.15); color: #86efac; border: 1px solid rgba(34,197,94,0.3); }
        .tr-status-badge.cancelled  { background: rgba(239,68,68,0.15); color: #fca5a5; border: 1px solid rgba(239,68,68,0.3); }

        /* TIMELINE */
        .tr-timeline { display: flex; flex-direction: column; gap: 0; margin: 24px 0; }
        .tr-tl-item { display: flex; gap: 16px; position: relative; }
        .tr-tl-item:not(:last-child)::before { content: ''; position: absolute; left: 15px; top: 36px; width: 2px; height: calc(100% - 8px); background: rgba(255,255,255,0.06); }
        .tr-tl-item.done::before { background: rgba(249,115,22,0.3); }
        .tr-tl-left { display: flex; flex-direction: column; align-items: center; flex-shrink: 0; }
        .tr-tl-circle { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; z-index: 1; }
        .tr-tl-circle.done { background: rgba(249,115,22,0.2); border: 2px solid #f97316; }
        .tr-tl-circle.current { background: #f97316; border: 2px solid #f97316; animation: tlPulse 2s infinite; }
        .tr-tl-circle.pending { background: rgba(255,255,255,0.05); border: 2px solid rgba(255,255,255,0.1); }
        @keyframes tlPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(249,115,22,0.4); } 50% { box-shadow: 0 0 0 8px rgba(249,115,22,0); } }
        .tr-tl-right { padding: 4px 0 24px; }
        .tr-tl-label { font-size: 14px; font-weight: 600; color: #fff; margin-bottom: 3px; }
        .tr-tl-label.pending { color: rgba(240,244,255,0.3); font-weight: 400; }
        .tr-tl-desc { font-size: 12px; color: rgba(240,244,255,0.35); }

        /* INFO ROWS */
        .tr-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .tr-info-item { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 16px; }
        .tr-info-label { font-size: 11px; color: rgba(240,244,255,0.3); margin-bottom: 6px; letter-spacing: 0.04em; text-transform: uppercase; }
        .tr-info-value { font-size: 14px; font-weight: 500; color: #f0f4ff; }

        .tr-rider-card { background: rgba(249,115,22,0.06); border: 1px solid rgba(249,115,22,0.2); border-radius: 14px; padding: 20px; display: flex; align-items: center; gap: 16px; }
        .tr-rider-avatar { width: 44px; height: 44px; background: rgba(249,115,22,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
        .tr-rider-name { font-size: 15px; font-weight: 600; color: #fff; margin-bottom: 3px; }
        .tr-rider-phone { font-size: 13px; color: rgba(240,244,255,0.4); }

        .tr-proof-card { background: rgba(34,197,94,0.05); border: 1px solid rgba(34,197,94,0.2); border-radius: 14px; padding: 20px; }
        .tr-proof-title { font-size: 13px; font-weight: 600; color: #86efac; margin-bottom: 12px; }
        .tr-proof-img { width: 100%; max-height: 200px; object-fit: cover; border-radius: 10px; }

        .tr-cancelled { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); border-radius: 14px; padding: 20px; text-align: center; }
        .tr-cancelled-icon { font-size: 32px; margin-bottom: 8px; }
        .tr-cancelled-text { font-size: 14px; color: #fca5a5; }

        .tr-error { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); border-radius: 12px; padding: 20px; text-align: center; color: #fca5a5; font-size: 14px; }
        .tr-loading { text-align: center; padding: 60px 0; color: rgba(240,244,255,0.3); font-size: 14px; }

        @media (max-width: 480px) {
          .tr-info-grid { grid-template-columns: 1fr; }
          .tr-search-form { flex-direction: column; }
        }
      `}</style>

      <div className="tr-root">
        <div className="tr-inner">
          <div className="tr-nav">
            <a href="/" className="tr-logo">
              <div className="tr-logo-icon">🚀</div>
              SwiftByGwyn
            </a>
            <a href="/" className="tr-back">← Home</a>
          </div>

          {/* Search */}
          <div className="tr-search-card">
            <div className="tr-search-title">Track Your Order</div>
            <form className="tr-search-form" onSubmit={handleSearch}>
              <input className="tr-search-input" placeholder="Enter Order ID e.g. SWG001" value={searchID} onChange={e => setSearchID(e.target.value)} />
              <button className="tr-search-btn" type="submit">Track</button>
            </form>
          </div>

          {loading && <div className="tr-loading">🔍 Looking up your order...</div>}

          {error && !loading && <div className="tr-error">❌ {error}</div>}

          {order && !loading && (
            <>
              {/* Order Header */}
              <div className="tr-card">
                <div className="tr-order-head">
                  <div>
                    <div className="tr-order-label">Order ID</div>
                    <div className="tr-order-id">{order.orderID}</div>
                  </div>
                  <div className={`tr-status-badge ${order.status}`}>
                    {order.status === 'received'   && '📋 Order Received'}
                    {order.status === 'assigned'   && '🏍️ Rider Assigned'}
                    {order.status === 'picked-up'  && '📦 Picked Up'}
                    {order.status === 'in-transit' && '🚀 In Transit'}
                    {order.status === 'delivered'  && '✅ Delivered'}
                    {order.status === 'cancelled'  && '❌ Cancelled'}
                  </div>
                </div>

                {/* Timeline */}
                {order.status !== 'cancelled' ? (
                  <div className="tr-timeline">
                    {STATUSES.map((s, i) => {
                      const isDone    = currentIndex > i
                      const isCurrent = currentIndex === i
                      return (
                        <div key={s.key} className={`tr-tl-item${isDone ? ' done' : ''}`}>
                          <div className="tr-tl-left">
                            <div className={`tr-tl-circle ${isDone ? 'done' : isCurrent ? 'current' : 'pending'}`}>
                              {isDone ? '✓' : s.icon}
                            </div>
                          </div>
                          <div className="tr-tl-right">
                            <div className={`tr-tl-label${!isDone && !isCurrent ? ' pending' : ''}`}>{s.label}</div>
                            {(isDone || isCurrent) && <div className="tr-tl-desc">{s.desc}</div>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="tr-cancelled">
                    <div className="tr-cancelled-icon">❌</div>
                    <div className="tr-cancelled-text">This order has been cancelled. Contact us for assistance.</div>
                  </div>
                )}
              </div>

              {/* Delivery Info */}
              <div className="tr-card">
                <div style={{ fontSize:13, fontWeight:600, color:'rgba(240,244,255,0.4)', marginBottom:16, letterSpacing:'0.04em', textTransform:'uppercase' }}>Delivery Details</div>
                <div className="tr-info-grid">
                  <div className="tr-info-item">
                    <div className="tr-info-label">Pickup</div>
                    <div className="tr-info-value">{order.pickupLocation}</div>
                  </div>
                  <div className="tr-info-item">
                    <div className="tr-info-label">Drop-off</div>
                    <div className="tr-info-value">{order.dropoffLocation}</div>
                  </div>
                  <div className="tr-info-item">
                    <div className="tr-info-label">Delivery Type</div>
                    <div className="tr-info-value">{deliveryTypeLabel[order.deliveryType] || order.deliveryType}</div>
                  </div>
                  <div className="tr-info-item">
                    <div className="tr-info-label">Delivery Fee</div>
                    <div className="tr-info-value" style={{ color:'#f97316' }}>GHS {order.deliveryFee}</div>
                  </div>
                  {order.deliveryType === 'scheduled' && (
                    <div className="tr-info-item" style={{ gridColumn:'1/-1' }}>
                      <div className="tr-info-label">Scheduled For</div>
                      <div className="tr-info-value">{order.scheduledDate} at {order.scheduledTime}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Assigned Rider */}
              {order.assignedRider && (
                <div className="tr-card">
                  <div style={{ fontSize:13, fontWeight:600, color:'rgba(240,244,255,0.4)', marginBottom:16, letterSpacing:'0.04em', textTransform:'uppercase' }}>Your Rider</div>
                  <div className="tr-rider-card">
                    <div className="tr-rider-avatar">🏍️</div>
                    <div>
                      <div className="tr-rider-name">{order.assignedRider.name}</div>
                      <div className="tr-rider-phone">{order.assignedRider.phone}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Proof of Delivery */}
              {order.status === 'delivered' && (order.proofPhoto || order.proofRecipientName) && (
                <div className="tr-card">
                  <div className="tr-proof-card">
                    <div className="tr-proof-title">✅ Proof of Delivery</div>
                    {order.proofRecipientName && (
                      <div style={{ fontSize:14, color:'rgba(240,244,255,0.6)', marginBottom: order.proofPhoto ? 12 : 0 }}>
                        Received by: <strong style={{ color:'#fff' }}>{order.proofRecipientName}</strong>
                      </div>
                    )}
                    {order.proofPhoto && <img src={order.proofPhoto} alt="Proof of delivery" className="tr-proof-img" />}
                  </div>
                </div>
              )}

              <div style={{ textAlign:'center', marginTop:24 }}>
                <a href="/book" style={{ fontSize:13, color:'#f97316', textDecoration:'none' }}>+ Book Another Delivery</a>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}