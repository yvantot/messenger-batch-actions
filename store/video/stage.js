// The demo video. The story: Mom's message is buried under old chats, promos and Marketplace sellers. You open
// Batch Actions, archive the old chats (one by one, then all at once), mute the noisy groups, find and delete the
// Marketplace chats, and now Mom's chat is at the top, so you answer her.
//
// Staging: one thing happens at a time (caption, then clicks, then the effect), and focus() fades back whatever
// isn't what to look at. No intro or outro: the name sits in a corner throughout.
//
// stage.handle() plays Messenger's part for the real popup (popup-stub.js): it sends the chats and runs the actions
// on this page. run() is the timeline; record.py steps the clock through it frame by frame
// (`python store/video/record.py --serve` plays it live).

const COLORS = ["#ff8a65", "#4db6ac", "#7986cb", "#ffb74d", "#4fc3f7", "#ba68c8", "#f48fb1", "#81c784", "#a1887f", "#90a4ae"];
const CHATS = [
	["Class of 2016", "Reunion photos are up!", 2],
	["Wedding planning 2022", "Final seating chart", 5],
	["Marketplace: old bike", "Is this still available?", 8],
	["Old group project", "final_final_v3.pptx", 9],
	["Neighborhood group", "Whose cat is this?", 7],
	["Pizza Palace", "50% off tonight only!", 0],
	["Giveaway Page", "You won! Claim your prize", 3],
	["Gym Deals", "Your free trial ends soon", 4],
	["Mom", "Did you see my message?", 6],
	["Family reunion", "Photo dump!!", 1],
	["Marketplace: blue sofa", "Can you do $50?", 8],
	["Sam", "Coffee tomorrow?", 4],
	["Marketplace: lamp", "I'll pick it up today", 8],
	["Work team", "Meeting moved to 3pm", 2],
	["Dad", "Did you get my email?", 1],
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const ease = (p) => (p < 0.5 ? 4 * p * p * p : 1 - (-2 * p + 2) ** 3 / 2);
// Overshoots a little, then settles: things pop in with a bounce
const back_out = (p) => 1 + 2.70158 * (p - 1) ** 3 + 1.70158 * (p - 1) ** 2;

// Calls fn(progress 0..1, eased) on the page's clock for `ms`.
async function tween(ms, fn) {
	const start = Date.now();
	for (;;) {
		const p = Math.min(1, (Date.now() - start) / ms);
		fn(p, ease(p));
		if (p >= 1) return;
		await sleep(16);
	}
}

const avatar_url = (name, color) =>
	"data:image/svg+xml," +
	encodeURIComponent(
		`<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="${COLORS[color]}"/><text x="32" y="42" font-family="Arial" font-size="28" font-weight="700" fill="#fff" text-anchor="middle">${name[0]}</text></svg>`,
	);
const make_chat = ([name, preview, color], i) => ({ link: `/t/${2000 + i}/`, name, preview, color, unread: false });

// ---------- Messenger's part ----------

const stage = {
	chats: CHATS.map(make_chat),
	muted: new Set(),
	to_popup: null,
	job_done: null,

	attach(fn) {
		stage.to_popup = fn;
	},
	send(message) {
		stage.to_popup?.(JSON.parse(JSON.stringify(message)));
	},
	send_chats() {
		stage.send({
			type: "chats",
			source: "Chats List",
			chats: stage.chats.map((chat) => ({ link: chat.link, name: chat.name, img: avatar_url(chat.name, chat.color) })),
		});
	},

	handle(request) {
		if (request.type === "list") stage.send_chats();
		if (request.type === "run") stage.run_job(request);
	},

	async run_job({ action, links, mode }) {
		const job = { action, mode, total: links.length, position: 0, done: 0, problems: [], running: true, stopping: false, seconds: 0 };
		const started = Date.now();
		const update = () =>
			stage.send({ type: "job", job: { ...job, seconds: Math.max(1, Math.round((Date.now() - started) / 1000)) } });
		update();
		const bin = BINS[action] ? await show_bin(action) : null;
		if (mode === "fast") {
			job.position = job.total;
			update();
			await sleep(300);
			await effect(action, links, bin);
			job.done = links.length;
		} else {
			for (const link of links) {
				job.position++;
				update();
				await sleep(150);
				await effect(action, [link], bin);
				job.done++;
				update();
			}
		}
		if (bin) await hide_bin(bin);
		job.running = false;
		update();
		stage.job_done?.();
	},
};

// The popup's frame reaches it as window.parent.stage
window.stage = stage;

function make_row(chat) {
	const row = document.createElement("div");
	row.className = `row${stage.muted.has(chat.link) ? " is-muted" : ""}`;
	row.dataset.link = chat.link;
	row.innerHTML = `
		<span class="av" style="background: ${COLORS[chat.color]}">${chat.name[0]}</span>
		<div class="text"><div class="name"></div><div class="preview"></div></div>
		<svg class="muted" viewBox="0 -960 960 960"><path fill="currentColor" d="M160-200v-80h80v-280q0-33 8.5-65t25.5-61l60 60q-7 16-10.5 32.5T320-560v280h248L56-792l56-56 736 736-56 56-146-144H160Zm560-154-80-80v-126q0-66-47-113t-113-47q-26 0-50 8t-44 24l-58-58q20-16 43-28t49-18v-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v28q80 20 130 84.5T720-560v206Zm-276-50Zm36 324q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80Zm33-481Z"/></svg>
		<span class="unread"></span>`;
	row.querySelector(".name").textContent = chat.name;
	row.querySelector(".preview").textContent = chat.preview;
	return row;
}

const row_of = (link) => document.querySelector(`.row[data-link="${link}"]`);
const link_of = (name) => stage.chats.find((chat) => chat.name === name).link;

function update_badge() {
	document.getElementById("badge").textContent = String(stage.chats.length);
}

// Drops chats from Messenger's list once their rows are gone, and tells the popup.
function forget(links) {
	links.forEach((link) => row_of(link)?.remove());
	stage.chats = stage.chats.filter((chat) => !links.includes(chat.link));
	update_badge();
	stage.send_chats();
}

async function collapse(rows) {
	await tween(220, (p, e) => rows.forEach((row) => (row.style.height = `${54 * (1 - e)}px`)));
}

// ---------- effects ----------

function spawn(className, html = "") {
	const element = document.createElement("div");
	element.className = className;
	element.innerHTML = html;
	document.body.appendChild(element);
	return element;
}

// The archive box and the trash can, at the bottom of the chat list
const BINS = {
	archive: `<svg viewBox="0 0 64 64" width="76" height="76"><rect x="9" y="24" width="46" height="32" rx="7" fill="#ff8a65"/><rect x="5" y="12" width="54" height="15" rx="6" fill="#ff7043"/><rect x="24" y="34" width="16" height="6" rx="3" fill="#fff" opacity="0.9"/></svg>`,
	delete: `<svg viewBox="0 0 64 64" width="76" height="76"><rect x="13" y="21" width="38" height="36" rx="7" fill="#9aa5b8"/><rect x="8" y="13" width="48" height="9" rx="4.5" fill="#7b879c"/><rect x="25" y="6" width="14" height="9" rx="4" fill="#7b879c"/><g stroke="#fff" stroke-width="3.5" stroke-linecap="round" opacity="0.85"><line x1="24" y1="30" x2="24" y2="49"/><line x1="32" y1="30" x2="32" y2="49"/><line x1="40" y1="30" x2="40" y2="49"/></g></svg>`,
};
BINS.leave = BINS.delete;

function bin_spot() {
	const list = document.getElementById("rows").getBoundingClientRect();
	// Bottom right, over the previews rather than the names
	return { x: list.right - 64, y: list.bottom - 52 };
}

async function show_bin(action) {
	const element = spawn("bin", BINS[action]);
	const spot = bin_spot();
	element.style.left = `${spot.x - 38}px`;
	element.style.top = `${spot.y - 38}px`;
	await tween(280, (p) => (element.style.transform = `scale(${back_out(p)})`));
	return { element, ...spot };
}

async function hide_bin(bin) {
	await sleep(200);
	await tween(200, (p, e) => (bin.element.style.transform = `scale(${1 - e})`));
	bin.element.remove();
}

// A little squash when a chat lands in it
async function catch_in(bin) {
	await tween(220, (p) => {
		const squash = Math.sin(p * Math.PI) * 0.16;
		bin.element.style.transform = `scale(${1 + squash}, ${1 - squash})`;
	});
}

// Chats hop into the box (archive) or get tossed in the can (delete), all at once.
async function into_bin(links, bin, toss) {
	const rows = links.map(row_of);
	const boxes = rows.map((row) => row.getBoundingClientRect());
	await tween(460, (p, e) =>
		rows.forEach((row, i) => {
			const dx = (bin.x - (boxes[i].left + boxes[i].width / 2)) * e;
			// A little hop up on the way
			const dy = (bin.y - (boxes[i].top + boxes[i].height / 2)) * e - Math.sin(p * Math.PI) * 40;
			row.style.zIndex = "11";
			row.style.transform = `translate(${dx}px, ${dy}px) scale(${1 - 0.85 * e}) rotate(${(toss ? 300 : 0) * e}deg)`;
			row.style.opacity = String(1 - 0.6 * e);
		}),
	);
	catch_in(bin);
	await collapse(rows);
	forget(links);
}

// Mute: the chat falls asleep. A few z's float up, and the muted bell shows.
async function fall_asleep(links) {
	await Promise.all(
		links.map(async (link) => {
			const row = row_of(link);
			const box = row.getBoundingClientRect();
			stage.muted.add(link);
			row.classList.add("is-muted");
			const zs = ["z", "z", "Z"].map((letter, i) => {
				const z = spawn("zzz");
				z.textContent = letter;
				z.style.fontSize = `${16 + i * 5}px`;
				return z;
			});
			await tween(900, (p) =>
				zs.forEach((z, i) => {
					const q = Math.max(0, Math.min(1, p * 1.6 - i * 0.25));
					z.style.left = `${box.right - 60 + i * 14 + Math.sin(q * 6) * 4}px`;
					z.style.top = `${box.top + 10 - q * 34 - i * 6}px`;
					z.style.opacity = String(q < 0.8 ? Math.min(1, q * 4) : (1 - q) * 5);
				}),
			);
			zs.forEach((z) => z.remove());
		}),
	);
}

async function effect(action, links, bin) {
	if (action === "archive" || action === "unarchive") await into_bin(links, bin, false);
	else if (action === "delete" || action === "leave") await into_bin(links, bin, true);
	else if (action === "mute") await fall_asleep(links);
}

// A few happy dots around a point
async function confetti(x, y) {
	const dots = Array.from({ length: 12 }, (_, i) => {
		const dot = spawn("dot");
		dot.style.background = COLORS[i % COLORS.length];
		return { dot, angle: (Math.PI * 2 * i) / 12, reach: 40 + (i % 3) * 14 };
	});
	await tween(700, (p, e) =>
		dots.forEach(({ dot, angle, reach }) => {
			dot.style.left = `${x + Math.cos(angle) * reach * e - 5}px`;
			dot.style.top = `${y + Math.sin(angle) * reach * e - 5 + p * p * 20}px`;
			dot.style.opacity = String(1 - p);
		}),
	);
	dots.forEach(({ dot }) => dot.remove());
}

// ---------- the spotlight ----------

// How much each part fades back, for each thing to look at: the popup (clicking) or the chat list (chats moving,
// with the popup's progress still bright). The popup itself is never faded: on cream it would turn gray.
const FOCUS = {
	all: { list: 0, chat: 0, popup: 0 },
	popup: { list: 0.6, chat: 0.6, popup: 0 },
	list: { list: 0, chat: 0.6, popup: 0 },
};
let focused = FOCUS.all;

async function focus(name) {
	const from = focused;
	const to = FOCUS[name];
	focused = to;
	await tween(220, (p, e) => {
		for (const part of ["list", "chat", "popup"]) {
			document.getElementById(`dim-${part}`).style.opacity = String(from[part] + (to[part] - from[part]) * e);
		}
	});
}

// ---------- the open chat with Mom ----------

function message(text, mine) {
	const element = document.createElement("div");
	element.className = `msg${mine ? " me" : ""}`;
	element.innerHTML = `${mine ? "" : `<span class="av" style="background: ${COLORS[6]}">M</span>`}<div class="bubble"></div>`;
	element.querySelector(".bubble").textContent = text;
	document.getElementById("messages").append(element);
	return element;
}

async function pop(element) {
	await tween(280, (p) => (element.style.transform = `scale(${back_out(p)})`));
}

// Types into the message box, then sends it.
async function reply(text) {
	const composer = document.getElementById("composer");
	composer.classList.add("typing");
	composer.textContent = "";
	for (const character of text) {
		composer.textContent += character;
		await sleep(45);
	}
	await sleep(250);
	composer.classList.remove("typing");
	composer.textContent = "Aa";
	await pop(message(text, true));
}

// ---------- the cursor, captions and the popup ----------

const cursor = { x: 640, y: 470 };

function place_cursor() {
	document.getElementById("cursor").style.transform = `translate(${cursor.x - 5}px, ${cursor.y - 3}px)`;
}

async function move_to(x, y, ms = 380) {
	const from = { ...cursor };
	await tween(ms, (p, e) => {
		cursor.x = from.x + (x - from.x) * e;
		cursor.y = from.y + (y - from.y) * e;
		place_cursor();
	});
}

// A soft ring where the cursor clicks
async function ring() {
	const element = spawn("ring");
	await tween(280, (p) => {
		const size = 12 + 30 * p;
		element.style.width = element.style.height = `${size}px`;
		element.style.left = `${cursor.x - size / 2}px`;
		element.style.top = `${cursor.y - size / 2}px`;
		element.style.opacity = String(1 - p);
	});
	element.remove();
}

const frame = () => document.getElementById("popup");
const popup_doc = () => frame().contentDocument;
const $ = (selector) => popup_doc().querySelector(selector);
const chat_row = (name) => [...popup_doc().querySelectorAll(".chat-container")].find((row) => row.textContent.trim() === name);

// Where an element in the popup is on the stage.
function center_of(element) {
	const box = element.getBoundingClientRect();
	const offset = frame().getBoundingClientRect();
	return { x: offset.left + box.left + box.width / 2, y: offset.top + box.top + box.height / 2 };
}

// Scrolls the popup's chat list so `row` is in view.
async function show_row(row) {
	const list = $(".chats-list");
	const top = row.getBoundingClientRect().top - list.getBoundingClientRect().top + list.scrollTop;
	const target = top < list.scrollTop ? top - 4 : top + row.offsetHeight > list.scrollTop + list.clientHeight ? top + row.offsetHeight - list.clientHeight + 4 : null;
	if (target === null) return;
	const from = list.scrollTop;
	await tween(300, (p, e) => (list.scrollTop = from + (target - from) * e));
}

// Moves the cursor to an element of the popup and clicks it, the way a person would.
async function click(element, pause = 160) {
	if (element.classList.contains("chat-container")) await show_row(element);
	const point = center_of(element);
	await move_to(point.x, point.y);
	element.classList.add("video-hover");
	await sleep(60);
	element.classList.add("video-press");
	ring();
	await sleep(90);
	element.classList.remove("video-press", "video-hover");
	element.click();
	await sleep(pause);
}

async function pick(names) {
	for (const name of names) await click(chat_row(name), 90);
}

// When each caption showed, in seconds from the start, for the video's description (record.py prints them)
const started_at = Date.now();
window.caption_times = [];

async function caption(text) {
	window.caption_times.push({ second: (Date.now() - started_at) / 1000, text });
	const element = document.getElementById("caption");
	if (element.textContent) await tween(140, (p, e) => (element.style.transform = `scale(${1 - e})`));
	element.textContent = text;
	await tween(260, (p) => (element.style.transform = `scale(${back_out(p)})`));
}

async function type(text) {
	const input = $("#search-chats");
	for (const character of text) {
		input.value += character;
		input.dispatchEvent(new Event("input", { bubbles: true }));
		await sleep(90);
	}
}

function until_job_done() {
	return new Promise((resolve) => (stage.job_done = resolve));
}

// Clicks an action and waits for it to finish, with the spotlight on the chat list while it happens, then clears
// the summary.
async function act(button) {
	const done = until_job_done();
	await click(button, 0);
	await focus("list");
	await done;
	await sleep(400);
	await focus("popup");
	await click($("#job-close"), 200);
}

// ---------- the timeline ----------

async function run() {
	document.getElementById("rows").replaceChildren(...stage.chats.map(make_row));
	update_badge();
	place_cursor();
	message("Did you see my message?", false);

	// The problem: Mom's chat is buried
	await caption("Too many chats? Mom's message got buried.");
	await sleep(300);
	const mom_row = row_of(link_of("Mom"));
	await tween(300, (p) => (mom_row.style.background = `rgba(255, 216, 77, ${0.45 * p})`));
	await pop(message("Hello??", false));
	await sleep(1400);
	await tween(300, (p) => (mom_row.style.background = `rgba(255, 216, 77, ${0.45 * (1 - p)})`));
	mom_row.style.background = "";

	// Open it
	await caption("Open Batch Actions");
	const icon = document.getElementById("extension-icon").getBoundingClientRect();
	await move_to(icon.left + icon.width / 2, icon.top + icon.height / 2, 650);
	ring();
	document.getElementById("extension-icon").classList.add("open");
	const popup_frame = document.getElementById("popup-frame");
	await tween(300, (p) => {
		popup_frame.style.opacity = String(Math.min(1, p * 2));
		popup_frame.style.transform = `scale(${0.6 + 0.4 * back_out(p)})`;
	});
	await focus("popup");

	// Safe mode
	await caption("Pick the old chats you don't need");
	await pick(["Class of 2016", "Wedding planning 2022", "Old group project"]);
	await sleep(250);
	await caption("Safe mode archives them one by one");
	await sleep(250);
	await act($("[data-action='archive']"));

	// Fast mode
	await caption("Fast mode does them all at once");
	await sleep(250);
	await click($("[data-mode='fast']"), 250);
	await pick(["Pizza Palace", "Giveaway Page", "Gym Deals"]);
	await sleep(200);
	await act($("[data-action='archive']"));

	// Mute
	await caption("Mute the noisy groups");
	await sleep(250);
	await pick(["Neighborhood group", "Family reunion"]);
	await click($("[data-action='mute']"), 400);
	await click($("label[for='choice-2']"), 250);
	await click($(".popup-action"), 400);
	await click($("label[for='choice-4']"), 250);
	await act($(".popup-action"));
	await click($("[data-action='unselect-all']"), 250);

	// Search, select all, delete
	await caption("Find chats, then delete them all");
	await sleep(250);
	await click($("[data-action='search-chats']"), 200);
	await type("market");
	await sleep(500);
	await click($("[data-action='select-all']"), 500);
	await click($("[data-action='delete']"), 800);
	await act($(".popup-action"));
	// Out of sight behind the spotlight: the search goes back to the whole list
	const search = $("#search-chats");
	search.value = "";
	search.dispatchEvent(new Event("input", { bubbles: true }));
	search.classList.add("no-display");

	// The payoff: close the popup; the list is short, and Mom's chat is right there
	await caption("All clean. Now nothing gets lost.");
	const icon_again = document.getElementById("extension-icon").getBoundingClientRect();
	await move_to(icon_again.left + icon_again.width / 2, icon_again.top + icon_again.height / 2, 500);
	ring();
	document.getElementById("extension-icon").classList.remove("open");
	await tween(240, (p, e) => {
		popup_frame.style.opacity = String(1 - e);
		popup_frame.style.transform = `scale(${1 - 0.08 * e})`;
	});
	await focus("all");
	await move_to(700, 420, 400);
	const mom = row_of(link_of("Mom"));
	const above = [...document.querySelectorAll(".row")].slice(0, [...document.querySelectorAll(".row")].indexOf(mom));
	await tween(380, (p, e) => {
		mom.style.transform = `translateY(${-54 * above.length * e}px)`;
		above.forEach((row) => (row.style.transform = `translateY(${54 * e}px)`));
	});
	[mom, ...above].forEach((row) => (row.style.transform = ""));
	document.getElementById("rows").prepend(mom);
	mom.classList.add("is-unread");
	mom.querySelector(".preview").textContent = "Dinner on Sunday?";
	await pop(message("Dinner on Sunday?", false));
	await sleep(500);
	await reply("Yes! Sorry Mom, I see it now.");
	const sent = [...document.querySelectorAll(".msg.me")].at(-1).getBoundingClientRect();
	await confetti(sent.left + sent.width / 2, sent.top + sent.height / 2);
	await sleep(900);
	window.demo_finished = true;
}

addEventListener("load", () => run());
