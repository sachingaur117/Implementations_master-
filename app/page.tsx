'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Truck, Briefcase, ArrowRight, Plus, BarChart3, Clock, CheckCircle, Users,
  Loader2, Trash2, Calendar, Package, User, Search, Filter, X, ChevronUp,
  ChevronDown, ExternalLink, SlidersHorizontal
} from 'lucide-react';

interface ImplementationSummary {
  _id: string;
  buid: string;
  customerName: string;
  tamName: string;
  productName?: string;
  implementationStartDate?: string;
  plannedEndDate?: string;
  implementationStatus?: 'Ongoing' | 'Delayed' | 'Completed' | 'On Hold';
  status: 'In-Progress' | 'Completed';
  currentStep: number;
  completionPercent?: number;
  createdAt: string;
}

type SortKey = 'customerName' | 'tamName' | 'productName' | 'implementationStatus' | 'completionPercent' | 'implementationStartDate' | 'plannedEndDate' | 'currentStep';
type SortDir = 'asc' | 'desc';

function toSlug(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
}

const TOTAL_STEPS = 8;

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string; border: string }> = {
  'Ongoing': { bg: 'bg-blue-500/15', text: 'text-blue-300', dot: 'bg-blue-400', border: 'border-blue-500/30' },
  'Delayed': { bg: 'bg-red-500/15', text: 'text-red-300', dot: 'bg-red-400', border: 'border-red-500/30' },
  'Completed': { bg: 'bg-green-500/15', text: 'text-green-300', dot: 'bg-green-400', border: 'border-green-500/30' },
  'On Hold': { bg: 'bg-amber-500/15', text: 'text-amber-300', dot: 'bg-amber-400', border: 'border-amber-500/30' },
};

const PRODUCT_STYLES: Record<string, string> = {
  'Rentlz': 'text-indigo-300 bg-indigo-500/15 border border-indigo-500/30',
  'ETS': 'text-purple-300 bg-purple-500/15 border border-purple-500/30',
  'Shuttle': 'text-cyan-300 bg-cyan-500/15 border border-cyan-500/30',
};

const STATUS_OPTIONS = ['All', 'Ongoing', 'Delayed', 'Completed', 'On Hold'] as const;
const PRODUCT_OPTIONS = ['All', 'Rentlz', 'ETS', 'Shuttle'] as const;

