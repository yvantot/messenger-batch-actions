const LINKS = {
	main_website: "https://yvantot.github.io/i",
	tools: "https://yvantot.github.io/i/tools",
	buymecoffee: "https://buymeacoffee.com/",
};

const POPUPS = {
	no_chat_selected: () =>
		show_popup({
			title: "No chat selected",
			description: "Select a chat by clicking them here",
			action: "I understand",
			width: 70,
			bg_color: "hsl(0, 0%, 10%)",
			text_color: "hsl(0, 0%, 90%)",
		}),
	busy: () =>
		show_popup({
			title: "Still working",
			description: "Wait for the current action to finish, or stop it first.",
			action: "I understand",
			width: 70,
			bg_color: "hsl(0, 0%, 10%)",
			text_color: "hsl(0, 0%, 90%)",
		}),
	no_more: () =>
		show_popup({
			title: "No more chats",
			description: "Messenger has no more chats to load in this list.",
			action: "I understand",
			width: 70,
			bg_color: "hsl(0, 0%, 10%)",
			text_color: "hsl(0, 0%, 90%)",
		}),
	report_copied: () =>
		show_popup({
			title: "Report copied",
			description: `Paste it in an email to <a href="mailto:jidalman.work@gmail.com" target="_blank">jidalman.work@gmail.com</a> and say what went wrong. It has no chat names in it.`,
			action: "Close",
			width: 70,
			bg_color: "hsl(0, 0%, 10%)",
			text_color: "hsl(0, 0%, 90%)",
		}),
	report_failed: () =>
		show_popup({
			title: "Couldn't copy",
			description: "Your browser didn't allow copying. Try again.",
			action: "Close",
			width: 70,
			bg_color: "hsl(0, 0%, 10%)",
			text_color: "hsl(0, 0%, 90%)",
		}),
	fixes_checked: (result) =>
		show_popup({
			title: result?.ok ? "Layout fixes are up to date" : "Couldn't check",
			description: result?.ok
				? `Using layout rules ${escape_html(result.version)} from GitHub.${result.changed ? " They're new, and in use now." : ""}`
				: `${escape_html(result?.error ?? "Something went wrong.")} The built-in layout is still used.`,
			action: "Close",
			width: 70,
			bg_color: "hsl(0, 0%, 10%)",
			text_color: "hsl(0, 0%, 90%)",
		}),
	help: () =>
		show_popup(
			{
				block_outside: true,
				exitable: true,
				title: "FAQ",
				action: "Next",
				description: `What is this tool for?<br/>- Archive, unarchive, leave groups, delete, mute, or unmute  chats with few clicks.<br/><br/>Does this affect Messenger performance?<br/>- No. This tool doesn't have anything running if it's not open.<br/><br/>Will this always be free?<br/>- I hope! You can support the development through <a href="https://yvantot.github.io/i/" target="_blank">donation</a> or check out my other <a href="https://yvantot.github.io/i/" target="_blank">tools</a>! `,
				icon: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#CCCCCC"><path d="M478-240q21 0 35.5-14.5T528-290q0-21-14.5-35.5T478-340q-21 0-35.5 14.5T428-290q0 21 14.5 35.5T478-240Zm-36-154h74q0-33 7.5-52t42.5-52q26-26 41-49.5t15-56.5q0-56-41-86t-97-30q-57 0-92.5 30T342-618l66 26q5-18 22.5-39t53.5-21q32 0 48 17.5t16 38.5q0 20-12 37.5T506-526q-44 39-54 59t-10 73Zm38 314q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>',
				width: 90,
				bg_color: "hsl(0, 0%, 10%)",
				text_color: "hsl(0, 0%, 90%)",
			},
			() =>
				show_popup({
					block_outside: true,
					exitable: true,
					title: "FAQ",
					description: `How to (insert action here) multiple chats?<br/>- Open Messenger, open this extension, select the chats, and click the action (archive, delete, etc). Need older chats? Click the arrow to load more. Safe mode does one chat at a time and checks each one; Fast mode does them all at once, which is quicker but can miss some. Either keeps going if you close this.<br/><br/>Is my data safe?<br/>- Yes. Nothing about you or your chats leaves your device. The only thing it downloads is a small file of page rules from GitHub, so it keeps working when Messenger changes its page.<br/><br/>The (insert action here) doesn't work properly<br/>- Reload Messenger and try again. If it still doesn't, use Report issues: it can check for fixes, and copy a report for your email.`,
					action: "Close",
					icon: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#CCCCCC"><path d="M478-240q21 0 35.5-14.5T528-290q0-21-14.5-35.5T478-340q-21 0-35.5 14.5T428-290q0 21 14.5 35.5T478-240Zm-36-154h74q0-33 7.5-52t42.5-52q26-26 41-49.5t15-56.5q0-56-41-86t-97-30q-57 0-92.5 30T342-618l66 26q5-18 22.5-39t53.5-21q32 0 48 17.5t16 38.5q0 20-12 37.5T506-526q-44 39-54 59t-10 73Zm38 314q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>',
					width: 90,
					bg_color: "hsl(0, 0%, 10%)",
					text_color: "hsl(0, 0%, 90%)",
				}),
		),

	issues: () => {
		show_popup(
			{
				block_outside: true,
				exitable: true,
				title: "BUGS!",
				description: `Messenger changes its page often. Check for fixes first; if it still doesn't work, copy a report and send it to my email <a href="mailto:jidalman.work@gmail.com" target="_blank">jidalman.work@gmail.com</a>, thank you.`,
				choices: ["Check for fixes", "Copy a report"],
				action: "Go",
				icon: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#CCCCCC"><path d="M478-240q21 0 35.5-14.5T528-290q0-21-14.5-35.5T478-340q-21 0-35.5 14.5T428-290q0 21 14.5 35.5T478-240Zm-36-154h74q0-33 7.5-52t42.5-52q26-26 41-49.5t15-56.5q0-56-41-86t-97-30q-57 0-92.5 30T342-618l66 26q5-18 22.5-39t53.5-21q32 0 48 17.5t16 38.5q0 20-12 37.5T506-526q-44 39-54 59t-10 73Zm38 314q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>',
				width: 90,
				bg_color: "hsl(0, 0%, 10%)",
				text_color: "hsl(0, 0%, 90%)",
			},
			(choice) => (choice === 0 ? check_for_fixes() : copy_report()),
		);
	},
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
			document.querySelector("[data-action='load-more']").classList.remove("loading");
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
	if (chat.img) {
		const img = document.createElement("img");
		img.src = chat.img;
		img.alt = "";
		img.loading = "lazy";
		element.append(img);
	}
	const name = document.createElement("p");
	name.textContent = chat.name;
	element.append(name);
	return element;
}

