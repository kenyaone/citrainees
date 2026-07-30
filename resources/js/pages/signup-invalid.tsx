import { Head, Link } from '@inertiajs/react';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Props {
    reason?: string;
}

export default function SignupInvalid({ reason }: Props) {
    const message =
        reason === 'already_used'
            ? 'This signup link has already been used. If that wasn\'t you, contact your CI project office.'
            : "This signup link is invalid or has expired. Ask your CI project office for a fresh one.";

    return (
        <>
            <Head title="Signup link invalid" />
            <div className="min-h-screen flex items-center justify-center p-6 bg-muted/30">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-orange-600">
                            <AlertCircle className="h-5 w-5" />
                            Link no longer valid
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm">{message}</p>
                        <Button asChild variant="outline">
                            <Link href="/login">Go to login</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