export default function HomePage() {
  const router = useRouter();
  const [implementations, setImplementations] = useState<ImplementationSummary[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [mode, setMode] = useState<'dashboard' | 'new' | 'resume'>('dashboard');
  const [customerName, setCustomerName] = useState('');
  const [tamName, setTamName] = useState('');
  const [resumeName, setResumeName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Search & filter state
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterProduct, setFilterProduct] = useState<string>('All');
  const [sortKey, setSortKey] = useState<SortKey>('customerName');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [showFilters, setShowFilters] = useState(false);

  const deleteImplementation = async (buid: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    await fetch(`/api/implementations/${buid}`, { method: 'DELETE' });
    setImplementations((prev) => prev.filter((i) => i.buid !== buid));
  };

  useEffect(() => {
    fetch('/api/implementations', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => setImplementations(Array.isArray(data) ? data : []))
      .catch(() => setImplementations([]))
      .finally(() => setLoadingList(false));
  }, []);

  const handleNewImplementation = async () => {
    if (!customerName.trim() || !tamName.trim()) { setError('All fields are required.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/implementations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerName: customerName.trim(), tamName: tamName.trim() }),
      });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || 'Failed'); }
      const doc = await res.json();
      router.push(`/${doc.buid}/identity`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to create implementation');
    } finally { setLoading(false); }
  };

  const handleResume = () => {
    if (!resumeName.trim()) { setError('Please enter the client name.'); return; }
    router.push(`/${toSlug(resumeName.trim())}/identity`);
  };

  // Derived stats
  const inProgress = implementations.filter((i) => i.implementationStatus === 'Ongoing' || i.implementationStatus === 'Delayed').length;
  const completed = implementations.filter((i) => i.implementationStatus === 'Completed').length;
  const onHold = implementations.filter((i) => i.implementationStatus === 'On Hold').length;
  const avgCompletion = implementations.length
    ? Math.round(implementations.reduce((s, i) => s + (i.completionPercent ?? 0), 0) / implementations.length)
    : 0;

  // Filtered + sorted list
  const filtered = useMemo(() => {
    let list = [...implementations];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((i) =>
        i.customerName.toLowerCase().includes(q) ||
        i.tamName.toLowerCase().includes(q) ||
        i.buid.toLowerCase().includes(q) ||
        (i.productName || '').toLowerCase().includes(q)
      );
    }
    if (filterStatus !== 'All') list = list.filter((i) => (i.implementationStatus || 'Ongoing') === filterStatus);
    if (filterProduct !== 'All') list = list.filter((i) => (i.productName || 'Rentlz') === filterProduct);

    list.sort((a, b) => {
      let av: string | number = '';
      let bv: string | number = '';
      switch (sortKey) {
        case 'customerName': av = a.customerName; bv = b.customerName; break;
        case 'tamName': av = a.tamName; bv = b.tamName; break;
        case 'productName': av = a.productName || 'Rentlz'; bv = b.productName || 'Rentlz'; break;
        case 'implementationStatus': av = a.implementationStatus || ''; bv = b.implementationStatus || ''; break;
        case 'completionPercent': av = a.completionPercent ?? 0; bv = b.completionPercent ?? 0; break;
        case 'implementationStartDate': av = a.implementationStartDate || ''; bv = b.implementationStartDate || ''; break;
        case 'plannedEndDate': av = a.plannedEndDate || ''; bv = b.plannedEndDate || ''; break;
        case 'currentStep': av = a.currentStep; bv = b.currentStep; break;
      }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [implementations, search, filterStatus, filterProduct, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronUp className="w-3 h-3 text-slate-600 opacity-40" />;
    return sortDir === 'asc'
      ? <ChevronUp className="w-3 h-3 text-indigo-400" />
      : <ChevronDown className="w-3 h-3 text-indigo-400" />;
  };

  const activeFiltersCount = (filterStatus !== 'All' ? 1 : 0) + (filterProduct !== 'All' ? 1 : 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-6">
      <div className="max-w-screen-2xl mx-auto">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <Truck className="w-8 h-8 text-indigo-400" />
              Implementations Portal
            </h1>
            <p className="text-slate-400 mt-1 text-sm">Track and manage all client implementations</p>
          </div>
          <button
            onClick={() => { setMode('new'); setError(''); }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-3 rounded-xl transition-all shadow-lg shadow-indigo-900/40"
          >
            <Plus className="w-4 h-4" /> New Implementation
          </button>
        </div>

        {/* ── Stats Row ── */}
        {!loadingList && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-7">
            {[
              { icon: <Users className="w-5 h-5 text-indigo-400" />, label: 'Total Clients', value: implementations.length, color: 'text-white' },
              { icon: <Clock className="w-5 h-5 text-amber-400" />, label: 'In Progress', value: inProgress, color: 'text-amber-400' },
              { icon: <CheckCircle className="w-5 h-5 text-green-400" />, label: 'Completed', value: completed, color: 'text-green-400' },
              { icon: <BarChart3 className="w-5 h-5 text-purple-400" />, label: 'Avg. Completion', value: `${avgCompletion}%`, color: 'text-purple-400' },
            ].map((s) => (
              <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur">
                <div className="flex items-center gap-3 mb-1">{s.icon}<span className="text-slate-400 text-sm font-medium">{s.label}</span></div>
                <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Search & Filter Bar ── */}
        {!loadingList && implementations.length > 0 && (
          <div className="mb-4 flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by client, TAM, BUID or product…"
                className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500/60 focus:bg-white/8 transition-all"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter toggle button */}
            <button
              onClick={() => setShowFilters(f => !f)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${showFilters || activeFiltersCount > 0
                  ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="bg-indigo-500 text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        )}

        {/* ── Filter Pills ── */}
        {showFilters && !loadingList && implementations.length > 0 && (
          <div className="mb-5 flex flex-wrap gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur">
            {/* Status filter */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1"><Filter className="w-3 h-3" />Status</p>
              <div className="flex flex-wrap gap-1.5">
                {STATUS_OPTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${filterStatus === s
                        ? 'bg-indigo-500 text-white border-indigo-400'
                        : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/30 hover:text-white'
                      }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="w-px bg-white/10 self-stretch" />
            {/* Product filter */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1"><Package className="w-3 h-3" />Product</p>
              <div className="flex flex-wrap gap-1.5">
                {PRODUCT_OPTIONS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setFilterProduct(p)}
                    className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${filterProduct === p
                        ? 'bg-indigo-500 text-white border-indigo-400'
                        : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/30 hover:text-white'
                      }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            {activeFiltersCount > 0 && (
              <>
                <div className="w-px bg-white/10 self-stretch" />
                <div className="flex items-end">
                  <button
                    onClick={() => { setFilterStatus('All'); setFilterProduct('All'); }}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-red-400 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 transition-all"
                  >
                    <X className="w-3 h-3" /> Clear filters
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Implementations Table ── */}
        {loadingList ? (
          <div className="flex items-center justify-center py-24 text-slate-400">
            <Loader2 className="w-6 h-6 mr-3 animate-spin" />
            <span className="font-medium">Loading implementations…</span>
          </div>
        ) : implementations.length === 0 ? (
          <div className="text-center py-24">
            <Truck className="w-16 h-16 mx-auto mb-4 text-slate-700" />
            <p className="text-slate-400 font-medium text-lg">No implementations yet</p>
            <p className="text-slate-600 text-sm mt-1">Click &quot;New Implementation&quot; to get started</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white/5 border border-white/10 rounded-2xl backdrop-blur">
            <Search className="w-12 h-12 mx-auto mb-3 text-slate-700" />
            <p className="text-slate-400 font-semibold">No results found</p>
            <p className="text-slate-600 text-sm mt-1">Try adjusting your search or filters</p>
            <button onClick={() => { setSearch(''); setFilterStatus('All'); setFilterProduct('All'); }}
              className="mt-4 text-indigo-400 text-sm hover:underline">Clear all</button>
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur overflow-hidden">
            {/* Result count */}
            <div className="px-5 py-3 border-b border-white/8 flex items-center justify-between">
              <p className="text-slate-400 text-xs font-semibold">
                Showing <span className="text-white font-bold">{filtered.length}</span> of <span className="text-white font-bold">{implementations.length}</span> implementations
              </p>
              <p className="text-slate-600 text-xs">Click a row to open</p>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-white/8">
                    {(
                      [
                        { key: 'customerName', label: 'Client', w: '' },
                        { key: 'tamName', label: 'TAM / KAM', w: '' },
                        { key: 'productName', label: 'Product', w: 'w-24' },
                        { key: 'implementationStatus', label: 'Status', w: 'w-28' },
                        { key: 'implementationStartDate', label: 'Start Date', w: 'w-32' },
                        { key: 'plannedEndDate', label: 'Go-Live', w: 'w-32' },
                        { key: 'currentStep', label: 'Step', w: 'w-20' },
                        { key: 'completionPercent', label: 'Progress', w: 'w-36' },
                      ] as { key: SortKey; label: string; w: string }[]
                    ).map((col) => (
                      <th
                        key={col.key}
                        onClick={() => handleSort(col.key)}
                        className={`${col.w} px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-500 cursor-pointer hover:text-slate-300 select-none transition-colors group`}
                      >
                        <span className="flex items-center gap-1">
                          {col.label}
                          <SortIcon col={col.key} />
                        </span>
                      </th>
                    ))}
                    <th className="w-20 px-4 py-3 text-right text-[10px] font-black uppercase tracking-widest text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.map((impl) => {
                    const pct = impl.completionPercent ?? 0;
                    const implStatus = impl.implementationStatus || 'Ongoing';
                    const statusStyle = STATUS_STYLES[implStatus] || STATUS_STYLES['Ongoing'];
                    const productStyle = PRODUCT_STYLES[impl.productName || 'Rentlz'] || PRODUCT_STYLES['Rentlz'];
                    const progressColor = pct === 100 ? '#22c55e' : implStatus === 'Delayed' ? '#f87171' : '#6366f1';

                    return (
                      <tr
                        key={impl._id}
                        onClick={() => router.push(`/${impl.buid}/identity`)}
                        className="cursor-pointer hover:bg-white/5 transition-colors group"
                      >
                        {/* Client */}
                        <td className="px-4 py-3.5">
                          <div>
                            <p className="text-white font-bold text-sm group-hover:text-indigo-300 transition-colors">{impl.customerName}</p>
                            <p className="text-slate-600 text-[10px] font-mono mt-0.5">{impl.buid}</p>
                          </div>
                        </td>

                        {/* TAM */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5 text-slate-300 text-sm">
                            <User className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                            <span className="truncate max-w-[160px]">{impl.tamName}</span>
                          </div>
                        </td>

                        {/* Product */}
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center text-[11px] font-black px-2.5 py-0.5 rounded-full ${productStyle}`}>
                            {impl.productName || 'Rentlz'}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                            {implStatus}
                          </span>
                        </td>

                        {/* Start Date */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5 text-slate-300 text-sm">
                            <Calendar className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                            {formatDate(impl.implementationStartDate)}
                          </div>
                        </td>

                        {/* Go-Live */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5 text-slate-300 text-sm">
                            <Calendar className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                            {formatDate(impl.plannedEndDate)}
                          </div>
                        </td>

                        {/* Step */}
                        <td className="px-4 py-3.5">
                          <span className="text-slate-300 text-sm font-semibold">
                            {impl.currentStep}<span className="text-slate-600 font-normal">/{TOTAL_STEPS}</span>
                          </span>
                        </td>

                        {/* Progress */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 bg-slate-700/80 rounded-full h-1.5 min-w-[60px]">
                              <div
                                className="h-1.5 rounded-full transition-all"
                                style={{ width: `${pct}%`, background: progressColor }}
                              />
                            </div>
                            <span className="text-xs font-bold text-slate-300 w-8 tabular-nums">{pct}%</span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => router.push(`/${impl.buid}/identity`)}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                              title="Open"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => deleteImplementation(impl.buid, impl.customerName, e)}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Other products ── */}
        <div className="mt-8 flex items-center gap-3">
          {[
            { icon: <Briefcase className="w-4 h-4" />, label: 'ETS' },
            { icon: <ArrowRight className="w-4 h-4" />, label: 'Shuttle' },
            { icon: <Package className="w-4 h-4" />, label: 'Analytics' },
          ].map((p) => (
            <div key={p.label} className="opacity-40 flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-slate-400 text-sm font-bold cursor-not-allowed">
              {p.icon} {p.label} <span className="text-[10px] font-normal ml-1">Coming Soon</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Modal: New / Resume ── */}
      {(mode === 'new' || mode === 'resume') && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
            {mode === 'new' && (
              <>
                <h2 className="text-xl font-black text-slate-800 mb-6">Start New Implementation</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Client Name</label>
                    <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Acme Corporation"
                      className="w-full p-3 border rounded-lg focus:ring-2 ring-indigo-200 outline-none" />
                    {customerName.trim() && (
                      <p className="text-[10px] text-slate-400 mt-1 font-mono">URL: /{toSlug(customerName.trim())}/identity</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Implementation Manager (TAM / KAM)</label>
                    <input type="text" value={tamName} onChange={(e) => setTamName(e.target.value)}
                      className="w-full p-3 border rounded-lg focus:ring-2 ring-indigo-200 outline-none" />
                  </div>
                  {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => { setMode('dashboard'); setError(''); }} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors">Cancel</button>
                    <button onClick={handleNewImplementation} disabled={loading} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50">
                      {loading ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Creating…</span> : 'Start →'}
                    </button>
                  </div>
                  <button onClick={() => { setMode('resume'); setError(''); }} className="w-full text-center text-xs text-indigo-500 hover:underline pt-1">Resume an existing implementation instead</button>
                </div>
              </>
            )}
            {mode === 'resume' && (
              <>
                <h2 className="text-xl font-black text-slate-800 mb-6">Resume Implementation</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Client Name</label>
                    <input type="text" value={resumeName} onChange={(e) => setResumeName(e.target.value)}
                      placeholder="Enter client name…"
                      className="w-full p-3 border rounded-lg focus:ring-2 ring-indigo-200 outline-none" />
                  </div>
                  {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => { setMode('new'); setError(''); }} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl">Back</button>
                    <button onClick={handleResume} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl">Resume →</button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
