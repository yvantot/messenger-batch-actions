// Messenger and Facebook share the same chat list UI. Their class names change
// often, so parts are found by role and aria attributes first, then by icon,
// then by English text. Each step has a fallback so one change doesn't break all.

let running = false;

chrome.runtime.onMessage.addListener((receive, _, send) => {
	const { message } = receive;
	switch (message) {
		case "scrap_chats": {
			send({ chats_info: get_chats_info() });
			break;
		}
		case "selected_chats": {
			if (running) {
				send({ status: 0 });
				break;
			}
			running = true;
			perform_action(receive)
				.then((ok) => send({ status: ok ? 1 : 0 }))
				.catch((error) => {
					console.warn("Messenger Batch Actions:", error);
					send({ status: 0 });
				})
				.finally(() => {
					running = false;
					document.getElementById("hide-context-menu")?.remove();
				});
			return true;
		}
	}
});

const SELECTORS = {
	CHATS_GRID: "div[role='grid']",
	CHATS_CONTAINER_OLD: "div[class='x1n2onr6']",
	ROW: "div[role='row']",
	CHAT_LINK: "a[href*='/t/']",
	MENU_BUTTON: "[aria-haspopup='menu']",
	MENU: "div[role='menu']",
	MENU_ITEM: "div[role='menuitem']",
	MENU_LAYER_OLD: 'div[class="xu96u03 xm80bdy x10l6tqk x13vifvy"]',
	DIALOG: "div[role='dialog']",
	BUTTON: "div[role='button']",
	RADIO: "input[type='radio']",
};

