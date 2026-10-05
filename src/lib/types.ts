import type { LucideIcon } from 'lucide-react';

export type FormData = Record<string, any>;
export type Item = Record<string, any>;

/** Conditions receive the whole form plus, inside repeaters, the current item. */
export type Cond = (data: FormData, item?: Item) => boolean;

export interface Opt {
  value: string;
  label: string;
  description?: string;
  icon?: LucideIcon;
}

export type OptSource = Opt[] | ((data: FormData, item?: Item) => Opt[]);

interface Base {
  key: string;
  label: string;
  help?: string;
  placeholder?: string;
  required?: boolean;
  showIf?: Cond;
  /** 2 = spans both columns on desktop. Long inputs default to 2. */
  span?: 1 | 2;
}

export type FieldDef = Base &
  (
    | { type: 'text' | 'email' | 'url'; pattern?: RegExp; patternMessage?: string; transform?: 'upper' }
    | { type: 'textarea'; rows?: number; maxLength?: number }
    | { type: 'phone' }
    | { type: 'select'; options: OptSource; searchable?: boolean; creatable?: boolean; other?: boolean }
    | { type: 'multiselect'; options: OptSource; creatable?: boolean; max?: number; selectAll?: boolean }
    | { type: 'tags' }
    | { type: 'chips'; options: OptSource; multiple?: boolean; other?: boolean; max?: number }
    | { type: 'cards'; options: OptSource; multiple?: boolean; other?: boolean; columns?: 2 | 3 | 4 }
    | { type: 'radio'; options: OptSource; other?: boolean }
    | { type: 'yesno'; yesLabel?: string; noLabel?: string }
    | { type: 'toggle'; description?: string }
    | { type: 'checkbox' }
    | { type: 'number'; min?: number; max?: number; step?: number; prefix?: string; suffix?: string }
    | { type: 'slider'; min: number; max: number; step?: number; suffix?: string }
    | { type: 'range'; min: number; max: number; step?: number; suffix?: string }
    | { type: 'date' | 'time' }
    | { type: 'color'; presets?: string[] }
    | { type: 'file'; accept?: string; hint?: string; maxSizeMB?: number }
    | { type: 'platform'; placeholder?: string; extra?: 'gbp' }
    | { type: 'repeater'; fields: FieldDef[]; addLabel: string; itemLabel: string; max?: number }
    | { type: 'notice'; tone?: 'info' | 'warning' | 'shield'; body: string }
  );

export interface Section {
  id: string;
  title?: string;
  description?: string;
  showIf?: Cond;
  fields: FieldDef[];
}

export interface StepDef {
  id: string;
  title: string;
  /** Short heading shown above the step's form. */
  heading: string;
  description: string;
  icon: LucideIcon;
  sections: (data: FormData) => Section[];
}

export interface FileMeta {
  id: string;
  name: string;
  size: number;
  type: string;
}

export interface PhoneValue {
  cc: string;
  number: string;
}

export interface PlatformValue {
  has: boolean | null;
  url?: string;
  verified?: boolean | null;
  access?: boolean | null;
}
