// The store screenshots' scenes: made-up chats, and what each screenshot shows. A screenshot page sets
// <body data-scene="...">; this draws its headline and its Messenger, and the popup (with stub.js) reads the same
// scene, so the two always match.
const CHATS = {
	"Class of 2016": ["Reunion photos are up!", 2],
	"Wedding planning 2022": ["Final seating chart", 5],
	"Neighborhood group": ["Whose cat is this?", 7],
	"Old group project": ["final_final_v3.pptx", 9],
	"Pizza Palace": ["50% off tonight only!", 0],
	"Family reunion": ["Photo dump!!", 1],
	"Giveaway Page": ["You won! Claim your prize", 3],
	"Gym Deals": ["Your free trial ends soon", 4],
	"Marketplace: old bike": ["Is this still available?", 8],
	Mom: ["Dinner on Sunday?", 6],
	"Marketplace: blue sofa": ["Can you do $50?", 8],
	Sam: ["Coffee tomorrow?", 4],
	"Marketplace: lamp": ["I'll pick it up today", 8],
	"Work team": ["Meeting moved to 3pm", 2],
	Dad: ["Did you get my email?", 1],
};
const COLORS = ["#ff8a65", "#4db6ac", "#7986cb", "#ffb74d", "#4fc3f7", "#ba68c8", "#f48fb1", "#81c784", "#a1887f", "#90a4ae"];
const ORDER = Object.keys(CHATS);
const without = (names) => ORDER.filter((name) => !names.includes(name));

const SCENES = {
	select: {
		headline: "Archive many Messenger chats at once",
		subline: "Pick the chats, pick the action. On messenger.com and facebook.com/messages.",
		chats: ORDER,
		picked: ["Class of 2016", "Wedding planning 2022", "Old group project"],
	},
	progress: {
		headline: "Safe mode: one Messenger chat at a time",
		subline: "It checks each chat, and keeps going if you close the popup.",
		chats: without(["Class of 2016"]),
		picked: ["Wedding planning 2022", "Old group project"],
		leaving: ["Wedding planning 2022"],
		job: { action: "archive", mode: "safe", total: 3, position: 2, done: 1, running: true },
	},
	fast: {
		headline: "Fast mode: many Messenger chats at once",
		subline: "Archive, mute or delete everything you picked in a second or two.",
		chats: without(["Pizza Palace", "Giveaway Page", "Gym Deals"]),
		mode: "fast",
		job: { action: "archive", mode: "fast", total: 3, position: 3, done: 3, running: false },
	},
	mute: {
		headline: "Mute noisy Messenger groups",
		subline: "For 15 minutes, 8 hours, or until you turn it back on.",
		chats: ORDER,
		picked: ["Neighborhood group", "Family reunion"],
	},
	delete: {
		address: "facebook.com/messages",
		headline: "Find and delete old chats, on Facebook too",
		subline: "Search, select all, delete. It asks before anything is gone.",
		chats: ["Marketplace: old bike", "Mom", "Marketplace: blue sofa", "Sam", "Marketplace: lamp", "Work team", "Dad", "Class of 2016"],
		picked: ["Marketplace: old bike", "Marketplace: blue sofa", "Marketplace: lamp"],
		mode: "fast",
	},
};

const chat_link = (name) => `/t/${1000 + ORDER.indexOf(name)}/`;

// The popup's frame reads these as window.parent.*
Object.assign(window, { SCENES, CHATS, COLORS, chat_link });

function draw_scene() {
	// Pages without a Messenger of their own (the marquee tile) only lend the scene to their popup
	if (!document.querySelector(".headline")) return;
	const scene = SCENES[document.body.dataset.scene];
	document.querySelector(".headline h1").textContent = scene.headline;
	document.querySelector(".headline p").textContent = scene.subline;
	document.querySelector(".address").textContent = scene.address ?? "messenger.com";
	const rows = document.getElementById("rows");
	// Only rows that fit whole in the window
	for (const name of scene.chats.slice(0, 7)) {
		const [preview, color] = CHATS[name];
		const row = document.createElement("div");
		row.className = "row";
		if (scene.picked?.includes(name)) row.classList.add("picked");
		if (scene.leaving?.includes(name)) row.classList.add("leaving");
		row.innerHTML = `<span class="av" style="background: ${COLORS[color]}">${name[0]}</span><div class="text"><div class="name"></div><div class="preview"></div></div>`;
		row.querySelector(".name").textContent = name;
		row.querySelector(".preview").textContent = preview;
		rows.append(row);
	}
}

addEventListener("DOMContentLoaded", draw_scene);
