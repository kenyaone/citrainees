import { FormEvent, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Award, Check, Clock, FileText, Mic, Sparkles, User, X } from 'lucide-react';
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

interface ProfileVerification {
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

interface SkillVerification {
    id: number;
    alumni_id: number;
    skill_id: number;
    method: string;
    evidence_path: string | null;
    evidence_url: string | null;
    evidence_original_name: string | null;
    alumni_notes: string | null;
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
    skill: { id: number; name: string; category: string | null };
    reviewer: { id: number; name: string } | null;
}

type Counts = { pending: number; approved: number; rejected: number };

interface PracticalAttempt {
    id: number;
    alumni_id: number;
    submitted_at: string;
    score: number;
    submission_text: string;
    task_prompt: string;
    ai_feedback: { feedback: Array<{ criterion: string; points: number; note: string }>; summary?: string } | null;
    ai_generated_flag: 'low' | 'medium' | 'high' | null;
    tab_switches: number;
    voice_stream_url: string | null;
    staff_decision: string | null;
    staff_reviewed_at: string | null;
    alumni: {
        id: number;
        first_name: string;
        last_name: string;
        ci_project: { name: string; code: string } | null;
    };
    assessment: {
        skill: { id: number; name: string; category: string | null };
    };
    staff_reviewer: { id: number; name: string } | null;
}

interface Props {
    tab: 'profile' | 'skills' | 'practical';
    items: Paginated<ProfileVerification> | Paginated<SkillVerification> | Paginated<PracticalAttempt>;
    status: string;
    counts: {
        profile: Counts;
        skills: Counts;
        practical: Counts;
    };
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

function RejectForm({
    endpoint,
    onCancel,
    label,
}: {
    endpoint: string;
    onCancel: () => void;
    label: string;
}) {
    const [notes, setNotes] = useState('');
    const [processing, setProcessing] = useState(false);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        router.post(
            endpoint,
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
                placeholder="Reason (visible to the alumnus)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                required
            />
            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" variant="destructive" size="sm" disabled={processing || !notes.trim()}>
                    {processing ? 'Rejecting…' : label}
                </Button>
            </div>
        </form>
    );
}

function ProfileCard({ v }: { v: ProfileVerification }) {
    const [rejecting, setRejecting] = useState(false);
    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between">
                <div>
                    <CardTitle className="text-base">
                        <Link href={`/alumni/${v.alumni.id}`} className="hover:underline">
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
                        {rejecting ? (
                            <RejectForm
                                endpoint={`/verifications/${v.id}/reject`}
                                onCancel={() => setRejecting(false)}
                                label="Reject changes"
                            />
                        ) : (
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" size="sm" onClick={() => setRejecting(true)}>
                                    <X className="mr-1 h-4 w-4" /> Reject
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() =>
                                        router.post(`/verifications/${v.id}/approve`, {}, { preserveScroll: true })
                                    }
                                >
                                    <Check className="mr-1 h-4 w-4" /> Approve
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function SkillCard({ r }: { r: SkillVerification }) {
    const [rejecting, setRejecting] = useState(false);
    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between">
                <div>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Award className="h-4 w-4 text-muted-foreground" />
                        <Link href={`/alumni/${r.alumni.id}`} className="hover:underline">
                            {r.alumni.first_name} {r.alumni.last_name}
                        </Link>
                        <span className="text-muted-foreground">·</span>
                        <span>{r.skill.name}</span>
                    </CardTitle>
                    <div className="text-xs text-muted-foreground mt-1">
                        {r.alumni.ci_project?.name ?? 'No project'} · submitted{' '}
                        {new Date(r.created_at).toLocaleString()}
                    </div>
                </div>
                <Badge
                    variant={
                        r.status === 'pending'
                            ? 'outline'
                            : r.status === 'approved'
                            ? 'default'
                            : 'destructive'
                    }
                >
                    {r.status}
                </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
                {r.evidence_url && (
                    <div className="border rounded-md p-3 bg-muted/30">
                        <a
                            href={r.evidence_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm underline"
                        >
                            <FileText className="h-4 w-4" />
                            {r.evidence_original_name ?? 'View uploaded certificate'}
                        </a>
                        <div className="text-xs text-muted-foreground mt-1">Opens in a new tab</div>
                    </div>
                )}

                {r.alumni_notes && (
                    <div className="text-sm">
                        <span className="font-medium">Alumnus note:</span> {r.alumni_notes}
                    </div>
                )}

                {r.reviewer_notes && (
                    <div className="p-2 rounded bg-muted text-sm">
                        <span className="font-medium">Reviewer note:</span> {r.reviewer_notes}
                        {r.reviewer && (
                            <span className="text-xs text-muted-foreground">
                                {' '}
                                — {r.reviewer.name}
                                {r.reviewed_at ? `, ${new Date(r.reviewed_at).toLocaleString()}` : ''}
                            </span>
                        )}
                    </div>
                )}

                {r.status === 'pending' && (
                    <div>
                        {rejecting ? (
                            <RejectForm
                                endpoint={`/skill-verifications/${r.id}/reject`}
                                onCancel={() => setRejecting(false)}
                                label="Reject certificate"
                            />
                        ) : (
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" size="sm" onClick={() => setRejecting(true)}>
                                    <X className="mr-1 h-4 w-4" /> Reject
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() =>
                                        router.post(
                                            `/skill-verifications/${r.id}/approve`,
                                            {},
                                            { preserveScroll: true },
                                        )
                                    }
                                >
                                    <Check className="mr-1 h-4 w-4" /> Approve & verify
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default function VerificationsIndex({ tab, items, status, counts }: Props) {
    const switchTab = (newTab: 'profile' | 'skills') => {
        router.get(
            '/verifications',
            { tab: newTab, status: 'pending' },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const switchStatus = (s: string) => {
        router.get(
            '/verifications',
            { tab, status: s },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const activeCounts =
        tab === 'skills' ? counts.skills : tab === 'practical' ? counts.practical : counts.profile;
    const total = activeCounts.pending + activeCounts.approved + activeCounts.rejected;

    return (
        <>
            <Head title="Verification queue" />
            <div className="flex flex-col gap-4 p-4">
                <Heading
                    title="Verification queue"
                    description="Review alumni profile edits and certificate uploads. Approved items appear on the public profile."
                />

                <div className="flex gap-2 border-b pb-2">
                    <Button
                        variant={tab === 'profile' ? 'default' : 'ghost'}
                        onClick={() => switchTab('profile')}
                        size="sm"
                    >
                        <User className="mr-1 h-4 w-4" /> Profile edits
                        {counts.profile.pending > 0 && (
                            <Badge variant="secondary" className="ml-2">
                                {counts.profile.pending}
                            </Badge>
                        )}
                    </Button>
                    <Button
                        variant={tab === 'skills' ? 'default' : 'ghost'}
                        onClick={() => switchTab('skills')}
                        size="sm"
                    >
                        <Award className="mr-1 h-4 w-4" /> Skill certificates
                        {counts.skills.pending > 0 && (
                            <Badge variant="secondary" className="ml-2">
                                {counts.skills.pending}
                            </Badge>
                        )}
                    </Button>
                    <Button
                        variant={tab === 'practical' ? 'default' : 'ghost'}
                        onClick={() => switchTab('practical')}
                        size="sm"
                    >
                        <Sparkles className="mr-1 h-4 w-4" /> Practical tasks
                        {counts.practical.pending > 0 && (
                            <Badge variant="secondary" className="ml-2">
                                {counts.practical.pending}
                            </Badge>
                        )}
                    </Button>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant={status === 'pending' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => switchStatus('pending')}
                    >
                        <Clock className="mr-1 h-4 w-4" /> Pending ({activeCounts.pending})
                    </Button>
                    <Button
                        variant={status === 'approved' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => switchStatus('approved')}
                    >
                        <Check className="mr-1 h-4 w-4" /> Approved ({activeCounts.approved})
                    </Button>
                    <Button
                        variant={status === 'rejected' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => switchStatus('rejected')}
                    >
                        <X className="mr-1 h-4 w-4" /> Rejected ({activeCounts.rejected})
                    </Button>
                </div>

                {items.data.length === 0 ? (
                    <Card>
                        <CardContent className="py-8 text-center text-muted-foreground">
                            {total === 0
                                ? 'Nothing here yet.'
                                : `Nothing in this state.`}
                        </CardContent>
                    </Card>
                ) : tab === 'skills' ? (
                    (items.data as SkillVerification[]).map((r) => <SkillCard key={r.id} r={r} />)
                ) : tab === 'practical' ? (
                    (items.data as PracticalAttempt[]).map((a) => <PracticalCard key={a.id} a={a} />)
                ) : (
                    (items.data as ProfileVerification[]).map((v) => <ProfileCard key={v.id} v={v} />)
                )}
            </div>
        </>
    );
}

function PracticalCard({ a }: { a: PracticalAttempt }) {
    const [notes, setNotes] = useState('');
    const [processing, setProcessing] = useState(false);
    const decide = (decision: 'approved' | 'rejected') => {
        if (decision === 'rejected' && notes.trim().length < 5) {
            alert('Add a short reviewer note for rejections.');
            return;
        }
        setProcessing(true);
        router.post(
            `/practical-reviews/${a.id}/decide`,
            { decision, reviewer_notes: notes || null },
            { preserveScroll: true, onFinish: () => setProcessing(false) },
        );
    };
    const flagColor =
        a.ai_generated_flag === 'high'
            ? 'bg-red-500/10 text-red-300 ring-red-500/30'
            : a.ai_generated_flag === 'medium'
              ? 'bg-amber-500/10 text-amber-300 ring-amber-500/30'
              : 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/30';
    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <CardTitle className="text-base">
                            {a.alumni.first_name} {a.alumni.last_name} — {a.assessment.skill.name}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">
                            {a.alumni.ci_project?.name ?? '—'} · submitted{' '}
                            {new Date(a.submitted_at).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge className="text-sm">{a.score}/100</Badge>
                        {a.ai_generated_flag && (
                            <span
                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${flagColor}`}
                                title="AI likelihood assessment"
                            >
                                <Sparkles className="h-3 w-3" />
                                AI risk: {a.ai_generated_flag}
                            </span>
                        )}
                        {a.tab_switches > 0 && (
                            <Badge variant="destructive">Tab switches: {a.tab_switches}</Badge>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
                <details>
                    <summary className="cursor-pointer text-xs font-semibold text-muted-foreground">
                        Task prompt
                    </summary>
                    <div className="mt-2 whitespace-pre-wrap text-xs bg-muted/40 p-3 rounded">
                        {a.task_prompt}
                    </div>
                </details>
                <div>
                    <div className="text-xs font-semibold text-muted-foreground mb-1">Written submission</div>
                    <div className="whitespace-pre-wrap bg-muted/40 p-3 rounded text-sm">
                        {a.submission_text}
                    </div>
                </div>
                {a.ai_feedback?.feedback && (
                    <div>
                        <div className="text-xs font-semibold text-muted-foreground mb-1">AI grading</div>
                        <div className="space-y-1 text-xs">
                            {a.ai_feedback.feedback.map((f, i) => (
                                <div key={i} className="flex gap-2">
                                    <span className="font-semibold w-10 text-right">{f.points}/20</span>
                                    <span className="flex-1">
                                        <span className="font-medium">{f.criterion}:</span> {f.note}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {a.voice_stream_url && (
                    <div>
                        <div className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                            <Mic className="h-3 w-3" />
                            Voice follow-up
                        </div>
                        <audio controls src={a.voice_stream_url} className="w-full" />
                    </div>
                )}
                {a.staff_decision ? (
                    <div className={`p-3 rounded text-xs ${a.staff_decision === 'approved' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-red-500/10 text-red-700 dark:text-red-400'}`}>
                        {a.staff_decision === 'approved' ? 'Approved' : 'Rejected'} by{' '}
                        {a.staff_reviewer?.name ?? '—'} on{' '}
                        {a.staff_reviewed_at && new Date(a.staff_reviewed_at).toLocaleDateString()}
                    </div>
                ) : (
                    <div className="space-y-2 border-t pt-3">
                        <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Reviewer notes (required for rejection)"
                            rows={2}
                        />
                        <div className="flex gap-2 justify-end">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => decide('rejected')}
                                disabled={processing}
                            >
                                <X className="mr-1 h-4 w-4" /> Reject
                            </Button>
                            <Button size="sm" onClick={() => decide('approved')} disabled={processing}>
                                <Check className="mr-1 h-4 w-4" /> Approve &amp; verify
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

VerificationsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Verifications', href: '/verifications' },
    ],
};
