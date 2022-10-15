document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("start").addEventListener("click", start);
    document.getElementById("stop").addEventListener("click", stop);
})

function sendMessageToCurrentPage(any) {
    chrome.tabs.query({active: true,currentWindow: true}, tabs => {
        let tab = tabs[0];
        chrome.tabs.sendMessage(tab.id, any);
    });
}

function start() {
    sendMessageToCurrentPage({msg:'start'});
}

function stop() {
    sendMessageToCurrentPage({msg:'stop'});
}