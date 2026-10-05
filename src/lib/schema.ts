import type { FieldDef, FormData, Item, Opt, OptSource, PhoneValue, PlatformValue, StepDef } from './types';

export const OTHER = '__other';
export const otherKey = (key: string) => `${key}__other`;

export function resolveOpts(src: OptSource, data: FormData, item?: Item): Opt[] {
  return typeof src === 'function' ? src(data, item) : src;
}

export function withOther(opts: Opt[], enabled?: boolean): Opt[] {
  return enabled ? [...opts, { value: OTHER, label: 'Other' }] : opts;
}

export function visibleFields(step: StepDef, data: FormData): FieldDef[] {
  return step
    .sections(data)
    .filter((s) => !s.showIf || s.showIf(data))
    .flatMap((s) => s.fields.filter((f) => !f.showIf || f.showIf(data)));
}

/** Fields that represent a question (notices and toggles don't count toward completion). */
const tracked = (f: FieldDef) => f.type !== 'notice' && f.type !== 'toggle' && f.type !== 'checkbox';

function hasOther(v: unknown) {
  return v === OTHER || (Array.isArray(v) && v.includes(OTHER));
}

export function isAnswered(f: FieldDef, v: any, ctx: FormData | Item): boolean {
  if (v === undefined || v === null || v === '') return false;
  if (Array.isArray(v) && v.length === 0) return false;
  switch (f.type) {
    case 'phone':
      return !!(v as PhoneValue).number?.trim();
    case 'platform': {
      const p = v as PlatformValue;
      return p.has === false || (p.has === true && !!p.url?.trim());
    }
    case 'repeater':
      return Array.isArray(v) && v.length > 0;
    case 'text':
    case 'textarea':
    case 'email':
    case 'url':
      return String(v).trim().length > 0;
  }
  if ('other' in f && f.other && hasOther(v)) return !!String(ctx[otherKey(f.key)] ?? '').trim();
  return true;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const URLISH = /^(https?:\/\/)?([\w-]+\.)+[a-z]{2,}(\/\S*)?$/i;

export function fieldError(f: FieldDef, v: any, ctx: FormData | Item): string | null {
  const answered = isAnswered(f, v, ctx);
  if (!answered) {
    if (!f.required) return null;
    if ('other' in f && f.other && hasOther(v)) return 'Please specify';
    return f.type === 'platform' ? 'Choose Yes or No' : 'Required';
  }
  if (f.type === 'email' && !EMAIL.test(String(v).trim())) return 'Enter a valid email address';
  if (f.type === 'url' && !URLISH.test(String(v).trim())) return 'Enter a valid link, e.g. example.com';
  if (f.type === 'text' && f.pattern && !f.pattern.test(String(v).trim())) return f.patternMessage ?? 'Invalid format';
  if (f.type === 'phone') {
    const digits = (v as PhoneValue).number.replace(/\D/g, '');
    if (digits.length < 6 || digits.length > 15) return 'Enter a valid phone number';
  }
  if (f.type === 'platform') {
    const p = v as PlatformValue;
    if (p.has && p.url && !URLISH.test(p.url.trim())) return 'Enter a valid link';
  }
  return null;
}

/** Errors keyed by field key; repeater items use `key.index.subkey`. */
export function validateStep(step: StepDef, data: FormData): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const f of visibleFields(step, data)) {
    const err = fieldError(f, data[f.key], data);
    if (err) errors[f.key] = err;
    if (f.type === 'repeater' && Array.isArray(data[f.key])) {
      (data[f.key] as Item[]).forEach((item, i) => {
        for (const sub of f.fields) {
          if (sub.showIf && !sub.showIf(data, item)) continue;
          const e = fieldError(sub, item[sub.key], item);
          if (e) errors[`${f.key}.${i}.${sub.key}`] = e;
        }
      });
    }
  }
  return errors;
}

export interface Completion {
  answered: number;
  total: number;
  pct: number;
  missingRequired: FieldDef[];
}

export function stepCompletion(step: StepDef, data: FormData): Completion {
  const fields = visibleFields(step, data).filter(tracked);
  const answered = fields.filter((f) => isAnswered(f, data[f.key], data)).length;
  const missingRequired = fields.filter((f) => f.required && !isAnswered(f, data[f.key], data));
  const total = fields.length;
  return { answered, total, pct: total ? Math.round((answered / total) * 100) : 100, missingRequired };
}

function label(opts: Opt[], v: string, other?: string) {
  if (v === OTHER) return other ? `Other: ${other}` : 'Other';
  return opts.find((o) => o.value === v)?.label ?? v;
}

/** Human-readable value for the review screen, or null when unanswered. */
export function formatValue(f: FieldDef, v: any, data: FormData): string | null {
  if (!isAnswered(f, v, data) && f.type !== 'toggle' && f.type !== 'checkbox') return null;
  switch (f.type) {
    case 'yesno':
      return v ? f.yesLabel ?? 'Yes' : f.noLabel ?? 'No';
    case 'toggle':
    case 'checkbox':
      return v ? 'Yes' : null;
    case 'phone':
      return `${v.cc} ${v.number}`;
    case 'platform':
      return v.has ? v.url : 'Not on this platform';
    case 'range':
      return `${v[0]}–${v[1]}${f.suffix ?? ''}`;
    case 'slider':
    case 'number':
      return `${'prefix' in f && f.prefix ? f.prefix : ''}${Number(v).toLocaleString('en-IN')}${f.suffix ?? ''}`;
    case 'file':
      return `${v.length} file${v.length === 1 ? '' : 's'}`;
    case 'repeater':
      return `${v.length} ${f.itemLabel.toLowerCase()}${v.length === 1 ? '' : 's'}`;
    case 'tags':
      return (v as string[]).join(', ');
    case 'select':
    case 'radio':
    case 'chips':
    case 'cards':
    case 'multiselect': {
      const opts = resolveOpts(f.options, data);
      const other = data[otherKey(f.key)];
      return Array.isArray(v) ? v.map((x: string) => label(opts, x, other)).join(', ') : label(opts, v, other);
    }
    default:
      return String(v);
  }
}

export function makeSubmissionId() {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  const rand = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
  return `PM-${ymd}-${rand.slice(0, 4)}-${rand.slice(4)}`;
}
