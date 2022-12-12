/*
爱好论坛签到
[Script]
cron "30 8,13,18 * * *" script-path=js_aihao.js
 */
const $ = new Env('爱好论坛签到');
const notify = $.isNode() ? require('./sendNotify') : '';
let cookie = '', cookiesArr = [], result = '';
var hour = (new Date()).getHours();
var day = (new Date()).getDate();
!(async () => {
    let AHCookie = []
    if (process.env.AH_COOKIE && process.env.AH_COOKIE.indexOf('@') > -1) {
        AHCookie = process.env.AH_COOKIE.split('@');
        console.log(`您的AH_COOKIE选择的是用@隔开，共计 ${AHCookie.length} 个Cookie\n`)
    } else if (process.env.AH_COOKIE && process.env.AH_COOKIE.indexOf('&') > -1) {
        AHCookie = process.env.AH_COOKIE.split('&');
        console.log(`您的AH_COOKIE选择的是用&隔开，共计 ${AHCookie.length} 个Cookie\n`)
    } else if (process.env.AH_COOKIE && process.env.AH_COOKIE.indexOf('\n') > -1) {
        AHCookie = process.env.AH_COOKIE.split('\n');
        console.log(`您的AH_COOKIE选择的是用换行符隔开，共计 ${AHCookie.length} 个Cookie\n`)
    } else if (process.env.AH_COOKIE) {
        AHCookie = process.env.AH_COOKIE.split()
    }
    Object.keys(AHCookie).forEach((item) => {
        if (AHCookie[item]) {
            cookiesArr.push(AHCookie[item])
        }
    })
    if (!cookiesArr[0]) {
        $.msg($.name, '请先获取爱好论坛cookie');
        return;
    }
    var index = 1;
    for (let i = 0; i < cookiesArr.length; i++) {
        if (cookiesArr[i]) {
            cookie = cookiesArr[i];
            result += `账号${index}：\n`
            await aihao();
            index += 1;
        }
    }
    console.log('\n\n发送通知');
    showMsg();

})().catch((e) => { $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '') }).finally(() => { $.done(); });

async function showMsg() {
    if ($.isNode()) {
        await notify.sendNotify(`${$.name}`, result);
    }
}

