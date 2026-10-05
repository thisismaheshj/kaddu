import {
  BadgeCheck, Bike, Briefcase, Building2, Car, CarFront, ClipboardCheck, Dog, Factory, FileStack, Forklift, Gem, Globe, Hammer, House,
  MapPin, Megaphone, Package, Palette, Plane, Scale, Settings2, Truck, Users, Warehouse,
} from 'lucide-react';
import type { FieldDef, FormData, Opt, Section, StepDef } from '../lib/types';
import { OTHER } from '../lib/schema';
import { COUNTRY_OPTS, INDIA_STATE_OPTS, REGIONS, indiaCityOpts } from './geo';

/* ---------- helpers ---------- */

const slug = (s: string) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const o = (...labels: string[]): Opt[] => labels.map((l) => ({ value: slug(l), label: l }));
const arr = (d: FormData, k: string): string[] => (Array.isArray(d[k]) ? d[k] : []);
const yes = (k: string) => (d: FormData) => d[k] === true;
const no = (k: string) => (d: FormData) => d[k] === false;
const eq = (k: string, v: string) => (d: FormData) => d[k] === v;
const includes = (k: string, ...v: string[]) => (d: FormData) => arr(d, k).some((x) => v.includes(x));
const isIndia = (k: string) => (d: FormData) => (d[k] ?? 'India') === 'India';

const YEARS: Opt[] = Array.from({ length: new Date().getFullYear() - 1949 }, (_, i) => {
  const y = String(new Date().getFullYear() - i);
  return { value: y, label: y };
});

/* ---------- services ---------- */

export const SERVICES: (Opt & { included: string[] })[] = [
  { value: 'household', label: 'Household shifting', icon: House, description: 'Homes & apartments',
    included: ['Packing', 'Loading', 'Transportation', 'Unloading', 'Unpacking', 'Rearrangement', 'Appliance reconnection', 'Transit insurance'] },
  { value: 'local', label: 'Local shifting', icon: MapPin, description: 'Within the same city',
    included: ['Same-day moves', 'Small moves (1RK / 1BHK)', 'Mini truck / tempo', 'Labour-only', 'Packing', 'Loading & unloading'] },
  { value: 'domestic', label: 'Domestic relocation', icon: Truck, description: 'City to city, state to state',
    included: ['Door-to-door', 'Full truck load', 'Part load / shared truck', 'Packing', 'Transit insurance', 'Live tracking'] },
  { value: 'international', label: 'International relocation', icon: Plane, description: 'Overseas moves',
    included: ['Door-to-door', 'Sea freight (FCL)', 'Sea freight (LCL)', 'Air freight', 'Customs clearance', 'Export packing / crating', 'Destination services', 'Documentation'] },
  { value: 'office', label: 'Office relocation', icon: Building2, description: 'Offices & workspaces',
    included: ['Workstations', 'IT / server equipment', 'Files & records', 'After-hours / weekend moves', 'Labelling & floor plans', 'Furniture assembly'] },
  { value: 'corporate', label: 'Corporate relocation', icon: Briefcase, description: 'Employee & bulk contracts',
    included: ['Employee relocation', 'Annual / bulk contracts', 'Dedicated account manager', 'Pan-India network', 'GST invoicing', 'Pre-move surveys'] },
  { value: 'commercial', label: 'Commercial / industrial', icon: Factory, description: 'Factories, machinery, plants',
    included: ['Machinery shifting', 'Industrial packing', 'Crane / hydra', 'Factory relocation', 'Warehouse shifting', 'Rigging'] },
  { value: 'vehicle', label: 'Vehicle transportation', icon: CarFront, description: 'All vehicle types',
    included: ['Open carrier', 'Enclosed carrier', 'Door pickup', 'Transit insurance', 'Tracking', 'Car + bike combo'] },
  { value: 'car', label: 'Car transportation', icon: Car, description: 'Cars & SUVs',
    included: ['Open carrier', 'Enclosed carrier', 'Luxury cars', 'Door pickup & delivery', 'Transit insurance'] },
  { value: 'bike', label: 'Bike transportation', icon: Bike, description: 'Two-wheelers',
    included: ['Bike packing', 'Door pickup', 'Superbikes', 'Transit insurance'] },
  { value: 'packing', label: 'Packing / unpacking', icon: Package, description: 'Professional packing',
    included: ['Multi-layer packing', 'Bubble wrap', 'Corrugated boxes', 'Wooden crates', 'Waterproof packing', 'Unpacking & arrangement'] },
  { value: 'loading', label: 'Loading / unloading', icon: Forklift, description: 'Trained labour & equipment',
    included: ['Trained labour', 'Hydraulic lift', 'Rope hoisting', 'Buildings without lifts'] },
  { value: 'furniture', label: 'Furniture dismantling / assembly', icon: Hammer, description: 'Beds, wardrobes, modular',
    included: ['Dismantling', 'Reassembly', 'Modular kitchens', 'Beds & wardrobes', 'Office furniture'] },
  { value: 'storage', label: 'Storage / warehousing', icon: Warehouse, description: 'Short & long term',
    included: ['Short-term', 'Long-term', 'Climate-controlled', 'CCTV & security', 'Insurance', 'Pickup & drop', 'Inventory reports'] },
  { value: 'pet', label: 'Pet relocation', icon: Dog, description: 'Domestic & international',
    included: ['Dogs', 'Cats', 'Birds', 'Domestic', 'International', 'Vet documentation', 'Pet carriers', 'Escorted travel'] },
  { value: 'fragile', label: 'Fragile / special items', icon: Gem, description: 'Antiques, art, pianos',
    included: ['Glassware', 'Antiques', 'Artwork', 'Pianos', 'Electronics', 'Chandeliers', 'Custom crates'] },
];

