import { Head } from '@inertiajs/react';
import AlumniForm from '@/components/alumni-form';
import Heading from '@/components/heading';
import { Card } from '@/components/ui/card';
import type { CiProject } from '@/types/tracer';
import { dashboard } from '@/routes';

interface Props {
    projects: CiProject[];
}

export default function AlumniCreate({ projects }: Props) {
    return (
        <>
            <Head title="Add alumnus" />
            <div className="p-4">
                <Heading title="Add alumnus" description="Create a new alumni record." />
                <Card className="p-6">
                    <AlumniForm
                        projects={projects}
                        submitUrl="/alumni"
                        submitMethod="post"
                        cancelUrl="/alumni"
                        submitLabel="Create alumnus"
                    />
                </Card>
            </div>
        </>
    );
}

AlumniCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Alumni', href: '/alumni' },
        { title: 'Add', href: '/alumni/create' },
    ],
};
