export default function SpinningGlobe({
  className = '',
}: {
  className?: string;
}) {
  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`}>
      <style>{`
        @keyframes globeSpin {
          from { transform: rotateY(0deg); }
          to { transform: rotateY(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .globe-ring { animation: none !important; }
        }
      `}</style>

      {/* Sphere — deep ocean gradient with soft limb darkening */}
      <div className="absolute inset-[10%] rounded-full bg-[radial-gradient(circle_at_32%_28%,#3b5f8a,#1c3050_42%,#0d1a2e_72%,#060b16)] shadow-[inset_-18px_-22px_55px_rgba(0,0,0,0.65),inset_10px_12px_35px_rgba(140,180,230,0.12),0_0_70px_rgba(90,140,200,0.18)]" />

      {/* Latitude lines — hairline, low contrast */}
      <div className="absolute inset-[10%] overflow-hidden rounded-full">
        {[16, 34, 50, 66, 84].map((top) => (
          <div
            key={top}
            className="absolute left-0 right-0 border-t border-slate-300/[0.13]"
            style={{ top: `${top}%` }}
          />
        ))}
      </div>

      {/* Spinning meridian rings — thin metallic strokes */}
      <div className="absolute inset-[10%]" style={{ perspective: '700px' }}>
        {[
          { tilt: 64, duration: '26s', reverse: false, dot: true },
          { tilt: 74, duration: '34s', reverse: true, dot: false },
          { tilt: 82, duration: '42s', reverse: false, dot: true },
        ].map((ring, i) => (
          <div
            key={i}
            className="absolute inset-0"
            style={{
              transform: `rotateX(${ring.tilt}deg)`,
              transformStyle: 'preserve-3d',
            }}
          >
            <div
              className="globe-ring h-full w-full rounded-full border border-[#C9A24B]/30"
              style={{
                animation: `globeSpin ${ring.duration} linear infinite${
                  ring.reverse ? ' reverse' : ''
                }`,
              }}
            />
            {ring.dot && (
              <span className="absolute left-1/2 top-0 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#E6C779] shadow-[0_0_6px_rgba(230,199,121,0.7)]" />
            )}
          </div>
        ))}
      </div>

      {/* Outer orbit — faint dashed ring, gold satellite */}
      <div
        className="absolute inset-[4%]"
        style={{ transform: 'rotateX(78deg)', transformStyle: 'preserve-3d' }}
      >
        <div
          className="globe-ring h-full w-full rounded-full border border-dashed border-[#C9A24B]/20"
          style={{ animation: 'globeSpin 48s linear infinite reverse' }}
        />
        <span className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#E6C779] opacity-80 shadow-[0_0_8px_rgba(230,199,121,0.6)]" />
      </div>

      {/* Ambient sheen */}
      <div className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_45%,rgba(200,220,255,0.07),transparent_62%)]" />
    </div>
  );
}
