import { FormEvent, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Check, ClipboardCheck, Settings, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Heading from '@/components/heading';

interface QueueItem {
    id: number;
    submitted_at: string;
    task_prompt: string;
    submission_caption: string | null;
    video_stream_url: string;
    alumni: {
        first_name: string;
        last_name: string;
        ci_project: string | null;
    };
    skill: {
        name: string;
        category: string | null;
    };
}

interface Props {
    reviewer: {
        name: string;
        organisation: string | null;
        reviewer_categories: string[];
        review_count: number;
    };
    all_categories: string[];
    queue: QueueItem[];
}

export default function MyReviews({ reviewer, all_categories, queue }: Props) {
    const [setupOpen, setSetupOpen] = useState(reviewer.reviewer_categories.length === 0);
    const [organisation, setOrganisation] = useState(reviewer.organisation ?? '');
    const [selected, setSelected] = useState<string[]>(reviewer.reviewer_categories);
    const [notes, setNotes] = useState<Record<number, string>>({});
    const [savingSetup, setSavingSetup] = useState(false);

    const toggle = (cat: string) => {
        setSelected((s) => (s.includes(cat) ? s.filter((c) => c !== cat) : [...s, cat]));
    };

    const saveSetup = (e: FormEvent) => {
        e.preventDefault();
        setSavingSetup(true);
        router.patch(
            '/my-reviews/categories',
            { reviewer_categories: selected, organisation },
            {
                preserveScroll: true,
                onFinish: () => {
                    setSavingSetup(false);
                    setSetupOpen(false);
                },
            },
        );
    };

    const decide = (id: number, decision: 'approved' | 'rejected') => {
        const note = notes[id] ?? '';
        if (decision === 'rejected' && note.trim().length < 5) {
            alert('Add a short note explaining the rejection.');
            return;
        }
        router.post(
            `/my-reviews/${id}/decide`,
            { decision, reviewer_notes: note || null },
            { preserveScroll: true },
        );
    };

    return (
        <>
            <Head title="My reviews" />
            <div className="flex flex-col gap-4 p-4 max-w-4xl">
                <div className="flex items-start justify-between gap-4">
                    <Heading
                        title="My reviews"
                        description={`${queue.length} pending submission${queue.length === 1 ? '' : 's'} in your categories · ${reviewer.review_count} reviewed to date`}
                    />
                    <Button variant="outline" size="sm" onClick={() => setSetupOpen((o) => !o)}>
                        <Settings className="mr-1 h-4 w-4" />
                        {setupOpen ? 'Hide setup' : 'Setup'}
                    </Button>
                </div>

                {setupOpen && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Your review categories</CardTitle>
                            <p className="text-xs text-muted-foreground">
                                Pick the skill categories you can competently judge. You&apos;ll only see video submissions in these categories.
                            </p>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={saveSetup} className="space-y-4">
                                <div>
                                    <Label>Organisation (shown on your reviews)</Label>
                                    <Input
                                        value={organisation}
                                        onChange={(e) => setOrganisation(e.target.value)}
                                        placeholder="e.g. Safaricom, Nakuru Motors, Freelance"
                                    />
                                </div>
                                <div>
                                    <Label>Skill categories I can review</Label>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {all_categories.map((c) => (
                                            <button
                                                type="button"
                                                key={c}
                                                onClick={() => toggle(c)}
                                                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ring-1 transition ${
                                                    selected.includes(c)
                                                        ? 'bg-emerald-600 text-white ring-emerald-600'
                                                        : 'bg-white/5 text-muted-foreground ring-border hover:ring-emerald-500'
                                                }`}
                                            >
                                                {selected.includes(c) && <Check className="h-3 w-3" />}
                                                {c}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <Button type="submit" disabled={savingSetup}>
                                    {savingSetup ? 'Saving…' : 'Save categories'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {reviewer.reviewer_categories.length === 0 ? (
                    <Card>
                        <CardContent className="py-8 text-center text-muted-foreground">
                            Pick your review categories in Setup to start seeing submissions.
                        </CardContent>
                    </Card>
                ) : queue.length === 0 ? (
                    <Card>
                        <CardContent className="py-8 text-center text-muted-foreground">
                            <ClipboardCheck className="h-8 w-8 mx-auto mb-2 opacity-40" />
                            No pending video reviews in your categories. Check back later.
                        </CardContent>
                    </Card>
                ) : (
                    queue.map((item) => (
                        <Card key={item.id}>
                            <CardHeader>
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <CardTitle className="text-base">
                                            {item.alumni.first_name} {item.alumni.last_name} — {item.skill.name}
                                        </CardTitle>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {item.alumni.ci_project ?? '—'} · submitted{' '}
                                            {new Date(item.submitted_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    {item.skill.category && <Badge variant="secondary">{item.skill.category}</Badge>}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <details>
                                    <summary className="cursor-pointer text-xs font-semibold text-muted-foreground">
                                        Task prompt
                                    </summary>
                                    <div className="mt-2 whitespace-pre-wrap text-xs bg-muted/40 p-3 rounded">
                                        {item.task_prompt}
                                    </div>
                                </details>
                                <div>
                                    <div className="text-xs font-semibold text-muted-foreground mb-1">Video submission</div>
                                    <video controls src={item.video_stream_url} className="w-full max-h-96 rounded bg-black" />
                                    {item.submission_caption && (
                                        <div className="text-xs text-muted-foreground italic mt-1">
                                            "{item.submission_caption}"
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2 border-t pt-3">
                                    <Textarea
                                        value={notes[item.id] ?? ''}
                                        onChange={(e) => setNotes({ ...notes, [item.id]: e.target.value })}
                                        placeholder="Reviewer notes (required for rejection)"
                                        rows={2}
                                    />
                                    <div className="flex gap-2 justify-end">
                                        <Button variant="outline" size="sm" onClick={() => decide(item.id, 'rejected')}>
                                            <X className="mr-1 h-4 w-4" /> Reject
                                        </Button>
                                        <Button size="sm" onClick={() => decide(item.id, 'approved')}>
                                            <Check className="mr-1 h-4 w-4" /> Approve & verify
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </>
    );
}

MyReviews.layout = {
    breadcrumbs: [{ title: 'My reviews', href: '/my-reviews' }],
};
