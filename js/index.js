let global_timeout = null;
const LINKS = {
	main_website: "https://yvantot.github.io/i",
	tools: "https://yvantot.github.io/i/tools",
	buymecoffee: "https://buymeacoffee.com/",
};

const POPUPS = {
	no_chat_selected: () =>
		show_popup({
			title: "No chat selected",
			description: "Select a chat by clicking them here",
			action: "I understand",
			width: 70,
			bg_color: "hsl(0, 0%, 10%)",
			text_color: "hsl(0, 0%, 90%)",
		}),
	empty_chat: () =>
		show_popup({
			title: "No chat available",
			description: "Try reloading or restart extension",
			action: "I understand",
			width: 70,
			bg_color: "hsl(0, 0%, 10%)",
			text_color: "hsl(0, 0%, 90%)",
		}),
	help: () =>
		show_popup(
			{
				block_outside: true,
				exitable: true,
				title: "FAQ",
				action: "Next",
				description: `What is this tool for?<br/>- Archive, unarchive, leave groups, delete, mute, or unmute  chats with few clicks.<br/><br/>Does this affect Messenger performance?<br/>- No. This tool doesn't have anything running if it's not open.<br/><br/>Will this always be free?<br/>- I hope! You can support the development through <a href="https://yvantot.github.io/i/" target="_blank">donation</a> or check out my other <a href="https://yvantot.github.io/i/" target="_blank">tools</a>! `,
				icon: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#CCCCCC"><path d="M478-240q21 0 35.5-14.5T528-290q0-21-14.5-35.5T478-340q-21 0-35.5 14.5T428-290q0 21 14.5 35.5T478-240Zm-36-154h74q0-33 7.5-52t42.5-52q26-26 41-49.5t15-56.5q0-56-41-86t-97-30q-57 0-92.5 30T342-618l66 26q5-18 22.5-39t53.5-21q32 0 48 17.5t16 38.5q0 20-12 37.5T506-526q-44 39-54 59t-10 73Zm38 314q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>',
				width: 90,
				bg_color: "hsl(0, 0%, 10%)",
				text_color: "hsl(0, 0%, 90%)",
			},
			() =>
				show_popup({
					block_outside: true,
					exitable: true,
					title: "FAQ",
					description: `How to (insert action here) multiple chats?<br/>- Open Messenger, scroll to load the chats you want, open this extension, select the chats, and click the action (archive, delete, etc).<br/><br/>Is my data safe?<br/>- This tool is 100% offline, your data never leaves your device.<br/><br/>The (insert action here) doesn't work properly<br/>- Reload Messenger, try again. These features aren't officially supported by Messenger, issues may occur.`,
					action: "Close",
					icon: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#CCCCCC"><path d="M478-240q21 0 35.5-14.5T528-290q0-21-14.5-35.5T478-340q-21 0-35.5 14.5T428-290q0 21 14.5 35.5T478-240Zm-36-154h74q0-33 7.5-52t42.5-52q26-26 41-49.5t15-56.5q0-56-41-86t-97-30q-57 0-92.5 30T342-618l66 26q5-18 22.5-39t53.5-21q32 0 48 17.5t16 38.5q0 20-12 37.5T506-526q-44 39-54 59t-10 73Zm38 314q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>',
					width: 90,
					bg_color: "hsl(0, 0%, 10%)",
					text_color: "hsl(0, 0%, 90%)",
				}),
		),

	issues: () => {
		show_popup({
			block_outside: true,
			exitable: true,
			title: "BUGS!",
			description: `You can help by reporting any issues/bugs/errors in my email <a href="mailto:jidalman.work@gmail.com" target="_blank">jidalman.work@gmail.com</a>, thank you.`,
			action: "Close",
			icon: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#CCCCCC"><path d="M478-240q21 0 35.5-14.5T528-290q0-21-14.5-35.5T478-340q-21 0-35.5 14.5T428-290q0 21 14.5 35.5T478-240Zm-36-154h74q0-33 7.5-52t42.5-52q26-26 41-49.5t15-56.5q0-56-41-86t-97-30q-57 0-92.5 30T342-618l66 26q5-18 22.5-39t53.5-21q32 0 48 17.5t16 38.5q0 20-12 37.5T506-526q-44 39-54 59t-10 73Zm38 314q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>',
			width: 90,
			bg_color: "hsl(0, 0%, 10%)",
			text_color: "hsl(0, 0%, 90%)",
		});
	},
};

