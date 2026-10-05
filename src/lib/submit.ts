import { STEPS } from '../data/steps';
import { getFile } from './files';
import { formatValue, visibleFields } from './schema';
import type { FileMeta, FormData, Item } from './types';

export interface SummaryItem {
  label: string;
  value: string;
}

export interface SummarySection {
  id: string;
  title: string;
  items: SummaryItem[];
}

/** Readable label/value pairs for every answered, visible question. */
export function buildSummary(data: FormData): SummarySection[] {
  return STEPS.filter((s) => s.id !== 'review').map((step) => {
    const items: SummaryItem[] = [];
    for (const f of visibleFields(step, data)) {
      const v = formatValue(f, data[f.key], data);
      if (v === null) continue;
      items.push({ label: f.label, value: v });
      if (f.type === 'repeater') {
        (data[f.key] as Item[]).forEach((item, i) => {
          const parts = f.fields
            .filter((sf) => !sf.showIf || sf.showIf(data, item))
            .map((sf) => formatValue(sf, item[sf.key], item))
            .filter(Boolean);
          if (parts.length) items.push({ label: `${f.itemLabel} ${i + 1}`, value: parts.join(' · ') });
        });
      }
    }
    return { id: step.id, title: step.title, items };
  });
}

function fileFields(data: FormData): [string, FileMeta[]][] {
  return Object.entries(data).filter(([, v]) => Array.isArray(v) && v.length && v[0]?.id && 'size' in v[0]) as [string, FileMeta[]][];
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;
const BUCKET = 'intake-files';

export interface SubmitResult {
  id: string;
  at: number;
  remote: boolean;
}

const safeName = (n: string) => n.normalize('NFKD').replace(/[^\w.-]+/g, '_').slice(-120);

/**
 * Uploads files to the private `intake-files` bucket under `<submissionId>/<field>/`,
 * then inserts one row into `intake_submissions`. The public key can only insert —
 * it cannot read anything back. Without Supabase config the profile stays on this device.
 */
export async function submitProfile(id: string, data: FormData): Promise<SubmitResult> {
  const at = Date.now();
  const summary = buildSummary(data);

  if (SUPABASE_URL && SUPABASE_KEY) {
    const { createClient } = await import('@supabase/supabase-js');
    const sb = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });

    const files: { field: string; name: string; size: number; type: string; path: string }[] = [];
    for (const [field, metas] of fileFields(data)) {
      for (const m of metas) {
        const blob = await getFile(m.id);
        if (!blob) continue;
        const path = `${id}/${field}/${m.id.slice(0, 8)}-${safeName(m.name)}`;
        const { error } = await sb.storage.from(BUCKET).upload(path, blob, { contentType: m.type, upsert: false });
        if (error) throw new Error(`Could not upload ${m.name}: ${error.message}`);
        files.push({ field, name: m.name, size: m.size, type: m.type, path });
      }
    }

    const phone = data.phone?.number ? `${data.phone.cc} ${data.phone.number}` : null;
    const { error } = await sb.from('intake_submissions').insert({
      submission_id: id,
      brand_name: data.brandName ?? null,
      contact_name: data.contactName ?? null,
      email: data.email ?? null,
      phone,
      data,
      summary,
      files,
    });
    if (error) throw new Error(`Submission failed: ${error.message}`);
    return { id, at, remote: true };
  }

  try {
    const prev = JSON.parse(localStorage.getItem('pm-intake:submissions') ?? '[]');
    localStorage.setItem('pm-intake:submissions', JSON.stringify([...prev, { submissionId: id, submittedAt: new Date(at).toISOString(), data, summary }]));
  } catch {
    /* storage full: the success screen still offers a download */
  }
  return { id, at, remote: false };
}

export function downloadSummary(id: string, data: FormData) {
  const payload = { submissionId: id, exportedAt: new Date().toISOString(), summary: buildSummary(data), data };
  const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: `${id}.json` });
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
