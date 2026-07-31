import { FormEvent, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Briefcase,
    CheckCircle2,
    ClipboardCheck,
    FileCheck,
    GraduationCap,
    Search,
    ShieldCheck,
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

type FlashProps = {
    employer_lead_success?: boolean;
    invite_request_success?: boolean;
};

function EmployerCard({ success }: { success: boolean }) {
    const [values, setValues] = useState({ email: '', organisation: '', hiring_for: '' });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        router.post('/employer-leads', values, {
            preserveScroll: true,
            onError: (errs) => setErrors(errs as Record<string, string>),
            onSuccess: () => setValues({ email: '', organisation: '', hiring_for: '' }),
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <div className="flex flex-col rounded-2xl bg-white/[0.04] ring-1 ring-white/10 p-6 lg:p-7 hover:ring-emerald-500/40 transition h-full">
            <div className="flex items-center gap-3 mb-4">
                <div className="h-11 w-11 rounded-xl bg-amber-500/10 ring-1 ring-amber-500/30 grid place-items-center">
                    <Search className="h-5 w-5 text-amber-300" />
                </div>
                <div>
                    <div className="text-[11px] font-semibold uppercase tracking-widest text-amber-300">Employers</div>
                    <h3 className="text-lg font-semibold">Find alumni to hire</h3>
                </div>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">
                A searchable directory of CI Kenya alumni with verified skills is launching soon. Leave your email and we&apos;ll invite you the day it opens.
            </p>

            {success ? (
                <div className="mt-5 rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/30 p-4 text-sm text-emerald-100 flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>Thanks — you&apos;re on the list. We&apos;ll be in touch.</span>
                </div>
            ) : (
                <form onSubmit={submit} className="mt-5 space-y-3">
                    <input
                        type="email"
                        required
                        placeholder="Work email"
                        value={values.email}
                        onChange={(e) => setValues({ ...values, email: e.target.value })}
                        className="w-full rounded-lg bg-white/5 ring-1 ring-white/10 focus:ring-emerald-500/50 focus:outline-none px-3 py-2.5 text-sm placeholder-white/30"
                    />
                    {errors.email && <p className="text-xs text-red-300">{errors.email}</p>}
                    <input
                        type="text"
                        placeholder="Organisation (optional)"
                        value={values.organisation}
                        onChange={(e) => setValues({ ...values, organisation: e.target.value })}
                        className="w-full rounded-lg bg-white/5 ring-1 ring-white/10 focus:ring-emerald-500/50 focus:outline-none px-3 py-2.5 text-sm placeholder-white/30"
                    />
                    <input
                        type="text"
                        placeholder="Hiring for (e.g. Digital Marketing)"
                        value={values.hiring_for}
                        onChange={(e) => setValues({ ...values, hiring_for: e.target.value })}
                        className="w-full rounded-lg bg-white/5 ring-1 ring-white/10 focus:ring-emerald-500/50 focus:outline-none px-3 py-2.5 text-sm placeholder-white/30"
                    />
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 px-4 py-2.5 text-sm font-semibold disabled:opacity-60"
                    >
                        {processing ? 'Adding you…' : 'Notify me when it launches'}
                        <ArrowRight className="h-4 w-4" />
                    </button>
                </form>
            )}
        </div>
    );
}

function AlumniCard({ success }: { success: boolean }) {
    const [mode, setMode] = useState<'signin' | 'request'>('signin');
    const [values, setValues] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        form_four_year: '',
        ci_project_hint: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        router.post('/invite-requests', values, {
            preserveScroll: true,
            onError: (errs) => setErrors(errs as Record<string, string>),
            onSuccess: () =>
                setValues({
                    first_name: '',
                    last_name: '',
                    email: '',
                    phone: '',
                    form_four_year: '',
                    ci_project_hint: '',
                }),
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <div className="flex flex-col rounded-2xl bg-white/[0.04] ring-1 ring-emerald-500/20 p-6 lg:p-7 hover:ring-emerald-500/40 transition shadow-lg shadow-emerald-500/5 h-full">
            <div className="flex items-center gap-3 mb-4">
                <div className="h-11 w-11 rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/30 grid place-items-center">
                    <GraduationCap className="h-5 w-5 text-emerald-300" />
                </div>
                <div>
                    <div className="text-[11px] font-semibold uppercase tracking-widest text-emerald-300">Alumni</div>
                    <h3 className="text-lg font-semibold">Sign up & get discovered</h3>
                </div>
            </div>

            <div className="flex rounded-lg bg-white/5 ring-1 ring-white/10 p-0.5 mb-4 text-xs">
                <button
                    type="button"
                    onClick={() => setMode('signin')}
                    className={`flex-1 rounded-md px-3 py-2 font-medium transition ${
                        mode === 'signin' ? 'bg-white text-slate-900' : 'text-white/60 hover:text-white'
                    }`}
                >
                    I have a login
                </button>
                <button
                    type="button"
                    onClick={() => setMode('request')}
                    className={`flex-1 rounded-md px-3 py-2 font-medium transition ${
                        mode === 'request' ? 'bg-white text-slate-900' : 'text-white/60 hover:text-white'
                    }`}
                >
                    Request an invite
                </button>
            </div>

            {mode === 'signin' ? (
                <>
                    <p className="text-sm text-white/60 leading-relaxed">
                        Already have a signup link from your CI project office? Complete signup there. Already have an account? Sign in to your profile below.
                    </p>
                    <div className="mt-auto pt-5">
                        <Link
                            href={login()}
                            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2.5 text-sm font-semibold"
                        >
                            Sign in to my profile
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </>
            ) : success ? (
                <div className="mt-1 rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/30 p-4 text-sm text-emerald-100 flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>Got it. CI Kenya will match your details to your project record and send an invite link.</span>
                </div>
            ) : (
                <form onSubmit={submit} className="space-y-2.5">
                    <div className="grid grid-cols-2 gap-2.5">
                        <div>
                            <input
                                type="text"
                                required
                                placeholder="First name"
                                value={values.first_name}
                                onChange={(e) => setValues({ ...values, first_name: e.target.value })}
                                className="w-full rounded-lg bg-white/5 ring-1 ring-white/10 focus:ring-emerald-500/50 focus:outline-none px-3 py-2 text-sm placeholder-white/30"
                            />
                            {errors.first_name && <p className="text-xs text-red-300 mt-1">{errors.first_name}</p>}
                        </div>
                        <div>
                            <input
                                type="text"
                                required
                                placeholder="Last name"
                                value={values.last_name}
                                onChange={(e) => setValues({ ...values, last_name: e.target.value })}
                                className="w-full rounded-lg bg-white/5 ring-1 ring-white/10 focus:ring-emerald-500/50 focus:outline-none px-3 py-2 text-sm placeholder-white/30"
                            />
                            {errors.last_name && <p className="text-xs text-red-300 mt-1">{errors.last_name}</p>}
                        </div>
                    </div>
                    <input
                        type="email"
                        required
                        placeholder="Email"
                        value={values.email}
                        onChange={(e) => setValues({ ...values, email: e.target.value })}
                        className="w-full rounded-lg bg-white/5 ring-1 ring-white/10 focus:ring-emerald-500/50 focus:outline-none px-3 py-2 text-sm placeholder-white/30"
                    />
                    {errors.email && <p className="text-xs text-red-300">{errors.email}</p>}
                    <div className="grid grid-cols-2 gap-2.5">
                        <input
                            type="tel"
                            placeholder="Phone (optional)"
                            value={values.phone}
                            onChange={(e) => setValues({ ...values, phone: e.target.value })}
                            className="w-full rounded-lg bg-white/5 ring-1 ring-white/10 focus:ring-emerald-500/50 focus:outline-none px-3 py-2 text-sm placeholder-white/30"
                        />
                        <input
                            type="number"
                            placeholder="Form 4 year"
                            min={1990}
                            max={new Date().getFullYear()}
                            value={values.form_four_year}
                            onChange={(e) => setValues({ ...values, form_four_year: e.target.value })}
                            className="w-full rounded-lg bg-white/5 ring-1 ring-white/10 focus:ring-emerald-500/50 focus:outline-none px-3 py-2 text-sm placeholder-white/30"
                        />
                    </div>
                    <input
                        type="text"
                        placeholder="CI project (e.g. Nakuru East)"
                        value={values.ci_project_hint}
                        onChange={(e) => setValues({ ...values, ci_project_hint: e.target.value })}
                        className="w-full rounded-lg bg-white/5 ring-1 ring-white/10 focus:ring-emerald-500/50 focus:outline-none px-3 py-2 text-sm placeholder-white/30"
                    />
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2.5 text-sm font-semibold disabled:opacity-60"
                    >
                        {processing ? 'Sending request…' : 'Request my invite'}
                    </button>
                </form>
            )}
        </div>
    );
}

function StaffCard() {
    return (
        <div className="flex flex-col rounded-2xl bg-white/[0.04] ring-1 ring-white/10 p-6 lg:p-7 hover:ring-emerald-500/40 transition h-full">
            <div className="flex items-center gap-3 mb-4">
                <div className="h-11 w-11 rounded-xl bg-sky-500/10 ring-1 ring-sky-500/30 grid place-items-center">
                    <ShieldCheck className="h-5 w-5 text-sky-300" />
                </div>
                <div>
                    <div className="text-[11px] font-semibold uppercase tracking-widest text-sky-300">CI Kenya staff</div>
                    <h3 className="text-lg font-semibold">Verify alumni & report outcomes</h3>
                </div>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">
                Onboard alumni, review verification requests, and pull cluster/project outcomes for donor reporting. Staff sign-in is invite-only.
            </p>

            <ul className="mt-5 space-y-2 text-sm text-white/70">
                {[
                    'Approve alumni-submitted profile edits',
                    'Review skill certificates and quizzes',
                    'Bulk-import alumni from CSV',
                ].map((line) => (
                    <li key={line} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-sky-400 flex-shrink-0 mt-0.5" />
                        <span>{line}</span>
                    </li>
                ))}
            </ul>

            <div className="mt-auto pt-6">
                <Link
                    href={login()}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-white/10 hover:bg-white/20 ring-1 ring-white/20 px-4 py-2.5 text-sm font-semibold"
                >
                    Staff sign in
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </div>
        </div>
    );
}

export default function Welcome({ stats }: Props) {
    const page = usePage<{
        auth: { user: { role?: string } | null };
        flash?: FlashProps;
    }>();
    const auth = page.props.auth;
    const flash = page.props.flash ?? {};

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
                    {auth?.user ? (
                        <Link
                            href={dashboard()}
                            className="rounded-lg bg-white text-slate-900 px-4 py-2 text-sm font-medium hover:bg-white/90"
                        >
                            Open dashboard
                        </Link>
                    ) : (
                        <Link
                            href={login()}
                            className="rounded-lg bg-white text-slate-900 px-4 py-2 text-sm font-medium hover:bg-white/90"
                        >
                            Sign in
                        </Link>
                    )}
                </nav>

                <section className="relative isolate overflow-hidden">
                    <div className="absolute inset-0 -z-10">
                        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950 to-emerald-950/40" />
                        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-emerald-500/20 blur-3xl" />
                    </div>

                    <div className="mx-auto max-w-4xl px-6 pt-14 pb-10 lg:pt-20 text-center">
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05]">
                            CI Kenya alumni,
                            <br />
                            <span className="bg-gradient-to-r from-emerald-300 via-emerald-400 to-amber-300 bg-clip-text text-transparent">
                                connected to real work.
                            </span>
                        </h1>
                        <p className="mt-5 text-base sm:text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
                            One platform where Compassion International Kenya alumni show verified skills, employers hire trained young Kenyans, and CI staff track outcomes end-to-end.
                        </p>
                    </div>

                    <div className="mx-auto max-w-7xl px-6 pb-16 lg:pb-24">
                        <div className="grid lg:grid-cols-3 gap-5 lg:gap-6">
                            <EmployerCard success={!!flash.employer_lead_success} />
                            <AlumniCard success={!!flash.invite_request_success} />
                            <StaffCard />
                        </div>
                    </div>
                </section>

                <section className="relative border-y border-white/5 bg-slate-950/60">
                    <div className="mx-auto max-w-6xl px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
                        {[
                            { label: 'Alumni tracked', value: stats.alumni_count },
                            { label: 'Skills verified', value: stats.verified_skill_count },
                            { label: 'Employer confirmations', value: stats.employer_confirmations },
                            { label: 'CI project centres', value: stats.projects_count },
                        ].map((s) => (
                            <div key={s.label}>
                                <div className="text-3xl md:text-4xl font-semibold tracking-tight tabular-nums">
                                    {s.value.toLocaleString()}
                                </div>
                                <div className="mt-1 text-[11px] md:text-xs text-white/50 uppercase tracking-wider">
                                    {s.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="relative py-20">
                    <div className="mx-auto max-w-6xl px-6">
                        <div className="max-w-2xl mx-auto text-center">
                            <div className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-3">
                                Every skill, verified
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                                A CV claim is easy. A verified skill isn&apos;t.
                            </h2>
                            <p className="mt-4 text-white/60">
                                Every skill on an alumni profile shows employers <em>how</em> it was verified — quiz, certificate, or a past employer&apos;s confirmation.
                            </p>
                        </div>

                        <div className="mt-12 grid md:grid-cols-3 gap-5">
                            {[
                                {
                                    icon: ClipboardCheck,
                                    title: 'Quiz',
                                    body: 'Timed multiple-choice tests. Score 70%+ to earn the badge. One attempt per week.',
                                },
                                {
                                    icon: FileCheck,
                                    title: 'Certificate',
                                    body: 'Upload a training certificate. CI staff review it before verification.',
                                },
                                {
                                    icon: Briefcase,
                                    title: 'Employer',
                                    body: 'A past employer clicks a one-shot link and confirms the work. The strongest signal.',
                                },
                            ].map((f) => (
                                <div
                                    key={f.title}
                                    className="rounded-2xl bg-white/[0.03] ring-1 ring-white/10 p-6"
                                >
                                    <div className="h-10 w-10 rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/20 grid place-items-center mb-3">
                                        <f.icon className="h-5 w-5 text-emerald-400" />
                                    </div>
                                    <h3 className="font-semibold">{f.title}</h3>
                                    <p className="mt-2 text-sm text-white/60 leading-relaxed">{f.body}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <footer className="border-t border-white/5 py-10 text-sm text-white/40">
                    <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded bg-gradient-to-br from-emerald-500 to-emerald-700 grid place-items-center">
                                <Users className="h-3.5 w-3.5 text-white" />
                            </div>
                            <span>CI Trainees · Alumni tracer for Compassion International Kenya</span>
                        </div>
                        <div className="flex items-center gap-6">
                            <a href="https://ariseci.org" target="_blank" rel="noopener noreferrer" className="hover:text-white">
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
