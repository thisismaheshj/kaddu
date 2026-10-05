import { ArrowLeft, ArrowRight, Check, ChevronDown, CloudCheck, Loader2, RotateCcw, ShieldCheck, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Field } from './components/Field';
import { Review } from './components/Review';
import { Ring } from './components/Ring';
import { Success } from './components/Success';
import { STEPS } from './data/steps';
import { clearFiles } from './lib/files';
import { makeSubmissionId, stepCompletion, validateStep } from './lib/schema';
import { useStore } from './lib/store';
import { submitProfile } from './lib/submit';

export const BRAND = { name: 'Kaddu', product: 'Client Onboarding' };

export default function App() {
  const store = useStore();
  const { data, step, set, setStep, saving, updatedAt, submission } = store;
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sheet, setSheet] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>();

  const current = STEPS[Math.min(step, STEPS.length - 1)];
  const isReview = current.id === 'review';
  const sections = useMemo(() => current.sections(data).filter((s) => !s.showIf || s.showIf(data)), [current, data]);
  const completions = useMemo(() => STEPS.map((s) => stepCompletion(s, data)), [data]);
  const overall = Math.round(completions.slice(0, -1).reduce((a, c) => a + c.pct, 0) / (STEPS.length - 1));

  useEffect(() => {
    setErrors({});
    setSheet(false);
    window.scrollTo({ top: 0 });
  }, [step]);

  // Re-validate live once errors are showing, so they clear as the user fixes them.
  useEffect(() => {
    if (Object.keys(errors).length) setErrors(validateStep(current, data));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const go = (i: number) => setStep(Math.max(0, Math.min(STEPS.length - 1, i)));

  const next = () => {
    const errs = validateStep(current, data);
    setErrors(errs);
    const first = Object.keys(errs)[0];
    if (first) {
      document.querySelector(`[data-field="${first}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    go(step + 1);
  };

  const submit = async () => {
    setSubmitting(true);
    setSubmitError(undefined);
    try {
      const res = await submitProfile(makeSubmissionId(), data);
      store.setSubmission({ id: res.id, at: res.at });
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    if (!confirm('Start over? This clears every answer and uploaded file on this device.')) return;
    clearFiles().catch(() => {});
    store.reset();
  };

  if (submission) return <Success id={submission.id} at={submission.at} onNew={reset} />;

  const errorCount = Object.keys(errors).length;

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <span className="brand-mark" aria-hidden>
              <svg viewBox="0 0 24 24" width="18" height="18"><path d="M4 8.5 12 4l8 4.5v7L12 20l-8-4.5z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><path d="M4 8.5 12 13l8-4.5M12 13v7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>
            </span>
            <span className="brand-text"><strong>{BRAND.name}</strong><span>{BRAND.product}</span></span>
          </div>
          <div className="topbar-right">
            <span className="save-state" aria-live="polite">
              {saving ? <><Loader2 size={14} className="spin" />Saving</> : updatedAt ? <><CloudCheck size={14} />Saved on this device</> : <><ShieldCheck size={14} />Private &amp; secure</>}
            </span>
            <button type="button" className="btn btn-ghost btn-sm" onClick={reset} title="Start over"><RotateCcw size={14} /><span className="hide-sm">Start over</span></button>
          </div>
        </div>
      </header>

      <div className="shell">
        <aside className="sidebar" aria-label="Steps">
          <div className="sidebar-card">
            <div className="sidebar-progress">
              <Ring pct={overall} size={44} stroke={4} />
              <div><strong>Profile {overall}% complete</strong><span>About 15 minutes in total</span></div>
            </div>
            <StepList current={step} completions={completions.map((c) => c.pct)} onPick={go} />
          </div>
        </aside>

        <main className="main">
          <div className="mobile-progress">
            <button type="button" className="mobile-step" onClick={() => setSheet(true)} aria-haspopup="dialog">
              <span>Step {step + 1} of {STEPS.length} · <strong>{current.title}</strong></span>
              <ChevronDown size={16} />
            </button>
            <div className="progress-line"><span style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} /></div>
          </div>

          <div key={current.id} className="step-anim">
            <div className="step-head">
              <span className="eyebrow"><current.icon size={14} />Step {step + 1} of {STEPS.length}</span>
              <h1>{current.heading}</h1>
              <p>{current.description}</p>
            </div>

            {isReview ? (
              <Review onSubmit={submit} submitting={submitting} submitError={submitError} />
            ) : (
              <form className="sections" onSubmit={(e) => { e.preventDefault(); next(); }} noValidate>
                {sections.map((sec) => {
                  const fields = sec.fields.filter((f) => !f.showIf || f.showIf(data));
                  if (!fields.length) return null;
                  return (
                    <section key={sec.id} className={`card section reveal ${sec.title ? '' : 'section-bare'}`}>
                      {sec.title && (
                        <header className="section-head">
                          <h2>{sec.title}</h2>
                          {sec.description && <p>{sec.description}</p>}
                        </header>
                      )}
                      <div className="grid">
                        {fields.map((f, i) => (
                          <Field key={`${f.key}-${f.type}-${i}`} field={f} ctx={data} data={data} set={set} errors={errors} />
                        ))}
                      </div>
                    </section>
                  );
                })}
                <button type="submit" hidden />
              </form>
            )}
          </div>

          {!isReview && (
            <nav className="navbar" aria-label="Step navigation">
              {errorCount > 0 && <span className="nav-error">{errorCount} field{errorCount > 1 ? 's need' : ' needs'} attention</span>}
              <button type="button" className="btn btn-secondary" onClick={() => go(step - 1)} disabled={step === 0}>
                <ArrowLeft size={17} /><span>Back</span>
              </button>
              <button type="button" className="btn btn-primary" onClick={next}>
                <span>{step === STEPS.length - 2 ? 'Review' : 'Continue'}</span><ArrowRight size={17} />
              </button>
            </nav>
          )}
          {isReview && (
            <nav className="navbar navbar-review" aria-label="Step navigation">
              <button type="button" className="btn btn-secondary" onClick={() => go(step - 1)}><ArrowLeft size={17} /><span>Back</span></button>
            </nav>
          )}
        </main>
      </div>

      {sheet && (
        <div className="sheet-backdrop" onClick={() => setSheet(false)}>
          <div className="sheet" role="dialog" aria-label="All steps" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-head">
              <strong>All steps</strong>
              <button type="button" className="icon-btn" onClick={() => setSheet(false)} aria-label="Close"><X size={18} /></button>
            </div>
            <StepList current={step} completions={completions.map((c) => c.pct)} onPick={go} />
          </div>
        </div>
      )}
    </div>
  );
}

function StepList({ current, completions, onPick }: { current: number; completions: number[]; onPick: (i: number) => void }) {
  const { maxStep } = useStore();
  return (
    <ol className="steps">
      {STEPS.map((s, i) => {
        const visited = i <= maxStep;
        const done = visited && i !== current && completions[i] === 100 && s.id !== 'review';
        const Icon = s.icon;
        return (
          <li key={s.id}>
            <button
              type="button" onClick={() => onPick(i)} aria-current={i === current ? 'step' : undefined}
              className={`step ${i === current ? 'is-current' : ''} ${done ? 'is-done' : ''} ${visited ? 'is-visited' : ''}`}
            >
              <span className="step-dot">{done ? <Check size={14} /> : <Icon size={14} />}</span>
              <span className="step-name">{s.title}</span>
              {visited && s.id !== 'review' && !done && i !== current && <span className="step-pct">{completions[i]}%</span>}
            </button>
          </li>
        );
      })}
    </ol>
  );
}
