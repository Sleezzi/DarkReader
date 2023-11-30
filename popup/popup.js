function clearURL(url) {
	url = new URL(url).hostname.replaceAll("www.", "");
	return url;
}

document.addEventListener("DOMContentLoaded", async function() {
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
                this.value = this.value.replace(/\n{2,}/g, "\n").replace(" ", "").replaceAll("https://", "").replaceAll("http://").toLowerCase();
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
                    alert("Saved");
                }
            };
        } else {
            chrome.tabs.query({ active: true, currentWindow: true }, async tabs => {
                if (!tabs || !tabs[0] || !tabs[0].url || !/^(https?|ftp):\/\/([^\s/$.?#].[^\s]*)$/.test(tabs[0].url)) return document.body.classList.add("error");
                // Set On if the extension is active
                response = await fetch(`https://sleezzi.github.io/DarkReader/website.txt`, { method: "GET", cache: "no-store" });
                if (response.status !== 200) throw new Error("Unable to make request: Invalid URL");
                response = await response.text();
                document.querySelector("label#name").innerHTML = `Website: ${clearURL(tabs[0].url)}`;
                document.querySelector("label#author").innerHTML = `Style made by: <b>Sleezzi</b> <span aria-label=\"Made by the Owner\" class=\"owner\">✓</span>`;
                document.querySelector("label#type").innerHTML = `Type: Auto`;
                for (const line of response.split('\n')) {
                    if (line.trim() === '' || line.trim().startsWith('!')) continue;
                    const url = line.match(/\+(.*?)\|/);
                    const style = line.match(/\$(.*?)\|/);
                    const name = line.match(/\#(.*?)\|/);
                    const author = line.match(/\@(.*?)\|/);
                    if (!url || !url[1] ||
                    !RegExp(`^${url[1].replace(/\./g, "\\.").replace(/\*/g, ".*")}$`).test(clearURL(tabs[0].url)) ||
                    !name || !name[1] ||
                    !author || !author[1] ||
                    !style || !style[1]) continue;
                    document.querySelector("label#name").innerHTML = `Website: ${name[1]}`;
                    document.querySelector("label#author").innerHTML = `Style made by: <b>${author[1].replaceAll("%verified%", "</b><span aria-label=\"Verified user\" class=\"verified\">✓</span><b>").replaceAll("%owner%", "</b><span aria-label=\"Made by the Owner\" class=\"owner\">✓</span><b>").replaceAll("&", "</b>&<b>")}</b>`;
                    document.querySelector("label#type").innerHTML = `Type: <b>Custom</b>`;
                    break;
                }
                response = await chrome.runtime.sendMessage(`isInWhiteList$website=${clearURL(tabs[0].url)}`);
                if (response === "Yes") {
                    document.querySelector("#active > input").removeAttribute("checked");
                } else {
                    document.querySelector("#active > input").setAttribute("checked", true);
                }
                // Set ON/OFF
                document.getElementById("active").onmouseup = async function() {
                    response = await chrome.runtime.sendMessage(`addWebsiteToWhiteList$website=${clearURL(tabs[0].url)}`);
                };
            });
        }
    }
});