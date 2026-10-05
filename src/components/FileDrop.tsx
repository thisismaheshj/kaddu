import { FileText, Film, ImageIcon, UploadCloud, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { deleteFile, formatBytes, getFile, putFile, uid } from '../lib/files';
import type { FileMeta } from '../lib/types';

interface Props {
  value: FileMeta[] | undefined;
  onChange: (v: FileMeta[]) => void;
  accept?: string;
  hint?: string;
  maxSizeMB?: number;
  label: string;
}

function Thumb({ meta }: { meta: FileMeta }) {
  const [url, setUrl] = useState<string>();
  useEffect(() => {
    if (!meta.type.startsWith('image/')) return;
    let revoke: string | undefined;
    getFile(meta.id).then((blob) => {
      if (blob) setUrl((revoke = URL.createObjectURL(blob)));
    });
    return () => { if (revoke) URL.revokeObjectURL(revoke); };
  }, [meta.id, meta.type]);
  if (url) return <img src={url} alt="" className="file-thumb" />;
  const Icon = meta.type.startsWith('video/') ? Film : meta.type.startsWith('image/') ? ImageIcon : FileText;
  return <span className="file-thumb file-thumb-icon"><Icon size={18} /></span>;
}

export function FileDrop({ value = [], onChange, accept, hint, maxSizeMB = 50, label }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [error, setError] = useState<string>();
  const latest = useRef(value);
  latest.current = value;

  const add = async (list: FileList | null) => {
    if (!list?.length) return;
    setError(undefined);
    const added: FileMeta[] = [];
    for (const f of Array.from(list)) {
      if (f.size > maxSizeMB * 1024 * 1024) { setError(`${f.name} is larger than ${maxSizeMB} MB`); continue; }
      const meta = { id: uid(), name: f.name, size: f.size, type: f.type || 'application/octet-stream' };
      try {
        await putFile(meta.id, f);
        added.push(meta);
      } catch {
        setError('Could not store the file on this device. Try a smaller file.');
      }
    }
    onChange([...latest.current, ...added]);
  };

  const remove = (id: string) => {
    deleteFile(id).catch(() => {});
    onChange(value.filter((f) => f.id !== id));
  };

  return (
    <div className="filedrop-wrap">
      <div
        className={`filedrop ${over ? 'is-over' : ''}`}
        role="button" tabIndex={0} aria-label={`Upload ${label}`}
        onClick={() => input.current?.click()}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), input.current?.click())}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); add(e.dataTransfer.files); }}
      >
        <span className="filedrop-icon"><UploadCloud size={20} /></span>
        <span className="filedrop-text">
          <strong>Drop files</strong> or <u>browse</u>
          {hint && <small>{hint}</small>}
        </span>
        <input ref={input} type="file" multiple accept={accept} hidden onChange={(e) => { add(e.target.files); e.target.value = ''; }} />
      </div>
      {error && <p className="field-error">{error}</p>}
      {value.length > 0 && (
        <ul className="file-list">
          {value.map((f) => (
            <li key={f.id} className="file-item">
              <Thumb meta={f} />
              <span className="file-meta">
                <span className="file-name" title={f.name}>{f.name}</span>
                <span className="file-size">{formatBytes(f.size)}</span>
              </span>
              <button type="button" className="icon-btn" onClick={() => remove(f.id)} aria-label={`Remove ${f.name}`}><X size={15} /></button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
