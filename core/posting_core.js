let lastId = null;
let domSelector = null;

let idSelector = null;       // 从弹幕节点获取唯一标志 (对象或字符串id)
let nameSelector = null;     // 从弹幕节点选择弹幕发送者名称 (字符串)
let valueSelector = null;    // 从弹幕节点选择弹幕发送内容 (字符串)
let extraSelector = null;    // 弹幕的额外数据选择
let messageFilter = null;    // 弹幕消息的过滤 (过滤礼物, 进入直播间等消息)

let postAddress = null

let loop = null;

let supportedPlatforms = [
    "live.bilibili.com",
    "live.douyin.com",
    "live.kuaishou.com",
    "www.huya.com",
];

let domSelectors = {
    "live.bilibili.com":  ".danmaku-item",
    "live.douyin.com": ".webcast-chatroom___item.webcast-chatroom___enter-done",
    "live.kuaishou.com": ".chat-history .chat-info",

    "www.huya.com": "#chat-room__list > div",
};
let idSelectors = {
    "live.bilibili.com": dom => dom.dataset['ts'],
    "live.douyin.com": dom => dom.dataset['id'],
    "live.kuaishou.com": dom => dom,

    "www.huya.com": dom => dom.dataset['cmid'],
};
let nameSelectors = {
    "live.bilibili.com": dom => dom.dataset['uname'],
    "live.douyin.com": dom => dom.querySelector(".LU6dHmmD").childNodes[0].data,
    "live.kuaishou.com": dom => {
        let username = dom.querySelector(".username").innerText;
        return username.trim().substr(0, username.length);
    },

    "www.huya.com": dom => dom.querySelector(".name").innerText,
};
let valueSelectors = {
    "live.bilibili.com": dom => dom.dataset['danmaku'],
    "live.douyin.com": dom => dom.querySelector(".JqBinbea").innerText,
    "live.kuaishou.com": dom => dom.querySelector(".comment").innerText,

    "www.huya.com": dom => dom.querySelector(".msg").innerText,
};
let extraSelectors = {
    "live.bilibili.com": dom => {
        dom.dataset['uid']
    },
    "live.douyin.com": _ => {},
    "live.kuaishou.com": _ => {},

    "www.huya.com": _ => {},
};
let messageFilters = {
    "live.bilibili.com": _ => true,
    "live.douyin.com": _ => true,
    "live.kuaishou.com": dom => dom.querySelector(".comment") && !dom.querySelector(".comment.mr"),

    "www.huya.com": dom => dom.querySelector(".msg-normal") || dom.querySelector(".msg-bubble"),
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
{
    if (!request.msg) {
        return;
    }

    if (request.msg == "start") {
        let hostname = window.location.hostname;
        if (supportedPlatforms.indexOf(hostname) < 0) {
            alert("平台不支持");
            return;
        }

        domSelector = domSelectors[hostname];

        idSelector = idSelectors[hostname];
        nameSelector = nameSelectors[hostname];
        valueSelector = valueSelectors[hostname];
        extraSelector = extraSelectors[hostname];
        messageFilter = messageFilters[hostname];
        
        postAddress = window.prompt("请输入上报地址");
    
        if (!postAddress) {
            alert("输入地址为空");
            return;
        }
    
        try { new URL(postAddress) } catch {
            alert("输入地址不正确");
            return;
        }
    
        loop = setInterval(check, 300);
        alert("上报已开始");
    } else if (request.msg == "stop") {
        if (loop == null) {
            alert("上报没有在运行")
            return;
        }

        clearInterval(loop);
        alert("上报已停止");
    }
});

function check() {
    let lastIndex = -1;
    let allDanmaku = document.querySelectorAll(domSelector)
    for (let i = 0; i < allDanmaku.length; i++) {
        if (idSelector(allDanmaku[i]) == lastId) {
            lastIndex = i;
            break;
        }
    }

    if (lastIndex == -1) {
        console.log('没找到上一个 id');
    }

    for (let i = lastIndex + 1; i < allDanmaku.length; i++) {
        if (!messageFilter(allDanmaku[i])) {
            continue;
        }

        chrome.runtime.sendMessage({
            msg: 'post',
            name: nameSelector(allDanmaku[i]),
            value: valueSelector(allDanmaku[i]),
            extra: extraSelector(allDanmaku[i]),
            addr: postAddress
        })
    }

    if (allDanmaku.length != 0) {
        lastId = idSelector(allDanmaku[allDanmaku.length - 1]);
    }
}