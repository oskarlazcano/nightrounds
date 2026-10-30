/**
 * NightRounds site content file.
 *
 * This is the ONE place for prices, phone, email, service names, and coverage
 * details (packet section 4). Every page reads from here, so the Owner can
 * change a price or phone number with a single pull request.
 *
 * Anything set to `null` renders as a neutral "coming soon" label instead of
 * an invented value (packet section 16: no invented prices).
 */

export const site = {
  name: 'NightRounds',
  descriptiveName: 'NightRounds Technology',
  legalName: 'NightRounds Technology Group LLC',
  url: 'https://nightrounds.example', // TBD at kickoff: confirmed domain
  title: 'NightRounds | Healthcare IT and Overnight Support',
  description:
    'Managed IT, overnight help desk, and HIPAA security support for long-term care and healthcare organizations. Book a free 20-minute discovery call.',

  contact: {
    email: null as string | null, // e.g. 'hello@nightrounds.example'
    phone: null as string | null, // e.g. '+1 (555) 010-0000'
    // Online-only business: no street address is published (packet section 18).
  },

  links: {
    booking: null as string | null, // Microsoft Bookings page URL
    bookingEmbed: false, // true = iframe the Bookings page on /book-a-call
    supportPortal: null as string | null, // reserved header link for the client portal
    checklistPdf: '/downloads/care-facility-it-hipaa-readiness-checklist.pdf',
  },

  forms: {
    endpoint: '/api/inquiry',
    turnstileSiteKey: null as string | null, // Cloudflare Turnstile site key (public)
    noPhiNotice: 'Please do not include patient or resident information.',
  },

  /**
   * Overnight coverage. Keep `confirmed: false` until a human coverage plan,
   * contact route, backup responder, and customer time zones are confirmed
   * and a 2 AM test call has passed (packet sections 14 and 17). While false,
   * the site shows the fallback line instead of the live 2 AM claim.
   */
  coverage: {
    confirmed: false,
    window: null as string | null, // e.g. '6:00 PM to 7:00 AM Central, Monday to Friday nights'
    claim: 'Yes, we answer at 2 AM.',
    claimSupport:
      'Overnight support is part of how NightRounds operates, not an expensive after-hours add-on.',
    fallback: 'IT support built for your overnight shift.',
    fallbackSupport:
      'NightRounds is set up around the hours your facility actually runs, so overnight help is designed in from the start, not bolted on.',
    planNote:
      'Overnight support is included in the applicable plan during its published coverage window. Scope and response targets are agreed before onboarding.',
  },

  owner: {
    name: 'Elijah Owens',
    role: 'Founder',
    photo: null as string | null, // '/images/elijah-owens.jpg' once supplied
    // Only verified credentials go here (packet section 18: claims register).
    credentials: [] as string[],
  },
};

export type Price = {
  amount: number | null; // USD; null until the Owner supplies figures
  prefix: 'Starting at' | 'Fixed fee' | 'From';
  unit?: string; // e.g. 'per user / month'
};

export type Service = {
  slug: string;
  name: string;
  short: string;
  type: string;
  price: Price | 'scoped';
  href: string | null; // null = Phase 2 page, not built yet
  icon: IconName;
  flagship?: boolean;
};

export type IconName =
  | 'moon'
  | 'shield'
  | 'clipboard'
  | 'search'
  | 'users'
  | 'cloud'
  | 'ticket'
  | 'compass';

