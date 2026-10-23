# Chrome Web Store listing

Everything to fill in the [developer dashboard](https://chrome.google.com/webstore/devconsole), tab by tab, for the 1.1.0
update. The images are in `store/media/`. To redraw them after a popup change, run `python store/render.py`; after a
logo change (`assets/logo.svg`), add `--icons` to redraw the extension's icons too.

The promo tiles show Messenger's and Facebook's official logos, which aren't in git. Before redrawing the tiles, download
both packs from Meta's Brand Resource Center ([Messenger icon](https://www.meta.com/brand/resources/facebook/messenger-icon/),
[Facebook logo](https://www.meta.com/brand/resources/facebook/logo/)), accepting Meta's terms, and save the primary versions
as `store/logos/messenger.svg` and `store/logos/facebook.png`. Without them the tiles leave the logos out. Meta's rules:
use them exactly as provided, on white, with clear space of a quarter of their width, and no words beside them.

## Package

1. Run `node tests/run.js`. Every test should pass.
2. Commit, then run `python store/package.py`. It builds `messenger-batch-actions-1.1.0.zip` from the committed files
   (leaving out `tests/`, `rules/`, `store/` and the docs) and checks that every path in the manifest and the popup is
   in it exactly as written.
3. In the dashboard, open the item, **Package > Upload new package**, and pick the zip.

The listing's name and summary come from `manifest.json`:

- **Name:** Messenger Batch Actions
- **Summary:** Archive, mute, delete or leave many Messenger chats at once, on messenger.com and facebook.com/messages.

## Store listing

**Description**

```
Archive, mute, delete or leave many Messenger chats at once, on messenger.com and facebook.com/messages.

• Archive old chats, and unarchive them
• Mute noisy groups for 15 minutes, 8 hours, or until you turn them back on
• Delete chats you don't need, or leave old group chats
• Block or unblock
• Search, select all, and load older chats
• Safe mode does one chat at a time and checks each one; Fast mode does them all at once

Nothing about you or your chats leaves your browser. Free, with no ads.

Messenger Batch Actions is not affiliated with or endorsed by Meta Platforms, Inc. Messenger and Facebook are trademarks of Meta Platforms, Inc.
```

**Category:** Social Media & Networking

**Language:** English

**Graphic assets**

| Field | File |
|---|---|
| Store icon (128x128) | `store/media/icon-128.png` |
| Screenshots (1280x800), in this order | `screenshot-1.png` to `screenshot-5.png` |
| Small promo tile (440x280) | `store/media/promo-small.png` |
| Marquee promo tile (1400x560, optional) | `store/media/promo-marquee.png` |
| Promo video | the YouTube link of `store/video/demo.mp4` (see below) |

Remove the old screenshots before adding these. They show, in order: archiving many chats, Safe mode, Fast mode,
muting, and search-and-delete on facebook.com/messages.

**Promo video.** The store only takes a YouTube link. `store/video/demo.mp4` (44 s, 1080p, 30 fps, H.264, BT.709, no
sound) is made by `python store/video/record.py`. Upload it to YouTube as Public or Unlisted, then paste its link here.
On YouTube:

- **Title** (49 characters, so it isn't cut off on phones). It's what people search for, since a new channel gets
  most of its views from search; the thumbnail already says "Clean up Messenger", so the title adds to it instead of
  repeating it:

  `How to Delete Many Messenger Chats at Once (Free)`

  If YouTube Studio's **Test & Compare** is available (it needs advanced features turned on), test it against two
  hooks; YouTube keeps whichever gets the most watch time:

  - `Clean Up Your Messenger in Under a Minute (Free)`
  - `Archive, Mute or Delete ALL Your Messenger Chats at Once`

  Keep every claim true to the video (15 made-up chats, cleaned in under a minute): YouTube's spam policy treats a
  title that promises something the video doesn't show as misleading.
- **Thumbnail:** `store/media/youtube-thumbnail.png` (1280x720)
- **Description.** Only the first line or two show before "Show more", so the hook and the link come first. The steps
  repeat what people search for, in plain words. The first three hashtags show above the title; more than 15 and
  YouTube ignores them all.

  ```
  Too many old Messenger chats? Clear them all in seconds, for free:
  https://chromewebstore.google.com/detail/fhedcmcogemcndkjkoaojkdggfmpbmkk

  Messenger Batch Actions is a free Chrome extension for messenger.com and facebook.com/messages. Pick the chats, pick the action, done.

  What it does:
  • Archive many chats at once, and unarchive them
  • Mute noisy groups for 15 minutes, 8 hours, or until you turn them back on
  • Delete old chats, or leave old group chats
  • Block or unblock
  • Search and select all, to clean up fast
  • Safe mode does one chat at a time; Fast mode does them all at once

  How to delete many Messenger chats at once:
  1. Add Messenger Batch Actions to Chrome from the link above
  2. Open messenger.com or facebook.com/messages
  3. Click the extension, pick the chats, and click Delete (or Archive, or Mute)

  Nothing about you or your chats leaves your browser. The chats in this video are made up.

  Messenger Batch Actions is not affiliated with or endorsed by Meta Platforms, Inc. Messenger and Facebook are trademarks of Meta Platforms, Inc.

  #Messenger #Facebook #ChromeExtension
  ```

- **Pinned comment:** the same store link, with one line ("Free here, no sign-up:"), so it's one tap away on phones.
- No chapters: some scenes are shorter than the 10 seconds YouTube needs for one.
- **Audience:** not made for kids. YouTube Studio's free Audio Library can add music.

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

**Privacy policy URL:** https://github.com/yvantot/messenger-batch-actions/blob/main/PRIVACY.md (on GitHub already)

## Test instructions (for the reviewer)

```
Needs a Facebook account. Open messenger.com (or facebook.com/messages), click the extension's icon, pick a few chats in the popup, and click Archive. Archived chats leave the list; open Messenger's Archived chats and use Unarchive to bring them back. Mute and Unmute work the same way. Delete, Leave and Block ask to confirm first. The switch under the actions picks Safe mode (one chat at a time) or Fast mode (all at once). On any other site, the popup offers to open Messenger.
```

## Distribution

Keep the current settings.

## How the media is made

- **Images:** HTML pages in `store/source/`, rendered at exact sizes by headless Chrome in a throwaway profile
  (`store/render.py`) and saved as PNG without transparency. The screenshots and the marquee run the real popup with a
  stand-in for the extension APIs (`stub.js`), fed made-up chats from `scenes.js`, which also draws the Messenger mock.
- **Video:** `store/video/demo.html` is the stage; `stage.js` plays its timeline on a paused clock that
  `store/video/record.py` moves one frame per screenshot (Playwright), piping the frames into ffmpeg. The real popup
  runs there too, with `popup-stub.js`.
