let response;

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (`${message}` === "reload") document.querySelectorAll("#DarkReaderStyle").forEach(element => {
        if (element.tagName === "style") {
            if (element.type) {
                element.removeAttribute(type)
            } else {
                element.type = "text";
            }
        } else {
            if (element.rel === "stylesheet") {
                element.rel = "text";
            } else {
                element.rel = "stylesheet";
            }
        }
    });
});

function clearURL(url) {
	if (`${url}`.includes("https://")) url = url.replace("https://", "");
	if (`${url}`.includes("http://")) url = url.replace("http://", "");
	if (`${url}`.includes("www.")) url = url.replace("www.", "");
	return url;
};
let isActive = true;

function trowError(err) {
    const popup = document.createElement("DarkReaderDiv");
    popup.innerHTML = ``;
    document.body.appendChild(popup);
    document.querySelector("#DarkReader.close-btn").onclick = function() {
        document.querySelector('#DarkReader.popup-container').style.display = 'none';
        chrome.runtime.sendMessage(`addWebsiteToWhiteList$website=${website}`);
    }
    console.error(err);
};

function useDefault() {
    const style = document.createElement("style");
    style.id = "DarkReaderStyle";
    if (!isActive) style.type = "text";
    style.innerHTML = ``;
    document.head.appendChild(style);
};


(async () => {
    response = await chrome.runtime.sendMessage(`termsIsAccepted`);
    if (response !== "Yes") return;
    const website = clearURL(window.location.hostname);
    if (!/^(https?|ftp):\/\/([^\s/$.?#].[^\s]*)$/.test(window.location.href)) return console.log(`DarkReader can't work on ${website}`);
    response = await chrome.runtime.sendMessage(`isInWhiteList$website=${website}`);
    if (response === "Yes") {
        console.warn(`You have disabled DarkReader on "${website}"`, response);
        isActive = false;
    }
    console.log("DarkReader was here :)");
    try {
        response = await fetch(`https://sleezzi.github.io/DarkReader/website.txt`, { method: "GET", cache: "no-store" });
        let finded = false;
        if (response.status === 200) {
            response = await response.text();
            for (const line of response.split('\n')) {
                if (line.trim() === '' || line.trim().startsWith('!')) continue;
                const url = line.match(/\+(.*?)\|/);
                const styleURL = line.match(/\$(.*?)\|/);
                const name = line.match(/\#(.*?)\|/);
                const author = line.match(/\@(.*?)\|/);
                if (!url || !url[1] ||
                !RegExp(`^${url[1].replace(/\./g, "\\.").replace(/\*/g, ".*")}$`).test(website) ||
                !name || !name[1] ||
                !author || !author[1] ||
                !styleURL || !styleURL[1]) continue;
                finded = true;
                const style = document.createElement("link");
                style.id = "DarkReaderStyle";
                style.rel = isActive === true ? "stylesheet" : "text";
                style.href = styleURL[1];
                document.head.appendChild(style);
            }
            if (!finded) {
                response = await chrome.runtime.sendMessage(`getCustomOnly`);
                if (response === "Yes") return console.warn(`DarkReader is disabled on "${website}" because it does not support it in a custom way and you have enabled the custom only option`, response);
                useDefault();
            }
        } else {
            useDefault();
            trowError("Unable to make request: Invalid URL");
        }
        const Discord = document.createElement("DarkReaderDiv");
        Discord.innerHTML = ``;
        document.body.appendChild(Discord);
    } catch(err) {
        useDefault();
        trowError(err);
    }
})();