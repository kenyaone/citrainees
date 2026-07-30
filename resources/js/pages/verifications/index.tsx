import { FormEvent, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Check, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import Heading from '@/components/heading';
import type { Paginated } from '@/types/tracer';
import { dashboard } from '@/routes';

interface DiffEntry {
    from: unknown;
    to: unknown;
}

interface Verification {
    id: number;
    alumni_id: number;
    submitted_by: number | null;
    subject_type: string;
    subject_id: number;
    proposed_changes: Record<string, DiffEntry>;
    status: string;
    reviewer_notes: string | null;
    reviewed_by: number | null;
    reviewed_at: string | null;
    created_at: string;
    alumni: {
        id: number;
        first_name: string;
        last_name: string;
        ci_project: { name: string; code: string } | null;
    };
    submitter: { id: number; name: string } | null;
    reviewer: { id: number; name: string } | null;
}

interface Props {
    verifications: Paginated<Verification>;
    status: string;
    counts: { pending: number; approved: number; rejected: number };
}

const FIELD_LABELS: Record<string, string> = {
    phone_primary: 'Phone',
    email_secondary: 'Email',
    current_status: 'Current status',
    bio: 'Bio',
    county: 'County',
    sub_county: 'Sub-county',
    is_public: 'Public directory',
    skill_ids: 'Skills',
};

function formatValue(value: unknown): string {
    if (value === null || value === undefined || value === '') return '—';
    if (Array.isArray(value)) return value.length === 0 ? '(none)' : `${value.length} item(s)`;
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return String(value);
}

function DiffRow({ field, entry }: { field: string; entry: DiffEntry }) {
    return (
        <div className="grid grid-cols-3 gap-2 text-sm py-1.5 border-b last:border-0">
            <div className="text-muted-foreground">{FIELD_LABELS[field] ?? field}</div>
            <div className="text-red-600 dark:text-red-400 line-through decoration-red-600/40">
                {formatValue(entry.from)}
            </div>
            <div className="text-emerald-700 dark:text-emerald-400 font-medium">{formatValue(entry.to)}</div>
        </div>
    );
}

function RejectForm({ verificationId, onCancel }: { verificationId: number; onCancel: () => void }) {
    const [notes, setNotes] = useState('');
    const [processing, setProcessing] = useState(false);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        router.post(
            `/verifications/${verificationId}/reject`,
            { reviewer_notes: notes },
            {
                preserveScroll: true,
                onFinish: () => setProcessing(false),
            },
        );
    };

    return (
        <form onSubmit={submit} className="space-y-2 border-t pt-3">
            <Textarea
                rows={2}
                placeholder="Reason for rejection (visible to the alumnus)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                required
            />
            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" variant="destructive" size="sm" disabled={processing || !notes.trim()}>
                    {processing ? 'Rejecting…' : 'Reject changes'}
                </Button>
            </div>
        </form>
    );
}

export default function VerificationsIndex({ verifications, status, counts }: Props) {
    const [rejectingId, setRejectingId] = useState<number | null>(null);

    const approve = (v: Verification) => {
        router.post(`/verifications/${v.id}/approve`, {}, { preserveScroll: true });
    };

    const switchTab = (s: string) => {
        router.get('/verifications', { status: s }, { preserveState: true, preserveScroll: true, replace: true });
    };

    return (
        <>
            <Head title="Verification queue" />
            <div className="flex flex-col gap-4 p-4">
                <Heading
                    title="Verification queue"
                    description="Alumni self-edits are held here until a staff reviewer approves or rejects them."
                />

                <div className="flex gap-2">
                    <Button
                        variant={status === 'pending' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => switchTab('pending')}
                    >
                        <Clock className="mr-1 h-4 w-4" /> Pending ({counts.pending})
                    </Button>
                    <Button
                        variant={status === 'approved' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => switchTab('approved')}
                    >
                        <Check className="mr-1 h-4 w-4" /> Approved ({counts.approved})
                    </Button>
                    <Button
                        variant={status === 'rejected' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => switchTab('rejected')}
                    >
                        <X className="mr-1 h-4 w-4" /> Rejected ({counts.rejected})
                    </Button>
                </div>

                {verifications.data.length === 0 ? (
                    <Card>
                        <CardContent className="py-8 text-center text-muted-foreground">
                            Nothing here. Alumni haven't submitted changes in this state.
                        </CardContent>
                    </Card>
                ) : (
                    verifications.data.map((v) => (
                        <Card key={v.id}>
                            <CardHeader className="flex flex-row items-start justify-between">
                                <div>
                                    <CardTitle className="text-base">
                                        <Link
                                            href={`/alumni/${v.alumni.id}`}
                                            className="hover:underline"
                                        >
                                            {v.alumni.first_name} {v.alumni.last_name}
                                        </Link>
                                    </CardTitle>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        {v.alumni.ci_project?.name ?? 'No project'} · submitted{' '}
                                        {new Date(v.created_at).toLocaleString()}
                                        {v.submitter ? ` by ${v.submitter.name}` : ''}
                                    </div>
                                </div>
                                <Badge
                                    variant={
                                        v.status === 'pending'
                                            ? 'outline'
                                            : v.status === 'approved'
                                            ? 'default'
                                            : 'destructive'
                                    }
                                >
                                    {v.status}
                                </Badge>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-3 gap-2 text-xs font-semibold text-muted-foreground uppercase pb-1 border-b">
                                    <div>Field</div>
                                    <div>Before</div>
                                    <div>After</div>
                                </div>
                                {Object.entries(v.proposed_changes).map(([field, entry]) => (
                                    <DiffRow key={field} field={field} entry={entry as DiffEntry} />
                                ))}

                                {v.reviewer_notes && (
                                    <div className="mt-3 p-2 rounded bg-muted text-sm">
                                        <span className="font-medium">Reviewer note:</span> {v.reviewer_notes}
                                        {v.reviewer && (
                                            <span className="text-xs text-muted-foreground">
                                                {' '}
                                                — {v.reviewer.name}
                                                {v.reviewed_at ? `, ${new Date(v.reviewed_at).toLocaleString()}` : ''}
                                            </span>
                                        )}
                                    </div>
                                )}

                                {v.status === 'pending' && (
                                    <div className="mt-3">
                                        {rejectingId === v.id ? (
                                            <RejectForm
                                                verificationId={v.id}
                                                onCancel={() => setRejectingId(null)}
                                            />
                                        ) : (
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setRejectingId(v.id)}
                                                >
                                                    <X className="mr-1 h-4 w-4" />
                                                    Reject
                                                </Button>
                                                <Button size="sm" onClick={() => approve(v)}>
                                                    <Check className="mr-1 h-4 w-4" />
                                                    Approve
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </>
    );
}

VerificationsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Verifications', href: '/verifications' },
    ],
};
