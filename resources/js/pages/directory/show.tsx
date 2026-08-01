import { FormEvent, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Award,
    Briefcase,
    CheckCircle2,
    ClipboardCheck,
    FileCheck,
    GraduationCap,
    Mail,
    MapPin,
    Send,
    ShieldCheck,
} from 'lucide-react';

interface SkillWithVerification {
    id: number;
    name: string;
    category: string | null;
    verified_at: string | null;
    verified_via: string | null;
}
interface EducationRecord {
    institution_name: string;
    institution_type: string | null;
    course_name: string | null;
    level: string | null;
    start_year: number | null;
    end_year: number | null;
    completion_status: string | null;
}
interface EmploymentRecord {
    employer_name: string;
    role_title: string | null;
    sector: string | null;
    employment_type: string | null;
    start_date: string | null;
    end_date: string | null;
    is_current: boolean;
    confirmed_at: string | null;
}
interface Props {
    contact_relay_email: string | null;
    alumni: {
        id: number;
        first_name: string;
        last_name: string;
        bio: string | null;
        county: string | null;
        sub_county: string | null;
        form_four_year: number | null;
        current_status: string | null;
        verified_at: string | null;
        ci_project: {
            name: string;
            county: string | null;
            cluster: string | null;
        } | null;
        phone_primary: string | null;
        email_secondary: string | null;
        skills: SkillWithVerification[];
        education_records: EducationRecord[];
        employment_records: EmploymentRecord[];
    };
}

function verifyBadge(via: string | null) {
    if (via === 'quiz') return { label: 'Quiz', icon: ClipboardCheck };
    if (via === 'certificate') return { label: 'Certificate', icon: FileCheck };
    if (via === 'employer') return { label: 'Employer', icon: Briefcase };
    return { label: 'Verified', icon: CheckCircle2 };
}

