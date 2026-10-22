// Connects the page to the popup. The popup opens a port named "batch-actions"; while it's open, this sends the
// loaded chats whenever they change, and the job's progress. Requests from the popup:
//   { type: "list" }                               sends the chats again
//   { type: "run", action, links, options }        starts a job (see actions.js)
//   { type: "stop" }                               stops the job after the current chat
//   { type: "load_more" }                          scrolls Messenger's list so it loads more chats
//   { type: "report" }                             sends the page side of the report
//   { type: "job" }                                sends the job's progress again
const popup_ports = new Set();

function chats_message(chats = list_chats(), source = chats_source()) {
	return { type: "chats", chats, source };
}

function send_to_popups(message) {
	popup_ports.forEach((port) => {
		try {
			port.postMessage(message);
		} catch {
			popup_ports.delete(port);
		}
	});
}

// Answers a request from the popup (or the test bridge below) with `reply`.
function handle_request(request, reply) {
	switch (request?.type) {
		case "list":
			reply(chats_message());
			break;
		case "run": {
			const started = start_job(request);
			if (!started) reply({ type: "refused", reason: Job.current?.running ? "busy" : "invalid" });
			break;
		}
		case "stop":
			stop_job();
			break;
		case "load_more":
			load_more_chats().then(
				(ok) => reply({ type: "load_more", ok }),
				(error) => {
					log_error("loading more chats", error);
					reply({ type: "load_more", ok: false });
				},
			);
			break;
		case "report":
			reply({ type: "report", report: page_report() });
			break;
		case "job":
			reply({ type: "job", job: Job.current ? job_summary(Job.current) : null });
			break;
	}
}

Job.on_change = (job) => send_to_popups({ type: "job", job: job_summary(job) });

chrome.runtime.onConnect.addListener(
	guarded("popup connection", (port) => {
		if (port.name !== "batch-actions") return;
		popup_ports.add(port);
		ChatWatch.start((chats, source) => send_to_popups(chats_message(chats, source)));
		port.postMessage(chats_message());
		if (Job.current) port.postMessage({ type: "job", job: job_summary(Job.current) });
		port.onMessage.addListener(guarded("popup request", (request) => handle_request(request, (message) => port.postMessage(message))));
		port.onDisconnect.addListener(() => {
			popup_ports.delete(port);
			if (!popup_ports.size) ChatWatch.stop();
		});
	}),
);

// Layout rules from GitHub, as the background saved them; used as soon as they change.
Parts.use(null);
chrome.storage.local.get("page_rules").then(
	(saved) => Parts.use(saved.page_rules ?? null),
	(error) => log_error("reading layout rules", error),
);
chrome.storage.onChanged.addListener(
	guarded("layout rules changed", (changes, area) => {
		if (area === "local" && "page_rules" in changes) Parts.use(changes.page_rules.newValue ?? null);
	}),
);
// Lets the background check GitHub for newer rules, when its last check is old enough.
chrome.runtime.sendMessage({ message: "rules_check" }).catch(() => {});

// Copies loaded unpacked (for development, so with no update_url) also take requests from the page itself, so the
// actions can be tested on the live site without the popup. Two more requests are for development only:
//   { type: "reload_extension" }        reloads the extension from disk
//   { type: "try_rules", rules }        uses a rules file (as in rules/page-rules.json) on this page until it
//                                       reloads, to try a fix before pushing it; rules: null goes back
// Copies installed from the Chrome Web Store never listen.
if (!("update_url" in chrome.runtime.getManifest())) {
	window.addEventListener("batch-actions-test", (event) => {
		let request;
		try {
			request = JSON.parse(event.detail);
		} catch {
			return;
		}
		const reply = (message) =>
			window.dispatchEvent(new CustomEvent("batch-actions-test-reply", { detail: JSON.stringify(message) }));
		if (request?.type === "reload_extension") {
			chrome.runtime.sendMessage({ message: "dev_reload" }).catch(() => {});
		} else if (request?.type === "try_rules") {
			try {
				const rules = request.rules ? clean_page_rules(request.rules, chrome.runtime.getManifest().version) : null;
				Parts.use(rules);
				reply({ type: "try_rules", ok: true, skipped: rules?.skipped ?? 0 });
			} catch (error) {
				reply({ type: "try_rules", ok: false, error: error.message });
			}
		} else {
			handle_request(request, reply);
		}
	});
}
