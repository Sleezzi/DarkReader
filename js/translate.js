(async () => {
    try {
        document.querySelectorAll("*[il8n]").forEach(element => {
            if (chrome.i18n.getMessage(`${element.getAttribute("il8n")}`)) {
                element.innerHTML = chrome.i18n.getMessage(`${element.getAttribute("il8n")}`);
            }
        });
    } catch(err) {
        console.log(err);
    }
})();