function GetBaseDomain(url) {
    const domainParts = url.hostname.split('.').reverse();
    if (domainParts.length >= 2) {
        if (domainParts[1].length === 2 && domainParts[0].length === 2) {
            return domainParts[2] + '.' + domainParts[1] + '.' + domainParts[0];
        }
        return domainParts[1] + '.' + domainParts[0];
    }
    return url.hostname;
}

function AlertAndLog(message) {
	alert(message);
	console.error(message);
}

function DownloadCookie(domain) {
	chrome.runtime.sendMessage({ action: "getCookies", domain: domain }, function(response) {
        if (response && response.cookies) {
            const cookies = response.cookies;
            const cookieString = cookies.map(cookie => `${cookie.name}=${cookie.value}`).join("; ");
            const blob = new Blob([cookieString], { type: "text/plain" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `${domain}_cookies.txt`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        }
    });
}

function ImportCookie(domain, file) {
	if (!file) {
	 	alert("Please select a cookie file to import.");
		return;
	}
    const reader = new FileReader();
    reader.onload = function(event) {
        const cookieString = event.target.result;
        const cookies = cookieString.split("; ").map(cookie => {
            const [name, value] = cookie.split("=");
            return { name, value };
        });
        cookies.forEach(cookie => {
            chrome.cookies.set({
                url: `https://${domain}`,
                name: cookie.name,
                value: cookie.value,
                path: "/",
				domain: domain,
                sameSite: "lax",
                secure: true
            }, function(cookie) {
                if (chrome.runtime.lastError) {
                    console.error("Failed to set cookie:", chrome.runtime.lastError);
                } else {
                    console.log("Cookie set:", cookie);
                }
            });
        });
    };
    reader.readAsText(file);
}

function CookieHandler(procedure, file) {
	let domain = document.getElementById("domain-input").value;
	if (domain) {
		procedure(domain, file);
		return;
	}
	chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
		if (chrome.runtime.lastError) {
			AlertAndLog(`Error querying tabs: ${chrome.runtime.lastError}`);
			return;
		}
		const currentTab = tabs[0];
		if (currentTab && currentTab.url) {
			domain = GetBaseDomain(new URL(currentTab.url));
			console.log(`Active tab domain name is: ${domain}`);
			procedure(domain, file);
		} else {
			AlertAndLog("Unable to get the current tab URL. Please provide the domain name throught the input.");
		}
	});
}

document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("download-cookie-button").addEventListener("click", function() {
		CookieHandler(DownloadCookie);
    });

    document.getElementById("import-cookie-button").addEventListener("click", function() {
        const fileInput = document.getElementById("cookie-file-input");
        fileInput.click();
    });

    document.getElementById("cookie-file-input").addEventListener("change", function(event) {
		const file = event.target.files[0];
		CookieHandler(ImportCookie, file);
    });
});
