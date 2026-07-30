import { Head } from '@inertiajs/react';
import AlumniForm from '@/components/alumni-form';
import Heading from '@/components/heading';
import { Card } from '@/components/ui/card';
import type { Alumni, CiProject, Skill } from '@/types/tracer';
import { dashboard } from '@/routes';

interface Props {
    alumni: Alumni;
    projects: CiProject[];
    counties: Record<string, string[]>;
    skills: Skill[];
}

export default function AlumniEdit({ alumni, projects, counties, skills }: Props) {
    return (
        <>
            <Head title={`Edit ${alumni.first_name} ${alumni.last_name}`} />
            <div className="p-4">
                <Heading
                    title={`Edit ${alumni.first_name} ${alumni.last_name}`}
                    description="Update the alumni record."
                />
                <Card className="p-6">
                    <AlumniForm
                        alumni={alumni}
                        projects={projects}
                        counties={counties}
                        skills={skills}
                        submitUrl={`/alumni/${alumni.id}`}
                        submitMethod="put"
                        cancelUrl={`/alumni/${alumni.id}`}
                        submitLabel="Save changes"
                    />
                </Card>
            </div>
        </>
    );
}

AlumniEdit.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Alumni', href: '/alumni' },
        { title: 'Edit', href: '#' },
    ],
};
