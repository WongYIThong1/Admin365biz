import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import {
  createBookDatabaseSync,
  getAccountBooks,
  requestBookResync,
  type AccountBookListResponse,
  type SyncRequest,
  type SyncShard,
} from '../lib/api';
import { getErrorMessage } from '../lib/error-utils';

const syncContentOptions = ['all', 'pi', 'creditor', 'creditortype', 'stock', 'stockgroup', 'taxcode'] as const;

export function VersionControl() {
  const [books, setBooks] = useState<AccountBookListResponse | null>(null);
  const [isLoadingBooks, setIsLoadingBooks] = useState(true);
  const [isCreatingShard, setIsCreatingShard] = useState(false);
  const [isRequestingResync, setIsRequestingResync] = useState(false);
  const [latestShard, setLatestShard] = useState<SyncShard | null>(null);
  const [latestResync, setLatestResync] = useState<SyncRequest | null>(null);
  const [shardForm, setShardForm] = useState({
    shard_code: '',
    database_url: '',
    is_default: false,
  });
  const [resyncForm, setResyncForm] = useState({
    bookId: '',
    content: 'all',
    reason: 'manual-resync',
  });

  useEffect(() => {
    const loadBooks = async () => {
      setIsLoadingBooks(true);
      try {
        const res = await getAccountBooks(200, 0);
        if (res.ok) {
          setBooks(res.data);
          const firstBookId = String(res.data.items[0]?.id || res.data.items[0]?.bookId || '');
          if (firstBookId) {
            setResyncForm((current) => ({ ...current, bookId: current.bookId || firstBookId }));
          }
        } else {
          toast.error(getErrorMessage(res.error));
        }
      } catch (error) {
        toast.error('Failed to load account books');
      } finally {
        setIsLoadingBooks(false);
      }
    };

    loadBooks();
  }, []);

  const handleCreateShard = async (event: FormEvent) => {
    event.preventDefault();
    setIsCreatingShard(true);
    try {
      const result = await createBookDatabaseSync(shardForm);
      if (result.ok) {
        setLatestShard(result.data);
        toast.success(`Shard ${result.data.shardCode} submitted`);
        setShardForm({ shard_code: '', database_url: '', is_default: false });
      } else {
        toast.error(getErrorMessage(result.error));
      }
    } finally {
      setIsCreatingShard(false);
    }
  };

  const handleRequestResync = async (event: FormEvent) => {
    event.preventDefault();
    if (!resyncForm.bookId) {
      toast.error('Please select a book');
      return;
    }

    setIsRequestingResync(true);
    try {
      const result = await requestBookResync(resyncForm.bookId, {
        content: resyncForm.content,
        reason: resyncForm.reason.trim() || 'manual-resync',
      });
      if (result.ok) {
        setLatestResync(result.data);
        toast.success(`Resync request #${result.data.requestId} submitted`);
      } else {
        toast.error(getErrorMessage(result.error));
      }
    } finally {
      setIsRequestingResync(false);
    }
  };

  return (
    <div className="space-y-6 py-6">
      <div className="flex justify-end border-b border-slate-200 pb-4">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold tracking-tight text-slate-950">Register Sync Shard</h2>
          <form className="mt-6 space-y-4" onSubmit={handleCreateShard}>
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                Shard Code
              </label>
              <input
                required
                value={shardForm.shard_code}
                onChange={(e) => setShardForm((current) => ({ ...current, shard_code: e.target.value }))}
                className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-slate-300"
                placeholder="db2"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                Database URL
              </label>
              <input
                required
                value={shardForm.database_url}
                onChange={(e) => setShardForm((current) => ({ ...current, database_url: e.target.value }))}
                className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-slate-300"
                placeholder="postgresql://root:root@host:5432/db"
              />
            </div>
            <label className="flex items-center gap-3 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={shardForm.is_default}
                onChange={(e) => setShardForm((current) => ({ ...current, is_default: e.target.checked }))}
                className="h-4 w-4 rounded border-slate-300"
              />
              Set as default shard
            </label>
            <button
              type="submit"
              disabled={isCreatingShard}
              className="flex h-10 items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
            >
              {isCreatingShard ? 'Submitting...' : 'Create Shard'}
            </button>
          </form>

          {latestShard && (
            <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-medium text-slate-950">{latestShard.shardCode}</p>
              <p className="mt-1">{latestShard.databaseUrl}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.14em] text-slate-500">
                Status: {latestShard.status}
              </p>
            </div>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold tracking-tight text-slate-950">Request Book Resync</h2>
          <form className="mt-6 space-y-4" onSubmit={handleRequestResync}>
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                Book
              </label>
              <select
                value={resyncForm.bookId}
                onChange={(e) => setResyncForm((current) => ({ ...current, bookId: e.target.value }))}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-300"
                disabled={isLoadingBooks}
              >
                <option value="">Select a book</option>
                {(books?.items || []).map((item, index) => {
                  const bookId = String(item.id || item.bookId || '');
                  const label = String(item.company_name || item.teamName || item.name || `Book ${index + 1}`);
                  return (
                    <option key={`${bookId}-${index}`} value={bookId}>
                      {label} {bookId ? `(${bookId})` : ''}
                    </option>
                  );
                })}
              </select>
            </div>
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
                value={resyncForm.reason}
                onChange={(e) => setResyncForm((current) => ({ ...current, reason: e.target.value }))}
                className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-slate-300"
                placeholder="manual-resync"
              />
            </div>
            <button
              type="submit"
              disabled={isRequestingResync || isLoadingBooks}
              className="flex h-10 items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
            >
              {isRequestingResync ? 'Submitting...' : 'Request Resync'}
            </button>
          </form>

          {latestResync && (
            <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-medium text-slate-950">Request #{latestResync.requestId}</p>
              <p className="mt-1">Book: {latestResync.bookId}</p>
              <p className="mt-1">Content: {latestResync.content}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.14em] text-slate-500">
                Status: {latestResync.status}
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
