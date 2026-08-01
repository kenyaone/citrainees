import { FormEvent, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Check, Copy, Mail, MessageCircle, RefreshCw, Trash2, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { dashboard } from '@/routes';

interface StaffMember {
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: string;
    email_verified_at: string | null;
}

interface PendingInvite {
    id: number;
    email: string;
    phone: string | null;
    name: string;
    role: string;
    expires_at: string;
    expired: boolean;
    invited_by: string | null;
    signup_url: string;
}

interface Props {
    staff: StaffMember[];
    pending_invites: PendingInvite[];
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
            {copied ? 'Copied' : 'Copy link'}
        </Button>
    );
}

export default function StaffIndex({ staff, pending_invites }: Props) {
    const [values, setValues] = useState({ email: '', phone: '', name: '', role: 'staff', send_email: true });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const invite = (e: FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        router.post('/staff', values, {
            preserveScroll: true,
            onError: (errs) => setErrors(errs as Record<string, string>),
            onSuccess: () => {
                setValues({ email: '', phone: '', name: '', role: 'staff', send_email: true });
                setErrors({});
            },
            onFinish: () => setProcessing(false),
        });
    };

    const regenerate = (id: number) => {
        if (confirm('Generate a fresh signup link? The current one stops working.')) {
            router.post(`/staff/invitations/${id}/regenerate`, {}, { preserveScroll: true });
        }
    };

    const resendEmail = (id: number) => {
        router.post(`/staff/invitations/${id}/resend`, {}, { preserveScroll: true });
    };

    const revoke = (id: number) => {
        if (confirm('Revoke this invitation? The link stops working immediately.')) {
            router.delete(`/staff/invitations/${id}`, { preserveScroll: true });
        }
    };

    const waLink = (invite: PendingInvite) => {
        const msg = `Hello ${invite.name}, you've been invited to CI Trainees as ${invite.role}. Complete signup: ${invite.signup_url}`;
        // If we have a phone, open the exact chat; otherwise show contact picker.
        const base = invite.phone ? `https://wa.me/${invite.phone}` : 'https://wa.me/';
        return `${base}?text=${encodeURIComponent(msg)}`;
    };

    return (
        <>
            <Head title="Staff" />
            <div className="flex flex-col gap-6 p-4">
                <Heading
                    title="Staff & admins"
                    description="Invite new staff, review pending invitations, and see who has access."
                />

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UserPlus className="h-5 w-5" />
                            Invite a new staff member
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={invite} className="grid md:grid-cols-5 gap-3">
                            <div>
                                <Label>Name</Label>
                                <Input
                                    value={values.name}
                                    onChange={(e) => setValues({ ...values, name: e.target.value })}
                                    placeholder="Full name"
                                    required
                                />
                                <InputError message={errors.name} />
                            </div>
                            <div>
                                <Label>Email</Label>
                                <Input
                                    type="email"
                                    value={values.email}
                                    onChange={(e) => setValues({ ...values, email: e.target.value })}
                                    placeholder="name@ariseci.org"
                                    required
                                />
                                <InputError message={errors.email} />
                            </div>
                            <div>
                                <Label>Phone (WhatsApp)</Label>
                                <Input
                                    type="tel"
                                    value={values.phone}
                                    onChange={(e) => setValues({ ...values, phone: e.target.value })}
                                    placeholder="0712345678"
                                />
                                <InputError message={errors.phone} />
                            </div>
                            <div>
                                <Label>Role</Label>
                                <Select
                                    value={values.role}
                                    onValueChange={(v) => setValues({ ...values, role: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="staff">Staff</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="employer">Employer / Reviewer</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.role} />
                            </div>
                            <div className="flex flex-col justify-end">
                                <label className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                    <input
                                        type="checkbox"
                                        checked={values.send_email}
                                        onChange={(e) => setValues({ ...values, send_email: e.target.checked })}
                                    />
                                    Auto-send email
                                </label>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Creating…' : 'Send invitation'}
                                </Button>
                            </div>
                        </form>
                        <p className="text-xs text-muted-foreground mt-3">
                            Admins can invite other staff and admins. Staff can review verifications and manage alumni but can&apos;t invite others.
                        </p>
                    </CardContent>
                </Card>

                {pending_invites.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Pending invitations ({pending_invites.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Expires</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pending_invites.map((i) => (
                                        <>
                                            <TableRow key={i.id}>
                                                <TableCell className="font-medium">{i.name}</TableCell>
                                                <TableCell className="text-sm">{i.email}</TableCell>
                                                <TableCell>
                                                    <Badge variant={i.role === 'admin' ? 'default' : 'secondary'}>
                                                        {i.role}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {i.expired ? (
                                                        <Badge variant="destructive">Expired</Badge>
                                                    ) : (
                                                        <span className="text-sm text-muted-foreground">
                                                            {new Date(i.expires_at).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => resendEmail(i.id)}
                                                            title="Re-send email"
                                                        >
                                                            <Mail className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => regenerate(i.id)}
                                                            title="Regenerate link"
                                                        >
                                                            <RefreshCw className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => revoke(i.id)}
                                                            title="Revoke"
                                                        >
                                                            <Trash2 className="h-4 w-4 text-red-500" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                            <TableRow key={`${i.id}-actions`} className="bg-muted/40 hover:bg-muted/50">
                                                <TableCell colSpan={5} className="py-2">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <Input
                                                            readOnly
                                                            value={i.signup_url}
                                                            className="font-mono text-xs bg-white"
                                                        />
                                                        <CopyButton text={i.signup_url} />
                                                        <Button variant="outline" size="sm" asChild>
                                                            <a
                                                                href={waLink(i)}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                            >
                                                                <MessageCircle className="mr-1 h-4 w-4" />
                                                                WhatsApp
                                                            </a>
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        </>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Active staff ({staff.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Joined</TableHead>
                                    <TableHead>Email verified</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {staff.map((s) => (
                                    <TableRow key={s.id}>
                                        <TableCell className="font-medium">{s.name}</TableCell>
                                        <TableCell className="text-sm">{s.email}</TableCell>
                                        <TableCell>
                                            <Badge variant={s.role === 'admin' ? 'default' : 'secondary'}>
                                                {s.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {new Date(s.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            {s.email_verified_at ? (
                                                <Check className="h-4 w-4 text-emerald-500" />
                                            ) : (
                                                <span className="text-xs text-muted-foreground">no</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

StaffIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Staff', href: '/staff' },
    ],
};
