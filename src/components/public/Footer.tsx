import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  GraduationCap, 
  Lock,
  ArrowRight
} from 'lucide-react';

interface FooterProps {
  settings: {
    site_name?: string;
    rto_code?: string;
    logo_url?: string;
    phone_melbourne?: string;
    phone_adelaide?: string;
    phone_general?: string;
    whatsapp?: string;
    email?: string;
    address_hawthorn?: string;
    address_coolaroo?: string;
    address_mawson?: string;
    address_canberra?: string;
    footer_text?: string;
  };
}

export default function Footer({ settings }: FooterProps) {
  const rtoCode = settings?.rto_code || '6055';
  const logoUrl = settings?.logo_url || '/images/fca/logo.png';
  const phoneMelb = settings?.phone_melbourne || '03 9818 0089';
  const phoneAdel = settings?.phone_adelaide || '08 7137 1433';
  const email = settings?.email || 'enquiries@fca.edu.au';
  const whatsapp = settings?.whatsapp || '+61 413 826 320';

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Col 1: Brand & RTO Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block bg-white/95 p-3 rounded-xl">
              <div className="relative w-48 h-12">
                <Image 
                  src={logoUrl} 
                  alt="Fran Capelli Academy" 
                  fill 
                  className="object-contain"
                />
              </div>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-md">
              {settings?.footer_text || 'Fran Capelli Academy is a leading Australian vocational education provider delivering nationally accredited certificates and diplomas designed for real trade mastery.'}
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                RTO Provider # {rtoCode}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-950 text-amber-300 border border-amber-800">
                <GraduationCap className="w-4 h-4 text-amber-300" />
                Skills SA Subsidised
              </span>
            </div>
          </div>

          {/* Col 2: Course Categories */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4 border-l-2 border-emerald-500 pl-2">
              Vocational Courses
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/courses/hairdressing" className="hover:text-emerald-400 transition-colors">
                  Hairdressing (SHB30416)
                </Link>
              </li>
              <li>
                <Link href="/courses/barbering" className="hover:text-emerald-400 transition-colors">
                  Barbering (SHB30516)
                </Link>
              </li>
              <li>
                <Link href="/courses/building-construction" className="hover:text-emerald-400 transition-colors">
                  Building & Construction (CPC40120)
                </Link>
              </li>
              <li>
                <Link href="/courses/early-childhood-education-care" className="hover:text-emerald-400 transition-colors">
                  Early Childhood Education (CHC30125)
                </Link>
              </li>
              <li>
                <Link href="/courses/community-services" className="hover:text-emerald-400 transition-colors">
                  Community Services (CHC52025)
                </Link>
              </li>
              <li>
                <Link href="/courses" className="text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center gap-1 pt-1">
                  View All Courses <ArrowRight className="w-3 h-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Campuses & States */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4 border-l-2 border-emerald-500 pl-2">
              Campuses & States
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/fran-capelli-academy-vic" className="hover:text-emerald-400 transition-colors">
                  Melbourne Campuses (VIC)
                </Link>
              </li>
              <li>
                <Link href="/south-australia-funding" className="hover:text-emerald-400 transition-colors">
                  Mawson Lakes (SA) & Funding
                </Link>
              </li>
              <li>
                <Link href="/fran-capelli-academy-australiacapitalterritory" className="hover:text-emerald-400 transition-colors">
                  Canberra City (ACT)
                </Link>
              </li>
              <li>
                <Link href="/fran-capelli-academy-wa" className="hover:text-emerald-400 transition-colors">
                  Western Australia (WA)
                </Link>
              </li>
              <li>
                <Link href="/areas/hawthorn-vic" className="hover:text-emerald-400 transition-colors">
                  Local Area Guides
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-emerald-400 transition-colors">
                  Student Blog & News
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Campus Contact Info */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4 border-l-2 border-emerald-500 pl-2">
              Campus Locations
            </h4>
            <div className="space-y-3 text-xs leading-relaxed">
              <div>
                <p className="font-semibold text-slate-200">Hawthorn Campus (VIC):</p>
                <p className="text-slate-400">355 Burwood Road, Hawthorn VIC 3122</p>
                <p className="text-emerald-400 font-medium">03 9818 0089</p>
              </div>
              <div>
                <p className="font-semibold text-slate-200">Adelaide Campus (SA):</p>
                <p className="text-slate-400">1-3 Metro Parade, Mawson Lakes SA 5095</p>
                <p className="text-emerald-400 font-medium">08 7137 1433</p>
              </div>
              <div>
                <p className="font-semibold text-slate-200">Direct Inquiries:</p>
                <p className="text-slate-400">{email}</p>
                <p className="text-slate-400">WhatsApp: {whatsapp}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Admin link */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Fran Capelli Academy Pty Ltd. RTO Provider No. 6055. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/about" className="hover:text-slate-300">About FCA</Link>
            <Link href="/contact" className="hover:text-slate-300">Contact</Link>
            <Link href="/south-australia-funding" className="hover:text-slate-300">Government Funding</Link>
            <Link 
              href="/admin" 
              className="inline-flex items-center gap-1 text-slate-400 hover:text-emerald-400 bg-slate-800/80 px-2.5 py-1 rounded"
            >
              <Lock className="w-3 h-3" />
              <span>Admin Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

