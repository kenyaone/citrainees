import { Link, usePage } from '@inertiajs/react';
import { Building2, FolderGit2, LayoutGrid, ShieldCheck, User, Users } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

const staffNavItems: NavItem[] = [
    { title: 'Dashboard', href: dashboard(), icon: LayoutGrid },
    { title: 'Alumni', href: '/alumni', icon: Users },
    { title: 'CI projects', href: '/ci-projects', icon: Building2 },
    { title: 'Verifications', href: '/verifications', icon: ShieldCheck },
];

const alumniNavItems: NavItem[] = [{ title: 'My profile', href: '/my-profile', icon: User }];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/kenyaone/citrainees',
        icon: FolderGit2,
    },
];

export function AppSidebar() {
    const { auth, pending_verifications_count } = usePage<{
        auth: { user: { role?: string } | null };
        pending_verifications_count?: number;
    }>().props;
    const isAlumni = auth?.user?.role === 'alumni';
    const baseItems = isAlumni ? alumniNavItems : staffNavItems;
    const mainNavItems: NavItem[] = baseItems.map((item) =>
        item.href === '/verifications' && pending_verifications_count
            ? { ...item, title: `Verifications (${pending_verifications_count})` }
            : item,
    );
    const homeHref = isAlumni ? '/my-profile' : dashboard();

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={homeHref} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
