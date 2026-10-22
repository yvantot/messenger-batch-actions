// What Batch Actions noticed on this page since it loaded, for the report people can copy from the popup: parts
// found by a backup way or not found, the layout rules in use, and errors. It stays in this tab's memory, and
// nothing about chats goes in it: no names, messages or links.
const REPORT_LOG_SIZE = 40;
const report_log = [];

// Adds a line to the log, or counts it again if it's the last line already.
function log_event(kind, text) {
	const last = report_log.at(-1);
	if (last && last.kind === kind && last.text === text) {
		last.count++;
		last.at = Date.now();
		return;
	}
	report_log.push({ kind, text, at: Date.now(), count: 1 });
	if (report_log.length > REPORT_LOG_SIZE) report_log.shift();
}

// Logs an error from Batch Actions' own code: its kind, message and file, with long numbers (chat ids) cut out.
function log_error(where, error) {
	const file = String(error?.stack ?? "").match(/js\/[\w/-]+\.js:\d+/)?.[0];
	const text = `${where}: ${error?.name ?? "Error"}: ${error?.message ?? error}${file ? ` (${file})` : ""}`;
	log_event("error", text.replace(/\d{5,}/g, "…").slice(0, 300));
	console.warn("Messenger Batch Actions:", error);
}

// Wraps `fn` so an error in it is logged instead of stopping the content script.
function guarded(where, fn) {
	return (...args) => {
		try {
			const result = fn(...args);
			if (result instanceof Promise) return result.catch((error) => log_error(where, error));
			return result;
		} catch (error) {
			log_error(where, error);
		}
	};
}

// The page side of the report: which parts are found and how, and the log. The popup adds the version, the
// rules check and the browser.
function page_report() {
	// Look up the parts that are always on the page, so their status is current
	const list = Parts.first("chat_list");
	if (!list) Parts.missing("chat_list");
	else {
		const row = Parts.first("chat_row", list);
		const link = Parts.first("chat_link", row ?? list);
		if (link) Parts.first("chat_name", link);
		if (row && !Parts.first("menu_button", row)) Parts.missing("menu_button");
	}
	return {
		site: location.hostname,
		page: chats_source(),
		rules: Parts.rules_version,
		parts: Object.entries(PAGE_PARTS).map(([name, part]) => `${part.label}: ${describe_status(Parts.status[name])}`),
		last_job: Job.current ? job_summary(Job.current, false) : null,
		log: report_log.map((entry) => {
			const time = new Date(entry.at).toISOString().slice(11, 19);
			return `${time} ${entry.kind}: ${entry.text}${entry.count > 1 ? ` (×${entry.count})` : ""}`;
		}),
	};
}
