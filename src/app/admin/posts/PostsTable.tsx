'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { togglePostPublishAction, deletePostAction } from '../actions';
import { 
  Eye, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  AlertCircle 
} from 'lucide-react';

interface PostsTableProps {
  initialPosts: any[];
}

export default function PostsTable({ initialPosts }: PostsTableProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  async function handleTogglePublish(post: any) {
    setLoadingId(post.id);
    try {
      const res = await togglePostPublishAction(post.id, post.status);
      if (res.success) {
        setPosts(posts.map(p => p.id === post.id ? { ...p, status: res.newStatus } : p));
      }
    } catch (err) {
      alert('Failed to update status');
    } finally {
      setLoadingId(null);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to permanently delete this post?')) return;
    setLoadingId(id);
    try {
      await deletePostAction(id);
      setPosts(posts.filter(p => p.id !== id));
    } catch (err) {
      alert('Failed to delete post');
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
          <tr>
            <th className="py-4 px-6">Post Title & Slug</th>
            <th className="py-4 px-6">Category</th>
            <th className="py-4 px-6">Status</th>
            <th className="py-4 px-6">Published Date</th>
            <th className="py-4 px-6 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
          {posts.map((post) => {
            const isPublished = post.status === 'published';
            const dateStr = post.published_at 
              ? new Date(post.published_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
              : '—';

            return (
              <tr key={post.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-4 px-6">
                  <p className="font-bold text-slate-900 text-sm">{post.title}</p>
                  <p className="text-[11px] font-mono text-slate-400">/blog/{post.slug}</p>
                </td>
                <td className="py-4 px-6">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-fca-green border border-emerald-200">
                    {post.category}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <button
                    type="button"
                    disabled={loadingId === post.id}
                    onClick={() => handleTogglePublish(post)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-all shadow-2xs ${
                      isPublished 
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                        : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                    }`}
                    title="Click to toggle publish/unpublish"
                  >
                    {isPublished ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Clock className="w-3.5 h-3.5 text-amber-600" />}
                    <span>{isPublished ? 'Published' : 'Draft'}</span>
                  </button>
                </td>
                <td className="py-4 px-6 text-slate-500">{dateStr}</td>
                <td className="py-4 px-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/posts/${post.id}/edit`}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-fca-green hover:bg-fca-green-dark transition-colors shadow-xs"
                    >
                      Edit
                    </Link>

                    <Link
                      href={isPublished ? `/blog/${post.slug}` : `/blog/${post.slug}?preview=true`}
                      target="_blank"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-fca-green"
                      title={isPublished ? 'View Live' : 'Preview Draft'}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>

                    <button
                      type="button"
                      disabled={loadingId === post.id}
                      onClick={() => handleDelete(post.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 transition-colors"
                      title="Delete Post"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

