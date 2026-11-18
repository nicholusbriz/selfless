'use client';

export default function SpinningGlobe({
  className = '',
  intensity = 1,
  showContinents = true,
}: {
  className?: string;
  intensity?: number;
  showContinents?: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={{ opacity: intensity }}
    >
      <style>{`
        @keyframes atbriz-globe-spin {
          from { transform: rotateY(0deg); }
          to { transform: rotateY(360deg); }
        }
        @keyframes atbriz-globe-float {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(0, -8px, 0); }
        }
        @keyframes atbriz-orbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes atbriz-orbit-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes atbriz-glow {
          0%, 100% { opacity: .48; }
          50% { opacity: .82; }
        }
        .atbriz-globe-spin {
          animation: atbriz-globe-spin 110s linear infinite;
          transform-style: preserve-3d;
        }
        .atbriz-globe-float { animation: atbriz-globe-float 12s ease-in-out infinite; }
        .atbriz-orbit { animation: atbriz-orbit 72s linear infinite; transform-origin: center; }
        .atbriz-orbit-reverse { animation: atbriz-orbit-reverse 96s linear infinite; transform-origin: center; }
        .atbriz-globe-glow { animation: atbriz-glow 9s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .atbriz-globe-spin, .atbriz-globe-float, .atbriz-orbit,
          .atbriz-orbit-reverse, .atbriz-globe-glow {
            animation: none !important;
          }
        }
      `}</style>

      {/* Ambient bronze light: deliberately restrained so dashboard text stays readable. */}
      <div className="absolute left-1/2 top-1/2 h-[min(88vw,88vh)] w-[min(88vw,88vh)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(185,138,62,0.17)_0%,rgba(117,80,31,0.08)_42%,transparent_72%)] blur-3xl" />

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="atbriz-globe-float relative aspect-square w-[min(82vw,82vh,740px)]">

          {/* Fine orbit inspired by the dotted circle in the organisation's logo. */}
          <svg
            viewBox="0 0 800 800"
            className="atbriz-orbit absolute -inset-[10%] h-[120%] w-[120%] overflow-visible"
            fill="none"
          >
            <circle cx="400" cy="400" r="350" stroke="#C99B51" strokeOpacity=".24" strokeWidth="1.5" />
            <circle cx="400" cy="400" r="350" stroke="#E8C58E" strokeOpacity=".58" strokeWidth="2" strokeDasharray="1 18" strokeLinecap="round" />
            <circle cx="400" cy="50" r="4" fill="#F1D49A" />
            <circle cx="750" cy="400" r="3" fill="#C99B51" />
            <circle cx="400" cy="750" r="5" fill="#E8C58E" />
            <circle cx="50" cy="400" r="3" fill="#C99B51" />
          </svg>

          {/* Secondary orbit: a few larger points echo the logo's gold particle clusters. */}
          <svg
            viewBox="0 0 800 800"
            className="atbriz-orbit-reverse absolute -inset-[6%] h-[112%] w-[112%] overflow-visible"
            fill="none"
          >
            <ellipse cx="400" cy="400" rx="365" ry="330" stroke="#D5AD6D" strokeOpacity=".15" strokeWidth="1" />
            <circle cx="400" cy="70" r="5" fill="#E8C58E" fillOpacity=".85" />
            <circle cx="724" cy="270" r="3.5" fill="#C18B42" />
            <circle cx="155" cy="650" r="4" fill="#E8C58E" fillOpacity=".8" />
            <circle cx="93" cy="310" r="2.5" fill="#C18B42" />
          </svg>

          {/* Soft atmosphere behind the sphere. */}
          <div className="atbriz-globe-glow absolute -inset-[5%] rounded-full bg-[radial-gradient(circle,rgba(232,197,142,0.22)_0%,rgba(185,138,62,0.10)_48%,transparent_73%)] blur-2xl" />

          {/* Bronze Earth surface. */}
          <div className="absolute inset-0 overflow-hidden rounded-full bg-[radial-gradient(circle_at_33%_25%,#927044_0%,#654A2B_27%,#3B2D1C_53%,#1C1913_78%,#0B0D12_100%)] shadow-[inset_-42px_-48px_110px_rgba(0,0,0,0.88),inset_22px_24px_68px_rgba(255,224,173,0.19),0_0_100px_rgba(185,138,62,0.19)]">

            {/* Subtle latitude and longitude lines. */}
            <svg viewBox="0 0 500 500" className="absolute inset-0 h-full w-full opacity-[0.25]" fill="none">
              <circle cx="250" cy="250" r="244" stroke="#E8C58E" strokeOpacity=".42" />
              <ellipse cx="250" cy="250" rx="244" ry="78" stroke="#E8C58E" strokeOpacity=".5" />
              <ellipse cx="250" cy="250" rx="244" ry="151" stroke="#E8C58E" strokeOpacity=".34" />
              <ellipse cx="250" cy="250" rx="91" ry="244" stroke="#E8C58E" strokeOpacity=".36" />
              <ellipse cx="250" cy="250" rx="166" ry="244" stroke="#E8C58E" strokeOpacity=".28" />
              <path d="M6 250H494M250 6V494" stroke="#E8C58E" strokeOpacity=".2" />
            </svg>

            {showContinents && (
              <div className="atbriz-globe-spin absolute inset-0">
                <svg
                  viewBox="0 0 500 500"
                  className="h-full w-full"
                  preserveAspectRatio="xMidYMid meet"
                  fill="none"
                >
                  <defs>
                    <linearGradient id="atbriz-muted-land" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#D6B77F" stopOpacity=".42" />
                      <stop offset="100%" stopColor="#9A713A" stopOpacity=".19" />
                    </linearGradient>
                    <linearGradient id="atbriz-africa-land" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#F4D9A4" stopOpacity=".98" />
                      <stop offset="48%" stopColor="#D5A65F" stopOpacity=".95" />
                      <stop offset="100%" stopColor="#A87532" stopOpacity=".86" />
                    </linearGradient>
                    <filter id="atbriz-land-glow" x="-35%" y="-35%" width="170%" height="170%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* Other landmasses stay subdued so Africa remains the visual anchor. */}
                  <g fill="url(#atbriz-muted-land)" stroke="#E7C58E" strokeOpacity=".2" strokeWidth="1.2">
                    <path d="M57 111 76 86 105 72 137 79 159 96 177 119 166 143 145 151 132 174 108 168 91 151 70 148Z" />
                    <path d="M133 183 153 178 168 195 166 222 153 246 145 272 132 300 120 281 117 252 106 226 114 201Z" />
                    <path d="M224 91 247 77 272 84 291 72 318 83 343 78 369 93 390 112 379 132 353 133 339 151 315 146 294 164 274 151 253 159 238 139 220 127Z" />
                    <path d="M363 269 388 259 414 270 426 291 410 313 382 317 359 300Z" />
                    <path d="M93 58 116 43 139 49 145 68 126 80 103 76Z" />
                  </g>

                  {/* Africa is larger, brighter and deliberately positioned near the front. */}
                  <g
                    fill="url(#atbriz-africa-land)"
                    stroke="#F6DDAE"
                    strokeOpacity=".72"
                    strokeWidth="1.5"
                    filter="url(#atbriz-land-glow)"
                  >
                    <path d="M224 160 244 145 267 148 283 161 302 166 313 185 307 205 298 220 293 244 280 270 269 296 253 327 239 349 224 337 216 311 202 285 193 258 187 229 194 201 207 181Z" />
                    <path d="M224 160 209 151 198 159 201 174 215 180Z" />
                    <path d="M283 162 299 151 315 157 321 170 308 181 294 178Z" />
                  </g>

                  {/* Madagascar and small nearby islands. */}
                  <path d="M316 287 323 300 320 319 314 328 310 313Z" fill="#D5A65F" fillOpacity=".72" />
                  <circle cx="181" cy="171" r="3" fill="#D5A65F" fillOpacity=".6" />
                  <circle cx="330" cy="210" r="2.5" fill="#D5A65F" fillOpacity=".55" />
                </svg>
              </div>
            )}

            {/* Top-left warm reflection. */}
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(ellipse_at_28%_18%,rgba(255,239,207,0.38)_0%,rgba(236,202,147,0.12)_23%,transparent_48%)] mix-blend-screen" />

            {/* Night-side shadow creates a rounded, dimensional sphere. */}
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(ellipse_at_77%_79%,rgba(0,0,0,0.82)_0%,rgba(0,0,0,0.36)_37%,transparent_69%)]" />

            {/* Restrained glass sheen and fine rim. */}
            <div className="absolute inset-0 rounded-full bg-[linear-gradient(132deg,rgba(255,245,224,0.10)_0%,transparent_25%,transparent_77%,rgba(0,0,0,0.18)_100%)]" />
            <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-[#E8C58E]/25" />
          </div>

          {/* Tiny golden particles orbiting the globe, inspired by the logo. */}
          <div className="absolute -inset-[3%] rounded-full">
            {[
              ['8%', '22%', '5px', '0.9'],
              ['17%', '9%', '3px', '0.75'],
              ['34%', '2%', '4px', '0.85'],
              ['72%', '7%', '3px', '0.7'],
              ['94%', '34%', '5px', '0.9'],
              ['91%', '72%', '3px', '0.75'],
              ['70%', '96%', '4px', '0.85'],
              ['29%', '94%', '3px', '0.7'],
              ['5%', '68%', '4px', '0.8'],
            ].map(([left, top, size, opacity], index) => (
              <span
                key={index}
                className="absolute rounded-full bg-[#E8C58E] shadow-[0_0_10px_rgba(232,197,142,0.75)]"
                style={{
                  left,
                  top,
                  width: size,
                  height: size,
                  opacity: Number(opacity),
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
