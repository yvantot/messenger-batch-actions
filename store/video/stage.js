// The demo video: a Messenger-like page with Rick and Morty chats, the real popup in a frame, a cursor that clicks
// the popup's own buttons, comic captions, portals and sound-effect stamps. Rick and Morty talk in the open chat
// while things happen, so no second is spent on an intro or an outro. stage.handle() plays Messenger's part for the
// popup (popup-stub.js): it sends the chats and runs the actions on this page. run() is the timeline; record.py
// steps the clock through it frame by frame (`python store/video/record.py --serve` plays it live).

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
// Overshoots a little, then settles: things pop in like a comic
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

// Things that move every frame (spinning portals)
const animators = new Set();
(function animate() {
	animators.forEach((fn) => fn());
	setTimeout(animate, 16);
})();

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
				sleep(700).then(() => {
					const added = MORE_CHATS.map((chat, i) => make_chat(chat, 100 + i));
					stage.chats.push(...added);
					added.forEach((chat) => document.getElementById("rows").append(make_row(chat)));
					update_badge();
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
		update();
		if (mode === "fast") {
			job.position = job.total;
			update();
			await sleep(500);
			await effect_all(action, links);
			job.done = links.length;
		} else {
			for (const link of links) {
				job.position++;
				update();
				await sleep(300);
				await effect_one(action, link);
				job.done++;
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

function make_row(chat) {
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
}

const row_of = (link) => document.querySelector(`.row[data-link="${link}"]`);

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

function spawn(tag, className) {
	const element = document.createElement(tag);
	element.className = className;
	document.body.appendChild(element);
	return element;
}

// A spinning green portal centered on (x, y). grow() opens it, close() shuts it and removes it.
function open_portal(x, y, size) {
	const element = spawn("div", "portal");
	const portal = { scale: 0, angle: 0 };
	const draw = () => {
		element.style.width = element.style.height = `${size}px`;
		element.style.left = `${x - size / 2}px`;
		element.style.top = `${y - size / 2}px`;
		element.style.transform = `scale(${portal.scale}) rotate(${portal.angle}deg)`;
	};
	const spin = () => {
		portal.angle -= 7;
		draw();
	};
	animators.add(spin);
	portal.grow = (ms = 280) => tween(ms, (p) => ((portal.scale = back_out(p)), draw()));
	portal.close = async (ms = 220) => {
		await tween(ms, (p, e) => ((portal.scale = 1 - e), draw()));
		animators.delete(spin);
		element.remove();
	};
	return portal;
}

// A sound-effect word that pops in at (x, y), tilted, then fades.
async function stamp(text, x, y, { size = 60, angle = -8, hold = 550, color = "var(--yellow)" } = {}) {
	const element = spawn("div", "stamp");
	element.textContent = text;
	element.style.fontSize = `${size}px`;
	element.style.color = color;
	element.style.left = `${x - element.offsetWidth / 2}px`;
	element.style.top = `${y - element.offsetHeight / 2}px`;
	await tween(200, (p) => (element.style.transform = `rotate(${angle}deg) scale(${back_out(p)})`));
	await sleep(hold);
	await tween(180, (p) => (element.style.opacity = String(1 - p)));
	element.remove();
}

// Archive in Safe mode: a small portal opens at the end of the chat's row and sucks it in.
async function portal_row(link) {
	const row = row_of(link);
	const box = row.getBoundingClientRect();
	const portal = open_portal(box.right - 30, box.top + box.height / 2, 64);
	await portal.grow();
	stamp("BLORP!", box.right + 46, box.top + 6, { size: 38, angle: -12, hold: 260 });
	row.style.transformOrigin = "right center";
	await tween(340, (p, e) => {
		row.style.transform = `translateX(${e * 24}px) scale(${1 - e}) rotate(${-25 * e}deg)`;
		row.style.opacity = String(1 - 0.7 * e);
	});
	portal.close();
	await collapse([row]);
	forget([link]);
}

// Archive in Fast mode: one big portal swallows every chat at once.
async function portal_rows(links) {
	const rows = links.map(row_of);
	const boxes = rows.map((row) => row.getBoundingClientRect());
	const list = document.getElementById("rows").getBoundingClientRect();
	const center = { x: list.left + list.width / 2, y: boxes.reduce((sum, box) => sum + box.top + box.height / 2, 0) / boxes.length };
	const portal = open_portal(center.x, center.y, 190);
	await portal.grow(320);
	stamp("SHLOOOP!", center.x + 250, center.y - 40, { size: 64, angle: -6, hold: 500 });
	await tween(420, (p, e) =>
		rows.forEach((row, i) => {
			const dx = (center.x - (boxes[i].left + boxes[i].width / 2)) * e;
			const dy = (center.y - (boxes[i].top + boxes[i].height / 2)) * e;
			row.style.transform = `translate(${dx}px, ${dy}px) scale(${1 - e}) rotate(${-40 * e}deg)`;
		}),
	);
	portal.close(260);
	await collapse(rows);
	forget(links);
}

// Delete or leave: the row flashes, ZAP!, and it's gone.
async function zap_rows(links) {
	const rows = links.map(row_of);
	const box = rows[0].getBoundingClientRect();
	stamp("ZAP!", box.right + 50, box.top + 10, { size: 70, angle: 8, hold: 500 });
	const window_element = document.getElementById("window");
	await tween(300, (p) => {
		rows.forEach((row) => (row.style.background = `rgba(255, 225, 77, ${0.8 * (1 - p)})`));
		window_element.style.transform = `translate(${Math.sin(p * 40) * 5 * (1 - p)}px, 0)`;
	});
	await tween(220, (p, e) => rows.forEach((row) => ((row.style.transform = `scaleY(${1 - e})`), (row.style.opacity = String(1 - e)))));
	await collapse(rows);
	forget(links);
}

// Mute: the bell shows up on each row, SHHH!
async function mute_rows(links) {
	links.forEach((link) => {
		stage.muted.add(link);
		row_of(link)?.classList.add("is-muted");
	});
	const box = row_of(links[0]).getBoundingClientRect();
	await stamp("SHHH!", box.right + 70, box.top + 20, { size: 62, angle: -10, hold: 450, color: "#9fd4ff" });
}

async function effect_one(action, link) {
	if (action === "archive" || action === "unarchive") await portal_row(link);
	else if (action === "delete" || action === "leave") await zap_rows([link]);
	else if (action === "mute") await mute_rows([link]);
}

async function effect_all(action, links) {
	if (action === "archive" || action === "unarchive") await portal_rows(links);
	else if (action === "delete" || action === "leave") await zap_rows(links);
	else if (action === "mute") await mute_rows(links);
}

// ---------- Rick and Morty, in the open chat ----------

const PEOPLE = { rick: { initial: "R", color: "#4bb4c9" }, morty: { initial: "M", color: "#e3a94b" } };

// One message, with a moment of typing dots first. Morty is "me", on the right.
async function say(who, text) {
	const messages = document.getElementById("messages");
	const make = (content) => {
		const message = document.createElement("div");
		message.className = `msg${who === "morty" ? " me" : ""}`;
		message.innerHTML = `${who === "rick" ? `<span class="av" style="background: ${PEOPLE.rick.color}">R</span>` : ""}<div class="bubble"></div>`;
		message.querySelector(".bubble").textContent = content;
		messages.append(message);
		return message;
	};
	const dots = make("•••");
	dots.classList.add("dots");
	await sleep(380);
	dots.remove();
	const message = make(text);
	await tween(260, (p) => (message.style.transform = `scale(${back_out(p)})`));
}

// Several lines, one after another, without holding up the rest of the demo.
function talk(lines) {
	(async () => {
		for (const [who, text, pause] of lines) {
			await sleep(pause ?? 0);
			await say(who, text);
		}
	})();
}

// ---------- the cursor, captions and the popup ----------

const cursor = { x: 640, y: 470 };

function place_cursor() {
	document.getElementById("cursor").style.transform = `translate(${cursor.x - 6}px, ${cursor.y - 4}px)`;
}

async function move_to(x, y, ms = 420) {
	const from = { ...cursor };
	await tween(ms, (p, e) => {
		cursor.x = from.x + (x - from.x) * e;
		cursor.y = from.y + (y - from.y) * e;
		place_cursor();
	});
}

// A small comic burst where the cursor clicks.
async function burst() {
	const element = spawn("div", "burst");
	element.innerHTML = `<svg viewBox="-50 -50 100 100" width="70" height="70"><polygon points="${Array.from({ length: 16 }, (_, i) => {
		const r = i % 2 ? 22 : 46;
		const a = (Math.PI * i) / 8;
		return `${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}`;
	}).join(" ")}" fill="#ffe14d" stroke="#0d0d12" stroke-width="6" stroke-linejoin="round"/></svg>`;
	element.style.left = `${cursor.x - 35}px`;
	element.style.top = `${cursor.y - 35}px`;
	await tween(260, (p) => {
		element.style.transform = `scale(${0.3 + 0.9 * p}) rotate(${p * 30}deg)`;
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
async function click(element, pause = 180) {
	if (element.classList.contains("chat-container")) await show_row(element);
	const point = center_of(element);
	await move_to(point.x, point.y);
	element.classList.add("video-hover");
	await sleep(60);
	element.classList.add("video-press");
	burst();
	await sleep(90);
	element.classList.remove("video-press", "video-hover");
	element.click();
	await sleep(pause);
}

async function pick(names) {
	for (const name of names) await click(chat_row(name), 100);
}

// When each caption showed, in seconds from the start, for the video's description (record.py prints them)
const started_at = Date.now();
window.caption_times = [];

async function caption(number, text) {
	window.caption_times.push({ second: (Date.now() - started_at) / 1000, text: `${number}. ${text}` });
	const element = document.getElementById("caption");
	document.getElementById("caption-number").textContent = String(number);
	document.getElementById("caption-text").textContent = text;
	await tween(240, (p) => (element.style.transform = `rotate(-1.5deg) scale(${back_out(p)})`));
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

// ---------- the timeline ----------

async function run() {
	document.getElementById("rows").replaceChildren(...stage.chats.map(make_row));
	update_badge();
	place_cursor();
	document.getElementById("caption").style.transform = "scale(0)";

	talk([
		["morty", "Aw geez Rick, I've got like a hundred chats!", 150],
		["rick", "There's an extension for that, Morty. *burp*", 500],
	]);

	// 1. Open it, pick the junk
	await sleep(1300);
	await caption(1, "Pick the junk");
	const icon = document.getElementById("extension-icon").getBoundingClientRect();
	await move_to(icon.left + icon.width / 2, icon.top + icon.height / 2, 650);
	burst();
	document.getElementById("extension-icon").classList.add("open");
	const popup_frame = document.getElementById("popup-frame");
	await tween(300, (p) => {
		popup_frame.style.opacity = String(Math.min(1, p * 2));
		popup_frame.style.transform = `scale(${0.6 + 0.4 * back_out(p)})`;
	});
	await pick(["Council of Ricks", "Gazorpazorp Dating", "Interdimensional Cable", "Plumbus Factory"]);

	// 2. Safe mode
	await caption(2, "Safe mode: one chat at a time");
	let done = until_job_done();
	await click($("[data-action='archive']"));
	talk([
		["morty", "Whoa! Where'd they go?", 1200],
		["rick", "Archived, Morty. Still there if you need 'em.", 300],
	]);
	await done;
	await sleep(700);
	await click($("#job-close"), 250);

	// 3. Fast mode
	await caption(3, "Fast mode: all at once");
	await click($("[data-mode='fast']"), 250);
	await pick(["Unity", "Krombopulos Michael", "Birdperson"]);
	done = until_job_done();
	await click($("[data-action='archive']"));
	await done;
	talk([["rick", "That's science, Morty.", 0]]);
	await sleep(700);
	await click($("#job-close"), 250);

	// 4. Mute
	await caption(4, "Mute anyone. Yes, even Jerry.");
	await pick(["Jerry Smith", "Squanchy"]);
	await click($("[data-action='mute']"), 350);
	await click($("label[for='choice-2']"), 200);
	await click($(".popup-action"), 350);
	await click($("label[for='choice-4']"), 200);
	done = until_job_done();
	await click($(".popup-action"));
	await done;
	await sleep(500);
	await click($("#job-close"), 250);
	await click($("[data-action='unselect-all']"), 200);

	// 5. Search and load more
	await caption(5, "Search, and load older chats");
	await click($("[data-action='search-chats']"), 150);
	await type("smith");
	await sleep(700);
	const input = $("#search-chats");
	input.value = "";
	input.dispatchEvent(new Event("input", { bubbles: true }));
	await click($("[data-action='search-chats']"), 150);
	await click($("button.load-more"), 100);
	await sleep(800);
	const load_more = center_of($("button.load-more"));
	stamp("MORE!", load_more.x - 240, load_more.y - 60, { size: 54, angle: 7, hold: 450 });
	const list = $(".chats-list");
	const from = list.scrollTop;
	await tween(700, (p, e) => (list.scrollTop = from + (list.scrollHeight - list.clientHeight - from) * e));
	await sleep(500);
	await tween(500, (p, e) => (list.scrollTop = (list.scrollHeight - list.clientHeight) * (1 - e)));

	// 6. Delete
	await caption(6, "Delete for good. It asks first.");
	await pick(["Blips and Chitz"]);
	await click($("[data-action='delete']"), 800);
	done = until_job_done();
	await click($(".popup-action"));
	await done;

	// The payoff, then stop
	await say("morty", "My inbox is actually clean!");
	await say("rick", "Wubba lubba dub dub!");
	await sleep(1200);
	window.demo_finished = true;
}

addEventListener("load", () => run());
