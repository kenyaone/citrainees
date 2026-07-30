import { FormEvent, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';

interface Props {
    alumni: {
        first_name: string;
        last_name: string;
        ci_project_name: string | null;
    };
    token: string;
}

export default function Signup({ alumni, token }: Props) {
    const [values, setValues] = useState({
        email: '',
        password: '',
        password_confirmation: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        router.post(`/signup/${token}`, values, {
            onError: (errs) => setErrors(errs as Record<string, string>),
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <>
            <Head title="Set up your account" />
            <div className="min-h-screen flex items-center justify-center p-6 bg-muted/30">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-2xl">Welcome, {alumni.first_name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            You've been invited to the Compassion International Kenya alumni platform
                            {alumni.ci_project_name ? ` (${alumni.ci_project_name})` : ''}. Set your login below.
                        </p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <Label>Email *</Label>
                                <Input
                                    type="email"
                                    value={values.email}
                                    onChange={(e) => setValues({ ...values, email: e.target.value })}
                                    required
                                    autoComplete="email"
                                />
                                <InputError message={errors.email} />
                            </div>
                            <div>
                                <Label>Password *</Label>
                                <Input
                                    type="password"
                                    value={values.password}
                                    onChange={(e) => setValues({ ...values, password: e.target.value })}
                                    required
                                    minLength={8}
                                    autoComplete="new-password"
                                />
                                <InputError message={errors.password} />
                                <p className="text-xs text-muted-foreground mt-1">At least 8 characters.</p>
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
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={processing}>
                                {processing ? 'Creating account…' : 'Create account'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