export default function DirectoryShow({ alumni, contact_relay_email }: Props) {
    const flash = usePage<{ flash?: { directory_message_success?: boolean } }>().props.flash ?? {};
    const verifiedSkills = alumni.skills.filter((s) => s.verified_at);
    const unverifiedSkills = alumni.skills.filter((s) => !s.verified_at);

    return (
        <>
            <Head title={`${alumni.first_name} ${alumni.last_name} — CI Trainees`} />

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
                    <Link href="/directory" className="inline-flex items-center gap-1 text-sm text-white/70 hover:text-white">
                        <ArrowLeft className="h-4 w-4" />
                        Back to directory
                    </Link>
                </nav>

                <div className="mx-auto max-w-4xl px-6 py-10 space-y-6">
                    <div className="rounded-2xl bg-white/[0.03] ring-1 ring-white/10 p-6 lg:p-8">
                        <div className="flex items-start gap-5">
                            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-700 grid place-items-center text-white text-2xl font-semibold flex-shrink-0">
                                {(alumni.first_name?.[0] ?? '') + (alumni.last_name?.[0] ?? '')}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center flex-wrap gap-2 mb-1">
                                    <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                                        {alumni.first_name} {alumni.last_name}
                                    </h1>
                                    {alumni.verified_at && (
                                        <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30">
                                            <Award className="h-3 w-3" />
                                            Staff verified
                                        </span>
                                    )}
                                </div>
                                <div className="text-sm text-white/60 flex flex-wrap gap-x-4 gap-y-1">
                                    {alumni.county && (
                                        <span className="flex items-center gap-1">
                                            <MapPin className="h-3.5 w-3.5" />
                                            {alumni.county}
                                            {alumni.sub_county ? `, ${alumni.sub_county}` : ''}
                                        </span>
                                    )}
                                    {alumni.form_four_year && <span>Form 4 · {alumni.form_four_year}</span>}
                                    {alumni.ci_project?.name && <span>{alumni.ci_project.name}</span>}
                                </div>
                                {alumni.bio && (
                                    <p className="mt-4 text-white/70 leading-relaxed">{alumni.bio}</p>
                                )}
                            </div>
                        </div>

                        {(alumni.phone_primary || alumni.email_secondary) && (
                            <div className="mt-6 pt-6 border-t border-white/5">
                                <div className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-3">
                                    Contact (opted in)
                                </div>
                                <div className="flex flex-wrap gap-4 text-sm">
                                    {alumni.email_secondary && (
                                        <a
                                            href={`mailto:${alumni.email_secondary}`}
                                            className="text-emerald-300 hover:text-emerald-200"
                                        >
                                            {alumni.email_secondary}
                                        </a>
                                    )}
                                    {alumni.phone_primary && (
                                        <a
                                            href={`tel:${alumni.phone_primary}`}
                                            className="text-emerald-300 hover:text-emerald-200"
                                        >
                                            {alumni.phone_primary}
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {verifiedSkills.length > 0 && (
                        <div className="rounded-2xl bg-white/[0.03] ring-1 ring-white/10 p-6">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                                Verified skills
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {verifiedSkills.map((s) => {
                                    const b = verifyBadge(s.verified_via);
                                    const Icon = b.icon;
                                    return (
                                        <span
                                            key={s.id}
                                            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm bg-emerald-500/10 text-emerald-200 ring-1 ring-emerald-500/30"
                                            title={`Verified via ${b.label}`}
                                        >
                                            <Icon className="h-3.5 w-3.5" />
                                            {s.name}
                                            <span className="text-[10px] uppercase tracking-wider text-emerald-400/70 ml-1">
                                                {b.label}
                                            </span>
                                        </span>
                                    );
                                })}
                            </div>
                            {unverifiedSkills.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-white/5">
                                    <div className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-2">
                                        Self-declared (not yet verified)
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {unverifiedSkills.map((s) => (
                                            <span
                                                key={s.id}
                                                className="inline-flex items-center rounded-full px-2 py-0.5 text-xs bg-white/5 text-white/50 ring-1 ring-white/10"
                                            >
                                                {s.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {alumni.education_records.length > 0 && (
                        <div className="rounded-2xl bg-white/[0.03] ring-1 ring-white/10 p-6">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <GraduationCap className="h-5 w-5 text-emerald-400" />
                                Education
                            </h2>
                            <ul className="space-y-4">
                                {alumni.education_records.map((e, i) => (
                                    <li key={i} className="border-l-2 border-white/10 pl-4">
                                        <div className="font-medium">{e.institution_name}</div>
                                        <div className="text-sm text-white/70">
                                            {e.course_name ?? '—'}
                                            {e.level && <span className="text-white/40"> · {e.level}</span>}
                                        </div>
                                        <div className="text-xs text-white/50 mt-1">
                                            {e.start_year}
                                            {e.end_year ? ` – ${e.end_year}` : ' – present'}
                                            {e.completion_status && (
                                                <span className="ml-2 text-white/40">({e.completion_status})</span>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {alumni.employment_records.length > 0 && (
                        <div className="rounded-2xl bg-white/[0.03] ring-1 ring-white/10 p-6">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Briefcase className="h-5 w-5 text-emerald-400" />
                                Employer-confirmed work history
                            </h2>
                            <ul className="space-y-4">
                                {alumni.employment_records.map((r, i) => (
                                    <li key={i} className="border-l-2 border-emerald-500/40 pl-4">
                                        <div className="font-medium">{r.employer_name}</div>
                                        <div className="text-sm text-white/70">
                                            {r.role_title ?? '—'}
                                            {r.sector && <span className="text-white/40"> · {r.sector}</span>}
                                        </div>
                                        <div className="text-xs text-white/50 mt-1 flex items-center gap-2 flex-wrap">
                                            <span>
                                                {r.start_date?.slice(0, 7)}
                                                {r.is_current
                                                    ? ' – present'
                                                    : r.end_date
                                                      ? ` – ${r.end_date.slice(0, 7)}`
                                                      : ''}
                                            </span>
                                            {r.confirmed_at && (
                                                <span className="inline-flex items-center gap-1 text-emerald-400">
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    Employer confirmed
                                                </span>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <ContactRelay
                        alumniId={alumni.id}
                        firstName={alumni.first_name}
                        hasDirectContact={!!(alumni.phone_primary || alumni.email_secondary)}
                        success={!!flash.directory_message_success}
                        relayEmail={contact_relay_email}
                    />
                </div>
            </div>
        </>
    );
}

function ContactRelay({
    alumniId,
    firstName,
    hasDirectContact,
    success,
    relayEmail,
}: {
    alumniId: number;
    firstName: string;
    hasDirectContact: boolean;
    success: boolean;
    relayEmail: string | null;
}) {
    const [values, setValues] = useState({
        from_name: '',
        from_email: '',
        from_organisation: '',
        purpose: '',
        message: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        router.post(`/directory/${alumniId}/message`, values, {
            preserveScroll: true,
            onError: (errs) => setErrors(errs as Record<string, string>),
            onSuccess: () =>
                setValues({
                    from_name: '',
                    from_email: '',
                    from_organisation: '',
                    purpose: '',
                    message: '',
                }),
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <div className="rounded-2xl bg-emerald-500/5 ring-1 ring-emerald-500/20 p-6 space-y-4">
            <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                    <div className="font-semibold text-white mb-1">
                        Get in touch with {firstName}
                    </div>
                    <p className="text-sm text-white/70">
                        Send a message and it goes straight to {firstName}'s email via the platform.
                        {hasDirectContact
                            ? ` ${firstName} has also shared direct contact details above.`
                            : ' Their email address stays private — you only see it if they reply.'}
                    </p>
                </div>
            </div>

            {success ? (
                <div className="rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/30 p-4 text-sm text-emerald-100 flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>Sent directly to {firstName}. When they reply, it comes straight to your email — no middleman.</span>
                </div>
            ) : (
                <form onSubmit={submit} className="grid sm:grid-cols-2 gap-3">
                    <input
                        type="text"
                        required
                        placeholder="Your name *"
                        value={values.from_name}
                        onChange={(e) => setValues({ ...values, from_name: e.target.value })}
                        className="w-full rounded-lg bg-white/5 ring-1 ring-white/10 focus:ring-emerald-500/50 focus:outline-none px-3 py-2 text-sm placeholder-white/30"
                    />
                    <input
                        type="email"
                        required
                        placeholder="Your work email *"
                        value={values.from_email}
                        onChange={(e) => setValues({ ...values, from_email: e.target.value })}
                        className="w-full rounded-lg bg-white/5 ring-1 ring-white/10 focus:ring-emerald-500/50 focus:outline-none px-3 py-2 text-sm placeholder-white/30"
                    />
                    <input
                        type="text"
                        placeholder="Organisation"
                        value={values.from_organisation}
                        onChange={(e) => setValues({ ...values, from_organisation: e.target.value })}
                        className="w-full rounded-lg bg-white/5 ring-1 ring-white/10 focus:ring-emerald-500/50 focus:outline-none px-3 py-2 text-sm placeholder-white/30"
                    />
                    <input
                        type="text"
                        placeholder="Purpose (e.g. Hiring, Internship, Chat)"
                        value={values.purpose}
                        onChange={(e) => setValues({ ...values, purpose: e.target.value })}
                        className="w-full rounded-lg bg-white/5 ring-1 ring-white/10 focus:ring-emerald-500/50 focus:outline-none px-3 py-2 text-sm placeholder-white/30"
                    />
                    <textarea
                        required
                        rows={4}
                        placeholder={`Message for ${firstName} — mention the role, timeline, and why they'd be a fit *`}
                        value={values.message}
                        onChange={(e) => setValues({ ...values, message: e.target.value })}
                        className="w-full sm:col-span-2 rounded-lg bg-white/5 ring-1 ring-white/10 focus:ring-emerald-500/50 focus:outline-none px-3 py-2 text-sm placeholder-white/30 resize-y min-h-[100px]"
                    />
                    {errors.message && (
                        <p className="sm:col-span-2 text-xs text-red-300 -mt-1">{errors.message}</p>
                    )}
                    <div className="sm:col-span-2 flex items-center justify-between gap-3 flex-wrap">
                        <p className="text-xs text-white/40">
                            Delivered to {firstName} from the platform. Your email is in the Reply-To so they can reply directly.
                        </p>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 text-sm font-semibold disabled:opacity-60"
                        >
                            <Send className="h-4 w-4" />
                            {processing ? 'Sending…' : 'Send message'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
