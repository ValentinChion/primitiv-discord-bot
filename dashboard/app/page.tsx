import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <style>{`
        @keyframes tile-in {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        html, body { height: 100%; }

        .home-wrap {
          min-height: 100dvh;
          background: #080808;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
        }

        .noise {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          opacity: 0.025;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 256px 256px;
        }

        .home-header {
          position: relative;
          z-index: 1;
          padding: 20px 0 0;
          text-align: center;
          font-family: 'Bebas Neue', cursive;
          font-size: 14px;
          letter-spacing: 0.28em;
          color: #DDFF00;
          flex-shrink: 0;
        }

        .tiles {
          position: relative;
          z-index: 1;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .tile {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: clamp(24px, 6vw, 48px);
          text-decoration: none;
          position: relative;
          border-top: 1px solid #161616;
          transition: background 0.2s ease;
          -webkit-tap-highlight-color: transparent;
          animation: tile-in 0.5s ease both;
          overflow: hidden;
        }
        .tile:first-child { animation-delay: 0.05s; }
        .tile:last-child  { animation-delay: 0.15s; }

        .tile::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: #DDFF00;
          transform: scaleY(0);
          transform-origin: bottom;
          transition: transform 0.25s cubic-bezier(.22,.68,0,1.2);
        }
        .tile:hover::before { transform: scaleY(1); }
        .tile:hover { background: rgba(221,255,0,0.03); }
        .tile:active { background: rgba(221,255,0,0.06); }

        .tile-eyebrow {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #444;
          margin-bottom: 10px;
          transition: color 0.2s ease;
        }
        .tile:hover .tile-eyebrow { color: #777; }

        .tile-title {
          font-family: 'Bebas Neue', cursive;
          font-size: clamp(52px, 13vw, 88px);
          line-height: 0.9;
          letter-spacing: 0.02em;
          color: #efefef;
          transition: color 0.15s ease;
        }
        .tile:hover .tile-title { color: #fff; }

        .tile-arrow {
          display: inline-block;
          margin-left: 12px;
          color: #DDFF00;
          opacity: 0;
          transform: translateX(-6px);
          transition: opacity 0.2s ease, transform 0.2s ease;
          font-size: 0.75em;
          vertical-align: middle;
        }
        .tile:hover .tile-arrow {
          opacity: 1;
          transform: translateX(0);
        }

        .tile-meta {
          position: absolute;
          bottom: clamp(24px, 6vw, 48px);
          right: clamp(24px, 6vw, 48px);
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: 'Share Tech Mono', monospace;
          font-size: 11px;
          color: #2a2a2a;
          transition: color 0.2s ease;
        }
        .tile:hover .tile-meta { color: #444; }

        .tile-divider {
          height: 1px;
          background: #161616;
          flex-shrink: 0;
          position: relative;
          z-index: 1;
        }

        @media (min-height: 700px) {
          .tile-eyebrow { margin-bottom: 14px; }
        }

        @media (orientation: landscape) and (min-width: 700px) {
          .tiles { flex-direction: row; }
          .tile { border-top: none; border-left: 1px solid #161616; }
          .tile:first-child { border-left: none; }
          .tile::before {
            top: 0;
            left: 0;
            right: 0;
            bottom: auto;
            width: auto;
            height: 3px;
            transform: scaleX(0);
            transform-origin: left;
          }
          .tile:hover::before { transform: scaleX(1); }
        }
      `}</style>

      <div className="home-wrap">
        <div className="noise" aria-hidden />

        <div className="home-header">EKOTONE · 2026</div>

        <div className="tiles">
          <Link href="/schedule" className="tile">
            <div className="tile-eyebrow">Festival</div>
            <div className="tile-title">
              Programme
              <span className="tile-arrow">→</span>
            </div>
            <div className="tile-meta">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Consulter les horaires
            </div>
          </Link>

          <div className="tile-divider" />

          <Link href="/tirage" className="tile">
            <div className="tile-eyebrow">Gestion</div>
            <div className="tile-title">
              Tirage au sort
              <span className="tile-arrow">→</span>
            </div>
            <div className="tile-meta">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Accès restreint
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}
