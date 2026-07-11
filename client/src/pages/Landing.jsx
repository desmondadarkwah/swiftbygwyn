import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Landing() {
  const [trackID, setTrackID] = useState('')
  const navigate = useNavigate()

  const handleTrack = (e) => {
    e.preventDefault()
    if (trackID.trim()) navigate(`/track/${trackID.trim().toUpperCase()}`)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Syne:wght@600;700;800&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .land-root { font-family: 'Inter', sans-serif; background: #0b0f1a; color: #f0f4ff; min-height: 100vh; }

        /* NAV */
        .land-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          background: rgba(11,15,26,0.92); backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          padding: 0 56px; height: 68px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .land-logo {
          font-family: 'Syne', sans-serif; font-weight: 800; font-size: 20px;
          color: #fff; letter-spacing: -0.02em; text-decoration: none;
          display: flex; align-items: center; gap: 10px;
        }
        .land-logo-icon {
          width: 36px; height: 36px; background: #f97316;
          border-radius: 8px; display: flex; align-items: center; justify-content: center;
          font-size: 16px;
        }
        .land-nav-links { display: flex; align-items: center; gap: 32px; }
        .land-nav-links a {
          font-size: 13px; font-weight: 500; color: rgba(240,244,255,0.5);
          text-decoration: none; transition: color 0.2s; letter-spacing: 0.01em;
        }
        .land-nav-links a:hover { color: #fff; }
        .land-nav-btn {
          padding: 9px 22px; background: #f97316; color: #fff;
          border: none; border-radius: 8px; font-size: 13px; font-weight: 600;
          cursor: pointer; transition: opacity 0.2s; text-decoration: none;
        }
        .land-nav-btn:hover { opacity: 0.88; }

        /* HERO */
        .land-hero {
          min-height: 100vh;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 120px 56px 80px; text-align: center;
          position: relative; overflow: hidden;
        }
        .land-hero::before {
          content: '';
          position: absolute; top: -200px; left: 50%; transform: translateX(-50%);
          width: 800px; height: 800px; border-radius: 50%;
          background: radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%);
          pointer-events: none;
        }
        .land-hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(249,115,22,0.1); border: 1px solid rgba(249,115,22,0.25);
          border-radius: 100px; padding: 6px 16px; margin-bottom: 28px;
          font-size: 12px; font-weight: 500; color: #f97316; letter-spacing: 0.04em;
        }
        .land-hero-badge-dot { width: 6px; height: 6px; background: #f97316; border-radius: 50%; animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
        .land-hero-title {
          font-family: 'Syne', sans-serif; font-weight: 800;
          font-size: clamp(40px, 7vw, 80px); line-height: 1.05;
          letter-spacing: -0.03em; color: #fff; margin-bottom: 24px;
        }
        .land-hero-title span { color: #f97316; }
        .land-hero-sub {
          font-size: clamp(15px, 2vw, 18px); font-weight: 400;
          color: rgba(240,244,255,0.5); max-width: 520px;
          line-height: 1.7; margin-bottom: 44px;
        }
        .land-hero-actions { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; justify-content: center; }
        .land-btn-primary {
          padding: 14px 32px; background: #f97316; color: #fff;
          border: none; border-radius: 10px; font-size: 14px; font-weight: 600;
          cursor: pointer; transition: all 0.2s; text-decoration: none;
          display: inline-flex; align-items: center; gap: 8px;
        }
        .land-btn-primary:hover { opacity: 0.88; transform: translateY(-1px); }
        .land-btn-secondary {
          padding: 14px 32px; background: transparent; color: #f0f4ff;
          border: 1px solid rgba(255,255,255,0.12); border-radius: 10px;
          font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s;
          text-decoration: none;
        }
        .land-btn-secondary:hover { border-color: rgba(255,255,255,0.3); }

        /* TRACK BAR */
        .land-track-bar {
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px; padding: 28px 32px; margin-top: 56px;
          max-width: 540px; width: 100%; text-align: left;
        }
        .land-track-label {
          font-size: 11px; font-weight: 600; letter-spacing: 0.08em;
          text-transform: uppercase; color: rgba(240,244,255,0.35); margin-bottom: 12px;
        }
        .land-track-form { display: flex; gap: 10px; }
        .land-track-input {
          flex: 1; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px; padding: 12px 16px; font-size: 14px; font-weight: 500;
          color: #fff; outline: none; transition: border-color 0.2s; letter-spacing: 0.05em;
        }
        .land-track-input::placeholder { color: rgba(240,244,255,0.25); }
        .land-track-input:focus { border-color: #f97316; }
        .land-track-btn {
          padding: 12px 24px; background: #f97316; color: #fff;
          border: none; border-radius: 8px; font-size: 13px; font-weight: 600;
          cursor: pointer; transition: opacity 0.2s; white-space: nowrap;
        }
        .land-track-btn:hover { opacity: 0.88; }

        /* STATS */
        .land-stats {
          display: flex; align-items: center; gap: 40px;
          margin-top: 56px; padding-top: 40px;
          border-top: 1px solid rgba(255,255,255,0.06);
          flex-wrap: wrap; justify-content: center;
        }
        .land-stat-num {
          font-family: 'Syne', sans-serif; font-weight: 800; font-size: 28px; color: #fff;
        }
        .land-stat-label { font-size: 12px; color: rgba(240,244,255,0.35); margin-top: 2px; }

        /* HOW IT WORKS */
        .land-section { padding: 100px 56px; }
        .land-section-label {
          font-size: 11px; font-weight: 600; letter-spacing: 0.1em;
          text-transform: uppercase; color: #f97316; margin-bottom: 16px;
        }
        .land-section-title {
          font-family: 'Syne', sans-serif; font-weight: 800;
          font-size: clamp(28px, 4vw, 44px); letter-spacing: -0.02em;
          color: #fff; margin-bottom: 56px;
        }
        .land-steps {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 24px; max-width: 1000px; margin: 0 auto;
        }
        .land-step {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px; padding: 28px;
        }
        .land-step-num {
          width: 40px; height: 40px; background: rgba(249,115,22,0.15);
          border: 1px solid rgba(249,115,22,0.3); border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Syne', sans-serif; font-weight: 800; font-size: 16px;
          color: #f97316; margin-bottom: 16px;
        }
        .land-step-title { font-size: 15px; font-weight: 600; color: #fff; margin-bottom: 8px; }
        .land-step-text { font-size: 13px; color: rgba(240,244,255,0.45); line-height: 1.7; }

        /* DELIVERY TYPES */
        .land-types {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px; max-width: 900px; margin: 0 auto;
        }
        .land-type {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px; padding: 24px; text-align: center;
          transition: border-color 0.2s;
        }
        .land-type:hover { border-color: rgba(249,115,22,0.3); }
        .land-type-icon { font-size: 32px; margin-bottom: 12px; }
        .land-type-name { font-size: 14px; font-weight: 600; color: #fff; margin-bottom: 6px; }
        .land-type-desc { font-size: 12px; color: rgba(240,244,255,0.4); line-height: 1.6; }

        /* FOOTER */
        .land-footer {
          border-top: 1px solid rgba(255,255,255,0.06);
          padding: 32px 56px;
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 16px;
        }
        .land-footer-text { font-size: 13px; color: rgba(240,244,255,0.3); }
        .land-footer-links { display: flex; gap: 24px; }
        .land-footer-links a { font-size: 13px; color: rgba(240,244,255,0.3); text-decoration: none; }
        .land-footer-links a:hover { color: #f97316; }

        /* WHATSAPP FLOAT */
        .land-wa {
          position: fixed; bottom: 28px; right: 28px; z-index: 99;
          width: 52px; height: 52px; background: #25D366; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 20px rgba(37,211,102,0.35);
          text-decoration: none; transition: transform 0.2s;
        }
        .land-wa:hover { transform: scale(1.08); }

        /* MOBILE NAV */
        .land-nav-hamburger {
          display: none; flex-direction: column; gap: 5px;
          background: none; border: none; cursor: pointer; padding: 4px;
        }
        .land-nav-hamburger span { display: block; width: 22px; height: 1.5px; background: #fff; }

        @media (max-width: 768px) {
          .land-nav { padding: 0 24px; }
          .land-nav-links { display: none; }
          .land-nav-hamburger { display: flex; }
          .land-hero { padding: 100px 24px 60px; }
          .land-section { padding: 70px 24px; }
          .land-footer { padding: 24px; flex-direction: column; }
          .land-stats { gap: 24px; }
          .land-track-form { flex-direction: column; }
        }
      `}</style>

      <div className="land-root">
        {/* NAV */}
        <nav className="land-nav">
          <a href="/" className="land-logo">
            <div className="land-logo-icon">🚀</div>
            SwiftByGwyn
          </a>
          <div className="land-nav-links">
            <a href="#how-it-works">How It Works</a>
            <a href="#delivery-types">Delivery Types</a>
            <a href="#track">Track Order</a>
          </div>
          <a href="/book" className="land-nav-btn">Book Delivery</a>
        </nav>

        {/* HERO */}
        <section className="land-hero">
          <div className="land-hero-badge">
            <div className="land-hero-badge-dot" />
            Fast · Reliable · Trackable
          </div>
          <h1 className="land-hero-title">
            Delivery Made<br /><span>Simple & Fast</span>
          </h1>
          <p className="land-hero-sub">
            Book a delivery in minutes. Track your package in real time.
            SwiftByGwyn handles your deliveries across Greater Accra with speed and care.
          </p>
          <div className="land-hero-actions">
            <a href="/book" className="land-btn-primary">📦 Book a Delivery</a>
            <a href="#how-it-works" className="land-btn-secondary">How It Works</a>
          </div>

          {/* Track Bar */}
          <div className="land-track-bar" id="track">
            <div className="land-track-label">Track your order</div>
            <form className="land-track-form" onSubmit={handleTrack}>
              <input
                className="land-track-input"
                placeholder="Enter Order ID e.g. SWG001"
                value={trackID}
                onChange={e => setTrackID(e.target.value)}
              />
              <button className="land-track-btn" type="submit">Track</button>
            </form>
          </div>

          {/* Stats */}
          <div className="land-stats">
            {[
              { num: '500+', label: 'Deliveries Completed' },
              { num: '< 2hrs', label: 'Average Delivery Time' },
              { num: '100%', label: 'Package Safety' },
              { num: '24/7', label: 'Customer Support' },
            ].map(s => (
              <div key={s.label} style={{ textAlign:'center' }}>
                <div className="land-stat-num">{s.num}</div>
                <div className="land-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="land-section" id="how-it-works" style={{ background:'rgba(255,255,255,0.02)' }}>
          <div style={{ maxWidth:1000, margin:'0 auto' }}>
            <div className="land-section-label">Simple Process</div>
            <h2 className="land-section-title">How It Works</h2>
            <div className="land-steps">
              {[
                { num:'01', title:'Book Online', text:'Fill in your pickup, dropoff, and package details. Choose your delivery type and confirm.' },
                { num:'02', title:'Get Your Order ID', text:'Receive a unique Order ID (e.g. SWG001) instantly after booking. Share it with your recipient.' },
                { num:'03', title:'Rider Assigned', text:'Our team assigns the nearest available rider to your delivery immediately.' },
                { num:'04', title:'Track & Receive', text:'Track your delivery in real time using your Order ID. Get notified at every step.' },
              ].map(s => (
                <div key={s.num} className="land-step">
                  <div className="land-step-num">{s.num}</div>
                  <div className="land-step-title">{s.title}</div>
                  <div className="land-step-text">{s.text}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* DELIVERY TYPES */}
        <section className="land-section" id="delivery-types">
          <div style={{ maxWidth:1000, margin:'0 auto' }}>
            <div className="land-section-label">Our Services</div>
            <h2 className="land-section-title">Delivery Types</h2>
            <div className="land-types">
              {[
                { icon:'🚶', name:'Standard Delivery', desc:'Reliable delivery within the day. Best for non-urgent packages.' },
                { icon:'⚡', name:'Same-Day Delivery', desc:'Book before noon and get your package delivered same day.' },
                { icon:'🚀', name:'Express / Urgent', desc:'Priority delivery for time-sensitive packages. Fastest option available.' },
                { icon:'📅', name:'Scheduled Delivery', desc:'Pick your preferred date and time. We\'ll be there exactly when you need us.' },
              ].map(t => (
                <div key={t.name} className="land-type">
                  <div className="land-type-icon">{t.icon}</div>
                  <div className="land-type-name">{t.name}</div>
                  <div className="land-type-desc">{t.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="land-footer">
          <div className="land-footer-text">© 2024 SwiftByGwyn Delivery Service. All rights reserved.</div>
          <div className="land-footer-links">
            <a href="/book">Book Delivery</a>
            <a href="/track">Track Order</a>
            <a href="/admin/login">Admin</a>
          </div>
        </footer>

        {/* WHATSAPP FLOAT */}
        
         <a href="https://wa.me/233000000000?text=Hi%20SwiftByGwyn!%20I%27d%20like%20to%20book%20a%20delivery."
          target="_blank"
          rel="noreferrer"
          className="land-wa"
        >
          <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </a>
      </div>
    </>
  )
}