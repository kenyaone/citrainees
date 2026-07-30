import { FormEvent, useState } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import InputError from '@/components/input-error';
import SkillsPicker from '@/components/skills-picker';
import { ALUMNI_STATUS_OPTIONS, Alumni, CiProject, Skill } from '@/types/tracer';

interface Props {
    alumni?: (Alumni & { skills?: Skill[] }) | null;
    projects: CiProject[];
    counties: Record<string, string[]>;
    skills: Skill[];
    submitUrl: string;
    submitMethod: 'post' | 'put';
    cancelUrl: string;
    submitLabel: string;
}

const GENDER_OPTIONS = [
    { value: 'female', label: 'Female' },
    { value: 'male', label: 'Male' },
    { value: 'other', label: 'Other' },
    { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

const NONE = '__none__';

export default function AlumniForm({
    alumni,
    projects,
    counties,
    skills,
    submitUrl,
    submitMethod,
    cancelUrl,
    submitLabel,
}: Props) {
    const countyNames = Object.keys(counties);
    const [skillIds, setSkillIds] = useState<number[]>(alumni?.skills?.map((s) => s.id) ?? []);
    const [values, setValues] = useState({
        ci_project_id: alumni?.ci_project_id ? String(alumni.ci_project_id) : NONE,
        first_name: alumni?.first_name ?? '',
        middle_name: alumni?.middle_name ?? '',
        last_name: alumni?.last_name ?? '',
        date_of_birth: alumni?.date_of_birth ?? '',
        gender: alumni?.gender ?? NONE,
        county: alumni?.county ?? '',
        sub_county: alumni?.sub_county ?? '',
        sponsorship_start_year: alumni?.sponsorship_start_year ? String(alumni.sponsorship_start_year) : '',
        sponsorship_end_year: alumni?.sponsorship_end_year ? String(alumni.sponsorship_end_year) : '',
        form_four_year: alumni?.form_four_year ? String(alumni.form_four_year) : '',
        kcse_index_number: alumni?.kcse_index_number ?? '',
        kcse_mean_grade: alumni?.kcse_mean_grade ?? '',
        current_status: alumni?.current_status ?? NONE,
        bio: alumni?.bio ?? '',
        phone_primary: alumni?.phone_primary ?? '',
        email_secondary: alumni?.email_secondary ?? '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const set = (key: keyof typeof values, v: string) => setValues((prev) => ({ ...prev, [key]: v }));

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        const payload: Record<string, string | number | number[] | null> = {};
        Object.entries(values).forEach(([k, v]) => {
            if (v === '' || v === NONE) {
                payload[k] = null;
            } else if (['sponsorship_start_year', 'sponsorship_end_year', 'form_four_year', 'ci_project_id'].includes(k)) {
                payload[k] = Number(v);
            } else {
                payload[k] = v;
            }
        });
        payload.skill_ids = skillIds;

        router[submitMethod](submitUrl, payload, {
            onError: (errs) => setErrors(errs as Record<string, string>),
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <section className="grid gap-4 md:grid-cols-3">
                <div>
                    <Label>First name *</Label>
                    <Input value={values.first_name} onChange={(e) => set('first_name', e.target.value)} required />
                    <InputError message={errors.first_name} />
                </div>
                <div>
                    <Label>Middle name</Label>
                    <Input value={values.middle_name} onChange={(e) => set('middle_name', e.target.value)} />
                    <InputError message={errors.middle_name} />
                </div>
                <div>
                    <Label>Last name *</Label>
                    <Input value={values.last_name} onChange={(e) => set('last_name', e.target.value)} required />
                    <InputError message={errors.last_name} />
                </div>
            </section>

            <section className="grid gap-4 md:grid-cols-3">
                <div>
                    <Label>Date of birth</Label>
                    <Input
                        type="date"
                        value={values.date_of_birth}
                        onChange={(e) => set('date_of_birth', e.target.value)}
                    />
                    <InputError message={errors.date_of_birth} />
                </div>
                <div>
                    <Label>Gender</Label>
                    <Select value={values.gender} onValueChange={(v) => set('gender', v)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={NONE}>—</SelectItem>
                            {GENDER_OPTIONS.map((o) => (
                                <SelectItem key={o.value} value={o.value}>
                                    {o.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={errors.gender} />
                </div>
                <div>
                    <Label>Current status</Label>
                    <Select value={values.current_status} onValueChange={(v) => set('current_status', v)}>
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
                    <InputError message={errors.current_status} />
                </div>
            </section>

            <section className="grid gap-4 md:grid-cols-3">
                <div>
                    <Label>CI project centre</Label>
                    <Select value={values.ci_project_id} onValueChange={(v) => set('ci_project_id', v)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={NONE}>— None —</SelectItem>
                            {projects.map((p) => (
                                <SelectItem key={p.id} value={String(p.id)}>
                                    {p.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={errors.ci_project_id} />
                </div>
                <div>
                    <Label>County</Label>
                    <Select
                        value={values.county || NONE}
                        onValueChange={(v) => {
                            setValues((prev) => ({
                                ...prev,
                                county: v === NONE ? '' : v,
                                sub_county: '',
                            }));
                        }}
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
                        onValueChange={(v) => set('sub_county', v === NONE ? '' : v)}
                        disabled={!values.county}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder={values.county ? 'Select sub-county' : 'Pick county first'} />
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
                    <InputError message={errors.sub_county} />
                </div>
            </section>

            <section className="grid gap-4 md:grid-cols-3">
                <div>
                    <Label>Sponsorship start year</Label>
                    <Input
                        type="number"
                        value={values.sponsorship_start_year}
                        onChange={(e) => set('sponsorship_start_year', e.target.value)}
                    />
                    <InputError message={errors.sponsorship_start_year} />
                </div>
                <div>
                    <Label>Sponsorship end year</Label>
                    <Input
                        type="number"
                        value={values.sponsorship_end_year}
                        onChange={(e) => set('sponsorship_end_year', e.target.value)}
                    />
                    <InputError message={errors.sponsorship_end_year} />
                </div>
                <div>
                    <Label>Form Four year</Label>
                    <Input
                        type="number"
                        value={values.form_four_year}
                        onChange={(e) => set('form_four_year', e.target.value)}
                    />
                    <InputError message={errors.form_four_year} />
                </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2">
                <div>
                    <Label>KCSE index number (encrypted at rest)</Label>
                    <Input
                        value={values.kcse_index_number}
                        onChange={(e) => set('kcse_index_number', e.target.value)}
                    />
                    <InputError message={errors.kcse_index_number} />
                </div>
                <div>
                    <Label>KCSE mean grade</Label>
                    <Input
                        value={values.kcse_mean_grade}
                        onChange={(e) => set('kcse_mean_grade', e.target.value)}
                        placeholder="e.g. B+"
                    />
                    <InputError message={errors.kcse_mean_grade} />
                </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2">
                <div>
                    <Label>Phone (encrypted at rest)</Label>
                    <Input value={values.phone_primary} onChange={(e) => set('phone_primary', e.target.value)} />
                    <InputError message={errors.phone_primary} />
                </div>
                <div>
                    <Label>Secondary email (encrypted at rest)</Label>
                    <Input
                        type="email"
                        value={values.email_secondary}
                        onChange={(e) => set('email_secondary', e.target.value)}
                    />
                    <InputError message={errors.email_secondary} />
                </div>
            </section>

            <div>
                <Label>Bio</Label>
                <Textarea rows={4} value={values.bio} onChange={(e) => set('bio', e.target.value)} />
                <InputError message={errors.bio} />
            </div>

            <div>
                <Label>Skills</Label>
                <SkillsPicker allSkills={skills} selectedIds={skillIds} onChange={setSkillIds} />
                <InputError message={errors.skill_ids} />
            </div>

            <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => router.visit(cancelUrl)}>
                    Cancel
                </Button>
                <Button type="submit" disabled={processing}>
                    {processing ? 'Saving…' : submitLabel}
                </Button>
            </div>
        </form>
    );
}
