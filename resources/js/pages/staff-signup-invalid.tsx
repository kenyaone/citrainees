import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CircleAlert } from 'lucide-react';

interface Props {
    reason?: string;
}

export default function StaffSignupInvalid({ reason }: Props) {
    const isUsed = reason === 'already_used';
    return (
        <>
            <Head title="Invalid invitation" />
            <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 text-white">
                <Card className="w-full max-w-md bg-white/[0.03] border-white/10 text-white">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-red-500/10 grid place-items-center">
                                <CircleAlert className="h-5 w-5 text-red-400" />
                            </div>
                            <CardTitle>{isUsed ? 'Invitation already used' : 'Invitation invalid or expired'}</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-white/70">
                            {isUsed
                                ? 'This invitation link has already been used to create an account. Sign in to continue.'
                                : 'This signup link is invalid, has expired, or has been revoked. Ask the CI Trainees admin who invited you for a fresh link.'}
                        </p>
                        <Button asChild className="w-full">
                            <Link href="/login">Go to sign in</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
