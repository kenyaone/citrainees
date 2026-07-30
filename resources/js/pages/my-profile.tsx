import { FormEvent, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
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
import type { Alumni, EducationRecord, EmploymentRecord } from '@/types/tracer';
import {
    ALUMNI_STATUS_OPTIONS,
    COMPLETION_STATUS_OPTIONS,
    EDUCATION_LEVEL_OPTIONS,
    EMPLOYMENT_TYPE_OPTIONS,
    INSTITUTION_TYPE_OPTIONS,
} from '@/types/tracer';

interface Props {
    alumni: Alumni;
}

const NONE = '__none__';

export default function MyProfile({ alumni }: Props) {
    const [values, setValues] = useState({
        phone_primary: alumni.phone_primary ?? '',
        email_secondary: alumni.email_secondary ?? '',
        current_status: alumni.current_status ?? NONE,
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
                <Heading
                    title={`Habari, ${alumni.first_name}`}
                    description={
                        alumni.ci_project?.name
                            ? `${alumni.ci_project.name} · Form 4 ${alumni.form_four_year ?? '—'}`
                            : undefined
                    }
                />

                {!alumni.verified_at && (
                    <Alert>
                        <AlertDescription className="text-sm">
                            Your recent changes are pending review by CI staff. You can keep editing in the meantime.
                        </AlertDescription>
                    </Alert>
                )}

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
                                    <Input
                                        value={values.county}
                                        onChange={(e) => setValues({ ...values, county: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Sub-county</Label>
                                    <Input
                                        value={values.sub_county}
                                        onChange={(e) => setValues({ ...values, sub_county: e.target.value })}
                                    />
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
                            alumni.employment_records.map((rec) => <EmploymentCard key={rec.id} rec={rec} />)
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
    return (
        <div className="border rounded-md p-3">
            <div className="font-medium">
                {rec.course_name}
                {rec.specialization ? ` — ${rec.specialization}` : ''}
            </div>
            <div className="text-sm text-muted-foreground">
                {rec.institution_name} · {rec.level.replace('_', ' ')} · {rec.start_year ?? '?'}–
                {rec.end_year ?? 'ongoing'}
            </div>
            <div className="mt-1 flex gap-2">
                <Badge variant="outline">{rec.institution_type}</Badge>
                <Badge variant="secondary">{rec.completion_status}</Badge>
                {rec.grade_awarded && <Badge>{rec.grade_awarded}</Badge>}
            </div>
        </div>
    );
}

function EmploymentCard({ rec }: { rec: EmploymentRecord }) {
    return (
        <div className="border rounded-md p-3">
            <div className="font-medium">
                {rec.role_title} — {rec.employer_name}
            </div>
            <div className="text-sm text-muted-foreground">
                {rec.sector ?? 'Sector n/a'} · {rec.county ?? '—'} · {rec.start_date ?? '?'} –{' '}
                {rec.is_current ? 'present' : rec.end_date ?? 'ended'}
            </div>
            <div className="mt-1 flex gap-2">
                {rec.employment_type && (
                    <Badge variant="outline">{rec.employment_type.replace('_', ' ')}</Badge>
                )}
                {rec.is_current && <Badge>Current</Badge>}
            </div>
            {rec.description && <div className="mt-2 text-sm">{rec.description}</div>}
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
