import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { dashboard } from '@/routes';

interface Stats {
    total_alumni: number;
    verified_alumni: number;
    employed_count: number;
    employment_rate: number;
    project_count: number;
}

interface CountyStat {
    county: string;
    total: number;
}

interface CohortStat {
    form_four_year: number;
    total: number;
}

interface SectorStat {
    sector: string;
    total: number;
}

interface RecentAlumni {
    id: number;
    first_name: string;
    last_name: string;
    ci_project: { id: number; name: string } | null;
    form_four_year: number | null;
    current_status: string | null;
    created_at: string;
}

interface Props {
    stats: Stats;
    by_county: CountyStat[];
    by_cohort: CohortStat[];
    by_sector: SectorStat[];
    recent_alumni: RecentAlumni[];
}

function StatCard({ label, value, sublabel }: { label: string; value: string | number; sublabel?: string }) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-semibold">{value}</div>
                {sublabel && <div className="text-xs text-muted-foreground mt-1">{sublabel}</div>}
            </CardContent>
        </Card>
    );
}

function BarList({ items, labelKey, valueKey }: { items: any[]; labelKey: string; valueKey: string }) {
    const max = Math.max(1, ...items.map((i) => Number(i[valueKey])));
    if (items.length === 0) {
        return <p className="text-sm text-muted-foreground">No data yet.</p>;
    }
    return (
        <div className="space-y-2">
            {items.map((item, idx) => {
                const pct = (Number(item[valueKey]) / max) * 100;
                return (
                    <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-sm">
                            <span className="truncate">{item[labelKey] ?? 'Unknown'}</span>
                            <span className="text-muted-foreground">{item[valueKey]}</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default function Dashboard({ stats, by_county, by_cohort, by_sector, recent_alumni }: Props) {
    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard label="Total alumni" value={stats.total_alumni} />
                    <StatCard
                        label="Verified"
                        value={stats.verified_alumni}
                        sublabel={
                            stats.total_alumni > 0
                                ? `${Math.round((stats.verified_alumni / stats.total_alumni) * 100)}% of total`
                                : undefined
                        }
                    />
                    <StatCard
                        label="Currently employed"
                        value={stats.employed_count}
                        sublabel={`${stats.employment_rate}% employment rate`}
                    />
                    <StatCard label="CI project centres" value={stats.project_count} />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Alumni by county</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <BarList items={by_county} labelKey="county" valueKey="total" />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Employment by sector</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <BarList items={by_sector} labelKey="sector" valueKey="total" />
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Form Four cohort</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <BarList items={by_cohort} labelKey="form_four_year" valueKey="total" />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recently added alumni</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recent_alumni.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No alumni records yet.{' '}
                                <Link href="/alumni/create" className="underline">
                                    Add the first one
                                </Link>
                                .
                            </p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>CI project</TableHead>
                                        <TableHead>Form 4</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recent_alumni.map((a) => (
                                        <TableRow key={a.id}>
                                            <TableCell>
                                                <Link href={`/alumni/${a.id}`} className="font-medium hover:underline">
                                                    {a.first_name} {a.last_name}
                                                </Link>
                                            </TableCell>
                                            <TableCell>{a.ci_project?.name ?? '—'}</TableCell>
                                            <TableCell>{a.form_four_year ?? '—'}</TableCell>
                                            <TableCell>
                                                {a.current_status ? (
                                                    <Badge variant="secondary">{a.current_status.replace('_', ' ')}</Badge>
                                                ) : (
                                                    '—'
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
