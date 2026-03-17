import React, { useEffect, useState } from 'react';
import { getAccountBooks, requestBookResync } from '../lib/api';
import { toast } from 'sonner';
import { getErrorMessage } from '../lib/error-utils';
import { 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw,
  Search,
  GitBranch,
  X,
} from 'lucide-react';
import { cn } from '../lib/utils';

interface AccountBookRes {
  limit: number;
  offset: number;
  total: number;
  items: any[];
}

export function AccountBookManage() {
  const [data, setData] = useState<AccountBookRes | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState<Record<string, unknown> | null>(null);
  const [showResyncModal, setShowResyncModal] = useState(false);
  const [isSubmittingResync, setIsSubmittingResync] = useState(false);
  const [resyncForm, setResyncForm] = useState({
    content: 'all',
    reason: 'manual-resync',
  });
  const limit = 50;

  const syncContentOptions = ['all', 'pi', 'creditor', 'creditortype', 'stock', 'stockgroup', 'taxcode'] as const;

  const fetchData = async (currentOffset: number) => {
    setIsLoading(true);
    try {
      const res = await getAccountBooks(limit, currentOffset);
      if (res.ok) {
        setData(res.data);
      } else {
        toast.error(getErrorMessage(res.error));
      }
    } catch (err) {
      toast.error('Failed to connect to the server');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(page * limit);
  }, [page]);

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  const columns = data?.items.length ? Object.keys(data.items[0]) : [];
  const filteredItems = (data?.items || []).filter((item) =>
    query.trim()
      ? JSON.stringify(item).toLowerCase().includes(query.toLowerCase())
      : true
  );
  const getBookId = (item: Record<string, unknown>) => String(item.id || item.bookId || '');
  const getBookLabel = (item: Record<string, unknown>) =>
    String(item.company_name || item.teamName || item.name || getBookId(item) || 'Book');

  const handleOpenResync = (item: Record<string, unknown>) => {
    setSelectedBook(item);
    setResyncForm({
      content: 'all',
      reason: 'manual-resync',
    });
    setShowResyncModal(true);
  };

  const handleSubmitResync = async () => {
    if (!selectedBook) return;
    const bookId = getBookId(selectedBook);
    if (!bookId) {
      toast.error('This row does not contain a valid book id');
      return;
    }

    setIsSubmittingResync(true);
    try {
      const result = await requestBookResync(bookId, {
        content: resyncForm.content,
        reason: resyncForm.reason.trim() || 'manual-resync',
      });
      if (result.ok) {
        toast.success(`Resync request #${result.data.requestId} submitted`);
        setShowResyncModal(false);
        setSelectedBook(null);
      } else {
        toast.error(getErrorMessage(result.error));
      }
    } finally {
      setIsSubmittingResync(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 py-6">
      <section className="relative min-h-[400px] overflow-hidden">
        {isLoading && (
          <div className="absolute inset-x-0 top-0 z-10 flex h-1 items-end overflow-hidden">
            <div className="h-full w-full bg-slate-100 italic transition-all">
              <div className="h-full origin-left animate-progress bg-slate-950"></div>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-4 border-b border-slate-200 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center lg:justify-end">
            <div className="relative max-w-sm flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filter visible rows..."
                className="h-10 w-full border border-slate-200 bg-white pl-10 pr-4 text-sm focus:outline-none focus:border-slate-300"
              />
            </div>
            <button 
              onClick={() => fetchData(page * limit)}
              disabled={isLoading}
              className="flex h-10 w-10 items-center justify-center border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50"
            >
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] uppercase tracking-[0.18em] text-slate-400">
                {columns.map((col) => (
                  <th key={col} className="px-4 py-4 font-semibold">
                    {col.replace(/_/g, ' ')}
                  </th>
                ))}
                {columns.length > 0 && <th className="px-4 py-4 text-right font-semibold">Actions</th>}
                {!columns.length && !isLoading && (
                   <th className="px-4 py-4 font-semibold">Status</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item, idx) => (
                <tr key={idx} className="group transition-all hover:bg-slate-50/70">
                  {columns.map((col) => (
                    <td key={col} className="border-b border-slate-100 px-4 py-4 text-sm text-slate-600">
                      {typeof item[col] === 'boolean' ? (
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            item[col] ? "bg-emerald-500" : "bg-slate-300"
                          )} />
                          <span className={cn(
                            "text-[11px] font-semibold uppercase tracking-[0.14em]",
                            item[col] ? "text-emerald-700" : "text-zinc-400"
                          )}>
                            {item[col] ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      ) : (
                        item[col]?.toString() || '-'
                      )}
                    </td>
                  ))}
                  {columns.length > 0 && (
                    <td className="border-b border-slate-100 px-4 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenResync(item)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-950"
                        title="Request resync"
                      >
                        <GitBranch className="h-4 w-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              
              {!isLoading && filteredItems.length === 0 && (
                <tr>
                  <td colSpan={Math.max(columns.length, 1)} className="px-4 py-20 text-center italic text-slate-400">
                    No records matched your current criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 py-4">
          <div className="text-xs tracking-tight text-slate-400">
            <span className="font-medium text-slate-950">{filteredItems.length}</span> rows
            <span className="mx-2">/</span>
            Total <span className="font-medium text-slate-950">{data?.total || 0}</span> items
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-xs font-medium text-slate-400">
              Page <span className="text-slate-950">{page + 1}</span> of {totalPages || 1}
            </div>
            
            <div className="flex gap-1">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0 || isLoading}
                className="flex h-9 w-9 items-center justify-center border border-slate-200 bg-white text-slate-950 transition-all hover:border-slate-300 disabled:opacity-20 disabled:hover:border-slate-200"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page >= totalPages - 1 || isLoading}
                className="flex h-9 w-9 items-center justify-center border border-slate-200 bg-white text-slate-950 transition-all hover:border-slate-300 disabled:opacity-20 disabled:hover:border-slate-200"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {showResyncModal && selectedBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-slate-950">Request Resync</h2>
                <p className="mt-1 text-sm text-slate-500">{getBookLabel(selectedBook)}</p>
                <p className="mt-1 text-xs text-slate-400">{getBookId(selectedBook)}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowResyncModal(false);
                  setSelectedBook(null);
                }}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                  Content
                </label>
                <select
                  value={resyncForm.content}
                  onChange={(e) => setResyncForm((current) => ({ ...current, content: e.target.value }))}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-300"
                >
                  {syncContentOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                  Reason
                </label>
                <input
                  type="text"
                  value={resyncForm.reason}
                  onChange={(e) => setResyncForm((current) => ({ ...current, reason: e.target.value }))}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-300"
                  placeholder="manual-resync"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowResyncModal(false);
                  setSelectedBook(null);
                }}
                className="flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitResync}
                disabled={isSubmittingResync}
                className="flex h-10 items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
              >
                {isSubmittingResync ? 'Submitting...' : 'Request Resync'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
