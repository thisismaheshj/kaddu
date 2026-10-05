import type { Session, SupabaseClient } from '@supabase/supabase-js';
import {
  ArrowLeft, Download, ExternalLink, FileText, Film, Inbox, Loader2, LogOut, Mail, MessageCircle, Phone, RefreshCw, Search, ShieldAlert, Trash2, X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { STEPS } from '../data/steps';
import { formatBytes } from '../lib/files';
import { BUCKET, SUPABASE_KEY, SUPABASE_URL, adminClient } from '../lib/supabase';
import type { SummarySection } from '../lib/submit';

type Status = 'new' | 'in_review' | 'done';
interface StoredFile { field: string; name: string; size: number; type: string; path: string }
interface Row {
  id: string;
  submission_id: string;
  submitted_at: string;
  brand_name: string | null;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  status: Status;
  notes: string | null;
  files: StoredFile[];
}
interface Detail extends Row { summary: SummarySection[] | null; data: Record<string, unknown> }

const STATUS: { value: Status; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'in_review', label: 'In review' },
  { value: 'done', label: 'Done' },
];
const statusLabel = (s: Status) => STATUS.find((x) => x.value === s)?.label ?? s;

/** Upload field key → label, taken from the Assets step. */
const FILE_LABELS: Record<string, string> = Object.fromEntries(
  STEPS.find((s) => s.id === 'assets')!.sections({}).flatMap((sec) => sec.fields.map((f) => [f.key, f.label])),
);

const fmtDate = (iso: string) => new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
const fmtDay = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

export function Admin() {
  const sb = useMemo(() => (SUPABASE_URL && SUPABASE_KEY ? adminClient() : null), []);
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [isAdmin, setIsAdmin] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    if (!sb) return;
    sb.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = sb.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, [sb]);

  useEffect(() => {
    if (!sb || !session) { setIsAdmin(undefined); return; }
    sb.rpc('is_intake_admin').then(({ data, error }) => setIsAdmin(!error && data === true));
  }, [sb, session]);

  if (!sb) return <Centered><p>Supabase is not configured for this build.</p></Centered>;
  if (session === undefined || (session && isAdmin === undefined)) return <Centered><Loader2 className="spin" /></Centered>;
  if (!session) return <Login sb={sb} />;
  if (!isAdmin) {
    return (
      <Centered>
        <div className="card login-card">
          <span className="login-icon warn"><ShieldAlert size={22} /></span>
          <h1>No access</h1>
          <p className="login-sub"><strong>{session.user.email}</strong> is signed in but is not an admin for submissions.</p>
          <button type="button" className="btn btn-secondary" onClick={() => sb.auth.signOut()}><LogOut size={16} />Sign out</button>
        </div>
      </Centered>
    );
  }
  return <Dashboard sb={sb} email={session.user.email ?? ''} />;
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="admin-center">{children}</div>;
}

function Mark() {
  return (
    <span className="brand-mark" aria-hidden>
      <svg viewBox="0 0 24 24" width="18" height="18"><path d="M4 8.5 12 4l8 4.5v7L12 20l-8-4.5z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><path d="M4 8.5 12 13l8-4.5M12 13v7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>
    </span>
  );
}

/* ---------- login ---------- */

function Login({ sb }: { sb: SupabaseClient }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(undefined);
    const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password });
    if (error) setError(error.message === 'Invalid login credentials' ? 'Incorrect email or password.' : error.message);
    setBusy(false);
  };

  return (
    <Centered>
      <form className="card login-card" onSubmit={submit}>
        <Mark />
        <h1>Submissions</h1>
        <p className="login-sub">Sign in to review client onboarding profiles.</p>
        <div className="field">
          <label className="field-label" htmlFor="email">Email</label>
          <input id="email" className="control" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="field">
          <label className="field-label" htmlFor="password">Password</label>
          <input id="password" className="control" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <p className="field-error" role="alert">{error}</p>}
        <button type="submit" className="btn btn-primary btn-block" disabled={busy}>{busy ? <Loader2 size={17} className="spin" /> : null}Sign in</button>
      </form>
    </Centered>
  );
}

/* ---------- dashboard ---------- */

