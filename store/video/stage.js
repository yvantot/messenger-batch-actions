// The demo video: a Messenger-like page with Rick and Morty chats, the real popup in a frame, a cursor that clicks
// the popup's own buttons, and captions. stage.handle() plays Messenger's part for the popup (popup-stub.js):
// it sends the chats and runs the actions on this page. run() is the timeline; record.py steps the clock through it
// frame by frame. Open demo.html through record.py's server (or `python store/video/record.py --serve`) to watch.

const COLORS = ["#e8716b", "#5bb98c", "#6c8cf0", "#e3a94b", "#4bb4c9", "#b27be0", "#d9739f", "#7ca35a"];
const CHATS = [
	["Rick Sanchez", "Wubba lubba dub dub! · 2m", 4],
	["Morty Smith", "Aw geez, Rick... · 5m", 3],
	["Council of Ricks", "Mandatory meeting, all Ricks · 2d", 2],
	["Gazorpazorp Dating", "3 new matches near you! · 3d", 6],
	["Summer Smith", "Can you NOT · 20m", 5],
	["Interdimensional Cable", "Ball Fondlers season 2 is here · 1w", 7],
	["Beth Smith", "Dinner at 7, don't be late · 1h", 1],
	["Plumbus Factory", "Your plumbus has shipped · 1w", 0],
	["Jerry Smith", "Has anyone seen my... · 1h", 3],
	["Unity", "We should talk · 3w", 5],
	["Squanchy", "Party at my place, squanch! · 2w", 6],
	["Krombopulos Michael", "Oh boy, here I go · 1mo", 2],
	["Birdperson", "In bird culture, this is... · 2w", 1],
	["Blips and Chitz", "Double tickets weekend! · 4d", 7],
	["Mr. Poopybutthole", "Ooo-wee! · 3w", 0],
	["Tammy", "Hey, it's been a while · 1mo", 6],
];
const MORE_CHATS = [
	["Mr. Meeseeks", "I'm Mr. Meeseeks, look at me! · 1mo", 4],
	["Scary Terry", "You can run, but you can't hide · 2mo", 0],
	["Noob-Noob", "Thanks for the invite, guys · 2mo", 2],
	["Abradolf Lincler", "A complex being · 3mo", 7],
	["Pickle Rick fans", "I'm Pickle Riiiick! · 3mo", 1],
	["Evil Morty", "Seen · 4mo", 5],
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const ease = (p) => (p < 0.5 ? 4 * p * p * p : 1 - (-2 * p + 2) ** 3 / 2);

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
const make_chat = ([name, preview, color], i) => ({ link: `/t/${2000 + i}/`, name, preview, color });

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
		switch (request.type) {
			case "list":
				stage.send_chats();
				break;
			case "run":
				stage.run_job(request);
				break;
			case "load_more":
				sleep(900).then(() => {
					stage.chats.push(...MORE_CHATS.map((chat, i) => make_chat(chat, 100 + i)));
					render_rows();
					stage.send_chats();
					stage.send({ type: "load_more", ok: true });
				});
				break;
		}
	},

	async run_job({ action, links, mode }) {
		const job = { action, mode, total: links.length, position: 0, done: 0, problems: [], running: true, stopping: false, seconds: 0 };
		const started = Date.now();
		const update = () =>
			stage.send({ type: "job", job: { ...job, seconds: Math.max(1, Math.round((Date.now() - started) / 1000)) } });
		const apply = async (link) => {
			if (["archive", "delete", "leave"].includes(action)) await remove_row(link);
			if (action === "mute") stage.muted.add(link);
			if (action === "unmute") stage.muted.delete(link);
			render_rows();
			job.done++;
		};
		update();
		if (mode === "fast") {
			job.position = job.total;
			update();
			await sleep(800);
			await Promise.all(links.map(apply));
		} else {
			for (const link of links) {
				job.position++;
				update();
				await sleep(600);
				await apply(link);
				update();
			}
		}
		job.running = false;
		update();
		stage.job_done?.();
	},
};

// The popup's frame reaches it as window.parent.stage
window.stage = stage;

function render_rows() {
	const rows = document.getElementById("rows");
	rows.replaceChildren(
		...stage.chats.map((chat) => {
			const row = document.createElement("div");
			row.className = `row${stage.muted.has(chat.link) ? " is-muted" : ""}`;
			row.dataset.link = chat.link;
			row.innerHTML = `
				<span class="av" style="background: ${COLORS[chat.color]}">${chat.name[0]}</span>
				<div class="text"><div class="name"></div><div class="preview"></div></div>
				<svg class="muted" viewBox="0 -960 960 960"><path fill="currentColor" d="M160-200v-80h80v-280q0-33 8.5-65t25.5-61l60 60q-7 16-10.5 32.5T320-560v280h248L56-792l56-56 736 736-56 56-146-144H160Zm560-154-80-80v-126q0-66-47-113t-113-47q-26 0-50 8t-44 24l-58-58q20-16 43-28t49-18v-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v28q80 20 130 84.5T720-560v206Zm-276-50Zm36 324q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80Zm33-481Z"/></svg>`;
			row.querySelector(".name").textContent = chat.name;
			row.querySelector(".preview").textContent = chat.preview;
			return row;
		}),
	);
}

// Folds the chat's row away in Messenger's list, then drops it.
async function remove_row(link) {
	const row = document.querySelector(`.row[data-link="${link}"]`);
	if (row) {
		await tween(320, (p, e) => {
			row.style.opacity = String(1 - e);
			row.style.height = `${54 * (1 - e)}px`;
		});
	}
	stage.chats = stage.chats.filter((chat) => chat.link !== link);
	stage.send_chats();
}

// ---------- the cursor, captions and the popup ----------

