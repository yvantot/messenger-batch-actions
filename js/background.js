importScripts("/js/shared/page-parts.js");

const storage = chrome.storage.local;
// How old the last check of GitHub's rules can be before pages and the popup ask for a new one.
const RULES_CHECK_HOURS = 6;

// Downloads the layout rules from GitHub, checks them (see clean_page_rules) and saves them as page_rules for
// the content scripts, which pick them up on their own. Nothing is sent but the request itself: no cookies, no
// referrer, nothing about chats. Resolves with { ok: true, version, changed } or { ok: false, error }, which is
// also saved as rules_check.
async function fetch_rules() {
	let result;
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), 15000);
	try {
		const response = await fetch(PAGE_RULES_URL, {
			cache: "no-cache",
			credentials: "omit",
			referrerPolicy: "no-referrer",
			signal: controller.signal,
		}).catch(() => {
			throw new Error("Couldn't reach GitHub.");
		});
		if (!response.ok) throw new Error(`GitHub answered with error ${response.status}.`);
		const text = await response.text();
		if (text.length > PAGE_RULES_MAX_LENGTH) throw new Error("The rules file is too big.");
		let raw;
		try {
			raw = JSON.parse(text);
		} catch {
			throw new Error("The rules file isn't valid.");
		}
		let rules;
		try {
			rules = clean_page_rules(raw, chrome.runtime.getManifest().version);
		} catch (error) {
			// Rules that don't fit this version stop being used; a failed download keeps the last good ones.
			await storage.remove("page_rules");
			throw error;
		}
		const { page_rules } = await storage.get("page_rules");
		const changed = JSON.stringify(page_rules ?? null) !== JSON.stringify(rules);
		if (changed) await storage.set({ page_rules: rules });
		result = { ok: true, version: rules.version, skipped: rules.skipped, changed };
	} catch (error) {
		result = { ok: false, error: error.name === "AbortError" ? "Couldn't reach GitHub." : error.message };
	} finally {
		clearTimeout(timer);
	}
	await storage.set({ rules_check: { at: Date.now(), ...result } });
	return result;
}

// One download at a time, however many tabs ask.
let rules_download = null;
function fetch_rules_once() {
	rules_download ??= fetch_rules().finally(() => (rules_download = null));
	return rules_download;
}

async function check_rules() {
	const { rules_check } = await storage.get("rules_check");
	if (rules_check && Date.now() - rules_check.at < RULES_CHECK_HOURS * 3600000) return rules_check;
	return fetch_rules_once();
}

chrome.runtime.onMessage.addListener((request, _, send) => {
	switch (request?.message) {
		// From pages and the popup: check when the last check is old enough
		case "rules_check":
			check_rules().then(send, () => send(null));
			return true;
		// From the popup's report: check now
		case "rules_fetch":
			fetch_rules_once().then(send, () => send(null));
			return true;
		// From the test bridge (js/content/main.js): reloads an unpacked copy from disk
		case "dev_reload":
			if (!("update_url" in chrome.runtime.getManifest())) chrome.runtime.reload();
			return;
	}
});

// On install and on every update, so a new version starts with rules meant for it.
chrome.runtime.onInstalled.addListener(() => {
	fetch_rules_once();
});
