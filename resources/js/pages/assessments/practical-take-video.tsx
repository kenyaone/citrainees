import { FormEvent, useEffect, useRef, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { AlertTriangle, Camera, Square, Upload, Video } from 'lucide-react';

interface Props {
    attempt: {
        id: number;
        skill_name: string;
        task_prompt: string;
    };
}

const MAX_SECONDS = 60;
const MAX_BYTES = 30 * 1024 * 1024; // 30 MB

export default function PracticalTakeVideo({ attempt }: Props) {
    const [source, setSource] = useState<'idle' | 'recording' | 'preview'>('idle');
    const [blob, setBlob] = useState<Blob | null>(null);
    const [caption, setCaption] = useState('');
    const [seconds, setSeconds] = useState(0);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const videoPreviewRef = useRef<HTMLVideoElement>(null);
    const liveVideoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const recorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const stopStream = () => {
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
    };

    const startRecording = async () => {
        setError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: { ideal: 640 }, height: { ideal: 480 } },
                audio: true,
            });
            streamRef.current = stream;
            if (liveVideoRef.current) {
                liveVideoRef.current.srcObject = stream;
                await liveVideoRef.current.play();
            }
            chunksRef.current = [];
            const mimes = [
                'video/webm;codecs=vp9,opus',
                'video/webm;codecs=vp8,opus',
                'video/webm',
                'video/mp4',
            ];
            const supported = mimes.find((m) => MediaRecorder.isTypeSupported(m)) ?? '';
            const rec = new MediaRecorder(stream, supported ? { mimeType: supported } : undefined);
            rec.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
            rec.onstop = () => {
                const type = supported || 'video/webm';
                const b = new Blob(chunksRef.current, { type });
                stopStream();
                if (liveVideoRef.current) liveVideoRef.current.srcObject = null;
                setBlob(b);
                setUploadedFile(null);
                setSource('preview');
            };
            recorderRef.current = rec;
            rec.start();
            setSource('recording');
            setSeconds(0);
            timerRef.current = window.setInterval(() => {
                setSeconds((s) => {
                    if (s + 1 >= MAX_SECONDS) {
                        stopRecording();
                        return MAX_SECONDS;
                    }
                    return s + 1;
                });
            }, 1000);
        } catch {
            setError('Could not access camera or microphone. Grant permission and try again, or upload a video file instead.');
        }
    };

    const stopRecording = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        recorderRef.current?.stop();
    };

    const onFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError(null);
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > MAX_BYTES) {
            setError(`Video too large: ${(file.size / 1024 / 1024).toFixed(1)} MB (max 30 MB). Record shorter or lower quality.`);
            return;
        }
        setUploadedFile(file);
        setBlob(file);
        setSource('preview');
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (!blob) return;
        setProcessing(true);
        const form = new FormData();
        form.append('video', blob, uploadedFile?.name ?? 'demo.webm');
        form.append('caption', caption);
        router.post(`/practical-attempts/${attempt.id}/submit-video`, form, {
            forceFormData: true,
            onError: (errs) => {
                const first = Object.values(errs)[0] as string | undefined;
                setError(first ?? 'Upload failed. Try again.');
                setProcessing(false);
            },
        });
    };

    const reset = () => {
        setBlob(null);
        setUploadedFile(null);
        setSource('idle');
        setSeconds(0);
        stopStream();
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    useEffect(() => () => stopStream(), []);

    return (
        <>
            <Head title={`Video demo: ${attempt.skill_name}`} />
            <div className="min-h-screen bg-slate-950 text-white">
                <div className="sticky top-0 z-10 border-b border-white/10 bg-slate-950/95 backdrop-blur px-6 py-3">
                    <div className="text-xs uppercase tracking-widest text-white/50">Video demonstration</div>
                    <div className="font-semibold">{attempt.skill_name}</div>
                </div>

                <div className="max-w-3xl mx-auto p-6 space-y-6">
                    <div className="rounded-2xl bg-white/[0.04] ring-1 ring-white/10 p-6">
                        <div className="text-xs uppercase tracking-widest text-emerald-400 mb-2">Your task</div>
                        <div className="whitespace-pre-wrap leading-relaxed text-white/90">{attempt.task_prompt}</div>
                    </div>

                    <div className="rounded-lg bg-amber-500/10 ring-1 ring-amber-500/30 p-3 text-xs text-amber-200 flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <div>
                            Max 60 seconds, 30 MB. Show your skill clearly on camera — no typing required.
                            Record here or upload a video from your phone.
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-lg bg-red-500/10 ring-1 ring-red-500/30 p-3 text-sm text-red-200">
                            {error}
                        </div>
                    )}

                    {source === 'idle' && (
                        <div className="grid sm:grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={startRecording}
                                className="rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-500/30 hover:ring-emerald-500/60 p-6 text-left transition"
                            >
                                <Camera className="h-6 w-6 text-emerald-400 mb-2" />
                                <div className="font-semibold">Record here</div>
                                <div className="text-xs text-white/60 mt-1">
                                    Uses your camera + microphone. Auto-stops at 60 sec.
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="rounded-2xl bg-white/[0.04] ring-1 ring-white/20 hover:ring-white/40 p-6 text-left transition"
                            >
                                <Upload className="h-6 w-6 text-white/70 mb-2" />
                                <div className="font-semibold">Upload from phone</div>
                                <div className="text-xs text-white/60 mt-1">
                                    Record on WhatsApp / Camera first, then upload. Max 30 MB.
                                </div>
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="video/*"
                                capture="environment"
                                className="sr-only"
                                onChange={onFilePick}
                            />
                        </div>
                    )}

                    {source === 'recording' && (
                        <div className="space-y-3">
                            <video ref={liveVideoRef} muted className="w-full rounded-lg bg-black aspect-video" />
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={stopRecording}
                                    className="inline-flex items-center gap-2 rounded-lg bg-red-500 hover:bg-red-400 text-white px-4 py-2 text-sm font-semibold animate-pulse"
                                >
                                    <Square className="h-4 w-4" />
                                    Stop recording
                                </button>
                                <div className="flex items-center gap-2 text-red-300">
                                    <div className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
                                    {seconds}s / {MAX_SECONDS}s
                                </div>
                            </div>
                        </div>
                    )}

                    {source === 'preview' && blob && (
                        <form onSubmit={submit} className="space-y-4">
                            <video
                                ref={videoPreviewRef}
                                src={URL.createObjectURL(blob)}
                                controls
                                className="w-full rounded-lg bg-black aspect-video"
                            />
                            <div className="text-xs text-white/50">
                                {(blob.size / 1024 / 1024).toFixed(1)} MB
                                {uploadedFile ? ` · ${uploadedFile.name}` : ' · recorded here'}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Short caption (optional)
                                </label>
                                <input
                                    type="text"
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value)}
                                    maxLength={200}
                                    placeholder="e.g. Repairing a laptop keyboard replacement"
                                    className="w-full rounded-lg bg-white/5 ring-1 ring-white/10 focus:ring-emerald-500/50 focus:outline-none px-3 py-2 text-sm placeholder-white/30"
                                />
                                <div className="text-xs text-white/40 mt-1">{caption.length}/200</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-6 py-2.5 text-sm font-semibold disabled:opacity-50"
                                >
                                    <Video className="h-4 w-4" />
                                    {processing ? 'Uploading…' : 'Submit for staff review'}
                                </button>
                                <button
                                    type="button"
                                    onClick={reset}
                                    className="rounded-lg bg-white/10 hover:bg-white/20 ring-1 ring-white/20 px-4 py-2 text-sm font-semibold"
                                >
                                    Redo
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </>
    );
}
