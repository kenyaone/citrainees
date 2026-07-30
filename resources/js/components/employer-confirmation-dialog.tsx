import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Check, Copy, MessageCircle, RefreshCw, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { EmploymentRecord } from '@/types/tracer';

interface Props {
    record: EmploymentRecord;
    tokenIssueUrl: string;
    tokenRegenerateUrl: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    alumniFirstName: string;
}

export default function EmployerConfirmationDialog({
    record,
    tokenIssueUrl,
    tokenRegenerateUrl,
    open,
    onOpenChange,
    alumniFirstName,
}: Props) {
    const [copied, setCopied] = useState(false);
    const [issuing, setIssuing] = useState(false);

    const confirmationUrl = record.confirmation_token
        ? `${window.location.origin}/confirm-employment/${record.confirmation_token}`
        : null;

    const message = confirmationUrl
        ? `Hi, ${alumniFirstName} listed working with you at ${record.employer_name} as ${record.role_title} on the Compassion International Kenya alumni platform. Could you take 30 seconds to confirm? ${confirmationUrl}`
        : '';

    const waHref = `https://wa.me/?text=${encodeURIComponent(message)}`;

    const issue = () => {
        setIssuing(true);
        router.post(tokenIssueUrl, {}, {
            preserveScroll: true,
            onFinish: () => setIssuing(false),
        });
    };

    const regenerate = () => {
        if (!confirm('Generate a new link? The current one will stop working.')) return;
        setIssuing(true);
        router.post(tokenRegenerateUrl, {}, {
            preserveScroll: true,
            onFinish: () => setIssuing(false),
        });
    };

    const copy = async () => {
        if (!confirmationUrl) return;
        await navigator.clipboard.writeText(confirmationUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5" />
                        Request employer confirmation
                    </DialogTitle>
                </DialogHeader>

                {record.confirmed_at ? (
                    <Alert>
                        <AlertDescription>
                            Already confirmed by <span className="font-medium">{record.confirmer_name}</span>
                            {record.confirmer_role && ` (${record.confirmer_role})`} on{' '}
                            {new Date(record.confirmed_at).toLocaleDateString()}.
                        </AlertDescription>
                    </Alert>
                ) : (
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Send this link to someone at {record.employer_name} — an HR contact, your former manager,
                            or the business owner. When they confirm, this employment shows as{' '}
                            <span className="font-medium">verified by employer</span> on your profile — the strongest
                            trust signal.
                        </p>

                        {confirmationUrl ? (
                            <>
                                <div>
                                    <label className="text-xs text-muted-foreground">Confirmation link</label>
                                    <div className="flex gap-2 mt-1">
                                        <Input readOnly value={confirmationUrl} className="font-mono text-xs" />
                                        <Button variant="outline" size="sm" onClick={copy}>
                                            {copied ? (
                                                <Check className="mr-1 h-4 w-4" />
                                            ) : (
                                                <Copy className="mr-1 h-4 w-4" />
                                            )}
                                            {copied ? 'Copied' : 'Copy'}
                                        </Button>
                                    </div>
                                    {record.confirmation_token_expires_at && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Expires{' '}
                                            {new Date(
                                                record.confirmation_token_expires_at,
                                            ).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    <Button asChild className="flex-1">
                                        <a href={waHref} target="_blank" rel="noopener noreferrer">
                                            <MessageCircle className="mr-1 h-4 w-4" />
                                            Share on WhatsApp
                                        </a>
                                    </Button>
                                    <Button variant="outline" onClick={regenerate} disabled={issuing}>
                                        <RefreshCw className="mr-1 h-4 w-4" />
                                        Regenerate
                                    </Button>
                                </div>

                                <details className="text-xs">
                                    <summary className="cursor-pointer text-muted-foreground">
                                        Preview message
                                    </summary>
                                    <pre className="mt-2 whitespace-pre-wrap bg-muted p-2 rounded">{message}</pre>
                                </details>
                            </>
                        ) : (
                            <Button onClick={issue} className="w-full" disabled={issuing}>
                                {issuing ? 'Generating…' : 'Generate confirmation link'}
                            </Button>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
