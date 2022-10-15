chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.msg == "post") {
        fetch(request.addr, {
            method: "POST",
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                name: request.name,
                value: request.value,
                extra: request.extra
            })
        })
    }
})