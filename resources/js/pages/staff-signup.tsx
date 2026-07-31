import { FormEvent, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { ShieldCheck } from 'lucide-react';

interface Props {
    invitation: {
        name: string;
        email: string;
        role: string;
    };
    token: string;
}

export default function StaffSignup({ invitation, token }: Props) {
    const [values, setValues] = useState({ password: '', password_confirmation: '' });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        router.post(`/staff-signup/${token}`, values, {
            onError: (errs) => setErrors(errs as Record<string, string>),
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <>
            <Head title="Set up your staff account" />
            <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 text-white">
                <div className="w-full max-w-md">
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 grid place-items-center">
                            <ShieldCheck className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-semibold">CI Trainees</span>
                    </div>
                    <Card className="bg-white/[0.03] border-white/10 text-white">
                        <CardHeader>
                            <CardTitle className="text-2xl">Welcome, {invitation.name}</CardTitle>
                            <p className="text-sm text-white/60">
                                You&apos;ve been invited to join CI Trainees as{' '}
                                <span className="font-semibold text-white">{invitation.role}</span>.
                                Set a password to activate your account.
                            </p>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-4">
                                <div>
                                    <Label>Email</Label>
                                    <Input value={invitation.email} disabled className="bg-white/5 border-white/10" />
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
                                <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950" disabled={processing}>
                                    {processing ? 'Creating account…' : 'Activate my account'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
