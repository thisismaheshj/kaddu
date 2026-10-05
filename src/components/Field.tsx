import { AlertTriangle, Check, ChevronDown, Info, Minus, Plus, ShieldCheck, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { DIAL_CODES } from '../data/geo';
import { OTHER, otherKey, resolveOpts, withOther } from '../lib/schema';
import type { FieldDef, FormData, Item, PhoneValue, PlatformValue } from '../lib/types';
import { Combobox } from './Combobox';
import { FileDrop } from './FileDrop';

export interface FieldProps {
  field: FieldDef;
  /** Value source: the whole form, or a repeater item. */
  ctx: FormData | Item;
  data: FormData;
  set: (key: string, v: unknown) => void;
  errors: Record<string, string>;
  /** Prefix used for error keys inside repeaters, e.g. `branches.0.` */
  errorPrefix?: string;
}

const SENSITIVE = /\b(password|passcode|pwd|otp|cvv|upi\s*pin|net\s*banking)\b|\b(?:\d[ -]?){13,19}\b/i;
const PRESETS = ['#2347E8', '#0F766E', '#E8590C', '#B91C1C', '#7C3AED', '#0F172A', '#CA8A04', '#15803D'];

export function Field({ field: f, ctx, data, set, errors, errorPrefix = '' }: FieldProps) {
  const value = ctx[f.key];
  const error = errors[errorPrefix + f.key];
  const id = `f-${errorPrefix}${f.key}`.replace(/\./g, '-');
  const span = f.span ?? (f.type === 'textarea' || f.type === 'cards' || f.type === 'repeater' || f.type === 'notice' || f.type === 'platform' ? 2 : 1);
  const on = (v: unknown) => set(f.key, v);

  if (f.type === 'notice') {
    const Icon = f.tone === 'warning' ? AlertTriangle : f.tone === 'shield' ? ShieldCheck : Info;
    return (
      <div className={`notice notice-${f.tone ?? 'info'} span-${span} reveal`}>
        <Icon size={18} />
        <div><strong>{f.label}</strong><p>{f.body}</p></div>
      </div>
    );
  }

  if (f.type === 'checkbox' || f.type === 'toggle') {
    const isToggle = f.type === 'toggle';
    return (
      <label className={`check-row span-${span} reveal`}>
        <input type="checkbox" className="sr-only" checked={!!value} onChange={(e) => on(e.target.checked)} />
        {isToggle ? <span className="switch" aria-hidden /> : <span className="checkbox" aria-hidden><Check size={13} /></span>}
        <span>
          <span className="check-label">{f.label}</span>
          {isToggle && f.description && <span className="check-desc">{f.description}</span>}
        </span>
      </label>
    );
  }

  const showOther = 'other' in f && f.other && (value === OTHER || (Array.isArray(value) && value.includes(OTHER)));
  const opts = 'options' in f ? withOther(resolveOpts(f.options, data, ctx), 'other' in f ? f.other : false) : [];
  const isGroup = ['chips', 'cards', 'radio', 'yesno', 'platform', 'repeater', 'file', 'range', 'color'].includes(f.type);
  const Wrapper = isGroup ? 'fieldset' : 'div';

  return (
    <Wrapper className={`field span-${span} reveal ${error ? 'has-error' : ''}`} data-field={errorPrefix + f.key} aria-label={f.type === 'platform' ? f.label : undefined}>
      {f.type !== 'platform' && (
        isGroup ? (
          <legend className="field-label">{f.label}{f.required && <span className="req" aria-label="required">*</span>}</legend>
        ) : (
          <label className="field-label" htmlFor={id}>{f.label}{f.required && <span className="req" aria-label="required">*</span>}</label>
        )
      )}

      {renderControl()}

      {showOther && (
        <input
          className="control other-input reveal" placeholder="Please specify" aria-label={`${f.label} — other`}
          value={ctx[otherKey(f.key)] ?? ''} onChange={(e) => set(otherKey(f.key), e.target.value)}
        />
      )}
      {f.help && !error && <p className="field-help">{f.help}</p>}
      {error && <p className="field-error" role="alert">{error}</p>}
      {(f.type === 'text' || f.type === 'textarea') && typeof value === 'string' && SENSITIVE.test(value) && (
        <p className="field-warn"><AlertTriangle size={13} /> This looks like a password, OTP or card number. Please don't share credentials here.</p>
      )}
    </Wrapper>
  );

  function renderControl() {
    switch (f.type) {
      case 'text':
      case 'email':
      case 'url':
        return (
          <input
            id={id} className={`control ${error ? 'is-invalid' : ''}`} type={f.type === 'text' ? 'text' : f.type}
            inputMode={f.type === 'url' ? 'url' : f.type === 'email' ? 'email' : undefined}
            autoComplete={f.type === 'email' ? 'email' : 'off'}
            placeholder={f.placeholder} value={value ?? ''}
            onChange={(e) => on('transform' in f && f.transform === 'upper' ? e.target.value.toUpperCase() : e.target.value)}
          />
        );
      case 'textarea':
        return (
          <div className="textarea-wrap">
            <textarea
              id={id} className={`control ${error ? 'is-invalid' : ''}`} rows={f.rows ?? 4} placeholder={f.placeholder}
              value={value ?? ''} maxLength={f.maxLength ?? 2000} onChange={(e) => on(e.target.value)}
            />
            <span className="char-count">{(value ?? '').length}/{f.maxLength ?? 2000}</span>
          </div>
        );
      case 'phone': {
        const v: PhoneValue = value ?? { cc: '+91', number: '' };
        return (
          <div className={`control phone ${error ? 'is-invalid' : ''}`}>
            <label className="phone-cc">
              <span>{v.cc}</span><ChevronDown size={14} />
              <select aria-label="Country code" value={v.cc} onChange={(e) => on({ ...v, cc: e.target.value })}>
                {DIAL_CODES.map((c) => <option key={c.value} value={c.value}>{c.value} {c.description}</option>)}
              </select>
            </label>
            <input
              id={id} type="tel" inputMode="tel" autoComplete="tel-national" placeholder="98765 43210"
              value={v.number} onChange={(e) => on({ ...v, number: e.target.value.replace(/[^\d\s-]/g, '') })}
            />
          </div>
        );
      }
      case 'select':
        return <Combobox id={id} options={opts} value={value} onChange={on} searchable={f.searchable} creatable={f.creatable} invalid={!!error} placeholder={f.placeholder} />;
      case 'multiselect':
        return <Combobox id={id} options={opts} value={value} onChange={on} multiple creatable={f.creatable} max={f.max} selectAll={f.selectAll} invalid={!!error} placeholder={f.placeholder ?? 'Search and select…'} />;
      case 'tags':
        return <Tags id={id} value={value ?? []} onChange={on} />;
      case 'chips': {
        const sel: string[] = f.multiple ? value ?? [] : value ? [value] : [];
        const atMax = !!f.max && sel.length >= f.max;
        return (
          <div className="chips">
            {opts.map((o) => {
              const active = sel.includes(o.value);
              return (
                <button
                  key={o.value} type="button" className={`chip ${active ? 'is-active' : ''}`} aria-pressed={active}
                  disabled={f.multiple && atMax && !active}
                  onClick={() => on(f.multiple ? (active ? sel.filter((x) => x !== o.value) : [...sel, o.value]) : active ? undefined : o.value)}
                >
                  {active && <Check size={14} />}{o.label}
                </button>
              );
            })}
          </div>
        );
      }
      case 'cards': {
        const sel: string[] = f.multiple ? value ?? [] : value ? [value] : [];
        return (
          <div className={`cards cols-${f.columns ?? 3}`}>
            {opts.map((o) => {
              const active = sel.includes(o.value);
              const Icon = o.icon ?? Plus;
              return (
                <button
                  key={o.value} type="button" className={`opt-card ${active ? 'is-active' : ''}`} aria-pressed={active}
                  onClick={() => on(f.multiple ? (active ? sel.filter((x) => x !== o.value) : [...sel, o.value]) : o.value)}
                >
                  {(o.icon || o.value === OTHER) && <span className="opt-card-icon"><Icon size={20} /></span>}
                  <span className="opt-card-text">
                    <span className="opt-card-label">{o.label}</span>
                    {o.description && <span className="opt-card-desc">{o.description}</span>}
                  </span>
                  <span className="opt-card-check"><Check size={13} /></span>
                </button>
              );
            })}
          </div>
        );
      }
      case 'radio':
        return (
          <div className="segmented" role="radiogroup">
            {opts.map((o) => (
              <button
                key={o.value} type="button" role="radio" aria-checked={value === o.value}
                className={`seg ${value === o.value ? 'is-active' : ''} ${o.description ? 'has-desc' : ''}`}
                onClick={() => on(o.value)}
              >
                <span className="seg-dot" />
                <span><span className="seg-label">{o.label}</span>{o.description && <span className="seg-desc">{o.description}</span>}</span>
              </button>
            ))}
          </div>
        );
      case 'yesno':
        return <YesNo value={value} onChange={on} yes={f.yesLabel} no={f.noLabel} />;
      case 'number':
        return <NumberInput id={id} value={value} onChange={on} min={f.min} max={f.max} step={f.step} prefix={f.prefix} suffix={f.suffix} invalid={!!error} />;
      case 'slider':
        return (
          <div className="slider-row">
            <input type="range" min={f.min} max={f.max} step={f.step ?? 1} value={value ?? f.min} onChange={(e) => on(Number(e.target.value))} />
            <output>{value ?? '—'}{f.suffix}</output>
          </div>
        );
      case 'range':
        return <DualRange value={value} onChange={on} min={f.min} max={f.max} step={f.step} suffix={f.suffix} />;
      case 'date':
      case 'time':
        return <input id={id} className={`control ${error ? 'is-invalid' : ''}`} type={f.type} value={value ?? ''} onChange={(e) => on(e.target.value)} />;
      case 'color':
        return <ColorPicker value={value} onChange={on} presets={f.presets ?? PRESETS} />;
      case 'file':
        return <FileDrop value={value} onChange={on} accept={f.accept} hint={f.hint} maxSizeMB={f.maxSizeMB} label={f.label} />;
      case 'platform':
        return <Platform field={f} value={value} onChange={on} error={error} />;
      case 'repeater':
        return <Repeater field={f} value={value ?? []} onChange={on} data={data} errors={errors} />;
    }
  }
}

/* ---------- small controls ---------- */

function YesNo({ value, onChange, yes = 'Yes', no = 'No' }: { value: boolean | undefined; onChange: (v: boolean) => void; yes?: string; no?: string }) {
  return (
    <div className="yesno" role="radiogroup">
      <button type="button" role="radio" aria-checked={value === true} className={`yn ${value === true ? 'is-yes' : ''}`} onClick={() => onChange(true)}>
        <Check size={15} />{yes}
      </button>
      <button type="button" role="radio" aria-checked={value === false} className={`yn ${value === false ? 'is-no' : ''}`} onClick={() => onChange(false)}>
        <X size={15} />{no}
      </button>
    </div>
  );
}

function NumberInput({ id, value, onChange, min, max, step = 1, prefix, suffix, invalid }: {
  id: string; value: number | undefined; onChange: (v: number | undefined) => void; min?: number; max?: number; step?: number; prefix?: string; suffix?: string; invalid?: boolean;
}) {
  const clamp = (n: number) => Math.min(max ?? Infinity, Math.max(min ?? -Infinity, Math.round(n / step) * step));
  const bump = (d: number) => onChange(Number(clamp((value ?? min ?? 0) + d).toFixed(2)));
  return (
    <div className={`control number ${invalid ? 'is-invalid' : ''}`}>
      <button type="button" className="num-btn" onClick={() => bump(-step)} aria-label="Decrease"><Minus size={15} /></button>
      {prefix && <span className="affix">{prefix}</span>}
      <input
        id={id} type="number" inputMode="decimal" min={min} max={max} step={step} value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
        onBlur={() => value !== undefined && onChange(Number(clamp(value).toFixed(2)))}
      />
      {suffix && <span className="affix">{suffix.trim()}</span>}
      <button type="button" className="num-btn" onClick={() => bump(step)} aria-label="Increase"><Plus size={15} /></button>
    </div>
  );
}

function DualRange({ value, onChange, min, max, step = 1, suffix = '' }: {
  value: [number, number] | undefined; onChange: (v: [number, number]) => void; min: number; max: number; step?: number; suffix?: string;
}) {
  const [lo, hi] = value ?? [min, max];
  const pct = (n: number) => ((n - min) / (max - min)) * 100;
  return (
    <div className="dual">
      <div className="dual-head">
        <span className="dual-val">{value ? `${lo}–${hi}${suffix}` : 'Drag to set a range'}</span>
      </div>
      <div className="dual-track" style={{ '--lo': `${pct(lo)}%`, '--hi': `${pct(hi)}%` } as React.CSSProperties}>
        <input type="range" aria-label="Minimum" min={min} max={max} step={step} value={lo} onChange={(e) => onChange([Math.min(Number(e.target.value), hi - step), hi])} />
        <input type="range" aria-label="Maximum" min={min} max={max} step={step} value={hi} onChange={(e) => onChange([lo, Math.max(Number(e.target.value), lo + step)])} />
      </div>
      <div className="dual-scale"><span>{min}</span><span>{max}{suffix}</span></div>
    </div>
  );
}

function ColorPicker({ value, onChange, presets }: { value: string | undefined; onChange: (v: string | undefined) => void; presets: string[] }) {
  const [draft, setDraft] = useState(value ?? '');
  return (
    <div className="color">
      <div className="color-row">
        <label className="color-swatch" style={{ background: value ?? 'transparent' }}>
          <input type="color" value={value ?? '#2347E8'} onChange={(e) => { onChange(e.target.value.toUpperCase()); setDraft(e.target.value.toUpperCase()); }} aria-label="Pick colour" />
          {!value && <Plus size={16} />}
        </label>
        <input
          className="control color-hex" placeholder="#HEX" value={draft} maxLength={7} aria-label="Hex colour"
          onChange={(e) => {
            const v = e.target.value.toUpperCase();
            setDraft(v);
            if (/^#[0-9A-F]{6}$/.test(v)) onChange(v);
            if (!v) onChange(undefined);
          }}
        />
      </div>
      <div className="color-presets">
        {presets.map((p) => (
          <button key={p} type="button" className={`preset ${value === p ? 'is-active' : ''}`} style={{ background: p }} aria-label={p}
            onClick={() => { onChange(p); setDraft(p); }} />
        ))}
      </div>
    </div>
  );
}

function Tags({ id, value, onChange }: { id: string; value: string[]; onChange: (v: string[]) => void }) {
  const [draft, setDraft] = useState('');
  const commit = () => {
    const t = draft.trim().replace(/,$/, '');
    if (t && !value.includes(t)) onChange([...value, t]);
    setDraft('');
  };
  return (
    <div className="control tags">
      {value.map((t) => (
        <span key={t} className="mini-chip">{t}
          <button type="button" aria-label={`Remove ${t}`} onClick={() => onChange(value.filter((x) => x !== t))}><X size={12} /></button>
        </span>
      ))}
      <input
        id={id} value={draft} placeholder={value.length ? '' : 'Type and press Enter'}
        onChange={(e) => (e.target.value.endsWith(',') ? (setDraft(e.target.value), setTimeout(commit)) : setDraft(e.target.value))}
        onKeyDown={(e) => {
          if (e.key === 'Enter') { e.preventDefault(); commit(); }
          if (e.key === 'Backspace' && !draft && value.length) onChange(value.slice(0, -1));
        }}
        onBlur={commit}
      />
    </div>
  );
}

function Platform({ field, value, onChange, error }: { field: FieldDef & { type: 'platform' }; value: PlatformValue | undefined; onChange: (v: PlatformValue) => void; error?: string }) {
  const v: PlatformValue = value ?? { has: null };
  const initials = field.label.replace(/[^A-Za-z ]/g, '').split(' ').filter(Boolean).map((w) => w[0]).join('').slice(0, 2);
  return (
    <div className={`platform ${v.has ? 'is-on' : ''}`}>
      <div className="platform-head">
        <span className="platform-badge" aria-hidden>{initials}</span>
        <span className="platform-name">{field.label}{field.required && <span className="req">*</span>}</span>
        <YesNo value={v.has ?? undefined} onChange={(has) => onChange({ ...v, has })} />
      </div>
      {v.has && (
        <div className="platform-body reveal">
          <input
            className={`control ${error ? 'is-invalid' : ''}`} inputMode="url" placeholder={field.placeholder}
            aria-label={`${field.label} link`} value={v.url ?? ''} onChange={(e) => onChange({ ...v, url: e.target.value })}
          />
          {field.extra === 'gbp' && (
            <div className="platform-extra">
              <span>Verified?</span><YesNo value={v.verified ?? undefined} onChange={(verified) => onChange({ ...v, verified })} />
              <span>Do you have owner access?</span><YesNo value={v.access ?? undefined} onChange={(access) => onChange({ ...v, access })} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Repeater({ field, value, onChange, data, errors }: {
  field: FieldDef & { type: 'repeater' }; value: Item[]; onChange: (v: Item[]) => void; data: FormData; errors: Record<string, string>;
}) {
  const update = (i: number, key: string, v: unknown) => onChange(value.map((it, j) => (j === i ? { ...it, [key]: v } : it)));
  return (
    <div className="repeater">
      {value.map((item, i) => (
        <div key={item._id ?? i} className="repeat-item reveal">
          <div className="repeat-head">
            <span className="repeat-title">{field.itemLabel} {i + 1}{item.name ? ` · ${item.name}` : ''}</span>
            <button type="button" className="icon-btn danger" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label={`Remove ${field.itemLabel} ${i + 1}`}>
              <Trash2 size={15} />
            </button>
          </div>
          <div className="grid">
            {field.fields.filter((sf) => !sf.showIf || sf.showIf(data, item)).map((sf) => (
              <Field key={sf.key} field={sf} ctx={item} data={data} set={(k, v) => update(i, k, v)} errors={errors} errorPrefix={`${field.key}.${i}.`} />
            ))}
          </div>
        </div>
      ))}
      {(!field.max || value.length < field.max) && (
        <button type="button" className="add-btn" onClick={() => onChange([...value, { _id: Math.random().toString(36).slice(2) }])}>
          <Plus size={16} />{field.addLabel}
        </button>
      )}
    </div>
  );
}
