// Mobile menu: a disclosure button. Without JS the menu links are still in the
// footer, and the header CTA is always visible.
const btn = document.querySelector<HTMLButtonElement>('[data-menu-button]');
const menu = document.getElementById('mobile-menu');
if (btn && menu) {
  const set = (open: boolean) => {
    btn.setAttribute('aria-expanded', String(open));
    menu.hidden = !open;
    document.documentElement.classList.toggle('menu-open', open);
  };
  btn.addEventListener('click', () => set(btn.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', (e) => {
    if ((e.target as Element).closest('a')) set(false);
  });
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape') set(false);
  });
}