export const selectedServiceOpts = (d: FormData): Opt[] =>
  arr(d, 'services').map((v) =>
    v === OTHER ? { value: OTHER, label: d['services__other'] || 'Other service' } : SERVICES.find((s) => s.value === v) ?? { value: v, label: v },
  );

const serviceSections = (d: FormData): Section[] =>
  arr(d, 'services')
    .filter((v) => v !== OTHER)
    .map((v) => SERVICES.find((s) => s.value === v)!)
    .filter(Boolean)
    .map((s) => {
      const fields: FieldDef[] = [
        { key: `svc_${s.value}_included`, label: "What's included", type: 'chips', multiple: true, options: o(...s.included), other: true, span: 2 },
        { key: `svc_${s.value}_tiers`, label: 'Service tiers offered', type: 'chips', multiple: true, options: o('Economy', 'Standard', 'Premium', 'Customised') },
        { key: `svc_${s.value}_pricing`, label: 'Pricing model', type: 'select', options: o('Fixed packages', 'Per km / distance', 'Per CFT / volume', 'Per item', 'Custom quote only'), other: true },
      ];
      if (s.value === 'storage') {
        fields.push({ key: 'storage_capacity', label: 'Storage capacity', type: 'number', min: 0, suffix: ' sq ft' });
      }
      return { id: `svc-${s.value}`, title: s.label, description: s.description, fields };
    });

/* ---------- shared option lists ---------- */

const PHONE_HELP = 'Shown publicly on your website and Google profile.';
const POLICY = o('Yes, published online', 'Yes, but not published', 'No — please draft one');
const SPEED = o('Same day', '1–2 days', '3–5 days', '1 week', '2 weeks', '2–4 weeks', '1–2 months', '2+ months');
const COVERAGE_OPTS: Opt[] = [
  { value: 'local', label: 'Local', description: 'Within one locality' },
  { value: 'city', label: 'City-wide', description: 'Across the city' },
  { value: 'state', label: 'State-wide', description: 'Across the state' },
  { value: 'pan-india', label: 'Pan-India', description: 'All over India' },
  { value: 'international', label: 'International', description: 'Overseas moves' },
];

export const intlActive = (d: FormData) => includes('coverage', 'international')(d) || d.intlPartner === true;
const platform = (key: string, label: string, placeholder: string, required = false, extra?: 'gbp'): FieldDef => ({
  key, label, type: 'platform', placeholder, required, extra,
});
const upload = (key: string, label: string, accept: string, hint: string): FieldDef => ({ key, label, type: 'file', accept, hint });
const IMAGES = 'image/*';
const DOCS = 'image/*,application/pdf';

/* ---------- steps ---------- */

