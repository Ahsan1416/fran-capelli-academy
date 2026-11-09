import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getCurrentAdmin } from '@/lib/auth';
import { logoutAction } from './actions';
import { 
  LayoutDashboard, 
  Home, 
  BookOpen, 
  FileText, 
  MapPin, 
  Image as ImageIcon, 
  Settings, 
  Download, 
  LogOut, 
  ExternalLink, 
  ShieldCheck,
  ChevronRight,
  GraduationCap,
  Globe
} from 'lucide-react';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getCurrentAdmin();

  // If not logged in, render children directly (e.g. login page)
  if (!admin) {
    return <div className="min-h-screen bg-slate-900">{children}</div>;
  }

  const navLinks = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Homepage Editor', href: '/admin/homepage', icon: Home },
    { label: 'Courses Directory', href: '/admin/courses', icon: GraduationCap },
    { label: 'State & Static Pages', href: '/admin/pages', icon: FileText },
    { label: 'Blog Posts', href: '/admin/posts', icon: BookOpen },
    { label: 'Local Area Pages', href: '/admin/areas', icon: MapPin },
    { label: 'Media Library', href: '/admin/media', icon: ImageIcon },
    { label: 'Site Settings', href: '/admin/settings', icon: Settings },
    { label: 'WordPress Backend', href: '/admin/wordpress', icon: Globe },
    { label: 'WordPress Importer', href: '/admin/import', icon: Download },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row text-slate-800">
      {/* Sidebar */}
      <aside className="w-full lg:w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 lg:min-h-screen">
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-xl">
              <div className="relative w-32 h-7">
                <Image
                  src="/images/fca/logo.png"
                  alt="FCA Logo"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1.5 flex-1">
          <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Publishing Sections
          </div>
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <Icon className="w-4 h-4 text-emerald-400" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center gap-2.5 px-3 py-2 bg-slate-800/60 rounded-xl text-xs">
            <div className="w-7 h-7 rounded-full bg-emerald-700 flex items-center justify-center font-bold text-white text-[11px]">
              AD
            </div>
            <div className="overflow-hidden">
              <p className="font-bold text-white truncate">{admin.name}</p>
              <p className="text-[10px] text-emerald-400 truncate">{admin.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="flex-1 py-2 px-3 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center justify-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
              <span>Live Site</span>
            </Link>

            <form action={logoutAction} className="shrink-0">
              <button
                type="submit"
                className="p-2 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-300 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main Admin Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span>Fran Capelli Academy</span>
            <span>/</span>
            <span className="text-slate-900 font-bold">Admin Dashboard</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              RTO # 6055 Active
            </span>
            <Link
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-fca-green hover:bg-fca-green-dark transition-colors shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Preview Live Website</span>
            </Link>
          </div>
        </header>

        {/* Page Inner Container */}
        <main className="p-6 sm:p-8 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}

