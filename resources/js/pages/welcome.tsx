import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Award,
    Briefcase,
    Building2,
    CheckCircle2,
    ClipboardCheck,
    FileCheck,
    GraduationCap,
    LineChart,
    Search,
    ShieldCheck,
    Sparkles,
    Users,
} from 'lucide-react';
import { dashboard, login } from '@/routes';

interface Props {
    stats: {
        alumni_count: number;
        verified_skill_count: number;
        employer_confirmations: number;
        projects_count: number;
        clusters_count: number;
        skills_catalog_count: number;
    };
}

function StatBlock({ value, label }: { value: number; label: string }) {
    return (
        <div>
            <div className="text-4xl md:text-5xl font-semibold tracking-tight text-white tabular-nums">
                {value.toLocaleString()}
            </div>
            <div className="mt-1 text-xs md:text-sm text-emerald-200/70 uppercase tracking-wider">
                {label}
            </div>
        </div>
    );
}

function VerifiedChip({ children, glow = false }: { children: React.ReactNode; glow?: boolean }) {
    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30 ${
                glow ? 'shadow-[0_0_20px_rgba(16,185,129,0.35)]' : ''
            }`}
        >
            <CheckCircle2 className="h-3 w-3" />
            {children}
        </span>
    );
}

function AlumniCard({
    name,
    project,
    verifiedSkills,
    method,
    tilt,
}: {
    name: string;
    project: string;
    verifiedSkills: string[];
    method: string;
    tilt: string;
}) {
    return (
        <div
            className={`w-72 rounded-2xl bg-white/5 backdrop-blur-md ring-1 ring-white/10 p-5 shadow-2xl ${tilt}`}
        >
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-700 grid place-items-center text-white font-semibold">
                    {name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1">
                    <div className="text-sm font-semibold text-white">{name}</div>
                    <div className="text-xs text-white/60">{project}</div>
                </div>
                <VerifiedChip>Verified</VerifiedChip>
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5">
                {verifiedSkills.map((s) => (
                    <VerifiedChip key={s}>{s}</VerifiedChip>
                ))}
            </div>
            <div className="mt-3 text-[11px] text-white/40 uppercase tracking-wider">
                Verified via {method}
            </div>
        </div>
    );
}

export default function Welcome({ stats }: Props) {
    const { auth } = usePage<{ auth: { user: { role?: string } | null } }>().props;

    return (
        <>
            <Head title="CI Trainees — Alumni tracer for Compassion International Kenya" />

            <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
                <nav className="relative z-20 mx-auto max-w-7xl px-6 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 grid place-items-center">
                            <ShieldCheck className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <div className="font-semibold tracking-tight">CI Trainees</div>
                            <div className="text-[10px] text-white/50 -mt-0.5 uppercase tracking-widest">
                                Compassion International Kenya
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {auth?.user ? (
                            <Link
                                href={dashboard()}
                                className="rounded-lg bg-white text-slate-900 px-4 py-2 text-sm font-medium hover:bg-white/90"
                            >
                                Open dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href="#for-employers"
                                    className="hidden sm:inline text-sm text-white/70 hover:text-white"
                                >
                                    For employers
                                </Link>
                                <Link
                                    href={login()}
                                    className="rounded-lg bg-white text-slate-900 px-4 py-2 text-sm font-medium hover:bg-white/90"
                                >
                                    Sign in
                                </Link>
                            </>
                        )}
                    </div>
                </nav>

                <section className="relative isolate overflow-hidden">
                    <div className="absolute inset-0 -z-10">
                        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950 to-emerald-950/40" />
                        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-emerald-500/20 blur-3xl" />
                        <div className="absolute top-40 -left-40 h-[400px] w-[400px] rounded-full bg-amber-500/10 blur-3xl" />
                    </div>

                    <div className="mx-auto max-w-7xl px-6 pt-16 pb-24 lg:pt-24 lg:pb-32 grid lg:grid-cols-12 gap-12 lg:gap-6 items-center">
                        <div className="lg:col-span-7">
                            <div className="inline-flex items-center gap-2 rounded-full bg-white/5 ring-1 ring-white/10 px-3 py-1 text-xs text-white/70 mb-6">
                                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                                Alumni tracer — from Form Four to their first job
                            </div>
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05]">
                                Every CI Kenya alumnus.
                                <br />
                                <span className="bg-gradient-to-r from-emerald-300 via-emerald-400 to-amber-300 bg-clip-text text-transparent">
                                    Every verified skill.
                                </span>
                                <br />
                                One trusted platform.
                            </h1>
                            <p className="mt-6 text-lg text-white/70 max-w-xl leading-relaxed">
                                CI Trainees connects Compassion International Kenya alumni with employers
                                who can trust what they see. Every skill is backed by an assessment, a
                                certificate, or a past employer&apos;s confirmation — not just a claim on
                                a CV.
                            </p>

                            <div className="mt-8 flex flex-wrap gap-3">
                                <Link
                                    href={login()}
                                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-6 py-3.5 text-sm font-semibold shadow-lg shadow-emerald-500/20 transition"
                                >
                                    I&apos;m an alumnus
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                                <Link
                                    href="#for-employers"
                                    className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 ring-1 ring-white/20 px-6 py-3.5 text-sm font-semibold transition"
                                >
                                    <Search className="h-4 w-4" />
                                    Find alumni to hire
                                </Link>
                                <Link
                                    href={login()}
                                    className="inline-flex items-center gap-2 text-white/60 hover:text-white px-2 py-3.5 text-sm font-medium transition"
                                >
                                    CI staff dashboard →
                                </Link>
                            </div>

                            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-white/50">
                                <div className="flex items-center gap-2">
                                    <ClipboardCheck className="h-4 w-4 text-emerald-400" />
                                    Quiz-verified
                                </div>
                                <div className="flex items-center gap-2">
                                    <FileCheck className="h-4 w-4 text-emerald-400" />
                                    Certificate-verified
                                </div>
                                <div className="flex items-center gap-2">
                                    <Briefcase className="h-4 w-4 text-emerald-400" />
                                    Employer-confirmed
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-5 relative h-[420px] lg:h-[520px]">
                            <div className="absolute top-0 right-0 lg:right-8">
                                <AlumniCard
                                    name="Wanjiru Kamau"
                                    project="Nakuru East"
                                    verifiedSkills={['Digital Marketing', 'Web Design']}
                                    method="Quiz + Certificate"
                                    tilt="rotate-2"
                                />
                            </div>
                            <div className="absolute top-44 left-0 lg:left-4">
                                <AlumniCard
                                    name="John Otieno"
                                    project="Kisumu Central"
                                    verifiedSkills={['Welding', 'Fabrication']}
                                    method="Employer confirmation"
                                    tilt="-rotate-3"
                                />
                            </div>
                            <div className="absolute bottom-0 right-4 lg:right-16">
                                <AlumniCard
                                    name="Aisha Hassan"
                                    project="Mombasa Kisauni"
                                    verifiedSkills={['Nursing', 'Community Health']}
                                    method="Certificate"
                                    tilt="rotate-1"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <section className="relative border-y border-white/5 bg-slate-950/60 backdrop-blur">
                    <div className="mx-auto max-w-7xl px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
                        <StatBlock value={stats.alumni_count} label="Alumni tracked" />
                        <StatBlock value={stats.verified_skill_count} label="Skills verified" />
                        <StatBlock value={stats.employer_confirmations} label="Employer confirmations" />
                        <StatBlock value={stats.projects_count} label="CI project centres" />
                    </div>
                    <div className="mx-auto max-w-7xl px-6 pb-6 text-xs text-white/40 text-center">
                        Numbers grow as CI Kenya onboards alumni and employers verify placements. Live data.
                    </div>
                </section>

                <section className="relative py-24">
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="max-w-2xl">
                            <div className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-3">
                                How verification works
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
                                Three paths to the same green checkmark.
                            </h2>
                            <p className="mt-4 text-white/60">
                                A CV claim is easy to make. A verified skill isn&apos;t. Every skill on an
                                alumnus&apos;s profile shows employers <em>how</em> it was verified — so
                                they can weigh what they&apos;re seeing.
                            </p>
                        </div>

                        <div className="mt-14 grid md:grid-cols-3 gap-6">
                            <div className="rounded-2xl bg-white/[0.03] ring-1 ring-white/10 p-6 hover:ring-emerald-500/40 transition">
                                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/20 grid place-items-center mb-4">
                                    <ClipboardCheck className="h-6 w-6 text-emerald-400" />
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className="font-semibold text-lg">Assessment</h3>
                                    <VerifiedChip>quiz</VerifiedChip>
                                </div>
                                <p className="text-sm text-white/60 leading-relaxed">
                                    Timed multiple-choice tests for knowledge skills. Score &ge; 70% earns
                                    the verified badge. One attempt per week — no brute-forcing.
                                </p>
                                <div className="mt-4 text-xs text-white/40">
                                    Digital Marketing · Accounting · Web Design · English · +more
                                </div>
                            </div>

                            <div className="rounded-2xl bg-white/[0.03] ring-1 ring-white/10 p-6 hover:ring-emerald-500/40 transition">
                                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/20 grid place-items-center mb-4">
                                    <FileCheck className="h-6 w-6 text-emerald-400" />
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className="font-semibold text-lg">Certificate</h3>
                                    <VerifiedChip>certificate</VerifiedChip>
                                </div>
                                <p className="text-sm text-white/60 leading-relaxed">
                                    Upload a training certificate, licence, or qualification. CI Kenya
                                    staff review it against the issuer&apos;s records before verification.
                                </p>
                                <div className="mt-4 text-xs text-white/40">
                                    Welding · Nursing · Plumbing · Driving · Cosmetology · +more
                                </div>
                            </div>

                            <div className="rounded-2xl bg-white/[0.03] ring-1 ring-white/10 p-6 hover:ring-emerald-500/40 transition">
                                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/20 grid place-items-center mb-4">
                                    <Briefcase className="h-6 w-6 text-emerald-400" />
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className="font-semibold text-lg">Employer confirmed</h3>
                                    <VerifiedChip glow>employer</VerifiedChip>
                                </div>
                                <p className="text-sm text-white/60 leading-relaxed">
                                    A past employer clicks a one-shot link and confirms the alumnus
                                    worked with them. The strongest signal on the platform — a real
                                    person, at a real company, saying yes.
                                </p>
                                <div className="mt-4 text-xs text-white/40">
                                    Any skill, any role — attested on the job
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="for-employers" className="relative py-24 bg-gradient-to-b from-slate-950 to-emerald-950/30">
                    <div className="mx-auto max-w-7xl px-6 grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="text-xs font-semibold uppercase tracking-widest text-amber-300 mb-3">
                                For employers
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
                                Hire from a talent pool <br />you can actually trust.
                            </h2>
                            <p className="mt-4 text-white/60 leading-relaxed">
                                Compassion International Kenya has sponsored thousands of young people
                                through Form Four and into TVET, university, and vocational training.
                                Now the ones ready to work are searchable — with verified skills,
                                real employment history, and one-click ways to reach them.
                            </p>

                            <ul className="mt-8 space-y-3">
                                {[
                                    'Filter by skill, county, cluster, or Form 4 cohort',
                                    'See only alumni who opted in to the public directory',
                                    'Contact through the platform — never a raw phone or email leak',
                                    'Every skill badge tells you how it was verified',
                                ].map((line) => (
                                    <li key={line} className="flex items-start gap-3 text-white/80">
                                        <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                                        <span>{line}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-8 rounded-xl bg-amber-500/10 ring-1 ring-amber-500/20 p-4 text-sm text-amber-100/90">
                                <strong className="text-amber-200">Coming soon:</strong> employer accounts
                                with saved talent searches and weekly digest emails. Meanwhile, browse
                                the public directory once alumni start opting in.
                            </div>
                        </div>

                        <div className="rounded-2xl bg-slate-900/80 ring-1 ring-white/10 p-6 shadow-2xl">
                            <div className="flex items-center justify-between mb-4">
                                <div className="text-sm font-semibold flex items-center gap-2">
                                    <Search className="h-4 w-4 text-emerald-400" />
                                    Find alumni
                                </div>
                                <VerifiedChip>Verified only</VerifiedChip>
                            </div>
                            <div className="space-y-3">
                                <div className="rounded-lg bg-white/5 ring-1 ring-white/10 px-3 py-2 text-sm text-white/60">
                                    <span className="text-white/40">Skill:</span> Digital Marketing
                                </div>
                                <div className="rounded-lg bg-white/5 ring-1 ring-white/10 px-3 py-2 text-sm text-white/60">
                                    <span className="text-white/40">County:</span> Nakuru
                                </div>
                                <div className="rounded-lg bg-white/5 ring-1 ring-white/10 px-3 py-2 text-sm text-white/60">
                                    <span className="text-white/40">Form 4 year:</span> 2018 – 2022
                                </div>
                            </div>
                            <div className="mt-6 border-t border-white/10 pt-4 space-y-3">
                                {[
                                    { name: 'Wanjiru K.', role: 'Content · Nakuru', badges: 2 },
                                    { name: 'David M.', role: 'SEO · Nakuru', badges: 3 },
                                    { name: 'Grace N.', role: 'Social · Nakuru', badges: 1 },
                                ].map((r) => (
                                    <div
                                        key={r.name}
                                        className="flex items-center justify-between text-sm"
                                    >
                                        <div>
                                            <div className="font-medium">{r.name}</div>
                                            <div className="text-xs text-white/50">{r.role}</div>
                                        </div>
                                        <div className="flex items-center gap-1 text-emerald-400 text-xs">
                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                            {r.badges} verified
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-24">
                    <div className="mx-auto max-w-7xl px-6 grid lg:grid-cols-2 gap-12 items-center">
                        <div className="order-2 lg:order-1 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-slate-900 to-slate-900 ring-1 ring-emerald-500/20 p-8 shadow-2xl">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-700 grid place-items-center">
                                    <GraduationCap className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <div className="font-semibold">Habari, Wanjiru</div>
                                    <div className="text-xs text-white/50">
                                        Nakuru East · Form 4 2018
                                    </div>
                                </div>
                                <div className="ml-auto text-xs text-emerald-300 flex items-center gap-1">
                                    <Award className="h-3.5 w-3.5" />
                                    Profile 85%
                                </div>
                            </div>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center justify-between rounded-lg bg-white/5 ring-1 ring-white/10 p-3">
                                    <span>Digital Marketing</span>
                                    <VerifiedChip>Verified via quiz</VerifiedChip>
                                </div>
                                <div className="flex items-center justify-between rounded-lg bg-white/5 ring-1 ring-white/10 p-3">
                                    <span>Web Design</span>
                                    <VerifiedChip>Verified via certificate</VerifiedChip>
                                </div>
                                <div className="flex items-center justify-between rounded-lg bg-white/5 ring-1 ring-white/10 p-3">
                                    <span>Sales</span>
                                    <VerifiedChip glow>Verified by employer</VerifiedChip>
                                </div>
                                <div className="flex items-center justify-between rounded-lg bg-white/5 ring-1 ring-dashed ring-white/10 p-3 text-white/60">
                                    <span>Photography</span>
                                    <span className="text-xs">Not verified</span>
                                </div>
                            </div>
                        </div>

                        <div className="order-1 lg:order-2">
                            <div className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-3">
                                For alumni
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
                                Show employers what you can actually do.
                            </h2>
                            <p className="mt-4 text-white/60 leading-relaxed">
                                CI Kenya spent years walking with you through school. This platform is
                                the bridge from there to what&apos;s next. Set up your profile once,
                                verify the skills you have, and let employers find you.
                            </p>

                            <ul className="mt-8 space-y-3">
                                {[
                                    'Take an assessment or upload a certificate — verify your skills for free',
                                    'Ask past employers to confirm the work you did — one WhatsApp link',
                                    'Control who sees what — every field is opt-in',
                                    'Get contacted by real employers, through the platform',
                                ].map((line) => (
                                    <li key={line} className="flex items-start gap-3 text-white/80">
                                        <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                                        <span>{line}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-8">
                                <Link
                                    href={login()}
                                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-6 py-3 text-sm font-semibold shadow-lg shadow-emerald-500/20"
                                >
                                    Sign in to my profile
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                                <span className="ml-4 text-sm text-white/50">
                                    Don&apos;t have a login? Ask your CI project office for an invite link.
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-24 bg-slate-950/50 border-t border-white/5">
                    <div className="mx-auto max-w-5xl px-6 text-center">
                        <div className="text-xs font-semibold uppercase tracking-widest text-amber-300 mb-3">
                            For CI Kenya staff
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
                            One place for M&amp;E, outcomes, and donor reports.
                        </h2>
                        <p className="mt-4 text-white/60 max-w-2xl mx-auto">
                            Track every alumnus across every cluster and project. Employment
                            outcomes update as employers confirm placements. Bulk-import from your
                            existing spreadsheets. Generate donor-ready reports on demand.
                        </p>

                        <div className="mt-12 grid sm:grid-cols-4 gap-4">
                            {[
                                { icon: Users, label: 'Alumni CRUD + CSV import' },
                                { icon: Building2, label: 'Clusters & projects' },
                                { icon: ShieldCheck, label: 'Verification queue' },
                                { icon: LineChart, label: 'Outcomes dashboard' },
                            ].map((f) => (
                                <div
                                    key={f.label}
                                    className="rounded-xl bg-white/[0.03] ring-1 ring-white/10 p-4"
                                >
                                    <f.icon className="h-5 w-5 text-emerald-400 mx-auto mb-2" />
                                    <div className="text-xs text-white/70">{f.label}</div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-10">
                            <Link
                                href={login()}
                                className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 ring-1 ring-white/20 px-6 py-3 text-sm font-semibold"
                            >
                                Staff sign in
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </section>

                <footer className="border-t border-white/5 py-10 text-sm text-white/40">
                    <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded bg-gradient-to-br from-emerald-500 to-emerald-700 grid place-items-center">
                                <ShieldCheck className="h-3.5 w-3.5 text-white" />
                            </div>
                            <span>
                                CI Trainees · Alumni tracer for Compassion International Kenya
                            </span>
                        </div>
                        <div className="flex items-center gap-6">
                            <a
                                href="https://ariseci.org"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-white"
                            >
                                AriseCI
                            </a>
                            <a
                                href="https://github.com/kenyaone/citrainees"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-white"
                            >
                                Source on GitHub
                            </a>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
