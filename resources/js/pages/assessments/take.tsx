import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Heading from '@/components/heading';

interface Question {
    id: number;
    question_text: string;
    options: string[];
}

interface Props {
    attempt: {
        id: number;
        started_at: string;
        deadline_at: string | null;
    };
    assessment: {
        id: number;
        title: string;
        skill_name: string;
        pass_threshold: number;
        time_limit_minutes: number | null;
    };
    questions: Question[];
}

function formatSeconds(sec: number): string {
    if (sec < 0) return '0:00';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
}

export default function TakeAssessment({ attempt, assessment, questions }: Props) {
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [processing, setProcessing] = useState(false);
    const [remaining, setRemaining] = useState<number | null>(null);
    const submittedRef = useRef(false);

    const submit = useCallback(
        (auto = false) => {
            if (submittedRef.current) return;
            submittedRef.current = true;
            setProcessing(true);
            router.post(
                `/attempts/${attempt.id}/submit`,
                { answers },
                {
                    onFinish: () => setProcessing(false),
                    onError: () => {
                        submittedRef.current = false;
                        setProcessing(false);
                        if (auto) {
                            alert('Time is up — submission failed. Please try again.');
                        }
                    },
                },
            );
        },
        [attempt.id, answers],
    );

    useEffect(() => {
        if (!attempt.deadline_at) return;
        const deadline = new Date(attempt.deadline_at).getTime();
        const tick = () => {
            const now = Date.now();
            const secs = Math.max(0, Math.floor((deadline - now) / 1000));
            setRemaining(secs);
            if (secs <= 0 && !submittedRef.current) {
                submit(true);
            }
        };
        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [attempt.deadline_at, submit]);

    const answered = Object.keys(answers).length;
    const total = questions.length;
    const timeWarning = remaining !== null && remaining <= 60;

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (answered < total) {
            if (!confirm(`You've answered ${answered} of ${total} questions. Submit anyway?`)) return;
        }
        submit();
    };

    return (
        <>
            <Head title={assessment.title} />
            <div className="flex flex-col gap-4 p-4 max-w-3xl">
                <div className="flex items-start justify-between gap-4 sticky top-0 z-10 bg-background py-2">
                    <Heading
                        title={assessment.title}
                        description={`${assessment.skill_name} · Pass ≥ ${assessment.pass_threshold}%`}
                    />
                    {remaining !== null && (
                        <div
                            className={`flex items-center gap-2 rounded-lg border px-3 py-2 font-mono text-lg ${
                                timeWarning ? 'border-red-500 text-red-600 dark:text-red-400' : ''
                            }`}
                        >
                            <Clock className="h-4 w-4" />
                            {formatSeconds(remaining)}
                        </div>
                    )}
                </div>

                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Answer all questions and click Submit at the bottom. You have one attempt — if you fail, you can
                        retry after 7 days.
                    </AlertDescription>
                </Alert>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {questions.map((q, i) => (
                        <Card key={q.id}>
                            <CardHeader>
                                <CardTitle className="text-base">
                                    <span className="text-muted-foreground mr-2">{i + 1}.</span>
                                    {q.question_text}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {q.options.map((opt, idx) => (
                                        <label
                                            key={idx}
                                            className={`flex items-start gap-2 p-2 rounded border cursor-pointer hover:bg-muted/50 ${
                                                answers[q.id] === idx ? 'border-primary bg-primary/5' : ''
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name={`q-${q.id}`}
                                                value={idx}
                                                checked={answers[q.id] === idx}
                                                onChange={() => setAnswers({ ...answers, [q.id]: idx })}
                                                className="mt-1"
                                            />
                                            <span className="text-sm">{opt}</span>
                                        </label>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    <div className="sticky bottom-0 flex items-center justify-between bg-background py-3 border-t">
                        <div className="text-sm text-muted-foreground">
                            Answered {answered} of {total}
                        </div>
                        <Button type="submit" size="lg" disabled={processing}>
                            {processing ? 'Submitting…' : 'Submit assessment'}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

TakeAssessment.layout = {
    breadcrumbs: [
        { title: 'Assessments', href: '/assessments' },
        { title: 'Take', href: '#' },
    ],
};
