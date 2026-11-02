// Shared by the real header and the offline preview. No library or physics loop.
export function playEquipmentEntrance(root, { force = false, onStart } = {}) {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  let done = false;
  let layer;
  let timer;
  let resolveFinished;
  const records = [];
  const finished = new Promise(resolve => { resolveFinished = resolve; });
  const cleanupListeners = [];
  function finish(result) {
    if (done) return;
    done = true;
    clearTimeout(timer);
    cleanupListeners.forEach(remove => remove());
    records.forEach(({ image, visibility, animation }) => {
      animation.cancel();
      image.style.visibility = visibility;
    });
    layer?.remove();
    root.dataset.equipmentIntro = result === 'skipped' ? 'skipped' : 'settled';
    root.dataset.equipmentIntroResult = result;
    resolveFinished(result);
  }
  const cancel = () => finish('cancelled');
  function listen(target, name, listener) {
    target.addEventListener(name, listener, { passive: true });
    cleanupListeners.push(() => target.removeEventListener(name, listener));
  }
  root.dataset.equipmentIntro = 'loading';
  async function run() {
    if ((!force && preference.matches) || typeof Element.prototype.animate !== 'function') {
      finish('skipped'); return;
    }
    const images = Array.from(root.querySelectorAll('[data-sport-motion] img'));
    await Promise.race([
      Promise.allSettled(images.map(image => image.decode())),
      new Promise(resolve => { timer = setTimeout(resolve, 1200); }),
    ]);
    clearTimeout(timer);
    if (done || !root.isConnected || (!force && preference.matches)) { finish('skipped'); return; }
    const bounds = root.getBoundingClientRect();
    const width = innerWidth, height = innerHeight;
    const targets = images.map(image => ({ image, rect: image.getBoundingClientRect() })).filter(({ image, rect }) =>
      image.complete && image.naturalWidth > 0 && rect.width > 0 && rect.height > 0 &&
      rect.left >= 0 && rect.right <= width && rect.top >= Math.max(0, bounds.top) && rect.bottom <= Math.min(height, bounds.bottom));
    if (!targets.length) { finish('skipped'); return; }
    layer = document.createElement('div');
    layer.dataset.equipmentEntranceLayer = '';
    layer.setAttribute('aria-hidden', 'true');
    Object.assign(layer.style, { position: 'fixed', inset: '0', zIndex: '60', pointerEvents: 'none', overflow: 'hidden', contain: 'strict' });
    document.body.append(layer);
    const transform = (x, y, angle, scale = 1) => `translate3d(${x}px,${y}px,0) rotate(${angle}deg) scale(${scale})`;
    targets.forEach(({ image, rect }, index) => {
      const clone = image.cloneNode(false);
      clone.removeAttribute('id');
      clone.removeAttribute('style');
      clone.alt = '';
      clone.draggable = false;
      Object.assign(clone.style, { position: 'absolute', left: '0', top: '0', width: `${rect.width}px`, height: `${rect.height}px`, objectFit: 'contain', pointerEvents: 'none', willChange: 'transform', filter: 'drop-shadow(0 4px 4px rgba(0,0,0,.25))' });
      layer.append(clone);
      const fromLeft = index % 2 === 0;
      const direction = fromLeft ? 1 : -1;
      const seed = ((index * 37) % 100) / 100;
      const floor = Math.max(rect.bottom + 24, height * (.6 + seed * .18));
      const x1 = width * (fromLeft ? .18 + seed * .15 : .82 - seed * .15);
      const x2 = width * (fromLeft ? .62 + seed * .15 : .38 - seed * .15);
      const animation = clone.animate([
        { transform: transform(fromLeft ? -80 : width + 40, -90, direction * -70, 1.7), offset: 0, easing: 'cubic-bezier(.45,0,.9,.65)' },
        { transform: transform(x1, Math.min(height - 80, floor), direction * 100, 1.5), offset: .25, easing: 'cubic-bezier(.1,.65,.3,1)' },
        { transform: transform(width * (.18 + seed * .64), height * (.1 + seed * .3), direction * 200, 1.4), offset: .43, easing: 'cubic-bezier(.5,0,.9,.6)' },
        { transform: transform(x2, Math.min(height - 90, floor * .8), direction * 300, 1.3), offset: .62, easing: 'cubic-bezier(.12,.7,.35,1)' },
        { transform: transform(rect.left, Math.max(0, rect.top - 35), direction * 350, 1.1), offset: .84, easing: 'ease-in' },
        { transform: transform(rect.left, rect.top + 4, direction * 360, .96), offset: .94, easing: 'ease-out' },
        { transform: transform(rect.left, rect.top, direction * 360), offset: 1 },
      ], { duration: 1850 + (index % 3) * 80, delay: index * 45, fill: 'both' });
      records.push({ image, visibility: image.style.visibility, animation });
      image.style.visibility = 'hidden';
    });
    root.dataset.equipmentIntro = 'running';
    onStart?.();
    listen(window, 'resize', cancel);
    listen(window, 'scroll', cancel);
    listen(window, 'pointerdown', cancel);
    listen(root, 'focusin', cancel);
    listen(window, 'keydown', event => { if (event.key === 'Escape') cancel(); });
    listen(document, 'visibilitychange', () => { if (document.hidden) cancel(); });
    listen(preference, 'change', () => { if (preference.matches && !force) cancel(); });
    await Promise.allSettled(records.map(({ animation, image, visibility }) => animation.finished.then(() => {
      image.style.visibility = visibility;
      animation.effect?.target?.remove();
    })));
    finish('completed');
  }
  run().catch(() => finish('skipped'));
  return { finished, cancel };
}
