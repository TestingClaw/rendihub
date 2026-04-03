export default function BrandLogo({ compact = false, className = 'h-10 w-10' }) {
  return (
    <div className={`flex items-center ${compact ? 'gap-2' : 'gap-3'}`}>
      <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="rendihubGradient" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
            <stop stopColor="#22D3EE" />
            <stop offset="1" stopColor="#2563EB" />
          </linearGradient>
        </defs>
        <rect x="6" y="6" width="52" height="52" rx="18" fill="url(#rendihubGradient)" />
        <path d="M20 40V23h10.5c6 0 9.5 3 9.5 8 0 5.2-3.7 9-10 9H20Zm7-5h3c2.6 0 4.1-1.5 4.1-4s-1.5-4-4.1-4h-3v8Z" fill="#F8FAFC" />
        <path d="M37 24h7v16h-7" stroke="#F8FAFC" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {!compact && (
        <div>
          <div className="text-lg font-semibold tracking-tight text-white">RendiHub</div>
          <div className="text-[11px] uppercase tracking-[0.25em] text-cyan-300">Rental marketplace</div>
        </div>
      )}
    </div>
  );
}
