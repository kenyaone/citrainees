import { useMemo, useState } from 'react';

/**
 * Stylized Kenya map: a smoothed country outline + 47 county markers at
 * approximate positions. Coverage intensity comes from the alumni-per-county
 * counts. Not a survey-grade map — a data-viz.
 */

interface County {
    name: string;
    x: number;
    y: number;
}

const COUNTIES: County[] = [
    { name: 'Turkana', x: 105, y: 90 },
    { name: 'Marsabit', x: 235, y: 145 },
    { name: 'Mandera', x: 400, y: 90 },
    { name: 'Wajir', x: 340, y: 175 },
    { name: 'Samburu', x: 175, y: 200 },
    { name: 'Isiolo', x: 225, y: 240 },
    { name: 'Meru', x: 220, y: 260 },
    { name: 'Tharaka Nithi', x: 235, y: 278 },
    { name: 'Embu', x: 215, y: 290 },
    { name: 'Kitui', x: 245, y: 330 },
    { name: 'Machakos', x: 210, y: 335 },
    { name: 'Makueni', x: 225, y: 355 },
    { name: 'Kajiado', x: 180, y: 358 },
    { name: 'Narok', x: 135, y: 320 },
    { name: 'West Pokot', x: 95, y: 195 },
    { name: 'Trans-Nzoia', x: 90, y: 210 },
    { name: 'Uasin Gishu', x: 105, y: 235 },
    { name: 'Elgeyo Marakwet', x: 120, y: 225 },
    { name: 'Nandi', x: 95, y: 250 },
    { name: 'Baringo', x: 125, y: 235 },
    { name: 'Laikipia', x: 180, y: 245 },
    { name: 'Nyandarua', x: 160, y: 285 },
    { name: 'Nakuru', x: 140, y: 278 },
    { name: 'Kericho', x: 105, y: 283 },
    { name: 'Bomet', x: 105, y: 305 },
    { name: 'Nyeri', x: 185, y: 283 },
    { name: 'Kirinyaga', x: 205, y: 290 },
    { name: "Murang'a", x: 190, y: 300 },
    { name: 'Kiambu', x: 180, y: 322 },
    { name: 'Nairobi', x: 178, y: 335 },
    { name: 'Kakamega', x: 78, y: 248 },
    { name: 'Bungoma', x: 70, y: 232 },
    { name: 'Busia', x: 45, y: 240 },
    { name: 'Siaya', x: 55, y: 265 },
    { name: 'Kisumu', x: 78, y: 268 },
    { name: 'Vihiga', x: 75, y: 258 },
    { name: 'Homa Bay', x: 65, y: 290 },
    { name: 'Migori', x: 65, y: 315 },
    { name: 'Kisii', x: 80, y: 298 },
    { name: 'Nyamira', x: 85, y: 293 },
    { name: 'Mombasa', x: 325, y: 445 },
    { name: 'Kwale', x: 310, y: 460 },
    { name: 'Kilifi', x: 335, y: 420 },
    { name: 'Lamu', x: 385, y: 358 },
    { name: 'Tana River', x: 330, y: 335 },
    { name: 'Taita Taveta', x: 265, y: 415 },
    { name: 'Garissa', x: 320, y: 285 },
];

// Simplified country outline — traced from Kenya's silhouette
const KENYA_OUTLINE =
    'M 85 55 L 405 55 L 415 165 L 400 250 L 385 305 L 360 340 L 340 385 L 315 425 L 335 465 L 300 480 L 265 470 L 240 450 L 220 435 L 205 415 L 195 400 L 175 385 L 150 375 L 115 375 L 85 365 L 65 355 L 45 335 L 30 310 L 20 285 L 10 260 L 5 235 L 25 210 L 40 180 L 55 145 L 65 110 Z';

interface Props {
    coverage: Record<string, number>;
}

export default function KenyaCountyMap({ coverage }: Props) {
    const [hover, setHover] = useState<{ county: County; count: number } | null>(null);

    const max = useMemo(
        () => Math.max(1, ...Object.values(coverage)),
        [coverage],
    );
    const covered = useMemo(
        () => Object.keys(coverage).filter((c) => coverage[c] > 0).length,
        [coverage],
    );

    return (
        <div className="relative">
            <svg
                viewBox="0 0 440 500"
                className="w-full max-w-xl mx-auto"
                onMouseLeave={() => setHover(null)}
                role="img"
                aria-label="Kenya map with alumni coverage by county"
            >
                <defs>
                    <radialGradient id="mapGlow" cx="50%" cy="50%">
                        <stop offset="0%" stopColor="rgba(16,185,129,0.15)" />
                        <stop offset="100%" stopColor="rgba(16,185,129,0)" />
                    </radialGradient>
                    <filter id="dotGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                <rect x="0" y="0" width="440" height="500" fill="url(#mapGlow)" />

                <path
                    d={KENYA_OUTLINE}
                    fill="rgba(148, 163, 184, 0.04)"
                    stroke="rgba(148, 163, 184, 0.2)"
                    strokeWidth="1"
                    strokeDasharray="2 3"
                />

                {COUNTIES.map((c) => {
                    const count = coverage[c.name] ?? 0;
                    const intensity = count > 0 ? Math.max(0.35, count / max) : 0;
                    const radius = count > 0 ? 5 + Math.min(8, (count / max) * 8) : 3.5;
                    const isHover = hover?.county.name === c.name;

                    return (
                        <g key={c.name}>
                            {count > 0 && (
                                <circle
                                    cx={c.x}
                                    cy={c.y}
                                    r={radius * 1.8}
                                    fill={`rgba(16, 185, 129, ${intensity * 0.15})`}
                                />
                            )}
                            <circle
                                cx={c.x}
                                cy={c.y}
                                r={radius}
                                fill={
                                    count > 0
                                        ? `rgba(16, 185, 129, ${0.5 + intensity * 0.5})`
                                        : 'rgba(148, 163, 184, 0.25)'
                                }
                                stroke={
                                    count > 0
                                        ? 'rgba(16, 185, 129, 0.9)'
                                        : 'rgba(148, 163, 184, 0.5)'
                                }
                                strokeWidth={isHover ? 2 : 1}
                                filter={count > 0 && intensity > 0.7 ? 'url(#dotGlow)' : undefined}
                                onMouseEnter={() => setHover({ county: c, count })}
                                className="cursor-pointer transition-all"
                            />
                        </g>
                    );
                })}
            </svg>

            {hover && (
                <div className="absolute top-3 left-3 rounded-lg bg-slate-900 ring-1 ring-emerald-500/40 px-3 py-2 text-sm shadow-xl pointer-events-none">
                    <div className="font-semibold text-white">{hover.county.name}</div>
                    <div className="text-xs text-emerald-300">
                        {hover.count > 0
                            ? `${hover.count} alumni tracked`
                            : 'No alumni yet'}
                    </div>
                </div>
            )}

            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-white/50">
                <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-500/40 ring-1 ring-slate-400/50" />
                    Not yet covered
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70 ring-1 ring-emerald-400" />
                    Alumni tracked
                </div>
                <div className="text-white/60">
                    <span className="font-semibold text-white">{covered}</span>
                    <span className="text-white/40"> / 47 counties</span>
                </div>
            </div>
        </div>
    );
}
