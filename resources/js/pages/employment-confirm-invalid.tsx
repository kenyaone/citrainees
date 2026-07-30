import { Head } from '@inertiajs/react';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function EmploymentConfirmInvalid() {
    return (
        <>
            <Head title="Link no longer valid" />
            <div className="min-h-screen flex items-center justify-center p-6 bg-muted/30">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-orange-600">
                            <AlertCircle className="h-5 w-5" />
                            Link no longer valid
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm">
                            This confirmation link is invalid, has expired, or has already been used. If you believe
                            this is a mistake, contact the person who shared it with you — they can generate a fresh
                            link.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