function Dashboard({ sb, email }: { sb: SupabaseClient; email: string }) {
  const [rows, setRows] = useState<Row[]>();
  const [error, setError] = useState<string>();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Status | 'all'>('all');
  const [openId, setOpenId] = useState<string | null>(() => new URLSearchParams(location.hash.slice(1)).get('id'));
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await sb
      .from('intake_submissions')
      .select('id, submission_id, submitted_at, brand_name, contact_name, email, phone, status, notes, files')
      .order('submitted_at', { ascending: false })
      .limit(1000);
    if (error) setError(error.message);
    else { setRows(data as Row[]); setError(undefined); }
    setLoading(false);
  }, [sb]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { history.replaceState(null, '', openId ? `#id=${openId}` : location.pathname); }, [openId]);

  const counts = useMemo(() => {
    const c = { all: rows?.length ?? 0, new: 0, in_review: 0, done: 0 };
    rows?.forEach((r) => c[r.status]++);
    return c;
  }, [rows]);

  const weekAgo = Date.now() - 7 * 864e5;
  const thisWeek = rows?.filter((r) => new Date(r.submitted_at).getTime() > weekAgo).length ?? 0;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (rows ?? []).filter((r) =>
      (filter === 'all' || r.status === filter) &&
      (!q || [r.brand_name, r.contact_name, r.email, r.phone, r.submission_id].some((v) => v?.toLowerCase().includes(q))),
    );
  }, [rows, query, filter]);

  const patchRow = (id: string, patch: Partial<Row>) => setRows((rs) => rs?.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const exportCsv = () => {
    const cols: (keyof Row)[] = ['submission_id', 'submitted_at', 'brand_name', 'contact_name', 'email', 'phone', 'status', 'notes'];
    const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const csv = [cols.join(','), ...visible.map((r) => [...cols.map((c) => esc(r[c])), esc(r.files.length)].join(','))].join('\n').replace(/^([^\n]*)/, '$1,files');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    Object.assign(document.createElement('a'), { href: url, download: `submissions-${new Date().toISOString().slice(0, 10)}.csv` }).click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="admin">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand"><Mark /><span className="brand-text"><strong>Submissions</strong><span>Client onboarding</span></span></div>
          <div className="topbar-right">
            <span className="admin-user hide-sm">{email}</span>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => sb.auth.signOut()}><LogOut size={14} /><span className="hide-sm">Sign out</span></button>
          </div>
        </div>
      </header>

      <main className="admin-main">
        <div className="admin-stats">
          <div className="card stat"><span>Total</span><strong>{counts.all}</strong></div>
          <div className="card stat"><span>New</span><strong className="accent">{counts.new}</strong></div>
          <div className="card stat"><span>In review</span><strong>{counts.in_review}</strong></div>
          <div className="card stat"><span>Last 7 days</span><strong>{thisWeek}</strong></div>
        </div>

        <div className="admin-toolbar">
          <div className="control admin-search">
            <Search size={16} />
            <input placeholder="Search brand, contact, email, phone or ID" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search submissions" />
            {query && <button type="button" className="icon-btn" onClick={() => setQuery('')} aria-label="Clear search"><X size={14} /></button>}
          </div>
          <div className="admin-filters" role="tablist">
            {(['all', ...STATUS.map((s) => s.value)] as const).map((f) => (
              <button key={f} type="button" role="tab" aria-selected={filter === f} className={`chip ${filter === f ? 'is-active' : ''}`} onClick={() => setFilter(f)}>
                {f === 'all' ? 'All' : statusLabel(f)} <span className="chip-count">{counts[f]}</span>
              </button>
            ))}
          </div>
          <div className="admin-actions">
            <button type="button" className="btn btn-secondary btn-sm" onClick={load} disabled={loading}><RefreshCw size={14} className={loading ? 'spin' : ''} />Refresh</button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={exportCsv} disabled={!visible.length}><Download size={14} />CSV</button>
          </div>
        </div>

        {error && <p className="field-error">{error}</p>}

        {!rows ? (
          <div className="card admin-empty"><Loader2 className="spin" /></div>
        ) : visible.length === 0 ? (
          <div className="card admin-empty">
            <Inbox size={28} />
            <strong>{rows.length ? 'No matching submissions' : 'No submissions yet'}</strong>
            <span>{rows.length ? 'Try a different search or filter.' : 'Profiles appear here as soon as clients submit them.'}</span>
          </div>
        ) : (
          <div className="card admin-list">
            <div className="admin-row admin-head" aria-hidden>
              <span>Company</span><span>Contact</span><span>Submitted</span><span>Files</span><span>Status</span>
            </div>
            {visible.map((r) => (
              <button key={r.id} type="button" className={`admin-row ${r.status === 'new' ? 'is-new' : ''}`} onClick={() => setOpenId(r.id)}>
                <span className="cell-main">
                  <strong>{r.brand_name || 'Untitled company'}</strong>
                  <code>{r.submission_id}</code>
                </span>
                <span className="cell-contact">
                  <span>{r.contact_name || '—'}</span>
                  <small>{r.email || r.phone || ''}</small>
                </span>
                <span className="cell-date" title={fmtDate(r.submitted_at)}>{fmtDay(r.submitted_at)}</span>
                <span className="cell-files">{r.files.length || '—'}</span>
                <span><span className={`status-badge s-${r.status}`}>{statusLabel(r.status)}</span></span>
              </button>
            ))}
          </div>
        )}
      </main>

      {openId && (
        <DetailPanel
          sb={sb} id={openId} onClose={() => setOpenId(null)}
          onChange={(patch) => patchRow(openId, patch)}
          onDeleted={() => { setRows((rs) => rs?.filter((r) => r.id !== openId)); setOpenId(null); }}
        />
      )}
    </div>
  );
}