export const services: Service[] = [
  {
    slug: 'after-hours-help-desk',
    name: 'After-Hours Help Desk',
    short:
      'Help for login, workstation, Microsoft 365, and approved application-access issues during the covered overnight window, with a documented handoff for anything that needs follow-through.',
    type: 'Monthly subscription',
    price: { amount: null, prefix: 'Starting at', unit: 'per month' },
    href: '/services/after-hours-help-desk',
    icon: 'moon',
    flagship: true,
  },
  {
    slug: 'managed-it-security',
    name: 'Managed IT and Security',
    short:
      'One accountable partner for employee access, supported devices, updates, and security follow-through, with clear reporting on open issues and priorities.',
    type: 'Monthly, per user or device',
    price: { amount: null, prefix: 'Starting at', unit: 'per user / month' },
    href: '/services/managed-it-security',
    icon: 'shield',
    flagship: true,
  },
  {
    slug: 'hipaa-security-program',
    name: 'HIPAA Security Program',
    short:
      'Understand the gaps, assign the fixes, and organize the evidence. Assessment and remediation support are scoped to your environment, with decisions owned by your leadership.',
    type: 'Monthly subscription',
    price: { amount: null, prefix: 'Starting at', unit: 'per month' },
    href: '/services/hipaa-security-program',
    icon: 'clipboard',
    flagship: true,
  },
  {
    slug: 'assessments',
    name: 'Assessments',
    short:
      'Care-Facility IT Readiness Review, HIPAA Security Risk Analysis, Cyber Insurance Readiness, and Microsoft 365 Security Review. Fixed fee for a defined scope.',
    type: 'Fixed fee',
    price: { amount: null, prefix: 'Fixed fee' },
    href: null,
    icon: 'search',
  },
  {
    slug: 'identity-staff-lifecycle',
    name: 'Identity and Staff Lifecycle',
    short:
      'Onboarding, offboarding, shared nursing-station devices, and MFA that works for high-turnover teams.',
    type: 'Project plus subscription',
    price: { amount: null, prefix: 'From' },
    href: null,
    icon: 'users',
  },
  {
    slug: 'microsoft-365-projects',
    name: 'Microsoft 365, Entra, and Intune',
    short: 'Tenant cleanup, migrations, device enrollment, and conditional access, planned and documented.',
    type: 'Scoped project',
    price: 'scoped',
    href: null,
    icon: 'cloud',
  },
  {
    slug: 'jira-service-management',
    name: 'Jira Service Management',
    short: 'Atlassian service desk setup and consulting so requests, approvals, and history live in one place.',
    type: 'Project or retainer',
    price: 'scoped',
    href: null,
    icon: 'ticket',
  },
  {
    slug: 'fractional-it-leadership',
    name: 'Fractional IT Leadership',
    short: 'vCIO and vCISO guidance for budgets, vendors, roadmaps, and board or survey questions.',
    type: 'Monthly retainer',
    price: { amount: null, prefix: 'Starting at', unit: 'per month' },
    href: null,
    icon: 'compass',
  },
];

export const entryOffer = {
  name: 'Care-Facility IT Readiness Review',
  summary:
    'A fixed-fee review of the agreed Microsoft 365, identity, endpoint, and overnight-support scope, with an executive summary, prioritized findings, and a practical next-step plan.',
  deliverables: [
    'Written scope and reviewed-system inventory',
    'Prioritized findings, each with a named owner',
    'Evidence limitations stated plainly',
    'Executive summary and a results call',
  ],
  price: { amount: null, prefix: 'Fixed fee' } as Price,
  caveat:
    'This review is not a full HIPAA Security Risk Analysis. A full analysis covers all of your electronic protected health information, and your team helps define that broader scope.',
};

export const checklist = {
  title: 'Care-Facility IT and HIPAA Readiness Checklist',
  covers: [
    'Account ownership and departures',
    'Shared nursing-station workstations',
    'Updates and supported devices',
    'Vendor and EHR contacts',
    'Recovery plans',
    'After-hours escalation',
  ],
  label: 'A planning aid, not a completed risk analysis or compliance certification.',
};

export const segments = [
  'Skilled nursing',
  'Assisted living',
  'Memory care',
  'Home health',
  'Hospice',
];

export const expertise = [
  'Medicaid program administration',
  'Clinical research IT',
  'Microsoft 365',
  'Entra ID',
  'Intune',
  'Identity and access management',
  'Atlassian service management',
];

export const faqs = [
  {
    q: 'Can you work with our existing IT provider?',
    a: 'Yes. The co-managed model adds overnight support alongside your current provider, with written responsibilities, approved access, and a clear daytime handoff.',
  },
  {
    q: 'Is support remote?',
    a: 'NightRounds is remote-first. We agree what can be supported remotely and who handles physical work at each site before service begins.',
  },
  {
    q: 'Does this include every night and weekend?',
    a: 'Coverage is defined in your service plan. The website shows the available windows and any holiday or weekend exclusions before you buy.',
  },
  {
    q: 'Will you guarantee HIPAA compliance?',
    a: 'No. We help identify risks, coordinate improvements, and organize evidence within the agreed scope. Your organization keeps its compliance responsibilities.',
  },
];

export const nav = [
  { label: 'Services', href: '/services' },
  { label: 'Long-Term Care', href: '/long-term-care' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '/about' },
  { label: 'Resources', href: '/blog' },
];

export function formatPrice(price: Price | 'scoped'): string {
  if (price === 'scoped') return 'Scoped after a free discovery call';
  if (price.amount === null) return `${price.prefix}: published soon`;
  const amount = `$${price.amount.toLocaleString('en-US')}`;
  return [price.prefix, amount, price.unit].filter(Boolean).join(' ');
}

/** Headline and paragraph for the overnight message, honoring the coverage gate. */
export function coverageMessage() {
  const c = site.coverage;
  return c.confirmed
    ? { heading: c.claim, body: c.claimSupport }
    : { heading: c.fallback, body: c.fallbackSupport };
}
