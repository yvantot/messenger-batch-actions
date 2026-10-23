// Stands in for the browser's extension APIs when the popup (html/index.html) is drawn inside a store screenshot.
// The chats and what the popup shows come from the screenshot's scene (scenes.js, in the page around it), set up
// once the popup has its chats: chats picked, a job's progress, the mute window, or a search and its delete window.
(() => {
	const scene_name = new URLSearchParams(location.search).get("scene") ?? "select";
	const { SCENES, CHATS, COLORS, chat_link } = window.parent;
	const scene = SCENES[scene_name];
	const avatar = (name) =>
		"data:image/svg+xml," +
		encodeURIComponent(
			`<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="${COLORS[CHATS[name][1]]}"/><text x="32" y="42" font-family="Arial" font-size="28" font-weight="700" fill="#fff" text-anchor="middle">${name[0]}</text></svg>`,
		);
	const chats = scene.chats.map((name) => ({ link: chat_link(name), name, img: avatar(name) }));

	let send_to_popup = null;
	const port = {
		onMessage: { addListener: (f) => (send_to_popup = f) },
		onDisconnect: { addListener: () => {} },
		postMessage: () => {},
		disconnect: () => {},
	};
	window.chrome = {
		tabs: {
			query: async () => [{ id: 1, url: `https://www.${scene.address ?? "messenger.com"}/` }],
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
				get: async () => ({ mode: scene.mode ?? "safe", opens: 0 }),
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
			if (scene.picked && scene_name !== "delete") pick(scene.picked);
			if (scene.job) send_to_popup({ type: "job", job: { problems: [], stopping: false, seconds: 1, ...scene.job } });
			if (scene_name === "mute") {
				document.querySelector("[data-action='mute']").click();
				choose(2);
				document.querySelector(".popup-action").click();
				choose(4);
			}
			if (scene_name === "delete") {
				document.querySelector("[data-action='search-chats']").click();
				const input = document.getElementById("search-chats");
				input.value = "market";
				input.dispatchEvent(new Event("input", { bubbles: true }));
				document.querySelector("[data-action='select-all']").click();
				document.querySelector("[data-action='delete']").click();
			}
		}, 200),
	);
})();