async function request_chats_info() {
	const { CHAT_SOURCE, CHATS_LIST } = get_popup_elements();
	try {
		const [tab] = await chrome.tabs.query({
			active: true,
			currentWindow: true,
		});
		const { chats_info } = await chrome.tabs.sendMessage(tab.id, {
			message: "scrap_chats",
		});

		if (chats_info === null) {
			CHAT_SOURCE.textContent = "It's kinda quiet here...";
			return;
		}

		const { source, info } = chats_info;

		CHAT_SOURCE.textContent = source;
		append_el_chats(CHATS_LIST, info);
		append_el_listeners();
	} catch (error) {
		CHAT_SOURCE.innerHTML =
			"Please use <a target='_blank' href='https://www.facebook.com/messages/'>Facebook Messenger</a><br/><br/>Or if this is newly installed, reload Facebook Messenger";
		console.warn(
			"Message is not received, either not in Facebook Messenger or error",
			error,
		);
	}
}

function append_el_listeners() {
	const {
		CHATS_LIST,
		CHATS_ACTIONS,
		CHATS_ACTIONS_ADDITIONAL,
		ISSUES,
		HELP,
		SEARCH_INPUT,
	} = get_popup_elements();

	SEARCH_INPUT.addEventListener("input", ({ target }) => {
		const cl_children = CHATS_LIST.children;
		const str_to_search = target.value.toLowerCase();

		for (let i = 0; i < cl_children.length; i++) {
			const chat_name = cl_children[i].textContent.toLowerCase();
			if (!chat_name.includes(str_to_search))
				cl_children[i].classList.add("no-display");
			else cl_children[i].classList.remove("no-display");
		}
	});

	ISSUES.addEventListener("click", () => {
		POPUPS.issues();
	});

	HELP.addEventListener("click", () => {
		POPUPS.help();
	});

	CHATS_LIST.addEventListener("click", ({ target }) => {
		if (target === CHATS_LIST) return;
		const chat_container = target.closest("a");
		chat_container.classList.toggle("chat-selected");
	});

	CHATS_ACTIONS.addEventListener("click", async ({ target }) => {
		if (target === CHATS_ACTIONS) return;
		target = target.closest("button");

		const { CHAT_SOURCE, CHATS_LIST, SEARCH_INPUT } = get_popup_elements();
		const selected_chats = Array.from(CHATS_LIST.children).filter((a) =>
			a.classList.contains("chat-selected"),
		);
		const chats_link = selected_chats.map((a) =>
			a.href
				.replace("https://www.messenger.com", "")
				.replace("https://www.facebook.com", ""),
		);

		if (!chats_link.length) {
			POPUPS.no_chat_selected();
			return;
		}

		const [tab] = await chrome.tabs.query({
			active: true,
			currentWindow: true,
		});

		switch (target.dataset.action) {
			// Requires config
			case "block": {
				show_popup(
					{
						exitable: true,
						block_outside: true,
						title: `Block/unblock ${selected_chats[0].textContent} ${selected_chats.length > 1 ? "and others?" : ""}`,
						description: "Specify the type of block",
						icon: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#CCCCCC"><path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q54 0 104-17.5t92-50.5L228-676q-33 42-50.5 92T160-480q0 134 93 227t227 93Zm252-124q33-42 50.5-92T800-480q0-134-93-227t-227-93q-54 0-104 17.5T284-732l448 448Z"/></svg>',
						action: "Proceed",
						choices: ["Block messages and calls", "Block on Facebook"],
						width: 90,
						bg_color: "hsl(0, 0%, 10%)",
						text_color: "hsl(0, 0%, 90%)",
					},
					async (block_type) => {
						try {
							const { status } = await chrome.tabs.sendMessage(tab.id, {
								message: "selected_chats",
								chats_link,
								action: target.dataset.action,
								block_type,
							});
							if (status) {
								update_chatslist();
							} else {
								CHATS_LIST.innerHTML = "";
								CHAT_SOURCE.textContent = "Reload and try again";
							}
						} catch (error) {
							console.warn("Communication has an error: ", error);
						}
					},
				);
				break;
			}
			case "mute": {
				show_popup(
					{
						exitable: true,
						block_outside: true,
						title: "Mute conversation",
						description:
							"Chat windows will stay closed, and you won't get push notifications on your devices.",
						icon: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#CCCCCC"><path d="M160-200v-80h80v-280q0-33 8.5-65t25.5-61l60 60q-7 16-10.5 32.5T320-560v280h248L56-792l56-56 736 736-56 56-146-144H160Zm560-154-80-80v-126q0-66-47-113t-113-47q-26 0-50 8t-44 24l-58-58q20-16 43-28t49-18v-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v28q80 20 130 84.5T720-560v206Zm-276-50Zm36 324q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80Zm33-481Z"/></svg>',
						action: "Next",
						choices: [
							"Mute message notifications",
							"Mute call notifications",
							"Mute message & call notifications",
						],
						width: 70,
						bg_color: "hsl(0, 0%, 10%)",
						text_color: "hsl(0, 0%, 90%)",
					},
					(mute_type) => {
						show_popup(
							{
								exitable: true,
								block_outside: true,
								title: "Mute for?",
								description:
									"Chat windows will stay closed, and you won't get push notifications on your devices.",
								icon: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#CCCCCC"><path d="M160-200v-80h80v-280q0-33 8.5-65t25.5-61l60 60q-7 16-10.5 32.5T320-560v280h248L56-792l56-56 736 736-56 56-146-144H160Zm560-154-80-80v-126q0-66-47-113t-113-47q-26 0-50 8t-44 24l-58-58q20-16 43-28t49-18v-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v28q80 20 130 84.5T720-560v206Zm-276-50Zm36 324q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80Zm33-481Z"/></svg>',
								action: "Proceed",
								choices: [
									"For 15 minutes",
									"For 1 hour",
									"For 8 hours",
									"For 24 hours",
									"Until I turn it back on",
								],
								width: 70,
								bg_color: "hsl(0, 0%, 10%)",
								text_color: "hsl(0, 0%, 90%)",
							},
							async (mute_time) => {
								try {
									const { status } = await chrome.tabs.sendMessage(tab.id, {
										message: "selected_chats",
										chats_link,
										action: target.dataset.action,
										mute_config: { mute_type, mute_time },
									});
									if (status) {
										update_chatslist();
									} else {
										CHATS_LIST.innerHTML = "";
										CHAT_SOURCE.textContent = "Reload and try again";
									}
								} catch (error) {
									console.warn("Communication has an error: ", error);
								}
							},
						);
					},
				);
				break;
			}
			// No confirmation or config
			case "unmute":
			case "unarchive":
			case "archive": {
				try {
					const { status } = await chrome.tabs.sendMessage(tab.id, {
						message: "selected_chats",
						chats_link,
						action: target.dataset.action,
					});
					if (status) {
						update_chatslist();
					} else {
						CHATS_LIST.innerHTML = "";
						CHAT_SOURCE.textContent = "Reload and try again";
					}
				} catch (error) {
					console.warn("Communication has an error: ", error);
				}

				break;
			}
			// Requires confirmation
			case "leave":
			case "delete": {
				show_popup(
					{
						block_outside: true,
						exitable: true,
						title: "This is permanent",
						description:
							"Are you sure you want to do this?<br/><br/>Although, it may not work at your first try, but don't take your chances! If it works, your chats? Gone.",
						action: "Proceed",
						width: 70,
						bg_color: "hsl(0, 0%, 10%)",
						text_color: "hsl(0, 0%, 90%)",
					},
					async () => {
						try {
							const { status } = await chrome.tabs.sendMessage(tab.id, {
								message: "selected_chats",
								chats_link,
								action: target.dataset.action,
							});
							if (status) {
								update_chatslist();
							} else {
								CHATS_LIST.innerHTML = "";
								CHAT_SOURCE.textContent = "Reload and try again";
							}
						} catch (error) {
							console.warn("Communication has an error: ", error);
						}
					},
				);

				break;
			}
		}
	});

	CHATS_ACTIONS_ADDITIONAL.addEventListener("click", async ({ target }) => {
		if (target === CHATS_ACTIONS_ADDITIONAL) return;
		target = target.closest("button");
		switch (target.dataset.action) {
			case "select-all": {
				Array.from(CHATS_LIST.children).forEach((child) => {
					if (!child.classList.contains("no-display"))
						child.classList.add("chat-selected");
				});
				break;
			}
			case "unselect-all": {
				Array.from(CHATS_LIST.children).forEach((child) => {
					child.classList.remove("chat-selected");
				});
				break;
			}
			case "sortby-name": {
				const [tab] = await chrome.tabs.query({
					active: true,
					currentWindow: true,
				});
				const { chats_info } = await chrome.tabs.sendMessage(tab.id, {
					message: "scrap_chats",
				});

				if (chats_info === null) {
					POPUPS.empty_chat();
					CHATS_LIST.innerHTML = "";
					return;
				}

				const { info } = chats_info;
				append_el_chats(CHATS_LIST, info);

				const order_by = target.dataset.order;
				target.classList.toggle("flip");
				if (order_by === "ascending") {
					target.dataset.order = "descending";
					if (info.length === 1) return;
					info.sort((a, b) => b.chat_name.localeCompare(a.chat_name));
					append_el_chats(CHATS_LIST, info);
				} else {
					target.dataset.order = "ascending";
					if (info.length === 1) return;
					info.sort((a, b) => a.chat_name.localeCompare(b.chat_name));
					append_el_chats(CHATS_LIST, info);
				}
				break;
			}
			case "refresh-chats": {
				target.classList.remove("spin-anim");
				void target.offsetWidth;
				target.classList.toggle("spin-anim");
				update_chatslist(true);

				break;
			}
			case "search-chats": {
				SEARCH_INPUT.classList.toggle("no-display");

				break;
			}
		}
	});
}

