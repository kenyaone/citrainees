import { FormEvent, useEffect, useRef, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { AlertTriangle, Clock, Send } from 'lucide-react';

interface Props {
    attempt: {
        id: number;
        skill_name: string;
        task_prompt: string;
        deadline_at: string;
        started_at: string;
    };
}

export default function PracticalTake({ attempt }: Props) {
    const [submission, setSubmission] = useState('');
    const [processing, setProcessing] = useState(false);
    const [voidedReason, setVoidedReason] = useState<string | null>(null);
    const [secondsLeft, setSecondsLeft] = useState(() =>
        Math.max(0, Math.floor((new Date(attempt.deadline_at).getTime() - Date.now()) / 1000)),
    );
    const tabSwitchCount = useRef(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const submittedRef = useRef(false);
    const voidedRef = useRef(false);

    const voidAttempt = (reason: string) => {
        if (voidedRef.current || submittedRef.current) return;
        voidedRef.current = true;
        setVoidedReason(reason);
        try {
            navigator.sendBeacon(
                `/practical-attempts/${attempt.id}/void`,
                new Blob(
                    [JSON.stringify({ reason, tab_switches: tabSwitchCount.current })],
                    { type: 'application/json' },
                ),
            );
        } catch {
            // ignore
        }
        setTimeout(() => {
            router.get(`/practical-attempts/${attempt.id}/result`);
        }, 1500);
    };

    useEffect(() => {
        // enter fullscreen on mount
        const el = containerRef.current;
        if (el && document.fullscreenEnabled && !document.fullscreenElement) {
            el.requestFullscreen().catch(() => {
                // some browsers/embed contexts refuse — carry on, still enforce tab-switch
            });
        }

        const onVisibility = () => {
            if (document.visibilityState === 'hidden') {
                tabSwitchCount.current += 1;
                voidAttempt('tab_switch');
            }
        };
        const onFullscreenExit = () => {
            if (!document.fullscreenElement && !submittedRef.current && !voidedRef.current) {
                voidAttempt('fullscreen_exit');
            }
        };
        const onBlur = () => {
            if (document.hasFocus() === false && !submittedRef.current && !voidedRef.current) {
                voidAttempt('blur');
            }
        };
        const onContextMenu = (e: MouseEvent) => e.preventDefault();
        const onCopy = (e: ClipboardEvent) => e.preventDefault();
        const onPaste = (e: ClipboardEvent) => {
            // allow typing but block paste — casual copy from another source
            e.preventDefault();
        };
        const onKeydown = (e: KeyboardEvent) => {
            // block common cheat shortcuts inside the assessment area
            if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'x', 'a', 'p'].includes(e.key.toLowerCase())) {
                e.preventDefault();
            }
        };

        document.addEventListener('visibilitychange', onVisibility);
        document.addEventListener('fullscreenchange', onFullscreenExit);
        window.addEventListener('blur', onBlur);
        document.addEventListener('contextmenu', onContextMenu);
        document.addEventListener('copy', onCopy);
        document.addEventListener('paste', onPaste);
        document.addEventListener('keydown', onKeydown);

        return () => {
            document.removeEventListener('visibilitychange', onVisibility);
            document.removeEventListener('fullscreenchange', onFullscreenExit);
            window.removeEventListener('blur', onBlur);
            document.removeEventListener('contextmenu', onContextMenu);
            document.removeEventListener('copy', onCopy);
            document.removeEventListener('paste', onPaste);
            document.removeEventListener('keydown', onKeydown);
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => {});
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const tick = setInterval(() => {
            const remaining = Math.max(0, Math.floor((new Date(attempt.deadline_at).getTime() - Date.now()) / 1000));
            setSecondsLeft(remaining);
            if (remaining === 0 && !submittedRef.current && !voidedRef.current) {
                voidAttempt('time_expired');
            }
        }, 1000);
        return () => clearInterval(tick);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [attempt.deadline_at]);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (submission.trim().length < 80) return;
        submittedRef.current = true;
        setProcessing(true);
        router.post(
            `/practical-attempts/${attempt.id}/submit`,
            { submission_text: submission, tab_switches: tabSwitchCount.current },
            {
                onError: () => {
                    submittedRef.current = false;
                    setProcessing(false);
                },
            },
        );
    };

    const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
    const ss = String(secondsLeft % 60).padStart(2, '0');
    const timeLow = secondsLeft < 60;

    if (voidedReason) {
        return (
            <>
                <Head title="Attempt ended" />
                <div className="min-h-screen bg-red-950 text-white grid place-items-center p-6">
                    <div className="max-w-md text-center">
                        <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                        <h1 className="text-2xl font-semibold mb-2">Attempt ended</h1>
                        <p className="text-white/70">
                            You {voidedReason === 'tab_switch' && 'switched tabs'}
                            {voidedReason === 'fullscreen_exit' && 'exited fullscreen'}
                            {voidedReason === 'blur' && 'clicked outside the window'}
                            {voidedReason === 'time_expired' && 'ran out of time'}.
                            Practical assessments must be completed in one focused sitting.
                        </p>
                        <p className="text-white/50 text-sm mt-4">Redirecting…</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title={`Practical: ${attempt.skill_name}`} />
            <div ref={containerRef} className="min-h-screen bg-slate-950 text-white select-none">
                <div className="sticky top-0 z-10 border-b border-white/10 bg-slate-950/95 backdrop-blur px-6 py-3 flex items-center justify-between gap-4">
                    <div>
                        <div className="text-xs uppercase tracking-widest text-white/50">Practical assessment</div>
                        <div className="font-semibold">{attempt.skill_name}</div>
                    </div>
                    <div className={`flex items-center gap-2 font-mono text-lg ${timeLow ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                        <Clock className="h-5 w-5" />
                        {mm}:{ss}
                    </div>
                </div>

                <div className="max-w-3xl mx-auto p-6 space-y-6">
                    <div className="rounded-lg bg-amber-500/10 ring-1 ring-amber-500/30 p-3 text-xs text-amber-200 flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <div>
                            <strong>Focused sitting required.</strong> Switching tabs, exiting fullscreen,
                            or losing window focus will void your attempt. Copy, paste, and right-click are disabled.
                            You have 3 lifetime attempts.
                        </div>
                    </div>

                    <div className="rounded-2xl bg-white/[0.04] ring-1 ring-white/10 p-6">
                        <div className="text-xs uppercase tracking-widest text-emerald-400 mb-2">Your task</div>
                        <div className="whitespace-pre-wrap leading-relaxed text-white/90">{attempt.task_prompt}</div>
                    </div>

                    <form onSubmit={submit} className="space-y-3">
                        <label className="block text-sm font-medium">Your response (200–400 words)</label>
                        <textarea
                            value={submission}
                            onChange={(e) => setSubmission(e.target.value)}
                            rows={16}
                            required
                            minLength={80}
                            maxLength={5000}
                            placeholder="Type your response here. Copy/paste is disabled."
                            className="w-full rounded-lg bg-white/5 ring-1 ring-white/10 focus:ring-emerald-500/50 focus:outline-none p-3 text-sm placeholder-white/30 font-mono resize-y select-text"
                        />
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-white/40">
                                {submission.trim().split(/\s+/).filter(Boolean).length} words · {submission.length} chars
                            </span>
                            <button
                                type="submit"
                                disabled={processing || submission.trim().length < 80}
                                className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-6 py-2.5 text-sm font-semibold disabled:opacity-50"
                            >
                                <Send className="h-4 w-4" />
                                {processing ? 'Submitting…' : 'Submit for AI grading'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
