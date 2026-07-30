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
import type { CiProject } from '@/types/tracer';
import { dashboard } from '@/routes';

interface Props {
    projects: CiProject[];
}

const EMPTY = { code: '', name: '', county: '', sub_county: '', notes: '' };

export default function CiProjectsIndex({ projects }: Props) {
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<CiProject | null>(null);
    const [values, setValues] = useState(EMPTY);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const openCreate = () => {
        setEditing(null);
        setValues(EMPTY);
        setErrors({});
        setOpen(true);
    };

    const openEdit = (p: CiProject) => {
        setEditing(p);
        setValues({
            code: p.code,
            name: p.name,
            county: p.county ?? '',
            sub_county: p.sub_county ?? '',
            notes: p.notes ?? '',
        });
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
            router.put(`/ci-projects/${editing.id}`, values, opts);
        } else {
            router.post('/ci-projects', values, opts);
        }
    };

    const remove = (p: CiProject) => {
        if (p.alumni_count && p.alumni_count > 0) {
            alert(`Cannot delete ${p.name} — it has ${p.alumni_count} alumni records linked.`);
            return;
        }
        if (confirm(`Remove ${p.name}?`)) {
            router.delete(`/ci-projects/${p.id}`);
        }
    };

    return (
        <>
            <Head title="CI project centres" />
            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-start justify-between">
                    <Heading
                        title="CI project centres"
                        description="Compassion International project centres. Alumni are linked to the centre that sponsored them."
                    />
                    <Button onClick={openCreate}>
                        <Plus className="mr-1 h-4 w-4" />
                        Add project
                    </Button>
                </div>

                <Card className="overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Code</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>County</TableHead>
                                <TableHead>Sub-county</TableHead>
                                <TableHead className="text-right">Alumni</TableHead>
                                <TableHead className="w-[100px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {projects.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                        No project centres yet. Add the first one to start linking alumni.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                projects.map((p) => (
                                    <TableRow key={p.id}>
                                        <TableCell className="font-mono text-xs">{p.code}</TableCell>
                                        <TableCell className="font-medium">{p.name}</TableCell>
                                        <TableCell>{p.county ?? '—'}</TableCell>
                                        <TableCell>{p.sub_county ?? '—'}</TableCell>
                                        <TableCell className="text-right">{p.alumni_count ?? 0}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-1 justify-end">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => openEdit(p)}
                                                    aria-label="Edit"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => remove(p)}
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
                        <DialogTitle>{editing ? 'Edit project centre' : 'Add project centre'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submit} className="space-y-3">
                        <div>
                            <Label>Code *</Label>
                            <Input
                                value={values.code}
                                onChange={(e) => setValues({ ...values, code: e.target.value })}
                                placeholder="e.g. KE-0421"
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
                        <div className="grid gap-3 md:grid-cols-2">
                            <div>
                                <Label>County</Label>
                                <Input
                                    value={values.county}
                                    onChange={(e) => setValues({ ...values, county: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Sub-county</Label>
                                <Input
                                    value={values.sub_county}
                                    onChange={(e) => setValues({ ...values, sub_county: e.target.value })}
                                />
                            </div>
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

CiProjectsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'CI projects', href: '/ci-projects' },
    ],
};
