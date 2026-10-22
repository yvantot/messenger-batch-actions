// The ways to find each part of the page in use now (see shared/page-parts.js): ways from the GitHub rules first,
// then the built-in ones. A way this browser can't read is left out and logged.
const Parts = {
	// part name -> [{ selector, source: "rule" | "built-in", index }]
	ways: {},
	// action name -> { icons, labels }, rules first
	actions: {},
	// part name -> status of the last lookup (see describe_status), for the report
	status: {},
	rules_version: null,

	// Starts using `rules` ({ version, parts, actions } as the background saved them), or only the built-in ways
	// for null.
	use(rules) {
		const version = rules?.version ?? null;
		const changed = version !== Parts.rules_version;
		Parts.rules_version = version;
		for (const [name, part] of Object.entries(PAGE_PARTS)) {
			const extra = rules?.parts?.[name];
			const from_rules = (extra?.ways ?? [])
				.map((selector, index) => ({ selector, source: "rule", index }))
				.filter((way) => {
					if (is_safe_selector(way.selector) && can_parse(way.selector)) return true;
					if (changed) log_event("rules", `GitHub rule ${way.index + 1} for ${part.label} left out: this browser can't read it`);
					return false;
				});
			const built_in = part.ways.map((selector, index) => ({ selector, source: "built-in", index }));
			Parts.ways[name] = extra?.replace && from_rules.length ? from_rules : [...from_rules, ...built_in];
			Parts.status[name] ??= "unchecked";
		}
		for (const [name, action] of Object.entries(MENU_ACTIONS)) {
			const extra = rules?.actions?.[name];
			Parts.actions[name] = {
				icons: [...(extra?.icons ?? []).filter(is_safe_icon), ...action.icons],
				labels: [...(extra?.labels ?? []).filter(is_safe_label), ...action.labels],
			};
		}
		if (changed) log_event("rules", version ? `Using layout rules ${version} from GitHub` : "Using the built-in layout rules");
	},

	// The part's elements in `root`, found by the first of its ways that finds any.
	all(name, root = document) {
		for (const way of Parts.ways[name]) {
			const elements = [...root.querySelectorAll(way.selector)];
			if (elements.length) {
				Parts.note(name, way);
				return elements;
			}
		}
		return [];
	},

	first(name, root = document) {
		for (const way of Parts.ways[name]) {
			const element = root.querySelector(way.selector);
			if (element) {
				Parts.note(name, way);
				return element;
			}
		}
		return null;
	},

	// `element` or its closest ancestor that is the part, by any of its ways.
	closest(element, name) {
		return element.closest(Parts.ways[name].map((way) => way.selector).join(", "));
	},

	// One selector that matches the part by any of its ways, for stylesheets.
	css(name) {
		return `:is(${Parts.ways[name].map((way) => way.selector).join(", ")})`;
	},

	// Records that a needed part wasn't found, for the report.
	missing(name) {
		if (Parts.status[name] !== "missing") log_event("part", `${PAGE_PARTS[name].label}: not found`);
		Parts.status[name] = "missing";
	},

	note(name, way) {
		const status = way.source === "rule" ? `rule ${way.index + 1}` : way.index === 0 ? "main" : `backup ${way.index}`;
		if (status !== Parts.status[name] && status !== "main") {
			log_event("part", `${PAGE_PARTS[name].label}: ${describe_status(status)}`);
		}
		Parts.status[name] = status;
	},

	// The item in `menu` for `action` (a MENU_ACTIONS name): by icon, then by the start of its label.
	menu_item(menu, action) {
		const items = Parts.all("menu_item", menu);
		const { icons, labels } = Parts.actions[action];
		if (icons.length) {
			const query = icons.map((d) => `path[d="${d}"]`).join(", ");
			const by_icon = items.find((item) => item.querySelector(query));
			if (by_icon) return by_icon;
		}
		const by_label = items.find((item) => {
			const text = item.textContent.trim().toLowerCase();
			return labels.some((label) => text.startsWith(label));
		});
		if (by_label) {
			if (icons.length) log_event("part", `${MENU_ACTIONS[action].label} menu item: found by its label, not its icon`);
			return by_label;
		}
		if (action === "unmute") return items.find((item) => item.querySelector("i") && !item.querySelector("svg"));
		return null;
	},
};

function can_parse(selector) {
	try {
		document.documentElement.matches(selector);
		return true;
	} catch {
		return false;
	}
}
