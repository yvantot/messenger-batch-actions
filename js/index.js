// Where people send reports and bug reports, and where they can leave a review.
const CONTACT_EMAIL = "yvantot.code@gmail.com";
const STORE_URL = "https://chromewebstore.google.com/detail/fhedcmcogemcndkjkoaojkdggfmpbmkk";

const POPUP_ICONS = {
	info: '<svg viewBox="0 -960 960 960"><path d="M440-280h80v-240h-80v240Zm40-320q17 0 28.5-11.5T520-640q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640q0 17 11.5 28.5T480-600Zm0 520q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>',
	bug: '<svg viewBox="0 -960 960 960"><path d="M480-200q66 0 113-47t47-113v-160q0-66-47-113t-113-47q-66 0-113 47t-47 113v160q0 66 47 113t113 47Zm-80-120h160v-80H400v80Zm0-160h160v-80H400v80Zm80 40Zm0 320q-65 0-120.5-32T272-240H160v-80h84q-3-20-3.5-40t-.5-40h-80v-80h80q0-20 .5-40t3.5-40h-84v-80h112q14-23 31.5-43t40.5-35l-64-66 56-56 86 86q28-9 57-9t57 9l88-86 56 56-66 66q23 15 41.5 34.5T688-640h112v80h-84q3 20 3.5 40t.5 40h80v80h-80q0 20-.5 40t-3.5 40h84v80H688q-32 56-87.5 88T480-120Z"/></svg>',
	star: '<svg viewBox="0 -960 960 960"><path d="m354-287 126-76 126 77-33-144 111-96-146-13-58-136-58 135-146 13 111 97-33 143ZM233-120l65-281L80-590l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Zm247-350Z"/></svg>',
};

const POPUPS = {
	no_chat_selected: () =>
		show_popup({
			title: "No chat selected",
			description: "<p>Pick chats in the list first, then the action.</p>",
			action: "OK",
		}),
	busy: () =>
		show_popup({
			title: "Still working",
			description: "<p>Wait for the current action to finish, or stop it first.</p>",
			action: "OK",
		}),
	no_more: () =>
		show_popup({
			title: "No more chats",
			description: "<p>Messenger has no more chats to load in this list.</p>",
			action: "OK",
		}),
	report_copied: () =>
		show_popup({
			title: "Report copied",
			description: `<p>Paste it in an email to <a href="mailto:${CONTACT_EMAIL}" target="_blank">${CONTACT_EMAIL}</a> and say what went wrong. It has no chat names in it.</p>`,
			action: "Close",
		}),
	report_failed: () =>
		show_popup({
			title: "Couldn't copy",
			description: "<p>Your browser didn't allow copying. Try again.</p>",
			action: "Close",
		}),
	fixes_checked: (result) =>
		show_popup({
			title: result?.ok ? "Layout fixes are up to date" : "Couldn't check",
			description: result?.ok
				? `<p>Using layout rules ${escape_html(result.version)} from GitHub.${result.changed ? " They're new, and in use now." : ""}</p>`
				: `<p>${escape_html(result?.error ?? "Something went wrong.")} The built-in layout is still used.</p>`,
			action: "Close",
		}),
	help: () =>
		show_popup({
			exitable: true,
			title: "Help & About",
			icon: POPUP_ICONS.info,
			action: "Close",
			description: `
				<h3>What is this for?</h3>
				<p>Archive, unarchive, mute, unmute, delete, leave or block many Messenger chats in a few clicks, on messenger.com or facebook.com/messages.</p>
				<h3>How do I use it?</h3>
				<p>Open Messenger, open this, pick the chats, then pick the action. Need older chats? Use Load more chats at the bottom of the list.</p>
				<h3>Safe mode or Fast mode?</h3>
				<p>Safe mode does one chat at a time and checks each one. Fast mode does them all at once: quicker, but Messenger can miss some. Either keeps going if you close this.</p>
				<h3>Is my data safe?</h3>
				<p>Yes. Nothing about you or your chats leaves your device. The only thing it downloads is a small file of page rules from GitHub, so it keeps working when Messenger changes its page.</p>
				<h3>Something doesn't work</h3>
				<p>Reload Messenger and try again. If it still doesn't, use Report issues: it can check for fixes, and copy a report for your email.</p>
				<h3>Does it slow Messenger down?</h3>
				<p>No. It only does something while this is open or an action is running.</p>`,
		}),
	issues: () =>
		show_popup(
			{
				exitable: true,
				title: "Report issues",
				icon: POPUP_ICONS.bug,
				description: `<p>Messenger changes its page often. Check for fixes first. If it still doesn't work, copy a report and send it to <a href="mailto:${CONTACT_EMAIL}" target="_blank">${CONTACT_EMAIL}</a>. Thank you!</p>`,
				choices: ["Check for fixes", "Copy a report"],
				action: "Go",
			},
			(choice) => (choice === 0 ? check_for_fixes() : copy_report()),
		),
	review: () =>
		show_popup({
			exitable: true,
			title: "Is this useful to you?",
			icon: POPUP_ICONS.star,
			description: `<p>A review on the <a href="${STORE_URL}" target="_blank">Chrome Web Store</a> helps others find it. Found a bug? Report issues has a button for that.</p>`,
			action: "Close",
		}),
};

