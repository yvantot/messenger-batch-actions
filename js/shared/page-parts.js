// The parts of Messenger's page that Batch Actions works with, and the built-in ways to find each one, best first.
// Shared by the content scripts (which use them), the background (which checks rules from GitHub against them) and
// the popup (which names them in reports).
//
// Each way is a CSS selector. The content scripts try a part's ways in order and use the first one that finds
// something. Rules from GitHub (rules/page-rules.json) add ways in front of these, or replace them, so a Messenger
// change can be fixed without waiting for a Chrome Web Store release.
const PAGE_PARTS = {
	// The list of chats on the left, in the main list, Archived, Requests and on facebook.com/messages
	chat_list: {
		label: "chat list",
		ways: ["div[role='grid']:has(a[href*='/t/'])", "div[class='x1n2onr6']:has(a[href*='/t/'])"],
	},
	chat_row: { label: "chat rows", ways: ["div[role='row']"] },
	chat_link: { label: "chat links", ways: ["a[href*='/t/']"] },
	chat_name: { label: "chat names", ways: ["span[dir='auto']", "span"] },
	// The "..." button on each chat row
	menu_button: {
		label: "chat menu buttons",
		ways: ["[aria-haspopup='menu']", ...[
			"M458 408a2 2 0 1 1-4 0 2 2 0 0 1 4 0m6 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0m-12 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0",
			"M12.5 18A2.25 2.25 0 1 1 8 18a2.25 2.25 0 0 1 4.5 0zM20.25 18a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0zM25.75 20.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5z",
		].map((d) => `div[role='button']:has(path[d='${d}'])`)],
	},
	menu: { label: "chat menus", ways: ["div[role='menu']"] },
	menu_item: { label: "menu items", ways: ["div[role='menuitem']"] },
	dialog: { label: "dialogs", ways: ["div[role='dialog']"] },
	dialog_button: { label: "dialog buttons", ways: ["div[role='button']"] },
	dialog_choice: { label: "dialog choices", ways: ["input[type='radio']"] },
};

