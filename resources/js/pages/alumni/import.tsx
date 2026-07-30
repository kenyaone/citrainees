import { FormEvent, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { AlertCircle, ArrowLeft, Download, FileSpreadsheet, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Heading from '@/components/heading';
import type { CiProject } from '@/types/tracer';
import { dashboard } from '@/routes';

interface Props {
    columns: string[];
    projects: CiProject[];
}

interface SkippedRow {
    row: number;
    reason: string;
}

interface PageProps {
    flash?: {
        success?: string;
        error?: string;
        import_skipped?: SkippedRow[];
    };
    [key: string]: any;
}

export default function AlumniImport({ columns, projects }: Props) {
    const { flash } = usePage<PageProps>().props;
    const [file, setFile] = useState<File | null>(null);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (!file) return;
        setError(null);
        setProcessing(true);
        router.post(
            '/alumni/import',
            { file },
            {
                forceFormData: true,
                onError: (errs: any) => setError(errs.file ?? 'Upload failed.'),
                onFinish: () => setProcessing(false),
            },
        );
    };

    return (
        <>
            <Head title="Import alumni" />
            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-start justify-between">
                    <Heading
                        title="Import alumni from CSV"
                        description="Upload a spreadsheet exported as CSV to bulk-create alumni records."
                    />
                    <Button variant="outline" asChild>
                        <Link href="/alumni">
                            <ArrowLeft className="mr-1 h-4 w-4" />
                            Back to alumni
                        </Link>
                    </Button>
                </div>

                {flash?.error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{flash.error}</AlertDescription>
                    </Alert>
                )}

                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {flash?.import_skipped && flash.import_skipped.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-orange-600 dark:text-orange-400">
                                Skipped {flash.import_skipped.length} row(s)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="text-sm space-y-1 list-disc list-inside">
                                {flash.import_skipped.slice(0, 50).map((s, i) => (
                                    <li key={i}>
                                        <span className="font-mono">Row {s.row}:</span> {s.reason}
                                    </li>
                                ))}
                                {flash.import_skipped.length > 50 && (
                                    <li className="text-muted-foreground">
                                        …and {flash.import_skipped.length - 50} more.
                                    </li>
                                )}
                            </ul>
                        </CardContent>
                    </Card>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileSpreadsheet className="h-5 w-5" />
                                Expected columns
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm space-y-3">
                            <p className="text-muted-foreground">
                                Column headers must be lowercase and match the names below. Only{' '}
                                <span className="font-mono">first_name</span> and{' '}
                                <span className="font-mono">last_name</span> are required. Everything else can be left
                                blank.
                            </p>
                            <div className="grid grid-cols-2 gap-1 text-xs font-mono">
                                {columns.map((c) => (
                                    <div key={c}>
                                        {c}
                                        {['first_name', 'last_name'].includes(c) && (
                                            <span className="text-red-500 ml-1">*</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="pt-2">
                                <Button variant="outline" size="sm" asChild>
                                    <a href="/alumni/import/template">
                                        <Download className="mr-1 h-4 w-4" />
                                        Download template CSV
                                    </a>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Available CI project codes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-2">
                                Put a project's code (not its name or ID) in the{' '}
                                <span className="font-mono">ci_project_code</span> column. Rows with unknown codes are
                                skipped.
                            </p>
                            {projects.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    No projects added yet.{' '}
                                    <Link href="/ci-projects" className="underline">
                                        Add some first
                                    </Link>{' '}
                                    if you want to link imported alumni to a project.
                                </p>
                            ) : (
                                <div className="grid grid-cols-2 gap-1 text-xs font-mono max-h-48 overflow-auto">
                                    {projects.map((p) => (
                                        <div key={p.id} title={p.name}>
                                            {p.code}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Upload CSV</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">
                            <input
                                type="file"
                                accept=".csv,text/csv"
                                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                                className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                            />
                            {file && (
                                <div className="text-sm text-muted-foreground">
                                    Selected: <span className="font-mono">{file.name}</span>{' '}
                                    ({(file.size / 1024).toFixed(1)} KB)
                                </div>
                            )}
                            <div className="flex justify-end">
                                <Button type="submit" disabled={!file || processing}>
                                    <Upload className="mr-1 h-4 w-4" />
                                    {processing ? 'Importing…' : 'Import CSV'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

AlumniImport.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Alumni', href: '/alumni' },
        { title: 'Import', href: '/alumni/import' },
    ],
};
