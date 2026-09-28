import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

function createBrowser(choice = null, { readError = false, writeError = false } = {}) {
  assert.ok(fs.existsSync('src/lib/analytics.ts'), 'consent implementation exists');
  const source = ts.transpileModule(fs.readFileSync('src/lib/analytics.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const listeners = new Map();
  const scripts = [];
  const cookies = [];
  const storage = new Map(choice === null ? [] : [['ar_analytics_consent', choice]]);
  const document = {
    referrer: 'https://search.example/private/person?email=secret#token',
    cookie: '_ga=old; _ga_TEST=old; unrelated=keep',
    head: {
      append(script) {
        scripts.push(script);
      },
    },
    createElement() {
      return { remove() {} };
    },
  };
  Object.defineProperty(document, 'cookie', {
    get: () => '_ga=old; _ga_TEST=old; unrelated=keep',
    set: (value) => cookies.push(value),
  });
  let reloads = 0;
  const window = {
    name: '',
    location: {
      hostname: 'adrianrusu.dev',
      pathname: '/projects/pandawave/',
      reload() {
        reloads++;
      },
    },
    localStorage: {
      getItem(key) {
        if (readError) throw new Error('blocked');
        return storage.get(key) ?? null;
      },
      setItem(key, value) {
        if (writeError) throw new Error('full');
        storage.set(key, value);
      },
    },
    addEventListener(name, handler) {
      listeners.set(name, handler);
    },
  };
  const context = { exports: {}, window, document, URL, Date };
  vm.runInNewContext(source, context);
  const api = context.exports.createAnalytics({
    pageLocation: 'https://adrianrusu.dev/projects/pandawave/',
    pageTitle: 'PandaWave',
    projectSlugs: ['pandawave'],
  });
  const commands = () =>
    JSON.parse(JSON.stringify((window.dataLayer ?? []).map((command) => Array.from(command))));
  return { api, window, storage, scripts, cookies, commands, listeners, reloads: () => reloads };
}

test('unknown and rejected consent never initialize Google', () => {
  for (const choice of [null, 'denied', 'invalid']) {
    const browser = createBrowser(choice);
    browser.api.start();
    browser.api.choose('denied');
    assert.equal(browser.scripts.length, 0);
    assert.deepEqual(browser.commands(), []);
    assert.equal(browser.storage.get('ar_analytics_consent'), 'denied');
  }
});

test('grant is persisted before one initialization, with ads denied and sanitized page context', () => {
  const browser = createBrowser();
  browser.api.start();
  assert.equal(browser.api.choose('granted'), true);
  browser.api.choose('granted');
  assert.equal(browser.scripts.length, 1);
  const commands = browser.commands();
  assert.equal(commands.filter(([type]) => type === 'config').length, 1);
  assert.deepEqual(commands.find(([type]) => type === 'consent').slice(1), [
    'default',
    {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    },
  ]);
  const config = commands.find(([type]) => type === 'config')[2];
  assert.equal(config.page_location, 'https://adrianrusu.dev/projects/pandawave/');
  assert.equal(config.page_referrer, 'https://search.example/');
  assert.equal(config.allow_google_signals, false);
  assert.equal(browser.scripts[0].referrerPolicy, 'no-referrer');
});

test('storage read and write errors fail closed', () => {
  for (const options of [{ readError: true }, { writeError: true }]) {
    const browser = createBrowser(null, options);
    browser.api.start();
    assert.equal(browser.api.choose('granted'), false);
    assert.equal(browser.scripts.length, 0);
  }
});

test('revocation disables loaded analytics before clearing cookies and reloading, without denial pings', () => {
  const browser = createBrowser('granted');
  browser.api.start();
  const id = browser.commands().find(([type]) => type === 'config')[1];
  browser.api.choose('denied');
  assert.equal(browser.window[`ga-disable-${id}`], true);
  assert.equal(browser.reloads(), 1);
  assert.equal(browser.storage.get('ar_analytics_consent'), 'denied');
  assert.ok(browser.cookies.some((cookie) => cookie.startsWith('_ga=;')));
  assert.ok(browser.cookies.some((cookie) => cookie.includes('domain=.adrianrusu.dev')));
  assert.ok(browser.cookies.every((cookie) => !cookie.startsWith('unrelated=')));
  assert.deepEqual(browser.commands(), []);
});

test('cross-tab withdrawal and storage clearing revoke consent', () => {
  for (const key of ['ar_analytics_consent', null]) {
    const browser = createBrowser('granted');
    browser.api.start();
    browser.storage.clear();
    browser.listeners.get('storage')({ key, storageArea: browser.window.localStorage });
    assert.equal(browser.reloads(), 1);
  }
});

test('intent events only send allowlisted public metadata with consent', () => {
  const browser = createBrowser();
  browser.api.start();
  browser.api.track('contact_email_click', 'pandawave');
  assert.equal(browser.commands().length, 0);
  browser.api.choose('granted');
  for (const name of [
    'contact_email_click',
    'resume_download',
    'linkedin_click',
    'project_source_click',
  ])
    browser.api.track(name, 'pandawave');
  browser.api.track('untrusted', 'secret@example.com');
  const events = browser.commands().filter(([type]) => type === 'event');
  assert.equal(events.length, 4);
  assert.ok(events.every((event) => !JSON.stringify(event).includes('@')));
  assert.equal(
    events.find((event) => event[1] === 'project_source_click')[2].project_slug,
    'pandawave',
  );
  browser.storage.set('ar_analytics_consent', 'denied');
  browser.api.track('resume_download');
  assert.deepEqual(browser.commands(), []);
});

test('a visitor can allow analytics after initially declining without reloading', () => {
  const browser = createBrowser();
  browser.api.start();
  browser.api.choose('denied');
  assert.equal(browser.api.choose('granted'), true);
  assert.equal(browser.scripts.length, 1);
  assert.equal(browser.reloads(), 0);
  const update = browser.commands().find(([kind, mode]) => kind === 'consent' && mode === 'update');
  assert.equal(update[2].analytics_storage, 'granted');
  assert.equal(update[2].ad_storage, 'denied');
});

test('a failed repeat grant disables existing analytics before reporting it off', () => {
  const browser = createBrowser('granted');
  browser.api.start();
  browser.window.localStorage.setItem = () => {
    throw new Error('storage full');
  };
  assert.equal(browser.api.choose('granted'), false);
  assert.equal(browser.window['ga-disable-G-5JZG6LZFFN'], true);
  assert.deepEqual(browser.commands(), []);
  assert.equal(browser.reloads(), 0);
});
