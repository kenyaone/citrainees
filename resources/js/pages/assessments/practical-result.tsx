import { useEffect, useRef, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { AlertTriangle, Award, CheckCircle2, Circle, Mic, Play, Square, Trash2, XCircle } from 'lucide-react';

interface FeedbackItem {
    criterion: string;
    points: number;
    note: string;
}

interface RubricItem {
    criterion: string;
    weight: number;
}

interface Props {
    attempt: {
        id: number;
        skill_name: string;
        score: number | null;
        passed: boolean;
        voided_at: string | null;
        voided_reason: string | null;
        submitted_at: string | null;
        submission_text: string | null;
        ai_feedback: { feedback: FeedbackItem[]; summary: string } | null;
        ai_generated_flag: string | null;
        staff_decision: string | null;
        has_voice: boolean;
        task_prompt: string | null;
        rubric: RubricItem[];
        follow_up_question: string | null;
    };
}

export default function PracticalResult({ attempt }: Props) {
    if (attempt.voided_at) {
        return (
            <>
                <Head title="Attempt voided" />
                <div className="min-h-screen bg-slate-950 text-white p-6">
                    <div className="max-w-2xl mx-auto rounded-2xl bg-red-500/10 ring-1 ring-red-500/40 p-8 text-center">
                        <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                        <h1 className="text-2xl font-semibold mb-2">Attempt voided</h1>
                        <p className="text-white/70 mb-4">
                            Reason: {attempt.voided_reason?.replace('_', ' ') ?? 'unknown'}. You can try
                            again after the 7-day cooldown (or if you have attempts remaining).
                        </p>
                        <Link
                            href="/assessments"
                            className="inline-flex rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 text-sm font-semibold"
                        >
                            Back to assessments
                        </Link>
                    </div>
                </div>
            </>
        );
    }

    const passed = attempt.passed;
    const score = attempt.score ?? 0;

    return (
        <>
            <Head title={`Result: ${attempt.skill_name}`} />
            <div className="min-h-screen bg-slate-950 text-white p-6">
                <div className="max-w-3xl mx-auto space-y-6">
                    <div className={`rounded-2xl p-8 ${passed ? 'bg-emerald-500/10 ring-1 ring-emerald-500/40' : 'bg-amber-500/10 ring-1 ring-amber-500/40'}`}>
                        <div className="flex items-start gap-4">
                            {passed ? (
                                <Award className="h-10 w-10 text-emerald-400 flex-shrink-0" />
                            ) : (
                                <AlertTriangle className="h-10 w-10 text-amber-400 flex-shrink-0" />
                            )}
                            <div className="flex-1">
                                <h1 className="text-2xl font-semibold mb-1">
                                    {passed ? 'You passed' : 'Not this time'}
                                </h1>
                                <div className="text-4xl font-bold tabular-nums mb-2">{score}/100</div>
                                <p className="text-sm text-white/70">
                                    {attempt.skill_name} — practical assessment
                                </p>
                                {passed && !attempt.staff_decision && (
                                    <p className="mt-3 text-sm text-white/80">
                                        Now record a 30-second voice confirmation below to finalise your badge.
                                        Staff reviews before publishing.
                                    </p>
                                )}
                                {attempt.staff_decision === 'approved' && (
                                    <p className="mt-3 text-emerald-300 text-sm">
                                        ✓ Staff approved. Your verified badge is live.
                                    </p>
                                )}
                                {attempt.staff_decision === 'rejected' && (
                                    <p className="mt-3 text-red-300 text-sm">
                                        Staff couldn&apos;t verify this submission. Reason may show on your profile.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {passed && !attempt.staff_decision && attempt.follow_up_question && (
                        <VoiceRecorder
                            attemptId={attempt.id}
                            hasVoice={attempt.has_voice}
                            followUpQuestion={attempt.follow_up_question}
                        />
                    )}

                    {attempt.ai_feedback && (
                        <div className="rounded-2xl bg-white/[0.03] ring-1 ring-white/10 p-6">
                            <h2 className="text-lg font-semibold mb-3">AI feedback</h2>
                            {attempt.ai_feedback.summary && (
                                <p className="text-sm text-white/80 mb-4 italic">"{attempt.ai_feedback.summary}"</p>
                            )}
                            <div className="space-y-2">
                                {attempt.ai_feedback.feedback.map((f, i) => (
                                    <div key={i} className="flex items-start gap-3 text-sm">
                                        <div className="w-14 flex-shrink-0 text-right tabular-nums text-emerald-300 font-semibold">
                                            {f.points}/20
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium">{f.criterion}</div>
                                            <div className="text-xs text-white/60 mt-0.5">{f.note}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {attempt.submission_text && (
                        <details className="rounded-2xl bg-white/[0.03] ring-1 ring-white/10 p-6">
                            <summary className="cursor-pointer font-medium text-sm">Your submission</summary>
                            <div className="mt-3 whitespace-pre-wrap text-sm text-white/80">
                                {attempt.submission_text}
                            </div>
                        </details>
                    )}

                    <div className="pt-2">
                        <Link href="/my-profile" className="text-sm text-white/60 hover:text-white">
                            ← Back to my profile
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}

function VoiceRecorder({
    attemptId,
    hasVoice,
    followUpQuestion,
}: {
    attemptId: number;
    hasVoice: boolean;
    followUpQuestion: string;
}) {
    const [state, setState] = useState<'idle' | 'recording' | 'preview' | 'uploading'>(
        hasVoice ? 'preview' : 'idle',
    );
    const [blob, setBlob] = useState<Blob | null>(null);
    const [seconds, setSeconds] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<number | null>(null);

    const start = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            chunksRef.current = [];
            const rec = new MediaRecorder(stream);
            rec.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
            rec.onstop = () => {
                stream.getTracks().forEach((t) => t.stop());
                const b = new Blob(chunksRef.current, { type: 'audio/webm' });
                setBlob(b);
                setState('preview');
            };
            mediaRecorderRef.current = rec;
            rec.start();
            setState('recording');
            setSeconds(0);
            timerRef.current = window.setInterval(() => {
                setSeconds((s) => {
                    if (s + 1 >= 30) {
                        stop();
                        return 30;
                    }
                    return s + 1;
                });
            }, 1000);
        } catch (e) {
            alert('Could not access microphone. Grant permission and try again.');
        }
    };

    const stop = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        mediaRecorderRef.current?.stop();
    };

    const upload = () => {
        if (!blob) return;
        const form = new FormData();
        form.append('voice', blob, 'confirmation.webm');
        setState('uploading');
        router.post(`/practical-attempts/${attemptId}/voice`, form, {
            forceFormData: true,
            preserveScroll: true,
            onFinish: () => setState('preview'),
        });
    };

    const remove = () => {
        if (!confirm('Delete your voice recording? You can record a new one after.')) return;
        router.delete(`/practical-attempts/${attemptId}/voice`, {
            preserveScroll: true,
            onSuccess: () => {
                setBlob(null);
                setState('idle');
            },
        });
    };

    const retake = () => {
        setBlob(null);
        setState('idle');
    };

    return (
        <div className="rounded-2xl bg-emerald-500/5 ring-1 ring-emerald-500/30 p-6">
            <div className="flex items-center gap-2 mb-3">
                <Mic className="h-5 w-5 text-emerald-400" />
                <h2 className="font-semibold">Voice confirmation (30 seconds)</h2>
            </div>
            <div className="rounded-lg bg-white/5 ring-1 ring-white/10 p-3 text-sm text-white/80 mb-4">
                <div className="text-xs uppercase tracking-widest text-emerald-400 mb-1">Question</div>
                {followUpQuestion}
            </div>

            {hasVoice && state === 'preview' && (
                <div className="text-sm text-white/70 mb-3">
                    Voice recording on file. Staff will review shortly.
                </div>
            )}

            {state === 'idle' && (
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={start}
                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 text-sm font-semibold"
                    >
                        <Mic className="h-4 w-4" />
                        Record answer
                    </button>
                    <p className="text-xs text-white/50">
                        Grant microphone access when prompted. Auto-stops at 30 seconds.
                    </p>
                </div>
            )}

            {state === 'recording' && (
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={stop}
                        className="inline-flex items-center gap-2 rounded-lg bg-red-500 hover:bg-red-400 text-white px-4 py-2 text-sm font-semibold animate-pulse"
                    >
                        <Square className="h-4 w-4" />
                        Stop
                    </button>
                    <div className="flex items-center gap-2 text-red-300">
                        <div className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
                        Recording… {seconds}s / 30s
                    </div>
                </div>
            )}

            {state === 'preview' && blob && (
                <div className="space-y-3">
                    <audio controls src={URL.createObjectURL(blob)} className="w-full" />
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={upload}
                            className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 text-sm font-semibold"
                        >
                            Submit voice
                        </button>
                        <button
                            type="button"
                            onClick={retake}
                            className="rounded-lg bg-white/10 hover:bg-white/20 ring-1 ring-white/20 px-4 py-2 text-sm font-semibold"
                        >
                            Retake
                        </button>
                    </div>
                </div>
            )}

            {state === 'preview' && hasVoice && !blob && (
                <button
                    type="button"
                    onClick={remove}
                    className="inline-flex items-center gap-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 ring-1 ring-red-500/30 text-red-300 px-3 py-1.5 text-xs font-semibold"
                >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete recording
                </button>
            )}

            <p className="mt-4 text-xs text-white/40">
                Voice recordings are stored securely and auto-deleted 30 days after staff review.
            </p>
        </div>
    );
}