// The chat menu's items. Each is found by its icon first, which is the same in every language, then by how its
// English label starts. The first icon is the one Messenger and Facebook use now; the others are older ones,
// kept in case they come back. Unmute has no icon (it's drawn from an image), so as a last resort it's the item
// with an image and no icon.
const MENU_ACTIONS = {
	archive: { label: "Archive", doing: "Archiving", past: "Archived", icons: [
			"M12.78 7.22a.75.75 0 0 1 0 1.06L11.06 10l1.72 1.72a.75.75 0 1 1-1.06 1.06L10 11.06l-1.72 1.72a.75.75 0 0 1-1.06-1.06L8.94 10 7.22 8.28a.75.75 0 0 1 1.06-1.06L10 8.94l1.72-1.72a.75.75 0 0 1 1.06 0z",
			"M9 13.5a.5.5 0 01.5-.5h17a.5.5 0 01.5.5v12a3 3 0 01-3 3H12a3 3 0 01-3-3v-12zm4.5 3.25c0-.69.56-1.25 1.25-1.25h6.5a1.25 1.25 0 110 2.5h-6.5c-.69 0-1.25-.56-1.25-1.25z",
		], labels: ["archive"] },
	unarchive: { label: "Unarchive", doing: "Unarchiving", past: "Unarchived", icons: [
			"M9.694 19h.612c1.838 0 3.294 0 4.433-.153 1.172-.158 2.121-.49 2.87-1.238.748-.749 1.08-1.698 1.238-2.87.153-1.14.153-2.595.153-4.433v-.612c0-1.838 0-3.294-.153-4.433-.158-1.172-.49-2.121-1.238-2.87-.749-.748-1.698-1.08-2.87-1.238C13.599 1 12.144 1 10.306 1h-.612C7.856 1 6.4 1 5.26 1.153c-1.172.158-2.121.49-2.87 1.238-.748.749-1.08 1.698-1.238 2.87C1 6.401 1 7.856 1 9.694v.612c0 1.838 0 3.294.153 4.433.158 1.172.49 2.121 1.238 2.87.749.748 1.698 1.08 2.87 1.238C6.401 19 7.856 19 9.694 19zm6.854-2.452c-.423.423-1.003.677-2.009.812-1.027.138-2.382.14-4.289.14h-.5c-1.907 0-3.261-.002-4.29-.14-1.005-.135-1.585-.389-2.008-.812-.423-.423-.677-1.003-.812-2.009-.077-.567-.111-1.234-.127-2.039H5.75c.057 0 .13.021.215.1.09.082.174.21.222.361a4.001 4.001 0 0 0 7.626 0 .844.844 0 0 1 .222-.362c.085-.078.158-.099.215-.099h3.237c-.016.805-.05 1.472-.127 2.04-.135 1.005-.389 1.585-.812 2.008zM17.5 11h-3.25c-1.002 0-1.644.805-1.867 1.508a2.501 2.501 0 0 1-4.766 0C7.394 11.805 6.752 11 5.75 11H2.5V9.75c0-1.907.002-3.261.14-4.29.135-1.005.389-1.585.812-2.008.423-.423 1.003-.677 2.009-.812 1.028-.138 2.382-.14 4.289-.14h.5c1.907 0 3.261.002 4.29.14 1.005.135 1.585.389 2.008.812.423.423.677 1.003.812 2.009.138 1.028.14 2.382.14 4.289V11z",
			"M9.5 13a.5.5 0 00-.5.5v12a3 3 0 003 3h12a3 3 0 003-3v-12a.5.5 0 00-.5-.5h-17zm12.118 7.467a.833.833 0 01-.703 1.28H19.25a.25.25 0 00-.25.25v3.253a.75.75 0 01-.75.75h-.5a.75.75 0 01-.75-.75v-3.252a.25.25 0 00-.25-.25h-1.665a.833.833 0 01-.703-1.28l2.915-4.582a.833.833 0 011.406 0l2.915 4.581z",
		], labels: ["unarchive"] },
	delete: { label: "Delete", doing: "Deleting", past: "Deleted", icons: [
			"m106.523 196.712-2.32-2.256a1.62 1.62 0 0 0-1.13-.456h-3.146a1.62 1.62 0 0 0-1.13.456l-2.32 2.256a.75.75 0 0 0 1.046 1.076l2.32-2.256a.12.12 0 0 1 .084-.032h3.146a.12.12 0 0 1 .084.032l2.32 2.256a.75.75 0 1 0 1.046-1.076zm-5.773 5.788v8a.75.75 0 1 0 1.5 0v-8a.75.75 0 1 0-1.5 0zm3.501-.047-.5 8a.75.75 0 1 0 1.498.094l.5-8a.75.75 0 1 0-1.498-.094zm-7 .094.5 8a.75.75 0 1 0 1.498-.094l-.5-8a.75.75 0 1 0-1.498.094z",
			"M20.882 7c.685 0 1.312.387 1.618 1 .306.613.933 1 1.618 1H27a1 1 0 0 1 1 1v.5a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V10a1 1 0 0 1 1-1h2.882c.685 0 1.312-.387 1.618-1 .306-.613.933-1 1.618-1h5.764zM10.601 13.5a1 1 0 0 0-.995 1.096l1.132 11.693A3 3 0 0 0 13.724 29h8.552a3 3 0 0 0 2.986-2.711l1.132-11.693a1 1 0 0 0-.995-1.096H10.6z",
		], labels: ["delete"] },
	leave: { label: "Leave", doing: "Leaving", past: "Left", icons: [
			"M102.25 217h7.5a.75.75 0 1 0 0-1.5h-7.5a.75.75 0 1 0 0 1.5z",
			"M21.498 14.75a1 1 0 0 0 1-1V12a4 4 0 0 0-4-4h-6.5a4 4 0 0 0-4 4v12a4 4 0 0 0 4 4h6.5a4 4 0 0 0 4-4v-1.75a1 1 0 0 0-1-1h-.5a1 1 0 0 0-1 1V24a1.5 1.5 0 0 1-1.5 1.5h-6.5a1.5 1.5 0 0 1-1.5-1.5V12a1.5 1.5 0 0 1 1.5-1.5h6.5a1.5 1.5 0 0 1 1.5 1.5v1.75a1 1 0 0 0 1 1h.5z",
		], labels: ["leave"] },
	mute: { label: "Mute", doing: "Muting", past: "Muted", icons: [
			"M109.362 211c1.087 0 1.863-.446 2.294-1.184.256-.437.341-.862.344-1.185.01-1.03-.375-1.781-1.27-2.893l-.66-.813a3.495 3.495 0 0 1-.12-.165l-.045-.064c-.214-.31-.32-.549-.339-.75l-.075-1.538A6.489 6.489 0 0 0 103 196.5c-3.38 0-6.187 2.544-6.49 5.877l-.072 1.467c-.001.226-.086.456-.276.751l-.165.241-.11.144-.499.611c-.98 1.194-1.399 1.964-1.388 3.041.003.322.088.747.344 1.184.431.738 1.207 1.184 2.294 1.184h12.724zm0-1.5H96.638c-.553 0-.837-.163-1-.441a1.009 1.009 0 0 1-.138-.44c-.006-.615.28-1.14 1.048-2.076l.396-.483c.153-.19.276-.353.386-.513.394-.572.607-1.094.607-1.666l.07-1.4c.23-2.526 2.387-4.481 4.993-4.481 2.606 0 4.764 1.955 4.995 4.512l.069 1.406c-.001.535.211 1.057.606 1.63.088.127.184.256.297.4l.231.287.254.308.197.245c.62.787.857 1.272.851 1.83 0 .085-.038.268-.139.44-.162.279-.446.442-.999.442z",
			"M18 7a6.569 6.569 0 0 1 6.467 5.414l1.367 7.658a3 3 0 0 0 .832 1.594l.92.92a1.414 1.414 0 0 1-1 2.414H9.414a1.414 1.414 0 0 1-1-2.414l.92-.92a3 3 0 0 0 .832-1.594l1.367-7.658A6.569 6.569 0 0 1 18 7zM15.5 27c-.276 0-.504.226-.459.498a3 3 0 0 0 5.918 0c.045-.273-.183-.498-.459-.498h-5z",
		], labels: ["mute"] },
	unmute: { label: "Unmute", doing: "Unmuting", past: "Unmuted", icons: [], labels: ["unmute"] },
	block: { label: "Block or unblock", doing: "Blocking", past: "Blocked or unblocked", icons: [
			"M9.248 1a4.248 4.248 0 1 0 0 8.497 4.248 4.248 0 0 0 0-8.497zM6.5 5.248a2.748 2.748 0 1 1 5.496 0 2.748 2.748 0 0 1-5.496 0zM6.914 11A5.414 5.414 0 0 0 1.5 16.414a3.082 3.082 0 0 0 3.082 3.082h6.082a.75.75 0 0 0 0-1.5H4.582A1.582 1.582 0 0 1 3 16.415 3.914 3.914 0 0 1 6.914 12.5h4.672a.75.75 0 0 0 0-1.5H6.914zM16 12.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7zm.781 1.658a2 2 0 0 0-2.623 2.623l2.623-2.623zm-1.562 3.683a2 2 0 0 0 2.623-2.623l-2.623 2.623z",
			"M18 29c6.075 0 11-4.925 11-11S24.075 7 18 7 7 11.925 7 18s4.925 11 11 11zm-7-12.5a1 1 0 00-1 1v1a1 1 0 001 1h14a1 1 0 001-1v-1a1 1 0 00-1-1H11z",
		], labels: ["block", "unblock"] },
};

