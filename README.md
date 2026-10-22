# Messenger Batch Actions

Chrome extension that archives, unarchives, deletes, mutes, unmutes, blocks or leaves many Messenger chats at
once, on messenger.com and facebook.com/messages.
[Chrome Web Store](https://chromewebstore.google.com/detail/fhedcmcogemcndkjkoaojkdggfmpbmkk)

## How it works

- `js/shared/page-parts.js`: the parts of Messenger's page it uses (chat list, rows, menu button, menus,
  windows), each with built-in ways to find it, best first; and the chat menu's items, found by icon, then by
  English label.
- `js/content/`: runs on Messenger. `actions.js` does the chosen action on one chat at a time, the way a person
  would, and checks that Messenger did it. `main.js` talks to the popup over a port: it sends the loaded chats
  whenever they change, and the job's progress.
- `js/index.js`: the popup.
- `js/background.js`: downloads `rules/page-rules.json` from this repo's `main` branch, so a fix for a Messenger
  change reaches people without a store release. See [rules/README.md](rules/README.md).

When something breaks, the popup's **Report issues > Copy a report** says which parts were found and how, with no
chat names.

## Developing

`node tests/run.js` runs the tests (Node 20 or newer, no dependencies).

Load the folder unpacked in `chrome://extensions`. Unpacked copies take requests from the Messenger page itself,
so the actions can be tested from DevTools without the popup (store installs never listen):

```js
const ask = (request) => new Promise((resolve) => {
	addEventListener("batch-actions-test-reply", (e) => resolve(JSON.parse(e.detail)), { once: true });
	dispatchEvent(new CustomEvent("batch-actions-test", { detail: JSON.stringify(request) }));
});
await ask({ type: "list" });                                        // the loaded chats
await ask({ type: "run", action: "mute", links: ["/t/123/"], options: { mute_type: 0, mute_time: 0 } });
await ask({ type: "job" });                                         // progress
await ask({ type: "report" });
await ask({ type: "try_rules", rules: { format: 1, version: "try", parts: {} } });  // try a fix before pushing it
dispatchEvent(new CustomEvent("batch-actions-test", { detail: '{"type":"reload_extension"}' }));  // reload from disk
```

After reloading the extension, reload the Messenger tab too.
