let settings = {
	terms: false,
	customOnly: false,
	currentTabId: 0,
	whitelist: [ "sleezzi.github.io", "ext-twitch.tv" ]
};

chrome.storage.local.get("settings", value => {
	if (value.settings) settings = value.settings;
});

function clearURL(url) {
	if (`${url}`.includes("https://")) url = url.replace("https://", "");
	if (`${url}`.includes("http://")) url = url.replace("http://", "");
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

function addURLInWhitlist(website, callback) {
	let finded;
	settings.whitelist.forEach(url => {
		if (!url.startsWith("@@") && RegExp(`^${url.replace(/\./g, "\\.").replace(/\*/g, ".*").replace("@@", "")}$`).test(website)) {
			finded = true;
			settings.whitelist.splice(settings.whitelist.indexOf(url));
			callback("Yes");
			sendMessageToCurrentTab("enable");
		}
	});
	if (!finded) {
		settings.whitelist.push(website);
		callback("No");
		sendMessageToCurrentTab("disable");
	}
	chrome.storage.local.set({ "settings": settings });
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
	if (`${message}`.startsWith("addWebsiteToWhiteList$website=")) {
		addURLInWhitlist(`${message}`.replace("addWebsiteToWhiteList$website=", ""), resp => sendResponse(resp));
		return;
	}
	if (`${message}`.startsWith("isInWhiteList$website=")) {
		let whitelisted;
		settings.whitelist.forEach(url => {
			if (whitelisted !== false && RegExp(`^${url.replace(/\./g, "\\.").replace(/\*/g, ".*").replace("@@", "")}$`).test(`${message}`.replace("isInWhiteList$website=", ""))) {
				if (url.startsWith("@@")) {
					return whitelisted = false;
				} else {
					whitelisted = true;
				}
			}
		});
		if (!whitelisted) {
			sendResponse("No");
		} else {
			sendResponse("Yes");
		};
		return;
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
	if (`${message}` === "termsIsAccepted") {
		sendResponse((settings.terms === true ? "Yes" : "No"));
		return;
	}
	if (`${message}` === "termsAccept") {
		settings.terms = true;
		chrome.storage.local.set({ "settings": settings });
		chrome.action.setIcon({ path: '/img/icon/Logo128.png' });
		return;
	}
	if (`${message}`.startsWith("getCustomOnly")) {
		sendResponse((settings.customOnly ? "Yes" : "No"));
		return;
	}
	if (`${message}`.startsWith("changeCustomOnly")) {
		if (settings.customOnly) {
			settings.customOnly = false;
			sendResponse("No");
		} else {
			settings.customOnly = true;
			sendResponse("Yes");
		}
		chrome.storage.local.set({ "settings": settings });
		return;
	}
	console.log(`${message}`);
});

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
	if (reason === 'install') {
		chrome.action.setIcon({ path: '/img/icon/LogoDisable.png' });
		chrome.tabs.create({url: 'installed.html'});
		createNotification("install", "DarkReader", "Tanks for download our extension", "/img/icon/Logo.png", true);
	} else if (reason === "update") {
		chrome.tabs.create({url: 'updated.html'});
		createNotification("update", "DarkReader", "We made a update", "/img/icon/Logo.png", true);
	}
});
const changeIconOnTabUpdate = async function(activeInfo) {
	const tabId = activeInfo.tabId;
	if (!tabId) return;
	let whitelisted;
	const tab = await chrome.tabs.get(tabId);
	if (!/^(https?|ftp):\/\/([^\s/$.?#].[^\s]*)$/.test(tab.url)) return chrome.action.setIcon({ tabId, path: '/img/icon/LogoDisable.png' });
	settings.whitelist.forEach(url => {
		if (whitelisted !== false && RegExp(`^${url.replace(/\./g, "\\.").replace(/\*/g, ".*").replace("@@", "")}$`).test(clearURL(new URL(`${tab.url}`).hostname))) {
			if (url.startsWith("@@")) {
				return whitelisted = false;
			} else {
				whitelisted = true;
			}
		}
	});
	if (whitelisted) {
		chrome.action.setIcon({ tabId, path: '/img/icon/LogoDisable.png' });
	} else {
		chrome.action.setIcon({ tabId, path: '/img/icon/Logo128.png' });
	}
};


chrome.tabs.onActivated.addListener(changeIconOnTabUpdate);
chrome.tabs.onUpdated.addListener(function(...args) {
	if (args[2].status === "complete") changeIconOnTabUpdate({ tabId: args[2].id });
});

chrome.commands.onCommand.addListener(async command => {
	if (command === "toggle_enable") {
		const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
		if (!tab || !tab.id) return;
		addURLInWhitlist(clearURL(new URL(tab.url).hostname), function(resp) {
			const tabId = tab.id;
			if (resp === "No") {
				chrome.action.setIcon({ tabId, path: '/img/icon/LogoDisable.png' });
			} else {
				chrome.action.setIcon({ tabId, path: '/img/icon/Logo128.png' });
			}
		});
		return;
	}
});