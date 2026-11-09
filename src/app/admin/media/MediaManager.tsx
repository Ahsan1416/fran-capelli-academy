'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  Upload, 
  Copy, 
  Check, 
  Search, 
  Image as ImageIcon, 
  FileText, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

interface MediaManagerProps {
  initialMedia: any[];
}

export default function MediaManager({ initialMedia }: MediaManagerProps) {
  const [mediaList, setMediaList] = useState(initialMedia);
  const [filter, setFilter] = useState('');
  const [uploading, setUploading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const filtered = mediaList.filter(m => 
    (m.filename && m.filename.toLowerCase().includes(filter.toLowerCase())) ||
    (m.alt_text && m.alt_text.toLowerCase().includes(filter.toLowerCase()))
  );

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setStatusMsg(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('altText', file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '));

    try {
      const res = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setMediaList([data.media, ...mediaList]);
      setStatusMsg({ type: 'success', text: `Image "${file.name}" uploaded successfully!` });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Upload failed.' });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  function handleCopy(url: string) {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Upload & Search Box */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Persistent Media Store</h3>
            <p className="text-xs text-slate-500">
              Upload new images or browse existing Fran Capelli Academy assets to reuse in pages and courses.
            </p>
          </div>

          <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-fca-green hover:bg-fca-green-dark text-white font-bold text-xs shadow-sm transition-colors">
            <Upload className="w-4 h-4" />
            <span>{uploading ? 'Uploading Asset...' : 'Upload New Image'}</span>
            <input
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {statusMsg && (
          <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
            statusMsg.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-red-50 border-red-200 text-red-900'
          }`}>
            {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        <div className="relative">
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search assets by filename or alt text..."
            className="w-full px-4 py-2.5 pl-10 rounded-xl border border-slate-200 text-xs text-slate-800"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        </div>
      </div>

      {/* Media Gallery Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filtered.map((item) => {
          const isCopied = copiedUrl === item.url;
          return (
            <div 
              key={item.id} 
              className="bg-white rounded-2xl border border-slate-200 p-2.5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between group"
            >
              <div>
                <div className="relative h-28 w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-100">
                  <Image
                    src={item.url}
                    alt={item.alt_text || item.filename}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="mt-2 space-y-0.5">
                  <p className="font-bold text-slate-900 text-xs truncate" title={item.filename}>
                    {item.filename}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate" title={item.alt_text}>
                    {item.alt_text || 'No alt text'}
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[9px] font-mono text-slate-400">
                  {item.size_bytes ? `${Math.round(item.size_bytes / 1024)} KB` : ''}
                </span>

                <button
                  type="button"
                  onClick={() => handleCopy(item.url)}
                  className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-colors ${
                    isCopied ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                  title="Copy Path"
                >
                  {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-500" />}
                  <span>{isCopied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

