# Plan: Bottom Navigation Bar

## Context

The schedule page needs a fixed bottom navigation bar — the standard mobile navigation pattern. Only one item exists for now ("Programme"), but the structure is designed to accommodate future items. The existing top tab navigation (En ce moment / day tabs) stays untouched as sub-navigation within the schedule section.

## File

`dashboard/app/schedule/page.tsx` only.

## Changes

### 1. Add padding-bottom to the content wrapper

The content needs room for the fixed bar. Update `<div className="relative z-[1]">`:

```tsx
<div className="relative z-[1] pb-[4.5rem]">
```

### 2. Add the fixed bottom bar

Just before closing the outer `<div className="min-h-svh ...">`, insert:

```tsx
{/* Bottom Nav */}
<nav
  aria-label="Navigation principale"
  className="fixed bottom-0 inset-x-0 z-50 bg-sch-bg border-t border-sch-border flex items-stretch h-[4.5rem]"
  style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
>
  <button
    aria-current="page"
    className="flex flex-1 flex-col items-center justify-center gap-1 font-mono-share text-[0.55rem] tracking-[0.2em] uppercase text-acid cursor-pointer bg-transparent"
  >
    <svg
      aria-hidden="true"
      width="20" height="20" viewBox="0 0 20 20" fill="none"
      className="text-acid"
    >
      <rect x="2" y="4" width="16" height="13" rx="1.5"
            stroke="currentColor" strokeWidth="1.5"/>
      <path d="M2 8h16" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M6 2v4M14 2v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
    Programme
  </button>
</nav>
```

**Notes:**
- `h-[4.5rem]` — comfortable touch height
- `style={{ paddingBottom: "env(safe-area-inset-bottom)" }}` — handles iPhone home indicator
- Single item is always active (`aria-current="page"`, acid color)

## Verification

1. `npm run typecheck` — zero errors
2. Bar is visible at the bottom on a mobile viewport (DevTools)
3. Content does not scroll behind the bar
4. "Programme" item displays in acid color
5. Bar stays fixed on scroll
