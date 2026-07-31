import { FormEvent, useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { Award, CheckCircle2, Clock, FileUp, Play, Upload, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import Heading from '@/components/heading';

interface CertificateRequest {
    id: number;
    status: string;
    reviewer_notes: string | null;
    created_at: string;
    reviewed_at: string | null;
}

interface QuizPath {
    assessment_id: number;
    title: string;
    description: string | null;
    question_count: number;
    pass_threshold: number;
    time_limit_minutes: number | null;
    latest_attempt: {
        id: number;
        score: number | null;
        max_score: number | null;
        passed: boolean;
        submitted_at: string | null;
    } | null;
    cooldown_until: string | null;
}

interface SkillItem {
    id: number;
    name: string;
    category: string | null;
    verified: boolean;
    verified_via: string | null;
    verified_at: string | null;
    quiz_path: QuizPath | null;
    is_regulated?: boolean;
    certificate_requests: CertificateRequest[];
}

interface Props {
    skills: SkillItem[];
    summary: {
        total: number;
        verified: number;
        quiz_available: number;
        cert_pending: number;
    };
}

interface FlashProps {
    flash?: { error?: string; success?: string };
    [key: string]: any;
}

function CertUploadDialog({
    skill,
    open,
    onOpenChange,
}: {
    skill: SkillItem;
    open: boolean;
    onOpenChange: (v: boolean) => void;
}) {
    const [file, setFile] = useState<File | null>(null);
    const [notes, setNotes] = useState('');
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (!file) return;
        setProcessing(true);
        setError(null);
        router.post(
            '/skill-certificates',
            { skill_id: skill.id, evidence: file, alumni_notes: notes },
            {
                forceFormData: true,
                onSuccess: () => {
                    onOpenChange(false);
                    setFile(null);
                    setNotes('');
                },
                onError: (errs: any) => setError(errs.evidence ?? errs.skill_id ?? 'Upload failed.'),
                onFinish: () => setProcessing(false),
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Verify {skill.name} with a certificate</DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                        Upload a training certificate, licence, or qualification document (PDF or photo, max 5 MB).
                        Staff will review it and mark the skill verified.
                    </p>
                    <div>
                        <Label>Certificate file *</Label>
                        <Input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                            required
                        />
                        {error && <p className="text-sm text-destructive mt-1">{error}</p>}
                    </div>
                    <div>
                        <Label>Notes (optional)</Label>
                        <Textarea
                            rows={2}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="e.g. Issued by Nyeri TTI, 2020"
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!file || processing}>
                            <FileUp className="mr-1 h-4 w-4" />
                            {processing ? 'Uploading…' : 'Submit for review'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function SkillCard({ skill }: { skill: SkillItem }) {
    const [certOpen, setCertOpen] = useState(false);

    const quiz = skill.quiz_path;
    const hasQuiz = !!(quiz && quiz.question_count > 0);
    const pendingCert = skill.certificate_requests.find((r) => r.status === 'pending');
    const lastRejectedCert = skill.certificate_requests.find((r) => r.status === 'rejected');

    const startQuiz = () => {
        if (!hasQuiz) return;
        router.post(`/assessments/${quiz!.assessment_id}/start`);
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <CardTitle className="text-base flex items-center gap-2">
                            {skill.name}
                            {skill.verified && (
                                <Badge className="bg-emerald-600 hover:bg-emerald-700 gap-1">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Verified via {skill.verified_via}
                                </Badge>
                            )}
                        </CardTitle>
                        {skill.category && (
                            <div className="text-xs text-muted-foreground mt-1">{skill.category}</div>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {skill.verified ? (
                    <div className="text-sm text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        Employers see this skill with a verified badge.
                    </div>
                ) : (
                    <>
                        <div className="text-sm text-muted-foreground">
                            Not verified yet. Choose one of the paths below to prove this skill.
                        </div>

                        {skill.is_regulated && (
                            <div className="rounded-md border border-amber-500/40 bg-amber-500/5 p-3 text-sm text-amber-900 dark:text-amber-200">
                                <strong>{skill.name}</strong> is a regulated profession — verification requires a formal certificate from your training institution (e.g. KMTC, TSC) or professional body. Self-assessment paths are disabled for this skill.
                            </div>
                        )}
                        <div className={`grid gap-3 sm:grid-cols-2 ${hasQuiz && !skill.is_regulated ? 'lg:grid-cols-4' : skill.is_regulated ? 'lg:grid-cols-1' : 'lg:grid-cols-3'}`}>
                            {!skill.is_regulated && (
                                <>
                            {/* Practical path — AI-generated written task */}
                            <div className="border rounded-md p-3 space-y-2">
                                <div className="text-sm font-medium">Written practical</div>
                                <p className="text-xs text-muted-foreground">
                                    AI-generated Kenya-context task. Type a 200-word response in 15 min.
                                    Focused sitting. Staff-reviewed.
                                </p>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => router.post(`/practical-assessments/${skill.id}/start`)}
                                    className="w-full"
                                >
                                    <Play className="mr-1 h-4 w-4" />
                                    Start written
                                </Button>
                            </div>

                            {/* Video demo path — no typing required */}
                            <div className="border rounded-md p-3 space-y-2">
                                <div className="text-sm font-medium">Video demo</div>
                                <p className="text-xs text-muted-foreground">
                                    Show us on camera. Record 60 sec here or upload from your phone.
                                    Best for hands-on skills. Staff-reviewed.
                                </p>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => router.post(`/practical-assessments/${skill.id}/start-video`)}
                                    className="w-full"
                                >
                                    <Play className="mr-1 h-4 w-4" />
                                    Record demo
                                </Button>
                            </div>
                                </>
                            )}

                            {/* Quiz path — only shown when a pre-authored quiz exists and skill is not regulated */}
                            {hasQuiz && !skill.is_regulated && (
                                <div className="border rounded-md p-3 space-y-2">
                                    <div className="text-sm font-medium">Take an assessment</div>
                                    <p className="text-xs text-muted-foreground">
                                        {quiz!.question_count} questions · Pass ≥ {quiz!.pass_threshold}%
                                        {quiz!.time_limit_minutes ? ` · ${quiz!.time_limit_minutes} min` : ''}
                                    </p>
                                    {quiz!.latest_attempt && (
                                        <div className="text-xs">
                                            Last attempt:{' '}
                                            {quiz!.latest_attempt.passed ? (
                                                <span className="text-emerald-700 dark:text-emerald-400">
                                                    Passed ({quiz!.latest_attempt.score}/{quiz!.latest_attempt.max_score})
                                                </span>
                                            ) : (
                                                <span className="text-red-600 dark:text-red-400">
                                                    <XCircle className="inline h-3 w-3" /> Failed ({quiz!.latest_attempt.score}/{quiz!.latest_attempt.max_score})
                                                </span>
                                            )}
                                        </div>
                                    )}
                                    {quiz!.cooldown_until ? (
                                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Clock className="h-3 w-3" /> Retry after {new Date(quiz!.cooldown_until).toLocaleDateString()}
                                        </div>
                                    ) : (
                                        <Button size="sm" onClick={startQuiz} className="w-full">
                                            <Play className="mr-1 h-4 w-4" />
                                            {quiz!.latest_attempt ? 'Retry' : 'Start'}
                                        </Button>
                                    )}
                                </div>
                            )}

                            {/* Certificate path */}
                            <div className="border rounded-md p-3 space-y-2">
                                <div className="text-sm font-medium">Upload a certificate</div>
                                <p className="text-xs text-muted-foreground">
                                    A training certificate, licence, or qualification document.
                                </p>
                                {pendingCert ? (
                                    <div className="text-xs bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded p-2">
                                        <Clock className="inline h-3 w-3 mr-1" />
                                        Pending staff review (submitted{' '}
                                        {new Date(pendingCert.created_at).toLocaleDateString()})
                                    </div>
                                ) : (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setCertOpen(true)}
                                        className="w-full"
                                    >
                                        <Upload className="mr-1 h-4 w-4" />
                                        Upload certificate
                                    </Button>
                                )}
                                {lastRejectedCert?.reviewer_notes && (
                                    <div className="text-xs text-red-600 dark:text-red-400">
                                        Previous rejected: {lastRejectedCert.reviewer_notes}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
            <CertUploadDialog skill={skill} open={certOpen} onOpenChange={setCertOpen} />
        </Card>
    );
}

export default function AssessmentsIndex({ skills, summary }: Props) {
    const { flash } = usePage<FlashProps>().props;

    return (
        <>
            <Head title="Verify my skills" />
            <div className="flex flex-col gap-4 p-4 max-w-3xl">
                <Heading
                    title="Verify my skills"
                    description="Prove your skills to employers so they trust your profile. Each skill can be verified through an assessment, a certificate upload, or (later) a confirmation from a past employer."
                />

                {flash?.error && (
                    <Alert variant="destructive">
                        <AlertDescription>{flash.error}</AlertDescription>
                    </Alert>
                )}
                {flash?.success && (
                    <Alert>
                        <AlertDescription>{flash.success}</AlertDescription>
                    </Alert>
                )}

                <div className="grid grid-cols-3 gap-3">
                    <Card>
                        <CardContent className="p-3 text-center">
                            <div className="text-2xl font-semibold">{summary.verified}</div>
                            <div className="text-xs text-muted-foreground">of {summary.total} verified</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-3 text-center">
                            <div className="text-2xl font-semibold">{summary.quiz_available}</div>
                            <div className="text-xs text-muted-foreground">have a quiz available</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-3 text-center">
                            <div className="text-2xl font-semibold">{summary.cert_pending}</div>
                            <div className="text-xs text-muted-foreground">certificates pending</div>
                        </CardContent>
                    </Card>
                </div>

                {skills.length === 0 ? (
                    <Card>
                        <CardContent className="py-8 text-center text-muted-foreground">
                            You haven't tagged any skills yet. Head to{' '}
                            <a href="/my-profile" className="underline">
                                My profile
                            </a>{' '}
                            to add them, then come back to verify.
                        </CardContent>
                    </Card>
                ) : (
                    skills.map((s) => <SkillCard key={s.id} skill={s} />)
                )}
            </div>
        </>
    );
}

AssessmentsIndex.layout = {
    breadcrumbs: [
        { title: 'My profile', href: '/my-profile' },
        { title: 'Verify my skills', href: '/assessments' },
    ],
};
