import { FormEvent, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { dashboard } from '@/routes';

interface Cluster {
    id: number;
    code: string;
    name: string;
    region: string | null;
    notes: string | null;
    projects_count?: number;
}

interface Props {
    clusters: Cluster[];
}

const EMPTY = { code: '', name: '', region: '', notes: '' };

export default function CiClustersIndex({ clusters }: Props) {
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Cluster | null>(null);
    const [values, setValues] = useState(EMPTY);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const openCreate = () => {
        setEditing(null);
        setValues(EMPTY);
        setErrors({});
        setOpen(true);
    };

    const openEdit = (c: Cluster) => {
        setEditing(c);
        setValues({ code: c.code, name: c.name, region: c.region ?? '', notes: c.notes ?? '' });
        setErrors({});
        setOpen(true);
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        const opts = {
            onError: (errs: any) => setErrors(errs),
            onSuccess: () => {
                setOpen(false);
                setValues(EMPTY);
                setEditing(null);
            },
            onFinish: () => setProcessing(false),
        };
        if (editing) {
            router.put(`/ci-clusters/${editing.id}`, values, opts);
        } else {
            router.post('/ci-clusters', values, opts);
        }
    };

    const remove = (c: Cluster) => {
        if (c.projects_count && c.projects_count > 0) {
            alert(`${c.name} has ${c.projects_count} project(s). Reassign or delete them first.`);
            return;
        }
        if (confirm(`Remove ${c.name}?`)) {
            router.delete(`/ci-clusters/${c.id}`);
        }
    };

    return (
        <>
            <Head title="CI clusters" />
            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-start justify-between">
                    <Heading
                        title="CI clusters"
                        description="Regional groupings of CI project centres. Each project belongs to at most one cluster."
                    />
                    <Button onClick={openCreate}>
                        <Plus className="mr-1 h-4 w-4" />
                        Add cluster
                    </Button>
                </div>

                <Card className="overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Code</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Region</TableHead>
                                <TableHead className="text-right">Projects</TableHead>
                                <TableHead className="w-[100px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {clusters.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                        No clusters yet. Add the first to start grouping projects regionally.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                clusters.map((c) => (
                                    <TableRow key={c.id}>
                                        <TableCell className="font-mono text-xs">{c.code}</TableCell>
                                        <TableCell className="font-medium">{c.name}</TableCell>
                                        <TableCell>{c.region ?? '—'}</TableCell>
                                        <TableCell className="text-right">{c.projects_count ?? 0}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-1 justify-end">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => openEdit(c)}
                                                    aria-label="Edit"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => remove(c)}
                                                    aria-label="Remove"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </Card>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editing ? 'Edit cluster' : 'Add cluster'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submit} className="space-y-3">
                        <div>
                            <Label>Code *</Label>
                            <Input
                                value={values.code}
                                onChange={(e) => setValues({ ...values, code: e.target.value })}
                                placeholder="e.g. RIFT-01"
                                required
                            />
                            <InputError message={errors.code} />
                        </div>
                        <div>
                            <Label>Name *</Label>
                            <Input
                                value={values.name}
                                onChange={(e) => setValues({ ...values, name: e.target.value })}
                                required
                            />
                            <InputError message={errors.name} />
                        </div>
                        <div>
                            <Label>Region</Label>
                            <Input
                                value={values.region}
                                onChange={(e) => setValues({ ...values, region: e.target.value })}
                                placeholder="e.g. Rift Valley"
                            />
                        </div>
                        <div>
                            <Label>Notes</Label>
                            <Textarea
                                rows={3}
                                value={values.notes}
                                onChange={(e) => setValues({ ...values, notes: e.target.value })}
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Saving…' : editing ? 'Save' : 'Create'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

CiClustersIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'CI clusters', href: '/ci-clusters' },
    ],
};