export const STEPS: StepDef[] = [
  {
    id: 'business', title: 'Business', icon: Building2,
    heading: 'Tell us about the business',
    description: 'The core facts we will use across your website, Google profile and every listing.',
    sections: () => [
      {
        id: 'identity', title: 'Company identity',
        fields: [
          { key: 'brandName', label: 'Brand name', type: 'text', required: true, placeholder: 'e.g. SwiftShift Packers & Movers' },
          { key: 'legalName', label: 'Registered legal name', type: 'text', required: true, placeholder: 'As on GST / incorporation documents' },
          { key: 'yearEstablished', label: 'Year established', type: 'select', searchable: true, options: YEARS, required: true },
          { key: 'businessType', label: 'Business type', type: 'select', required: true, other: true,
            options: o('Packers & movers', 'Relocation company', 'Logistics & transport', 'Franchise of a national brand', 'Moving aggregator / marketplace') },
          { key: 'ownershipType', label: 'Ownership', type: 'select', other: true,
            options: o('Founder-led', 'Family-owned', 'Partnership', 'Corporate / group company', 'Franchisee') },
          { key: 'companySize', label: 'Company size', type: 'chips', required: true, options: o('1–10', '11–50', '51–200', '201–500', '500+'), help: 'Total employees including field staff.' },
        ],
      },
      {
        id: 'contact', title: 'People & contact',
        fields: [
          { key: 'founderName', label: 'Founder / owner name', type: 'text', placeholder: 'Full name' },
          { key: 'contactName', label: 'Primary contact person', type: 'text', required: true, placeholder: 'Who we will work with' },
          { key: 'designation', label: 'Contact designation', type: 'select', other: true, required: true,
            options: o('Owner', 'Founder', 'CEO / Managing Director', 'Director', 'General Manager', 'Marketing Manager', 'Operations Manager') },
          { key: 'phone', label: 'Business phone', type: 'phone', required: true, help: PHONE_HELP },
          { key: 'whatsappSame', label: 'WhatsApp is on the same number', type: 'checkbox' },
          { key: 'whatsapp', label: 'WhatsApp number', type: 'phone', showIf: (d) => !d.whatsappSame },
          { key: 'email', label: 'Business email', type: 'email', required: true, placeholder: 'name@company.com' },
          { key: 'supportSame', label: 'Use the business email for customer support', type: 'checkbox' },
          { key: 'supportEmail', label: 'Customer support email', type: 'email', placeholder: 'support@company.com', showIf: (d) => !d.supportSame },
        ],
      },
      {
        id: 'story', title: 'Positioning in your words',
        fields: [
          { key: 'tagline', label: 'Tagline', type: 'text', placeholder: 'e.g. Moving India, carefully.', span: 2 },
          { key: 'description', label: 'Company description', type: 'textarea', required: true, span: 2,
            placeholder: 'Who you are, what you do, where you operate and for whom.' },
          { key: 'difference', label: 'What makes the company different?', type: 'textarea', span: 2,
            placeholder: 'Process, people, fleet, technology, guarantees…' },
          { key: 'whyChoose', label: 'Why should customers choose you?', type: 'textarea', span: 2,
            placeholder: 'The reasons your best customers give.' },
        ],
      },
    ],
  },

  {
    id: 'locations', title: 'Locations', icon: MapPin,
    heading: 'Where you operate',
    description: 'Your head office, branch network and the areas you serve — this shapes local SEO pages and ad targeting.',
    sections: () => [
      {
        id: 'ho', title: 'Head office',
        fields: [
          { key: 'hoCountry', label: 'Country', type: 'select', searchable: true, options: COUNTRY_OPTS, required: true },
          { key: 'hoState', label: 'State / UT', type: 'select', searchable: true, creatable: true, options: INDIA_STATE_OPTS, required: true, showIf: isIndia('hoCountry') },
          { key: 'hoState', label: 'State / region', type: 'text', required: true, showIf: (d) => !isIndia('hoCountry')(d) },
          { key: 'hoCity', label: 'City', type: 'select', searchable: true, creatable: true, options: (d) => indiaCityOpts(d.hoState), required: true, showIf: isIndia('hoCountry') },
          { key: 'hoCity', label: 'City', type: 'text', required: true, showIf: (d) => !isIndia('hoCountry')(d) },
          { key: 'hoPin', label: 'PIN code', type: 'text', required: true, placeholder: '6-digit PIN', pattern: /^\d{6}$/, patternMessage: 'Enter a 6-digit PIN code', showIf: isIndia('hoCountry') },
          { key: 'hoPin', label: 'Postal code', type: 'text', showIf: (d) => !isIndia('hoCountry')(d) },
          { key: 'hoAddress', label: 'Street address', type: 'text', required: true, span: 2, placeholder: 'Building, street, area — exactly as it should appear on Google' },
        ],
      },
      {
        id: 'branches', title: 'Branch network',
        fields: [
          { key: 'hasBranches', label: 'Do you have branches beyond the head office?', type: 'yesno', required: true, span: 2 },
          { key: 'branchCount', label: 'Number of branches', type: 'number', min: 1, max: 999, showIf: yes('hasBranches'), required: true },
          {
            key: 'branches', label: 'Branch details', type: 'repeater', addLabel: 'Add branch', itemLabel: 'Branch', showIf: yes('hasBranches'), span: 2,
            help: 'Add the branches you want listed on your website and Google. You can add the rest later.',
            fields: [
              { key: 'name', label: 'Branch name', type: 'text', required: true, placeholder: 'e.g. Pune — Hinjewadi' },
              { key: 'kind', label: 'Type', type: 'chips', options: o('Branch office', 'Franchise', 'Warehouse', 'Partner / agent') },
              { key: 'state', label: 'State / UT', type: 'select', searchable: true, creatable: true, options: INDIA_STATE_OPTS },
              { key: 'city', label: 'City', type: 'select', searchable: true, creatable: true, options: (_d, item) => indiaCityOpts(item?.state), required: true },
              { key: 'address', label: 'Address', type: 'text', span: 2 },
              { key: 'phone', label: 'Branch phone', type: 'phone' },
              { key: 'gbp', label: 'Has its own Google Business Profile?', type: 'yesno' },
            ],
          },
        ],
      },
      {
        id: 'coverage', title: 'Service coverage',
        fields: [
          { key: 'coverage', label: 'Coverage', type: 'cards', multiple: true, options: COVERAGE_OPTS, required: true, span: 2, columns: 3 },
          { key: 'statesServed', label: 'States served', type: 'multiselect', options: INDIA_STATE_OPTS, selectAll: true, span: 2,
            showIf: includes('coverage', 'state', 'pan-india'), required: true },
          { key: 'citiesServed', label: 'Key cities served', type: 'multiselect', creatable: true, span: 2,
            options: (d) => indiaCityOpts(d.statesServed?.length ? d.statesServed : d.hoState),
            help: 'Each city can get its own SEO landing page. Type to add a city that is not listed.' },
          { key: 'intlPartner', label: 'Do you handle international relocation (directly or through partners)?', type: 'yesno', span: 2,
            showIf: (d) => !includes('coverage', 'international')(d) },
          { key: 'regionsServed', label: 'Regions served', type: 'chips', multiple: true, options: REGIONS, span: 2, showIf: intlActive },
          { key: 'countriesServed', label: 'Countries served', type: 'multiselect', options: COUNTRY_OPTS.filter((c) => c.value !== 'India'), span: 2, showIf: intlActive },
        ],
      },
    ],
  },

  {
    id: 'services', title: 'Services', icon: Package,
    heading: 'What you offer',
    description: 'Pick every service you provide. We will ask a few details about each one you select.',
    sections: (d) => [
      {
        id: 'list', title: 'Services offered',
        fields: [{ key: 'services', label: 'Select all that apply', type: 'cards', multiple: true, other: true, options: SERVICES, required: true, span: 2, columns: 3 }],
      },
      {
        id: 'priority', title: 'Priorities', showIf: (d) => arr(d, 'services').length > 0,
        fields: [
          { key: 'priorityServices', label: 'Top services to promote', type: 'multiselect', options: selectedServiceOpts, max: 3, span: 2,
            help: 'Up to 3. These lead your homepage, ads and Google profile.' },
        ],
      },
      ...serviceSections(d),
    ],
  },

  {
    id: 'operations', title: 'Operations', icon: Settings2,
    heading: 'How you operate',
    description: 'Quotation, survey, tracking and insurance details customers ask about before booking.',
    sections: () => [
      {
        id: 'quote', title: 'Quotation & survey',
        fields: [
          { key: 'freeQuote', label: 'Free quotation?', type: 'yesno', required: true },
          { key: 'writtenQuote', label: 'Written / itemised quotation?', type: 'yesno' },
          { key: 'surveyType', label: 'Pre-move survey', type: 'radio', required: true, span: 2,
            options: [
              { value: 'physical', label: 'Physical', description: 'On-site visit' },
              { value: 'virtual', label: 'Virtual', description: 'Video call' },
              { value: 'both', label: 'Both', description: 'Customer chooses' },
              { value: 'none', label: 'No survey', description: 'Quote on call' },
            ] },
          { key: 'quoteChannels', label: 'How customers request quotes', type: 'chips', multiple: true, other: true, span: 2, required: true,
            options: o('Phone', 'WhatsApp', 'Website form', 'Email', 'Walk-in') },
          { key: 'quoteTurnaround', label: 'Quote turnaround', type: 'select', options: o('Within 1 hour', 'Same day', 'Within 24 hours', 'Within 48 hours') },
        ],
      },
      {
        id: 'hours', title: 'Hours & fleet',
        fields: [
          { key: 'workingDays', label: 'Working days', type: 'chips', multiple: true, options: o('Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'), span: 2 },
          { key: 'support247', label: '24/7 customer support', type: 'toggle', description: 'Shown as "Open 24 hours" where supported.', span: 2 },
          { key: 'openTime', label: 'Opens at', type: 'time', showIf: (d) => !d.support247 },
          { key: 'closeTime', label: 'Closes at', type: 'time', showIf: (d) => !d.support247 },
          { key: 'fleetOwnership', label: 'Fleet', type: 'radio', options: o('Own fleet', 'Hired vehicles', 'Mixed') },
          { key: 'fleetSize', label: 'Vehicles in fleet', type: 'select', options: o('1–5', '6–20', '21–50', '51–100', '100+'), showIf: (d) => d.fleetOwnership && d.fleetOwnership !== 'hired-vehicles' },
        ],
      },
      {
        id: 'tracking', title: 'Tracking & timelines',
        fields: [
          { key: 'tracking', label: 'Shipment tracking?', type: 'yesno', required: true, span: 2 },
          { key: 'trackingMethod', label: 'Tracking method', type: 'chips', multiple: true, other: true, span: 2, showIf: yes('tracking'),
            options: o('GPS live tracking', 'Online tracking portal', 'WhatsApp updates', 'SMS updates', 'Phone updates') },
          { key: 'leadTime', label: 'Typical booking lead time', type: 'select', options: SPEED, help: 'How far ahead customers usually book.' },
          { key: 'deliveryLocal', label: 'Typical delivery — local', type: 'select', options: o('Same day', 'Next day', '2–3 days') },
          { key: 'deliveryDomestic', label: 'Typical delivery — domestic', type: 'select', options: SPEED.slice(1), showIf: includes('coverage', 'state', 'pan-india') },
          { key: 'deliveryIntl', label: 'Typical delivery — international', type: 'select', options: SPEED.slice(4), showIf: intlActive },
        ],
      },
      {
        id: 'insurance', title: 'Insurance & claims',
        fields: [
          { key: 'insurance', label: 'Transit insurance offered?', type: 'yesno', required: true, span: 2 },
          { key: 'insuranceType', label: 'Insurance type', type: 'chips', multiple: true, other: true, showIf: yes('insurance'), span: 2,
            options: o('Transit insurance', 'Comprehensive / all-risk', 'Storage insurance', 'Vehicle transit insurance', 'Third-party insurer') },
          { key: 'insuranceInclusion', label: 'Insurance is…', type: 'radio', showIf: yes('insurance'), span: 2, options: o('Optional add-on', 'Included by default', 'Mandatory') },
          { key: 'claimTime', label: 'Typical claim resolution time', type: 'select', options: o('Within 7 days', '7–15 days', '15–30 days', '30+ days') },
          { key: 'complaintProcess', label: 'Complaint & damage process', type: 'textarea', span: 2,
            placeholder: 'How customers raise a complaint, what evidence you need, and how it is resolved.' },
        ],
      },
    ],
  },

  {
    id: 'customers', title: 'Customers', icon: Users,
    heading: 'Who you serve',
    description: 'Your customer mix guides messaging, landing pages and ad audiences.',
    sections: () => [
      {
        id: 'mix', title: 'Customer mix',
        fields: [
          { key: 'customerTypes', label: 'Customer types', type: 'chips', multiple: true, other: true, required: true, span: 2,
            options: o('Families', 'Individuals', 'Working professionals', 'Students', 'NRIs', 'Defence / transferable jobs', 'SMEs', 'Enterprises', 'Government', 'E-commerce', 'Industrial', 'Builders & developers') },
          { key: 'model', label: 'Business model', type: 'radio', required: true, span: 2,
            options: [
              { value: 'b2c', label: 'B2C', description: 'Households & individuals' },
              { value: 'b2b', label: 'B2B', description: 'Businesses & institutions' },
              { value: 'both', label: 'Both', description: 'A mix of the two' },
            ] },
          { key: 'segment', label: 'Market segment', type: 'chips', multiple: true, required: true, span: 2,
            options: o('Budget', 'Mass market', 'Mid-market', 'Premium', 'Luxury', 'Enterprise') },
          { key: 'ageRange', label: 'Typical customer age', type: 'range', min: 18, max: 75, suffix: ' yrs', span: 2, showIf: (d) => d.model !== 'b2b' },
        ],
      },
      {
        id: 'value', title: 'Value',
        fields: [
          { key: 'aov', label: 'Average order value', type: 'select',
            options: o('Under ₹10,000', '₹10,000–25,000', '₹25,000–50,000', '₹50,000–1 lakh', '₹1–3 lakh', '₹3 lakh+') },
          { key: 'valuableSegment', label: 'Most valuable customer type', type: 'select', showIf: (d) => arr(d, 'customerTypes').length > 1,
            options: (d) => o('Families', 'Individuals', 'Working professionals', 'Students', 'NRIs', 'Defence / transferable jobs', 'SMEs', 'Enterprises', 'Government', 'E-commerce', 'Industrial', 'Builders & developers')
              .filter((x) => arr(d, 'customerTypes').includes(x.value)) },
          { key: 'profitableService', label: 'Most profitable service', type: 'select', options: selectedServiceOpts, showIf: (d) => arr(d, 'services').length > 1 },
        ],
      },
    ],
  },

  {
    id: 'trust', title: 'Trust', icon: BadgeCheck,
    heading: 'Trust & credentials',
    description: 'Proof points that turn visitors into enquiries — numbers, certifications, awards and clients.',
    sections: (d) => [
      {
        id: 'numbers', title: 'Track record',
        fields: [
          { key: 'yearsExperience', label: 'Years of experience', type: 'number', min: 0, max: 100, suffix: ' yrs',
            help: d.yearEstablished ? `Established ${d.yearEstablished} — about ${new Date().getFullYear() - Number(d.yearEstablished)} years.` : undefined },
          { key: 'customersServed', label: 'Customers served', type: 'select', options: o('Under 1,000', '1,000–5,000', '5,000–25,000', '25,000–1 lakh', '1 lakh+') },
          { key: 'movesCompleted', label: 'Moves completed', type: 'select', options: o('Under 1,000', '1,000–5,000', '5,000–25,000', '25,000–1 lakh', '1 lakh+') },
          { key: 'googleRating', label: 'Google rating', type: 'number', min: 1, max: 5, step: 0.1, suffix: ' ★' },
          { key: 'googleReviews', label: 'Google review count', type: 'number', min: 0 },
        ],
      },
      {
        id: 'certs', title: 'Certifications & registrations',
        fields: [
          { key: 'iso', label: 'ISO certified?', type: 'yesno' },
          { key: 'isoStandards', label: 'ISO standards', type: 'chips', multiple: true, other: true, showIf: yes('iso'), options: o('ISO 9001', 'ISO 14001', 'ISO 45001', 'ISO 27001') },
          { key: 'msme', label: 'MSME / Udyam registered?', type: 'yesno' },
          { key: 'msmeCategory', label: 'MSME category', type: 'radio', showIf: yes('msme'), options: o('Micro', 'Small', 'Medium') },
          { key: 'iba', label: 'IBA approved / member?', type: 'yesno', help: 'Indian Banks’ Association approval for transferable-employee moves.' },
          { key: 'ibaType', label: 'IBA status', type: 'radio', showIf: yes('iba'), options: o('IBA approved', 'IBA member') },
          { key: 'certifications', label: 'Other certifications & memberships', type: 'chips', multiple: true, other: true, span: 2,
            options: o('FIDI-FAIM', 'IAM member', 'OMNI', 'AMSA', 'Startup India') },
          { key: 'govtRegs', label: 'Government registrations', type: 'chips', multiple: true, other: true, span: 2,
            options: o('GST', 'Shops & Establishment', 'Trade licence', 'IEC (Import Export Code)', 'GeM seller', 'Transport permit') },
        ],
      },
      {
        id: 'awards', title: 'Awards',
        fields: [
          { key: 'hasAwards', label: 'Has the company won any awards?', type: 'yesno', span: 2 },
          { key: 'awards', label: 'Awards', type: 'repeater', addLabel: 'Add award', itemLabel: 'Award', showIf: yes('hasAwards'), span: 2,
            fields: [
              { key: 'name', label: 'Award', type: 'text', required: true, placeholder: 'e.g. Best Relocation Company' },
              { key: 'year', label: 'Year', type: 'select', searchable: true, options: YEARS },
              { key: 'by', label: 'Awarded by', type: 'text', span: 2 },
            ] },
        ],
      },
      {
        id: 'clients', title: 'Clients & achievements',
        fields: [
          { key: 'clientsNotice', label: 'Before you name clients', type: 'notice', tone: 'warning', span: 2,
            body: 'Only list client or company names you are authorised to use publicly. Using a brand name or logo without permission can breach contracts and trademark law. If unsure, leave this blank — we will use anonymised wording such as "a Fortune 500 IT company".' },
          { key: 'clientsAuthorized', label: 'Do you have permission to publicly name your corporate clients?', type: 'radio', span: 2,
            options: o('Yes, we have permission', 'No / not sure') },
          { key: 'clients', label: 'Major corporate clients', type: 'tags', span: 2, showIf: eq('clientsAuthorized', 'yes-we-have-permission'),
            help: 'Press Enter after each name.' },
          { key: 'achievements', label: 'Notable achievements', type: 'textarea', span: 2,
            placeholder: 'Milestones, large projects, media coverage, records…' },
        ],
      },
    ],
  },

  {
    id: 'brand', title: 'Brand', icon: Palette,
    heading: 'Brand & voice',
    description: 'How the brand should look, sound and feel across every touchpoint.',
    sections: (d) => [
      {
        id: 'positioning', title: 'Positioning',
        fields: [
          { key: 'positioning', label: 'Brand positioning', type: 'chips', multiple: true, other: true, required: true, span: 2,
            options: o('Premium', 'Affordable', 'Reliable', 'Fast', 'Professional', 'Enterprise-grade', 'Nationwide', 'International', 'Tech-enabled', 'Eco-friendly') },
          { key: 'personality', label: 'Brand personality', type: 'chips', multiple: true, max: 3, span: 2, help: 'Pick up to 3.',
            options: o('Trustworthy', 'Caring', 'Expert', 'Friendly', 'Bold', 'Calm', 'Modern', 'Traditional', 'Energetic', 'Sophisticated') },
          { key: 'differentiators', label: 'Differentiators', type: 'chips', multiple: true, other: true, span: 2,
            options: o('Own fleet', 'Trained in-house staff', 'No hidden charges', 'Damage guarantee', 'On-time guarantee', 'Live tracking', '24/7 support', 'Pan-India network', 'Premium packing material', 'Dedicated move manager') },
        ],
      },
      {
        id: 'visual', title: 'Visual identity',
        fields: [
          { key: 'primaryColor', label: 'Primary colour', type: 'color' },
          { key: 'secondaryColor', label: 'Secondary colour', type: 'color' },
          { key: 'hasLogo', label: 'Do you have a logo?', type: 'yesno', required: true },
          { key: 'logoNeed', label: 'Logo', type: 'radio', showIf: no('hasLogo'), options: o('Design a new logo', 'Refresh an old one') },
          { key: 'hasGuidelines', label: 'Do you have brand guidelines?', type: 'yesno' },
          { key: 'logoNotice', label: 'Upload later', type: 'notice', tone: 'info', span: 2, showIf: (x) => x.hasLogo === true || x.hasGuidelines === true,
            body: 'You can upload your logo and guidelines in the Assets step.' },
        ],
      },
      {
        id: 'voice', title: 'Voice & story',
        fields: [
          { key: 'tagline', label: 'Tagline', type: 'text', span: 2, placeholder: 'e.g. Moving India, carefully.', help: d.tagline ? 'Shared with the Business step.' : undefined },
          { key: 'brandStory', label: 'Brand story', type: 'textarea', span: 2, placeholder: 'How and why the company started, and how it has grown.' },
          { key: 'preferredWords', label: 'Words & phrases to use', type: 'tags', help: 'Press Enter after each one.' },
          { key: 'avoidWords', label: 'Words & phrases to avoid', type: 'tags', help: 'e.g. "cheap", "lowest price"' },
          { key: 'languages', label: 'Content languages', type: 'chips', multiple: true, other: true, span: 2,
            options: o('English', 'Hindi', 'Marathi', 'Gujarati', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Bengali', 'Punjabi') },
        ],
      },
    ],
  },

  {
    id: 'online', title: 'Online Presence', icon: Globe,
    heading: 'Online presence',
    description: 'Tell us where the company is already listed. Answer Yes or No for each — links only when you have one.',
    sections: () => [
      {
        id: 'nopass', fields: [
          { key: 'noPassNotice', label: 'We never ask for passwords', type: 'notice', tone: 'shield', span: 2,
            body: 'Share public links only. When we need access, we will send an official manager/partner invite from each platform.' },
        ],
      },
      {
        id: 'core', title: 'Website & Google',
        fields: [
          platform('website', 'Website', 'yourcompany.com', true),
          platform('gbp', 'Google Business Profile', 'Share link (g.page / maps.app.goo.gl)', true, 'gbp'),
          platform('gmaps', 'Google Maps listing', 'maps.app.goo.gl/…'),
          platform('whatsappBiz', 'WhatsApp Business', 'wa.me/91XXXXXXXXXX'),
        ],
      },
      {
        id: 'social', title: 'Social',
        fields: [
          platform('instagram', 'Instagram', 'instagram.com/yourbrand'),
          platform('facebook', 'Facebook', 'facebook.com/yourbrand'),
          platform('linkedin', 'LinkedIn', 'linkedin.com/company/yourbrand'),
          platform('youtube', 'YouTube', 'youtube.com/@yourbrand'),
          platform('x', 'X (Twitter)', 'x.com/yourbrand'),
        ],
      },
      {
        id: 'dirs', title: 'Directories',
        fields: [
          platform('justdial', 'Justdial', 'justdial.com/…'),
          platform('indiamart', 'IndiaMART', 'indiamart.com/…'),
          platform('sulekha', 'Sulekha', 'sulekha.com/…'),
          platform('yelp', 'Yelp', 'yelp.com/biz/…'),
          { key: 'hasOtherDirs', label: 'Listed on other directories?', type: 'yesno', span: 2 },
          { key: 'otherDirs', label: 'Other directories', type: 'repeater', addLabel: 'Add directory', itemLabel: 'Directory', span: 2, showIf: yes('hasOtherDirs'),
            fields: [
              { key: 'name', label: 'Directory', type: 'select', creatable: true, searchable: true, required: true,
                options: o('TradeIndia', 'Yellow Pages', 'Clickindia', 'Quikr', 'Grotal', 'Bing Places', 'Apple Business Connect', 'Trustpilot', 'MouthShut') },
              { key: 'url', label: 'Listing link', type: 'url', placeholder: 'https://…' },
            ] },
        ],
      },
    ],
  },

  {
    id: 'marketing', title: 'Marketing', icon: Megaphone,
    heading: 'Marketing & advertising',
    description: 'Your advertising history and goals, so campaigns start from real numbers.',
    sections: () => [
      {
        id: 'history', title: 'Advertising so far',
        fields: [
          { key: 'prevAds', label: 'Have you run paid ads before?', type: 'yesno', required: true, span: 2 },
          { key: 'adPlatforms', label: 'Platforms used', type: 'chips', multiple: true, other: true, span: 2, showIf: yes('prevAds'), required: true,
            options: o('Google Search', 'Google Local Services', 'Meta (Facebook)', 'Instagram', 'YouTube', 'LinkedIn', 'Justdial paid', 'IndiaMART paid', 'Sulekha leads') },
          { key: 'currentBudget', label: 'Current monthly ad spend', type: 'select', showIf: yes('prevAds'),
            options: o('Under ₹25,000', '₹25,000–50,000', '₹50,000–1 lakh', '₹1–3 lakh', '₹3–10 lakh', '₹10 lakh+') },
          { key: 'currentCPL', label: 'Current cost per lead', type: 'select', showIf: yes('prevAds'),
            options: o('Under ₹100', '₹100–250', '₹250–500', '₹500–1,000', '₹1,000+', "Don't know") },
          { key: 'monthlyLeads', label: 'Leads per month', type: 'select', showIf: yes('prevAds'),
            options: o('Under 50', '50–150', '150–500', '500–1,500', '1,500+', "Don't know") },
          { key: 'adsManagedBy', label: 'Ads managed by', type: 'radio', showIf: yes('prevAds'), options: o('In-house', 'Agency', 'Freelancer') },
        ],
      },
      {
        id: 'goals', title: 'Goals',
        fields: [
          { key: 'desiredBudget', label: 'Planned monthly ad budget', type: 'select', required: true,
            options: o('Under ₹25,000', '₹25,000–50,000', '₹50,000–1 lakh', '₹1–3 lakh', '₹3–10 lakh', '₹10 lakh+', 'Need a recommendation') },
          { key: 'campaignStart', label: 'Preferred campaign start', type: 'date' },
          { key: 'adGoals', label: 'Advertising goals', type: 'chips', multiple: true, required: true, span: 2,
            options: o('Leads (form fills)', 'Phone calls', 'WhatsApp chats', 'Confirmed bookings', 'Brand awareness', 'Corporate / B2B leads') },
          { key: 'targetLocations', label: 'Target locations', type: 'multiselect', creatable: true, span: 2,
            options: (d) => [...arr(d, 'citiesServed'), ...arr(d, 'statesServed')].map((v) => ({ value: v, label: v })).concat(indiaCityOpts().filter((c) => !arr(d, 'citiesServed').includes(c.value))),
            help: 'Your served cities and states appear first.' },
          { key: 'advertiseServices', label: 'Services to advertise', type: 'multiselect', options: selectedServiceOpts, span: 2,
            showIf: (d) => arr(d, 'services').length > 0 },
        ],
      },
      {
        id: 'challenges', title: 'Challenges',
        fields: [
          { key: 'challenges', label: 'Biggest marketing challenges', type: 'chips', multiple: true, other: true, span: 2,
            options: o('Low lead volume', 'Poor lead quality', 'High cost per lead', 'Fake / spam enquiries', 'Aggregator competition', 'Low Google ranking', 'Few reviews', 'Low conversion to booking', 'Seasonal demand') },
          { key: 'challengeNotes', label: 'Anything else we should know?', type: 'textarea', span: 2 },
        ],
      },
    ],
  },

  {
    id: 'assets', title: 'Assets', icon: FileStack,
    heading: 'Brand assets',
    description: 'Upload what you have. Files stay on this device until you submit. Highest-resolution originals work best.',
    sections: (d) => [
      {
        id: 'brand', title: 'Brand files',
        fields: [
          upload('logo', 'Logo', 'image/*,application/pdf,.ai,.eps,.svg', d.hasLogo === false ? 'Optional — you told us you need a logo.' : 'SVG, AI, EPS, PDF or high-res PNG'),
          upload('guidelines', 'Brand guidelines', DOCS, 'PDF preferred'),
        ],
      },
      {
        id: 'photos', title: 'Photos & video',
        fields: [
          upload('companyPhotos', 'Company photos', IMAGES, 'Exterior, signage, reception'),
          upload('officePhotos', 'Office / warehouse photos', IMAGES, 'Interiors and storage facilities'),
          upload('vehiclePhotos', 'Vehicle photos', IMAGES, 'Branded trucks and fleet'),
          upload('teamPhotos', 'Team / founder photos', IMAGES, 'Portraits and team shots'),
          upload('movingPhotos', 'Packing / moving photos', IMAGES, 'Real jobs in progress'),
          upload('videos', 'Videos', 'video/*', 'MP4 or MOV'),
        ],
      },
      {
        id: 'proof', title: 'Proof & past work',
        fields: [
          upload('certificates', 'Certificates', DOCS, 'ISO, MSME, IBA, GST…'),
          upload('awardFiles', 'Awards', DOCS, 'Award photos or certificates'),
          upload('testimonials', 'Testimonials', 'image/*,video/*,application/pdf', 'Screenshots, letters, video reviews'),
          upload('existingAds', 'Existing advertisements', 'image/*,video/*,application/pdf', 'Print, social or video ads'),
        ],
      },
    ],
  },

  {
    id: 'legal', title: 'Legal', icon: Scale,
    heading: 'Legal & compliance',
    description: 'Registration and policy details for your website footer, listings and ad-platform verification.',
    sections: () => [
      {
        id: 'safe', fields: [
          { key: 'legalNotice', label: 'Sensitive information', type: 'notice', tone: 'shield', span: 2,
            body: 'Never share passwords, OTPs, card details, banking credentials or API keys here. We will never ask for them.' },
        ],
      },
      {
        id: 'entity', title: 'Entity & registrations',
        fields: [
          { key: 'entityType', label: 'Legal entity type', type: 'select', required: true, other: true,
            options: o('Sole proprietorship', 'Partnership firm', 'LLP', 'Private limited', 'Public limited', 'One Person Company (OPC)') },
          { key: 'companyReg', label: 'Registered with MCA / ROC?', type: 'yesno', showIf: (d) => !!d.entityType && d.entityType !== 'sole-proprietorship' },
          { key: 'regNumber', label: 'CIN / LLPIN', type: 'text', transform: 'upper', showIf: yes('companyReg'), placeholder: 'Optional' },
          { key: 'gst', label: 'GST registered?', type: 'yesno', required: true },
          { key: 'gstin', label: 'GSTIN', type: 'text', transform: 'upper', required: true, showIf: yes('gst'), placeholder: '15 characters',
            pattern: /^\d{2}[A-Z]{5}\d{4}[A-Z][A-Z\d]Z[A-Z\d]$/, patternMessage: 'Enter a valid 15-character GSTIN' },
          { key: 'msme', label: 'MSME / Udyam registered?', type: 'yesno' },
        ],
      },
      {
        id: 'licences', title: 'Licences & insurance',
        fields: [
          { key: 'tradeLicense', label: 'Trade licence?', type: 'yesno' },
          { key: 'businessInsurance', label: 'Business insurance policy?', type: 'yesno' },
          { key: 'businessInsuranceCover', label: 'Coverage', type: 'chips', multiple: true, other: true, span: 2, showIf: yes('businessInsurance'),
            options: o('Goods in transit', 'Warehouse / storage', 'Fleet', 'Public liability', "Workmen's compensation") },
        ],
      },
      {
        id: 'policies', title: 'Policies',
        fields: [
          { key: 'privacyPolicy', label: 'Privacy policy', type: 'radio', options: POLICY, span: 2 },
          { key: 'privacyUrl', label: 'Privacy policy link', type: 'url', span: 2, showIf: eq('privacyPolicy', 'yes-published-online') },
          { key: 'termsPolicy', label: 'Terms & conditions', type: 'radio', options: POLICY, span: 2 },
          { key: 'termsUrl', label: 'Terms link', type: 'url', span: 2, showIf: eq('termsPolicy', 'yes-published-online') },
          { key: 'refundPolicy', label: 'Refund / cancellation policy', type: 'radio', options: POLICY, span: 2 },
          { key: 'refundUrl', label: 'Refund policy link', type: 'url', span: 2, showIf: eq('refundPolicy', 'yes-published-online') },
          { key: 'otherLegal', label: 'Other legal information', type: 'textarea', span: 2, placeholder: 'Disclaimers, ongoing disputes, trademark status…' },
        ],
      },
    ],
  },

  {
    id: 'review', title: 'Review & Submit', icon: ClipboardCheck,
    heading: 'Review & submit',
    description: 'Check each section, then confirm and submit.',
    sections: () => [],
  },
];