function update_chatslist(immediate = false) {
	clearTimeout(global_timeout);
	global_timeout = setTimeout(
		async () => {
			const { CHAT_SOURCE, CHATS_LIST } = get_popup_elements();
			const [tab] = await chrome.tabs.query({
				active: true,
				currentWindow: true,
			});
			const { chats_info } = await chrome.tabs.sendMessage(tab.id, {
				message: "scrap_chats",
			});

			if (chats_info === null) {
				POPUPS.empty_chat();
				return;
			}

			const { source, info } = chats_info;
			CHAT_SOURCE.textContent = source;
			append_el_chats(CHATS_LIST, info);
		},
		immediate ? 0 : 2000,
	);
}

function append_el_chats(parent, info) {
	const fragment = document.createDocumentFragment();

	make_el_chats(info).forEach((chat) => {
		fragment.appendChild(chat);
	});

	parent.innerHTML = "";
	parent.appendChild(fragment);
}

function make_el_chats(info) {
	return info.map((chat_info) => {
		const { chat_link, chat_img, chat_name } = chat_info;
		return create_element(
			"a",
			{ class: "chat-container", href: chat_link },
			`
                ${chat_img ? `<img src="${chat_img}" alt="-" loading="lazy"/>` : ""}
                <p>${chat_name}</p>
            `,
		);
	});
}

