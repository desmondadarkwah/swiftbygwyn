import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRiderAuth } from '../context/RiderAuthContext'
import { getRiderOrders, updateOrderStatus, uploadProof, getRiderMe } from '../utils/api'

const STATUS_LABELS = {
  received: 'Order Received', assigned: 'Rider Assigned',
  accepted: 'Accepted', 'picked-up': 'Picked Up',
  'in-transit': 'In Transit', delivered: 'Delivered', cancelled: 'Cancelled',
}

const STATUS_COLORS = {
  received: { bg: 'rgba(99,102,241,0.15)', color: '#a5b4fc' },
  assigned: { bg: 'rgba(249,115,22,0.15)', color: '#fdba74' },
  accepted: { bg: 'rgba(168,85,247,0.15)', color: '#d8b4fe' },
  'picked-up': { bg: 'rgba(234,179,8,0.15)', color: '#fde047' },
  'in-transit': { bg: 'rgba(59,130,246,0.15)', color: '#93c5fd' },
  delivered: { bg: 'rgba(34,197,94,0.15)', color: '#86efac' },
  cancelled: { bg: 'rgba(239,68,68,0.15)', color: '#fca5a5' },
}

const NEXT_STATUS = {
  assigned: 'picked-up',
  'picked-up': 'in-transit',
  'in-transit': null,
}

