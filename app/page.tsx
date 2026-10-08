import VirtualGameBoy from "../components/VirtualGameBoy";

export default function Home() {
  return (
    <main className="page-shell">
      <header className="page-header">
        <span className="header-kicker"><i /> ROUND 01 · KUALA LUMPUR</span>
        <h1>POCKET <span>GRAND PRIX</span></h1>
        <p>A little late-nineties racing, on the Sepang International Circuit.</p>
      </header>
      <VirtualGameBoy />
      <footer className="page-footer">ORIGINAL PIXEL ART · BUILT FOR THE OPEN ROAD · 1996–2026</footer>
    </main>
  );
}