// A part's status in words. Statuses are "main", "backup N" or "rule N" for the way that found it, "missing" for
// a part that was needed and not found, and "unchecked" for one that hasn't been needed on this page yet.
function describe_status(status) {
	if (status === "main") return "found by its main way";
	if (status === "missing") return "not found";
	if (status === "unchecked") return "not needed yet on this page";
	const [kind, number] = String(status).split(" ");
	return kind === "rule" ? `found by GitHub rule ${number}` : `found by backup way ${number}`;
}

// ---------- rules from GitHub ----------

const PAGE_RULES_URL = "https://raw.githubusercontent.com/yvantot/messenger-batch-actions/main/rules/page-rules.json";
const PAGE_RULES_MAX_LENGTH = 131072;
const PAGE_RULES_MAX_WAYS = 8;
const PAGE_RULES_MAX_LABELS = 24;

// A rules file looks like:
//   { "format": 1, "version": "2026-10-22", "minVersion": "1.1.0", "maxVersion": "1.1.9",
//     "parts": { "menu_button": ["div[aria-label^='More options']"],
//                "chat_list": { "ways": ["div[role='grid']"], "replace": true } },
//     "actions": { "archive": { "icons": ["M12 3a9 9 0 1 0 0 18z"], "labels": ["archivar"] } } }
// A list of ways goes in front of the built-in ones; { ways, replace: true } is used instead of them. Icons and
// labels go in front of the built-in ones. minVersion and maxVersion (optional) limit the rules to some versions
// of Batch Actions. Parts and actions this version doesn't know are skipped, so newer rules don't break it.
//
// Returns { version, parts: { name: { ways, replace } }, actions: { name: { icons, labels } }, skipped }, where
// skipped counts what was left out for not being safe, or throws an Error saying why the file can't be used.
function clean_page_rules(raw, extension_version) {
	if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("The rules file isn't a rules file.");
	if (raw.format !== 1) throw new Error("The rules file is in a format this version doesn't know.");
	if (typeof raw.version !== "string" || !raw.version.trim() || raw.version.length > 40) {
		throw new Error("The rules file has no version.");
	}
	if (typeof raw.minVersion === "string" && compare_versions(extension_version, raw.minVersion) < 0) {
		throw new Error(`The rules are for version ${raw.minVersion} and newer.`);
	}
	if (typeof raw.maxVersion === "string" && compare_versions(extension_version, raw.maxVersion) > 0) {
		throw new Error(`The rules are for version ${raw.maxVersion} and older.`);
	}

	let skipped = 0;
	const keep = (list, limit, is_safe, tidy = (value) => value) => {
		const given = Array.isArray(list) ? list.slice(0, limit) : [];
		const kept = given.filter(is_safe).map(tidy);
		skipped += given.length - kept.length;
		return kept;
	};
	const object_or_empty = (value) => (value && typeof value === "object" && !Array.isArray(value) ? value : {});

	const parts = {};
	for (const [name, value] of Object.entries(object_or_empty(raw.parts))) {
		if (!Object.hasOwn(PAGE_PARTS, name)) continue;
		const entry = Array.isArray(value) ? { ways: value } : object_or_empty(value);
		const ways = keep(entry.ways, PAGE_RULES_MAX_WAYS, is_safe_selector);
		if (ways.length) parts[name] = { ways, replace: entry.replace === true };
	}

	const actions = {};
	for (const [name, value] of Object.entries(object_or_empty(raw.actions))) {
		if (!Object.hasOwn(MENU_ACTIONS, name)) continue;
		const entry = object_or_empty(value);
		const icons = keep(entry.icons, PAGE_RULES_MAX_WAYS, is_safe_icon);
		const labels = keep(entry.labels, PAGE_RULES_MAX_LABELS, is_safe_label, (label) => label.trim().toLowerCase());
		if (icons.length || labels.length) actions[name] = { icons, labels };
	}

	return { version: raw.version.trim(), parts, actions, skipped };
}

