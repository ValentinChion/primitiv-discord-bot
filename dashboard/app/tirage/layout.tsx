import { TirageNav } from "./tirage-nav";

export default function TirageLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div style={{ minHeight: "100dvh", background: "#080808", paddingBottom: "calc(65px + env(safe-area-inset-bottom, 0px))" }}>
        {children}
      </div>
      <TirageNav />
    </>
  );
}