// Icon paths of each menu item. The first is what both sites use now (2026),
// the rest are older Messenger icons kept in case they come back.
const MENU_ICONS = {
	CONTEXT: [
		"M458 408a2 2 0 1 1-4 0 2 2 0 0 1 4 0m6 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0m-12 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0",
		"M12.5 18A2.25 2.25 0 1 1 8 18a2.25 2.25 0 0 1 4.5 0zM20.25 18a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0zM25.75 20.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5z",
	],
	ARCHIVE: [
		"M12.78 7.22a.75.75 0 0 1 0 1.06L11.06 10l1.72 1.72a.75.75 0 1 1-1.06 1.06L10 11.06l-1.72 1.72a.75.75 0 0 1-1.06-1.06L8.94 10 7.22 8.28a.75.75 0 0 1 1.06-1.06L10 8.94l1.72-1.72a.75.75 0 0 1 1.06 0z",
		"M9 13.5a.5.5 0 01.5-.5h17a.5.5 0 01.5.5v12a3 3 0 01-3 3H12a3 3 0 01-3-3v-12zm4.5 3.25c0-.69.56-1.25 1.25-1.25h6.5a1.25 1.25 0 110 2.5h-6.5c-.69 0-1.25-.56-1.25-1.25z",
	],
	UNARCHIVE: [
		"M9.694 19h.612c1.838 0 3.294 0 4.433-.153 1.172-.158 2.121-.49 2.87-1.238.748-.749 1.08-1.698 1.238-2.87.153-1.14.153-2.595.153-4.433v-.612c0-1.838 0-3.294-.153-4.433-.158-1.172-.49-2.121-1.238-2.87-.749-.748-1.698-1.08-2.87-1.238C13.599 1 12.144 1 10.306 1h-.612C7.856 1 6.4 1 5.26 1.153c-1.172.158-2.121.49-2.87 1.238-.748.749-1.08 1.698-1.238 2.87C1 6.401 1 7.856 1 9.694v.612c0 1.838 0 3.294.153 4.433.158 1.172.49 2.121 1.238 2.87.749.748 1.698 1.08 2.87 1.238C6.401 19 7.856 19 9.694 19zm6.854-2.452c-.423.423-1.003.677-2.009.812-1.027.138-2.382.14-4.289.14h-.5c-1.907 0-3.261-.002-4.29-.14-1.005-.135-1.585-.389-2.008-.812-.423-.423-.677-1.003-.812-2.009-.077-.567-.111-1.234-.127-2.039H5.75c.057 0 .13.021.215.1.09.082.174.21.222.361a4.001 4.001 0 0 0 7.626 0 .844.844 0 0 1 .222-.362c.085-.078.158-.099.215-.099h3.237c-.016.805-.05 1.472-.127 2.04-.135 1.005-.389 1.585-.812 2.008zM17.5 11h-3.25c-1.002 0-1.644.805-1.867 1.508a2.501 2.501 0 0 1-4.766 0C7.394 11.805 6.752 11 5.75 11H2.5V9.75c0-1.907.002-3.261.14-4.29.135-1.005.389-1.585.812-2.008.423-.423 1.003-.677 2.009-.812 1.028-.138 2.382-.14 4.289-.14h.5c1.907 0 3.261.002 4.29.14 1.005.135 1.585.389 2.008.812.423.423.677 1.003.812 2.009.138 1.028.14 2.382.14 4.289V11z",
		"M9.5 13a.5.5 0 00-.5.5v12a3 3 0 003 3h12a3 3 0 003-3v-12a.5.5 0 00-.5-.5h-17zm12.118 7.467a.833.833 0 01-.703 1.28H19.25a.25.25 0 00-.25.25v3.253a.75.75 0 01-.75.75h-.5a.75.75 0 01-.75-.75v-3.252a.25.25 0 00-.25-.25h-1.665a.833.833 0 01-.703-1.28l2.915-4.582a.833.833 0 011.406 0l2.915 4.581z",
	],
	DELETE: [
		"m106.523 196.712-2.32-2.256a1.62 1.62 0 0 0-1.13-.456h-3.146a1.62 1.62 0 0 0-1.13.456l-2.32 2.256a.75.75 0 0 0 1.046 1.076l2.32-2.256a.12.12 0 0 1 .084-.032h3.146a.12.12 0 0 1 .084.032l2.32 2.256a.75.75 0 1 0 1.046-1.076zm-5.773 5.788v8a.75.75 0 1 0 1.5 0v-8a.75.75 0 1 0-1.5 0zm3.501-.047-.5 8a.75.75 0 1 0 1.498.094l.5-8a.75.75 0 1 0-1.498-.094zm-7 .094.5 8a.75.75 0 1 0 1.498-.094l-.5-8a.75.75 0 1 0-1.498.094z",
		"M20.882 7c.685 0 1.312.387 1.618 1 .306.613.933 1 1.618 1H27a1 1 0 0 1 1 1v.5a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V10a1 1 0 0 1 1-1h2.882c.685 0 1.312-.387 1.618-1 .306-.613.933-1 1.618-1h5.764zM10.601 13.5a1 1 0 0 0-.995 1.096l1.132 11.693A3 3 0 0 0 13.724 29h8.552a3 3 0 0 0 2.986-2.711l1.132-11.693a1 1 0 0 0-.995-1.096H10.6z",
	],
	LEAVE: [
		"M102.25 217h7.5a.75.75 0 1 0 0-1.5h-7.5a.75.75 0 1 0 0 1.5z",
		"M21.498 14.75a1 1 0 0 0 1-1V12a4 4 0 0 0-4-4h-6.5a4 4 0 0 0-4 4v12a4 4 0 0 0 4 4h6.5a4 4 0 0 0 4-4v-1.75a1 1 0 0 0-1-1h-.5a1 1 0 0 0-1 1V24a1.5 1.5 0 0 1-1.5 1.5h-6.5a1.5 1.5 0 0 1-1.5-1.5V12a1.5 1.5 0 0 1 1.5-1.5h6.5a1.5 1.5 0 0 1 1.5 1.5v1.75a1 1 0 0 0 1 1h.5z",
	],
	MUTE: [
		"M109.362 211c1.087 0 1.863-.446 2.294-1.184.256-.437.341-.862.344-1.185.01-1.03-.375-1.781-1.27-2.893l-.66-.813a3.495 3.495 0 0 1-.12-.165l-.045-.064c-.214-.31-.32-.549-.339-.75l-.075-1.538A6.489 6.489 0 0 0 103 196.5c-3.38 0-6.187 2.544-6.49 5.877l-.072 1.467c-.001.226-.086.456-.276.751l-.165.241-.11.144-.499.611c-.98 1.194-1.399 1.964-1.388 3.041.003.322.088.747.344 1.184.431.738 1.207 1.184 2.294 1.184h12.724zm0-1.5H96.638c-.553 0-.837-.163-1-.441a1.009 1.009 0 0 1-.138-.44c-.006-.615.28-1.14 1.048-2.076l.396-.483c.153-.19.276-.353.386-.513.394-.572.607-1.094.607-1.666l.07-1.4c.23-2.526 2.387-4.481 4.993-4.481 2.606 0 4.764 1.955 4.995 4.512l.069 1.406c-.001.535.211 1.057.606 1.63.088.127.184.256.297.4l.231.287.254.308.197.245c.62.787.857 1.272.851 1.83 0 .085-.038.268-.139.44-.162.279-.446.442-.999.442z",
		"M18 7a6.569 6.569 0 0 1 6.467 5.414l1.367 7.658a3 3 0 0 0 .832 1.594l.92.92a1.414 1.414 0 0 1-1 2.414H9.414a1.414 1.414 0 0 1-1-2.414l.92-.92a3 3 0 0 0 .832-1.594l1.367-7.658A6.569 6.569 0 0 1 18 7zM15.5 27c-.276 0-.504.226-.459.498a3 3 0 0 0 5.918 0c.045-.273-.183-.498-.459-.498h-5z",
	],
	// Unmute has no SVG, Messenger draws it from an image sprite
	UNMUTE: [],
	BLOCK: [
		"M9.248 1a4.248 4.248 0 1 0 0 8.497 4.248 4.248 0 0 0 0-8.497zM6.5 5.248a2.748 2.748 0 1 1 5.496 0 2.748 2.748 0 0 1-5.496 0zM6.914 11A5.414 5.414 0 0 0 1.5 16.414a3.082 3.082 0 0 0 3.082 3.082h6.082a.75.75 0 0 0 0-1.5H4.582A1.582 1.582 0 0 1 3 16.415 3.914 3.914 0 0 1 6.914 12.5h4.672a.75.75 0 0 0 0-1.5H6.914zM16 12.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7zm.781 1.658a2 2 0 0 0-2.623 2.623l2.623-2.623zm-1.562 3.683a2 2 0 0 0 2.623-2.623l-2.623 2.623z",
		"M18 29c6.075 0 11-4.925 11-11S24.075 7 18 7 7 11.925 7 18s4.925 11 11 11zm-7-12.5a1 1 0 00-1 1v1a1 1 0 001 1h14a1 1 0 001-1v-1a1 1 0 00-1-1H11z",
	],
};

