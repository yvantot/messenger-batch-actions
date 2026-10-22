// Stands in for the browser's extension APIs when the popup (html/index.html) runs inside the demo video
// (store/video/demo.html). The "Messenger" the popup talks to is the demo page around it (stage.js).
(() => {
	const stage = window.parent.stage;
	let to_popup = null;
	const port = {
		onMessage: { addListener: (f) => (to_popup = f) },
		onDisconnect: { addListener: () => {} },
		postMessage: (message) => stage.handle(JSON.parse(JSON.stringify(message))),
		disconnect: () => {},
	};
	stage.attach((message) => to_popup?.(message));

	window.chrome = {
		tabs: {
			query: async () => [{ id: 1, url: "https://www.messenger.com/" }],
			connect: () => {
				setTimeout(() => stage.send_chats(), 10);
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
		storage: { local: { get: async () => ({ mode: "safe", opens: 0 }), set: async () => {} } },
		scripting: { executeScript: async () => [] },
	};

	// Everything moves on the demo's clock, so no CSS animations; .video-press shows a click on a button
	addEventListener("DOMContentLoaded", () => {
		const style = document.createElement("style");
		style.textContent = `
			*, *::before, *::after { animation: none !important; transition: none !important; }
			.video-press { filter: brightness(1.35); transform: scale(0.97); }
			.video-hover { background-color: var(--light-bg) !important; }`;
		document.head.appendChild(style);
	});
})();
