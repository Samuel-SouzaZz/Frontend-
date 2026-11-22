export function posicionarMenu(trigger: HTMLElement, menu: HTMLElement) {
  const area = trigger.getBoundingClientRect();
  const width = Math.max(area.width, menu.scrollWidth > area.width ? Math.min(menu.scrollWidth, 320) : 0);
  menu.style.width = `${width}px`;
  const real = menu.offsetWidth;
  const alignRight = area.left + real > window.innerWidth - 8;
  const left = Math.max(8, alignRight ? area.right - real : area.left);
  const below = window.innerHeight - area.bottom - 15;
  const above = area.top - 15;
  const height = Math.min(menu.scrollHeight, 280);
  const upward = height > below && above > below;
  menu.style.left = `${left}px`;
  menu.style.maxHeight = `${Math.max(120, Math.min(280, upward ? above : below))}px`;
  menu.style.top = upward ? "auto" : `${area.bottom + 7}px`;
  menu.style.bottom = upward ? `${window.innerHeight - area.top + 7}px` : "auto";
}
