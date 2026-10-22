// Reading Messenger's chat list: which chats are loaded, finding a chat's row, loading more, and noticing changes.

function chats_source() {
	const url = location.pathname;
	if (url.includes("/archived")) return "Archived";
	if (url.includes("/requests")) return "Requests";
	if (url.includes("/marketplace")) return "Marketplace";
	if (url.includes("/c/")) return "Communities";
	return "Chats List";
}

// The chat links in the list, one per chat, in the list's order.
function chat_links() {
	const list = Parts.first("chat_list");
	if (!list) return null;
	const rows = Parts.all("chat_row", list);
	const links = rows.length
		? rows.map((row) => Parts.first("chat_link", row))
		: Parts.all("chat_link", list);
	// The same chat can show up twice while Messenger re-renders the list
	const seen = new Set();
	return links.filter((link) => {
		const href = link?.getAttribute("href");
		if (!href || seen.has(href)) return false;
		seen.add(href);
		return true;
	});
}

// The loaded chats as { link, name, img }, or null when the chat list isn't on the page. `link` is the path,
// as in the page ("/t/123/", "/messages/e2ee/t/123/"), and is what the popup sends back to pick chats.
function list_chats() {
	const links = chat_links();
	if (!links) return null;
	return links.map((link) => ({
		link: link.getAttribute("href"),
		name: (Parts.first("chat_name", link)?.textContent ?? "").trim() || "Unnamed chat",
		img: link.querySelector("img")?.src ?? "",
	}));
}

function find_chat_link(href) {
	return chat_links()?.find((link) => link.getAttribute("href") === href) ?? null;
}

// The row of the chat at `href`: what holds its link and its menu button.
function find_row(href) {
	const link = find_chat_link(href);
	if (!link) return null;
	return Parts.closest(link, "chat_row") ?? link.parentElement;
}

// Scrolls the chat list to its end, so Messenger loads more chats. Resolves with whether more chats came.
async function load_more_chats() {
	const list = Parts.first("chat_list");
	if (!list) return false;
	const before = chat_links()?.length ?? 0;
	const scrolls = (element) =>
		element.scrollHeight > element.clientHeight + 5 && /(auto|scroll)/.test(getComputedStyle(element).overflowY);
	let scroller = [list, ...list.querySelectorAll("div")].find(scrolls);
	for (let element = list.parentElement; !scroller && element; element = element.parentElement) {
		if (scrolls(element)) scroller = element;
	}
	if (!scroller) return false;
	scroller.scrollTop = scroller.scrollHeight;
	// The first load after the page opens can take several seconds
	return Boolean(await wait_for(() => (chat_links()?.length ?? 0) > before, 8000));
}

// Calls `callback(chats, source)` when the loaded chats or the list being shown change, while watching.
const ChatWatch = {
	observer: null,
	timer: null,
	last: "",
	callback: null,

	start(callback) {
		ChatWatch.callback = callback;
		if (ChatWatch.observer) return;
		ChatWatch.last = "";
		ChatWatch.observer = new MutationObserver(() => {
			if (ChatWatch.timer !== null) return;
			ChatWatch.timer = setTimeout(ChatWatch.check, 400);
		});
		ChatWatch.observer.observe(document.body, { childList: true, subtree: true });
	},

	stop() {
		ChatWatch.observer?.disconnect();
		ChatWatch.observer = null;
		clearTimeout(ChatWatch.timer);
		ChatWatch.timer = null;
	},

	check: guarded("watching chats", () => {
		ChatWatch.timer = null;
		const chats = list_chats();
		const source = chats_source();
		const key = JSON.stringify([source, chats]);
		if (key === ChatWatch.last) return;
		ChatWatch.last = key;
		ChatWatch.callback?.(chats, source);
	}),
};
