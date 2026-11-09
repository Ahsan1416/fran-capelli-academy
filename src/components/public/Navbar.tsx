'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Phone, 
  MapPin, 
  ChevronDown, 
  Menu, 
  X, 
  GraduationCap, 
  ShieldCheck, 
  Sparkles,
  Lock,
  Check,
  ChevronRight
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  children?: Array<{ label: string; href: string }>;
}

const STATE_ITEMS = [
  {
    code: 'SA',
    name: 'South Australia',
    hub: 'Adelaide & Mawson Lakes Campus',
    badge: 'Skills SA Subsidised',
    href: '/south-australia'
  },
  {
    code: 'VIC',
    name: 'Victoria',
    hub: 'Melbourne (Hawthorn & Coolaroo)',
    badge: 'Commercial Salons',
    href: '/victoria'
  },
  {
    code: 'ACT',
    name: 'ACT (Canberra)',
    hub: '15 Moore Street Delivery Hub',
    badge: 'User Choice Funded',
    href: '/act'
  },
  {
    code: 'WA',
    name: 'Western Australia',
    hub: 'Perth & Regional Delivery',
    badge: 'Blended Delivery',
    href: '/western-australia'
  }
];

interface NavbarProps {
  settings: {
    site_name?: string;
    rto_code?: string;
    logo_url?: string;
    logo_alt?: string;
    phone_melbourne?: string;
    phone_adelaide?: string;
    whatsapp?: string;
    email?: string;
    nav_menu?: string;
  };
}

