export function MonoLogo() {
  return (
    <div className="inline-flex items-center gap-2.5" aria-hidden>
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="11" height="24" fill="currentColor" />
        <rect x="17" y="2" width="9" height="11" fill="currentColor" />
        <rect x="17" y="17" width="9" height="9" fill="currentColor" />
      </svg>
      <span className="text-[11px] font-medium uppercase tracking-[0.42em] text-black">Ikisha</span>
    </div>
  );
}
