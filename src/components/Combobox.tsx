import { Check, ChevronDown, Plus, Search, X } from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { Opt } from '../lib/types';

interface Props {
  options: Opt[];
  value: string | string[] | undefined;
  onChange: (v: any) => void;
  multiple?: boolean;
  creatable?: boolean;
  searchable?: boolean;
  placeholder?: string;
  max?: number;
  selectAll?: boolean;
  invalid?: boolean;
  id?: string;
}

export function Combobox({ options, value, onChange, multiple, creatable, searchable, placeholder, max, selectAll, invalid, id }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const listId = useId();

  const selected: string[] = multiple ? (Array.isArray(value) ? value : []) : value ? [value as string] : [];
  const showSearch = searchable || creatable || multiple || options.length > 8;
  const atMax = !!max && selected.length >= max;

  const labelOf = (v: string) => options.find((o) => o.value === v)?.label ?? v;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q) || o.description?.toLowerCase().includes(q));
  }, [options, query]);

  const canCreate = creatable && query.trim() && !options.some((o) => o.label.toLowerCase() === query.trim().toLowerCase()) && !selected.includes(query.trim());
  const rows: Opt[] = canCreate ? [...filtered, { value: query.trim(), label: `Add “${query.trim()}”`, icon: Plus }] : filtered;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    requestAnimationFrame(() => search.current?.focus());
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  useEffect(() => setActive(0), [query, open]);

  const pick = (v: string) => {
    if (multiple) {
      if (selected.includes(v)) onChange(selected.filter((x) => x !== v));
      else if (!atMax) onChange([...selected, v]);
      setQuery('');
    } else {
      onChange(v);
      setOpen(false);
      setQuery('');
    }
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setActive((a) => Math.min(a + 1, rows.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); if (open && rows[active]) pick(rows[active].value); else setOpen(true); }
    else if (e.key === 'Escape') setOpen(false);
    else if (e.key === 'Backspace' && multiple && !query && selected.length) onChange(selected.slice(0, -1));
  };

  useEffect(() => {
    document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: 'nearest' });
  }, [active, listId]);

  return (
    <div className={`combo ${open ? 'is-open' : ''}`} ref={root} onKeyDown={onKey}>
      <button
        type="button" id={id}
        className={`control combo-trigger ${invalid ? 'is-invalid' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox" aria-expanded={open}
      >
        {multiple ? (
          selected.length ? (
            <span className="combo-chips">
              {selected.map((v) => (
                <span key={v} className="mini-chip">
                  {labelOf(v)}
                  <span
                    role="button" tabIndex={-1} aria-label={`Remove ${labelOf(v)}`}
                    onClick={(e) => { e.stopPropagation(); onChange(selected.filter((x) => x !== v)); }}
                  >
                    <X size={12} />
                  </span>
                </span>
              ))}
            </span>
          ) : (
            <span className="placeholder">{placeholder ?? 'Select…'}</span>
          )
        ) : selected[0] ? (
          <span className="combo-value">{labelOf(selected[0])}</span>
        ) : (
          <span className="placeholder">{placeholder ?? 'Select…'}</span>
        )}
        <ChevronDown size={16} className="combo-caret" />
      </button>

      {open && (
        <div className="combo-pop" role="presentation">
          {showSearch && (
            <div className="combo-search">
              <Search size={15} />
              <input
                ref={search} value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder={creatable ? 'Search or add…' : 'Search…'} aria-controls={listId}
                aria-activedescendant={rows[active] ? `${listId}-${active}` : undefined}
              />
            </div>
          )}
          {multiple && (selectAll || max) && (
            <div className="combo-tools">
              {max ? <span>{selected.length}/{max} selected</span> : <span>{selected.length} selected</span>}
              {selectAll && (
                <span className="combo-tool-actions">
                  <button type="button" onClick={() => onChange(options.map((o) => o.value))}>Select all</button>
                  <button type="button" onClick={() => onChange([])}>Clear</button>
                </span>
              )}
            </div>
          )}
          <ul className="combo-list" role="listbox" id={listId} aria-multiselectable={multiple}>
            {rows.length === 0 && <li className="combo-empty">No matches</li>}
            {rows.map((o, i) => {
              const isSel = selected.includes(o.value);
              const disabled = multiple && atMax && !isSel;
              const Icon = o.icon;
              return (
                <li
                  key={`${o.value}-${i}`} id={`${listId}-${i}`} role="option" aria-selected={isSel} aria-disabled={disabled}
                  className={`combo-opt ${i === active ? 'is-active' : ''} ${isSel ? 'is-selected' : ''} ${disabled ? 'is-disabled' : ''}`}
                  onMouseEnter={() => setActive(i)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => !disabled && pick(o.value)}
                >
                  {Icon && <Icon size={15} />}
                  <span className="combo-opt-label">{o.label}</span>
                  {o.description && <span className="combo-opt-desc">{o.description}</span>}
                  {isSel && <Check size={15} className="combo-check" />}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
