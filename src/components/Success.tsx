import { Check, Copy, Download, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useStore } from '../lib/store';
import { buildSummary, downloadSummary } from '../lib/submit';

export function Success({ id, at, onNew }: { id: string; at: number; onNew: () => void }) {
  const { data } = useStore();
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);
  const summary = buildSummary(data);
  const answers = summary.reduce((a, s) => a + s.items.length, 0);
  const files = Object.values(data).filter((v) => Array.isArray(v) && v[0]?.size !== undefined && v[0]?.id).reduce((a, v) => a + v.length, 0);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked: the ID stays visible to copy manually */
    }
  };

  return (
    <div className="success-page">
      <div className="success card">
        <div className="success-badge" aria-hidden>
          <svg viewBox="0 0 52 52"><circle cx="26" cy="26" r="24" /><path d="M15 27l7 7 15-16" /></svg>
        </div>
        <h1>Profile Submitted Successfully</h1>
        <p className="success-sub">
          Thank you{data.contactName ? `, ${String(data.contactName).split(' ')[0]}` : ''}. Our team will review the {data.brandName ? <strong>{data.brandName}</strong> : 'company'} profile and start building your website, listings and campaigns.
        </p>

        <div className="success-id">
          <span>Submission ID</span>
          <div>
            <code>{id}</code>
            <button type="button" className="icon-btn" onClick={copy} aria-label="Copy submission ID">{copied ? <Check size={16} /> : <Copy size={16} />}</button>
          </div>
          <small>{new Date(at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })} · Keep this ID for future reference</small>
        </div>

        <div className="success-stats">
          <div><strong>{answers}</strong><span>Answers</span></div>
          <div><strong>{summary.filter((s) => s.items.length).length}/{summary.length}</strong><span>Sections</span></div>
          <div><strong>{files}</strong><span>Files</span></div>
        </div>

        <ol className="next-steps">
          <li><span>1</span>Our team reviews your profile and contacts you if anything needs clarifying.</li>
          <li><span>2</span>We send official access invites for Google and social accounts — never passwords.</li>
          <li><span>3</span>You approve the website and campaign plan before anything goes live.</li>
        </ol>

        <div className="success-actions">
          <button type="button" className="btn btn-secondary" onClick={() => downloadSummary(id, data)}><Download size={16} />Download summary</button>
          <button type="button" className="btn btn-ghost" onClick={onNew}><Plus size={16} />Start a new profile</button>
        </div>
      </div>
    </div>
  );
}
