import { Capacitor } from '@capacitor/core';

/** Keep all native bridges behind platform checks so the website remains portable. */
export function isNative() {
  return Capacitor?.isNativePlatform?.() === true;
}
export function isAppShell() {
  return (
    isNative() ||
    globalThis.matchMedia?.('(display-mode: standalone)').matches === true ||
    globalThis.navigator?.standalone === true
  );
}
export async function lightImpact() {
  if (!isNative()) return;
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch {
    /* Haptics are optional, including in Simulator. */
  }
}
export async function successHaptic() {
  if (!isNative()) return;
  try {
    const { Haptics, NotificationType } = await import('@capacitor/haptics');
    await Haptics.notification({ type: NotificationType.Success });
  } catch {
    /* Haptics are optional, including in Simulator. */
  }
}
export async function shareFile(text, name) {
  const [{ Filesystem, Directory, Encoding }, { Share }] = await Promise.all([
    import('@capacitor/filesystem'),
    import('@capacitor/share'),
  ]);
  const file = await Filesystem.writeFile({
    path: name.replace(/[^a-zA-Z0-9._-]/g, '_'),
    data: text,
    directory: Directory.Cache,
    encoding: Encoding.UTF8,
  });
  try {
    await Share.share({ title: 'HEARTH', files: [file.uri] });
  } catch (error) {
    if (error?.message !== 'Share canceled') throw error;
  }
}

/** Native-only page integrations; no remote data or website plugin calls. */
export function initializeNativeShell() {
  if (!isNative()) return;
  document.documentElement.dataset.nativeShell = 'true';
  // WKWebView can temporarily report a zero top inset while the keyboard is open.
  const rememberTopInset = () => {
    const probe = document.createElement('div');
    probe.style.cssText = 'position:fixed;visibility:hidden;padding-top:env(safe-area-inset-top)';
    document.body.append(probe);
    const inset = parseFloat(getComputedStyle(probe).paddingTop) || 0;
    probe.remove();
    const root = document.documentElement;
    const previous = parseFloat(root.style.getPropertyValue('--native-safe-top')) || 0;
    root.style.setProperty('--native-safe-top', `${Math.max(previous, inset)}px`);
  };
  requestAnimationFrame(rememberTopInset);
  setTimeout(rememberTopInset, 600);
  document.addEventListener('keydown', rememberTopInset, { capture: true, passive: true });
  document.addEventListener('pointerdown', rememberTopInset, { capture: true, passive: true });
  window.visualViewport?.addEventListener('resize', rememberTopInset);
  document.querySelector('meta[name="viewport"]').content =
    'width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover';
  import('@capacitor/status-bar')
    .then(({ StatusBar, Style }) => StatusBar.setStyle({ style: Style.Light }))
    .catch(() => {});
  const keyboard = () => {
    const input = document.activeElement?.matches('input:not([type=range]), textarea');
    document.documentElement.dataset.keyboardOpen = String(Boolean(input));
  };
  document.addEventListener('focusin', keyboard);
  document.addEventListener('focusout', () => setTimeout(keyboard, 0));
  document.addEventListener(
    'click',
    async (event) => {
      const anchor = event.target.closest?.('a[href]');
      if (!anchor) return;
      const url = new URL(anchor.href, location.href);
      if (/^https?:$/.test(url.protocol)) {
        event.preventDefault();
        try {
          const { Browser } = await import('@capacitor/browser');
          await Browser.open({ url: url.href, toolbarColor: '#F6F3EE' });
        } catch {
          window.alert('This link could not be opened. Please try again.');
        }
      } else if (url.pathname.startsWith('/methods/')) {
        event.preventDefault();
        try {
          const response = await fetch(url.href);
          if (!response.ok) throw new Error('Unavailable');
          await shareFile(await response.text(), url.pathname.split('/').pop());
        } catch {
          window.alert('This document could not be opened. Please try again.');
        }
      }
    },
    true,
  );
}
/** Share plain text: the iOS share sheet in the app, the Web Share API or clipboard elsewhere. */
export async function shareText(title, text) {
  if (isNative()) {
    try {
      const { Share } = await import('@capacitor/share');
      await Share.share({ title, text });
    } catch (error) {
      if (error?.message !== 'Share canceled') throw error;
    }
    return 'shared';
  }
  if (globalThis.navigator?.share) {
    try {
      await navigator.share({ title, text });
    } catch (error) {
      if (error?.name !== 'AbortError') throw error;
    }
    return 'shared';
  }
  await navigator.clipboard?.writeText(text);
  return 'copied';
}
