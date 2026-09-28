export type Consent = 'granted' | 'denied';
type Intent =
  'contact_email_click' | 'resume_pdf_click' | 'linkedin_click' | 'project_source_click';
interface AnalyticsOptions {
  pageLocation: string;
  pageTitle: string;
  projectSlugs?: string[];
  onChange?: (choice: Consent | null) => void;
}
declare global {
  interface Window {
    dataLayer?: IArguments[];
    gtag?: (...args: unknown[]) => void;
    'ga-disable-G-5JZG6LZFFN'?: boolean;
  }
}

const ID = 'G-5JZG6LZFFN';
const KEY = 'ar_analytics_consent';
const adConsent = { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' };
const intents: readonly string[] = [
  'contact_email_click',
  'resume_pdf_click',
  'linkedin_click',
  'project_source_click',
];

export function createAnalytics(options: AnalyticsOptions) {
  let initialized = false;
  let started = false;
  let disabled = false;
  let script: HTMLScriptElement | undefined;

  function preference(): Consent | null {
    try {
      const value = window.localStorage.getItem(KEY);
      return value === 'granted' || value === 'denied' ? value : null;
    } catch {
      return null;
    }
  }

  function clearCookies() {
    const domains = [undefined, window.location.hostname, `.${window.location.hostname}`];
    for (const entry of document.cookie.split(';')) {
      const name = entry.trim().split('=')[0];
      if (name !== '_ga' && !name.startsWith('_ga_')) continue;
      for (const domain of domains) {
        document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax${domain ? `; domain=${domain}` : ''}`;
      }
    }
  }

  function revoke(reload: boolean) {
    disabled = initialized;
    window['ga-disable-G-5JZG6LZFFN'] = true;
    // Basic consent: do not send a consent-update ping on withdrawal.
    window.gtag = () => {};
    if (window.dataLayer) window.dataLayer = [];
    script?.remove();
    clearCookies();
    if (initialized && reload) window.location.reload();
  }

  function initialize() {
    if (initialized || disabled || preference() !== 'granted') return;
    initialized = true;
    window['ga-disable-G-5JZG6LZFFN'] = false;
    window.dataLayer = [];
    window.gtag = function () {
      window.dataLayer?.push(arguments);
    };
    window.gtag('consent', 'default', { analytics_storage: 'denied', ...adConsent });
    window.gtag('consent', 'update', { analytics_storage: 'granted', ...adConsent });
    window.gtag('js', new Date());
    let referrer = '';
    try {
      const url = new URL(document.referrer);
      if (url.protocol === 'https:' || url.protocol === 'http:') referrer = `${url.origin}/`;
    } catch {
      /* Empty or invalid referrers are omitted. */
    }
    const location = new URL(options.pageLocation);
    location.search = '';
    location.hash = '';
    window.gtag('config', ID, {
      page_location: location.href,
      page_title: options.pageTitle,
      page_referrer: referrer,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    });
    script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${ID}`;
    script.referrerPolicy = 'no-referrer';
    document.head.append(script);
  }

  function choose(choice: Consent) {
    let saved = false;
    try {
      window.localStorage.setItem(KEY, choice);
      saved = preference() === choice;
    } catch {
      /* Keep analytics off if the browser cannot save a preference. */
    }
    if (choice === 'denied') revoke(saved);
    else if (saved && disabled) window.location.reload();
    else if (saved) initialize();
    else {
      revoke(false);
      return false;
    }
    options.onChange?.(saved ? choice : null);
    return saved;
  }

  function start() {
    if (started) return;
    started = true;
    window['ga-disable-G-5JZG6LZFFN'] = true;
    initialize();
    window.addEventListener('storage', (event) => {
      if (event.storageArea !== window.localStorage || (event.key !== KEY && event.key !== null))
        return;
      const choice = preference();
      if (choice !== 'granted') revoke(true);
      else if (!disabled) initialize();
      options.onChange?.(choice);
    });
  }

  function track(name: Intent, projectSlug?: string) {
    if (!initialized || disabled) return;
    if (preference() !== 'granted') {
      revoke(true);
      return;
    }
    if (!intents.includes(name)) return;
    const params: Record<string, string> = {
      send_to: ID,
      page_path: new URL(options.pageLocation).pathname,
    };
    if (name === 'project_source_click') {
      if (!projectSlug || !options.projectSlugs?.includes(projectSlug)) return;
      params.project_slug = projectSlug;
    }
    window.gtag?.('event', name, params);
  }
  return { start, choose, preference, track };
}