const cursor = { x: 640, y: 420 };

function place_cursor() {
	const element = document.getElementById("cursor");
	element.style.transform = `translate(${cursor.x - 5}px, ${cursor.y - 3}px)`;
}

async function move_to(x, y, ms = 550) {
	const from = { ...cursor };
	await tween(ms, (p, e) => {
		cursor.x = from.x + (x - from.x) * e;
		cursor.y = from.y + (y - from.y) * e;
		place_cursor();
	});
}

async function ripple() {
	const element = document.getElementById("ripple");
	await tween(320, (p) => {
		const size = 16 + 34 * p;
		element.style.width = element.style.height = `${size}px`;
		element.style.left = `${cursor.x - size / 2}px`;
		element.style.top = `${cursor.y - size / 2}px`;
		element.style.opacity = String(1 - p);
	});
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
	await tween(420, (p, e) => (list.scrollTop = from + (target - from) * e));
}

// Moves the cursor to an element of the popup and clicks it, the way a person would.
async function click(element, pause = 260) {
	if (element.classList.contains("chat-container")) await show_row(element);
	const point = center_of(element);
	await move_to(point.x, point.y);
	element.classList.add("video-hover");
	await sleep(90);
	element.classList.add("video-press");
	ripple();
	await sleep(110);
	element.classList.remove("video-press", "video-hover");
	element.click();
	await sleep(pause);
}

async function pick(names) {
	for (const name of names) await click(chat_row(name), 160);
}

// When each caption showed, in seconds from the start, for the video's description (record.py prints them)
const started_at = Date.now();
window.caption_times = [];

async function caption(text) {
	window.caption_times.push({ second: (Date.now() - started_at) / 1000, text });
	const element = document.getElementById("caption");
	if (element.textContent) await tween(160, (p) => (element.style.opacity = String(1 - p)));
	element.textContent = text;
	await tween(220, (p) => (element.style.opacity = String(p)));
}

async function type(text) {
	const input = $("#search-chats");
	for (const character of text) {
		input.value += character;
		input.dispatchEvent(new Event("input", { bubbles: true }));
		await sleep(130);
	}
}

function until_job_done() {
	return new Promise((resolve) => (stage.job_done = resolve));
}

async function fade_card(id, show) {
	const card = document.getElementById(id);
	card.classList.remove("hidden");
	await tween(450, (p) => (card.style.opacity = String(show ? p : 1 - p)));
	if (!show) card.classList.add("hidden");
}

// ---------- the timeline ----------

async function run() {
	render_rows();
	place_cursor();
	await sleep(2600);
	await fade_card("title-card", false);

	// Open the popup
	await caption("Open it on messenger.com or facebook.com/messages");
	const icon = document.getElementById("extension-icon").getBoundingClientRect();
	await move_to(icon.left + icon.width / 2, icon.top + icon.height / 2, 800);
	ripple();
	document.getElementById("extension-icon").classList.add("open");
	await tween(240, (p, e) => {
		frame().style.opacity = String(e);
		frame().style.transform = `translateY(${(1 - e) * -8}px)`;
	});
	await sleep(900);

	// Safe mode
	await caption("Pick the chats you want gone");
	await pick(["Council of Ricks", "Gazorpazorp Dating", "Interdimensional Cable", "Plumbus Factory"]);
	await sleep(500);
	await caption("Safe mode does one chat at a time, and checks each one");
	let done = until_job_done();
	await click($("[data-action='archive']"));
	await done;
	await sleep(1300);
	await click($("#job-close"), 500);

	// Fast mode
	await caption("Fast mode does them all at once");
	await click($("[data-mode='fast']"), 500);
	await pick(["Unity", "Krombopulos Michael", "Birdperson"]);
	done = until_job_done();
	await click($("[data-action='archive']"));
	await done;
	await sleep(1300);
	await click($("#job-close"), 500);

	// Mute
	await caption("Mute for as long as you like");
	await pick(["Jerry Smith", "Squanchy"]);
	await click($("[data-action='mute']"), 600);
	await click($("label[for='choice-2']"), 350);
	await click($(".popup-action"), 600);
	await click($("label[for='choice-4']"), 400);
	done = until_job_done();
	await click($(".popup-action"));
	await done;
	await sleep(1400);
	await click($("#job-close"), 500);

	// Search, select all, load more
	await caption("Search, select all, and load older chats");
	$(".chats-list").scrollTop = 0;
	await click($("[data-action='search-chats']"), 300);
	await type("smith");
	await sleep(500);
	await click($("[data-action='select-all']"), 900);
	await click($("[data-action='unselect-all']"), 400);
	const input = $("#search-chats");
	input.value = "";
	input.dispatchEvent(new Event("input", { bubbles: true }));
	await click($("[data-action='search-chats']"), 400);
	await click($("button.load-more"));
	await sleep(1300);
	const list = $(".chats-list");
	const from = list.scrollTop;
	await tween(900, (p, e) => (list.scrollTop = from + (list.scrollHeight - list.clientHeight - from) * e));
	await sleep(900);
	await tween(700, (p, e) => (list.scrollTop = (list.scrollHeight - list.clientHeight) * (1 - e)));

	// Delete, with a confirm first
	await caption("Delete, leave or block, with a confirm first");
	await pick(["Blips and Chitz"]);
	await click($("[data-action='delete']"), 1200);
	done = until_job_done();
	await click($(".popup-action"));
	await done;
	await sleep(1300);
	await click($("#job-close"), 600);

	await caption("Private: nothing about your chats leaves your device");
	await sleep(2200);
	await fade_card("end-card", true);
	await sleep(3500);
	window.demo_finished = true;
}

addEventListener("load", () => run());
