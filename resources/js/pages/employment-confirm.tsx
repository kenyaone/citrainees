import { FormEvent, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Briefcase, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import InputError from '@/components/input-error';

interface Skill {
    id: number;
    name: string;
    category: string | null;
}

interface Props {
    record: {
        id: number;
        employer_name: string;
        role_title: string;
        sector: string | null;
        county: string | null;
        start_date: string | null;
        end_date: string | null;
        is_current: boolean;
        description: string | null;
    };
    alumni: {
        first_name: string;
        last_name: string;
        ci_project_name: string | null;
    };
    skills: Skill[];
    token: string;
}

export default function EmploymentConfirm({ record, alumni, skills, token }: Props) {
    const [values, setValues] = useState({
        confirmer_name: '',
        confirmer_email: '',
        confirmer_role: '',
        confirmer_notes: '',
    });
    const [selectedSkills, setSelectedSkills] = useState<number[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        router.post(
            `/confirm-employment/${token}`,
            { ...values, confirmed_skill_ids: selectedSkills },
            {
                onError: (errs) => setErrors(errs as Record<string, string>),
                onFinish: () => setProcessing(false),
            },
        );
    };

    const toggleSkill = (id: number) => {
        setSelectedSkills((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
    };

    return (
        <>
            <Head title="Confirm employment" />
            <div className="min-h-screen bg-muted/30 py-8 px-4">
                <div className="max-w-2xl mx-auto space-y-4">
                    <div className="text-center">
                        <ShieldCheck className="mx-auto h-10 w-10 text-primary" />
                        <h1 className="text-2xl font-semibold mt-2">Confirm employment</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            {alumni.first_name} {alumni.last_name} has listed this employment on the Compassion
                            International Kenya alumni platform. Please confirm the details below.
                        </p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Briefcase className="h-4 w-4" />
                                Employment claim
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="grid grid-cols-2 gap-y-2">
                                <div className="text-muted-foreground">Alumnus</div>
                                <div className="font-medium">
                                    {alumni.first_name} {alumni.last_name}
                                    {alumni.ci_project_name && (
                                        <span className="text-muted-foreground text-xs block">
                                            {alumni.ci_project_name}
                                        </span>
                                    )}
                                </div>
                                <div className="text-muted-foreground">Employer</div>
                                <div className="font-medium">{record.employer_name}</div>
                                <div className="text-muted-foreground">Role</div>
                                <div className="font-medium">{record.role_title}</div>
                                {record.sector && (
                                    <>
                                        <div className="text-muted-foreground">Sector</div>
                                        <div>{record.sector}</div>
                                    </>
                                )}
                                {record.county && (
                                    <>
                                        <div className="text-muted-foreground">County</div>
                                        <div>{record.county}</div>
                                    </>
                                )}
                                <div className="text-muted-foreground">Dates</div>
                                <div>
                                    {record.start_date ?? '?'} –{' '}
                                    {record.is_current ? (
                                        <Badge variant="secondary">Present</Badge>
                                    ) : (
                                        record.end_date ?? 'Ended'
                                    )}
                                </div>
                            </div>
                            {record.description && (
                                <div className="pt-2 border-t">
                                    <div className="text-muted-foreground text-xs uppercase">Description</div>
                                    <div className="mt-1">{record.description}</div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Your details</CardTitle>
                            <p className="text-xs text-muted-foreground">
                                By confirming, you attest that this person did work at your organisation in the role
                                described.
                            </p>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-4">
                                <div>
                                    <Label>Your name *</Label>
                                    <Input
                                        value={values.confirmer_name}
                                        onChange={(e) =>
                                            setValues({ ...values, confirmer_name: e.target.value })
                                        }
                                        required
                                    />
                                    <InputError message={errors.confirmer_name} />
                                </div>
                                <div>
                                    <Label>Your role at {record.employer_name} *</Label>
                                    <Input
                                        value={values.confirmer_role}
                                        onChange={(e) =>
                                            setValues({ ...values, confirmer_role: e.target.value })
                                        }
                                        placeholder="e.g. HR Manager, Operations Lead"
                                        required
                                    />
                                    <InputError message={errors.confirmer_role} />
                                </div>
                                <div>
                                    <Label>Your email *</Label>
                                    <Input
                                        type="email"
                                        value={values.confirmer_email}
                                        onChange={(e) =>
                                            setValues({ ...values, confirmer_email: e.target.value })
                                        }
                                        required
                                    />
                                    <InputError message={errors.confirmer_email} />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Used only to show the confirmation source to reviewers, not published.
                                    </p>
                                </div>

                                {skills.length > 0 && (
                                    <div>
                                        <Label>
                                            Optionally, confirm the skills you saw {alumni.first_name} demonstrate at
                                            work
                                        </Label>
                                        <p className="text-xs text-muted-foreground mt-1 mb-2">
                                            Any skills you check will be marked "verified by employer" — the strongest
                                            signal on their profile.
                                        </p>
                                        <div className="grid gap-2 md:grid-cols-2 border rounded-md p-3">
                                            {skills.map((s) => (
                                                <label
                                                    key={s.id}
                                                    className="flex items-center gap-2 text-sm cursor-pointer"
                                                >
                                                    <Checkbox
                                                        checked={selectedSkills.includes(s.id)}
                                                        onCheckedChange={() => toggleSkill(s.id)}
                                                    />
                                                    {s.name}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <Label>Anything else? (optional)</Label>
                                    <Textarea
                                        rows={3}
                                        value={values.confirmer_notes}
                                        onChange={(e) =>
                                            setValues({ ...values, confirmer_notes: e.target.value })
                                        }
                                        placeholder="Notes for the CI Kenya team about this employee"
                                    />
                                </div>

                                <Alert>
                                    <AlertDescription className="text-xs">
                                        Confirming will publicly mark this employment as verified on{' '}
                                        {alumni.first_name}'s profile. Your name and role will be shown; your email
                                        will not.
                                    </AlertDescription>
                                </Alert>

                                <div className="flex justify-end">
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Confirming…' : 'Confirm employment'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
