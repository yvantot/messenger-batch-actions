// Layout rules: checking a rules file (js/shared/page-parts.js) and the rules file published in rules/.
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(ROOT, file), "utf8");

// js/shared/page-parts.js in a world of its own, as the background loads it.
function sharedWorld() {
	const world = vm.createContext({});
	vm.runInContext(read("js/shared/page-parts.js"), world);
	return (code) => vm.runInContext(code, world);
}

module.exports = async (check) => {
	const run = sharedWorld();
	const clean = (raw, version = "1.1.0") =>
		run(`(() => { try { return clean_page_rules(${JSON.stringify(raw)}, ${JSON.stringify(version)}); } catch (e) { return { error: e.message }; } })()`);
	const icon = run("MENU_ACTIONS.archive.icons[0]");

	// ---------- the published file ----------
	const published = JSON.parse(read("rules/page-rules.json"));
	const result = clean(published);
	check("published rules file: accepted, nothing skipped", !result.error && result.skipped === 0, JSON.stringify(result));
	check(
		"published rules file: names only parts and actions that exist",
		Object.keys(published.parts ?? {}).every((name) => run(`Object.hasOwn(PAGE_PARTS, ${JSON.stringify(name)})`)) &&
			Object.keys(published.actions ?? {}).every((name) => run(`Object.hasOwn(MENU_ACTIONS, ${JSON.stringify(name)})`)),
	);
	check("published rules file: small enough", read("rules/page-rules.json").length < run("PAGE_RULES_MAX_LENGTH"));
	check(
		"rules are downloaded from this repo's main branch",
		run("PAGE_RULES_URL") === "https://raw.githubusercontent.com/yvantot/messenger-batch-actions/main/rules/page-rules.json",
	);

	// ---------- parts ----------
	const good = clean({
		format: 1,
		version: " v1 ",
		parts: { chat_row: ["a.b"], menu: { ways: ["c"], replace: true }, part_of_a_newer_version: ["d"] },
	});
	check(
		"a list goes in front, { ways, replace } replaces, unknown parts skipped",
		JSON.stringify(good.parts) === JSON.stringify({ chat_row: { ways: ["a.b"], replace: false }, menu: { ways: ["c"], replace: true } }) &&
			good.version === "v1" &&
			good.skipped === 0,
		JSON.stringify(good),
	);
	const unsafe = ["a { color: red", "a}b", "a;b", "@import x", "a\\62", "a /* x */", "a<b", "x".repeat(301), 5, "", "   ", "a\nb"];
	const caught = unsafe.filter((way) => {
		const cleaned = clean({ format: 1, version: "v", parts: { chat_row: [way, "div[data-x='1']"] } });
		return cleaned.skipped === 1 && cleaned.parts.chat_row.ways.join() === "div[data-x='1']";
	});
	check("anything that could reach past a selector is skipped and counted", caught.length === unsafe.length, `${caught.length}/${unsafe.length}`);
	check(
		"at most 8 ways per part",
		clean({ format: 1, version: "v", parts: { chat_row: Array.from({ length: 10 }, (_, i) => `div.w${i}`) } }).parts.chat_row.ways.length === 8,
	);

	// ---------- actions ----------
	const actions = clean({
		format: 1,
		version: "v",
		actions: {
			archive: { icons: [icon, "M1 1\"] , a[x"], labels: [" Archivar ", "x".repeat(61), 3] },
			unmute: { labels: ["Activar sonido"] },
			action_of_a_newer_version: { labels: ["x"] },
		},
	});
	check(
		"icons and labels are kept when safe, labels in lower case",
		JSON.stringify(actions.actions) ===
			JSON.stringify({ archive: { icons: [icon], labels: ["archivar"] }, unmute: { icons: [], labels: ["activar sonido"] } }) &&
			actions.skipped === 3,
		JSON.stringify(actions),
	);
	check("every built-in icon is a safe icon", run("Object.values(MENU_ACTIONS).every((a) => a.icons.every(is_safe_icon))"));
	check("every built-in way is a safe selector", run("Object.values(PAGE_PARTS).every((p) => p.ways.every(is_safe_selector))"));

	// ---------- whole file ----------
	const errorOf = (raw, version) => clean(raw, version).error ?? "";
	check("not a rules file", /isn't a rules file/.test(errorOf([])) && /isn't a rules file/.test(errorOf("x")));
	check("unknown format", /format this version doesn't know/.test(errorOf({ format: 2, version: "v", parts: {} })));
	check("no version", /no version/.test(errorOf({ format: 1, parts: {} })) && /no version/.test(errorOf({ format: 1, version: "v".repeat(41) })));
	check("for newer versions only", errorOf({ format: 1, version: "v", minVersion: "1.2.0" }) === "The rules are for version 1.2.0 and newer.");
	check("for older versions only", errorOf({ format: 1, version: "v", maxVersion: "1.0" }) === "The rules are for version 1.0 and older.");
	check("for this version", !errorOf({ format: 1, version: "v", minVersion: "1.1.0", maxVersion: "1.1" }));
	check("versions compared by number", run(`compare_versions("1.0.10", "1.1") < 0 && compare_versions("1.1", "1.1.0") === 0 && compare_versions("1.2", "1.1.9") > 0`));
	check(
		"statuses in words",
		run(`["main", "backup 1", "rule 2", "missing", "unchecked"].map(describe_status).join(" | ")`) ===
			"found by its main way | found by backup way 1 | found by GitHub rule 2 | not found | not needed yet on this page",
	);
};
