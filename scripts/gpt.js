#!/usr/bin/env node
/**
 * Extract missing i18n keys per namespace and merge into locales/{namespace}.json.
 *
 * How it works (per file):
 * 1) Detect namespace via: const { t[: alias]? } = useTranslation('namespace')
 *    - Supports: useTranslation('ns') and useTranslation<'T'>('ns')
 *    - Captures alias (e.g., { t: tt } => alias 'tt'), defaults to 't'.
 * 2) Find all calls to that alias: alias('key') where key is a string literal.
 * 3) Aggregate keys per namespace across the project.
 * 4) Merge into locales/{namespace}.json without overwriting existing values.
 *
 * Notes:
 * - Only string-literal keys are extracted ('...' or "..."). Template literals/variables are ignored.
 * - Dot paths (e.g., "menu.file.open") are expanded into nested objects.
 * - The JSON is pretty-printed and keys are sorted (stable).
 */

import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import url from "url";

/** ---------- CLI args ---------- */
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const getArg = (name, def) => {
    const i = args.findIndex(a => a === `--${name}` || a.startsWith(`--${name}=`));
    if (i === -1) return def;
    const eq = args[i].indexOf("=");
    if (eq === -1) return args[i + 1] ?? def;
    return args[i].slice(eq + 1);
};

const SRC_DIR = path.resolve(getArg("src", "src"));
const OUT_DIRs = [path.resolve(getArg("out", "public/locales/en")), path.resolve(getArg("out", "public/locales/zh"))]
const DRY_RUN = !!args.find(a => a === "--dry-run");
const DEFAULT_VALUE = getArg("default", ""); // "", "key"

/** ---------- Helpers ---------- */
const IGNORED_DIRS = new Set([
    "node_modules", ".git", "dist", "build", ".next", "out", ".turbo", ".cache"
]);

const VALID_EXTS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);

function escapeRegExp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function* walk(dir) {
    const entries = await fsp.readdir(dir, { withFileTypes: true });
    for (const e of entries) {
        if (e.name.startsWith(".")) {
            // allow .env etc. to be skipped
        }
        const p = path.join(dir, e.name);
        if (e.isDirectory()) {
            if (!IGNORED_DIRS.has(e.name)) {
                yield* walk(p);
            }
        } else if (e.isFile() && VALID_EXTS.has(path.extname(e.name))) {
            yield p;
        }
    }
}

function deepSetIfMissing(root, dotPath, value) {
    const parts = dotPath.split(".");
    let cur = root;
    for (let i = 0; i < parts.length; i++) {
        const k = parts[i];
        const isLast = i === parts.length - 1;

        if (!(k in cur)) {
            cur[k] = isLast ? value : {};
            cur = cur[k];
            continue;
        }

        // If it exists:
        if (isLast) {
            // don't overwrite existing non-object value
            // leave as-is
        } else {
            if (typeof cur[k] !== "object" || cur[k] == null || Array.isArray(cur[k])) {
                // existing non-object conflicts with nested path; keep as-is, but stop descending
                return;
            }
            cur = cur[k];
        }
    }
}

function sortObjectRecursively(obj) {
    if (Array.isArray(obj)) return obj.slice();
    if (typeof obj !== "object" || obj === null) return obj;
    const out = {};
    for (const k of Object.keys(obj).sort()) {
        out[k] = sortObjectRecursively(obj[k]);
    }
    return out;
}

/** Regex builders */
// 1) Find: const { t [: alias]? } = useTranslation('namespace')
const RE_DESTRUCT_UT = /const\s*{\s*t\s*(?::\s*([A-Za-z_$][\w$]*))?\s*}\s*=\s*useTranslation\s*(?:<[^>]*>)?\s*\(\s*(['"])([^'"]+)\2\s*\)/g;

// 2) Fallback to find namespace when destructuring isn't explicit:
//    matches any: useTranslation('ns') (with optional generics)
const RE_RAW_UT = /useTranslation\s*(?:<[^>]*>)?\s*\(\s*(['"])([^'"]+)\1\s*\)/g;

/** ---------- Main extraction ---------- */
async function extract() {
    /** map: ns -> Set(keys) */
    const nsToKeys = new Map();

    for await (const file of walk(SRC_DIR)) {
        let text;
        try {
            text = await fsp.readFile(file, "utf8");
        } catch {
            continue;
        }

        // 1) Find all "const { t[:alias]? } = useTranslation('ns')" patterns
        const aliasToNs = []; // [{ alias: 't'|'tt'..., ns }]
        {
            RE_DESTRUCT_UT.lastIndex = 0;
            let m;
            while ((m = RE_DESTRUCT_UT.exec(text))) {
                const alias = m[1] ? m[1] : "t";
                const ns = m[3];
                aliasToNs.push({ alias, ns });
            }
        }

        // 2) If none found, still capture raw useTranslation('ns') and assume alias "t"
        if (aliasToNs.length === 0) {
            RE_RAW_UT.lastIndex = 0;
            let m;
            while ((m = RE_RAW_UT.exec(text))) {
                const ns = m[2];
                aliasToNs.push({ alias: "t", ns });
            }
        }

        if (aliasToNs.length === 0) continue;

        // 3) For each alias, collect keys from alias('key')
        for (const { alias, ns } of aliasToNs) {
            const callRe = new RegExp(
                `\\b${escapeRegExp(alias)}\\s*\\(\\s*(['"])([^'"\\n\\r]+)\\1\\s*\\)`,
                "g"
            );
            let cm;
            while ((cm = callRe.exec(text))) {
                const key = cm[2].trim();
                if (!key) continue;
                if (!nsToKeys.has(ns)) nsToKeys.set(ns, new Set());
                nsToKeys.get(ns).add(key);
            }
        }
    }

    return nsToKeys;
}

/** ---------- Merge & write ---------- */
async function ensureDir(p) {
    await fsp.mkdir(p, { recursive: true });
}

async function readJsonOrEmpty(p) {
    try {
        const s = await fsp.readFile(p, "utf8");
        return JSON.parse(s);
    } catch {
        return {};
    }
}

async function writeJsonPretty(p, obj) {
    const sorted = sortObjectRecursively(obj);
    const s = JSON.stringify(sorted, null, 2) + "\n";
    if (!DRY_RUN) await fsp.writeFile(p, s, "utf8");
}

(async function main() {
    const nsToKeys = await extract();

    if (nsToKeys.size === 0) {
        console.log("No namespaces or keys found. Nothing to do.");
        process.exit(0);
    }

    for (let OUT_DIR of OUT_DIRs) {
        await ensureDir(OUT_DIR);

        for (const [ns, keys] of nsToKeys) {
            const target = path.join(OUT_DIR, `${ns}.json`);
            const existing = await readJsonOrEmpty(target);

            // Merge missing
            let added = 0;
            for (const k of keys) {
                const defaultVal = DEFAULT_VALUE === "key" ? k : "";
                // set k as dot-path
                // If final segment already exists, do not overwrite
                // If any intermediate is a non-object, we skip writing that key
                const before = JSON.stringify(existing);
                deepSetIfMissing(existing, k, defaultVal);
                const after = JSON.stringify(existing);
                if (before !== after) added++;
            }

            if (added === 0) {
                console.log(`[${ns}] no new keys.`);
            } else {
                console.log(`[${ns}] +${added} new key(s) -> ${path.relative(process.cwd(), target)}`);
            }

            await writeJsonPretty(target, existing);
        }

        if (DRY_RUN) {
            console.log("\n(DRY RUN) No files were written. Re-run without --dry-run to apply changes.");
        }
    }
})().catch(err => {
    console.error(err);
    process.exit(1);
});
