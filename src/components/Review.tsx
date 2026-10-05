import { AlertCircle, ArrowRight, CheckCircle2, Loader2, Pencil, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { STEPS } from '../data/steps';
import { stepCompletion } from '../lib/schema';
import { useStore } from '../lib/store';
import { buildSummary } from '../lib/submit';
import { Ring } from './Ring';

export function Review({ onSubmit, submitting, submitError }: { onSubmit: () => void; submitting: boolean; submitError?: string }) {
  const { data, setStep } = useStore();
  const [confirmed, setConfirmed] = useState(false);
  const summary = buildSummary(data);
  const steps = STEPS.filter((s) => s.id !== 'review');
  const completions = steps.map((s) => stepCompletion(s, data));
  const blocking = steps.map((s, i) => ({ step: s, i, missing: completions[i].missingRequired })).filter((x) => x.missing.length);
  const overall = Math.round(completions.reduce((a, c) => a + c.pct, 0) / completions.length);

  return (
    <div className="review">
      <div className="review-overview card">
        <Ring pct={overall} size={64} />
        <div>
          <strong>{overall}% of the profile completed</strong>
          <p>{blocking.length ? `${blocking.length} section${blocking.length > 1 ? 's need' : ' needs'} required answers before you can submit.` : 'All required information is in place. Optional answers help us build a stronger profile.'}</p>
        </div>
      </div>

      <div className="review-grid">
        {steps.map((s, i) => {
          const c = completions[i];
          const items = summary[i].items;
          const Icon = s.icon;
          const status = c.missingRequired.length ? 'missing' : c.pct === 100 ? 'done' : 'partial';
          return (
            <section key={s.id} className={`card review-card status-${status}`}>
              <header className="review-card-head">
                <span className="review-icon"><Icon size={18} /></span>
                <div className="review-card-title">
                  <h3>{s.title}</h3>
                  <span className={`status-pill ${status}`}>
                    {status === 'done' ? <><CheckCircle2 size={13} /> Complete</> : status === 'missing' ? <><AlertCircle size={13} /> {c.missingRequired.length} required missing</> : <>{c.answered}/{c.total} answered</>}
                  </span>
                </div>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setStep(i)}><Pencil size={14} />Edit</button>
              </header>
              <div className="progress-line"><span style={{ width: `${c.pct}%` }} /></div>
              {items.length ? (
                <dl className="review-list">
                  {items.slice(0, 6).map((it, j) => (
                    <div key={j}><dt>{it.label}</dt><dd>{it.value}</dd></div>
                  ))}
                  {items.length > 6 && <p className="review-more">+ {items.length - 6} more answers</p>}
                </dl>
              ) : (
                <p className="review-empty">Nothing answered yet.</p>
              )}
              {c.missingRequired.length > 0 && (
                <p className="review-missing">Missing: {c.missingRequired.map((f) => f.label).join(', ')}</p>
              )}
            </section>
          );
        })}
      </div>

      <div className="card confirm-card">
        <label className="check-row">
          <input type="checkbox" className="sr-only" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />
          <span className="checkbox" aria-hidden><CheckCircle2 size={13} /></span>
          <span className="check-label">I confirm that the information provided is accurate and I am authorized to provide it.</span>
        </label>
        <p className="confirm-note"><ShieldCheck size={14} /> We never ask for passwords, OTPs, card details, banking credentials or API keys.</p>
        {blocking.length > 0 && (
          <div className="blocking">
            {blocking.map((b) => (
              <button key={b.step.id} type="button" className="blocking-link" onClick={() => setStep(b.i)}>
                Complete {b.step.title} <ArrowRight size={14} />
              </button>
            ))}
          </div>
        )}
        {submitError && <p className="field-error" role="alert">{submitError}</p>}
        <button type="button" className="btn btn-primary btn-lg" disabled={!confirmed || blocking.length > 0 || submitting} onClick={onSubmit}>
          {submitting ? <><Loader2 size={18} className="spin" />Submitting…</> : <>Submit profile <ArrowRight size={18} /></>}
        </button>
      </div>
    </div>
  );
}
