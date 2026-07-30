import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Search, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import Heading from '@/components/heading';
import type { Alumni, AlumniFilters, CiProject, Paginated, Skill } from '@/types/tracer';
import { ALUMNI_STATUS_OPTIONS } from '@/types/tracer';
import { dashboard } from '@/routes';

interface Props {
    alumni: Paginated<Alumni>;
    projects: CiProject[];
    counties: string[];
    skills: Skill[];
    filters: AlumniFilters & { county?: string; skill_id?: number | string };
}

export default function AlumniIndex({ alumni, projects, counties, skills, filters }: Props) {
    const [q, setQ] = useState(filters.q ?? '');
    const [projectId, setProjectId] = useState(String(filters.project_id ?? 'all'));
    const [status, setStatus] = useState(String(filters.status ?? 'all'));
    const [cohort, setCohort] = useState(String(filters.cohort ?? ''));
    const [county, setCounty] = useState(String(filters.county ?? 'all'));
    const [skillId, setSkillId] = useState(String(filters.skill_id ?? 'all'));

    const applyFilters = () => {
        router.get(
            '/alumni',
            {
                q: q || undefined,
                project_id: projectId !== 'all' ? projectId : undefined,
                status: status !== 'all' ? status : undefined,
                cohort: cohort || undefined,
                county: county !== 'all' ? county : undefined,
                skill_id: skillId !== 'all' ? skillId : undefined,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const resetFilters = () => {
        setQ('');
        setProjectId('all');
        setStatus('all');
        setCohort('');
        setCounty('all');
        setSkillId('all');
        router.get('/alumni', {}, { preserveState: true, preserveScroll: true, replace: true });
    };

    return (
        <>
            <Head title="Alumni" />
            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-start justify-between">
                    <Heading title="Alumni" description="All Compassion International Kenya alumni records." />
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href="/alumni/import">
                                <Upload className="mr-1 h-4 w-4" />
                                Import CSV
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href="/alumni/create">
                                <Plus className="mr-1 h-4 w-4" />
                                Add alumnus
                            </Link>
                        </Button>
                    </div>
                </div>

                <Card className="p-4">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            applyFilters();
                        }}
                        className="flex flex-wrap items-end gap-3"
                    >
                        <div className="flex-1 min-w-[200px]">
                            <label className="text-xs text-muted-foreground">Search name / county</label>
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    className="pl-8"
                                    placeholder="e.g. Wanjiku or Nakuru"
                                    value={q}
                                    onChange={(e) => setQ(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="min-w-[180px]">
                            <label className="text-xs text-muted-foreground">CI project</label>
                            <Select value={projectId} onValueChange={setProjectId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All projects" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All projects</SelectItem>
                                    {projects.map((p) => (
                                        <SelectItem key={p.id} value={String(p.id)}>
                                            {p.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="min-w-[160px]">
                            <label className="text-xs text-muted-foreground">Status</label>
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Any status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Any status</SelectItem>
                                    {ALUMNI_STATUS_OPTIONS.map((o) => (
                                        <SelectItem key={o.value} value={o.value}>
                                            {o.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="min-w-[160px]">
                            <label className="text-xs text-muted-foreground">County</label>
                            <Select value={county} onValueChange={setCounty}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Any county" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Any county</SelectItem>
                                    {counties.map((c) => (
                                        <SelectItem key={c} value={c}>
                                            {c}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="w-[120px]">
                            <label className="text-xs text-muted-foreground">Form 4 year</label>
                            <Input
                                type="number"
                                placeholder="e.g. 2018"
                                value={cohort}
                                onChange={(e) => setCohort(e.target.value)}
                            />
                        </div>

                        <div className="min-w-[180px]">
                            <label className="text-xs text-muted-foreground">Skill</label>
                            <Select value={skillId} onValueChange={setSkillId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Any skill" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Any skill</SelectItem>
                                    {skills.map((s) => (
                                        <SelectItem key={s.id} value={String(s.id)}>
                                            {s.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex gap-2">
                            <Button type="submit">Filter</Button>
                            <Button type="button" variant="outline" onClick={resetFilters}>
                                Reset
                            </Button>
                        </div>
                    </form>
                </Card>

                <Card className="overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>CI project</TableHead>
                                <TableHead>Form 4</TableHead>
                                <TableHead>County</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Verified</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {alumni.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                        No alumni match these filters.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                alumni.data.map((a) => (
                                    <TableRow key={a.id}>
                                        <TableCell>
                                            <Link href={`/alumni/${a.id}`} className="font-medium hover:underline">
                                                {a.first_name} {a.middle_name ? `${a.middle_name} ` : ''}
                                                {a.last_name}
                                            </Link>
                                        </TableCell>
                                        <TableCell>{a.ci_project?.name ?? '—'}</TableCell>
                                        <TableCell>{a.form_four_year ?? '—'}</TableCell>
                                        <TableCell>{a.county ?? '—'}</TableCell>
                                        <TableCell>
                                            {a.current_status ? (
                                                <Badge variant="secondary">
                                                    {a.current_status.replace('_', ' ')}
                                                </Badge>
                                            ) : (
                                                '—'
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {a.verified_at ? (
                                                <Badge variant="default">Verified</Badge>
                                            ) : (
                                                <Badge variant="outline">Pending</Badge>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </Card>

                {alumni.last_page > 1 && (
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div>
                            Showing {alumni.from ?? 0}–{alumni.to ?? 0} of {alumni.total}
                        </div>
                        <div className="flex gap-1">
                            {alumni.links.map((link, i) => (
                                <Button
                                    key={i}
                                    variant={link.active ? 'default' : 'outline'}
                                    size="sm"
                                    disabled={!link.url}
                                    onClick={() =>
                                        link.url && router.visit(link.url, { preserveScroll: true, preserveState: true })
                                    }
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

AlumniIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Alumni', href: '/alumni' },
    ],
};
