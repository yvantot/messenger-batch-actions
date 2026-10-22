// Runs an action on chats one at a time, the way a person would: open the chat's menu, pick the item, answer any
// window that asks, and wait for Messenger to finish before going to the next chat. Menus and windows are hidden
// while it runs. The job keeps going if the popup closes; the popup shows it again when it's opened.

const STEP_TIMEOUT = 6000;

const Job = {
	// { action, total, position, done, problems: [{ name, problem }], running, stop, started, finished }
	current: null,
	// Called with the job after every change
	on_change: null,
};

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

// Resolves with what `get` returns once it's truthy, or null after `timeout` ms.
async function wait_for(get, timeout = STEP_TIMEOUT) {
	const end = Date.now() + timeout;
	while (Date.now() < end) {
		const value = get();
		if (value) return value;
		await sleep(100);
	}
	return null;
}

// Starts `action` on the chats at `links` (paths, as list_chats gives them). Returns false when a job is already
// running or the request isn't valid.
function start_job({ action, links, options }) {
	if (Job.current?.running) return false;
	if (!Object.hasOwn(MENU_ACTIONS, action) || !Array.isArray(links) || !links.length) return false;
	const names = new Map((list_chats() ?? []).map((chat) => [chat.link, chat.name]));
	const chats = [...new Set(links)].filter((link) => typeof link === "string").map((link) => ({ link, name: names.get(link) ?? "A chat" }));
	Job.current = {
		action,
		total: chats.length,
		position: 0,
		done: 0,
		problems: [],
		running: true,
		stop: false,
		started: Date.now(),
		finished: null,
	};
	run_job(Job.current, chats, clean_options(options));
	return true;
}

function stop_job() {
	if (Job.current?.running) {
		Job.current.stop = true;
		job_changed(Job.current);
	}
}

// The popup's choices, kept in range: mute_type 0-2 (messages, calls, both), mute_time 0-4 (15 minutes to until
// turned back on), block_type 0-1 (messages and calls, on Facebook).
function clean_options(options = {}) {
	const pick = (value, max, fallback) => (Number.isInteger(value) && value >= 0 && value <= max ? value : fallback);
	return {
		mute_type: pick(options?.mute_type, 2, 2),
		mute_time: pick(options?.mute_time, 4, 4),
		block_type: pick(options?.block_type, 1, 0),
	};
}

// The job as sent to the popup, or, without names, as it goes in the report.
function job_summary(job, with_names = true) {
	return {
		action: job.action,
		total: job.total,
		position: job.position,
		done: job.done,
		problems: job.problems.map((entry) => (with_names ? entry : { problem: entry.problem })),
		running: job.running,
		stopping: job.stop && job.running,
		seconds: Math.round(((job.finished ?? Date.now()) - job.started) / 1000),
	};
}

function job_changed(job) {
	try {
		Job.on_change?.(job);
	} catch (error) {
		log_error("sending progress", error);
	}
}

async function run_job(job, chats, options) {
	const dialogs_before = new Set(Parts.all("dialog"));
	hide_menus_and_dialogs(true);
	try {
		for (const chat of chats) {
			if (job.stop) break;
			job.position++;
			job_changed(job);
			let result;
			try {
				result = await run_on_chat(job.action, chat.link, options);
			} catch (error) {
				log_error(job.action, error);
				result = { problem: "something went wrong" };
			}
			if (result.problem) job.problems.push({ name: chat.name, problem: result.problem });
			else job.done++;
			await close_leftovers(dialogs_before);
			job_changed(job);
		}
	} catch (error) {
		log_error(job.action, error);
	} finally {
		hide_menus_and_dialogs(false);
		job.running = false;
		job.finished = Date.now();
		job_changed(job);
	}
}

// Does `action` on one chat. Resolves with {} when it worked, or { problem } saying what went wrong.
async function run_on_chat(action, href, options) {
	const row = find_row(href);
	if (!row) return { problem: "it's not in Messenger's list anymore" };
	if (!Parts.first("menu_button", row)) {
		Parts.missing("menu_button");
		return { problem: "its menu button wasn't found" };
	}
	const menu = await open_menu(row);
	if (!menu) return { problem: "its menu didn't open" };
	const item = Parts.menu_item(menu, action);
	if (!item) return { problem: `its menu has no ${MENU_ACTIONS[action].label.toLowerCase()} option` };

	const dialogs_before = new Set(Parts.all("dialog"));
	const new_dialog = () => Parts.all("dialog").find((dialog) => !dialogs_before.has(dialog));
	const gone = () => wait_for(() => !find_chat_link(href), 4000);
	item.click();

	switch (action) {
		// No window: the chat moves to or from Archived
		case "archive":
		case "unarchive": {
			if (await gone()) return {};
			// Messenger sometimes leaves the row in place (often the last one in the list): its menu says if it moved
			const opposite = action === "archive" ? "unarchive" : "archive";
			return (await menu_has(href, opposite)) ? {} : { problem: "Messenger didn't move it" };
		}
		case "unmute":
			await sleep(300);
			return {};
		// A window asks to confirm
		case "delete":
		case "leave": {
			const dialog = await wait_for(new_dialog);
			if (!dialog) return { problem: "the confirm window didn't open" };
			if (!(await click_confirm(dialog))) return { problem: "the confirm window has no confirm button" };
			if (!(await wait_closed(dialog))) return { problem: "Messenger didn't confirm it" };
			if (action === "delete" && !(await gone())) return { problem: "Messenger didn't delete it" };
			return {};
		}
		case "mute":
			return mute_chat(new_dialog, options);
		case "block":
			return block_chat(new_dialog, dialogs_before, options);
	}
	return { problem: "unknown action" };
}

