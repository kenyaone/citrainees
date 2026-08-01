import { FormEvent, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowRight,
    Award,
    Briefcase,
    CheckCircle2,
    ClipboardCheck,
    FileCheck,
    MapPin,
    Search,
    ShieldCheck,
} from 'lucide-react';

interface Skill {
    id: number;
    name: string;
    category: string | null;
}
interface Cluster {
    id: number;
    name: string;
    region: string | null;
}
interface AlumniItem {
    id: number;
    first_name: string;
    last_name: string;
    county: string | null;
    form_four_year: number | null;
    verified_at: string | null;
    ci_project: {
        name: string;
        cluster: { name: string } | null;
    } | null;
    skills: Array<{ id: number; name: string; category: string | null }>;
}
interface Paginated<T> {
    data: T[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
    meta?: { total: number; from: number | null; to: number | null };
    total?: number;
    from?: number | null;
    to?: number | null;
}
interface Filters {
    q?: string;
    skill?: string;
    county?: string;
    ci_cluster_id?: number | string;
    year_from?: number | string;
    year_to?: number | string;
}
interface Props {
    alumni: Paginated<AlumniItem>;
    filters: Filters;
    skills: Skill[];
    clusters: Cluster[];
    counties: string[];
}

function verifiedIcon(via: string | undefined) {
    if (via === 'quiz') return <ClipboardCheck className="h-3 w-3" />;
    if (via === 'certificate') return <FileCheck className="h-3 w-3" />;
    if (via === 'employer') return <Briefcase className="h-3 w-3" />;
    return <CheckCircle2 className="h-3 w-3" />;
}

export default function DirectoryIndex({ alumni, filters, skills, clusters, counties }: Props) {
    const [form, setForm] = useState<Filters>({
        q: filters.q ?? '',
        skill: filters.skill ?? '',
        county: filters.county ?? '',
        ci_cluster_id: filters.ci_cluster_id ?? '',
        year_from: filters.year_from ?? '',
        year_to: filters.year_to ?? '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        const clean: Record<string, string> = {};
        Object.entries(form).forEach(([k, v]) => {
            if (v !== '' && v != null) clean[k] = String(v);
        });
        router.get('/directory', clean, { preserveState: true, preserveScroll: true });
    };

    const clear = () => {
        setForm({ q: '', skill: '', county: '', ci_cluster_id: '', year_from: '', year_to: '' });
        router.get('/directory');
    };

    const total = alumni.meta?.total ?? alumni.total ?? alumni.data.length;
    const from = alumni.meta?.from ?? alumni.from ?? null;
    const to = alumni.meta?.to ?? alumni.to ?? null;

    return (
        <>
            <Head title="Alumni directory — CI Trainees" />

            <div className="min-h-screen bg-slate-950 text-white">
                <nav className="mx-auto max-w-7xl px-6 py-5 flex items-center justify-between border-b border-white/5">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 grid place-items-center">
                            <ShieldCheck className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <div className="font-semibold tracking-tight">CI Trainees</div>
                            <div className="text-[10px] text-white/50 -mt-0.5 uppercase tracking-widest">
                                Alumni directory
                            </div>
                        </div>
                    </Link>
                    <Link href="/login" className="text-sm text-white/70 hover:text-white">
                        Sign in
                    </Link>
                </nav>

                <div className="mx-auto max-w-7xl px-6 py-10">
                    <div className="mb-8">
                        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
                            Browse verified alumni
                        </h1>
                        <p className="mt-2 text-white/60">
                            {total.toLocaleString()} CI Kenya alumni with at least one verified skill.
                            Every profile you see here has opted in to be discoverable by employers.
                        </p>
                    </div>

                    <form
                        onSubmit={submit}
                        className="rounded-2xl bg-white/[0.03] ring-1 ring-white/10 p-4 lg:p-5 mb-8"
                    >
                        <div className="grid md:grid-cols-6 gap-3">
                            <div className="md:col-span-2 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                                <input
                                    type="text"
                                    placeholder="Search name…"
                                    value={form.q}
                                    onChange={(e) => setForm({ ...form, q: e.target.value })}
                                    className="w-full rounded-lg bg-white/5 ring-1 ring-white/10 focus:ring-emerald-500/50 focus:outline-none pl-9 pr-3 py-2 text-sm placeholder-white/30"
                                />
                            </div>
                            <div>
                                <input
                                    type="text"
                                    list="skill-suggestions"
                                    placeholder="Skill (type or pick)"
                                    value={form.skill}
                                    onChange={(e) => setForm({ ...form, skill: e.target.value })}
                                    className="w-full rounded-lg bg-white/5 ring-1 ring-white/10 focus:ring-emerald-500/50 focus:outline-none px-3 py-2 text-sm placeholder-white/30"
                                />
                                <datalist id="skill-suggestions">
                                    {skills.map((s) => (
                                        <option key={s.id} value={s.name} />
                                    ))}
                                </datalist>
                            </div>
                            <select
                                value={form.county}
                                onChange={(e) => setForm({ ...form, county: e.target.value })}
                                className="w-full rounded-lg bg-white/5 ring-1 ring-white/10 focus:ring-emerald-500/50 focus:outline-none px-3 py-2 text-sm"
                            >
                                <option value="">Any county</option>
                                {counties.map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={form.ci_cluster_id}
                                onChange={(e) => setForm({ ...form, ci_cluster_id: e.target.value })}
                                className="w-full rounded-lg bg-white/5 ring-1 ring-white/10 focus:ring-emerald-500/50 focus:outline-none px-3 py-2 text-sm"
                            >
                                <option value="">Any cluster</option>
                                {clusters.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="number"
                                    placeholder="From year"
                                    min={1990}
                                    max={new Date().getFullYear()}
                                    value={form.year_from}
                                    onChange={(e) => setForm({ ...form, year_from: e.target.value })}
                                    className="w-full rounded-lg bg-white/5 ring-1 ring-white/10 focus:ring-emerald-500/50 focus:outline-none px-2 py-2 text-sm placeholder-white/30"
                                />
                                <input
                                    type="number"
                                    placeholder="To year"
                                    min={1990}
                                    max={new Date().getFullYear()}
                                    value={form.year_to}
                                    onChange={(e) => setForm({ ...form, year_to: e.target.value })}
                                    className="w-full rounded-lg bg-white/5 ring-1 ring-white/10 focus:ring-emerald-500/50 focus:outline-none px-2 py-2 text-sm placeholder-white/30"
                                />
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-3 mt-3">
                            <button
                                type="button"
                                onClick={clear}
                                className="text-xs text-white/50 hover:text-white"
                            >
                                Clear filters
                            </button>
                            <button
                                type="submit"
                                className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 text-sm font-semibold"
                            >
                                <Search className="h-4 w-4" />
                                Search
                            </button>
                        </div>
                    </form>

                    {alumni.data.length === 0 ? (
                        <div className="rounded-2xl bg-white/[0.03] ring-1 ring-white/10 p-12 text-center">
                            <p className="text-white/70 text-lg">No alumni match those filters yet.</p>
                            <p className="text-sm text-white/40 mt-2">
                                Try broadening your search — fewer filters usually help.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="text-sm text-white/50 mb-3">
                                Showing {from ?? 0}–{to ?? 0} of {total.toLocaleString()}
                            </div>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {alumni.data.map((a) => (
                                    <Link
                                        key={a.id}
                                        href={`/directory/${a.id}`}
                                        className="block rounded-2xl bg-white/[0.03] ring-1 ring-white/10 hover:ring-emerald-500/40 p-5 transition"
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="h-11 w-11 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-700 grid place-items-center text-white font-semibold">
                                                {(a.first_name?.[0] ?? '') + (a.last_name?.[0] ?? '')}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-semibold truncate">
                                                    {a.first_name} {a.last_name}
                                                </div>
                                                <div className="text-xs text-white/50 truncate">
                                                    {a.ci_project?.name ?? '—'}
                                                </div>
                                            </div>
                                            {a.verified_at && (
                                                <Award className="h-4 w-4 text-emerald-400 ml-auto flex-shrink-0" />
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-1.5 mb-3">
                                            {a.skills.slice(0, 4).map((s) => (
                                                <span
                                                    key={s.id}
                                                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/20"
                                                >
                                                    {verifiedIcon(undefined)}
                                                    {s.name}
                                                </span>
                                            ))}
                                            {a.skills.length > 4 && (
                                                <span className="text-[11px] text-white/40 px-1 py-0.5">
                                                    +{a.skills.length - 4} more
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-white/50">
                                            <span className="flex items-center gap-1">
                                                <MapPin className="h-3 w-3" />
                                                {a.county ?? '—'}
                                            </span>
                                            {a.form_four_year && <span>Form 4 · {a.form_four_year}</span>}
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            {alumni.links.length > 3 && (
                                <div className="mt-8 flex flex-wrap items-center justify-center gap-1 text-sm">
                                    {alumni.links.map((link, i) => (
                                        <button
                                            key={i}
                                            disabled={!link.url}
                                            onClick={() => link.url && router.get(link.url, {}, { preserveScroll: true })}
                                            className={`min-w-[36px] px-3 py-2 rounded-md ${
                                                link.active
                                                    ? 'bg-emerald-500 text-slate-950 font-semibold'
                                                    : link.url
                                                      ? 'bg-white/5 hover:bg-white/10 text-white/70'
                                                      : 'text-white/30 cursor-not-allowed'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
