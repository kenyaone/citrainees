import { Head } from '@inertiajs/react';
import AlumniForm from '@/components/alumni-form';
import Heading from '@/components/heading';
import { Card } from '@/components/ui/card';
import type { Alumni, CiProject } from '@/types/tracer';
import { dashboard } from '@/routes';

interface Props {
    alumni: Alumni;
    projects: CiProject[];
}

export default function AlumniEdit({ alumni, projects }: Props) {
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
