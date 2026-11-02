/** Local, transient presentation only: no persisted screenshots, storage or form submission. */
type Router = { push: (href: string) => void };
type NavigationEvent = Event & { destination: { url: string; sameDocument: boolean }; canIntercept: boolean; hashChange: boolean; downloadRequest: string | null; formData: FormData | null; intercept: (options: { handler: () => Promise<void> }) => void };

export function installDoorNavigation(router: Router) {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let layer: HTMLDivElement | null = null;
  let source = '';
  let timer = 0;
  let frame = 0;
  let opening = false;
  let animations: Animation[] = [];
  let disposed = false;
  let generation = 0;
  let previousURL = location.href;
  const clean = () => {
    generation++;
    clearTimeout(timer); cancelAnimationFrame(frame);
    animations.forEach(animation => animation.cancel()); animations = [];
    layer?.remove(); layer = null; opening = false;
    delete document.documentElement.dataset.doorTransition;
  };
  const eligible = (href: string, from = location.href) => {
    try {
      const next = new URL(href, location.href), current = new URL(from);
      return next.origin === current.origin && /^https?:$/.test(next.protocol)
        && !/^\/(api|_next|design_assets)(\/|$)/.test(next.pathname)
        && !/\.[a-z0-9]{2,8}$/i.test(next.pathname)
        && (next.pathname !== current.pathname || next.search !== current.search);
    } catch { return false; }
  };
  const prepare = (href: string, from = location.href) => {
    if (!eligible(href, from)) return;
    clean();
    if (motion.matches || document.hidden || !Element.prototype.animate) return;
    // A snapshot in an inert shadow tree cannot acquire focus, execute scripts or duplicate public IDs.
    try {
      const css = Array.from(document.styleSheets).map(sheet => {
        try { return Array.from(sheet.cssRules).map(rule => rule.cssText).join('\n'); } catch { return ''; }
      }).join('\n');
      const old = document.documentElement.cloneNode(true) as HTMLElement;
      const pinned: DOMRect[] = [];
      const sourceElements = Array.from(document.documentElement.querySelectorAll('*'));
      const copyElements = Array.from(old.querySelectorAll('*'));
      sourceElements.forEach((element, index) => {
        const position = getComputedStyle(element).position;
        if (position !== 'fixed' && position !== 'sticky') return;
        const rect = element.getBoundingClientRect();
        if (rect.width && rect.height) {
          copyElements[index].setAttribute('data-door-position', String(pinned.length)); pinned.push(rect);
        }
      });
      old.querySelectorAll('*').forEach(element => {
        for (const attribute of Array.from(element.attributes)) {
          if (attribute.name.toLowerCase().startsWith('on')) element.removeAttribute(attribute.name);
        }
      });
      old.querySelector('head')?.remove();
      old.querySelectorAll('script,iframe,object,embed,audio,video,dialog,[data-equipment-entrance-layer],[data-door-layer]').forEach(node => node.remove());
      old.querySelectorAll('input,textarea,select').forEach(node => {
        if (node instanceof HTMLInputElement || node instanceof HTMLTextAreaElement) node.value = '';
        if (node instanceof HTMLSelectElement) node.selectedIndex = -1;
        node.removeAttribute('value'); node.removeAttribute('name');
        if (node instanceof HTMLTextAreaElement) node.textContent = '';
      });
      old.removeAttribute('data-door-transition');
      const computed = getComputedStyle(document.documentElement);
      for (const name of Array.from(computed)) if (name.startsWith('--')) old.style.setProperty(name, computed.getPropertyValue(name));
      old.style.width = `${document.documentElement.clientWidth}px`; old.style.height = 'auto'; old.style.overflow = 'visible';
      const body = old.querySelector('body');
      if (body) { body.style.margin = '0'; body.style.width = `${document.documentElement.clientWidth}px`; }
      const viewportWidth = innerWidth, viewportHeight = innerHeight;
      layer = document.createElement('div');
      layer.dataset.doorLayer = ''; layer.setAttribute('aria-hidden', 'true'); layer.inert = true;
      layer.style.cssText = `position:fixed;inset:0;z-index:2147483000;pointer-events:none;overflow:hidden;perspective:${viewportWidth * 3.2}px;isolation:isolate;`;
      for (const [index, side] of ['left', 'right'].entries()) {
        const door = document.createElement('div'); door.dataset.doorSide = side;
        door.style.cssText = `position:absolute;top:0;${side}:0;width:50%;height:100%;overflow:hidden;background:#f7f5f0;transform-origin:${side} center;backface-visibility:hidden;box-shadow:0 0 24px #0003;will-change:transform;`;
        const shadow = door.attachShadow({ mode: 'open' });
        const style = document.createElement('style');
        style.textContent = css + '\n:host{pointer-events:none!important}*{animation:none!important;transition:none!important;caret-color:transparent!important}html{min-height:0!important}';
        const viewport = document.createElement('div');
        viewport.style.cssText = `position:absolute;width:${viewportWidth}px;height:${viewportHeight}px;left:${index ? -viewportWidth / 2 : 0}px;top:0;overflow:hidden;`;
        const snapshot = old.cloneNode(true) as HTMLElement;
        snapshot.style.transform = `translate(${-scrollX}px,${-scrollY}px)`;
        viewport.append(snapshot); shadow.append(style, viewport); layer.append(door);
      }
      source = from; opening = false;
      document.body.append(layer);
      for (const door of Array.from(layer.children)) {
        door.shadowRoot?.querySelectorAll<HTMLElement>('[data-door-position]').forEach(element => {
          const target = pinned[Number(element.dataset.doorPosition)];
          const current = element.getBoundingClientRect();
          element.style.translate = `${target.left - current.left}px ${target.top - current.top}px`;
          element.removeAttribute('data-door-position');
        });
      }
      document.documentElement.dataset.doorTransition = 'waiting';
      timer = window.setTimeout(clean, 5000);
    } catch { clean(); }
  };
  const arrive = () => {
    if (!layer || opening || location.href === source) return;
    opening = true; clearTimeout(timer);
    const activeGeneration = generation;
    previousURL = location.href;
    frame = requestAnimationFrame(() => { frame = requestAnimationFrame(() => {
      if (!layer || disposed || generation !== activeGeneration) return;
      if (motion.matches) { clean(); return; }
      document.documentElement.dataset.doorTransition = 'opening';
      const timing: KeyframeAnimationOptions = { duration: 950, easing: 'cubic-bezier(.22,.75,.2,1)', fill: 'both' };
      animations = Array.from(layer.children).map((door, index) => door.animate([
        { transform: 'rotateY(0deg)', opacity: 1 },
        { transform: `rotateY(${index ? 110 : -110}deg)`, opacity: 1 }
      ], timing));
      const content = document.querySelector('[data-door-page]');
      if (content) animations.push(content.animate([
        { transform: 'perspective(1600px) translateZ(-220px) scale(.88)', filter: 'brightness(.72)' },
        { transform: 'perspective(1600px) translateZ(0) scale(1)', filter: 'brightness(1)' }
      ], timing));
      void Promise.allSettled(animations.map(animation => animation.finished)).then(() => { if (opening && generation === activeGeneration) clean(); });
      timer = window.setTimeout(clean, 1400);
    }); });
  };
  const click = (event: MouseEvent) => {
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const anchor = event.target instanceof Element ? event.target.closest('a[href]') : null;
    if (!(anchor instanceof HTMLAnchorElement) || anchor.hasAttribute('download') || (anchor.target && anchor.target !== '_self') || anchor.rel.includes('external')) return;
    prepare(anchor.href);
  };
  const navigation = (window as Window & { navigation?: EventTarget }).navigation;
  const navigate = (event: Event) => {
    const e = event as NavigationEvent;
    if (!eligible(e.destination.url) || e.hashChange || e.downloadRequest !== null || e.formData) return;
    if (!layer) prepare(e.destination.url);
    // Internal GET document navigations (legacy location.assign/href) become normal App Router navigations.
    // Never intercept POSTs, API endpoints, downloads or external payment providers.
    if (!e.destination.sameDocument && e.canIntercept) {
      const target = new URL(e.destination.url);
      e.intercept({ handler: async () => { router.push(target.pathname + target.search + target.hash); } });
    }
  };
  const observer = new MutationObserver(arrive);
  observer.observe(document.body, { childList: true, characterData: true, subtree: true });
  const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') clean(); };
  const hidden = () => { if (document.hidden) clean(); };
  const changed = () => { if (motion.matches) clean(); };
  const pop = () => { if (!layer) prepare(location.href, previousURL); arrive(); previousURL = location.href; };
  const committed = () => { arrive(); previousURL = location.href; };
  document.addEventListener('click', click, true);
  window.addEventListener('gym:route-ready', committed);
  navigation?.addEventListener('navigate', navigate);
  window.addEventListener('popstate', pop);
  window.addEventListener('resize', clean);
  document.addEventListener('keydown', onKey);
  document.addEventListener('visibilitychange', hidden);
  motion.addEventListener('change', changed);
  return () => {
    disposed = true; observer.disconnect(); clean();
    window.removeEventListener('gym:route-ready', committed);
    document.removeEventListener('click', click, true); navigation?.removeEventListener('navigate', navigate);
    window.removeEventListener('popstate', pop); window.removeEventListener('resize', clean);
    document.removeEventListener('keydown', onKey); document.removeEventListener('visibilitychange', hidden);
    motion.removeEventListener('change', changed);
  };
}