export default function RiderDashboard() {
  const { rider, logout } = useRiderAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [riderInfo, setRiderInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [activeTab, setActiveTab] = useState('active')
  const [proofPhoto, setProofPhoto] = useState(null)
  const [proofName, setProofName] = useState('')
  const [proofLoading, setProofLoading] = useState(false)
  const [proofError, setProofError] = useState('')

  useEffect(() => {
    loadAll()
    const interval = setInterval(() => { loadAll() }, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [o, r] = await Promise.all([getRiderOrders(), getRiderMe()])
      setOrders(o); setRiderInfo(r)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const handleStatusUpdate = async (orderId, status) => {
    try { await updateOrderStatus(orderId, status); loadAll(); setSelectedOrder(null) }
    catch (e) { alert(e.response?.data?.error || 'Failed to update status') }
  }

  const handleProofSubmit = async () => {
    if (!proofPhoto && !proofName) { setProofError('Please upload a photo or enter recipient name.'); return }
    setProofLoading(true); setProofError('')
    try {
      const fd = new FormData()
      if (proofPhoto) fd.append('proofPhoto', proofPhoto)
      if (proofName) fd.append('proofRecipientName', proofName)
      await uploadProof(selectedOrder._id, fd)
      loadAll(); setSelectedOrder(null); setProofPhoto(null); setProofName('')
    } catch (e) { setProofError(e.response?.data?.error || 'Failed to upload proof') }
    finally { setProofLoading(false) }
  }

  const handleLogout = () => { logout(); navigate('/rider/login') }

  const activeOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status))
  const completedOrders = orders.filter(o => o.status === 'delivered')
  const displayOrders = activeTab === 'active' ? activeOrders : completedOrders

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Syne:wght@600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .rd-root { min-height: 100vh; background: #0b0f1a; font-family: 'Inter', sans-serif; color: #f0f4ff; }
        .rd-topbar { background: rgba(255,255,255,0.03); border-bottom: 1px solid rgba(255,255,255,0.07); padding: 0 24px; height: 64px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 50; backdrop-filter: blur(12px); }
        .rd-topbar-logo { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 18px; color: #fff; display: flex; align-items: center; gap: 8px; }
        .rd-topbar-logo-icon { width: 32px; height: 32px; background: #f97316; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 14px; }
        .rd-topbar-right { display: flex; align-items: center; gap: 12px; }
        .rd-rider-name { font-size: 13px; color: rgba(240,244,255,0.5); }
        .rd-logout { padding: 7px 16px; background: transparent; color: rgba(240,244,255,0.35); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; font-size: 12px; cursor: pointer; }
        .rd-logout:hover { border-color: #f97316; color: #f97316; }

        .rd-main { max-width: 700px; margin: 0 auto; padding: 28px 20px 80px; }

        .rd-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; }
        .rd-stat { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 16px; text-align: center; }
        .rd-stat-num { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 26px; color: #f97316; }
        .rd-stat-label { font-size: 11px; color: rgba(240,244,255,0.35); margin-top: 3px; }

        .rd-tabs { display: flex; gap: 8px; margin-bottom: 20px; }
        .rd-tab { padding: 8px 20px; border-radius: 100px; font-size: 13px; font-weight: 500; cursor: pointer; border: 1px solid rgba(255,255,255,0.08); background: transparent; color: rgba(240,244,255,0.4); transition: all 0.2s; }
        .rd-tab.active { background: #f97316; color: #fff; border-color: #f97316; }

        .rd-order-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 20px; margin-bottom: 12px; cursor: pointer; transition: border-color 0.2s; }
        .rd-order-card:hover { border-color: rgba(249,115,22,0.3); }
        .rd-order-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
        .rd-order-id { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 20px; color: #f97316; }
        .rd-status-badge { padding: 4px 12px; border-radius: 100px; font-size: 11px; font-weight: 600; }
        .rd-route { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }
        .rd-route-item { display: flex; align-items: flex-start; gap: 10px; }
        .rd-route-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 4px; }
        .rd-route-dot.pickup { background: #f97316; }
        .rd-route-dot.dropoff { background: #22c55e; }
        .rd-route-text { font-size: 13px; color: rgba(240,244,255,0.7); }
        .rd-route-label { font-size: 10px; color: rgba(240,244,255,0.3); margin-bottom: 1px; letter-spacing: 0.04em; }
        .rd-order-meta { display: flex; gap: 16px; flex-wrap: wrap; }
        .rd-meta-item { font-size: 12px; color: rgba(240,244,255,0.4); }
        .rd-meta-item span { color: rgba(240,244,255,0.7); font-weight: 500; }
        .rd-empty { padding: 60px 0; text-align: center; color: rgba(240,244,255,0.25); font-size: 14px; }

        /* MODAL */
        .rd-modal-backdrop { position: fixed; inset: 0; z-index: 200; background: rgba(0,0,0,0.75); backdrop-filter: blur(6px); display: flex; align-items: flex-end; justify-content: center; }
        .rd-modal { background: #0f1525; border: 1px solid rgba(255,255,255,0.1); border-radius: 20px 20px 0 0; width: 100%; max-width: 600px; max-height: 90vh; overflow-y: auto; padding-bottom: 32px; }
        .rd-modal-head { padding: 20px 24px; border-bottom: 1px solid rgba(255,255,255,0.07); display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; background: #0f1525; }
        .rd-modal-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 18px; color: #fff; }
        .rd-modal-close { background: rgba(255,255,255,0.06); border: none; color: rgba(240,244,255,0.5); width: 32px; height: 32px; border-radius: 8px; cursor: pointer; }
        .rd-modal-body { padding: 24px; }
        .rd-modal-section { margin-bottom: 20px; }
        .rd-modal-section-title { font-size: 11px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: rgba(240,244,255,0.3); margin-bottom: 12px; }
        .rd-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .rd-info-item { background: rgba(255,255,255,0.03); border-radius: 10px; padding: 12px; }
        .rd-info-label { font-size: 11px; color: rgba(240,244,255,0.3); margin-bottom: 4px; }
        .rd-info-value { font-size: 13px; color: #f0f4ff; font-weight: 500; }
        .rd-action-btns { display: flex; gap: 8px; flex-wrap: wrap; }
        .rd-btn { padding: 12px 20px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; transition: all 0.2s; }
        .rd-btn-orange { background: #f97316; color: #fff; }
        .rd-btn-orange:hover { opacity: 0.88; }
        .rd-btn-blue { background: rgba(59,130,246,0.2); color: #93c5fd; border: 1px solid rgba(59,130,246,0.3); }
        .rd-btn-blue:hover { background: #3b82f6; color: #fff; }
        .rd-btn-green { background: rgba(34,197,94,0.2); color: #86efac; border: 1px solid rgba(34,197,94,0.3); flex: 1; }
        .rd-btn-green:hover { background: #22c55e; color: #fff; }
        .rd-maps-btn { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px; background: rgba(59,130,246,0.15); color: #93c5fd; border: 1px solid rgba(59,130,246,0.3); border-radius: 10px; text-decoration: none; font-size: 13px; font-weight: 600; transition: all 0.2s; }
        .rd-maps-btn:hover { background: #3b82f6; color: #fff; }
        .rd-proof-input { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); border-radius: 10px; padding: 11px 14px; font-size: 13px; color: #fff; outline: none; font-family: 'Inter', sans-serif; margin-bottom: 10px; }
        .rd-proof-input:focus { border-color: #f97316; }
        .rd-file-btn { width: 100%; padding: 14px; background: rgba(255,255,255,0.04); border: 1px dashed rgba(255,255,255,0.15); border-radius: 10px; color: rgba(240,244,255,0.4); font-size: 13px; cursor: pointer; text-align: center; margin-bottom: 10px; }
        .rd-proof-error { font-size: 12px; color: #fca5a5; padding: 10px; background: rgba(239,68,68,0.1); border-radius: 8px; margin-bottom: 10px; }
      `}</style>

      <div className="rd-root">
        <nav className="rd-topbar">
          <div className="rd-topbar-logo">
            <div className="rd-topbar-logo-icon">🏍️</div>
            SwiftByGwyn
          </div>
          <div className="rd-topbar-right">
            <span className="rd-rider-name">{riderInfo?.name || rider?.name}</span>
            <button className="rd-logout" onClick={handleLogout}>Sign Out</button>
          </div>
        </nav>

        <main className="rd-main">
          {/* Stats */}
          <div className="rd-stats">
            <div className="rd-stat">
              <div className="rd-stat-num">{activeOrders.length}</div>
              <div className="rd-stat-label">Active</div>
            </div>
            <div className="rd-stat">
              <div className="rd-stat-num">{completedOrders.length}</div>
              <div className="rd-stat-label">Completed</div>
            </div>
            <div className="rd-stat">
              <div className="rd-stat-num">{riderInfo?.totalDeliveries || 0}</div>
              <div className="rd-stat-label">All Time</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="rd-tabs">
            <button className={`rd-tab${activeTab === 'active' ? ' active' : ''}`} onClick={() => setActiveTab('active')}>
              Active ({activeOrders.length})
            </button>
            <button className={`rd-tab${activeTab === 'completed' ? ' active' : ''}`} onClick={() => setActiveTab('completed')}>
              Completed ({completedOrders.length})
            </button>
          </div>

          {/* Orders */}
          {loading ? (
            <div className="rd-empty">Loading your deliveries...</div>
          ) : displayOrders.length === 0 ? (
            <div className="rd-empty">
              {activeTab === 'active' ? '🏍️ No active deliveries right now.' : '✅ No completed deliveries yet.'}
            </div>
          ) : (
            displayOrders.map(order => {
              const sc = STATUS_COLORS[order.status] || STATUS_COLORS.received
              return (
                <div key={order._id} className="rd-order-card" onClick={() => setSelectedOrder(order)}>
                  <div className="rd-order-head">
                    <div className="rd-order-id">{order.orderID}</div>
                    <span className="rd-status-badge" style={{ background: sc.bg, color: sc.color }}>{STATUS_LABELS[order.status]}</span>
                  </div>
                  <div className="rd-route">
                    <div className="rd-route-item">
                      <div className="rd-route-dot pickup" />
                      <div><div className="rd-route-label">Pickup</div><div className="rd-route-text">{order.pickupLocation}</div></div>
                    </div>
                    <div className="rd-route-item">
                      <div className="rd-route-dot dropoff" />
                      <div><div className="rd-route-label">Drop-off</div><div className="rd-route-text">{order.dropoffLocation}</div></div>
                    </div>
                  </div>
                  <div className="rd-order-meta">
                    <div className="rd-meta-item">Recipient: <span>{order.recipientName}</span></div>
                    <div className="rd-meta-item">Phone: <span>{order.recipientPhone}</span></div>
                    <div className="rd-meta-item">Fee: <span style={{ color: '#f97316' }}>GHS {order.deliveryFee}</span></div>
                  </div>
                </div>
              )
            })
          )}
        </main>
      </div>

      {/* ORDER DETAIL MODAL */}
      {selectedOrder && (
        <div className="rd-modal-backdrop" onClick={e => e.target === e.currentTarget && setSelectedOrder(null)}>
          <div className="rd-modal">
            <div className="rd-modal-head">
              <div>
                <div style={{ fontSize: 11, color: 'rgba(240,244,255,0.3)', marginBottom: 2 }}>Delivery Details</div>
                <div className="rd-modal-title" style={{ color: '#f97316' }}>{selectedOrder.orderID}</div>
              </div>
              <button className="rd-modal-close" onClick={() => setSelectedOrder(null)}>✕</button>
            </div>
            <div className="rd-modal-body">

              {/* Route */}
              <div className="rd-modal-section">
                <div className="rd-modal-section-title">Route</div>
                <div className="rd-info-grid">
                  <div className="rd-info-item"><div className="rd-info-label">📍 Pickup</div><div className="rd-info-value">{selectedOrder.pickupLocation}</div></div>
                  <div className="rd-info-item"><div className="rd-info-label">🎯 Drop-off</div><div className="rd-info-value">{selectedOrder.dropoffLocation}</div></div>
                </div>
                <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selectedOrder.dropoffLocation)}`} target="_blank" rel="noreferrer" className="rd-maps-btn" style={{ marginTop: 10 }}>
                  🗺️ Open in Google Maps
                </a>
              </div>

              {/* Contacts */}
              <div className="rd-modal-section">
                <div className="rd-modal-section-title">Contacts</div>
                <div className="rd-info-grid">
                  <div className="rd-info-item"><div className="rd-info-label">Customer</div><div className="rd-info-value">{selectedOrder.customerName}</div><div style={{ fontSize: 12, color: '#f97316', marginTop: 4 }}><a href={`tel:${selectedOrder.customerPhone}`} style={{ color: '#f97316' }}>{selectedOrder.customerPhone}</a></div></div>
                  <div className="rd-info-item"><div className="rd-info-label">Recipient</div><div className="rd-info-value">{selectedOrder.recipientName}</div><div style={{ fontSize: 12, color: '#f97316', marginTop: 4 }}><a href={`tel:${selectedOrder.recipientPhone}`} style={{ color: '#f97316' }}>{selectedOrder.recipientPhone}</a></div></div>
                </div>
              </div>

              {/* Package */}
              <div className="rd-modal-section">
                <div className="rd-modal-section-title">Package</div>
                <div className="rd-info-item"><div className="rd-info-label">Description</div><div className="rd-info-value">{selectedOrder.packageDescription}</div></div>
                {selectedOrder.additionalNotes && <div className="rd-info-item" style={{ marginTop: 8 }}><div className="rd-info-label">Notes</div><div className="rd-info-value">{selectedOrder.additionalNotes}</div></div>}
                {selectedOrder.packageImage && <div style={{ marginTop: 8 }}><img src={selectedOrder.packageImage} alt="Package" style={{ width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 10 }} /></div>}
              </div>

              {/* Actions */}
              {selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled' && (
                <div className="rd-modal-section">
                  <div className="rd-modal-section-title">Update Status</div>
                  <div className="rd-action-btns">
                    {selectedOrder.status === 'assigned' && (
                      <button className="rd-btn rd-btn-orange" onClick={() => handleStatusUpdate(selectedOrder._id, 'accepted')}>✅ Accept Delivery</button>
                    )}
                    {selectedOrder.status === 'accepted' && (
                      <button className="rd-btn rd-btn-orange" onClick={() => handleStatusUpdate(selectedOrder._id, 'picked-up')}>📦 Mark as Picked Up</button>
                    )}
                    {selectedOrder.status === 'picked-up' && (
                      <button className="rd-btn rd-btn-blue" onClick={() => handleStatusUpdate(selectedOrder._id, 'in-transit')}>🚀 Mark as In Transit</button>
                    )}
                  </div>
                </div>
              )}

              {/* Proof of Delivery */}
              {selectedOrder.status === 'in-transit' && (
                <div className="rd-modal-section">
                  <div className="rd-modal-section-title">Mark as Delivered</div>
                  <input className="rd-proof-input" placeholder="Recipient name (who received the package)" value={proofName} onChange={e => setProofName(e.target.value)} />
                  <div className="rd-file-btn" onClick={() => document.getElementById('proof-img').click()}>
                    {proofPhoto ? `📷 ${proofPhoto.name}` : '📷 Upload delivery photo (optional)'}
                    <input id="proof-img" type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setProofPhoto(e.target.files[0])} />
                  </div>
                  {proofError && <div className="rd-proof-error">✕ {proofError}</div>}
                  <button className="rd-btn rd-btn-green" onClick={handleProofSubmit} disabled={proofLoading} style={{ width: '100%' }}>
                    {proofLoading ? 'Submitting...' : '✅ Confirm Delivery'}
                  </button>
                </div>
              )}

              {/* Already delivered */}
              {selectedOrder.status === 'delivered' && (
                <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 12, padding: 16, textAlign: 'center' }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>✅</div>
                  <div style={{ color: '#86efac', fontWeight: 600 }}>Delivery Completed</div>
                  {selectedOrder.proofRecipientName && <div style={{ fontSize: 13, color: 'rgba(240,244,255,0.5)', marginTop: 4 }}>Received by: {selectedOrder.proofRecipientName}</div>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}