// Mute asks what to mute (for most chats), then for how long, in the same window.
async function mute_chat(new_dialog, { mute_type, mute_time }) {
	const dialog = await wait_for(new_dialog);
	if (!dialog) return { problem: "the mute window didn't open" };
	const choices_at_least = (count) =>
		wait_for(() => {
			const choices = Parts.all("dialog_choice", dialog);
			return choices.length >= count ? choices : null;
		});

	let choices = await choices_at_least(3);
	if (!choices) {
		Parts.missing("dialog_choice");
		return { problem: "the mute window has no choices" };
	}
	if (choices.length === 3) {
		choices[mute_type].click();
		if (!(await click_confirm(dialog))) return { problem: "the mute window has no next button" };
		choices = await choices_at_least(8);
		if (!choices) return { problem: "the mute window didn't ask for how long" };
	}
	// How long is always the last five choices
	choices[choices.length - 5 + mute_time].click();
	await sleep(150);
	if (!(await click_confirm(dialog))) return { problem: "the mute window has no mute button" };
	return (await wait_closed(dialog)) ? {} : { problem: "Messenger didn't mute it" };
}

// Block asks which kind of block (or unblock) in one window, then to confirm in another. The first window stays
// open afterwards, so it's closed here.
async function block_chat(new_dialog, dialogs_before, { block_type }) {
	const choice = await wait_for(new_dialog);
	if (!choice) return { problem: "the block window didn't open" };
	// The first button is the window's close button, then one per kind of block
	const options = await wait_for(() => {
		const buttons = visible_buttons(choice);
		return buttons.length >= 3 ? buttons : null;
	});
	if (!options) return { problem: "the block window has no choices" };
	options[block_type + 1].click();

	const confirm = await wait_for(() =>
		Parts.all("dialog").find((dialog) => !dialogs_before.has(dialog) && dialog !== choice),
	);
	if (!confirm) return { problem: "the confirm window didn't open" };
	const clicked = await click_confirm(confirm);
	const closed = clicked && (await wait_closed(confirm));
	await sleep(300);
	if (choice.isConnected) close_dialog(choice);
	return closed ? {} : { problem: "Messenger didn't block it" };
}

// ---------- menus and windows ----------

// Messenger renders each window button twice, one copy hidden and disabled. The ones that count are visible and
// enabled: [close, ...choices or cancel, confirm], with confirm last.
function visible_buttons(dialog) {
	return Parts.all("dialog_button", dialog).filter(
		(button) => button.getAttribute("aria-disabled") !== "true" && getComputedStyle(button).visibility !== "hidden",
	);
}

// Clicks the window's confirm button once it has its close, cancel and confirm buttons.
async function click_confirm(dialog) {
	const buttons = await wait_for(() => {
		const found = visible_buttons(dialog);
		return found.length >= 3 ? found : null;
	});
	if (!buttons) {
		Parts.missing("dialog_button");
		return false;
	}
	await sleep(150);
	visible_buttons(dialog).at(-1).click();
	return true;
}

function wait_closed(dialog) {
	return wait_for(() => !dialog.isConnected);
}

// Closes a window by its close button (the one with no text), or with Escape.
function close_dialog(dialog) {
	const close = visible_buttons(dialog).find((button) => !button.textContent.trim());
	if (close) close.click();
	else dialog.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", code: "Escape", keyCode: 27, bubbles: true }));
}

async function open_menu(row) {
	await close_menus();
	const button = Parts.first("menu_button", row);
	if (!button) {
		Parts.missing("menu_button");
		return null;
	}
	button.click();
	const menu = await wait_for(() => {
		const found = Parts.first("menu");
		return found && Parts.all("menu_item", found).length ? found : null;
	}, 4000);
	if (!menu) {
		Parts.missing("menu");
		return null;
	}
	// Some items (like Unmute) show up a moment after the rest
	await sleep(200);
	return menu;
}

// Whether the menu of the chat at `href` has the item for `action`.
async function menu_has(href, action) {
	const row = find_row(href);
	const menu = row && (await open_menu(row));
	const has = Boolean(menu && Parts.menu_item(menu, action));
	await close_menus();
	return has;
}

// Closes open chat menus by clicking their buttons again.
async function close_menus() {
	document.querySelectorAll(`${Parts.css("menu_button")}[aria-expanded='true']`).forEach((button) => button.click());
	await wait_for(() => !Parts.first("menu"), 1000);
}

// After each chat: closes any menu, and any window the job opened that's still open.
async function close_leftovers(dialogs_before) {
	await close_menus();
	const left = Parts.all("dialog").filter((dialog) => !dialogs_before.has(dialog));
	if (!left.length) return;
	left.forEach(close_dialog);
	await wait_for(() => left.every((dialog) => !dialog.isConnected), 1500);
}

function hide_menus_and_dialogs(hide) {
	document.getElementById("batch-actions-hide")?.remove();
	if (!hide) return;
	const style = document.createElement("style");
	style.id = "batch-actions-hide";
	style.textContent = `${Parts.css("menu")}, ${Parts.css("dialog")} { display: none !important; }`;
	document.head.appendChild(style);
}
