# Layout rules

`page-rules.json` is downloaded by Messenger Batch Actions when it's installed or updated, and then whenever a
Messenger tab or the popup opens and the last check is more than 6 hours old. It's how a fix for a Messenger
layout change reaches people before the next release goes through the Chrome Web Store.

It's data only. Each part of the page the extension works with (see `PAGE_PARTS` in `js/shared/page-parts.js`)
has built-in ways to find it, which are CSS selectors, and each chat menu item (see `MENU_ACTIONS`) has built-in
icons and English labels. The rules add to those, or replace a part's ways. They never contain code.

## Format

```json
{
	"format": 1,
	"version": "2026-11-03",
	"minVersion": "1.1.0",
	"maxVersion": "1.1.9",
	"parts": {
		"menu_button": ["div[aria-label^='More options']"],
		"chat_list": { "ways": ["div[role='grid']"], "replace": true }
	},
	"actions": {
		"archive": { "icons": ["M12 3a9 9 0 1 0 0 18z"], "labels": ["archive", "archivar"] }
	}
}
```

- `version`: any short text; change it with every edit. The report in the popup shows it.
- `minVersion`, `maxVersion` (optional): the versions of the extension the rules are for. Set `maxVersion` once a
  release has the fix built in. Rules that don't fit a version are dropped by it.
- `parts`: a list of ways goes in front of the built-in ones. `{ "ways": [...], "replace": true }` is used
  instead of them, for a built-in way that now finds the wrong thing. Up to 8 ways per part, 300 characters each.
  A way with `{ } ; @ \ <` or a comment is skipped, and so is one the browser can't read; the report says so.
- `actions`: `icons` are the `d` attribute of the menu item's SVG path (copy it from the page with DevTools);
  `labels` are how the item's text starts, in any language, matched without caring about case. Both go in front
  of the built-in ones.
- Parts and actions a version doesn't know are skipped, so rules for newer versions don't break older ones.

## Shipping a fix

1. On the changed page, find what no longer matches: the popup's **Report issues** copies a report that says
   which parts were found and how.
2. Find selectors or icons that work, and add them here with a new `version`. `node tests/run.js` checks this file.
3. Commit and push to `main`. GitHub serves the new file within a few minutes; people get it within 6 hours, or
   right away from **Report issues > Check for fixes**.
4. In the next release, add the same ways to `js/shared/page-parts.js`, then set `maxVersion` here or remove the
   rules.
