import { FormEvent, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { CheckCircle2, Pencil, Plus, Send, ShieldCheck, Trash2 } from 'lucide-react';
import EmployerConfirmationDialog from '@/components/employer-confirmation-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import type { Alumni, EducationRecord, EmploymentRecord } from '@/types/tracer';
import {
    COMPLETION_STATUS_OPTIONS,
    EDUCATION_LEVEL_OPTIONS,
    EMPLOYMENT_TYPE_OPTIONS,
    INSTITUTION_TYPE_OPTIONS,
} from '@/types/tracer';
import { dashboard } from '@/routes';

interface Props {
    alumni: Alumni;
}

function DataRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="grid grid-cols-2 gap-2 py-1.5 border-b last:border-0">
            <div className="text-sm text-muted-foreground">{label}</div>
            <div className="text-sm">{value ?? '—'}</div>
        </div>
    );
}

function EducationForm({ alumniId, onDone }: { alumniId: number; onDone: () => void }) {
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
        router.post(`/alumni/${alumniId}/education`, values, {
            preserveScroll: true,
            onError: (errs) => setErrors(errs as Record<string, string>),
            onSuccess: () => {
                setErrors({});
                onDone();
            },
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <form onSubmit={submit} className="space-y-3">
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
                    <InputError message={errors.course_name} />
                </div>
                <div>
                    <Label>Institution type</Label>
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
                    <InputError message={errors.start_year} />
                </div>
                <div>
                    <Label>End year</Label>
                    <Input
                        type="number"
                        value={values.end_year}
                        onChange={(e) => setValues({ ...values, end_year: e.target.value })}
                    />
                    <InputError message={errors.end_year} />
                </div>
                <div>
                    <Label>Completion status</Label>
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
                    <Label>Grade / award</Label>
                    <Input
                        value={values.grade_awarded}
                        onChange={(e) => setValues({ ...values, grade_awarded: e.target.value })}
                        placeholder="e.g. Credit"
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

function EmploymentForm({ alumniId, onDone }: { alumniId: number; onDone: () => void }) {
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
            `/alumni/${alumniId}/employment`,
            {
                ...values,
                end_date: values.is_current ? null : values.end_date || null,
            },
            {
                preserveScroll: true,
                onError: (errs) => setErrors(errs as Record<string, string>),
                onSuccess: () => {
                    setErrors({});
                    onDone();
                },
                onFinish: () => setProcessing(false),
            },
        );
    };

    return (
        <form onSubmit={submit} className="space-y-3">
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
                    <InputError message={errors.role_title} />
                </div>
                <div>
                    <Label>Sector</Label>
                    <Input
                        value={values.sector}
                        onChange={(e) => setValues({ ...values, sector: e.target.value })}
                        placeholder="e.g. Healthcare"
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
                    <InputError message={errors.start_date} />
                </div>
                <div className="md:col-span-2 flex items-center gap-2">
                    <Checkbox
                        id="is_current"
                        checked={values.is_current}
                        onCheckedChange={(v) => setValues({ ...values, is_current: Boolean(v) })}
                    />
                    <Label htmlFor="is_current" className="cursor-pointer">
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
                        <InputError message={errors.end_date} />
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
                    {processing ? 'Adding…' : 'Add employment'}
                </Button>
            </div>
        </form>
    );
}

function StaffEmploymentRow({
    rec,
    alumniId,
    alumniFirstName,
    onRemove,
}: {
    rec: EmploymentRecord;
    alumniId: number;
    alumniFirstName: string;
    onRemove: (rec: EmploymentRecord) => void;
}) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const confirmed = !!rec.confirmed_at;

    return (
        <div className="flex items-start justify-between border rounded-md p-3">
            <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                    <div className="font-medium">
                        {rec.role_title} — {rec.employer_name}
                    </div>
                    {confirmed && (
                        <Badge className="bg-emerald-600 hover:bg-emerald-700 gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Verified by employer
                        </Badge>
                    )}
                </div>
                <div className="text-sm text-muted-foreground">
                    {rec.sector ?? 'Sector n/a'} · {rec.county ?? '—'} ·{' '}
                    {rec.start_date ?? '?'} –{' '}
                    {rec.is_current ? 'present' : rec.end_date ?? 'ended'}
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
                {!confirmed && (
                    <div className="mt-2">
                        <Button variant="outline" size="sm" onClick={() => setDialogOpen(true)}>
                            <ShieldCheck className="mr-1 h-4 w-4" />
                            Request employer confirmation
                        </Button>
                    </div>
                )}
            </div>
            <Button variant="ghost" size="icon" onClick={() => onRemove(rec)} aria-label="Remove">
                <Trash2 className="h-4 w-4" />
            </Button>

            <EmployerConfirmationDialog
                record={rec}
                tokenIssueUrl={`/alumni/${alumniId}/employment/${rec.id}/issue-token`}
                tokenRegenerateUrl={`/alumni/${alumniId}/employment/${rec.id}/regenerate-token`}
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                alumniFirstName={alumniFirstName}
            />
        </div>
    );
}

