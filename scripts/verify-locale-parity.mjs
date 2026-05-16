#!/usr/bin/env node
// verify-locale-parity.mjs
//
// Asserts that every flat key in `client/public/locales/pl/translation.json`
// also exists in `client/public/locales/en/translation.json` and vice
// versa. Exits non-zero on drift so CI fails fast.
//
// We deliberately don't check VALUES (those are translations, they
// should differ) — only key parity, which prevents the class of bug
// where a feature ships in one language but renders the raw key in
// the other.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "..");

const load = (locale) => {
    const path = resolve(
        repoRoot,
        `client/public/locales/${locale}/translation.json`,
    );
    return JSON.parse(readFileSync(path, "utf8"));
};

/** Flatten { a: { b: 'x' } } → { 'a.b': 'x' }. */
const flatten = (obj, prefix = "", out = {}) => {
    for (const [k, v] of Object.entries(obj)) {
        const key = prefix ? `${prefix}.${k}` : k;
        if (v && typeof v === "object" && !Array.isArray(v)) {
            flatten(v, key, out);
        } else {
            out[key] = v;
        }
    }
    return out;
};

const pl = flatten(load("pl"));
const en = flatten(load("en"));

const plKeys = new Set(Object.keys(pl));
const enKeys = new Set(Object.keys(en));

const onlyInPL = [...plKeys].filter((k) => !enKeys.has(k)).sort();
const onlyInEN = [...enKeys].filter((k) => !plKeys.has(k)).sort();

const report = (label, keys) => {
    if (keys.length === 0) return;
    console.error(`\n  ${label} (${keys.length}):`);
    for (const k of keys) console.error(`    - ${k}`);
};

if (onlyInPL.length === 0 && onlyInEN.length === 0) {
    console.log(
        `✅ Locale parity verified: ${plKeys.size} keys in both pl/ and en/.`,
    );
    process.exit(0);
}

console.error("❌ Locale parity drift detected.");
console.error(`   pl keys: ${plKeys.size}, en keys: ${enKeys.size}`);
report("Only in pl", onlyInPL);
report("Only in en", onlyInEN);
process.exit(1);
