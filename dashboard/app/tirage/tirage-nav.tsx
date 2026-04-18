"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function ListIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

function AddPersonIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" y1="8" x2="19" y2="14" />
      <line x1="22" y1="11" x2="16" y2="11" />
    </svg>
  );
}

const TABS = [
  { href: "/tirage", label: "Liste", Icon: ListIcon, exact: true },
  { href: "/tirage/add-participant", label: "Inscription", Icon: AddPersonIcon, exact: false },
];

export function TirageNav() {
  const pathname = usePathname();

  return (
    <>
      <style>{`
        .tirage-bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 50;
          display: flex;
          background: rgba(8, 8, 8, 0.92);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-top: 1px solid #1e1e1e;
          padding-bottom: env(safe-area-inset-bottom, 0px);
        }
        .tirage-tab {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          padding: 10px 0 12px;
          text-decoration: none;
          color: #555;
          transition: color 0.15s ease;
          -webkit-tap-highlight-color: transparent;
          position: relative;
        }
        .tirage-tab.active {
          color: #DDFF00;
        }
        .tirage-tab:not(.active):active {
          color: #888;
        }
        .tirage-tab-label {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          line-height: 1;
        }
        .tirage-tab.active::before {
          content: '';
          position: absolute;
          top: 0;
          left: 20%;
          right: 20%;
          height: 2px;
          background: #DDFF00;
          border-radius: 0 0 2px 2px;
        }
      `}</style>
      <nav className="tirage-bottom-nav">
        {TABS.map(({ href, label, Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link key={href} href={href} className={`tirage-tab${active ? " active" : ""}`}>
              <Icon active={active} />
              <span className="tirage-tab-label">{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
