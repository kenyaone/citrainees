import { Head } from '@inertiajs/react';
import { CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function EmploymentConfirmThanks() {
    return (
        <>
            <Head title="Confirmed" />
            <div className="min-h-screen flex items-center justify-center p-6 bg-muted/30">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-8 pb-8 text-center space-y-3">
                        <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-600" />
                        <h1 className="text-xl font-semibold">Thank you</h1>
                        <p className="text-sm text-muted-foreground">
                            You've confirmed this employment. It now shows as verified on the alumnus's profile.
                            Compassion International Kenya is grateful for your time.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
