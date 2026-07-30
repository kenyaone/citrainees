import { FormEvent, useRef, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, Check, Copy, Mail, MessageCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Heading from '@/components/heading';
import { dashboard } from '@/routes';

interface Props {
    alumni: {
        id: number;
        first_name: string;
        last_name: string;
        email_secondary: string | null;
        signup_token_expires_at: string | null;
    };
    signup_url: string;
    wa_href: string;
    invite_message: string;
    mail_configured: boolean;
}

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);
    return (
        <Button
            variant="outline"
            size="sm"
            onClick={async () => {
                await navigator.clipboard.writeText(text);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
            }}
        >
            {copied ? <Check className="mr-1 h-4 w-4" /> : <Copy className="mr-1 h-4 w-4" />}
            {copied ? 'Copied' : 'Copy'}
        </Button>
    );
}

export default function AlumniInvite({ alumni, signup_url, wa_href, invite_message, mail_configured }: Props) {
    const [email, setEmail] = useState(alumni.email_secondary ?? '');
    const [sending, setSending] = useState(false);
    const qrRef = useRef<SVGSVGElement>(null);

    const downloadQr = () => {
        if (!qrRef.current) return;
        const svg = qrRef.current.outerHTML;
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `signup-${alumni.first_name}-${alumni.last_name}.svg`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const regenerate = () => {
        if (confirm('Generate a new link? The current one will stop working.')) {
            router.post(`/alumni/${alumni.id}/invite/regenerate`, {}, { preserveScroll: true });
        }
    };

    const sendEmail = (e: FormEvent) => {
        e.preventDefault();
        setSending(true);
        router.post(
            `/alumni/${alumni.id}/invite/email`,
            { email },
            {
                preserveScroll: true,
                onFinish: () => setSending(false),
            },
        );
    };

    const expiresAt = alumni.signup_token_expires_at
        ? new Date(alumni.signup_token_expires_at).toLocaleDateString()
        : null;

    return (
        <>
            <Head title={`Invite ${alumni.first_name}`} />
            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-start justify-between">
                    <Heading
                        title={`Invite ${alumni.first_name} ${alumni.last_name}`}
                        description={
                            expiresAt
                                ? `One-time signup link. Expires ${expiresAt}.`
                                : 'One-time signup link.'
                        }
                    />
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/alumni/${alumni.id}`}>
                            <ArrowLeft className="mr-1 h-4 w-4" />
                            Back
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Signup link</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex gap-2">
                            <Input readOnly value={signup_url} className="font-mono text-xs" />
                            <CopyButton text={signup_url} />
                            <Button variant="ghost" size="sm" onClick={regenerate}>
                                <RefreshCw className="mr-1 h-4 w-4" />
                                Regenerate
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Anyone with this link can create an account for {alumni.first_name}. Only share with the
                            alumnus themselves.
                        </p>
                    </CardContent>
                </Card>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MessageCircle className="h-5 w-5" />
                                Share on WhatsApp
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                                Opens WhatsApp on your phone with the invite pre-filled. Pick a contact and send.
                            </p>
                            <Button asChild className="w-full">
                                <a href={wa_href} target="_blank" rel="noopener noreferrer">
                                    Open WhatsApp
                                </a>
                            </Button>
                            <details className="text-xs">
                                <summary className="cursor-pointer text-muted-foreground">Preview message</summary>
                                <pre className="mt-2 whitespace-pre-wrap bg-muted p-2 rounded text-xs">
                                    {invite_message}
                                </pre>
                            </details>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Mail className="h-5 w-5" />
                                Email
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {!mail_configured && (
                                <Alert>
                                    <AlertDescription className="text-xs">
                                        Mail not configured in .env. Set MAIL_MAILER + MAIL_FROM_ADDRESS to enable.
                                    </AlertDescription>
                                </Alert>
                            )}
                            <form onSubmit={sendEmail} className="space-y-2">
                                <Label className="text-xs">Send to</Label>
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="alumnus@example.com"
                                    required
                                />
                                <Button type="submit" className="w-full" disabled={sending}>
                                    {sending ? 'Sending…' : 'Send invitation'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>QR code</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                                Print for alumni gatherings. Scan opens the signup link.
                            </p>
                            <div className="flex justify-center bg-white p-4 rounded">
                                <QRCodeSVG ref={qrRef} value={signup_url} size={160} level="M" />
                            </div>
                            <Button variant="outline" className="w-full" onClick={downloadQr}>
                                Download SVG
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

AlumniInvite.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Alumni', href: '/alumni' },
        { title: 'Invite', href: '#' },
    ],
};
