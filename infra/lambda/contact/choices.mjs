// The one list of choices the contact form offers. The site's form (Contact.astro)
// renders these, and the Lambda rejects (silently) anything not on the list.
// Project types must match the titles in site/src/content/services/*.md; the site
// build fails if they drift apart. '' means the visitor left an optional field blank.
export const PROJECT_TYPES = ['Launch', 'Upgrade', 'Automate', 'Customization', 'Not sure yet'];
export const TIMELINES = ['As soon as possible', 'Within 1 month', '1 to 3 months', '3 months or more', 'Not sure yet'];
export const BUDGETS = ['Under $2,500', '$2,500 to $5,000', '$5,000 to $10,000', '$10,000 to $25,000', '$25,000 or more', 'Not sure yet'];
