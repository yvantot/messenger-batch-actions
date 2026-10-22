# Chrome Web Store listing

Everything to fill in the [developer dashboard](https://chrome.google.com/webstore/devconsole), tab by tab, for the 1.1.0
update. The images are in `store/media/`. To redraw them after a popup change, run `python store/render.py`; after a
logo change (`assets/logo.svg`), add `--icons` to redraw the extension's icons too.

## Package

1. Run `node tests/run.js`. Every test should pass.
2. Commit, then build the zip from the committed files. It leaves out `tests/`, `rules/` (downloaded from GitHub, not
   shipped), `store/` and the docs:

   ```
   git archive --format=zip -o messenger-batch-actions-1.1.0.zip HEAD manifest.json assets css html js
   ```

3. In the dashboard, open the item, **Package > Upload new package**, and pick the zip.

The listing's name and summary come from `manifest.json`:

- **Name:** Messenger Batch Actions
- **Summary:** Archive, mute, delete or leave many Messenger chats at once, on messenger.com and facebook.com/messages.

## Store listing

**Description**

```
Clean up your Messenger in a few clicks. Pick the chats, pick the action, and Messenger Batch Actions does the rest, on messenger.com and facebook.com/messages.

Do any of these to many chats at once:
• Archive and unarchive
• Mute (messages, calls or both, for 15 minutes up to until you turn it back on) and unmute
• Delete
• Leave group chats
• Block or unblock

How it works:
• Open Messenger, click the extension's icon, and pick chats from your list. Search, sort, select all, or load older chats.
• Safe mode (the default) does one chat at a time and checks each one. You see the progress, which chats didn't work and why, and you can stop at any time.
• Fast mode does every chat at once, for when you have a lot to clear.
• It keeps going if you close the popup.

Ready for Messenger's changes: fixes for Messenger's page arrive from the project's GitHub page, without waiting for an update. If something still doesn't work, Report issues checks for fixes, or copies a report (with no chat names) for your email.

Private: nothing about you or your chats leaves your device. No data is collected, sold or shared. Free, with no ads.

New in 1.1: works with Messenger's latest page again, Safe and Fast modes, live progress, a bigger popup, and fixes that arrive without an update.

Messenger Batch Actions isn't made by or affiliated with Meta.
```

**Category:** keep the current one.

**Language:** English

**Graphic assets**

| Field | File |
|---|---|
| Store icon (128x128) | `store/media/icon-128.png` |
| Screenshots (1280x800), in this order | `screenshot-1.png` to `screenshot-5.png` |
| Small promo tile (440x280) | `store/media/promo-small.png` |
| Marquee promo tile (1400x560, optional) | `store/media/promo-marquee.png` |
| Promo video | the YouTube link of `store/video/demo.mp4` (see below) |

Remove the old screenshots before adding these, so the new popup is what people see.

**Promo video.** The store only takes a YouTube link. Upload `store/video/demo.mp4` (made by
`python store/video/record.py`) to YouTube, as Public or Unlisted, then paste its link. On YouTube:

- **Title:** Messenger Batch Actions: archive, mute or delete many Messenger chats at once
- **Description:**

  ```
  Messenger Batch Actions is a free Chrome extension that archives, unarchives, mutes, unmutes, deletes, leaves or blocks many Messenger chats at once, on messenger.com and facebook.com/messages.

  In this demo:
  0:00 Pick the chats
  0:06 Safe mode: one chat at a time, each one checked
  0:14 Fast mode: all at once
  0:22 Mute anyone (yes, even Jerry)
  0:31 Search, and load older chats
  0:37 Delete for good, with a confirm first

  Nothing about your chats leaves your device. Not made by or affiliated with Meta. Chat names are from Rick and Morty, for fun.
  ```

- **Audience:** not made for kids. The video has no sound; YouTube Studio's free Audio Library can add music.

**Homepage URL:** https://github.com/yvantot/messenger-batch-actions

**Support URL:** leave empty; the extension's Report issues gives the email, yvantot.code@gmail.com.

**Mature content:** off

## Privacy practices

**Single purpose**

```
Messenger Batch Actions does one action (archive, unarchive, mute, unmute, delete, leave or block) on many Messenger chats at once, on messenger.com and facebook.com/messages.
```

**Permission justifications**

| Permission | Justification |
|---|---|
| `storage` | Saves the choice of Safe or Fast mode, the layout rules downloaded from the project's GitHub page and when they were last checked, and how many times the popup was opened (to ask for a review at most once a month). No chat data is stored. |
| `activeTab` | When you click the extension's icon, lets the popup check whether the current tab is Messenger, and connect to it. |
| `scripting` | If Messenger was already open when the extension was installed or updated, adds the extension's script to that tab after you click the icon, so you don't have to reload Messenger. |
| Host permission (messenger.com, facebook.com/messages) | The extension's script runs on these pages only: it reads the chat list to show it in the popup, and does the chosen action on the chats you pick, through Messenger's own menus. |

**Remote code:** No, I am not using remote code.

```
All code is in the package. The extension downloads one JSON file of CSS selectors and icon shapes from the project's GitHub page (rules/page-rules.json), so it keeps working when Messenger changes its page. It's data the extension reads, never run as code.
```

**Data usage.** The store counts data an extension reads on the device as "handled", even when nothing is saved or sent, so tick:

- **Personally identifiable information:** the names in your chat list, read from Messenger to show them in the popup. Kept in memory only.
- **Website content:** chat names, picture links and addresses read from Messenger's chat list.

Then tick all three statements: not sold to third parties, not used or transferred for purposes unrelated to the single purpose, not used to determine creditworthiness or for lending.

**Privacy policy URL:** https://github.com/yvantot/messenger-batch-actions/blob/main/PRIVACY.md

## Test instructions (for the reviewer)

```
Needs a Facebook account. Open messenger.com (or facebook.com/messages), click the extension's icon, pick a few chats in the popup, and click Archive. Archived chats leave the list; open Messenger's Archived chats and use Unarchive to bring them back. Mute and Unmute work the same way. Delete, Leave and Block ask to confirm first. The switch under the actions picks Safe mode (one chat at a time) or Fast mode (all at once). On any other site, the popup offers to open Messenger.
```

## Distribution

Keep the current settings.
