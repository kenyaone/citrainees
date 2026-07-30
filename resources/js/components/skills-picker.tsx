import { useMemo, useState } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { Skill } from '@/types/tracer';
import { cn } from '@/lib/utils';

interface Props {
    allSkills: Skill[];
    selectedIds: number[];
    onChange: (ids: number[]) => void;
    className?: string;
}

export default function SkillsPicker({ allSkills, selectedIds, onChange, className }: Props) {
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);

    const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
    const selected = allSkills.filter((s) => selectedSet.has(s.id));

    const filtered = useMemo(() => {
        const q = query.toLowerCase().trim();
        return allSkills.filter((s) => (q ? s.name.toLowerCase().includes(q) : true));
    }, [allSkills, query]);

    const grouped = useMemo(() => {
        const map = new Map<string, Skill[]>();
        filtered.forEach((s) => {
            const cat = s.category ?? 'Other';
            if (!map.has(cat)) map.set(cat, []);
            map.get(cat)!.push(s);
        });
        return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
    }, [filtered]);

    const toggle = (id: number) => {
        if (selectedSet.has(id)) {
            onChange(selectedIds.filter((i) => i !== id));
        } else {
            onChange([...selectedIds, id]);
        }
    };

    const remove = (id: number) => onChange(selectedIds.filter((i) => i !== id));

    return (
        <div className={cn('space-y-2', className)}>
            <div className="flex flex-wrap gap-1 min-h-[2rem]">
                {selected.length === 0 && (
                    <span className="text-sm text-muted-foreground">No skills selected yet.</span>
                )}
                {selected.map((s) => (
                    <Badge key={s.id} variant="secondary" className="gap-1">
                        {s.name}
                        <button
                            type="button"
                            onClick={() => remove(s.id)}
                            className="hover:text-destructive"
                            aria-label={`Remove ${s.name}`}
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </Badge>
                ))}
            </div>

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" type="button" className="w-full justify-between">
                        <span className="text-muted-foreground">
                            {selected.length > 0 ? 'Add or remove skills' : 'Pick skills'}
                        </span>
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-[420px] max-h-[400px] overflow-hidden flex flex-col p-0">
                    <div className="p-2 border-b">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                autoFocus
                                className="pl-8"
                                placeholder="Search skills…"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="overflow-y-auto flex-1">
                        {grouped.length === 0 ? (
                            <div className="p-4 text-sm text-muted-foreground text-center">
                                No skills match "{query}".
                            </div>
                        ) : (
                            grouped.map(([category, skills]) => (
                                <div key={category} className="p-2">
                                    <div className="text-xs font-semibold text-muted-foreground uppercase px-2 mb-1">
                                        {category}
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {skills.map((s) => {
                                            const isOn = selectedSet.has(s.id);
                                            return (
                                                <button
                                                    key={s.id}
                                                    type="button"
                                                    onClick={() => toggle(s.id)}
                                                    className={cn(
                                                        'text-xs px-2 py-1 rounded border',
                                                        isOn
                                                            ? 'bg-primary text-primary-foreground border-primary'
                                                            : 'bg-background hover:bg-muted',
                                                    )}
                                                >
                                                    {s.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}
