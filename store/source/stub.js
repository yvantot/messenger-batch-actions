// Stands in for the browser's extension APIs when the popup (html/index.html) is drawn for the store images, with
// made-up chats. ?scene= picks what the popup shows:
//   select     chats picked, ready to act on
//   progress   Safe mode archiving, part way
//   fast       Fast mode, after archiving 12 chats
//   mute       the "Mute for?" window
//   report     the Report issues window
(() => {
	const scene = new URLSearchParams(location.search).get("scene") ?? "select";
	const COLORS = ["#e8716b", "#5bb98c", "#6c8cf0", "#e3a94b", "#4bb4c9", "#b27be0", "#d9739f", "#7ca35a"];
	const avatar = (name, i) =>
		"data:image/svg+xml," +
		encodeURIComponent(
			`<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="${COLORS[i % COLORS.length]}"/><text x="32" y="42" font-family="Arial" font-size="28" font-weight="700" fill="#fff" text-anchor="middle">${name[0]}</text></svg>`,
		);
	const NAMES = [
		"Mom",
		"Book club",
		"Promo deals",
		"Alex Rivera",
		"Old group project",
		"Marketplace: desk chair",
		"Weekend trip",
		"Raffle 2025",
		"Sam Lee",
		"Giveaway page",
		"Class of 2026",
		"Jordan",
		"Gym buddies",
		"Event volunteers",
		"Taylor",
	];
	const chats = NAMES.map((name, i) => ({ link: `/t/${1000 + i}/`, name, img: avatar(name, i) }));
	const PICKED = ["Promo deals", "Old group project", "Marketplace: desk chair", "Raffle 2025", "Giveaway page", "Event volunteers"];

	let send_to_popup = null;
	const port = {
		onMessage: { addListener: (f) => (send_to_popup = f) },
		onDisconnect: { addListener: () => {} },
		postMessage: () => {},
		disconnect: () => {},
	};
	window.chrome = {
		tabs: {
			query: async () => [{ id: 1, url: "https://www.messenger.com/" }],
			connect: () => {
				setTimeout(() => send_to_popup?.({ type: "chats", chats, source: "Chats List" }), 10);
				return port;
			},
			create: async () => {},
			update: async () => {},
			reload: async () => {},
		},
		runtime: {
			sendMessage: async () => null,
			getManifest: () => ({ version: "1.1.0", content_scripts: [{ js: [] }] }),
		},
		storage: {
			local: {
				get: async () => ({ mode: scene === "fast" ? "fast" : "safe", opens: 0 }),
				set: async () => {},
			},
		},
		scripting: { executeScript: async () => [] },
	};

	// Still images: windows and progress bars drawn in their final place, not part way through an animation
	addEventListener("DOMContentLoaded", () => {
		const style = document.createElement("style");
		style.textContent = "*, *::before, *::after { animation: none !important; transition: none !important; }";
		document.head.appendChild(style);
	});

	// Sets the scene up once the popup has its chats
	const pick = (names) =>
		document.querySelectorAll(".chat-container").forEach((row) => {
			if (names.includes(row.textContent.trim())) row.click();
		});
	const choose = (index) => {
		document.getElementById(`choice-${index}`).checked = true;
		document.querySelector(".choices").dispatchEvent(new Event("change", { bubbles: true }));
	};
	addEventListener("load", () =>
		setTimeout(() => {
			if (scene === "select") pick(PICKED);
			if (scene === "progress") {
				pick(PICKED);
				send_to_popup({
					type: "job",
					job: { action: "archive", mode: "safe", total: 6, position: 4, done: 3, problems: [], running: true, stopping: false, seconds: 3 },
				});
			}
			if (scene === "fast") {
				send_to_popup({ type: "chats", chats: chats.filter((chat) => !PICKED.includes(chat.name)), source: "Chats List" });
				send_to_popup({
					type: "job",
					job: { action: "archive", mode: "fast", total: 6, position: 6, done: 6, problems: [], running: false, stopping: false, seconds: 1 },
				});
			}
			if (scene === "mute") {
				pick(["Book club", "Class of 2026", "Gym buddies"]);
				document.querySelector("[data-action='mute']").click();
				choose(2);
				document.querySelector(".popup-action").click();
				choose(2);
			}
			if (scene === "report") document.getElementById("issues").click();
		}, 200),
	);
})();
