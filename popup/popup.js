function clearURL(url) {
	if (`${url}`.includes("https://")) url = url.replace("https://", "");
	if (`${url}`.includes("http://")) url = url.replace("http://", "");
	if (`${url}`.includes("www.")) url = url.replace("www.", "");
	return url;
}

(async () => {
    let response;
    response =  await chrome.runtime.sendMessage(`termsIsAccepted`);
    if (response !== "Yes") {
        document.body.classList.add("terms");
        document.querySelector("input").onchange = function() {
            if (this.checked) {
                document.getElementById("accept").style.background = "#28a745";
                document.getElementById("accept").style.cursor = "pointer";
            } else {
                document.getElementById("accept").style.background = "#ccc";
                document.getElementById("accept").style.cursor = "not-allowed";
            }
        }
          document.getElementById("accept").onclick = function() {
            if (document.querySelector("input").checked) {
                chrome.runtime.sendMessage(`termsAccept`);
                window.location.reload();
            }
        }
    } else {
        if (window.location.href.endsWith("?options")) {
            document.body.classList.add("options");
            response = await chrome.runtime.sendMessage(`getWhiteList`);
            if (response[0] !== undefined && response[0] !== null) {
                response.forEach(url => {
                    if (document.querySelector("textarea#whitelist").cols < url.length) document.querySelector("textarea#whitelist").cols = url.length;
                });
                if (response.length > 1) {
                    document.querySelector("textarea#whitelist").value = response.join("\n");
                    document.querySelector("textarea#whitelist").rows = response.length;
                    document.querySelector("button#save").style.height = `${response.length * 15}px`;
                    document.querySelector("button#save").style.width = `${response.length * 15}px`;
                } else document.querySelector("textarea#whitelist").value = response[0];
            }
            document.querySelector("textarea#whitelist").oninput = function() {
                document.querySelector("button#save").style.display = "inline-block";
                this.value = clearURL(this.value.replace(/\n{2,}/g, "\n").replace(" ", "").toLowerCase());
                if (this.value.startsWith("\n")) this.value.replace("\n", "");
                this.rows = this.value.split("\n").length;
                document.querySelector("button#save").style.height = `${this.rows * 16}px`;
                document.querySelector("button#save").style.width = `${this.rows * 16}px`;
                document.querySelector("button#save").onmouseup = async function() {
                    if (document.querySelector("textarea#whitelist").value === "\n") return document.querySelector("textarea#whitelist").value = "";
                    if (document.querySelector("textarea#whitelist").value.startsWith("\n")) document.querySelector("textarea#whitelist").value = document.querySelector("textarea#whitelist").value.replace("\n", "");
                    if (document.querySelector("textarea#whitelist").value.endsWith("\n")) document.querySelector("textarea#whitelist").value =  document.querySelector("textarea#whitelist").value.replace(/\n$/, "");;
                    this.style.display = "none";
                    document.querySelector("textarea#whitelist").rows = document.querySelector("textarea#whitelist").value.split("\n").length;
                    await chrome.runtime.sendMessage(`setWhiteList$whitelist=${document.querySelector("textarea#whitelist").value.replaceAll("\n", "$change$")}`);
                    alert("Saved, Updates the relevant pages that are open to apply the change to it");
                }
            };
            response = await chrome.runtime.sendMessage(`getCustomOnly`);
            if (response === "Yes") {
                document.querySelector("#customOnly > input").checked = true;
            } else {
                document.querySelector("#customOnly > input").removeAttribute("checked");
            }
            document.querySelector("#customOnly").onmouseup = async function() {
                response = await chrome.runtime.sendMessage(`changeCustomOnly`);
                if (response === "Yes") {
                    document.querySelector("#customOnly > input").checked = true;
                } else {
                    document.querySelector("#customOnly > input").removeAttribute("checked");
                }
            }
        } else {
            chrome.tabs.query({ active: true, currentWindow: true }, async tabs => {
                if (!tabs || !tabs[0] || !tabs[0].url || !/^(https?|ftp):\/\/([^\s/$.?#].[^\s]*)$/.test(tabs[0].url)) return document.body.classList.add("error");
                // Set On if the extension is active
                response = await fetch(`https://darkreader.sleezzi.fr/website.txt`, { method: "GET", cache: "no-store" });
                if (response.status !== 200) throw new Error(`Unable to make request: ${response.statusText} (code: ${response.status})`);
                let finded;
                response = await response.text();
                for (const line of response.split('\n')) {
                    if (line.trim() === '' || line.trim().startsWith('!')) continue;
                    const url = line.match(/\+(.*?)\|/);
                    const style = line.match(/\$(.*?)\|/);
                    const name = line.match(/\#(.*?)\|/);
                    const author = line.match(/\@(.*?)\|/);
                    if (!url || !url[1] ||
                    !RegExp(`^${url[1].replace(/\./g, "\\.").replace(/\*/g, ".*")}$`).test(clearURL(new URL(tabs[0].url).host)) ||
                    !name || !name[1] ||
                    !author || !author[1] ||
                    !style || !style[1]) continue;
                    document.querySelector("label#name").innerHTML = `${chrome.i18n.getMessage("popup_website")}: ${name[1]}`;
                    document.querySelector("label#author").innerHTML = `${chrome.i18n.getMessage("popup_style_author")}: <b>${author[1].replaceAll("%verified%", "</b><span aria-label=\"Verified user\" class=\"verified\">✓</span><b>").replaceAll("%owner%", "</b><span aria-label=\"Made by the Owner\" class=\"owner\">✓</span><b>").replaceAll("&", "</b>&<b>")}</b>`;
                    document.querySelector("label#type").innerHTML = `${chrome.i18n.getMessage("popup_type")}: <b>${chrome.i18n.getMessage("popup_custom")}</b>`;
                    finded = true;
                    break;
                }
                response = await chrome.runtime.sendMessage(`isInWhiteList$website=${clearURL(new URL(tabs[0].url).host)}`);
                if (response !== "Yes") document.querySelector("#active > input").setAttribute("checked", true);
                if (!finded) {
                    document.querySelector("label#name").innerHTML = `${chrome.i18n.getMessage("popup_website")}: ${clearURL(new URL(tabs[0].url).host)}`;
                    document.querySelector("label#author").innerHTML = `${chrome.i18n.getMessage("popup_style_author")}: <b>Sleezzi</b> <span aria-label=\"Made by the Owner\" class=\"owner\">✓</span>`;
                    document.querySelector("label#type").innerHTML = `${chrome.i18n.getMessage("popup_type")}: ${chrome.i18n.getMessage("popup_auto")}`;
                    response = await chrome.runtime.sendMessage(`getCustomOnly`);
                    if (response === "Yes") document.querySelector("#active > input").removeAttribute("checked");
                }
                // Set ON/OFF
                document.getElementById("active").onmouseup = async function() {
                    response = await chrome.runtime.sendMessage(`addWebsiteToWhiteList$website=${clearURL(new URL(tabs[0].url).host)}`);
                    if (response === "Yes") {
                        document.querySelector("#active > input").checked = true;
                    } else {
                        document.querySelector("#active > input").removeAttribute("checked");
                    }
                };
            });
        }
    }
})();