export default function AlumniShow({ alumni }: Props) {
    const [showEduForm, setShowEduForm] = useState(false);
    const [showEmpForm, setShowEmpForm] = useState(false);

    const verify = () => {
        router.post(`/alumni/${alumni.id}/verify`, {}, { preserveScroll: true });
    };

    const remove = () => {
        if (confirm(`Archive ${alumni.first_name} ${alumni.last_name}? This can be restored later.`)) {
            router.delete(`/alumni/${alumni.id}`);
        }
    };

    const removeEdu = (rec: EducationRecord) => {
        if (confirm(`Remove ${rec.course_name} at ${rec.institution_name}?`)) {
            router.delete(`/alumni/${alumni.id}/education/${rec.id}`, { preserveScroll: true });
        }
    };

    const removeEmp = (rec: EmploymentRecord) => {
        if (confirm(`Remove ${rec.role_title} at ${rec.employer_name}?`)) {
            router.delete(`/alumni/${alumni.id}/employment/${rec.id}`, { preserveScroll: true });
        }
    };

    return (
        <>
            <Head title={`${alumni.first_name} ${alumni.last_name}`} />
            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-start justify-between">
                    <Heading
                        title={`${alumni.first_name} ${alumni.middle_name ?? ''} ${alumni.last_name}`.replace(/\s+/g, ' ')}
                        description={
                            alumni.ci_project?.name
                                ? `${alumni.ci_project.name} · Form 4 ${alumni.form_four_year ?? '—'}`
                                : `Form 4 ${alumni.form_four_year ?? '—'}`
                        }
                    />
                    <div className="flex gap-2">
                        {!alumni.user_id && (
                            <Button variant="outline" size="sm" asChild>
                                <Link href={`/alumni/${alumni.id}/invite`}>
                                    <Send className="mr-1 h-4 w-4" />
                                    Invite
                                </Link>
                            </Button>
                        )}
                        {!alumni.verified_at && (
                            <Button variant="outline" size="sm" onClick={verify}>
                                <ShieldCheck className="mr-1 h-4 w-4" />
                                Verify
                            </Button>
                        )}
                        <Button asChild size="sm">
                            <Link href={`/alumni/${alumni.id}/edit`}>
                                <Pencil className="mr-1 h-4 w-4" />
                                Edit
                            </Link>
                        </Button>
                        <Button variant="destructive" size="sm" onClick={remove}>
                            <Trash2 className="mr-1 h-4 w-4" />
                            Archive
                        </Button>
                    </div>
                </div>

                {alumni.verified_at && (
                    <div className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="h-4 w-4" />
                        Verified {alumni.verifier ? `by ${alumni.verifier.name}` : ''} on{' '}
                        {new Date(alumni.verified_at).toLocaleDateString()}
                    </div>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <DataRow label="Date of birth" value={alumni.date_of_birth} />
                            <DataRow label="Gender" value={alumni.gender} />
                            <DataRow label="County" value={alumni.county} />
                            <DataRow label="Sub-county" value={alumni.sub_county} />
                            <DataRow label="Phone" value={alumni.phone_primary} />
                            <DataRow label="Email" value={alumni.email_secondary} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Compassion & KCSE</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <DataRow label="CI project" value={alumni.ci_project?.name} />
                            <DataRow label="Sponsorship start" value={alumni.sponsorship_start_year} />
                            <DataRow label="Sponsorship end" value={alumni.sponsorship_end_year} />
                            <DataRow label="Form 4 year" value={alumni.form_four_year} />
                            <DataRow label="KCSE index" value={alumni.kcse_index_number} />
                            <DataRow label="KCSE mean grade" value={alumni.kcse_mean_grade} />
                            <DataRow
                                label="Current status"
                                value={
                                    alumni.current_status ? (
                                        <Badge variant="secondary">{alumni.current_status.replace('_', ' ')}</Badge>
                                    ) : null
                                }
                            />
                        </CardContent>
                    </Card>
                </div>

                {alumni.bio && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Bio</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm whitespace-pre-wrap">{alumni.bio}</CardContent>
                    </Card>
                )}

                {alumni.skills && alumni.skills.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Skills</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-1">
                            {alumni.skills.map((s) => {
                                const verified = s.pivot?.verified_at != null;
                                return (
                                    <Badge
                                        key={s.id}
                                        variant={verified ? 'default' : 'secondary'}
                                        className={verified ? 'bg-emerald-600 hover:bg-emerald-700 gap-1' : 'gap-1'}
                                        title={
                                            verified
                                                ? `Verified via ${s.pivot?.verified_via ?? 'quiz'}`
                                                : 'Self-declared, not verified'
                                        }
                                    >
                                        {verified && <CheckCircle2 className="h-3 w-3" />}
                                        {s.name}
                                    </Badge>
                                );
                            })}
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Post-secondary education</CardTitle>
                        <Button variant="outline" size="sm" onClick={() => setShowEduForm((s) => !s)}>
                            <Plus className="mr-1 h-4 w-4" />
                            {showEduForm ? 'Cancel' : 'Add'}
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {showEduForm && <EducationForm alumniId={alumni.id} onDone={() => setShowEduForm(false)} />}
                        {alumni.education_records && alumni.education_records.length > 0 ? (
                            <div className="space-y-3">
                                {alumni.education_records.map((rec) => (
                                    <div key={rec.id} className="flex items-start justify-between border rounded-md p-3">
                                        <div>
                                            <div className="font-medium">
                                                {rec.course_name}
                                                {rec.specialization ? ` — ${rec.specialization}` : ''}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {rec.institution_name} · {rec.level.replace('_', ' ')} ·{' '}
                                                {rec.start_year ?? '?'}–{rec.end_year ?? 'ongoing'}
                                            </div>
                                            <div className="mt-1 flex gap-2">
                                                <Badge variant="outline">{rec.institution_type}</Badge>
                                                <Badge variant="secondary">{rec.completion_status}</Badge>
                                                {rec.grade_awarded && <Badge>{rec.grade_awarded}</Badge>}
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeEdu(rec)}
                                            aria-label="Remove"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            !showEduForm && (
                                <p className="text-sm text-muted-foreground">No education records yet.</p>
                            )
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Employment</CardTitle>
                        <Button variant="outline" size="sm" onClick={() => setShowEmpForm((s) => !s)}>
                            <Plus className="mr-1 h-4 w-4" />
                            {showEmpForm ? 'Cancel' : 'Add'}
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {showEmpForm && <EmploymentForm alumniId={alumni.id} onDone={() => setShowEmpForm(false)} />}
                        {alumni.employment_records && alumni.employment_records.length > 0 ? (
                            <div className="space-y-3">
                                {alumni.employment_records.map((rec) => (
                                    <StaffEmploymentRow
                                        key={rec.id}
                                        rec={rec}
                                        alumniId={alumni.id}
                                        alumniFirstName={alumni.first_name}
                                        onRemove={removeEmp}
                                    />
                                ))}
                            </div>
                        ) : (
                            !showEmpForm && (
                                <p className="text-sm text-muted-foreground">No employment records yet.</p>
                            )
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

AlumniShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Alumni', href: '/alumni' },
        { title: 'Profile', href: '#' },
    ],
};