// Last resort when the icons change: the English menu labels
const MENU_TEXT = {
	ARCHIVE: /^archive/i,
	UNARCHIVE: /^unarchive/i,
	DELETE: /^delete/i,
	LEAVE: /^leave/i,
	MUTE: /^mute/i,
	UNMUTE: /^unmute/i,
	BLOCK: /^block/i,
};

function get_chats_container() {
	const grid = Array.from(document.querySelectorAll(SELECTORS.CHATS_GRID)).find(
		(g) => g.querySelector(SELECTORS.CHAT_LINK),
	);
	return grid ?? document.querySelector(SELECTORS.CHATS_CONTAINER_OLD);
}

function get_chat_links(container) {
	const rows = container.querySelectorAll(SELECTORS.ROW);
	const links = rows.length
		? Array.from(rows).map((row) => row.querySelector(SELECTORS.CHAT_LINK))
		: Array.from(container.querySelectorAll(SELECTORS.CHAT_LINK));
	// The same chat can show up twice while Messenger re-renders the list
	const seen = new Set();
	return links.filter((a) => {
		if (!a || seen.has(a.getAttribute("href"))) return false;
		seen.add(a.getAttribute("href"));
		return true;
	});
}

function get_chats_source() {
	if (location.href.includes("archived")) return "Archived";
	else if (location.href.includes("requests")) return "Requests";
	else if (location.href.includes("marketplace")) return "Marketplace";
	else if (location.href.includes("/c/")) return "Communites";
	else return "Chats List";
}

