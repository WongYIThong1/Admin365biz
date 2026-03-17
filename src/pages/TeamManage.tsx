import React, { useEffect, useState } from 'react';
import { getTeams, toggleTeamStatus, extendSubscription, createInvite, getInvites, revokeInvite } from '../lib/api';
import { toast } from 'sonner';
import { getErrorMessage } from '../lib/error-utils';
import { 
  UsersRound, 
  RefreshCw,
  Search,
  Calendar,
  ShieldAlert,
  ShieldCheck,
  Ticket,
  Plus,
  Trash2,
  X,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

interface Team {
  bookId: string;
  teamName: string;
  memberCount: number;
  expiresAt: string | null;
  forceInactive: boolean;
  status: 'active' | 'inactive';
}

interface Invite {
  inviteId: number;
  bookId: string;
  role: string | null;
  maxUses: number;
  usedCount: number;
  expiresAt: string;
  active: boolean;
}

export function TeamManage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamInvites, setTeamInvites] = useState<Invite[]>([]);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [newInviteCode, setNewInviteCode] = useState<string | null>(null);
  const [inviteForm, setInviteForm] = useState({
    expiresInDays: '7',
    maxUses: '1',
    role: '',
  });

  const fetchTeams = async () => {
    setIsLoading(true);
    try {
      const res = await getTeams();
      if (res.ok) {
        setTeams(res.data);
      } else {
        toast.error(getErrorMessage(res.error));
      }
    } catch (err: any) {
      toast.error(`System Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const loadInvites = async (bookId: string) => {
    setIsModalLoading(true);
    try {
      const res = await getInvites(bookId, true);
      if (res.ok) {
        // Defensive check to prevent .filter crash
        const data = Array.isArray(res.data) ? res.data : [];
        const activeOnly = data.filter((invite: Invite) => invite.active);
        setTeamInvites(activeOnly);
      } else {
        toast.error(res.error || 'Failed to load invites');
      }
    } catch (err: any) {
      toast.error(`Registry Sync Error: ${err.message}`);
    } finally {
      setIsModalLoading(false);
    }
  };

  const handleOpenInvites = (team: Team) => {
    setSelectedTeam(team);
    setShowInviteModal(true);
    setNewInviteCode(null);
    setInviteForm({
      expiresInDays: '7',
      maxUses: '1',
      role: '',
    });
    loadInvites(team.bookId);
  };

  const handleCreateInvite = async () => {
    if (!selectedTeam) return;
    setIsModalLoading(true);
    try {
      const expiresInDays = Math.max(1, Number(inviteForm.expiresInDays) || 7);
      const maxUses = Math.max(1, Number(inviteForm.maxUses) || 1);
      const res = await createInvite(selectedTeam.bookId, {
        expires_in_days: expiresInDays,
        max_uses: maxUses,
        role: inviteForm.role.trim() || null,
      });
      if (res.ok) {
        const code = res.data.code;
        setNewInviteCode(code);
        toast.success('Invite code created');
        await loadInvites(selectedTeam.bookId);
      } else {
        toast.error(res.error || 'Failed to create invite');
      }
    } catch (err: any) {
      toast.error(`Operation Error: ${err.message}`);
    } finally {
      setIsModalLoading(false);
    }
  };

  const handleRevokeInvite = async (inviteId: number) => {
    try {
      const res = await revokeInvite(inviteId);
      if (res.ok) {
        toast.success('Invite revoked');
        if (selectedTeam) await loadInvites(selectedTeam.bookId);
      } else {
        const msg = res.error ? getErrorMessage(res.error) : 'Failed to revoke';
        toast.error(msg);
      }
    } catch (err: any) {
      toast.error(`Revoke Error: ${err.message}`);
    }
  };

  const handleToggleStatus = async (bookId: string, currentStatus: boolean) => {
    try {
      const res = await toggleTeamStatus(bookId, !currentStatus);
      if (res.ok) {
        toast.success(`Team ${!currentStatus ? 'disabled' : 'enabled'} successfully`);
        fetchTeams();
      } else {
        toast.error(getErrorMessage(res.error));
      }
    } catch (err: any) {
      toast.error(`System Error: ${err.message}`);
    }
  };

  const handleExtend = async (bookId: string) => {
    const days = parseInt(prompt('Enter days to extend (e.g. 30):') || '0');
    if (!days || days <= 0) return;

    try {
      const res = await extendSubscription(bookId, days);
      if (res.ok) {
        toast.success(`Subscription extended by ${days} days`);
        fetchTeams();
      } else {
        toast.error(getErrorMessage(res.error));
      }
    } catch (err: any) {
      toast.error(`System Error: ${err.message}`);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const filteredTeams = teams.filter(team => 
    team.teamName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex max-w-[1600px] flex-col gap-4 py-6 text-left">
      <div className="flex flex-col gap-4 border-b border-zinc-100 pb-5 md:flex-row md:items-center md:justify-end">
        <div className="flex items-center gap-2">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-black transition-colors" />
            <input 
              type="text" 
              placeholder="Filter teams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-60 border border-zinc-200 bg-white pl-9 pr-4 text-sm focus:outline-none focus:border-black transition-all"
            />
          </div>
          
          <button 
            onClick={fetchTeams}
            disabled={isLoading}
            className="flex h-10 w-10 items-center justify-center border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 transition-all disabled:opacity-50"
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="relative min-h-[400px]">
        {isLoading && (
          <div className="absolute inset-x-0 top-0 z-10 flex h-1 items-end overflow-hidden">
            <div className="h-full w-full bg-zinc-100 italic transition-all">
              <div className="h-full bg-black animate-progress origin-left"></div>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200">
                <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-widest text-zinc-400">Team Name</th>
                <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-widest text-zinc-400">Members</th>
                <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-widest text-zinc-400">Subscription</th>
                <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-widest text-zinc-400">Status</th>
                <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-widest text-zinc-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredTeams.map((team) => (
                <tr key={team.bookId} className="group hover:bg-zinc-50/50 transition-all font-medium text-left">
                  <td className="px-4 py-5 text-sm">
                    <div className="flex items-center gap-3 text-left">
                      <div className="flex h-8 w-8 items-center justify-center bg-zinc-100 text-zinc-700 transition-colors group-hover:bg-zinc-200">
                        <UsersRound className="h-4 w-4" />
                      </div>
                      <span className="text-black font-medium">{team.teamName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-5 text-sm text-zinc-600">
                    {team.memberCount}
                  </td>
                  <td className="px-4 py-5 text-sm">
                    <div className="flex flex-col gap-0.5 text-left">
                      <span className={cn(
                        "text-sm",
                        team.expiresAt && new Date(team.expiresAt) < new Date() ? "text-rose-600" : "text-black"
                      )}>
                        {team.expiresAt ? format(new Date(team.expiresAt), 'MMM dd, yyyy') : 'Perpetual'}
                      </span>
                      {team.expiresAt && (
                         <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                           <Calendar className="h-2.5 w-2.5" />
                           Renewal Date
                         </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-5 text-sm text-left">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        team.status === 'active' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"
                      )} />
                      <span className={cn(
                        "text-[11px] uppercase tracking-[0.14em]",
                        team.status === 'active' ? "text-emerald-700" : "text-rose-700"
                      )}>
                        {team.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-5 text-sm text-right">
                    <div className="flex items-center justify-end gap-2 outline-none">
                      <button 
                        onClick={() => handleExtend(team.bookId)}
                        className="h-8 px-3 border border-zinc-200 bg-white text-[11px] font-medium text-black hover:border-black transition-all"
                      >
                        Extend
                      </button>
                      <button 
                        onClick={() => handleOpenInvites(team)}
                        className="flex h-8 items-center gap-2 border border-black bg-black px-3 text-[11px] font-medium text-white hover:bg-zinc-800 transition-all"
                      >
                        <Ticket className="h-3 w-3" />
                        Invites
                      </button>
                      <button 
                         onClick={() => handleToggleStatus(team.bookId, team.forceInactive)}
                         className={cn(
                           "flex h-8 w-8 items-center justify-center border transition-all",
                           team.forceInactive 
                             ? "bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100" 
                             : "bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100"
                         )}
                      >
                         {team.forceInactive ? <ShieldCheck className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* NEW & IMPROVED DARK MODAL */}
      {showInviteModal && selectedTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4 backdrop-blur-md">
          <div className="w-full max-w-4xl overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
              <div className="border-b border-slate-200 p-6 lg:border-b-0 lg:border-r">
                <div className="flex items-start justify-between gap-4">
                  <div className="text-left">
                    <h2 className="text-xl font-semibold tracking-tight text-slate-950">{selectedTeam.teamName}</h2>
                    <div className="mt-1 text-sm text-slate-500">{selectedTeam.bookId}</div>
                  </div>
                  <button
                    onClick={() => setShowInviteModal(false)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-6 text-left">
                  <div className="grid gap-4">
                    <div>
                      <label className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                        Expires In Days
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={inviteForm.expiresInDays}
                        onChange={(e) =>
                          setInviteForm((current) => ({ ...current, expiresInDays: e.target.value }))
                        }
                        className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-900 outline-none focus:border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                        Max Uses
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={inviteForm.maxUses}
                        onChange={(e) =>
                          setInviteForm((current) => ({ ...current, maxUses: e.target.value }))
                        }
                        className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-900 outline-none focus:border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                        Role
                      </label>
                      <input
                        type="text"
                        value={inviteForm.role}
                        onChange={(e) =>
                          setInviteForm((current) => ({ ...current, role: e.target.value }))
                        }
                        placeholder="Optional"
                        className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-900 outline-none focus:border-slate-300"
                      />
                    </div>
                  </div>

                  <button 
                    onClick={handleCreateInvite}
                    disabled={isModalLoading}
                    className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
                  >
                    {isModalLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-4 w-4" />}
                    Create Invite Code
                  </button>

                  {newInviteCode && (
                    <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <div>
                        <p className="text-xs text-slate-500">Latest code</p>
                        <code className="mt-1 block break-all text-sm font-medium tracking-[0.12em] text-slate-950">{newInviteCode}</code>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6">
                <div className="mb-4 flex items-center justify-between gap-4 border-b border-slate-200 pb-3 text-left">
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight text-slate-950">Invites</h3>
                  </div>
                  <span className="text-sm text-slate-500">
                    {teamInvites.length} active
                  </span>
                </div>

                <div className="max-h-[520px] overflow-auto">
                  {teamInvites.length === 0 && !isModalLoading ? (
                    <div className="flex min-h-[260px] items-center justify-center border border-dashed border-slate-200 bg-slate-50 px-6 text-center">
                      <div>
                        <AlertCircle className="mx-auto h-8 w-8 text-slate-300" />
                        <p className="mt-4 text-sm text-slate-500">No active invite codes for this team.</p>
                      </div>
                    </div>
                  ) : (
                    <table className="min-w-full text-left">
                      <thead className="border-b border-slate-200 text-[11px] uppercase tracking-[0.18em] text-slate-400">
                        <tr>
                          <th className="py-3 pr-4 font-semibold">Code</th>
                          <th className="px-4 py-3 font-semibold">Usage</th>
                          <th className="px-4 py-3 font-semibold">Expires</th>
                          <th className="py-3 pl-4 text-right font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {teamInvites.map((invite) => (
                          <tr key={invite.inviteId} className="border-b border-slate-100 transition-colors hover:bg-slate-50/70">
                            <td className="py-4 pr-4">
                              <p className="font-medium text-slate-950">Invite #{invite.inviteId}</p>
                            </td>
                            <td className="px-4 py-4 text-sm text-slate-500">
                              {invite.usedCount}/{invite.maxUses}
                            </td>
                            <td className="px-4 py-4 text-sm text-slate-500">
                              {format(new Date(invite.expiresAt), 'MMM dd, yyyy')}
                            </td>
                            <td className="py-4 pl-4">
                              <div className="flex items-center justify-end">
                                <button 
                                  onClick={() => handleRevokeInvite(invite.inviteId)}
                                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-rose-200 bg-white text-rose-600 transition hover:bg-rose-50"
                                  title="Revoke Key"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 border-t border-slate-200 px-8 py-4 text-center">
               <AlertCircle className="h-4 w-4 text-slate-400" />
               <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
                  Plaintext is only available when a code is first created or cloned.
               </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
