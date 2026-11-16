// Non-secret site settings. Copy lives in src/content; motion settings in particles.ts.
export const site = {
  name: 'Haki Tools',
  url: 'https://haki.tools',
  tagline: 'Technology to better your business.',
  description:
    'Haki Tools helps Charleston-area small businesses launch websites, upgrade their online presence, and automate workflows with AI where it genuinely helps.',
  location: 'Charleston, South Carolina',
  // Shown only if the form fails to send, so a visitor can still reach you.
  fallbackEmail: 'robbie.robinson@akoben.ai',
  formEndpoint: import.meta.env.PUBLIC_FORM_ENDPOINT || '/api/contact',
  nav: [
    { label: 'Services', href: '/services' },
    { label: 'Process', href: '/#process' },
    { label: 'FAQ', href: '/#faq' },
  ],
  cta: { label: "Tell me what you're building", href: '/#contact' },
};