export default function Navbar({ settings }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileCoursesOpen, setMobileCoursesOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [stateMenuOpen, setStateMenuOpen] = useState(false);
  const [activeStateName, setActiveStateName] = useState<string>('South Australia');
  const pathname = usePathname();
  const router = useRouter();
  const stateMenuRef = useRef<HTMLDivElement>(null);

  // Close state dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (stateMenuRef.current && !stateMenuRef.current.contains(event.target as Node)) {
        setStateMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getActiveCode = (name: string) => {
    if (name.includes('South Australia') || name === 'SA') return 'SA';
    if (name.includes('Victoria') || name === 'VIC') return 'VIC';
    if (name.includes('ACT') || name.includes('Canberra')) return 'ACT';
    if (name.includes('Western Australia') || name === 'WA') return 'WA';
    return 'SA';
  };

  const handleStateSelect = (code: string, href: string) => {
    setActiveStateName(STATE_ITEMS.find(s => s.code === code)?.name || code);
    try {
      localStorage.setItem('fca_selected_state', code);
      document.cookie = `fca_selected_state=${code}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {}
    setStateMenuOpen(false);
    setMobileMenuOpen(false);
    router.push(href);
  };

  useEffect(() => {
    const detectState = () => {
      // 1. Detect from URL pathname first
      if (pathname?.includes('victoria') || pathname?.includes('vic')) {
        setActiveStateName('Victoria');
        localStorage.setItem('fca_selected_state', 'VIC');
        return;
      }
      if (pathname?.includes('south-australia') || pathname?.includes('sa')) {
        setActiveStateName('South Australia');
        localStorage.setItem('fca_selected_state', 'SA');
        return;
      }
      if (pathname?.includes('act') || pathname?.includes('canberra')) {
        setActiveStateName('ACT (Canberra)');
        localStorage.setItem('fca_selected_state', 'ACT');
        return;
      }
      if (pathname?.includes('western-australia') || pathname?.includes('wa') || pathname?.includes('perth')) {
        setActiveStateName('Western Australia');
        localStorage.setItem('fca_selected_state', 'WA');
        return;
      }

      // 2. Fallback to localStorage
      const s = localStorage.getItem('fca_selected_state');
      if (s === 'SA') setActiveStateName('South Australia');
      else if (s === 'VIC') setActiveStateName('Victoria');
      else if (s === 'ACT') setActiveStateName('ACT (Canberra)');
      else if (s === 'WA') setActiveStateName('Western Australia');
      else setActiveStateName('South Australia');
    };

    detectState();
    window.addEventListener('storage', detectState);
    return () => window.removeEventListener('storage', detectState);
  }, [pathname]);

  const phoneMelb = settings?.phone_melbourne || '03 9818 0089';
  const phoneAdel = settings?.phone_adelaide || '08 7137 1433';
  const rtoCode = settings?.rto_code || '6055';
  const logoUrl = settings?.logo_url || '/images/fca/logo.png';
  const logoAlt = settings?.logo_alt || 'Fran Capelli Academy Logo';

  let navItems: NavItem[] = [];
  try {
    if (settings?.nav_menu) {
      navItems = JSON.parse(settings.nav_menu);
    }
  } catch {
    navItems = [];
  }

  // Filter out redundant items (handled exclusively by the location selector)
  navItems = navItems.filter(
    (item) =>
      item.label !== 'Campuses & States' &&
      item.label !== 'Local Hubs' &&
      item.label !== 'State Websites'
  );

  if (!navItems || navItems.length === 0) {
    navItems = [
      { label: 'Home', href: '/' },
      {
        label: 'Courses',
        href: '/courses',
        children: [
          { label: 'All Courses', href: '/courses' },
          { label: 'Hairdressing', href: '/courses/hairdressing' },
          { label: 'Barbering', href: '/courses/barbering' },
          { label: 'Building & Construction', href: '/courses/building-construction' },
          { label: 'Early Childhood Education', href: '/courses/early-childhood-education-care' },
          { label: 'Community Services', href: '/courses/community-services' }
        ]
      },
      { label: 'Blog', href: '/blog' },
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' }
    ];
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200/90 shadow-2xs">
      {/* Top Notification & Contact Bar */}
      <div className="bg-[#0b3826] text-white text-xs py-2 px-3 sm:px-4 border-b border-emerald-900/80">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5">
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <span className="inline-flex items-center gap-1.5 font-bold text-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5 text-fca-mint shrink-0" />
              RTO # {rtoCode}
            </span>
            <span className="hidden sm:inline-block text-emerald-300/40">•</span>
            <span className="hidden sm:inline-block text-emerald-100 font-medium">
              Nationally Recognised Training Provider
            </span>
            <span className="hidden md:inline-block text-emerald-300/40">•</span>
            <span className="hidden md:inline-flex items-center gap-1 text-emerald-200 font-medium">
              <Sparkles className="w-3 h-3 text-amber-300 shrink-0" />
              Skills SA Subsidised Training
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-xs font-semibold ml-auto shrink-0">
            <a 
              href={`tel:${phoneAdel.replace(/\s+/g, '')}`} 
              className="hover:text-emerald-300 flex items-center gap-1 transition-colors"
              title="Adelaide Campus Phone"
            >
              <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>SA: {phoneAdel}</span>
            </a>
            <span className="text-emerald-700/80 hidden xs:inline">|</span>
            <a 
              href={`tel:${phoneMelb.replace(/\s+/g, '')}`} 
              className="hover:text-emerald-300 hidden xs:flex items-center gap-1 transition-colors"
              title="Melbourne Campus Phone"
            >
              <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>VIC: {phoneMelb}</span>
            </a>
            <span className="text-emerald-700/80">|</span>
            <Link 
              href="/admin" 
              className="text-emerald-300 hover:text-white flex items-center gap-1 bg-emerald-900/60 hover:bg-emerald-800 px-2 py-0.5 rounded transition-colors text-[11px]"
              title="Staff & Admin Portal"
            >
              <Lock className="w-2.5 h-2.5" />
              <span>Admin</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Brand Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group shrink-0" aria-label="Fran Capelli Academy Home">
            <div className="relative w-36 sm:w-44 md:w-52 h-10 sm:h-12 transition-transform group-hover:scale-[1.02]">
              <Image 
                src={logoUrl} 
                alt={logoAlt} 
                fill 
                className="object-contain object-left" 
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navItems.map((item, idx) => {
              const hasChildren = item.children && item.children.length > 0;
              return (
                <div 
                  key={idx} 
                  className="relative group"
                  onMouseEnter={() => hasChildren && setOpenDropdown(item.label)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <Link
                    href={item.href}
                    className="flex items-center gap-1 px-2.5 xl:px-3 py-2 text-sm font-semibold text-slate-700 hover:text-fca-green rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
                  >
                    <span>{item.label}</span>
                    {hasChildren && (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-fca-green transition-transform group-hover:rotate-180" />
                    )}
                  </Link>

                  {/* Dropdown Menu */}
                  {hasChildren && openDropdown === item.label && (
                    <div className="absolute top-full left-0 w-64 bg-white border border-slate-200/80 rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      {item.children!.map((child, cIdx) => (
                        <Link
                          key={cIdx}
                          href={child.href}
                          className="block px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-fca-green hover:bg-emerald-50/70 transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Action Button & Single State Selector Dropdown & Mobile Hamburger */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* The ONLY State Selector Dropdown on the entire site */}
            <div 
              className="relative"
              ref={stateMenuRef}
            >
              <button
                type="button"
                onClick={() => setStateMenuOpen(!stateMenuOpen)}
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-800 bg-slate-100/90 hover:bg-emerald-50 hover:text-emerald-950 border border-slate-200/90 hover:border-emerald-300 transition-all shadow-2xs cursor-pointer whitespace-nowrap shrink-0"
                title="Select State Website / Campus"
                aria-label="Select State Website"
                aria-expanded={stateMenuOpen}
              >
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="whitespace-nowrap font-bold hidden sm:inline">{activeStateName}</span>
                <span className="whitespace-nowrap font-bold sm:hidden">{getActiveCode(activeStateName)}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${stateMenuOpen ? 'rotate-180 text-emerald-700' : ''}`} />
              </button>

              {/* State Dropdown Menu */}
              {stateMenuOpen && (
                <div className="absolute top-full right-0 mt-2 max-w-[calc(100vw-2rem)] w-72 sm:w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Choose State Website</span>
                    <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">RTO # 6055</span>
                  </div>

                  <div className="py-1">
                    {STATE_ITEMS.map((st) => {
                      const isSelected = activeStateName === st.name;
                      return (
                        <button
                          type="button"
                          key={st.code}
                          onClick={() => handleStateSelect(st.code, st.href)}
                          className={`w-full text-left px-4 py-2.5 flex items-center justify-between hover:bg-emerald-50/80 transition-colors cursor-pointer group ${isSelected ? 'bg-emerald-50/70 font-semibold' : ''}`}
                        >
                          <div className="min-w-0 pr-2">
                            <div className="font-bold text-sm text-slate-900 group-hover:text-emerald-900 flex items-center gap-1.5">
                              <span className="truncate">{st.name}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                            </div>
                            <div className="text-[11px] text-slate-500 font-medium truncate">{st.hub}</div>
                          </div>
                          <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 group-hover:bg-emerald-100 group-hover:text-emerald-900 transition-colors">
                            {st.badge}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Explore Courses CTA (Hidden on mobile phones, visible on tablet and desktop) */}
            <Link
              href="/courses"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-fca-green hover:bg-fca-green-dark shadow-xs transition-all duration-200 shrink-0 whitespace-nowrap"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Explore Courses</span>
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-700 hover:text-fca-green hover:bg-slate-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
              aria-label="Toggle Navigation Menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-4 pb-6 space-y-3 shadow-xl animate-in slide-in-from-top duration-200">
          {/* Mobile Navigation Links */}
          <div className="space-y-1">
            {navItems.map((item, idx) => {
              const hasChildren = item.children && item.children.length > 0;
              if (hasChildren) {
                return (
                  <div key={idx} className="border-b border-slate-100 pb-2">
                    <button
                      type="button"
                      onClick={() => setMobileCoursesOpen(!mobileCoursesOpen)}
                      className="w-full flex items-center justify-between py-2.5 px-2 text-base font-bold text-slate-800 hover:text-fca-green text-left rounded-lg"
                    >
                      <span>{item.label}</span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${mobileCoursesOpen ? 'rotate-180 text-fca-green' : ''}`} />
                    </button>
                    {mobileCoursesOpen && (
                      <div className="pl-3 pr-2 py-1 space-y-1 bg-slate-50/70 rounded-xl mb-1">
                        {item.children!.map((child, cIdx) => (
                          <Link
                            key={cIdx}
                            href={child.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center justify-between py-2 px-2 text-sm font-medium text-slate-700 hover:text-fca-green hover:bg-emerald-50/60 rounded-lg transition-colors"
                          >
                            <span>{child.label}</span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <div key={idx} className="border-b border-slate-100">
                  <Link
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2.5 px-2 text-base font-bold text-slate-800 hover:text-fca-green rounded-lg"
                  >
                    {item.label}
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Action CTAs inside Mobile Drawer */}
          <div className="pt-2 flex flex-col gap-2.5">
            <Link
              href="/courses"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-3.5 rounded-xl text-white bg-fca-green hover:bg-fca-green-dark font-bold text-base shadow-sm flex items-center justify-center gap-2"
            >
              <GraduationCap className="w-5 h-5" />
              <span>Explore All Courses</span>
            </Link>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <a
                href={`tel:${phoneAdel.replace(/\s+/g, '')}`}
                className="py-2.5 px-3 rounded-xl text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>Call SA</span>
              </a>
              <a
                href={`tel:${phoneMelb.replace(/\s+/g, '')}`}
                className="py-2.5 px-3 rounded-xl text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>Call VIC</span>
              </a>
            </div>

            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-200 transition-colors"
            >
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Staff & Admin Portal</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
