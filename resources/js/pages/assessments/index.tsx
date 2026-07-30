import { Head, Link, router, usePage } from '@inertiajs/react';
import { Award, CheckCircle2, Clock, Play, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Heading from '@/components/heading';

interface AssessmentItem {
    id: number;
    title: string;
    description: string | null;
    skill_name: string;
    skill_category: string | null;
    question_count: number;
    pass_threshold: number;
    time_limit_minutes: number | null;
    verified: boolean;
    verified_via: string | null;
    latest_attempt: {
        id: number;
        score: number | null;
        max_score: number | null;
        passed: boolean;
        submitted_at: string | null;
    } | null;
    cooldown_until: string | null;
}

interface Props {
    assessments: AssessmentItem[];
}

interface FlashProps {
    flash?: { error?: string; success?: string };
    [key: string]: any;
}

export default function AssessmentsIndex({ assessments }: Props) {
    const { flash } = usePage<FlashProps>().props;

    const start = (a: AssessmentItem) => {
        router.post(`/assessments/${a.id}/start`);
    };

    return (
        <>
            <Head title="Skill assessments" />
            <div className="flex flex-col gap-4 p-4 max-w-3xl">
                <Heading
                    title="Verify your skills"
                    description="Take short assessments to prove your skills to employers. Passing scores earn a verified badge on your profile."
                />

                {flash?.error && (
                    <Alert variant="destructive">
                        <AlertDescription>{flash.error}</AlertDescription>
                    </Alert>
                )}

                {assessments.length === 0 ? (
                    <Card>
                        <CardContent className="py-8 text-center text-muted-foreground">
                            No assessments available yet for the skills on your profile.{' '}
                            <Link href="/my-profile" className="underline">
                                Tag more skills
                            </Link>{' '}
                            to unlock assessments.
                        </CardContent>
                    </Card>
                ) : (
                    assessments.map((a) => (
                        <Card key={a.id}>
                            <CardHeader>
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <CardTitle className="text-base">{a.title}</CardTitle>
                                        <div className="mt-1 flex gap-2 text-xs text-muted-foreground">
                                            <span>{a.skill_name}</span>
                                            <span>·</span>
                                            <span>{a.question_count} questions</span>
                                            <span>·</span>
                                            <span>Pass ≥ {a.pass_threshold}%</span>
                                            {a.time_limit_minutes && (
                                                <>
                                                    <span>·</span>
                                                    <span>{a.time_limit_minutes} min</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    {a.verified ? (
                                        <Badge className="bg-emerald-600 hover:bg-emerald-700">
                                            <CheckCircle2 className="mr-1 h-3 w-3" /> Verified
                                        </Badge>
                                    ) : a.latest_attempt?.passed ? (
                                        <Badge className="bg-emerald-600">Passed</Badge>
                                    ) : a.latest_attempt ? (
                                        <Badge variant="destructive">
                                            <XCircle className="mr-1 h-3 w-3" />
                                            Failed
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline">Not taken</Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {a.description && (
                                    <p className="text-sm text-muted-foreground">{a.description}</p>
                                )}

                                {a.latest_attempt && (
                                    <div className="text-sm border-l-2 border-muted pl-3">
                                        <div>
                                            Last attempt:{' '}
                                            <span className="font-medium">
                                                {a.latest_attempt.score}/{a.latest_attempt.max_score}
                                            </span>
                                            {a.latest_attempt.submitted_at && (
                                                <span className="text-muted-foreground">
                                                    {' '}
                                                    on {new Date(a.latest_attempt.submitted_at).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {a.cooldown_until && (
                                    <Alert>
                                        <Clock className="h-4 w-4" />
                                        <AlertDescription>
                                            You can retry this assessment on{' '}
                                            {new Date(a.cooldown_until).toLocaleDateString()}.
                                        </AlertDescription>
                                    </Alert>
                                )}

                                <div className="flex justify-end">
                                    {a.verified ? (
                                        <div className="text-sm text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                                            <Award className="h-4 w-4" />
                                            This skill is verified on your profile
                                        </div>
                                    ) : a.cooldown_until ? (
                                        <Button disabled variant="outline">
                                            Retry later
                                        </Button>
                                    ) : (
                                        <Button onClick={() => start(a)}>
                                            <Play className="mr-1 h-4 w-4" />
                                            {a.latest_attempt ? 'Retry assessment' : 'Start assessment'}
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </>
    );
}

AssessmentsIndex.layout = {
    breadcrumbs: [
        { title: 'My profile', href: '/my-profile' },
        { title: 'Assessments', href: '/assessments' },
    ],
};