function get_popup_elements() {
	return {
		SEARCH_INPUT: document.getElementById("search-chats"),
		HELP: document.getElementById("help"),
		ISSUES: document.getElementById("issues"),
		CHAT_SOURCE: document.getElementById("chat-source"),
		CHATS_LIST: document.querySelector("section[class*='chats-list'"),
		CHATS_ACTIONS: document.getElementById("chats-actions"),
		CHATS_ACTIONS_ADDITIONAL: document.getElementById(
			"chats-actions-additional",
		),
	};
}

chrome.runtime.onMessage.addListener((receive, _, send) => {
	const { message } = receive;
	switch (message) {
		case "scrapped_chats": {
		}
	}
});

function create_element(name, attr = {}, inner) {
	const element = document.createElement(name);
	element.innerHTML = inner.trim();
	const keys = Object.keys(attr);
	if (keys.length) {
		for (const key of keys) {
			if (key === "dataset") {
				if (typeof attr.dataset !== "object")
					throw new Error("dataset must be an object");
				const dataset_keys = Object.keys(attr.dataset);
				if (!dataset_keys.length) throw new Error("dataset must not be empty");
				for (const dataset_key of dataset_keys) {
					element.dataset[dataset_key] = attr.dataset[dataset_key];
				}
			}
			if (key in element) {
				element[key] = attr[key];
			} else {
				element.setAttribute(key, attr[key]);
			}
		}
	}
	return element;
}

