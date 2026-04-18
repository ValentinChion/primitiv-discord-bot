"use client";

import { useState } from "react";

type Field = "firstName" | "lastName" | "phone";

const FIELDS: { key: Field; label: string; type: string; placeholder: string; autocomplete: string }[] = [
  { key: "firstName", label: "Prénom", type: "text", placeholder: "Marie", autocomplete: "given-name" },
  { key: "lastName", label: "Nom", type: "text", placeholder: "Dupont", autocomplete: "family-name" },
  { key: "phone", label: "Téléphone", type: "tel", placeholder: "06 12 34 56 78", autocomplete: "tel" },
];

export default function TiragePage() {
  const [values, setValues] = useState({ firstName: "", lastName: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = values.firstName.trim() && values.lastName.trim() && values.phone.trim();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/tirage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Erreur serveur");
      setSuccess(true);
    } catch {
      setError("Une erreur est survenue. Réessaie.");
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setValues({ firstName: "", lastName: "", phone: "" });
    setSuccess(false);
    setError(null);
  }

  return (
    <>
      <style>{`
        @keyframes stamp-in {
          0%   { transform: scale(2.5) rotate(-8deg); opacity: 0; }
          60%  { transform: scale(0.92) rotate(1.5deg); opacity: 1; }
          80%  { transform: scale(1.04) rotate(-0.5deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes slide-up {
          from { transform: translateY(20px); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .stamp-in  { animation: stamp-in 0.55s cubic-bezier(.22,.68,0,1.2) both; }
        .slide-up  { animation: slide-up 0.4s ease both; }
        .slide-up-2 { animation: slide-up 0.4s 0.1s ease both; }
        .slide-up-3 { animation: slide-up 0.4s 0.2s ease both; }
        .spin      { animation: spin 0.7s linear infinite; }

        .tirage-input {
          width: 100%;
          background: #111;
          color: #efefef;
          border: 2px solid #222;
          border-radius: 4px;
          padding: 18px 16px;
          font-family: 'Share Tech Mono', monospace;
          font-size: 18px;
          outline: none;
          transition: border-color 0.15s ease, background 0.15s ease;
          -webkit-text-size-adjust: none;
          text-size-adjust: none;
          box-sizing: border-box;
        }
        .tirage-input:focus {
          border-color: #DDFF00;
          background: #0d0d0d;
        }
        .tirage-input::placeholder {
          color: #484848;
        }
        .tirage-btn {
          width: 100%;
          background: #DDFF00;
          color: #080808;
          border: none;
          border-radius: 4px;
          height: 60px;
          font-family: 'Bebas Neue', cursive;
          font-size: 24px;
          letter-spacing: 0.08em;
          cursor: pointer;
          transition: transform 0.1s ease, opacity 0.15s ease;
          -webkit-tap-highlight-color: transparent;
        }
        .tirage-btn:active:not(:disabled) {
          transform: scale(0.97);
        }
        .tirage-btn:disabled {
          opacity: 0.35;
          cursor: default;
        }
        .reset-btn {
          background: transparent;
          color: #DDFF00;
          border: 2px solid #DDFF00;
          border-radius: 4px;
          height: 56px;
          font-family: 'Bebas Neue', cursive;
          font-size: 20px;
          letter-spacing: 0.08em;
          cursor: pointer;
          width: 100%;
          transition: background 0.15s ease;
          -webkit-tap-highlight-color: transparent;
        }
        .reset-btn:active {
          background: rgba(221,255,0,0.1);
        }
      `}</style>

      <div style={{
        minHeight: "100dvh",
        background: "#080808",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "env(safe-area-inset-top, 24px) 24px env(safe-area-inset-bottom, 24px)",
        boxSizing: "border-box",
      }}>
        {success ? (
          <div style={{ width: "100%", maxWidth: 400, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
            <div className="stamp-in" style={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              border: "4px solid #DDFF00",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 64,
              color: "#DDFF00",
              lineHeight: 1,
            }}>
              ✓
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <h2 className="slide-up" style={{
                fontFamily: "'Bebas Neue', cursive",
                fontSize: "clamp(40px, 12vw, 56px)",
                color: "#efefef",
                margin: 0,
                letterSpacing: "0.04em",
              }}>
                Tu es inscrit·e !
              </h2>
              <p className="slide-up-2" style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 18,
                color: "#484848",
                margin: 0,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}>
                Bonne chance pour le tirage&nbsp;🎟
              </p>
            </div>

            <button className="reset-btn slide-up-3" onClick={reset}>
              Inscrire une autre personne
            </button>
          </div>
        ) : (
          <div style={{ width: "100%", maxWidth: 400 }}>
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: 36 }}>
              <div style={{
                fontFamily: "'Bebas Neue', cursive",
                fontSize: "clamp(56px, 18vw, 80px)",
                color: "#DDFF00",
                lineHeight: 0.9,
                letterSpacing: "0.04em",
              }}>
                EKOTONE
              </div>
              <div style={{
                fontFamily: "'Bebas Neue', cursive",
                fontSize: "clamp(22px, 7vw, 30px)",
                color: "#efefef",
                letterSpacing: "0.12em",
                marginTop: 4,
              }}>
                TIRAGE AU SORT
              </div>
              <div style={{
                display: "inline-block",
                marginTop: 14,
                background: "#DDFF00",
                color: "#080808",
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                padding: "5px 14px",
                borderRadius: 100,
              }}>
                2 Pass à gagner
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {FIELDS.map(({ key, label, type, placeholder, autocomplete }) => (
                <div key={key} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <label style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#DDFF00",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                  }}>
                    {label}
                  </label>
                  <input
                    className="tirage-input"
                    type={type}
                    placeholder={placeholder}
                    autoComplete={autocomplete}
                    value={values[key]}
                    onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                  />
                </div>
              ))}

              {error && (
                <p style={{
                  fontFamily: "'Share Tech Mono', monospace",
                  fontSize: 14,
                  color: "#ff4d4d",
                  margin: 0,
                  textAlign: "center",
                }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="tirage-btn"
                disabled={!canSubmit || submitting}
                style={{ marginTop: 4 }}
              >
                {submitting ? (
                  <span style={{
                    display: "inline-block",
                    width: 22,
                    height: 22,
                    border: "3px solid #080808",
                    borderTopColor: "transparent",
                    borderRadius: "50%",
                  }} className="spin" />
                ) : (
                  "Ajouter au tirage au sort"
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  );
}
