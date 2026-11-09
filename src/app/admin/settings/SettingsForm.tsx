'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { updateSiteSettingsAction } from '../actions';
import { Save, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';

interface SettingsFormProps {
  initialSettings: any;
}

export default function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [siteName, setSiteName] = useState(initialSettings?.site_name || 'Fran Capelli Academy');
  const [rtoCode, setRtoCode] = useState(initialSettings?.rto_code || '6055');
  const [logoUrl, setLogoUrl] = useState(initialSettings?.logo_url || '/images/fca/logo.png');
  const [logoAlt, setLogoAlt] = useState(initialSettings?.logo_alt || 'Fran Capelli Academy Logo');
  const [phoneMelb, setPhoneMelb] = useState(initialSettings?.phone_melbourne || '03 9818 0089');
  const [phoneAdel, setPhoneAdel] = useState(initialSettings?.phone_adelaide || '08 7137 1433');
  const [phoneGen, setPhoneGen] = useState(initialSettings?.phone_general || '08 7690 6185');
  const [whatsapp, setWhatsapp] = useState(initialSettings?.whatsapp || '+61 413 826 320');
  const [email, setEmail] = useState(initialSettings?.email || 'enquiries@fca.edu.au');
  const [addrHawthorn, setAddrHawthorn] = useState(initialSettings?.address_hawthorn || '355 Burwood Road, Hawthorn, VIC 3122');
  const [addrCoolaroo, setAddrCoolaroo] = useState(initialSettings?.address_coolaroo || 'G01, 1510 Pascoe Vale Road, Coolaroo, VIC, 3048');
  const [addrMawson, setAddrMawson] = useState(initialSettings?.address_mawson || '1-3 Metro Parade, Mawson Lakes, South Australia, 5095');
  const [addrCanberra, setAddrCanberra] = useState(initialSettings?.address_canberra || 'Level 5, 15 Moore Street, Canberra City, ACT 2601');
  const [footerText, setFooterText] = useState(initialSettings?.footer_text || '');

  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);

    try {
      await updateSiteSettingsAction({
        site_name: siteName,
        rto_code: rtoCode,
        logo_url: logoUrl,
        logo_alt: logoAlt,
        phone_melbourne: phoneMelb,
        phone_adelaide: phoneAdel,
        phone_general: phoneGen,
        whatsapp,
        email,
        address_hawthorn: addrHawthorn,
        address_coolaroo: addrCoolaroo,
        address_mawson: addrMawson,
        address_canberra: addrCanberra,
        footer_text: footerText
      });
      setStatusMsg({ type: 'success', text: 'Site settings updated successfully!' });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Update failed' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Site-Wide Global Settings</h2>
            <p className="text-xs text-slate-500">
              Manage academy logo, RTO registrations, phone contact lines, and campus office addresses.
            </p>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-fca-green hover:bg-fca-green-dark text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>

        {statusMsg && (
          <div className={`p-4 rounded-2xl border text-xs flex items-center gap-2 ${
            statusMsg.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-red-50 border-red-200 text-red-900'
          }`}>
            {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Brand & Logo */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Site Brand Name
            </label>
            <input
              type="text"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              RTO Provider Code
            </label>
            <input
              type="text"
              value={rtoCode}
              onChange={(e) => setRtoCode(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-bold text-emerald-800 font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Header Logo URL
            </label>
            <input
              type="text"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono"
            />
            {logoUrl && (
              <div className="p-3 bg-slate-900 rounded-xl mt-2 inline-block">
                <div className="relative w-40 h-10">
                  <Image src={logoUrl} alt="Logo" fill className="object-contain" />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Logo Alt Text
            </label>
            <input
              type="text"
              value={logoAlt}
              onChange={(e) => setLogoAlt(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
            />
          </div>
        </div>

        {/* Contact Numbers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Melbourne Phone (VIC)
            </label>
            <input
              type="text"
              value={phoneMelb}
              onChange={(e) => setPhoneMelb(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Adelaide Phone (SA)
            </label>
            <input
              type="text"
              value={phoneAdel}
              onChange={(e) => setPhoneAdel(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              WhatsApp Support
            </label>
            <input
              type="text"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            General Inquiries Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
          />
        </div>

        {/* Campus Physical Addresses */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Hawthorn Campus Address
            </label>
            <input
              type="text"
              value={addrHawthorn}
              onChange={(e) => setAddrHawthorn(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Coolaroo Campus Address
            </label>
            <input
              type="text"
              value={addrCoolaroo}
              onChange={(e) => setAddrCoolaroo(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Mawson Lakes (Adelaide) Address
            </label>
            <input
              type="text"
              value={addrMawson}
              onChange={(e) => setAddrMawson(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Canberra City Hub Address
            </label>
            <input
              type="text"
              value={addrCanberra}
              onChange={(e) => setAddrCanberra(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
            />
          </div>
        </div>

        {/* Footer Text */}
        <div className="pt-4 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Footer Disclaimer Text
          </label>
          <textarea
            rows={2}
            value={footerText}
            onChange={(e) => setFooterText(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed"
          />
        </div>
      </div>
    </form>
  );
}

