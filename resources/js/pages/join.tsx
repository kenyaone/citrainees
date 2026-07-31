import { FormEvent, useMemo, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface Project {
    id: number;
    code: string;
    name: string;
    county: string | null;
}

interface Props {
    projects: Project[];
    counties: Record<string, string[]>;
}

export default function Join({ projects, counties }: Props) {
    const currentYear = new Date().getFullYear();
    const [values, setValues] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        password_confirmation: '',
        ci_project_id: '',
        form_four_year: '',
        county: '',
        phone_primary: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const countyOptions = useMemo(() => Object.keys(counties).sort(), [counties]);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        router.post('/join', values, {
            onError: (errs) => setErrors(errs as Record<string, string>),
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <>
            <Head title="Join — CI Trainees" />
            <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
                <div className="w-full max-w-2xl">
                    <div className="text-center mb-6">
                        <h1 className="text-3xl font-semibold tracking-tight">Create your alumni account</h1>
                        <p className="mt-2 text-white/60 text-sm">
                            Sign up in one step, then build out your profile — education, work, skills, and certificates. Staff will verify you and your profile becomes discoverable to employers.
                        </p>
                    </div>
                    <Card className="bg-white/[0.03] border-white/10 text-white">
                        <CardHeader>
                            <CardTitle>Your details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-4">
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <Label>First name *</Label>
                                        <Input
                                            value={values.first_name}
                                            onChange={(e) => setValues({ ...values, first_name: e.target.value })}
                                            required
                                            className="bg-white/5 border-white/10"
                                        />
                                        <InputError message={errors.first_name} />
                                    </div>
                                    <div>
                                        <Label>Last name *</Label>
                                        <Input
                                            value={values.last_name}
                                            onChange={(e) => setValues({ ...values, last_name: e.target.value })}
                                            required
                                            className="bg-white/5 border-white/10"
                                        />
                                        <InputError message={errors.last_name} />
                                    </div>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <Label>Email *</Label>
                                        <Input
                                            type="email"
                                            value={values.email}
                                            onChange={(e) => setValues({ ...values, email: e.target.value })}
                                            required
                                            autoComplete="email"
                                            className="bg-white/5 border-white/10"
                                        />
                                        <InputError message={errors.email} />
                                    </div>
                                    <div>
                                        <Label>Phone (optional)</Label>
                                        <Input
                                            type="tel"
                                            value={values.phone_primary}
                                            onChange={(e) => setValues({ ...values, phone_primary: e.target.value })}
                                            className="bg-white/5 border-white/10"
                                        />
                                        <InputError message={errors.phone_primary} />
                                    </div>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <Label>Password *</Label>
                                        <Input
                                            type="password"
                                            value={values.password}
                                            onChange={(e) => setValues({ ...values, password: e.target.value })}
                                            required
                                            minLength={8}
                                            autoComplete="new-password"
                                            className="bg-white/5 border-white/10"
                                        />
                                        <InputError message={errors.password} />
                                        <p className="text-xs text-white/40 mt-1">At least 8 characters.</p>
                                    </div>
                                    <div>
                                        <Label>Confirm password *</Label>
                                        <Input
                                            type="password"
                                            value={values.password_confirmation}
                                            onChange={(e) =>
                                                setValues({ ...values, password_confirmation: e.target.value })
                                            }
                                            required
                                            minLength={8}
                                            autoComplete="new-password"
                                            className="bg-white/5 border-white/10"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label>CI project centre *</Label>
                                    <Select
                                        value={values.ci_project_id}
                                        onValueChange={(v) => setValues({ ...values, ci_project_id: v })}
                                    >
                                        <SelectTrigger className="bg-white/5 border-white/10">
                                            <SelectValue placeholder="Where were you sponsored?" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {projects.map((p) => (
                                                <SelectItem key={p.id} value={String(p.id)}>
                                                    {p.name}
                                                    {p.county ? ` — ${p.county}` : ''}
                                                    {p.code ? ` (${p.code})` : ''}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.ci_project_id} />
                                </div>

                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <Label>Form 4 year *</Label>
                                        <Input
                                            type="number"
                                            min={1990}
                                            max={currentYear}
                                            value={values.form_four_year}
                                            onChange={(e) => setValues({ ...values, form_four_year: e.target.value })}
                                            required
                                            className="bg-white/5 border-white/10"
                                        />
                                        <InputError message={errors.form_four_year} />
                                    </div>
                                    <div>
                                        <Label>County *</Label>
                                        <Select
                                            value={values.county}
                                            onValueChange={(v) => setValues({ ...values, county: v })}
                                        >
                                            <SelectTrigger className="bg-white/5 border-white/10">
                                                <SelectValue placeholder="Select county" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {countyOptions.map((c) => (
                                                    <SelectItem key={c} value={c}>
                                                        {c}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.county} />
                                    </div>
                                </div>

                                <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950" disabled={processing}>
                                    {processing ? 'Creating account…' : 'Create my account'}
                                </Button>

                                <p className="text-xs text-white/50 text-center mt-2">
                                    Already have an account?{' '}
                                    <Link href="/login" className="text-emerald-400 hover:text-emerald-300">
                                        Sign in
                                    </Link>
                                </p>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
