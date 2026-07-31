import { FormEvent, useRef, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Award, Camera, CheckCircle2, Clock, FileCheck, Plus, ShieldCheck, Trash2, Upload } from 'lucide-react';
import EmployerConfirmationDialog from '@/components/employer-confirmation-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import SkillsPicker from '@/components/skills-picker';
import type { Alumni, EducationRecord, EmploymentRecord, Skill } from '@/types/tracer';
import {
    ALUMNI_STATUS_OPTIONS,
    COMPLETION_STATUS_OPTIONS,
    EDUCATION_LEVEL_OPTIONS,
    EMPLOYMENT_TYPE_OPTIONS,
    INSTITUTION_TYPE_OPTIONS,
} from '@/types/tracer';

interface PendingCert {
    id: number;
    skill_id: number;
    evidence_original_name: string | null;
    created_at: string;
}

interface OnboardingStep {
    key: string;
    label: string;
    done: boolean;
    hint: string;
}

interface Props {
    alumni: Alumni;
    photo_url: string | null;
    counties: Record<string, string[]>;
    skills: Skill[];
    pending_skill_certs: Record<string, PendingCert>;
    onboarding: OnboardingStep[];
}

const NONE = '__none__';

export default function MyProfile({ alumni, photo_url, counties, skills, pending_skill_certs, onboarding }: Props) {
    const countyNames = Object.keys(counties);
    const [skillIds, setSkillIds] = useState<number[]>(alumni.skills?.map((s) => s.id) ?? []);
    const [values, setValues] = useState({
        phone_primary: alumni.phone_primary ?? '',
        email_secondary: alumni.email_secondary ?? '',
        current_status: alumni.current_status ?? NONE,
        gender: alumni.gender ?? NONE,
        bio: alumni.bio ?? '',
        county: alumni.county ?? '',
        sub_county: alumni.sub_county ?? '',
        is_public: alumni.is_public,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);
    const [showEdu, setShowEdu] = useState(false);
    const [showEmp, setShowEmp] = useState(false);

    const saveProfile = (e: FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        router.patch(
            '/my-profile',
            {
                ...values,
                current_status: values.current_status === NONE ? null : values.current_status,
                gender: values.gender === NONE ? null : values.gender,
                skill_ids: skillIds,
            },
            {
                onError: (errs) => setErrors(errs as Record<string, string>),
                onFinish: () => setProcessing(false),
                preserveScroll: true,
            },
        );
    };

    return (
        <>
            <Head title="My profile" />
            <div className="flex flex-col gap-4 p-4 max-w-3xl">
                <div className="flex items-start gap-4">
                    <PhotoUploader photoUrl={photo_url} firstName={alumni.first_name} lastName={alumni.last_name ?? ''} />
                    <div className="flex-1">
                        <Heading
                            title={`Habari, ${alumni.first_name}`}
                            description={
                                alumni.ci_project?.name
                                    ? `${alumni.ci_project.name} · Form 4 ${alumni.form_four_year ?? '—'}`
                                    : undefined
                            }
                        />
                    </div>
                </div>

                {!alumni.verified_at && (
                    <Alert>
                        <AlertDescription className="text-sm">
                            Your recent changes are pending review by CI staff. You can keep editing in the meantime.
                        </AlertDescription>
                    </Alert>
                )}

                <OnboardingChecklist steps={onboarding} />


                <Card>
                    <CardHeader>
                        <CardTitle>Contact & status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={saveProfile} className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <Label>Phone</Label>
                                    <Input
                                        value={values.phone_primary}
                                        onChange={(e) =>
                                            setValues({ ...values, phone_primary: e.target.value })
                                        }
                                    />
                                    <InputError message={errors.phone_primary} />
                                </div>
                                <div>
                                    <Label>Email</Label>
                                    <Input
                                        type="email"
                                        value={values.email_secondary}
                                        onChange={(e) =>
                                            setValues({ ...values, email_secondary: e.target.value })
                                        }
                                    />
                                    <InputError message={errors.email_secondary} />
                                </div>
                                <div>
                                    <Label>County</Label>
                                    <Select
                                        value={values.county || NONE}
                                        onValueChange={(v) =>
                                            setValues((prev) => ({
                                                ...prev,
                                                county: v === NONE ? '' : v,
                                                sub_county: '',
                                            }))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select county" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={NONE}>—</SelectItem>
                                            {countyNames.map((c) => (
                                                <SelectItem key={c} value={c}>
                                                    {c}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.county} />
                                </div>
                                <div>
                                    <Label>Sub-county</Label>
                                    <Select
                                        value={values.sub_county || NONE}
                                        onValueChange={(v) =>
                                            setValues({ ...values, sub_county: v === NONE ? '' : v })
                                        }
                                        disabled={!values.county}
                                    >
                                        <SelectTrigger>
                                            <SelectValue
                                                placeholder={
                                                    values.county ? 'Select sub-county' : 'Pick county first'
                                                }
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={NONE}>—</SelectItem>
                                            {(counties[values.county] ?? []).map((s) => (
                                                <SelectItem key={s} value={s}>
                                                    {s}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>What are you doing now?</Label>
                                    <Select
                                        value={values.current_status}
                                        onValueChange={(v) => setValues({ ...values, current_status: v })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={NONE}>—</SelectItem>
                                            {ALUMNI_STATUS_OPTIONS.map((o) => (
                                                <SelectItem key={o.value} value={o.value}>
                                                    {o.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Gender</Label>
                                    <Select
                                        value={values.gender}
                                        onValueChange={(v) => setValues({ ...values, gender: v })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={NONE}>—</SelectItem>
                                            <SelectItem value="female">Female</SelectItem>
                                            <SelectItem value="male">Male</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                            <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.gender} />
                                </div>
                            </div>
                            <div>
                                <Label>About you</Label>
                                <Textarea
                                    rows={4}
                                    value={values.bio}
                                    onChange={(e) => setValues({ ...values, bio: e.target.value })}
                                    placeholder="A short paragraph about your skills, goals, or the work you're looking for."
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <Label>My skills</Label>
                                    <Button variant="link" size="sm" asChild className="h-auto p-0">
                                        <Link href="/assessments">
                                            <Award className="mr-1 h-4 w-4" />
                                            Verify skills with a test
                                        </Link>
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground mb-2">
                                    Tag the skills you have. Take an assessment to earn a verified badge that employers
                                    trust.
                                </p>
                                <SkillsPicker
                                    allSkills={skills}
                                    selectedIds={skillIds}
                                    onChange={setSkillIds}
                                />
                                {alumni.skills && alumni.skills.length > 0 && (
                                    <div className="mt-4 border rounded-md p-3 bg-muted/20">
                                        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                                            Verify your skills with a certificate
                                        </div>
                                        <div className="space-y-2">
                                            {alumni.skills.map((s) => (
                                                <SkillCertRow
                                                    key={s.id}
                                                    skill={s}
                                                    pending={pending_skill_certs[s.id]}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-start gap-2 border rounded-md p-3 bg-muted/30">
                                <Checkbox
                                    id="is_public"
                                    checked={values.is_public}
                                    onCheckedChange={(v) => setValues({ ...values, is_public: Boolean(v) })}
                                />
                                <div>
                                    <Label htmlFor="is_public" className="cursor-pointer">
                                        Include me in the public employer directory
                                    </Label>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Employers will only see the fields you've marked public. Your phone and email
                                        are never shown directly — employers reach you through a contact form.
                                    </p>
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving…' : 'Save changes'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>My education</CardTitle>
                        <Button variant="outline" size="sm" onClick={() => setShowEdu((s) => !s)}>
                            <Plus className="mr-1 h-4 w-4" />
                            {showEdu ? 'Cancel' : 'Add'}
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {showEdu && <SelfEducationForm onDone={() => setShowEdu(false)} />}
                        {alumni.education_records && alumni.education_records.length > 0 ? (
                            alumni.education_records.map((rec) => <EducationCard key={rec.id} rec={rec} />)
                        ) : (
                            !showEdu && (
                                <p className="text-sm text-muted-foreground">
                                    No education records yet. Add colleges or universities you've attended.
                                </p>
                            )
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>My work history</CardTitle>
                        <Button variant="outline" size="sm" onClick={() => setShowEmp((s) => !s)}>
                            <Plus className="mr-1 h-4 w-4" />
                            {showEmp ? 'Cancel' : 'Add'}
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {showEmp && <SelfEmploymentForm onDone={() => setShowEmp(false)} />}
                        {alumni.employment_records && alumni.employment_records.length > 0 ? (
                            alumni.employment_records.map((rec) => (
                                <EmploymentCard
                                    key={rec.id}
                                    rec={rec}
                                    alumniFirstName={alumni.first_name}
                                />
                            ))
                        ) : (
                            !showEmp && (
                                <p className="text-sm text-muted-foreground">
                                    No work history yet. Add jobs, internships, or self-employment.
                                </p>
                            )
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

function EducationCard({ rec }: { rec: EducationRecord }) {
    const fileRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    const upload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const form = new FormData();
        form.append('certificate', file);
        setUploading(true);
        router.post(`/my-profile/education/${rec.id}/certificate`, form, {
            preserveScroll: true,
            forceFormData: true,
            onFinish: () => {
                setUploading(false);
                if (fileRef.current) fileRef.current.value = '';
            },
        });
    };

    return (
        <div className="border rounded-md p-3">
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                    <div className="font-medium">
                        {rec.course_name}
                        {rec.specialization ? ` — ${rec.specialization}` : ''}
                    </div>
                    <div className="text-sm text-muted-foreground">
                        {rec.institution_name} · {rec.level.replace('_', ' ')} · {rec.start_year ?? '?'}–
                        {rec.end_year ?? 'ongoing'}
                    </div>
                </div>
                {rec.certificate_path ? (
                    <Badge className="bg-emerald-600 hover:bg-emerald-700 gap-1">
                        <FileCheck className="h-3 w-3" />
                        Certificate on file
                    </Badge>
                ) : (
                    <>
                        <input
                            ref={fileRef}
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="hidden"
                            onChange={upload}
                        />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fileRef.current?.click()}
                            disabled={uploading}
                        >
                            <Upload className="mr-1 h-4 w-4" />
                            {uploading ? 'Uploading…' : 'Attach certificate'}
                        </Button>
                    </>
                )}
            </div>
            <div className="mt-1 flex gap-2">
                <Badge variant="outline">{rec.institution_type}</Badge>
                <Badge variant="secondary">{rec.completion_status}</Badge>
                {rec.grade_awarded && <Badge>{rec.grade_awarded}</Badge>}
            </div>
        </div>
    );
}

function OnboardingChecklist({ steps }: { steps: OnboardingStep[] }) {
    const done = steps.filter((s) => s.done).length;
    const total = steps.length;
    const pct = Math.round((done / total) * 100);
    const nextStep = steps.find((s) => !s.done);

    if (done === total) {
        return (
            <div className="rounded-md border border-emerald-500/40 bg-emerald-500/5 p-4 flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                <div className="flex-1 text-sm">
                    <div className="font-semibold text-emerald-700 dark:text-emerald-400">
                        Your profile is complete!
                    </div>
                    <div className="text-muted-foreground mt-0.5">
                        Employers can now find you when they search the directory.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-3">
                    <CardTitle className="text-base">Complete your profile</CardTitle>
                    <span className="text-xs font-semibold text-muted-foreground tabular-nums">
                        {done}/{total} · {pct}%
                    </span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                        className="h-full bg-emerald-500 transition-all"
                        style={{ width: `${pct}%` }}
                    />
                </div>
                {nextStep && (
                    <p className="text-xs text-muted-foreground mt-2">
                        Next: <span className="font-semibold text-foreground">{nextStep.label}</span>
                        {' — '}
                        {nextStep.hint}
                    </p>
                )}
            </CardHeader>
            <CardContent className="pt-0">
                <ul className="space-y-1.5">
                    {steps.map((s) => (
                        <li key={s.key} className="flex items-start gap-2 text-sm">
                            {s.done ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                            ) : (
                                <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/40 flex-shrink-0 mt-0.5" />
                            )}
                            <span className={s.done ? 'text-muted-foreground line-through' : ''}>
                                {s.label}
                            </span>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}

function PhotoUploader({ photoUrl, firstName, lastName }: { photoUrl: string | null; firstName: string; lastName: string }) {
    const fileRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const initials = ((firstName?.[0] ?? '') + (lastName?.[0] ?? '')).toUpperCase();

    const upload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const form = new FormData();
        form.append('photo', file);
        setUploading(true);
        router.post('/my-profile/photo', form, {
            preserveScroll: true,
            forceFormData: true,
            onFinish: () => {
                setUploading(false);
                if (fileRef.current) fileRef.current.value = '';
            },
        });
    };

    const remove = () => {
        if (!confirm('Remove your profile photo?')) return;
        router.delete('/my-profile/photo', { preserveScroll: true });
    };

    return (
        <div className="relative flex-shrink-0">
            {photoUrl ? (
                <img
                    src={photoUrl}
                    alt="Profile"
                    className="h-20 w-20 rounded-full object-cover border-2 border-muted"
                />
            ) : (
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-700 grid place-items-center text-white text-xl font-semibold">
                    {initials}
                </div>
            )}
            <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={upload}
            />
            <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-white ring-2 ring-background shadow grid place-items-center hover:bg-muted disabled:opacity-60"
                title="Change photo"
            >
                <Camera className="h-4 w-4" />
            </button>
            {photoUrl && (
                <button
                    type="button"
                    onClick={remove}
                    className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-white ring-2 ring-background shadow grid place-items-center hover:bg-red-50"
                    title="Remove photo"
                >
                    <Trash2 className="h-3 w-3 text-red-500" />
                </button>
            )}
        </div>
    );
}

function SkillCertRow({ skill, pending }: { skill: Skill & { pivot?: { verified_at?: string | null; verified_via?: string | null } }; pending: PendingCert | undefined }) {
    const fileRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    const upload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const form = new FormData();
        form.append('skill_id', String(skill.id));
        form.append('evidence', file);
        setUploading(true);
        router.post('/skill-certificates', form, {
            preserveScroll: true,
            forceFormData: true,
            onFinish: () => {
                setUploading(false);
                if (fileRef.current) fileRef.current.value = '';
            },
        });
    };

    const verified = skill.pivot?.verified_at;
    const via = skill.pivot?.verified_via;

    return (
        <div className="flex items-center justify-between gap-3 py-1.5 border-b last:border-b-0">
            <div className="flex-1 text-sm font-medium">{skill.name}</div>
            {verified ? (
                <Badge className="bg-emerald-600 hover:bg-emerald-700 gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified{via ? ` via ${via}` : ''}
                </Badge>
            ) : pending ? (
                <Badge variant="secondary" className="gap-1">
                    <Clock className="h-3 w-3" />
                    Pending review
                </Badge>
            ) : (
                <>
                    <input
                        ref={fileRef}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={upload}
                    />
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileRef.current?.click()}
                        disabled={uploading}
                    >
                        <Upload className="mr-1 h-4 w-4" />
                        {uploading ? 'Uploading…' : 'Upload certificate'}
                    </Button>
                </>
            )}
        </div>
    );
}

function EmploymentCard({ rec, alumniFirstName }: { rec: EmploymentRecord; alumniFirstName: string }) {
    const [open, setOpen] = useState(false);
    const confirmed = !!rec.confirmed_at;

    return (
        <div className="border rounded-md p-3">
            <div className="flex items-start justify-between gap-2">
                <div>
                    <div className="font-medium">
                        {rec.role_title} — {rec.employer_name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                        {rec.sector ?? 'Sector n/a'} · {rec.county ?? '—'} · {rec.start_date ?? '?'} –{' '}
                        {rec.is_current ? 'present' : rec.end_date ?? 'ended'}
                    </div>
                </div>
                {confirmed ? (
                    <Badge className="bg-emerald-600 hover:bg-emerald-700 gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Verified by employer
                    </Badge>
                ) : (
                    <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
                        <ShieldCheck className="mr-1 h-4 w-4" />
                        Request confirmation
                    </Button>
                )}
            </div>
            <div className="mt-1 flex gap-2">
                {rec.employment_type && (
                    <Badge variant="outline">{rec.employment_type.replace('_', ' ')}</Badge>
                )}
                {rec.is_current && <Badge>Current</Badge>}
            </div>
            {rec.description && <div className="mt-2 text-sm">{rec.description}</div>}
            {confirmed && rec.confirmer_name && (
                <div className="mt-2 text-xs text-emerald-700 dark:text-emerald-400">
                    Confirmed by {rec.confirmer_name}
                    {rec.confirmer_role && `, ${rec.confirmer_role}`}
                    {rec.confirmed_at && ` on ${new Date(rec.confirmed_at).toLocaleDateString()}`}
                </div>
            )}

            <EmployerConfirmationDialog
                record={rec}
                tokenIssueUrl={`/my-profile/employment/${rec.id}/issue-token`}
                tokenRegenerateUrl={`/my-profile/employment/${rec.id}/regenerate-token`}
                open={open}
                onOpenChange={setOpen}
                alumniFirstName={alumniFirstName}
            />
        </div>
    );
}

function SelfEducationForm({ onDone }: { onDone: () => void }) {
    const [values, setValues] = useState({
        institution_name: '',
        institution_type: 'tvet',
        course_name: '',
        level: 'certificate',
        specialization: '',
        start_year: '',
        end_year: '',
        completion_status: 'ongoing',
        grade_awarded: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        router.post('/my-profile/education', values, {
            preserveScroll: true,
            onError: (errs) => setErrors(errs as Record<string, string>),
            onSuccess: () => onDone(),
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <form onSubmit={submit} className="space-y-3 border-b pb-4">
            <div className="grid gap-3 md:grid-cols-2">
                <div>
                    <Label>Institution *</Label>
                    <Input
                        value={values.institution_name}
                        onChange={(e) => setValues({ ...values, institution_name: e.target.value })}
                        required
                    />
                    <InputError message={errors.institution_name} />
                </div>
                <div>
                    <Label>Course *</Label>
                    <Input
                        value={values.course_name}
                        onChange={(e) => setValues({ ...values, course_name: e.target.value })}
                        required
                    />
                </div>
                <div>
                    <Label>Type</Label>
                    <Select
                        value={values.institution_type}
                        onValueChange={(v) => setValues({ ...values, institution_type: v })}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {INSTITUTION_TYPE_OPTIONS.map((o) => (
                                <SelectItem key={o.value} value={o.value}>
                                    {o.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label>Level</Label>
                    <Select value={values.level} onValueChange={(v) => setValues({ ...values, level: v })}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {EDUCATION_LEVEL_OPTIONS.map((o) => (
                                <SelectItem key={o.value} value={o.value}>
                                    {o.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label>Start year</Label>
                    <Input
                        type="number"
                        value={values.start_year}
                        onChange={(e) => setValues({ ...values, start_year: e.target.value })}
                    />
                </div>
                <div>
                    <Label>End year</Label>
                    <Input
                        type="number"
                        value={values.end_year}
                        onChange={(e) => setValues({ ...values, end_year: e.target.value })}
                    />
                </div>
                <div>
                    <Label>Status</Label>
                    <Select
                        value={values.completion_status}
                        onValueChange={(v) => setValues({ ...values, completion_status: v })}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {COMPLETION_STATUS_OPTIONS.map((o) => (
                                <SelectItem key={o.value} value={o.value}>
                                    {o.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label>Grade</Label>
                    <Input
                        value={values.grade_awarded}
                        onChange={(e) => setValues({ ...values, grade_awarded: e.target.value })}
                    />
                </div>
            </div>
            <div className="flex justify-end">
                <Button type="submit" size="sm" disabled={processing}>
                    {processing ? 'Adding…' : 'Add education'}
                </Button>
            </div>
        </form>
    );
}

function SelfEmploymentForm({ onDone }: { onDone: () => void }) {
    const [values, setValues] = useState({
        employer_name: '',
        role_title: '',
        sector: '',
        employment_type: 'full_time',
        county: '',
        start_date: '',
        end_date: '',
        is_current: true,
        description: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        router.post(
            '/my-profile/employment',
            {
                ...values,
                end_date: values.is_current ? null : values.end_date || null,
            },
            {
                preserveScroll: true,
                onError: (errs) => setErrors(errs as Record<string, string>),
                onSuccess: () => onDone(),
                onFinish: () => setProcessing(false),
            },
        );
    };

    return (
        <form onSubmit={submit} className="space-y-3 border-b pb-4">
            <div className="grid gap-3 md:grid-cols-2">
                <div>
                    <Label>Employer *</Label>
                    <Input
                        value={values.employer_name}
                        onChange={(e) => setValues({ ...values, employer_name: e.target.value })}
                        required
                    />
                    <InputError message={errors.employer_name} />
                </div>
                <div>
                    <Label>Role *</Label>
                    <Input
                        value={values.role_title}
                        onChange={(e) => setValues({ ...values, role_title: e.target.value })}
                        required
                    />
                </div>
                <div>
                    <Label>Sector</Label>
                    <Input
                        value={values.sector}
                        onChange={(e) => setValues({ ...values, sector: e.target.value })}
                    />
                </div>
                <div>
                    <Label>Type</Label>
                    <Select
                        value={values.employment_type}
                        onValueChange={(v) => setValues({ ...values, employment_type: v })}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {EMPLOYMENT_TYPE_OPTIONS.map((o) => (
                                <SelectItem key={o.value} value={o.value}>
                                    {o.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label>County</Label>
                    <Input
                        value={values.county}
                        onChange={(e) => setValues({ ...values, county: e.target.value })}
                    />
                </div>
                <div>
                    <Label>Start date</Label>
                    <Input
                        type="date"
                        value={values.start_date}
                        onChange={(e) => setValues({ ...values, start_date: e.target.value })}
                    />
                </div>
                <div className="md:col-span-2 flex items-center gap-2">
                    <Checkbox
                        id="self_is_current"
                        checked={values.is_current}
                        onCheckedChange={(v) => setValues({ ...values, is_current: Boolean(v) })}
                    />
                    <Label htmlFor="self_is_current" className="cursor-pointer">
                        Currently in this role
                    </Label>
                </div>
                {!values.is_current && (
                    <div>
                        <Label>End date</Label>
                        <Input
                            type="date"
                            value={values.end_date}
                            onChange={(e) => setValues({ ...values, end_date: e.target.value })}
                        />
                    </div>
                )}
                <div className="md:col-span-2">
                    <Label>Description</Label>
                    <Textarea
                        rows={2}
                        value={values.description}
                        onChange={(e) => setValues({ ...values, description: e.target.value })}
                    />
                </div>
            </div>
            <div className="flex justify-end">
                <Button type="submit" size="sm" disabled={processing}>
                    {processing ? 'Adding…' : 'Add work'}
                </Button>
            </div>
        </form>
    );
}

MyProfile.layout = {
    breadcrumbs: [{ title: 'My profile', href: '/my-profile' }],
};
