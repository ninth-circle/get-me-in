chrome.runtime.onInstalled.addListener(function() {
    console.log("Extension installed");
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "getCookies") {
        const domain = request.domain;
        chrome.cookies.getAll({ domain: `.${domain}` }, function(cookies) {
            sendResponse({ cookies: cookies });
        });
        return true;
    }
});
