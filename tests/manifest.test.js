// The manifest: files it names exist, paths are plain (the Chrome Web Store's upload check wants them so), and
// the popup and background load the shared file the content scripts use.
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(ROOT, file), "utf8");
const exists = (file) => fs.existsSync(path.join(ROOT, file));

module.exports = async (check) => {
	const manifest = JSON.parse(read("manifest.json"));
	const content = manifest.content_scripts[0].js;
	const files = [
		manifest.action.default_popup,
		manifest.background.service_worker,
		...Object.values(manifest.icons),
		...content,
	];

	check("every file the manifest names exists", files.every(exists), files.filter((file) => !exists(file)).join(", "));
	check("paths are plain", files.every((file) => !/^\.?\//.test(file)), files.filter((file) => /^\.?\//.test(file)).join(", "));
	check("the shared file loads first", content[0] === "js/shared/page-parts.js");
	check("main.js loads last", content.at(-1) === "js/content/main.js");
	check("the background loads the shared file", /importScripts\("\/js\/shared\/page-parts\.js"\)/.test(read(manifest.background.service_worker)));
	const popup = read(manifest.action.default_popup);
	check(
		"the popup loads the shared file before its own script",
		popup.indexOf("../js/shared/page-parts.js") > 0 && popup.indexOf("../js/shared/page-parts.js") < popup.indexOf("../js/index.js"),
	);
	check("no permission that shows an install warning", manifest.permissions.every((p) => ["storage", "activeTab", "scripting"].includes(p)) && !manifest.host_permissions);

	// What the Chrome Web Store checks
	check("the summary fits the store's 132 characters", manifest.description.length <= 132, manifest.description.length);
	const pngSize = (file) => {
		const data = fs.readFileSync(path.join(ROOT, file));
		return [data.readUInt32BE(16), data.readUInt32BE(20)];
	};
	const wrongIcons = Object.entries(manifest.icons).filter(([size, file]) => pngSize(file).join("x") !== `${size}x${size}`);
	check("icons are the size the manifest says", !wrongIcons.length, wrongIcons.map(([size, file]) => `${file} is ${pngSize(file).join("x")}, not ${size}`).join(", "));
	check("the font ships with its license", exists("assets/Quicksand.ttf") && exists("assets/Quicksand-OFL.txt"));

	// Nothing about the author ships with it, and nothing asks for money
	const shipped = [manifest.action.default_popup, "manifest.json", "js/index.js", ...content, manifest.background.service_worker];
	const personal = /Dalman|jidalman|dalmanjunivanne|yvantot\.github\.io|buymeacoffee|donat|support (the )?development/i;
	check("no personal details or donation asks", shipped.every((file) => !personal.test(read(file))), shipped.filter((file) => personal.test(read(file))).join(", "));

	for (const file of [...content, manifest.background.service_worker, "js/index.js"]) {
		let ok = true;
		try {
			new Function(read(file));
		} catch (error) {
			ok = false;
			check(`${file} parses`, false, error.message);
		}
		if (ok) check(`${file} parses`, true);
	}
};
