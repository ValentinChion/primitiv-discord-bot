"use client";

import { useState, useEffect, useCallback } from "react";

interface Participant {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  createdAt: string;
}

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `il y a ${diff}s`;
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`;
  return `il y a ${Math.floor(diff / 86400)}j`;
}

function RefreshIcon({ spinning }: { spinning: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ animation: spinning ? "spin-cw 0.7s linear infinite" : "none", display: "block" }}>
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function Checkbox({ checked, indeterminate = false }: { checked: boolean; indeterminate?: boolean }) {
  return (
    <div className={`checkbox-cell${checked || indeterminate ? " checked" : ""}${indeterminate ? " indeterminate" : ""}`}>
      {indeterminate ? (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <line x1="2" y1="6" x2="10" y2="6" stroke="#080808" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      ) : checked ? (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <polyline points="2,6 5,9 10,3" stroke="#080808" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : null}
    </div>
  );
}

export default function TirageListPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchParticipants = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/tirage");
      if (!res.ok) throw new Error("Erreur serveur");
      const data = await res.json();
      setParticipants(data);
      setSelected(new Set());
    } catch {
      setError("Impossible de charger les participants.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchParticipants(); }, [fetchParticipants]);

  const query = search.toLowerCase().trim();
  const filtered = query
    ? participants.filter(p =>
        p.firstName.toLowerCase().includes(query) ||
        p.lastName.toLowerCase().includes(query) ||
        p.phone.includes(query))
    : participants;

  function toggleRow(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    const filteredIds = filtered.map(p => p.id);
    const allSelected = filteredIds.every(id => selected.has(id));
    setSelected(prev => {
      const next = new Set(prev);
      if (allSelected) filteredIds.forEach(id => next.delete(id));
      else filteredIds.forEach(id => next.add(id));
      return next;
    });
  }

  async function handleDelete() {
    setDeleting(true);
    const ids = Array.from(selected);
    try {
      const res = await fetch("/api/tirage", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) throw new Error();
      setParticipants(prev => prev.filter(p => !selected.has(p.id)));
      setSelected(new Set());
      setConfirmOpen(false);
    } catch {
      // keep modal open, user can retry
    } finally {
      setDeleting(false);
    }
  }

  const filteredIds = filtered.map(p => p.id);
  const allFilteredSelected = filteredIds.length > 0 && filteredIds.every(id => selected.has(id));
  const someFilteredSelected = filteredIds.some(id => selected.has(id));
  const selectedNames = participants.filter(p => selected.has(p.id)).map(p => `${p.firstName} ${p.lastName}`);

  return (
    <>
      <style>{`
        @keyframes spin-cw { to { transform: rotate(360deg); } }
        @keyframes row-in  { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
        @keyframes bar-in  { from { opacity: 0; transform: translateX(-50%) translateY(12px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }

        .list-row, .list-header {
          display: grid;
          grid-template-columns: 40px 44px 1fr 1fr 1fr auto;
          gap: 0 12px;
          padding-left: 12px;
          padding-right: 12px;
          align-items: center;
        }
        .list-row {
          padding-top: 12px;
          padding-bottom: 12px;
          border-left: 3px solid transparent;
          transition: border-color 0.12s ease, background 0.12s ease;
          cursor: pointer;
          animation: row-in 0.3s ease both;
          -webkit-tap-highlight-color: transparent;
          user-select: none;
        }
        .list-row:nth-child(even) { background: rgba(255,255,255,0.02); }
        .list-row:hover { background: rgba(255,255,255,0.03); }
        .list-row.selected {
          border-left-color: #DDFF00;
          background: rgba(221,255,0,0.06) !important;
        }

        .checkbox-cell {
          width: 22px;
          height: 22px;
          border-radius: 5px;
          border: 1.5px solid #333;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: border-color 0.12s ease, background 0.12s ease;
          flex-shrink: 0;
        }
        .checkbox-cell.checked, .checkbox-cell.indeterminate {
          background: #DDFF00;
          border-color: #DDFF00;
        }

        .skeleton-row {
          height: 52px;
          border-radius: 2px;
          background: linear-gradient(90deg, #111 25%, #1a1a1a 50%, #111 75%);
          background-size: 800px 100%;
          animation: shimmer 1.4s infinite linear;
        }

        .search-input {
          width: 100%;
          background: #0d0d0d;
          color: #efefef;
          border: 2px solid #1e1e1e;
          border-radius: 4px;
          padding: 14px 16px 14px 48px;
          font-family: 'Share Tech Mono', monospace;
          font-size: 16px;
          outline: none;
          transition: border-color 0.15s ease;
          box-sizing: border-box;
          -webkit-text-size-adjust: none;
        }
        .search-input:focus { border-color: #DDFF00; }
        .search-input::placeholder { color: #333; }

        .refresh-btn {
          background: transparent;
          border: 2px solid #222;
          border-radius: 4px;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #777;
          cursor: pointer;
          transition: border-color 0.15s ease, color 0.15s ease, background 0.15s ease;
          flex-shrink: 0;
          -webkit-tap-highlight-color: transparent;
        }
        .refresh-btn:hover { border-color: #DDFF00; color: #DDFF00; }
        .refresh-btn:active { opacity: 0.7; }
        .refresh-btn.refreshing {
          border-color: #DDFF00;
          color: #DDFF00;
          background: rgba(221,255,0,0.08);
          cursor: default;
        }

        .delete-bar {
          position: fixed;
          left: 50%;
          transform: translateX(-50%);
          bottom: calc(65px + env(safe-area-inset-bottom, 0px) + 12px);
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(20,20,20,0.95);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid #2a2a2a;
          border-radius: 100px;
          padding: 10px 10px 10px 20px;
          white-space: nowrap;
          animation: bar-in 0.2s ease both;
          box-shadow: 0 4px 24px rgba(0,0,0,0.6);
        }
        .delete-bar-label {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #efefef;
        }
        .delete-bar-btn {
          background: #c0392b;
          border: none;
          border-radius: 100px;
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          cursor: pointer;
          transition: background 0.15s ease;
          -webkit-tap-highlight-color: transparent;
          flex-shrink: 0;
        }
        .delete-bar-btn:hover { background: #e74c3c; }
        .delete-bar-btn:active { background: #a93226; }

        .confirm-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          padding: 24px;
          box-sizing: border-box;
        }
        .confirm-card {
          background: #111;
          border: 1px solid #222;
          border-radius: 12px;
          padding: 28px 24px 24px;
          width: 100%;
          max-width: 320px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .confirm-names {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .confirm-names li {
          font-family: 'Share Tech Mono', monospace;
          font-size: 13px;
          color: #888;
          padding: 4px 0;
          border-bottom: 1px solid #1a1a1a;
        }
        .confirm-names li:last-child { border-bottom: none; }
        .confirm-actions {
          display: flex;
          gap: 10px;
        }
        .confirm-cancel {
          flex: 1;
          background: transparent;
          border: 1.5px solid #333;
          border-radius: 6px;
          color: #888;
          font-family: 'Bebas Neue', cursive;
          font-size: 18px;
          letter-spacing: 0.06em;
          padding: 12px;
          cursor: pointer;
          transition: border-color 0.12s ease, color 0.12s ease;
          -webkit-tap-highlight-color: transparent;
        }
        .confirm-cancel:hover { border-color: #555; color: #efefef; }
        .confirm-delete {
          flex: 1;
          background: #c0392b;
          border: none;
          border-radius: 6px;
          color: #fff;
          font-family: 'Bebas Neue', cursive;
          font-size: 18px;
          letter-spacing: 0.06em;
          padding: 12px;
          cursor: pointer;
          transition: background 0.12s ease;
          -webkit-tap-highlight-color: transparent;
        }
        .confirm-delete:hover:not(:disabled) { background: #e74c3c; }
        .confirm-delete:disabled { opacity: 0.5; cursor: default; }

        @media (max-width: 500px) {
          .list-row, .list-header {
            grid-template-columns: 40px 36px 1fr 1fr !important;
            padding-left: 10px;
            padding-right: 10px;
          }
          .list-row {
            grid-template-rows: auto auto;
            gap: 2px 10px;
          }
          .col-phone { grid-column: 3; grid-row: 2; font-size: 12px; }
          .col-time  { display: none; }
          .col-phone-header, .col-time-header { display: none; }
        }
      `}</style>

      <div style={{
        minHeight: "100dvh",
        background: "#080808",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        paddingTop: "env(safe-area-inset-top, 0px)",
      }}>

        {/* Header */}
        <div style={{ padding: "20px 16px 16px", borderBottom: "1px solid #161616", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 22, color: "#DDFF00", lineHeight: 1, letterSpacing: "0.06em" }}>EKOTONE</div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700, color: "#777", letterSpacing: "0.16em", textTransform: "uppercase", marginTop: 2 }}>
              Inscrits au tirage
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              background: participants.length > 0 ? "#DDFF00" : "#161616",
              color: participants.length > 0 ? "#080808" : "#777",
              fontFamily: "'Bebas Neue', cursive",
              fontSize: 18, letterSpacing: "0.04em", padding: "2px 10px", borderRadius: 100, lineHeight: 1.4,
              transition: "background 0.2s ease, color 0.2s ease",
            }}>
              {loading ? "—" : `${participants.length}`}
            </div>
            <button className={`refresh-btn${refreshing ? " refreshing" : ""}`} onClick={() => fetchParticipants(true)} disabled={refreshing || loading} aria-label="Rafraîchir">
              <RefreshIcon spinning={refreshing} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div style={{ padding: "12px 16px", position: "relative" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ position: "absolute", left: 28, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input className="search-input" type="search" placeholder="Rechercher par nom ou téléphone…"
            value={search} onChange={e => setSearch(e.target.value)} autoComplete="off" />
        </div>

        {/* List */}
        <div style={{ flex: 1, overflow: "auto" }}>
          {loading ? (
            <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
              {[0,1,2,3].map(i => <div key={i} className="skeleton-row" style={{ animationDelay: `${i * 0.1}s` }} />)}
            </div>
          ) : error ? (
            <div style={{ padding: 32, textAlign: "center", fontFamily: "'Share Tech Mono', monospace", fontSize: 14, color: "#ff4d4d" }}>
              {error}<br />
              <button onClick={() => fetchParticipants()} style={{ marginTop: 12, background: "transparent", border: "1px solid #ff4d4d", color: "#ff4d4d", fontFamily: "'Share Tech Mono', monospace", fontSize: 12, padding: "6px 14px", borderRadius: 4, cursor: "pointer" }}>
                Réessayer
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 48, textAlign: "center", fontFamily: "'Bebas Neue', cursive", fontSize: 28, color: "#555", letterSpacing: "0.08em" }}>
              {search ? "Aucun résultat" : "Aucun inscrit"}
            </div>
          ) : (
            <div>
              {/* Column headers */}
              <div className="list-header" style={{ padding: "6px 0", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#666" }}>
                <div onClick={e => { e.stopPropagation(); toggleAll(); }} style={{ cursor: "pointer" }}>
                  <Checkbox checked={allFilteredSelected} indeterminate={!allFilteredSelected && someFilteredSelected} />
                </div>
                <span>#</span>
                <span>Nom</span>
                <span>Prénom</span>
                <span className="col-phone-header">Téléphone</span>
                <span className="col-time-header">Inscrit</span>
              </div>

              {filtered.map((p, i) => {
                const isSelected = selected.has(p.id);
                return (
                  <div
                    key={p.id}
                    className={`list-row${isSelected ? " selected" : ""}`}
                    style={{ animationDelay: `${Math.min(i * 0.04, 0.4)}s` }}
                    onClick={() => toggleRow(p.id)}
                  >
                    <Checkbox checked={isSelected} />
                    <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 12, color: "#666" }}>
                      {String(participants.indexOf(p) + 1).padStart(3, "0")}
                    </span>
                    <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 18, color: "#efefef", letterSpacing: "0.04em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {p.lastName.toUpperCase()}
                    </span>
                    <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, color: "#efefef", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {p.firstName}
                    </span>
                    <span className="col-phone" style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 13, color: "#888", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {p.phone}
                    </span>
                    <span className="col-time" style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 11, color: "#666", whiteSpace: "nowrap" }}>
                      {timeAgo(p.createdAt)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Floating delete bar */}
      {selected.size > 0 && (
        <div className="delete-bar">
          <span className="delete-bar-label">{selected.size} sélectionné{selected.size > 1 ? "s" : ""}</span>
          <button className="delete-bar-btn" onClick={() => setConfirmOpen(true)} aria-label="Supprimer la sélection">
            <TrashIcon />
          </button>
        </div>
      )}

      {/* Confirm modal */}
      {confirmOpen && (
        <div className="confirm-overlay" onClick={e => { if (e.target === e.currentTarget) setConfirmOpen(false); }}>
          <div className="confirm-card">
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 28, color: "#efefef", letterSpacing: "0.04em", lineHeight: 1 }}>
              Supprimer {selected.size} participant{selected.size > 1 ? "s" : ""}&nbsp;?
            </div>
            {selectedNames.length <= 5 ? (
              <ul className="confirm-names">
                {selectedNames.map(name => <li key={name}>{name}</li>)}
              </ul>
            ) : (
              <p style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 13, color: "#666", margin: 0 }}>
                Cette action est irréversible.
              </p>
            )}
            <div className="confirm-actions">
              <button className="confirm-cancel" onClick={() => setConfirmOpen(false)} disabled={deleting}>Annuler</button>
              <button className="confirm-delete" onClick={handleDelete} disabled={deleting}>
                {deleting ? "…" : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