function get_chats_info() {
	try {
		const container = get_chats_container();
		if (!container) return null;
		const chats = get_chat_links(container);
		if (!chats.length) return null; // 0 chats or wrong selector

		return {
			source: get_chats_source(),
			info: chats.map((chat) => {
				const chat_link = chat?.href ?? "#";
				const chat_img = chat.querySelector("img")?.src ?? "";
				const chat_name = chat.querySelector("span")?.textContent ?? "ERROR";
				return { chat_link, chat_img, chat_name };
			}),
		};
	} catch (error) {
		console.warn("Messenger is loading the elements: ", error);
		return null;
	}
}

function find_menu_button(row) {
	const by_aria = row.querySelector(SELECTORS.MENU_BUTTON);
	if (by_aria) return by_aria;
	const path = row.querySelector(icon_query(MENU_ICONS.CONTEXT));
	return path?.closest(SELECTORS.BUTTON) ?? null;
}

function icon_query(paths) {
	return paths.map((d) => `path[d="${d}"]`).join(", ");
}

function find_menu_item(menu, action) {
	const items = Array.from(menu.querySelectorAll(SELECTORS.MENU_ITEM));
	const paths = MENU_ICONS[action];
	if (paths.length) {
		const query = icon_query(paths);
		const by_icon = items.find((item) => item.querySelector(query));
		if (by_icon) return by_icon;
	} else if (action === "UNMUTE") {
		const by_sprite = items.find(
			(item) => item.querySelector("i") && !item.querySelector("svg"),
		);
		if (by_sprite) return by_sprite;
	}
	return items.find((item) => MENU_TEXT[action].test(item.textContent.trim()));
}

// Messenger renders each dialog button twice, one copy hidden and disabled.
// The visible ones are [close, ...options or cancel, confirm], confirm last.
function visible_buttons(dialog) {
	return Array.from(dialog.querySelectorAll(SELECTORS.BUTTON)).filter(
		(btn) =>
			btn.getAttribute("aria-disabled") !== "true" &&
			getComputedStyle(btn).visibility !== "hidden",
	);
}

function confirm_button(dialog) {
	return visible_buttons(dialog).at(-1);
}

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function wait_for(get, timeout = 5000) {
	const start = Date.now();
	while (Date.now() - start < timeout) {
		const value = get();
		if (value && (!Array.isArray(value) || value.length)) return value;
		await sleep(100);
	}
	return null;
}

function get_dialogs() {
	return Array.from(document.querySelectorAll(SELECTORS.DIALOG));
}