function render_source() {
	const { CHAT_SOURCE } = get_popup_elements();
	if (state.source === null) {
		CHAT_SOURCE.textContent = "Messenger's chat list isn't showing. Open your chats in Messenger.";
		return;
	}
	if (!state.chats.length) {
		CHAT_SOURCE.textContent = `${state.source}: it's kinda quiet here...`;
		return;
	}
	const selected = state.selected.size ? `, ${state.selected.size} selected` : "";
	CHAT_SOURCE.textContent = `${state.source}: ${state.chats.length} chats${selected}`;
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
	const { CHATS_LIST, CHATS_ACTIONS, CHATS_ACTIONS_ADDITIONAL, ISSUES, HELP, SEARCH_INPUT, JOB_STOP, JOB_CLOSE, MODE } =
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
						block_outside: true,
						title: `Block or unblock ${who}?`,
						description: "Pick the kind of block. A chat that's already blocked this way gets unblocked.",
						icon: ICONS.block,
						action: "Proceed",
						choices: ["Block messages and calls", "Block on Facebook"],
						width: 90,
						bg_color: "hsl(0, 0%, 10%)",
						text_color: "hsl(0, 0%, 90%)",
					},
					(block_type) => run(action, links, { block_type }),
				);
				break;
			}
			case "mute": {
				show_popup(
					{
						exitable: true,
						block_outside: true,
						title: "Mute conversation",
						description: "Chat windows will stay closed, and you won't get push notifications on your devices.",
						icon: ICONS.mute,
						action: "Next",
						choices: ["Mute message notifications", "Mute call notifications", "Mute message & call notifications"],
						width: 70,
						bg_color: "hsl(0, 0%, 10%)",
						text_color: "hsl(0, 0%, 90%)",
					},
					(mute_type) => {
						show_popup(
							{
								exitable: true,
								block_outside: true,
								title: "Mute for?",
								description: "Chat windows will stay closed, and you won't get push notifications on your devices.",
								icon: ICONS.mute,
								action: "Proceed",
								choices: ["For 15 minutes", "For 1 hour", "For 8 hours", "For 24 hours", "Until I turn it back on"],
								width: 70,
								bg_color: "hsl(0, 0%, 10%)",
								text_color: "hsl(0, 0%, 90%)",
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
						block_outside: true,
						exitable: true,
						title: "This is permanent",
						description: `${action === "delete" ? "Delete" : "Leave"} ${who}? This can't be undone.`,
						action: "Proceed",
						width: 70,
						bg_color: "hsl(0, 0%, 10%)",
						text_color: "hsl(0, 0%, 90%)",
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
			case "load-more": {
				button.classList.add("loading");
				send({ type: "load_more" });
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

function show_popup(config = {}, callback = null) {
	document.getElementById("yvan-popup")?.remove();
	document.getElementById("yvan-popup-style")?.remove();

	const root = document.createElement("yvan-popup");
	root.setAttribute("id", "yvan-popup");

	const style = document.createElement("style");
	style.setAttribute("id", "yvan-popup-style");

	const {
		exitable = false,
		block_outside = false,
		title = "Attention",
		description = "",
		icon = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#CCCCCC"><path d="m40-120 440-760 440 760H40Zm138-80h604L480-720 178-200Zm302-40q17 0 28.5-11.5T520-280q0-17-11.5-28.5T480-320q-17 0-28.5 11.5T440-280q0 17 11.5 28.5T480-240Zm-40-120h80v-200h-80v200Zm40-100Z"/></svg>',
		action = "Okay",
		choices = [],
		bg_color = "hsl(0, 0%, 90%)",
		text_color = "hsl(0, 0%, 10%)",
		width = 50,
		height = undefined,
	} = config;

	const choices_el = choices
		.map(
			(choice, i) =>
				`<input type="radio" name="choices" id="choice-${i}" value='${i}'/><label for="choice-${i}">${choice}</label>`,
		)
		.join("");

	style.innerHTML = `
	${
		block_outside
			? `
	yvan-popup { 
		position: fixed; 		
		width: 100vw; 
		height: 100vh;
		left: 0;
		top: 0;
		backdrop-filter: blur(5px);
		}`
			: ""
	}
	${block_outside ? "popup-main" : "yvan-popup"}{position:fixed;width:${width ? width + "vw" : "fit-content"};height:${
		height ? height + "vh" : "fit-content"
	};animation:show_up 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;background-color:${bg_color};a,p,button,h1,label{color:${text_color}}border-top:2px solid hsl(0 0% 50% / .5);top:50%;left:50%;transform:translateX(-50%) translateY(-50%);display:flex;flex-direction:column;justify-content:center;align-items:center;border-radius:1rem;gap:.5rem;padding:1rem;box-shadow:0 5px 10px 5px hsl(0 0% 0% / .5);z-index:999;backdrop-filter:blur(5px);p,a,button,label{font-size:clamp(0.8rem, 1vw, 1rem);user-select:none}.header{display:flex;justify-content:center;align-items:center;gap:1rem;h1{user-select:none;font-size:clamp(1rem, 1.3rem, 1.5rem);font-weight:700}svg{border-radius:100%;width:10vw;height:10vw}}.choices{background-color:hsl(0 0% 0% / .1);width:100%;display:flex;flex-direction:column;align-items:center;padding:.5rem;border-radius:.5rem;gap:.5rem;label{opacity:.5;width:100%;background-color:hsl(0 0% 50% / .5);border:1px solid hsl(0 0% 50% / .5);text-align:center;padding:.1rem .7rem;border-radius:.5rem}input{display:none}input[type="radio"]:checked+label{opacity:1;background-color:hsl(0 0% 0% / .2)}}button{width:100%;border:1px solid hsl(0 0% 50% / .5);padding:.3rem .7rem;border-radius:.5rem}button,label,span svg{cursor:pointer;transition:transform 0.3s ease-in-out,background-color 0.3s ease-in-out,opacity 0.3s ease-in-out}button:hover,label:hover{opacity:1;background-color:hsl(0 0% 0% / .1);transform:scale(.95,.95)}}
		span { position: relative; width: 100%; height: 0; svg { width: 5vw; height: 5vw;  position: absolute; top: 0; right: 0;}}
	`;

	root.innerHTML = `		
		${exitable ? `<span><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#CCCCCC"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg></span>` : ""}
		<div class="header">
			${icon}
			<h1>${title}</h1>
		</div>
		${description.trim().length ? `<p>${description}</p>` : ""}
		${choices_el.length ? `<div class="choices">${choices_el}</div>` : ""}
		<button>${action}</button>		
		
	`;

	if (block_outside) {
		const main = document.createElement("popup-main");
		main.innerHTML = root.innerHTML;
		root.innerHTML = "";
		root.appendChild(main);
	}

	if (exitable) {
		root.querySelector("span svg").addEventListener("click", () => {
			root.remove();
			style.remove();
		});
	}

	root.querySelector("button").addEventListener("click", () => {
		const input = root.querySelector("input[type='radio']:checked");
		if (!input && choices_el.length) return;
		const choice = input?.value ?? -1;

		root.remove();
		style.remove();

		if (callback) callback(parseInt(choice));
	});

	document.head.appendChild(style);
	document.body.appendChild(root);
}

function tooltip_init() {
	const innerWidth = 300;
	const innerHeight = 500;

	const tooltips = [];
	document.addEventListener("mouseover", ({ target }) => {
		if (target.dataset?.tooltip) {
			for (let i = 0; i < tooltips.length; i++) {
				tooltips[i].remove();
			}

			const { x, y, height: target_height } = target.getBoundingClientRect();
			const tooltip = create_element(
				"tooltip",
				{ class: "tooltip" },
				target.dataset.tooltip,
			);
			tooltips.push(tooltip);
			document.body.appendChild(tooltip);

			const { width: tooltip_width, height: tooltip_height } =
				tooltip.getBoundingClientRect();
			const offset_height = y + target_height + 5;
			tooltip.style.top =
				(offset_height + tooltip_height > innerHeight
					? y - tooltip_height
					: offset_height) + "px";
			tooltip.style.left =
				(x + tooltip_width > innerWidth ? innerWidth - tooltip_width : x) +
				"px";
		}
	});
}

function remind_user() {
	const chances = Math.floor(Math.random() * 15);
	if (chances === 0) {
		const name = chrome.runtime.getManifest().name;
		const id = "fhedcmcogemcndkjkoaojkdggfmpbmkk";
		const link = `https://chromewebstore.google.com/detail/${id}/`;
		const popup_type = ["rate", "other-tools", "donate"];
		const chance = Math.floor(Math.random() * popup_type.length);

		switch (popup_type[chance]) {
			case "rate": {
				show_popup({
					block_outside: true,
					title: "Your feedback helps me improve",
					action: "I understand",
					description: `I make web extensions (education apps, productivity apps, anti-addictive-sites apps, common apps that should be free, tools like this) to help me spend less time on the internet.<br/><br/>I'd be very happy if you can rate <a href="${link}" target="_blank">${name}</a> and share your feedbacks.`,
					icon: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#CCCCCC"><path d="M640-440 474-602q-31-30-52.5-66.5T400-748q0-55 38.5-93.5T532-880q32 0 60 13.5t48 36.5q20-23 48-36.5t60-13.5q55 0 93.5 38.5T880-748q0 43-21 79.5T807-602L640-440Zm0-112 109-107q19-19 35-40.5t16-48.5q0-22-15-37t-37-15q-14 0-26.5 5.5T700-778l-60 72-60-72q-9-11-21.5-16.5T532-800q-22 0-37 15t-15 37q0 27 16 48.5t35 40.5l109 107ZM280-220l278 76 238-74q-5-9-14.5-15.5T760-240H558q-27 0-43-2t-33-8l-93-31 22-78 81 27q17 5 40 8t68 4q0-11-6.5-21T578-354l-234-86h-64v220ZM40-80v-440h304q7 0 14 1.5t13 3.5l235 87q33 12 53.5 42t20.5 66h80q50 0 85 33t35 87v40L560-60l-280-78v58H40Zm80-80h80v-280h-80v280Zm520-546Z"/></svg>',
					width: 90,
					bg_color: "hsl(0, 0%, 10%)",
					text_color: "hsl(0, 0%, 90%)",
				});
				break;
			}
			case "donate": {
				show_popup({
					block_outside: true,
					title: "This $@$%# doesn't work at all!",
					action: "I understand",
					description: `(...if it's working properly, pheww) Who maintains this piece of a tool? Oh, that's me.<br/><br/>Messenger updates. a. lot. and it is not easy to modify. This (unfortunate) situation, make tools like this very unstable.<br/><br/>....It is important to note that these features are not expected by Messenger, that's why it's inevitable for this tool to not work sometimes.`,
					icon: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#CCCCCC"><path d="M480-420q-68 0-123.5 38.5T276-280h408q-25-63-80.5-101.5T480-420Zm-168-60 44-42 42 42 42-42-42-42 42-44-42-42-42 42-44-42-42 42 42 44-42 42 42 42Zm250 0 42-42 44 42 42-42-42-42 42-44-42-42-44 42-42-42-42 42 42 44-42 42 42 42ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-400Zm0 320q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Z"/></svg>',
					width: 90,
					bg_color: "hsl(0, 0%, 10%)",
					text_color: "hsl(0, 0%, 90%)",
				});
				break;
			}
			case "other-tools": {
				show_popup({
					block_outside: true,
					title: "Checkout other time-saving tools",
					action: "I understand",
					description: `Yo, checkout my other stuff <a href="${LINKS.tools}">here</a>. You might find them useful.`,
					icon: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#CCCCCC"><path d="M686-132 444-376q-20 8-40.5 12t-43.5 4q-100 0-170-70t-70-170q0-36 10-68.5t28-61.5l146 146 72-72-146-146q29-18 61.5-28t68.5-10q100 0 170 70t70 170q0 23-4 43.5T584-516l244 242q12 12 12 29t-12 29l-84 84q-12 12-29 12t-29-12Zm29-85 27-27-256-256q18-20 26-46.5t8-53.5q0-60-38.5-104.5T386-758l74 74q12 12 12 28t-12 28L332-500q-12 12-28 12t-28-12l-74-74q9 57 53.5 95.5T360-440q26 0 52-8t47-25l256 256ZM472-488Z"/></svg>',
					width: 90,
					bg_color: "hsl(0, 0%, 10%)",
					text_color: "hsl(0, 0%, 90%)",
				});
				break;
			}
		}
	}
}

remind_user();
tooltip_init();
append_el_listeners();
load_mode();
connect();
