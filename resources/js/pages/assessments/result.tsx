import { Head, Link } from '@inertiajs/react';
import { Award, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Heading from '@/components/heading';

interface Props {
    attempt: {
        id: number;
        score: number;
        max_score: number;
        score_percent: number;
        passed: boolean;
        submitted_at: string;
        duration_seconds: number;
    };
    assessment: {
        title: string;
        skill_name: string;
        pass_threshold: number;
    };
    unlock_at: string | null;
}

export default function AssessmentResult({ attempt, assessment, unlock_at }: Props) {
    const minutes = Math.floor(attempt.duration_seconds / 60);
    const seconds = attempt.duration_seconds % 60;

    return (
        <>
            <Head title={`Result — ${assessment.title}`} />
            <div className="flex flex-col gap-4 p-4 max-w-xl mx-auto">
                <Heading title={assessment.title} description={assessment.skill_name} />

                <Card className={attempt.passed ? 'border-emerald-500' : 'border-red-500'}>
                    <CardHeader className="text-center">
                        {attempt.passed ? (
                            <>
                                <Award className="mx-auto h-16 w-16 text-emerald-600" />
                                <CardTitle className="text-2xl text-emerald-700 dark:text-emerald-400">
                                    Passed
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    This skill is now verified on your profile.
                                </p>
                            </>
                        ) : (
                            <>
                                <XCircle className="mx-auto h-16 w-16 text-red-500" />
                                <CardTitle className="text-2xl text-red-600 dark:text-red-400">Not passed</CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    You need {assessment.pass_threshold}% to verify this skill.
                                </p>
                            </>
                        )}
                    </CardHeader>
                    <CardContent className="text-center space-y-4">
                        <div>
                            <div className="text-5xl font-semibold">{attempt.score_percent}%</div>
                            <div className="text-sm text-muted-foreground">
                                {attempt.score} out of {attempt.max_score} correct
                            </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                            Took {minutes}m {seconds}s
                        </div>

                        {unlock_at && (
                            <div className="text-sm border-t pt-3">
                                You can retry this assessment on{' '}
                                <span className="font-medium">{new Date(unlock_at).toLocaleDateString()}</span>.
                            </div>
                        )}

                        <div className="flex justify-center gap-2 pt-2">
                            <Button variant="outline" asChild>
                                <Link href="/assessments">Back to assessments</Link>
                            </Button>
                            <Button asChild>
                                <Link href="/my-profile">My profile</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

AssessmentResult.layout = {
    breadcrumbs: [
        { title: 'Assessments', href: '/assessments' },
        { title: 'Result', href: '#' },
    ],
};