/* ---------- detail ---------- */

function DetailPanel({ sb, id, onClose, onChange, onDeleted }: {
  sb: SupabaseClient; id: string; onClose: () => void; onChange: (p: Partial<Row>) => void; onDeleted: () => void;
}) {
  const [d, setD] = useState<Detail>();
  const [error, setError] = useState<string>();
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await sb.from('intake_submissions').select('*').eq('id', id).single();
      if (cancelled) return;
      if (error) { setError(error.message); return; }
      const row = data as Detail;
      setD(row);
      setNotes(row.notes ?? '');
      if (row.files.length) {
        const { data: signed } = await sb.storage.from(BUCKET).createSignedUrls(row.files.map((f) => f.path), 3600);
        if (!cancelled && signed) setUrls(Object.fromEntries(signed.flatMap((s) => (s.path && s.signedUrl ? [[s.path, s.signedUrl]] : []))));
      }
    })();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { cancelled = true; document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [sb, id, onClose]);

  const update = async (patch: Partial<Pick<Row, 'status' | 'notes'>>) => {
    setSaving(true);
    const { error } = await sb.from('intake_submissions').update(patch).eq('id', id);
    setSaving(false);
    if (error) { setError(error.message); return; }
    setD((x) => (x ? { ...x, ...patch } : x));
    onChange(patch);
  };

  const remove = async () => {
    if (!d || !confirm(`Delete ${d.brand_name || d.submission_id} and all its files? This cannot be undone.`)) return;
    if (d.files.length) {
      const { error } = await sb.storage.from(BUCKET).remove(d.files.map((f) => f.path));
      if (error) { setError(`Could not delete files: ${error.message}`); return; }
    }
    const { error } = await sb.from('intake_submissions').delete().eq('id', id);
    if (error) { setError(error.message); return; }
    onDeleted();
  };

  const downloadJson = () => {
    if (!d) return;
    const url = URL.createObjectURL(new Blob([JSON.stringify(d, null, 2)], { type: 'application/json' }));
    Object.assign(document.createElement('a'), { href: url, download: `${d.submission_id}.json` }).click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const filesByField = useMemo(() => {
    const m = new Map<string, StoredFile[]>();
    d?.files.forEach((f) => m.set(f.field, [...(m.get(f.field) ?? []), f]));
    return [...m.entries()];
  }, [d]);

  const digits = d?.phone?.replace(/\D/g, '') ?? '';
  const wa = d?.data?.whatsappSame === false && (d.data.whatsapp as { cc: string; number: string } | undefined)?.number
    ? `${(d.data.whatsapp as { cc: string }).cc}${(d.data.whatsapp as { number: string }).number}`.replace(/\D/g, '')
    : digits;

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <aside className="drawer" role="dialog" aria-label="Submission details" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-head">
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close"><ArrowLeft size={18} /></button>
          <div className="drawer-title">
            <h2>{d?.brand_name || (d ? 'Untitled company' : 'Loading…')}</h2>
            {d && <span><code>{d.submission_id}</code> · {fmtDate(d.submitted_at)}</span>}
          </div>
        </div>

        {error && <p className="field-error drawer-pad">{error}</p>}
        {!d ? (
          !error && <div className="admin-empty"><Loader2 className="spin" /></div>
        ) : (
          <div className="drawer-body">
            <section className="card drawer-card">
              <div className="contact-line">
                <div>
                  <strong>{d.contact_name || 'No contact name'}</strong>
                  <span>{[d.email, d.phone].filter(Boolean).join(' · ')}</span>
                </div>
              </div>
              <div className="quick-actions">
                {d.phone && <a className="btn btn-secondary btn-sm" href={`tel:+${digits}`}><Phone size={14} />Call</a>}
                {wa && <a className="btn btn-secondary btn-sm" href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer"><MessageCircle size={14} />WhatsApp</a>}
                {d.email && <a className="btn btn-secondary btn-sm" href={`mailto:${d.email}`}><Mail size={14} />Email</a>}
              </div>
              <div className="field">
                <span className="field-label">Status</span>
                <div className="segmented">
                  {STATUS.map((s) => (
                    <button key={s.value} type="button" role="radio" aria-checked={d.status === s.value}
                      className={`seg ${d.status === s.value ? 'is-active' : ''}`} onClick={() => update({ status: s.value })}>
                      <span className="seg-dot" /><span className="seg-label">{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="field">
                <label className="field-label" htmlFor="notes">Internal notes</label>
                <textarea id="notes" className="control" rows={3} maxLength={5000} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Only visible to admins" />
                <div className="notes-actions">
                  <button type="button" className="btn btn-primary btn-sm" disabled={saving || notes === (d.notes ?? '')} onClick={() => update({ notes })}>
                    {saving && <Loader2 size={14} className="spin" />}Save notes
                  </button>
                </div>
              </div>
            </section>

            {filesByField.length > 0 && (
              <section className="card drawer-card">
                <h3>Files <span className="muted">({d.files.length})</span></h3>
                {filesByField.map(([field, files]) => (
                  <div key={field} className="file-group">
                    <span className="file-group-label">{FILE_LABELS[field] ?? field}</span>
                    <div className="file-grid">
                      {files.map((f) => {
                        const url = urls[f.path];
                        const isImg = f.type.startsWith('image/');
                        return (
                          <a key={f.path} className="file-tile" href={url} target="_blank" rel="noreferrer" aria-disabled={!url}>
                            {isImg && url ? <img src={url} alt={f.name} loading="lazy" /> : (
                              <span className="file-tile-icon">{f.type.startsWith('video/') ? <Film size={20} /> : <FileText size={20} />}</span>
                            )}
                            <span className="file-tile-meta"><span title={f.name}>{f.name}</span><small>{formatBytes(f.size)} <ExternalLink size={11} /></small></span>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </section>
            )}

            {(d.summary ?? []).map((sec) => (
              <section key={sec.id} className="card drawer-card">
                <h3>{sec.title}</h3>
                {sec.items.length ? (
                  <dl className="answer-list">
                    {sec.items.map((it, i) => <div key={i}><dt>{it.label}</dt><dd>{it.value}</dd></div>)}
                  </dl>
                ) : <p className="muted">Not answered.</p>}
              </section>
            ))}

            <div className="drawer-footer">
              <button type="button" className="btn btn-secondary btn-sm" onClick={downloadJson}><Download size={14} />Download JSON</button>
              <button type="button" className="btn btn-ghost btn-sm danger-text" onClick={remove}><Trash2 size={14} />Delete submission</button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
