# Messenger Batch Actions privacy policy

Last updated: October 22, 2026

Messenger Batch Actions doesn't collect, sell or share your data. Nothing about you or your chats is sent to the developer or to anyone else.

## What it handles, on your device only

- **Your chat list.** While messenger.com or facebook.com/messages is open and you use the popup, the extension reads the names, picture links and addresses of the chats loaded in Messenger's chat list, to show them in the popup and to act on the ones you pick. They're kept in memory only, and forgotten when the popup or the page closes. Message text is never read.
- **Your settings.** Whether you use Safe mode or Fast mode, how many times the popup was opened and when it last asked for a review, and the layout rules described below. These are kept in your browser's extension storage.
- **Reports.** A report you copy from the popup holds the extension's version, your browser version, which parts of Messenger's page were found, and any errors. It has no names, messages or links, and goes only to your clipboard.

## Network

To keep working when Messenger changes its page, the extension downloads one file, `https://raw.githubusercontent.com/yvantot/messenger-batch-actions/main/rules/page-rules.json`, when it's installed or updated, at most every 6 hours after that, and when you click **Check for fixes**. The file holds page rules (CSS selectors and icon shapes), not code. The request carries no cookies and no data about you; like any web request, GitHub sees your IP address and browser ([GitHub's privacy statement](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement)).

## What it does on Messenger

It only acts on the chats you pick, with the action you choose (archive, unarchive, mute, unmute, delete, leave or block), by using Messenger's own menus in your browser, as you would by hand.

## Your control

Removing the extension deletes everything it stored.

## Questions

Email [yvantot.code@gmail.com](mailto:yvantot.code@gmail.com).