async function perform_action(receive) {
	const { chats_link } = receive;
	const action = receive.action.toUpperCase();

	const container = get_chats_container();
	if (!container) return false;

	const rows = get_chat_links(container)
		.filter((a) => chats_link.some((link) => a.getAttribute("href").includes(link)))
		.map((a) => a.closest(SELECTORS.ROW) ?? a.parentElement);
	if (!rows.length) return false;

	// Hide the menus and dialogs so the clicks happen out of sight
	document.getElementById("hide-context-menu")?.remove();
	const hide_context = create_element(
		"style",
		{ id: "hide-context-menu" },
		`${SELECTORS.DIALOG}, ${SELECTORS.MENU}, ${SELECTORS.MENU_LAYER_OLD} { display: none !important; }`,
	);
	document.head.appendChild(hide_context);

	const dialogs_before = new Set(get_dialogs());

	rows.forEach((row) => {
		const button = find_menu_button(row);
		if (button && button.getAttribute("aria-expanded") !== "true") button.click();
	});

	const menus = await wait_for(() =>
		Array.from(document.querySelectorAll(SELECTORS.MENU)),
	);
	if (!menus) return false;
	await sleep(300); // Let the rest of the menus open

	let clicked = 0;
	document.querySelectorAll(SELECTORS.MENU).forEach((menu) => {
		const item = find_menu_item(menu, action);
		if (item) {
			item.click();
			clicked++;
		}
	});
	if (!clicked) return false;

	const new_dialogs = () => get_dialogs().filter((d) => !dialogs_before.has(d));

	switch (action) {
		// Unmute, Unarchive, Archive do not require confirmation
		case "ARCHIVE":
		case "UNARCHIVE":
		case "UNMUTE":
			return true;
		// Delete, Leave require confirmation
		case "DELETE":
		case "LEAVE": {
			const dialogs = await wait_for(new_dialogs);
			if (!dialogs) return false;
			await sleep(300);
			new_dialogs().forEach((dialog) => confirm_button(dialog)?.click());
			return true;
		}
		// Block asks for the type of block, then confirmation
		case "BLOCK": {
			const { block_type } = receive;
			const dialogs = await wait_for(new_dialogs);
			if (!dialogs) return false;
			await sleep(300);
			const choice_dialogs = new_dialogs();
			choice_dialogs.forEach((dialog) => {
				// First visible button is the close button
				visible_buttons(dialog)[block_type + 1]?.click();
			});
			const confirms = await wait_for(() =>
				new_dialogs().filter((d) => !choice_dialogs.includes(d)),
			);
			if (!confirms) return false;
			await sleep(300);
			confirms.forEach((dialog) => confirm_button(dialog)?.click());
			await sleep(1000);
			// The choice dialog stays open after blocking, close it
			choice_dialogs.forEach((dialog) => {
				if (dialog.isConnected) visible_buttons(dialog)[0]?.click();
			});
			return true;
		}
		// Mute asks for the type (on some chats), then for how long
		case "MUTE": {
			const { mute_type, mute_time } = receive.mute_config;
			const dialogs = await wait_for(new_dialogs);
			if (!dialogs) return false;
			await sleep(300);
			for (const dialog of new_dialogs()) {
				let radios = dialog.querySelectorAll(SELECTORS.RADIO);
				if (radios.length === 3) {
					radios[mute_type].click();
					confirm_button(dialog)?.click();
					radios = await wait_for(() => {
						const r = dialog.querySelectorAll(SELECTORS.RADIO);
						return r.length >= 8 ? r : null;
					});
					if (!radios) return false;
					await sleep(200);
				}
				// The duration choices are always the last five
				radios[radios.length - 5 + mute_time].click();
				confirm_button(dialog)?.click();
			}
			return true;
		}
	}
	return false;
}

function create_element(name, attr = {}, inner) {
	const element = document.createElement(name);
	element.innerHTML = inner.trim();
	const keys = Object.keys(attr);
	if (keys.length) {
		for (const key of keys) {
			if (key === "dataset") {
				if (typeof attr.dataset !== "object")
					throw new Error("dataset must be an object");
				const dataset_keys = Object.keys(attr.dataset);
				if (!dataset_keys.length) throw new Error("dataset must not be empty");
				for (const dataset_key of dataset_keys) {
					element.dataset[dataset_key] = attr.dataset[dataset_key];
				}
			}
			if (key in element) {
				element[key] = attr[key];
			} else {
				element.setAttribute(key, attr[key]);
			}
		}
	}
	return element;
}