// Pages the content script runs on (see the manifest)
const MESSENGER_PAGE = /^https:\/\/www\.(messenger\.com\/|facebook\.com\/messages)/;

const ICONS = {
	block: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#CCCCCC"><path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q54 0 104-17.5t92-50.5L228-676q-33 42-50.5 92T160-480q0 134 93 227t227 93Zm252-124q33-42 50.5-92T800-480q0-134-93-227t-227-93q-54 0-104 17.5T284-732l448 448Z"/></svg>',
	mute: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#CCCCCC"><path d="M160-200v-80h80v-280q0-33 8.5-65t25.5-61l60 60q-7 16-10.5 32.5T320-560v280h248L56-792l56-56 736 736-56 56-146-144H160Zm560-154-80-80v-126q0-66-47-113t-113-47q-26 0-50 8t-44 24l-58-58q20-16 43-28t49-18v-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v28q80 20 130 84.5T720-560v206Zm-276-50Zm36 324q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80Zm33-481Z"/></svg>',
};

// What the popup knows. The chats and the job come from the content script, over the port.
const state = {
	tab: null,
	port: null,
	chats: [],
	source: "",
	// Links of the selected chats
	selected: new Set(),
	// null, "ascending" or "descending"
	sort: null,
	search: "",
	job: null,
	job_dismissed: false,
	// "safe" (one chat at a time) or "fast" (all at once), saved as mode
	mode: "safe",
	// Resolves the pending report request
	report_waiting: null,
};

function get_popup_elements() {
	return {
		SEARCH_INPUT: document.getElementById("search-chats"),
		HELP: document.getElementById("help"),
		ISSUES: document.getElementById("issues"),
		CHAT_SOURCE: document.getElementById("chat-source"),
		CHATS_LIST: document.querySelector("section.chats-list"),
		CHATS_ACTIONS: document.getElementById("chats-actions"),
		CHATS_ACTIONS_ADDITIONAL: document.getElementById("chats-actions-additional"),
		JOB: document.getElementById("job"),
		JOB_TEXT: document.getElementById("job-text"),
		JOB_BAR: document.getElementById("job-bar-fill"),
		JOB_PROBLEMS: document.getElementById("job-problems"),
		JOB_STOP: document.getElementById("job-stop"),
		JOB_CLOSE: document.getElementById("job-close"),
		MODE: document.getElementById("mode"),
		LOAD_MORE: document.querySelector("button.load-more"),
	};
}