function aihao() {
    return new Promise(async (resolve) => {
        try {
            console.log("爱好论坛打卡开始...");
            let header = { headers: { cookie: cookie } };
            for (i of [1, 2, 3, 4]) {
                str = ["上午打卡", "下午打卡", "晚上打卡", "全勤奖励"];
                if (i == 1 && hour != 8) {
                    console.log(str[i - 1], '：跳过')
                    continue;
                } else if (i == 2 && hour != 13) {
                    console.log(str[i - 1], '：跳过')
                    continue;
                } else if (i == 3 && hour != 18) {
                    console.log(str[i - 1], '：跳过')
                    continue;
                } else if (i == 4 && day != 28) {
                    console.log(str[i - 1], '：本月28号领取')
                    continue;
                }
                data = `button${i}=`;
                var msg = await daka(data);
                console.log(str[i - 1] + "：" + msg);
                result += str[i - 1] + "：" + msg + "\n";
                if (i == 1) {
                    msg = await newinvite();
                    console.log("邀请码：" + msg);
                    result += "邀请码：" + msg + "\n";
                }
            }
        } catch (err) {
            console.log(err);
        }
        resolve(result);
    });
}
function daka(data) {
    return new Promise(async (resolve) => {
        try {
            var options = {
                url: `https://www.aihao.cc/plugin.php?id=daka`,
                body: data,
                headers: {
                    'Cookie': cookie,
                }
            }
            $.post(options, (err, resp, data) => {
                var msg = '签到失败!原因未知';
                try {
                    if (err) {
                        console.log(JSON.stringify(err))
                        console.log(`${$.name} API请求失败，请检查网路重试`)
                    } else {
                        if (data) {
                            if (!data.match(/请先登录后才能继续使用/)) {
                                if (data.match(/未到打卡时间|您本月还未打卡|已过打卡时间/)) {
                                    msg = "还没到打卡时间呢亲_(:D)∠)_";
                                } else if (data.match(/打卡成功/)) {
                                    msg = data.match(/打卡成功！奖励金钱：\d+/);
                                } else if (data.match(/请勿重复打卡/)) {
                                    msg = "当前时间段已经打过卡了嗷(๑°3°๑)";
                                } else if (data.match(/无法获得全勤奖励/)) {
                                    msg = data.match(/无法获得全勤奖励！您本月打卡次数：\d+/);
                                } else if (data.match(/请勿重复领取！/)) {
                                    msg = '已获得全勤奖励';
                                } else {
                                    msg = "签到失败!原因未知";
                                    console.log(data);
                                }
                            } else {
                                msg = "cookie已失效";
                            }
                        }
                    }
                } catch (e) {
                    $.logErr(e, resp)
                } finally {
                    resolve(msg);
                }
            })

        } catch (err) {
            console.log(err);
        }
    });
}
function get_formhash() {
    return new Promise(async (resolve) => {
        try {
            console.log("获取 formhash");
            const options = {
                url: 'https://www.aihao.cc/home.php?mod=spacecp&ac=invite',
                headers: {
                    "Cookie": cookie,
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36 Edg/107.0.1418.62",
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                    "Accept-Encoding": "gzip, deflate, br",
                    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
                    "Host": "www.aihao.cc",
                },
                timeout: 10000
            }
            $.get(options, (err, resp, data) => {
                try {
                    if (err) {
                        console.log(JSON.stringify(err))
                        console.log(`${$.name} API请求失败，请检查网路重试`)
                    } else {
                        if (data) {
                            var inputHtml = data.match(/<input[^>]*(?:id|name)="formhash"[^>]*>/)[0];
                            data = (/value=['"]([^'"]*?)['"]/ig.exec(inputHtml) || ['', ''])[1];
                        }
                    }
                } catch (e) {
                    $.logErr(e, resp)
                } finally {
                    resolve(data);
                }
            })

        } catch (err) {
            console.log(err);
        }
    });
}
function newinvite() {
    return new Promise(async (resolve) => {
        try {
            console.log("爱好论坛获取邀请码...");
            var options = {
                url: `https://www.aihao.cc/home.php?mod=spacecp&ac=invite&appid=0&ref&inajax=1`,
                body: `invitenum=1&handlekey=newinvite&invitesubmit=true&formhash=${await get_formhash()}`,
                headers: {
                    'Cookie': cookie,
                }
            }
            $.post(options, (err, resp, data) => {
                var msg = '';
                try {
                    if (err) {
                        console.log(JSON.stringify(err))
                        console.log(`${$.name} API请求失败，请检查网路重试`)
                    } else {
                        if (data) {
                            console.info(data)
                            if (data.match(/操作成功/)) {
                                msg = "获取成功";
                            } else {
                                msg = "获取失败";
                            }
                        }
                    }
                } catch (e) {
                    $.logErr(e, resp)
                } finally {
                    resolve(msg);
                }
            })

        } catch (err) {
            resolve("获取失败");
            console.log(err);
        }
    });
}
// prettier-ignore
function Env(t, e) { "undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0); class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return "POST" === e && (s = this.post), new Promise((e, i) => { s.call(this, t, (t, s, r) => { t ? i(t) : e(s) }) }) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new class { constructor(t, e) { this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `🔔${this.name}, 开始!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; const i = this.getdata(t); if (i) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise(e => { this.get({ url: t }, (t, s, i) => e(i)) }) } runScript(t, e) { return new Promise(s => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r; const [o, h] = i.split("@"), n = { url: `http://${h}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": o, Accept: "*/*" } }; this.post(n, (t, e, i) => s(i)) }).catch(t => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e); if (!s && !i) return {}; { const i = s ? t : e; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), r = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r) } } lodash_get(t, e, s) { const i = e.replace(/\[(\d+)\]/g, ".$1").split("."); let r = t; for (const t of i) if (r = Object(r)[t], void 0 === r) return s; return r } lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t) } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : ""; if (r) try { const t = JSON.parse(r); e = t ? this.lodash_get(t, i, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i), h = i ? "null" === o ? null : o || "{}" : "{}"; try { const e = JSON.parse(h); this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i) } catch (e) { const o = {}; this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i) } } else s = this.setval(t, e); return s } getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null } setval(t, e) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = (() => { })) { t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } }).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) })) } post(t, e = (() => { })) { if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.post(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) }); else if (this.isQuanX()) t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t)); else if (this.isNode()) { this.initGotEnv(t); const { url: s, ...i } = t; this.got.post(s, i).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) }) } } time(t, e = null) { const s = e ? new Date(e) : new Date; let i = { "M+": s.getMonth() + 1, "d+": s.getDate(), "H+": s.getHours(), "m+": s.getMinutes(), "s+": s.getSeconds(), "q+": Math.floor((s.getMonth() + 3) / 3), S: s.getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in i) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length))); return t } msg(e = t, s = "", i = "", r) { const o = t => { if (!t) return t; if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : this.isSurge() ? { url: t } : void 0; if ("object" == typeof t) { if (this.isLoon()) { let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"]; return { openUrl: e, mediaUrl: s } } if (this.isQuanX()) { let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl; return { "open-url": e, "media-url": s } } if (this.isSurge()) { let e = t.url || t.openUrl || t["open-url"]; return { url: e } } } }; if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) { let t = ["", "==============📣系统通知📣=============="]; t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t) } } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { const s = !this.isSurge() && !this.isQuanX() && !this.isLoon(); s ? this.log("", `❗️${this.name}, 错误!`, t.stack) : this.log("", `❗️${this.name}, 错误!`, t) } wait(t) { return new Promise(e => setTimeout(e, t)) } done(t = {}) { const e = (new Date).getTime(), s = (e - this.startTime) / 1e3; this.log("", `🔔${this.name}, 结束! 🕛 ${s} 秒`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t) } }(t, e) }