// Rules are data, never code. A way must be a plain selector, with nothing that could reach past it (braces,
// semicolons, at-rules, escapes, comments, markup).
function is_safe_selector(selector) {
	return (
		typeof selector === "string" &&
		selector.trim().length > 0 &&
		selector.length <= 300 &&
		!/[{};@\\<\u0000-\u001f]|\/\*|\*\//.test(selector)
	);
}

// An icon is the d attribute of an SVG path: letters, numbers and separators only, so it's safe inside quotes.
function is_safe_icon(d) {
	return typeof d === "string" && d.length > 0 && d.length <= 6000 && /^[MmZzLlHhVvCcSsQqTtAaEe0-9.,\s+-]+$/.test(d);
}

// A label is plain text, compared with the start of a menu item's text.
function is_safe_label(label) {
	return typeof label === "string" && label.trim().length > 0 && label.length <= 60 && !/[\u0000-\u001f]/.test(label);
}

// Compares "1.0.10" with "1.1": negative, zero or positive.
function compare_versions(a, b) {
	const left = String(a).split(".").map((n) => parseInt(n, 10) || 0);
	const right = String(b).split(".").map((n) => parseInt(n, 10) || 0);
	for (let i = 0; i < Math.max(left.length, right.length); i++) {
		const difference = (left[i] ?? 0) - (right[i] ?? 0);
		if (difference) return difference;
	}
	return 0;
}