function escape_html(text) {
	return String(text).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

// ---------- connecting to Messenger ----------

async function connect() {
	const { CHAT_SOURCE } = get_popup_elements();
	const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
	state.tab = tab;
	if (!tab || !MESSENGER_PAGE.test(tab.url ?? "")) {
		CHAT_SOURCE.classList.add("long");
		CHAT_SOURCE.innerHTML =
			"Open <a target='_blank' href='https://www.messenger.com/'>Messenger</a> or <a target='_blank' href='https://www.facebook.com/messages/'>Facebook Messages</a>, then open this again";
		return;
	}
	chrome.runtime.sendMessage({ message: "rules_check" }).catch(() => {});

	let port = await open_port(tab.id);
	// Messenger was opened before the extension was installed or updated: add the content scripts now
	if (!port && (await inject_content_scripts(tab.id))) port = await open_port(tab.id);
	if (!port) {
		show_reload_needed();
		return;
	}
	state.port = port;
}

// Connects to the content script in the tab. Resolves with the port once it answers, or null.
function open_port(tab_id) {
	return new Promise((resolve) => {
		let settled = false;
		const port = chrome.tabs.connect(tab_id, { name: "batch-actions" });
		const settle = (value) => {
			if (settled) return;
			settled = true;
			clearTimeout(timer);
			resolve(value);
		};
		const timer = setTimeout(() => {
			settle(null);
			port.disconnect();
		}, 2000);
		port.onMessage.addListener((message) => {
			settle(port);
			on_port_message(message);
		});
		port.onDisconnect.addListener(() => {
			void chrome.runtime.lastError;
			settle(null);
			if (state.port === port) on_port_lost();
		});
	});
}

async function inject_content_scripts(tab_id) {
	try {
		const files = chrome.runtime.getManifest().content_scripts[0].js;
		await chrome.scripting.executeScript({ target: { tabId: tab_id }, files });
		return true;
	} catch (error) {
		console.warn("Couldn't add the content scripts:", error);
		return false;
	}
}

// Messenger reloaded or went to another site while the popup was open.
function on_port_lost() {
	state.port = null;
	const { CHATS_LIST } = get_popup_elements();
	CHATS_LIST.replaceChildren();
	setTimeout(async () => {
		state.port = await open_port(state.tab.id);
		if (!state.port) show_reload_needed();
	}, 1500);
}

function show_reload_needed() {
	const { CHAT_SOURCE } = get_popup_elements();
	CHAT_SOURCE.classList.add("long");
	CHAT_SOURCE.innerHTML = "Messenger needs a reload to work with this.<br/><a id='reload-messenger'>Reload Messenger</a>";
	document.getElementById("reload-messenger").addEventListener("click", async () => {
		CHAT_SOURCE.textContent = "Reloading...";
		await chrome.tabs.reload(state.tab.id);
		setTimeout(connect, 3000);
	});
}

function send(request) {
	if (!state.port) {
		show_reload_needed();
		return false;
	}
	state.port.postMessage(request);
	return true;
}

function on_port_message(message) {
	switch (message?.type) {
		case "chats": {
			state.chats = Array.isArray(message.chats) ? message.chats : [];
			state.source = message.chats ? message.source : null;
			// Chats that left the list (archived, deleted) aren't selected anymore
			const links = new Set(state.chats.map((chat) => chat.link));
			state.selected.forEach((link) => links.has(link) || state.selected.delete(link));
			render_chats();
			break;
		}
		case "job":
			if (message.job?.running) state.job_dismissed = false;
			state.job = message.job;
			render_job();
			break;
		case "refused":
			POPUPS.busy();
			break;
		case "load_more":
			get_popup_elements().LOAD_MORE.classList.remove("loading");
			if (!message.ok) POPUPS.no_more();
			break;
		case "report":
			state.report_waiting?.(message.report);
			break;
	}
}

// ---------- the chat list ----------

function render_chats() {
	const { CHATS_LIST } = get_popup_elements();
	const chats = [...state.chats];
	if (state.sort) {
		const direction = state.sort === "ascending" ? 1 : -1;
		chats.sort((a, b) => a.name.localeCompare(b.name) * direction);
	}
	const term = state.search.trim().toLowerCase();
	CHATS_LIST.replaceChildren(...chats.map((chat) => make_chat_el(chat, term)));
	render_source();
}

function make_chat_el(chat, term) {
	const element = document.createElement("div");
	element.className = "chat-container";
	element.dataset.link = chat.link;
	element.title = chat.name;
	if (state.selected.has(chat.link)) element.classList.add("chat-selected");
	if (term && !chat.name.toLowerCase().includes(term)) element.classList.add("no-display");
	// The chat's picture, or its first letter
	const avatar = document.createElement("span");
	avatar.className = "avatar";
	if (chat.img) {
		const img = document.createElement("img");
		img.src = chat.img;
		img.alt = "";
		img.loading = "lazy";
		avatar.append(img);
	} else avatar.textContent = [...chat.name.trim()][0]?.toUpperCase() ?? "?";
	const name = document.createElement("p");
	name.textContent = chat.name;
	const check = document.createElement("span");
	check.className = "check";
	check.innerHTML = '<svg viewBox="0 -960 960 960"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/></svg>';
	element.append(avatar, name, check);
	return element;
}

function render_source() {
	const { CHAT_SOURCE } = get_popup_elements();
	CHAT_SOURCE.classList.toggle("long", state.source === null);
	if (state.source === null) {
		CHAT_SOURCE.textContent = "Messenger's chat list isn't showing. Open your chats in Messenger.";
		return;
	}
	if (!state.chats.length) {
		CHAT_SOURCE.textContent = `${state.source}: it's kinda quiet here...`;
		return;
	}
	// The list's name only when it isn't the main one: "22 chats, 3 selected", "Archived: 9 chats"
	const where = state.source === "Chats List" ? "" : `${state.source}: `;
	const selected = state.selected.size ? `, ${state.selected.size} selected` : "";
	CHAT_SOURCE.textContent = `${where}${state.chats.length} ${state.chats.length === 1 ? "chat" : "chats"}${selected}`;
	CHAT_SOURCE.title = `${state.source}: ${state.chats.length} chats loaded${selected}`;
}

// The selected chats' links, in Messenger's order.
function selected_links() {
	return state.chats.filter((chat) => state.selected.has(chat.link)).map((chat) => chat.link);
}

function selected_names() {
	return state.chats.filter((chat) => state.selected.has(chat.link)).map((chat) => chat.name);
}

// ---------- jobs ----------

function run(action, links, options = {}) {
	if (!send({ type: "run", action, links, options, mode: state.mode })) return;
	state.job_dismissed = false;
	state.job = { action, mode: state.mode, total: links.length, position: 0, done: 0, problems: [], running: true, stopping: false, seconds: 0 };
	render_job();
}

async function load_mode() {
	const { mode } = await chrome.storage.local.get("mode");
	state.mode = mode === "fast" ? "fast" : "safe";
	render_mode();
}

function render_mode() {
	const { MODE } = get_popup_elements();
	MODE.querySelectorAll("button").forEach((button) => button.classList.toggle("mode-on", button.dataset.mode === state.mode));
}

function render_job() {
	const { JOB, JOB_TEXT, JOB_BAR, JOB_PROBLEMS, JOB_STOP, JOB_CLOSE, CHATS_ACTIONS } = get_popup_elements();
	const job = state.job;
	CHATS_ACTIONS.classList.toggle("busy", Boolean(job?.running));
	if (!job || state.job_dismissed) {
		JOB.classList.add("no-display");
		return;
	}
	const action = MENU_ACTIONS[job.action];
	JOB.classList.remove("no-display");
	if (job.running && job.mode === "fast") {
		JOB_TEXT.textContent = `${action.doing} ${job.total} ${job.total === 1 ? "chat" : "chats"} at once...`;
	} else if (job.running) {
		JOB_TEXT.textContent = job.stopping
			? "Stopping after this chat..."
			: `${action.doing} ${Math.max(job.position, 1)} of ${job.total}...`;
	} else {
		const stopped = job.done + job.problems.length < job.total ? " Stopped." : "";
		JOB_TEXT.textContent = `${action.past} ${job.done} of ${job.total} chats in ${job.seconds}s.${stopped}`;
	}
	const finished = job.done + job.problems.length;
	JOB_BAR.style.width = `${Math.round((finished / Math.max(job.total, 1)) * 100)}%`;
	JOB_PROBLEMS.replaceChildren(
		...job.problems.map(({ name, problem }) => {
			const item = document.createElement("li");
			item.textContent = `${name}: ${problem}`;
			return item;
		}),
	);
	JOB_STOP.classList.toggle("no-display", !job.running);
	JOB_CLOSE.classList.toggle("no-display", job.running);
}

// ---------- the report ----------

function ask_page_report() {
	return new Promise((resolve) => {
		if (!state.port) return resolve(null);
		const timer = setTimeout(() => resolve(null), 2000);
		state.report_waiting = (report) => {
			clearTimeout(timer);
			state.report_waiting = null;
			resolve(report);
		};
		state.port.postMessage({ type: "report" });
	});
}

// A report people can paste in an email: versions, which parts of the page were found and how, and errors.
// No chat names or links.
async function build_report() {
	const page = await ask_page_report();
	const { rules_check } = await chrome.storage.local.get("rules_check");
	const browser = navigator.userAgent.match(/Chrome\/[\d.]+/)?.[0] ?? navigator.userAgent;
	const lines = [
		`Messenger Batch Actions ${chrome.runtime.getManifest().version} report`,
		`Made: ${new Date().toISOString()}`,
		`Browser: ${browser} (${navigator.platform})`,
	];
	if (rules_check) {
		const when = new Date(rules_check.at).toISOString();
		lines.push(`GitHub rules check: ${rules_check.ok ? `got ${rules_check.version}` : rules_check.error} (${when})`);
	} else lines.push("GitHub rules check: not yet");
	if (!page) {
		lines.push(`Page: not connected (${state.tab?.url ? new URL(state.tab.url).hostname : "no tab"})`);
		return lines.join("\n");
	}
	lines.push(`Page: ${page.site}, ${page.page}`, `Layout rules in use: ${page.rules ?? "built-in only"}`, "", "Parts:");
	lines.push(...page.parts.map((line) => `  ${line}`));
	if (page.last_job) {
		const job = page.last_job;
		lines.push("", `Last action: ${job.action}, ${job.done} of ${job.total} done${job.running ? " (running)" : ""}`);
		lines.push(...job.problems.map(({ problem }) => `  problem: ${problem}`));
	}
	lines.push("", "Log:", ...(page.log.length ? page.log.map((line) => `  ${line}`) : ["  (empty)"]));
	return lines.join("\n");
}

async function copy_report() {
	const report = await build_report();
	try {
		await navigator.clipboard.writeText(report);
		POPUPS.report_copied();
	} catch {
		POPUPS.report_failed();
	}
}

async function check_for_fixes() {
	const { CHAT_SOURCE } = get_popup_elements();
	CHAT_SOURCE.textContent = "Checking GitHub for layout fixes...";
	const result = await chrome.runtime.sendMessage({ message: "rules_fetch" }).catch(() => null);
	render_source();
	POPUPS.fixes_checked(result);
}

// ---------- buttons ----------

function append_el_listeners() {
	const { CHATS_LIST, CHATS_ACTIONS, CHATS_ACTIONS_ADDITIONAL, ISSUES, HELP, SEARCH_INPUT, JOB_STOP, JOB_CLOSE, MODE, LOAD_MORE } =
		get_popup_elements();

	SEARCH_INPUT.addEventListener("input", ({ target }) => {
		state.search = target.value;
		render_chats();
	});

	ISSUES.addEventListener("click", () => POPUPS.issues());
	HELP.addEventListener("click", () => POPUPS.help());

	CHATS_LIST.addEventListener("click", ({ target }) => {
		const chat = target.closest(".chat-container");
		if (!chat) return;
		const { link } = chat.dataset;
		if (state.selected.has(link)) state.selected.delete(link);
		else state.selected.add(link);
		chat.classList.toggle("chat-selected", state.selected.has(link));
		render_source();
	});

	JOB_STOP.addEventListener("click", () => send({ type: "stop" }));
	// Messenger keeps the finished job to show it when the popup reopens, until it's dismissed here
	JOB_CLOSE.addEventListener("click", () => {
		state.job_dismissed = true;
		if (state.port) state.port.postMessage({ type: "dismiss" });
		render_job();
	});

	LOAD_MORE.addEventListener("click", () => {
		LOAD_MORE.classList.add("loading");
		send({ type: "load_more" });
	});

	MODE.addEventListener("click", ({ target }) => {
		const button = target.closest("button");
		if (!button) return;
		state.mode = button.dataset.mode === "fast" ? "fast" : "safe";
		chrome.storage.local.set({ mode: state.mode });
		render_mode();
	});

	CHATS_ACTIONS.addEventListener("click", ({ target }) => {
		const button = target.closest("button");
		if (!button) return;
		const { action } = button.dataset;
		const links = selected_links();
		if (!links.length) {
			POPUPS.no_chat_selected();
			return;
		}
		if (state.job?.running) {
			POPUPS.busy();
			return;
		}
		const names = selected_names();
		const who = `${escape_html(names[0])}${names.length > 1 ? ` and ${names.length - 1} more` : ""}`;

		switch (action) {
			// Requires config
			case "block": {
				show_popup(
					{
						exitable: true,
						title: `Block or unblock ${who}?`,
						description: "Pick the kind of block. A chat that's already blocked this way gets unblocked.",
						icon: ICONS.block,
						action: "Proceed",
						choices: ["Block messages and calls", "Block on Facebook"],
					},
					(block_type) => run(action, links, { block_type }),
				);
				break;
			}
			case "mute": {
				show_popup(
					{
						exitable: true,
						title: "Mute conversation",
						description: "Chat windows will stay closed, and you won't get push notifications on your devices.",
						icon: ICONS.mute,
						action: "Next",
						choices: ["Mute message notifications", "Mute call notifications", "Mute message & call notifications"],
					},
					(mute_type) => {
						show_popup(
							{
								exitable: true,
								title: "Mute for?",
								description: "Chat windows will stay closed, and you won't get push notifications on your devices.",
								icon: ICONS.mute,
								action: "Proceed",
								choices: ["For 15 minutes", "For 1 hour", "For 8 hours", "For 24 hours", "Until I turn it back on"],
							},
							(mute_time) => run(action, links, { mute_type, mute_time }),
						);
					},
				);
				break;
			}
			// No confirmation or config
			case "unmute":
			case "unarchive":
			case "archive": {
				run(action, links);
				break;
			}
			// Requires confirmation
			case "leave":
			case "delete": {
				show_popup(
					{
						exitable: true,
						title: "This is permanent",
						description: `${action === "delete" ? "Delete" : "Leave"} ${who}? This can't be undone.`,
						action: "Proceed",
					},
					() => run(action, links),
				);
				break;
			}
		}
	});

	CHATS_ACTIONS_ADDITIONAL.addEventListener("click", ({ target }) => {
		const button = target.closest("button");
		if (!button) return;
		switch (button.dataset.action) {
			case "select-all": {
				const term = state.search.trim().toLowerCase();
				state.chats.forEach((chat) => {
					if (!term || chat.name.toLowerCase().includes(term)) state.selected.add(chat.link);
				});
				render_chats();
				break;
			}
			case "unselect-all": {
				state.selected.clear();
				render_chats();
				break;
			}
			case "sortby-name": {
				state.sort = state.sort === "ascending" ? "descending" : "ascending";
				button.classList.toggle("flip", state.sort === "descending");
				render_chats();
				break;
			}
			case "refresh-chats": {
				button.classList.remove("spin-anim");
				void button.offsetWidth;
				button.classList.add("spin-anim");
				if (state.port) send({ type: "list" });
				else connect();
				break;
			}
			case "search-chats": {
				SEARCH_INPUT.classList.toggle("no-display");
				if (!SEARCH_INPUT.classList.contains("no-display")) SEARCH_INPUT.focus();
				break;
			}
		}
	});
}

// Shows a window over the popup. `description` is HTML written here (escape anything from Messenger with
// escape_html). With `choices`, the action button waits for one, and `callback` gets its index; without, it gets
// -1. `exitable` adds a close button, and closing by Escape or a click outside. Long text scrolls inside the
// window, so its buttons always stay in view.
function show_popup(config = {}, callback = null) {
	document.getElementById("popup")?.remove();
	const { exitable = false, title = "Attention", description = "", icon = "", action = "OK", choices = [] } = config;

	const backdrop = document.createElement("div");
	backdrop.id = "popup";
	backdrop.className = "popup-backdrop";
	const choices_html = choices
		.map((choice, i) => `<input type="radio" name="choices" id="choice-${i}" value="${i}"/><label for="choice-${i}">${choice}</label>`)
		.join("");
	backdrop.innerHTML = `
		<div class="popup-card" role="dialog" aria-modal="true">
			<div class="popup-header">
				${icon}
				<h1>${title}</h1>
				${exitable ? `<button class="popup-close" aria-label="Close"><svg viewBox="0 -960 960 960"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg></button>` : ""}
			</div>
			<div class="popup-body">
				${description}
				${choices.length ? `<div class="choices">${choices_html}</div>` : ""}
			</div>
			<button class="popup-action"${choices.length ? " disabled" : ""}>${action}</button>
		</div>`;

	const close = () => {
		backdrop.remove();
		document.removeEventListener("keydown", on_key);
	};
	const on_key = (event) => {
		if (event.key === "Escape" && exitable) close();
	};
	const action_button = backdrop.querySelector(".popup-action");
	backdrop.querySelector(".choices")?.addEventListener("change", () => (action_button.disabled = false));
	backdrop.querySelector(".popup-close")?.addEventListener("click", close);
	backdrop.addEventListener("click", (event) => {
		if (event.target === backdrop && exitable) close();
	});
	document.addEventListener("keydown", on_key);
	action_button.addEventListener("click", () => {
		const input = backdrop.querySelector("input[type='radio']:checked");
		if (!input && choices.length) return;
		close();
		if (callback) callback(input ? parseInt(input.value, 10) : -1);
	});

	document.body.appendChild(backdrop);
	action_button.focus();
}

function tooltip_init() {
	let tooltip = null;
	document.addEventListener("mouseover", ({ target }) => {
		const owner = target.closest?.("[data-tooltip]");
		if (!owner) return;
		tooltip?.remove();
		tooltip = document.createElement("div");
		tooltip.className = "tooltip";
		tooltip.textContent = owner.dataset.tooltip;
		document.body.appendChild(tooltip);

		const box = owner.getBoundingClientRect();
		const { width, height } = tooltip.getBoundingClientRect();
		const below = box.bottom + 6;
		tooltip.style.top = `${below + height > window.innerHeight ? box.top - height - 6 : below}px`;
		tooltip.style.left = `${Math.max(6, Math.min(box.left + box.width / 2 - width / 2, window.innerWidth - width - 6))}px`;
	});
}

// Now and then, after people have used it a few times, asks for a review. At most once a month, never on the
// first opens, and never while a job is showing.
async function remind_user() {
	const { opens = 0, review_asked_at = 0 } = await chrome.storage.local.get(["opens", "review_asked_at"]);
	await chrome.storage.local.set({ opens: opens + 1 });
	const month = 30 * 24 * 3600 * 1000;
	if (opens < 5 || Date.now() - review_asked_at < month || Math.random() > 0.1) return;
	setTimeout(() => {
		if (state.job || document.getElementById("popup")) return;
		chrome.storage.local.set({ review_asked_at: Date.now() });
		POPUPS.review();
	}, 1500);
}

tooltip_init();
append_el_listeners();
load_mode();
connect();
remind_user();