function show_popup(config = {}, callback = null) {
	document.getElementById("yvan-popup")?.remove();
	document.getElementById("yvan-popup-style")?.remove();

	const root = document.createElement("yvan-popup");
	root.setAttribute("id", "yvan-popup");

	const style = document.createElement("style");
	style.setAttribute("id", "yvan-popup-style");

	const {
		exitable = false,
		block_outside = false,
		title = "Attention",
		description = "",
		icon = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#CCCCCC"><path d="m40-120 440-760 440 760H40Zm138-80h604L480-720 178-200Zm302-40q17 0 28.5-11.5T520-280q0-17-11.5-28.5T480-320q-17 0-28.5 11.5T440-280q0 17 11.5 28.5T480-240Zm-40-120h80v-200h-80v200Zm40-100Z"/></svg>',
		action = "Okay",
		choices = [],
		bg_color = "hsl(0, 0%, 90%)",
		text_color = "hsl(0, 0%, 10%)",
		width = 50,
		height = undefined,
	} = config;

	const choices_el = choices
		.map(
			(choice, i) =>
				`<input type="radio" name="choices" id="choice-${i}" value='${i}'/><label for="choice-${i}">${choice}</label>`,
		)
		.join("");

	style.innerHTML = `
	${
		block_outside
			? `
	yvan-popup { 
		position: fixed; 		
		width: 100vw; 
		height: 100vh;
		left: 0;
		top: 0;
		backdrop-filter: blur(5px);
		}`
			: ""
	}
	${block_outside ? "popup-main" : "yvan-popup"}{position:fixed;width:${width ? width + "vw" : "fit-content"};height:${
		height ? height + "vh" : "fit-content"
	};animation:show_up 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;background-color:${bg_color};a,p,button,h1,label{color:${text_color}}border-top:2px solid hsl(0 0% 50% / .5);top:50%;left:50%;transform:translateX(-50%) translateY(-50%);display:flex;flex-direction:column;justify-content:center;align-items:center;border-radius:1rem;gap:.5rem;padding:1rem;box-shadow:0 5px 10px 5px hsl(0 0% 0% / .5);z-index:999;backdrop-filter:blur(5px);p,a,button,label{font-size:clamp(0.8rem, 1vw, 1rem);user-select:none}.header{display:flex;justify-content:center;align-items:center;gap:1rem;h1{user-select:none;font-size:clamp(1rem, 1.3rem, 1.5rem);font-weight:700}svg{border-radius:100%;width:10vw;height:10vw}}.choices{background-color:hsl(0 0% 0% / .1);width:100%;display:flex;flex-direction:column;align-items:center;padding:.5rem;border-radius:.5rem;gap:.5rem;label{opacity:.5;width:100%;background-color:hsl(0 0% 50% / .5);border:1px solid hsl(0 0% 50% / .5);text-align:center;padding:.1rem .7rem;border-radius:.5rem}input{display:none}input[type="radio"]:checked+label{opacity:1;background-color:hsl(0 0% 0% / .2)}}button{width:100%;border:1px solid hsl(0 0% 50% / .5);padding:.3rem .7rem;border-radius:.5rem}button,label,span svg{cursor:pointer;transition:transform 0.3s ease-in-out,background-color 0.3s ease-in-out,opacity 0.3s ease-in-out}button:hover,label:hover{opacity:1;background-color:hsl(0 0% 0% / .1);transform:scale(.95,.95)}}
		span { position: relative; width: 100%; height: 0; svg { width: 5vw; height: 5vw;  position: absolute; top: 0; right: 0;}}
	`;

	root.innerHTML = `		
		${exitable ? `<span><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#CCCCCC"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg></span>` : ""}
		<div class="header">
			${icon}
			<h1>${title}</h1>
		</div>
		${description.trim().length ? `<p>${description}</p>` : ""}
		${choices_el.length ? `<div class="choices">${choices_el}</div>` : ""}
		<button>${action}</button>		
		
	`;

	if (block_outside) {
		const main = document.createElement("popup-main");
		main.innerHTML = root.innerHTML;
		root.innerHTML = "";
		root.appendChild(main);
	}

	if (exitable) {
		root.querySelector("span svg").addEventListener("click", () => {
			root.remove();
			style.remove();
		});
	}

	root.querySelector("button").addEventListener("click", () => {
		const input = root.querySelector("input[type='radio']:checked");
		if (!input && choices_el.length) return;
		const choice = input?.value ?? -1;

		root.remove();
		style.remove();

		if (callback) callback(parseInt(choice));
	});

	document.head.appendChild(style);
	document.body.appendChild(root);
}

function tooltip_init() {
	const innerWidth = 300;
	const innerHeight = 500;

	const tooltips = [];
	document.addEventListener("mouseover", ({ target }) => {
		if (target.dataset?.tooltip) {
			for (let i = 0; i < tooltips.length; i++) {
				tooltips[i].remove();
			}

			const { x, y, height: target_height } = target.getBoundingClientRect();
			const tooltip = create_element(
				"tooltip",
				{ class: "tooltip" },
				target.dataset.tooltip,
			);
			tooltips.push(tooltip);
			document.body.appendChild(tooltip);

			const { width: tooltip_width, height: tooltip_height } =
				tooltip.getBoundingClientRect();
			const offset_height = y + target_height + 5;
			tooltip.style.top =
				(offset_height + tooltip_height > innerHeight
					? y - tooltip_height
					: offset_height) + "px";
			tooltip.style.left =
				(x + tooltip_width > innerWidth ? innerWidth - tooltip_width : x) +
				"px";
		}
	});
}

function remind_user() {
	const chances = Math.floor(Math.random() * 15);
	if (chances === 0) {
		const name = chrome.runtime.getManifest().name;
		const id = "fhedcmcogemcndkjkoaojkdggfmpbmkk";
		const link = `https://chromewebstore.google.com/detail/${id}/`;
		const popup_type = ["rate", "other-tools", "donate"];
		const chance = Math.floor(Math.random() * popup_type.length);

		switch (popup_type[chance]) {
			case "rate": {
				show_popup({
					block_outside: true,
					title: "Your feedback helps me improve",
					action: "I understand",
					description: `I make web extensions (education apps, productivity apps, anti-addictive-sites apps, common apps that should be free, tools like this) to help me spend less time on the internet.<br/><br/>I'd be very happy if you can rate <a href="${link}" target="_blank">${name}</a> and share your feedbacks.`,
					icon: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#CCCCCC"><path d="M640-440 474-602q-31-30-52.5-66.5T400-748q0-55 38.5-93.5T532-880q32 0 60 13.5t48 36.5q20-23 48-36.5t60-13.5q55 0 93.5 38.5T880-748q0 43-21 79.5T807-602L640-440Zm0-112 109-107q19-19 35-40.5t16-48.5q0-22-15-37t-37-15q-14 0-26.5 5.5T700-778l-60 72-60-72q-9-11-21.5-16.5T532-800q-22 0-37 15t-15 37q0 27 16 48.5t35 40.5l109 107ZM280-220l278 76 238-74q-5-9-14.5-15.5T760-240H558q-27 0-43-2t-33-8l-93-31 22-78 81 27q17 5 40 8t68 4q0-11-6.5-21T578-354l-234-86h-64v220ZM40-80v-440h304q7 0 14 1.5t13 3.5l235 87q33 12 53.5 42t20.5 66h80q50 0 85 33t35 87v40L560-60l-280-78v58H40Zm80-80h80v-280h-80v280Zm520-546Z"/></svg>',
					width: 90,
					bg_color: "hsl(0, 0%, 10%)",
					text_color: "hsl(0, 0%, 90%)",
				});
				break;
			}
			case "donate": {
				show_popup({
					block_outside: true,
					title: "This $@$%# doesn't work at all!",
					action: "I understand",
					description: `(...if it's working properly, pheww) Who maintains this piece of a tool? Oh, that's me.<br/><br/>Messenger updates. a. lot. and it is not easy to modify. This (unfortunate) situation, make tools like this very unstable.<br/><br/>....It is important to note that these features are not expected by Messenger, that's why it's inevitable for this tool to not work sometimes.`,
					icon: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#CCCCCC"><path d="M480-420q-68 0-123.5 38.5T276-280h408q-25-63-80.5-101.5T480-420Zm-168-60 44-42 42 42 42-42-42-42 42-44-42-42-42 42-44-42-42 42 42 44-42 42 42 42Zm250 0 42-42 44 42 42-42-42-42 42-44-42-42-44 42-42-42-42 42 42 44-42 42 42 42ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-400Zm0 320q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Z"/></svg>',
					width: 90,
					bg_color: "hsl(0, 0%, 10%)",
					text_color: "hsl(0, 0%, 90%)",
				});
				break;
			}
			case "other-tools": {
				show_popup({
					block_outside: true,
					title: "Checkout other time-saving tools",
					action: "I understand",
					description: `Yo, checkout my other stuff <a href="${LINKS.tools}">here</a>. You might find them useful.`,
					icon: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#CCCCCC"><path d="M686-132 444-376q-20 8-40.5 12t-43.5 4q-100 0-170-70t-70-170q0-36 10-68.5t28-61.5l146 146 72-72-146-146q29-18 61.5-28t68.5-10q100 0 170 70t70 170q0 23-4 43.5T584-516l244 242q12 12 12 29t-12 29l-84 84q-12 12-29 12t-29-12Zm29-85 27-27-256-256q18-20 26-46.5t8-53.5q0-60-38.5-104.5T386-758l74 74q12 12 12 28t-12 28L332-500q-12 12-28 12t-28-12l-74-74q9 57 53.5 95.5T360-440q26 0 52-8t47-25l256 256ZM472-488Z"/></svg>',
					width: 90,
					bg_color: "hsl(0, 0%, 10%)",
					text_color: "hsl(0, 0%, 90%)",
				});
				break;
			}
		}
	}
}

remind_user();
tooltip_init();
request_chats_info();
