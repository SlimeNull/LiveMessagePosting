document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("start").addEventListener("click", start);
    document.getElementById("stop").addEventListener("click", stop);
})

function getCurrentPage(callback) {
    chrome.tabs.query({active: true,currentWindow: true}, tabs => {
        let tab = tabs.length > 0 ? tabs[0] : null;
        callback(tab);
    });
}

function sendMessageToCurrentPage(any) {
    chrome.tabs.query({active: true,currentWindow: true}, tabs => {
        let tab = tabs[0];
        chrome.tabs.sendMessage(tab.id, any);
    });
}

let supportedPlatforms = [
    "live.bilibili.com",
    "live.douyin.com",
    "live.kuaishou.com",
    "www.huya.com",
];

function start() {
    getCurrentPage(tab => {
        let url = new URL(tab.url);
        if (supportedPlatforms.indexOf(url.hostname) < 0) {
            alert("平台不支持");
            return;
        }

        sendMessageToCurrentPage({msg:'start'});
    });
}

function stop() {
    sendMessageToCurrentPage({msg:'stop'});
}