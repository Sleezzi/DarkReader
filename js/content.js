let response;

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (`${message}` === "reload") {
        window.location.reload();
    }
});

function clearURL(url) {
	if (`${url}`.includes("https://")) url = url.replace("https://", "");
	if (`${url}`.includes("http://")) url = url.replace("http://", "");
	if (`${url}`.includes("www.")) url = url.replace("www.", "");
	return url;
}

(async () => {
    response = await chrome.runtime.sendMessage(`termsIsAccepted`);
    if (response !== "Yes") return;
    const website = clearURL(window.location.hostname);
    if (!/^(https?|ftp):\/\/([^\s/$.?#].[^\s]*)$/.test(window.location.href)) return console.log(`DarkReader can't work on ${website}`);
    response = await chrome.runtime.sendMessage(`isInWhiteList$website=${website}`);
    if (response === "Yes") return console.warn(`You have disabled DarkReader on "${website}"`, response);
    response = await chrome.runtime.sendMessage(`getCustomOnly`);
    if (response === "Yes") return console.warn(`DarkReader is disabled on "${website}" because it does not support it in a custom way and you have enabled the custom only option`, response);
    try {
        response = await fetch(`https://sleezzi.github.io/DarkReader/website.txt`, { method: "GET", cache: "no-store" });
        let finded = false;
        if (response.status !== 200) throw new Error("Unable to make request: Invalid URL");
        console.log("DarkReader was here :)");
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
            style.rel = "stylesheet";
            style.href = styleURL[1];
            document.head.appendChild(style);
        }
        if (!finded) {
            const style = document.createElement("style");
            style.innerHTML = `
body, main, #main, #container-main, #main-frame, div[data-role="main"], div[role="main"], div#page, div[data-role="page"], div[role="page"] {
    background: #333 !important;
    color: white !important;
}
iframe body {
    background: inerit;
    color: inerit;
}`;
            document.head.appendChild(style);
        }
        const Discord = document.createElement("DarkReaderDiv");
        Discord.innerHTML = `
<style>
    #discord.DarkReader {
        display: flex;
        cursor: pointer;
        margin: 5px;
        height: 15px;
        width: 15px;
        justify-content: center;
        align-items: center;
        color: white;
        z-index: 99;
        position: fixed;
        bottom: 5px;
        right: 5px;
    }
    #discord.DarkReader > svg {
        transition: transform .5s;
        color: white
    }
    #discord.DarkReader:hover > svg {
        transform: rotateY(360deg);
    }
</style>
<div class="DarkReader buttonContainer">
    <a href="https://discord.gg/kzpUQaNqyV" class="DarkReader" target="_blank" id="discord">
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="100%" height="100%" viewBox="0 -28.5 256 256" version="1.1" preserveAspectRatio="xMidYMid">
            <g>
                <path d="M216.856339,16.5966031 C200.285002,8.84328665 182.566144,3.2084988 164.041564,0 C161.766523,4.11318106 159.108624,9.64549908 157.276099,14.0464379 C137.583995,11.0849896 118.072967,11.0849896 98.7430163,14.0464379 C96.9108417,9.64549908 94.1925838,4.11318106 91.8971895,0 C73.3526068,3.2084988 55.6133949,8.86399117 39.0420583,16.6376612 C5.61752293,67.146514 -3.4433191,116.400813 1.08711069,164.955721 C23.2560196,181.510915 44.7403634,191.567697 65.8621325,198.148576 C71.0772151,190.971126 75.7283628,183.341335 79.7352139,175.300261 C72.104019,172.400575 64.7949724,168.822202 57.8887866,164.667963 C59.7209612,163.310589 61.5131304,161.891452 63.2445898,160.431257 C105.36741,180.133187 151.134928,180.133187 192.754523,160.431257 C194.506336,161.891452 196.298154,163.310589 198.110326,164.667963 C191.183787,168.842556 183.854737,172.420929 176.223542,175.320965 C180.230393,183.341335 184.861538,190.991831 190.096624,198.16893 C211.238746,191.588051 232.743023,181.531619 254.911949,164.955721 C260.227747,108.668201 245.831087,59.8662432 216.856339,16.5966031 Z M85.4738752,135.09489 C72.8290281,135.09489 62.4592217,123.290155 62.4592217,108.914901 C62.4592217,94.5396472 72.607595,82.7145587 85.4738752,82.7145587 C98.3405064,82.7145587 108.709962,94.5189427 108.488529,108.914901 C108.508531,123.290155 98.3405064,135.09489 85.4738752,135.09489 Z M170.525237,135.09489 C157.88039,135.09489 147.510584,123.290155 147.510584,108.914901 C147.510584,94.5396472 157.658606,82.7145587 170.525237,82.7145587 C183.391518,82.7145587 193.761324,94.5189427 193.539891,108.914901 C193.539891,123.290155 183.391518,135.09489 170.525237,135.09489 Z" fill="#5865F2" fill-rule="nonzero"></path>
            </g>
        </svg>
    </a>
</div>`;
        document.body.appendChild(Discord);
    } catch(err) {
        const popup = document.createElement("DarkReaderDiv");
        popup.innerHTML = `
<style>
    #DarkReader.popup-container {
        display: flex;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        justify-content: center;
        align-items: center;
    }

    #DarkReader.popup-content {
        background: #fff;
        padding: 20px;
        color: black;
        border-radius: 5px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
        position: relative;
    }

    #DarkReader.close-btn {
        position: absolute;
        top: 10px;
        right: 10px;
        font-size: 20px;
        cursor: pointer;
        background: none;
        border: none;
        color: red;
    }

    #DarkReader.popup-content > h1 {
        position: absolute;
        top: 0px;
        margin: 5px 0 0 0;
    }
    
    #DarkReader.popup-content > p {
        margin: 30px 0 0 0;
    }
    #DarkReader.popup-content > a {
        color: #1d5acd;
    }
    #DarkReader.popup-content > a:hover {
        color: #007bff;
    }
</style>
<div class="popup-container" id="DarkReader">
    <div id="DarkReader" class="popup-content">
        <h1>DarkReader</h1>
        <button class="close-btn" id="DarkReader" alt="Ignore">&times;</button>
        <p>It appears that DarkReader is not working on "${website}". This may be due to an AdBlocker</p>
        <a target="_blank" href="https://sleezzi.github.io/DarkReader/AdBlock">Click here to find out how to fix it</a>
    </div>
</div>`;
        document.body.appendChild(popup);
        document.querySelector("#DarkReader.close-btn").onclick = function() {
            document.querySelector('#DarkReader.popup-container').style.display = 'none';
            chrome.runtime.sendMessage(`addWebsiteToWhiteList$website=${website}`);
        }
        console.error(err);
    }
})();