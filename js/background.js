let settings = {
	terms: false,
	whitelist: [ "*.github.io", "ext-twitch.tv" ]
};

chrome.storage.local.get("settings", value => {
	if (value.settings) settings = value.settings;
});

function clearURL(url) {
	if (`${url}`.includes("https://")) url = url.replace("https://", "");
	if (`${url}`.includes("http://")) url = url.replace("http://", "");
	if (`${url}`.includes("ww1.")) url = url.replace("ww1.", "");
	if (`${url}`.includes("www.")) url = url.replace("www.", "");
	return url;
}

function createNotification(id, title, message, iconUrl, silent) {
	chrome.notifications.create(id, {
    	type: 'basic',
		title: title,
		message: message,
		iconUrl: iconUrl,
		silent: silent,
		priority: 2
	});
}

async function sendMessageToCurrentTab(message) {
	const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
	if (!tab || !tab.id) return;
  	const response = await chrome.tabs.sendMessage(tab.id, message);
	return response;
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {	
	if (`${message}`.startsWith("addWebsiteToWhiteList$website=")) {
		if (settings.whitelist.find(url => url === `${message}`.replace("addWebsiteToWhiteList$website=", ""))) {
			settings.whitelist.splice(settings.whitelist.indexOf(`${message}`.replace("addWebsiteToWhiteList$website=", "")));
		} else {
			settings.whitelist.push(`${message}`.replace("addWebsiteToWhiteList$website=", ""));
		}
		sendResponse((settings.whitelist.find(url => url === `${message}`.replace("addWebsiteToWhiteList$website=", "")) === undefined ? "No" : "Yes"));
		chrome.storage.local.set({ "settings": settings });
		sendMessageToCurrentTab("reload");
		return;
	}
	if (`${message}`.startsWith("isInWhiteList$website=")) {
		settings.whitelist.forEach(url => {
			console.log((RegExp(`^${url.replace(/\./g, "\\.").replace(/\*/g, ".*")}$`).test(`${message}`.replace("isInWhiteList$website=", "")) ? `${url} match with ${`${message}`.replace("isInWhiteList$website=", "")}` : `${url} don't match with ${`${message}`.replace("isInWhiteList$website=", "")}`));
			if (RegExp(`^${url.replace(/\./g, "\\.").replace(/\*/g, ".*")}$`).test(`${message}`.replace("isInWhiteList$website=", ""))) return sendResponse("Yes");
		});
		return sendResponse("No");
	}
	if (`${message}` === "getWhiteList") {
		sendResponse(settings.whitelist);
		return;
	}
	if (`${message}`.startsWith("setWhiteList$whitelist=")) {
		settings.whitelist = `${message}`.replace("setWhiteList$whitelist=", "").split("$change$") || [];
		sendResponse(settings.whitelist);
		chrome.storage.local.set({ "settings": settings });
		return;
	}
	if (`${message}`.startsWith("termsIsAccepted")) {
		sendResponse((settings.terms === true ? "Yes" : "No"));
		return;
	}
	if (`${message}`.startsWith("termsAccept")) {
		settings.terms = true;
		chrome.storage.local.set({ "settings": settings });
		return;
	}
	console.log(`${message}`);
});

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
	if (reason === 'install') {
		chrome.tabs.create({url: 'installed.html'});
		createNotification("install", "DarkReader", "Tanks for download our extension", "/img/icon/Logo.png", true);
	} else if (reason === "update") {
		chrome.tabs.create({url: 'updated.html'});
		createNotification("update", "DarkReader", "We made a update", "/img/icon/Logo.png", true);
	}
});