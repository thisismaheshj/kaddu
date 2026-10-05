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

export interface SubmitResult {
  id: string;
  at: number;
  remote: boolean;
}

/**
 * Sends the profile to VITE_SUBMIT_URL as multipart form data when configured
 * (fields: `profile` JSON, plus one `files[<field>]` part per upload).
 * Without an endpoint the submission is kept on this device.
 */
export async function submitProfile(id: string, data: FormData): Promise<SubmitResult> {
  const at = Date.now();
  const payload = { submissionId: id, submittedAt: new Date(at).toISOString(), data, summary: buildSummary(data) };
  const endpoint = import.meta.env.VITE_SUBMIT_URL as string | undefined;

  if (endpoint) {
    const body = new FormData();
    body.append('profile', JSON.stringify(payload));
    for (const [key, metas] of fileFields(data)) {
      for (const m of metas) {
        const blob = await getFile(m.id);
        if (blob) body.append(`files[${key}]`, blob, m.name);
      }
    }
    const res = await fetch(endpoint, { method: 'POST', body });
    if (!res.ok) throw new Error(`Submission failed (${res.status})`);
    return { id, at, remote: true };
  }

  try {
    const prev = JSON.parse(localStorage.getItem('pm-intake:submissions') ?? '[]');
    localStorage.setItem('pm-intake:submissions', JSON.stringify([...prev, payload]));
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
