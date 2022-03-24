/*
超级互动城

[task_local]
cron 10 8,18 * * * jd_attentionActivity.js, tag=超级互动城, enabled=true
 */
const $ = new Env('超级互动城');
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
let UA = require('./USER_AGENTS.js').USER_AGENT;
const notify = $.isNode() ? require('./sendNotify') : '';
//IOS等用户直接用NobyDa的jd cookie
let cookiesArr = [],
    cookie = '';
if ($.isNode()) {
    Object.keys(jdCookieNode).forEach((item) => {
        cookiesArr.push(jdCookieNode[item])
    })
    if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};
} else {
    cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
}

!(async () => {
    if (!cookiesArr[0]) {
        $.msg($.name, '【提示】请先获取cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/', {
            "open-url": "https://bean.m.jd.com/"
        });
        return;
    }
    $.taskList = []
    $.activityUrl = ""
    $.stop = false
    $.needDoTask = []
    $.venderIds = new Map()
    $.signIds = new Map()
    $.firstSecretPin = ""
    $.skipShop = []
    for (let i = 0; i < cookiesArr.length; i++) {
        cookie = cookiesArr[i];
        if (cookie) {
            $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
            $.index = i + 1;
            $.isLogin = true;
            $.nickName = '';
            console.log(`\n\n******开始【京东账号${$.index}】${$.nickName || $.UserName}*********\n`);
            if (!$.isLogin) {
                $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {
                    "open-url": "https://bean.m.jd.com/bean/signIndex.action"
                });
                if ($.isNode()) {
                    await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
                }
                continue
            }
            
            await taskToken();

            await $.wait(1000)

            if (!$.secretPin) {
                $.log("黑号!")
                await $.wait(5000)
                continue
            }
            // $.stop = false
            // $.skipShop = []
            // await taskAllActivitys(8,2)//关注商品最新
            // if (!$.stop) {
            //     await $.wait((5 + Math.random()) * 1000)
            //     await taskAllActivitys(8, 1)//关注商品最热
            // }
            // await $.wait((15 + Math.random()) * 1000)

            $.skipShop = []
            $.stop = false
            await taskAllActivitys(3, 2)//抽奖最新
            if (!$.stop) {
                await $.wait((5 + Math.random()) * 1000)
                await taskAllActivitys(3, 1)//抽奖最热
            }
            await $.wait((15 + Math.random()) * 1000)
           
            $.skipShop = []
            $.stop = false
            await taskAllActivitys(5, 2)//签到最新
            if (!$.stop) {
                await $.wait((5 + Math.random()) * 1000)
                await taskAllActivitys(5, 1)//签到最热
            }
            await $.wait((15 + Math.random()) * 1000)

            $.skipShop = []
            $.stop = false
            await taskAllActivitys(7, 2)//加购最新
            if (!$.stop) {
                await $.wait((5 + Math.random()) * 1000)
                await taskAllActivitys(7, 1)//加购最热
            }
        }
    }
})()
    .catch((e) => $.logErr(e))
    .finally(() => $.done())
async function taskToken() {

    $.LZ_TOKEN_KEY = "";
    $.LZ_TOKEN_VALUE = "";
    await getCommonInfoToken();

    $.isvObfuscatorToken = ""
    await getIsvObfuscatorToken();

    $.lz_jdpin_token = ""
    $.secretPin = ""
    await getMyPing()

}
async function taskAllActivitys(aggrateActType, type) {
    $.taskList = [];
    console.log(`\n******开始查询所有活动 ${aggrateActType}-${type} *********\n`);
    await getAllActivitys(aggrateActType, type);
    if(!($.taskList && $.taskList.length>0)){
        console.log(`刷新bin`)
        await $.wait(3000)
        await taskToken();
        await getAllActivitys(aggrateActType, type);
    }
    console.log(`\n******活动数目为：${$.taskList.length}*********\n`);
    await $.wait(2000)
    console.log(`\n******开始筛选正在进行的活动*********\n`);
    if ($.taskList && aggrateActType == 8) {
        console.log(`\n******开始 关注有礼*********\n`);
        for (let j = 0; j < $.taskList.length; j++) {
            if ($.stop) {
                console.info("到达今日上线，停止运行")
                break;
            }
            let item = $.taskList[j]
            if ($.skipShop.includes(item.shopName)) {
                console.log(`\n******第${j + 1}个活动,店铺名:${item.shopName},跳过*********\n`)
                continue;
            }
            $.isContinue = false
            await accessLogWithAD(item);
            await queryActivityInfo(item);
            await $.wait(3000)
            if (!$.isContinue) {
                $.isContinue = false
                if (item.activityTitle.includes("店铺")) {
                    console.log(`\n******第${j + 1}个活动,店铺名:${item.shopName},${item.activityTitle},跳过*********\n`)
                    // await followShop(item);
                    // await $.wait((3 + Math.random()) * 1000)
                    // if (!$.isContinue)
                    //     await wxShopFollowActivity_getPrize(item);
                } else if (item.activityTitle.includes("商品")) {
                    $.skus = []
                    // await getActMemberInfo(item);
                    $.needCollectionSize = 0;
                    $.hasCollectionSize = 0;
                    var data = await findSkus(item)
                    console.log(`\n******第${j + 1}个活动,店铺名:${item.shopName},开始${item.activityTitle}*********\n`)
                    if (!data) {
                        console.log(`刷新bin`)
                        await $.wait(1000)
                        await taskToken();
                        data = await findSkus(item)
                    }
                    if (!(data && data.drawInfo && data.drawInfo.name.includes('京豆'))) {
                        console.log('奖励不是京豆',(data && data.drawInfo)?data.drawInfo.name:"")
                        continue;
                    }
                    if ($.skus.length > 0) {
                        if (data.needFollow && !data.hasFollow) {
                            await followShop(item);
                            await $.wait((3 + Math.random()) * 1000)
                        }
                        console.log(`\n******第${j + 1}个活动,店铺名:${item.shopName},需要关注${$.needCollectionSize}个商品*********\n`)
                        for (let k = $.hasCollectionSize; k < $.skus.length; k++) {
                            let sku = $.skus[k]
                            if (!sku) break;
                            console.log(`\n******店铺名:${item.shopName},开始关注第${k + 1}个商品*********\n`)
                            if (!sku.collection) {
                                var data = await collection(item, sku);
                                if (!data) {
                                    console.log(`刷新bin`)
                                    await $.wait(1000)
                                    await taskToken();
                                    data = await collection(item, sku);
                                }
                                if ($.isContinue) {
                                    break;
                                }
                                await $.wait((2 + Math.random()) * 1000)
                            } else {
                                console.log(`已关注`)
                                $.hasCollectionSize += 1;
                            }
                            if ($.hasCollectionSize >= $.needCollectionSize) {
                                console.log(`\n******店铺名:${item.shopName},关注第${k + 1}个商品完成,尝试领取奖励*********\n`)
                                await getPrize(item);
                                await $.wait((3 + Math.random()) * 1000)
                                break;
                            }
                        }
                        console.log(`\n******店铺名:${item.shopName},${$.skus.length}个商品已经全部关注完成*********\n`)
                    } else {
                        console.log(`\n******第${j + 1}个活动,店铺名:${item.shopName},没有需要关注的商品，跳过*********\n`)
                        $.skipShop.push(item.shopName)
                    }
                }
            } else {
                console.log(`\n******第${j + 1}个活动,店铺名:${item.shopName},奖品不是京豆，跳过*********\n`)
                $.skipShop.push(item.shopName)
            }
        }
    } else if ($.taskList && aggrateActType == 3) {
        console.log(`\n******开始 抽奖*********\n`);
        for (let j = 0; j < $.taskList.length; j++) {
            if ($.stop) {
                console.info("到达今日上线，停止运行")
                break;
            }
            $.canDrawTimes = 0
            let item = $.taskList[j]
            if ($.skipShop.includes(item.shopName)) {
                console.log(`\n******第${j + 1}个店铺:${item.shopName},跳过*********\n`)
                continue;
            }
            $.skipShop.push(item.shopName)
            $.isContinue = false
            await accessLogWithAD(item);
            var data =await wxDrawActivity_activityContent(item.activityId);
            if (!data) {
                console.log(`刷新bin`)
                await $.wait(1000)
                await taskToken();
                data =await wxDrawActivity_activityContent(item.activityId);
            }
            if (!$.isContinue) {
                console.log(`\n******第${j + 1}个店铺:${item.shopName}*********\n`)
                $.canDrawTimes = $.shipInfo.canDrawTimes;
                while ($.canDrawTimes > 0) {
                    $.canDrawTimes -= 1
                    await wxDrawActivity_start(item.activityId)
                    await $.wait((5 + Math.random()) * 1000)
                }
            } else {
                console.log(`\n******第${j + 1}个活动,店铺名:${item.shopName},跳过*********\n`)
            }
            await $.wait((5 + Math.random()) * 1000)
        }
    } else if ($.taskList && aggrateActType == 5) {
        console.log(`\n******开始 签到*********\n`);
        for (let j = 0; j < $.taskList.length; j++) {
            if ($.stop) {
                console.info("到达今日上线，停止运行")
                break;
            }
            let item = $.taskList[j]
            if ($.skipShop.includes(item.shopName)) {
                console.log(`\n******第${j + 1}个店铺:${item.shopName},跳过*********\n`)
                continue;
            }
            console.log(`\n******第${j + 1}个店铺:${item.shopName}*********\n`)
            $.isContinue = false
            await accessLogWithAD(item);
            var data =await getActivity(item);
            if (!data || (data && data.code == '-1')) {
                console.log(`刷新bin`)
                await $.wait(1000)
                await taskToken();
                data =await getActivity(item);
            }
            await $.wait((1 + Math.random()) * 1000)
            if ($.isContinue) {
                await $.wait((3 + Math.random()) * 1000)
                continue;
            }
            var data = await getSignInfo(item);
            if (!data) {
                console.log(`刷新bin`)
                await $.wait(1000)
                await taskToken();
                data = await getSignInfo(item);
            }
            await $.wait((1 + Math.random()) * 1000)
            if ($.isContinue) {
                await $.wait((3 + Math.random()) * 1000)
                continue;
            }
            await signUp(item);
            if (!$.isContinue)
                console.log(`签到成功`)
            await $.wait((3 + Math.random()) * 1000)

        }
    } else if ($.taskList && aggrateActType == 7) {
        console.log(`\n******开始 加购有礼*********\n`);
        for (let j = 0; j < $.taskList.length; j++) {
            if ($.stop) {
                console.info("到达今日上线，停止运行")
                break;
            }
            let item = $.taskList[j]
            if ($.skipShop.includes(item.shopName)) {
                console.log(`\n******第${j + 1}个活动,店铺名:${item.shopName},跳过*********\n`)
                continue;
            }
            $.isContinue = false
            await accessLogWithAD(item);
            await queryActivityInfo(item);
            await $.wait(3000)
            if (!$.isContinue) {
                $.isContinue = false
                $.skus = []
                // await getActMemberInfo(item);
                $.needAddCartSize = 0;
                $.hasAddCartSize = 0;
                $.oneKeyAddCart = false;
                var data = await findSkus(item)
                console.log(`\n******第${j + 1}个活动,店铺名:${item.shopName},开始${item.activityTitle}*********\n`)
              
                if (!data) {
                    console.log(`刷新bin`)
                    await $.wait(1000)
                    await taskToken();
                    data = await findSkus(item)
                }
                if (data.drawInfo && !data.drawInfo.name.includes('京豆')) {
                    console.log('奖励不是京豆', data.drawInfo.name)
                    continue;
                }
                if (data.needFollow && !data.hasFollow) {
                    await followShop(item);
                    await $.wait((3 + Math.random()) * 1000)
                }
                let productIds = [];
                if ($.skus.length > 0) {
                    console.log(`\n******第${j + 1}个活动,店铺名:${item.shopName},需要加购${$.needAddCartSize}个商品*********\n`)
                    for (let k = 0; k < $.skus.length; k++) {
                        let sku = $.skus[k]
                        if ($.oneKeyAddCart) {
                            productIds.push(sku.skuId)
                            continue
                        }
                        console.log(`\n******店铺名:${item.shopName},开始加购第${k + 1}个商品*********\n`)
                        if (!sku.collection) {
                            var data = await addCart(item, sku);
                            if (!data) {
                                console.log(`刷新bin`)
                                await $.wait(1000)
                                await taskToken();
                                data = await addCart(item, sku);
                            }
                            if ($.isContinue) {
                                break;
                            }
                            await $.wait((5 + Math.random()) * 1000)
                        } else {
                            console.log(`已加购`)
                        }
                        if ($.hasAddCartSize >= $.needAddCartSize) {
                            console.log(`\n******店铺名:${item.shopName},加购第${k + 1}个商品完成,尝试领取奖励*********\n`)
                            await getPrize(item);
                            await $.wait((3 + Math.random()) * 1000)
                            break;
                        }
                    }
                    console.log(`\n******店铺名:${item.shopName},${$.skus.length}个商品已经全部加购完成*********\n`)
                }
                if ($.oneKeyAddCart) {
                    await oneKeyAddCart(item, productIds);
                    await $.wait((3 + Math.random()) * 1000)
                    if ($.hasAddCartSize >= $.needAddCartSize) {
                        console.log(`\n******店铺名:${item.shopName},已加购${$.hasAddCartSize}个商品,尝试领取奖励*********\n`)
                        await getPrize(item);
                        await $.wait((3 + Math.random()) * 1000)
                    }
                } 
                $.skipShop.push(item.shopName)
            } else {
                console.log(`\n******第${j + 1}个活动,店铺名:${item.shopName},奖品不是京豆，跳过*********\n`)
                $.skipShop.push(item.shopName)
            }
        }
    }
}
function getPrize(item) {
    return new Promise(resolve => {
        let options = {
            url: `https://lzkj-isv.isvjd.com/wxCollectionActivity/getPrize`,
            body: `activityId=${item.activityId}&pin=${encodeURIComponent($.secretPin)}`,
            headers: {
                'Accept':'application/json, text/javascript, */*; q=0.01',
                'User-Agent': `Mozilla/5.0 (Linux; U; Android 8.0.0; zh-cn; Mi Note 2 Build/OPR1.170623.032) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/61.0.3163.128 Mobile Safari/537.36 XiaoMi/MiuiBrowser/10.1.1`,
                'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8',
                'X-Requested-With':'XMLHttpRequest',
                'Host':'lzkjdz-isv.isvjd.com',
                'Origin':'https://lzkjdz-isv.isvjd.com',
                'Referer':`https://lzkjdz-isv.isvjcloud.com/wxTeam/activity2/${item.activityId}?activityId=${item.activityId}&adsource=cjhdc`,
                'Cookie': `LZ_TOKEN_KEY=${$.LZ_TOKEN_KEY}; LZ_TOKEN_VALUE=${$.LZ_TOKEN_VALUE};lz_wq_auth_token=${$.isvObfuscatorToken}`,
            }
        }
        $.post(options, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    console.log(data)
                    if(data){
                        data = JSON.parse(data);
                        if(data.data && data.data.name){
                            console.log("领取成功：", data.data.name)
                        }
                        if(data.errorMessage){
                            console.log(data.errorMessage)
                        }
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data.data);
            }
        })
    })
}

function wxShopFollowActivity_getPrize(item) {
    return new Promise(resolve => {
        let options = {
            url: `https://lzkj-isv.isvjd.com/wxShopFollowActivity/getPrize`,
            body: `activityId=${item.activityId}&pin=${encodeURIComponent($.secretPin)}`,
            headers: {
                'Accept':'application/json, text/javascript, */*; q=0.01',
                'User-Agent': `Mozilla/5.0 (Linux; U; Android 8.0.0; zh-cn; Mi Note 2 Build/OPR1.170623.032) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/61.0.3163.128 Mobile Safari/537.36 XiaoMi/MiuiBrowser/10.1.1`,
                'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8',
                'X-Requested-With':'XMLHttpRequest',
                'Host':'lzkjdz-isv.isvjd.com',
                'Origin':'https://lzkjdz-isv.isvjd.com',
                'Referer':`https://lzkjdz-isv.isvjcloud.com/wxShopFollowActivity/activity/${item.activityId}?activityId=${item.activityId}&adsource=cjhdc`,
                'Cookie': `LZ_TOKEN_KEY=${$.LZ_TOKEN_KEY}; LZ_TOKEN_VALUE=${$.LZ_TOKEN_VALUE};lz_wq_auth_token=${$.isvObfuscatorToken}`,
            }
        }
        $.post(options, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if(data){
                        data = JSON.parse(data);
                        if(data.data && data.data.name){
                            console.log("")
                        }
                        if(data.errorMessage){
                            console.log(data.errorMessage)
                        }
                    }
                    console.log('wxShopFollowActivity_getPrize',data)
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data.data);
            }
        })
    })
}

function collection(item,sku) {
    $.stop = false
    $.isContinue = false
    return new Promise(resolve => {
        let options = {
            url: `https://lzkj-isv.isvjd.com/wxCollectionActivity/collection`,
            body: `activityId=${item.activityId}&pin=${encodeURIComponent($.secretPin)}&productId=${sku.skuId}`,
            headers: {
                'Accept':'application/json, text/javascript, */*; q=0.01',
                'User-Agent': `Mozilla/5.0 (Linux; U; Android 8.0.0; zh-cn; Mi Note 2 Build/OPR1.170623.032) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/61.0.3163.128 Mobile Safari/537.36 XiaoMi/MiuiBrowser/10.1.1`,
                'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8',
                'X-Requested-With':'XMLHttpRequest',
                'Host':'lzkjdz-isv.isvjd.com',
                'Origin':'https://lzkjdz-isv.isvjd.com',
                'Referer':`https://lzkjdz-isv.isvjcloud.com/wxTeam/activity2/${item.activityId}?activityId=${item.activityId}&adsource=cjhdc`,
                'Cookie': `LZ_TOKEN_KEY=${$.LZ_TOKEN_KEY}; LZ_TOKEN_VALUE=${$.LZ_TOKEN_VALUE};lz_wq_auth_token=${$.isvObfuscatorToken};${$.AUTH_C_USER && "AUTH_C_USER=" + $.AUTH_C_USER + ";" || ""}`,
            }
        }
        $.post(options, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if (data) {
                        data = JSON.parse(data);
                        if (data.result) {
                            data = data.data;
                            if (data.hasCollectionSize) {
                                console.log(`关注商品成功`)
                                $.hasCollectionSize = data.hasCollectionSize;
                            }
                        }else{
                            $.isContinue = true
                        }
                    }else{
                        $.isContinue = true
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data);
            }
        })
    })
}

function addCart(item,sku) {
    return new Promise(resolve => {
        let options = {
            url: `https://lzkj-isv.isvjd.com/wxCollectionActivity/addCart`,
            body: `activityId=${item.activityId}&pin=${encodeURIComponent($.secretPin)}&productId=${sku.skuId}`,
            headers: {
                'Accept':'application/json, text/javascript, */*; q=0.01',
                'User-Agent': `Mozilla/5.0 (Linux; U; Android 8.0.0; zh-cn; Mi Note 2 Build/OPR1.170623.032) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/61.0.3163.128 Mobile Safari/537.36 XiaoMi/MiuiBrowser/10.1.1`,
                'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8',
                'X-Requested-With':'XMLHttpRequest',
                'Host':'lzkjdz-isv.isvjd.com',
                'Origin':'https://lzkjdz-isv.isvjd.com',
                'Referer':`https://lzkjdz-isv.isvjcloud.com/wxTeam/activity2/${item.activityId}?activityId=${item.activityId}&adsource=cjhdc`,
                'Cookie': `LZ_TOKEN_KEY=${$.LZ_TOKEN_KEY}; LZ_TOKEN_VALUE=${$.LZ_TOKEN_VALUE};lz_wq_auth_token=${$.isvObfuscatorToken};${$.AUTH_C_USER && "AUTH_C_USER=" + $.AUTH_C_USER + ";" || ""}`,
            }
        }
        $.post(options, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if (data) {
                        data = JSON.parse(data);
                        data = data.data;
                        if (data && data.hasAddCartSize) {
                            $.hasAddCartSize = data.hasAddCartSize;
                            console.log(`加购商品成功`)
                        } else {
                            console.info(data)
                            $.hasAddCartSize += 1;
                        }
                    } else {
                        $.hasAddCartSize += 1;
                        // $.isContinue = true
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data);
            }
        })
    })
}

function oneKeyAddCart(item,productIds) {
    $.isContinue = false
    return new Promise(resolve => {
        let options = {
            url: `https://lzkj-isv.isvjd.com/wxCollectionActivity/oneKeyAddCart`,
            body: `activityId=${item.activityId}&pin=${encodeURIComponent($.secretPin)}&productIds=${encodeURIComponent(JSON.stringify(productIds))}`,
            headers: {
                'Accept':'application/json, text/javascript, */*; q=0.01',
                'User-Agent': `Mozilla/5.0 (Linux; U; Android 8.0.0; zh-cn; Mi Note 2 Build/OPR1.170623.032) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/61.0.3163.128 Mobile Safari/537.36 XiaoMi/MiuiBrowser/10.1.1`,
                'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8',
                'X-Requested-With':'XMLHttpRequest',
                'Host':'lzkjdz-isv.isvjd.com',
                'Origin':'https://lzkjdz-isv.isvjd.com',
                'Referer':`https://lzkjdz-isv.isvjcloud.com/wxTeam/activity2/${item.activityId}?activityId=${item.activityId}&adsource=cjhdc`,
                'Cookie': `LZ_TOKEN_KEY=${$.LZ_TOKEN_KEY}; LZ_TOKEN_VALUE=${$.LZ_TOKEN_VALUE};lz_wq_auth_token=${$.isvObfuscatorToken};${$.AUTH_C_USER && "AUTH_C_USER=" + $.AUTH_C_USER + ";" || ""}`,
            }
        }
        $.post(options, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if (data) {
                        console.info('oneKeyAddCart',data)
                        data = JSON.parse(data);
                        if(data.data && data.data.hasCollectionSize){
                            $.hasCollectionSize = data.data.hasCollectionSize;
                            console.log(`关注商品成功`)
                        }
                        if(data.data && data.data.hasAddCartSize){
                            $.hasAddCartSize = data.data.hasAddCartSize;
                            console.log(`加购商品成功`)
                        }
                    }else{
                        $.isContinue = true
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data.data);
            }
        })
    })
}

function followShop(item) {
    
    $.isContinue = false
    return new Promise(resolve => {
        var url = `https://lzkj-isv.isvjd.com/wxActionCommon/followShop`;
        var body = `userId=${item.venderId}&buyerNick=${encodeURIComponent($.secretPin)}&activityId=${item.activityId}&activityType=5`
        var Referer = `https://lzkjdz-isv.isvjcloud.com/wxTeam/activity2/${item.activityId}?activityId=${item.activityId}&adsource=cjhdc`
        if (item.activityTitle.includes("店铺")) {
            url = `https://lzkj-isv.isvjcloud.com/wxShopFollowActivity/follow`;
            body = `pin=${encodeURIComponent($.secretPin)}&activityId=${item.activityId}`
            Referer = `https://lzkj-isv.isvjcloud.com/wxShopFollowActivity/activity/${item.activityId}?activityId=${item.activityId}&adsource=cjhdc`
        }
        let options = {
            url: url,
            body: body,
            headers: {
                'Accept':'application/json, text/javascript, */*; q=0.01',
                'User-Agent': `Mozilla/5.0 (Linux; U; Android 8.0.0; zh-cn; Mi Note 2 Build/OPR1.170623.032) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/61.0.3163.128 Mobile Safari/537.36 XiaoMi/MiuiBrowser/10.1.1`,
                'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8',
                'X-Requested-With':'XMLHttpRequest',
                'Host':'lzkjdz-isv.isvjd.com',
                'Origin':'https://lzkjdz-isv.isvjd.com',
                'Referer':Referer,
                'Cookie': `LZ_TOKEN_KEY=${$.LZ_TOKEN_KEY}; LZ_TOKEN_VALUE=${$.LZ_TOKEN_VALUE};lz_wq_auth_token=${$.isvObfuscatorToken};${$.AUTH_C_USER && "AUTH_C_USER=" + $.AUTH_C_USER + ";" || ""}`,
            }
        }
        $.post(options, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if (data && data != "") {
                        data = JSON.parse(data);
                        if (data && data.result) {
                            console.log("关注店铺成功")
                        }else{
                            $.isContinue = true
                            console.info('followShop',data)
                        }
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data.data);
            }
        })
    })
}

function findSkus(item) {
    $.isContinue = false
    return new Promise(resolve => {
        let options = {
            url: ` https://lzkj-isv.isvjcloud.com/wxCollectionActivity/activityContent`,
            body: `activityId=${item.activityId}&pin=${encodeURIComponent($.secretPin)}`,
            headers: {
                'Accept':'application/json, text/javascript, */*; q=0.01',
                'User-Agent': `Mozilla/5.0 (Linux; U; Android 8.0.0; zh-cn; Mi Note 2 Build/OPR1.170623.032) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/61.0.3163.128 Mobile Safari/537.36 XiaoMi/MiuiBrowser/10.1.1`,
                'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8',
                'X-Requested-With':'XMLHttpRequest',
                'Host':'lzkjdz-isv.isvjd.com',
                'Origin':'https://lzkjdz-isv.isvjd.com',
                'Referer':`https://lzkjdz-isv.isvjcloud.com/wxTeam/activity2/${item.activityId}?activityId=${item.activityId}&adsource=cjhdc`,
                'Cookie': `LZ_TOKEN_KEY=${$.LZ_TOKEN_KEY}; LZ_TOKEN_VALUE=${$.LZ_TOKEN_VALUE};lz_wq_auth_token=${$.isvObfuscatorToken};${$.AUTH_C_USER && "AUTH_C_USER=" + $.AUTH_C_USER + ";" || ""}`,
            }
        }
        $.post(options, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if(data && data != ""){
                        data = JSON.parse(data);
                        data = data.data;
                        if (data && data.cpvos && data.cpvos.length > 0) {
                            $.needCollectionSize = data.needCollectionSize;
                            $.hasCollectionSize = data.hasCollectionSize;

                            $.needAddCartSize = data.needCollectionSize;
                            $.hasAddCartSize = data.hasCollectionSize;

                            if (data.oneKeyAddCart)
                                $.oneKeyAddCart = data.oneKeyAddCart * 1 === 1;
                            $.skus = data.cpvos
                        } else {
                            $.isContinue = true
                        }
                    }

                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data);
            }
        })
    })
}

function getActMemberInfo(item) {
    return new Promise(resolve => {
        let options = {
            url: `https://lzkj-isv.isvjd.com/wxCommonInfo/getActMemberInfo`,
            body: `activityId=${item.activityId}&pin=${encodeURIComponent($.secretPin)}&venderId=${item.venderId}`,
            headers: {
                'Accept':'application/json, text/javascript, */*; q=0.01',
                'User-Agent': `Mozilla/5.0 (Linux; U; Android 8.0.0; zh-cn; Mi Note 2 Build/OPR1.170623.032) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/61.0.3163.128 Mobile Safari/537.36 XiaoMi/MiuiBrowser/10.1.1`,
                'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8',
                'X-Requested-With':'XMLHttpRequest',
                'Host':'lzkjdz-isv.isvjd.com',
                'Origin':'https://lzkjdz-isv.isvjd.com',
                'Referer':`https://lzkjdz-isv.isvjcloud.com/wxTeam/activity2/${item.activityId}?activityId=${item.activityId}&adsource=cjhdc`,
                'Cookie': `LZ_TOKEN_KEY=${$.LZ_TOKEN_KEY}; LZ_TOKEN_VALUE=${$.LZ_TOKEN_VALUE};AUTH_C_USER=${$.AUTH_C_USER};lz_jdpin_token=${$.lz_jdpin_token};lz_wq_auth_token=${$.isvObfuscatorToken}`,
            }
        }
        $.post(options, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if(resp.statusCode == 200){
                        let cookies = resp.headers['set-cookie']
                        $.LZ_TOKEN_KEY = cookies[0].substring(cookies[0].indexOf("=") + 1, cookies[0].indexOf(";"))
                        $.LZ_TOKEN_VALUE = cookies[1].substring(cookies[1].indexOf("=") + 1, cookies[1].indexOf(";")).replace("==","")

                    }
                    data = JSON.parse(data);
                    if(data && data.data){
                        //TODO
                        console.log("")

                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data.data);
            }
        })
    })
}

function accessLogWithAD(item) {
    return new Promise(resolve => {
        let pageUrl = `https://lzkj-isv.isvjd.com/wxShopFollowActivity/activity/${item.activityId}?activityId=${item.activityId}&adsource=cjhdc`
        let options = {
            url: `https://lzkjdz-isv.isvjcloud.com/common/accessLogWithAD`,
            body: `venderId=${item.venderId}&code=17&pin=${encodeURIComponent($.secretPin)}&activityId=${item.activityId}&subType=app&pageUrl=${encodeURIComponent(pageUrl)}&adSource=cjhdc`,
            headers: {
                'Accept':'application/json, text/javascript, */*; q=0.01',
                'User-Agent': `Mozilla/5.0 (Linux; U; Android 8.0.0; zh-cn; Mi Note 2 Build/OPR1.170623.032) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/61.0.3163.128 Mobile Safari/537.36 XiaoMi/MiuiBrowser/10.1.1`,
                'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8',
                'X-Requested-With':'XMLHttpRequest',
                'Host':'lzkjdz-isv.isvjd.com',
                'Origin':'https://lzkjdz-isv.isvjd.com',
                'Referer':`https://lzkj-isv.isvjd.com/wxShopFollowActivity/activity/${item.activityId}?activityId=${item.activityId}&adsource=cjhdc`,
                'Cookie': `LZ_TOKEN_KEY=${$.LZ_TOKEN_KEY}; LZ_TOKEN_VALUE=${$.LZ_TOKEN_VALUE};AUTH_C_USER=${$.AUTH_C_USER};lz_jdpin_token=${$.lz_jdpin_token};lz_wq_auth_token=${$.isvObfuscatorToken}`,
            }
        }
        $.post(options, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if(resp.statusCode == 200){
                        let cookies = resp.headers['set-cookie']
                        if(cookies && cookies[0] && cookies[1]){
                            $.LZ_TOKEN_KEY = cookies[0].substring(cookies[0].indexOf("=") + 1, cookies[0].indexOf(";"))
                            $.LZ_TOKEN_VALUE = cookies[1].substring(cookies[1].indexOf("=") + 1, cookies[1].indexOf(";"))
                        }
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data);
            }
        })
    })
}

function queryActivityInfo(item) {
    $.isContinue = false
    return new Promise(resolve => {
        let options = {
            url: `https://lzkj-isv.isvjd.com/wxShopFollowActivity/activityContentOnly`,
            body: `activityId=${item.activityId}&pin=${encodeURIComponent($.secretPin)}&signUuid=`,
            headers: {
                'Accept':'application/json, text/javascript, */*; q=0.01',
                'User-Agent': `Mozilla/5.0 (Linux; U; Android 8.0.0; zh-cn; Mi Note 2 Build/OPR1.170623.032) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/61.0.3163.128 Mobile Safari/537.36 XiaoMi/MiuiBrowser/10.1.1`,
                'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8',
                'X-Requested-With':'XMLHttpRequest',
                'Host':'lzkjdz-isv.isvjd.com',
                'Origin':'https://lzkjdz-isv.isvjd.com',
                'Referer':`https://lzkjdz-isv.isvjcloud.com/wxTeam/activity2/${item.activityId}?activityId=${item.activityId}&adsource=cjhdc`,
                'Cookie': `LZ_TOKEN_KEY=${$.LZ_TOKEN_KEY}; LZ_TOKEN_VALUE=${$.LZ_TOKEN_VALUE};lz_wq_auth_token=${$.isvObfuscatorToken}`,
            }
        }
        $.post(options, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    // console.info('queryActivityInfo',data)
                    if(data && data != ""){
                        data = JSON.parse(data);
                        if(data.data){
                            let drawContentVOs = data.data.drawContentVOs
                            if(drawContentVOs){
                                let hasBean = false
                                for(let i =0;i < drawContentVOs.l;i++){
                                    let drawContentVO = drawContentVOs[i]
                                    //京豆
                                    if(drawContentVO.type == 6){
                                        hasBean = true
                                        break
                                    }
                                }
                                if(!hasBean){
                                    $.isContinue = true
                                }
                            }
                        }
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data.data);
            }
        })
    })
}
function signUp(item) {
    $.isContinue = false
    return new Promise(resolve => {
        var url = 'https://lzkj-isv.isvjd.com/sign/wx/signUp'
        if (item.activityUrl.includes("sevenDay")) {
            url = "https://lzkj-isv.isvjd.com/sign/sevenDay/wx/signUp"
        }
        let options = {
            url: url,
            body: `pin=${encodeURIComponent($.secretPin)}&actId=${item.activityId}`,
            headers: {
                'Accept': 'application/json, text/javascript, */*; q=0.01',
                'User-Agent': `Mozilla/5.0 (Linux; U; Android 8.0.0; zh-cn; Mi Note 2 Build/OPR1.170623.032) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/61.0.3163.128 Mobile Safari/537.36 XiaoMi/MiuiBrowser/10.1.1`,
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'X-Requested-With': 'XMLHttpRequest',
                'Host': 'lzkjdz-isv.isvjd.com',
                'Origin': 'https://lzkjdz-isv.isvjd.com',
                'Referer': item.activityUrl,
                'Cookie': `LZ_TOKEN_KEY=${$.LZ_TOKEN_KEY}; LZ_TOKEN_VALUE=${$.LZ_TOKEN_VALUE};lz_wq_auth_token=${$.isvObfuscatorToken}`,
            }
        }
        $.post(options, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {

                    if (data) {
                        data = JSON.parse(data);
                        if (!(data && data.isOk)) {
                            $.isContinue = true
                        } else {
                            console.info('signUp，isOk：', data.isOk)
                        }
                    } else {
                        $.isContinue = true
                    }
                    if ($.isContinue)
                        console.info('signUp', data)
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data);
            }
        })

    })
}
function getSignInfo(item) {
    $.stop = false
    $.isContinue = false
    return new Promise(resolve => {
        var url = 'https://lzkj-isv.isvjd.com/sign/wx/getSignInfo'
        if (item.activityUrl.includes("sevenDay")) {
            url = "https://lzkj-isv.isvjd.com/sign/sevenDay/wx/getSignInfo"
        }
        let options = {
            url: url,
            body: `pin=${encodeURIComponent($.secretPin)}&actId=${item.activityId}&venderId=${item.venderId}`,
            headers: {
                'Accept': 'application/json, text/javascript, */*; q=0.01',
                'User-Agent': `Mozilla/5.0 (Linux; U; Android 8.0.0; zh-cn; Mi Note 2 Build/OPR1.170623.032) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/61.0.3163.128 Mobile Safari/537.36 XiaoMi/MiuiBrowser/10.1.1`,
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'X-Requested-With': 'XMLHttpRequest',
                'Host': 'lzkjdz-isv.isvjd.com',
                'Origin': 'https://lzkjdz-isv.isvjd.com',
                'Referer': item.activityUrl,
                'Cookie': `LZ_TOKEN_KEY=${$.LZ_TOKEN_KEY}; LZ_TOKEN_VALUE=${$.LZ_TOKEN_VALUE};lz_wq_auth_token=${$.isvObfuscatorToken}`,
            }
        }
        $.post(options, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if (data) {
                        data = JSON.parse(data);
                        if (!(data && data.isOk)) {
                            $.isContinue = true
                        } else {
                            console.info('getSignInfo，isOk：', data.isOk)
                        }
                    } else {
                        $.stop = true
                        $.isContinue = true
                    }
                    if ($.isContinue)
                        console.info('getSignInfo', data)
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data);
            }
        })

    })
}
function getActivity(item) {
    $.isContinue = false
    $.stop = false
    return new Promise(resolve => {
        var url = 'https://lzkj-isv.isvjd.com/sign/wx/getActivity'
        if (item.activityUrl.includes("sevenDay")) {
            url = ""
        }
        if (!url) {
            console.info('getActivity，sevenDay，跳过')
            $.isContinue = true
            resolve({isOk:false});
            return;
        }
        let options = {
            url: url,
            body: `actId=${item.activityId}&venderId=${item.venderId}`,
            headers: {
                'Accept': 'application/json, text/javascript, */*; q=0.01',
                'User-Agent': `Mozilla/5.0 (Linux; U; Android 8.0.0; zh-cn; Mi Note 2 Build/OPR1.170623.032) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/61.0.3163.128 Mobile Safari/537.36 XiaoMi/MiuiBrowser/10.1.1`,
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'X-Requested-With': 'XMLHttpRequest',
                'Host': 'lzkjdz-isv.isvjd.com',
                'Origin': 'https://lzkjdz-isv.isvjd.com',
                'Referer': item.activityUrl,
                'Cookie': `LZ_TOKEN_KEY=${$.LZ_TOKEN_KEY}; LZ_TOKEN_VALUE=${$.LZ_TOKEN_VALUE};lz_wq_auth_token=${$.isvObfuscatorToken}`,
            }
        }
        $.post(options, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if (data) {
                        data = JSON.parse(data);
                        if (!(data && data.isOk)) {
                            $.isContinue = true
                            console.info('getActivity', data)
                        } 
                        // else if (!(data && data.act.actRange == 'all')) {
                        //     console.info('getActivity，只有会员才能签到')
                        //     $.isContinue = true
                        // } 
                         else if (!(data && data.act.giftJson.includes("京豆"))) {
                            console.info('getActivity，奖励不是京豆，跳过',data.act.giftJson)
                            $.isContinue = true
                        } 
                        else {
                            console.info('getActivity，isOk：', data.isOk)
                        }
                    } else {
                        $.stop = true
                        $.isContinue = true
                    }
                    // if ($.isContinue)
                        // console.info('getActivity', data)
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data);
            }
        })

    })
}
function getAllActivitys(aggrateActType,type) {
    return new Promise(resolve => {
        let options = {
            url: `https://lzkjdz-isv.isvjd.com/wxAssemblePage/getTopAndNewActInfo`,
            body: `pin=${encodeURIComponent($.secretPin)}&aggrateActType=${aggrateActType}&topNewType=${type}&pageNo=1&pageSize=100`,
            headers: {
                'Accept':'application/json, text/javascript, */*; q=0.01',
                'User-Agent': `Mozilla/5.0 (Linux; U; Android 8.0.0; zh-cn; Mi Note 2 Build/OPR1.170623.032) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/61.0.3163.128 Mobile Safari/537.36 XiaoMi/MiuiBrowser/10.1.1`,
                'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8',
                'X-Requested-With':'XMLHttpRequest',
                'Host':'lzkjdz-isv.isvjd.com',
                'Origin':'https://lzkjdz-isv.isvjd.com',
                'Referer':'https://lzkjdz-isv.isvjd.com/wxAssemblePage/moreActivity?activityId=67dfd244aacb438893a73a03785a48c7&type=8',
                'Cookie': `LZ_TOKEN_KEY=${$.LZ_TOKEN_KEY}; LZ_TOKEN_VALUE=${$.LZ_TOKEN_VALUE};lz_wq_auth_token=${$.isvObfuscatorToken}`,
            }
        }
        $.post(options, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if (data) {
                        data = JSON.parse(data);
                        if (data && data.data) {
                            $.taskList = data.data.homeInfoResultVOList
                        }
                    }                    
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data.data);
            }
        })
         
    })
}

function wxDrawActivity_activityContent(activityId) {
    $.stop = false
    $.isContinue = false
    return new Promise(resolve => {
        let options = {
            url: `https://lzkjdz-isv.isvjd.com/wxDrawActivity/activityContent`,
            body: `pin=${encodeURIComponent($.secretPin)}&activityId=${activityId}`,
            headers: {
                'Accept':'application/json, text/javascript, */*; q=0.01',
                'User-Agent': `Mozilla/5.0 (Linux; U; Android 8.0.0; zh-cn; Mi Note 2 Build/OPR1.170623.032) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/61.0.3163.128 Mobile Safari/537.36 XiaoMi/MiuiBrowser/10.1.1`,
                'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8',
                'X-Requested-With':'XMLHttpRequest',
                'Host':'lzkjdz-isv.isvjd.com',
                'Origin':'https://lzkjdz-isv.isvjd.com',
                'Referer':'https://lzkjdz-isv.isvjd.com/wxAssemblePage/moreActivity?activityId=67dfd244aacb438893a73a03785a48c7&type=8',
                'Cookie': `LZ_TOKEN_KEY=${$.LZ_TOKEN_KEY}; LZ_TOKEN_VALUE=${$.LZ_TOKEN_VALUE};lz_wq_auth_token=${$.isvObfuscatorToken}`,
            }
        }
        $.post(options, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(err)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if (data) {
                        data = JSON.parse(data);
                        data = data.data;
                        if (data) {
                            $.shipInfo = data
                        } else {
                            console.info('wxDrawActivity_activityContent',data)
                            $.isContinue = true
                        }
                    } else {
                        $.isContinue = true
                        $.stop = true
                    }
                }
            } catch (e) {
                $.isContinue = true
                $.logErr(e, resp)
            } finally {
                resolve(data);
            }
        })
         
    })
}

function wxDrawActivity_start(activityId) {
    $.stop = false
    return new Promise(resolve => {
        let options = {
            url: `https://lzkjdz-isv.isvjd.com/wxDrawActivity/start`,
            body: `pin=${encodeURIComponent($.secretPin)}&activityId=${activityId}`,
            headers: {
                'Accept':'application/json, text/javascript, */*; q=0.01',
                'User-Agent': `Mozilla/5.0 (Linux; U; Android 8.0.0; zh-cn; Mi Note 2 Build/OPR1.170623.032) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/61.0.3163.128 Mobile Safari/537.36 XiaoMi/MiuiBrowser/10.1.1`,
                'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8',
                'X-Requested-With':'XMLHttpRequest',
                'Host':'lzkjdz-isv.isvjd.com',
                'Origin':'https://lzkjdz-isv.isvjd.com',
                'Referer':'https://lzkjdz-isv.isvjd.com/wxAssemblePage/moreActivity?activityId=67dfd244aacb438893a73a03785a48c7&type=8',
                'Cookie': `LZ_TOKEN_KEY=${$.LZ_TOKEN_KEY}; LZ_TOKEN_VALUE=${$.LZ_TOKEN_VALUE};lz_wq_auth_token=${$.isvObfuscatorToken}`,
            }
        }
        $.post(options, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(err)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if (data) {
                        // console.info('wxDrawActivity_start',data)
                        data = JSON.parse(data);
                        if (data && data.data) {
                            $.canDrawTimes = data.data.canDrawTimes;
                            console.info(`${data.data.name ? ('获得：' + (data.data.type == 8 ? '专享价，' : '') + data.data.name) : "什么也没有"}`)
                        } else {
                            console.info(`什么也没有`)
                        }
                    } else {
                        $.stop = true
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data.data);
            }
        })
         
    })
}
function wxShopFollowActivity_getPrize(item,sku) {
    return new Promise(resolve => {
        let options = {
            url: `https://lzkj-isv.isvjd.com/wxShopFollowActivity/getPrize`,
            body: `activityId=${item.activityId}&pin=${encodeURIComponent($.secretPin)}`,
            headers: {
                'Accept':'application/json, text/javascript, */*; q=0.01',
                'User-Agent': `Mozilla/5.0 (Linux; U; Android 8.0.0; zh-cn; Mi Note 2 Build/OPR1.170623.032) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/61.0.3163.128 Mobile Safari/537.36 XiaoMi/MiuiBrowser/10.1.1`,
                'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8',
                'X-Requested-With':'XMLHttpRequest',
                'Host':'lzkjdz-isv.isvjd.com',
                'Origin':'https://lzkjdz-isv.isvjd.com',
                'Referer':`https://lzkjdz-isv.isvjcloud.com/wxTeam/activity2/${item.activityId}?activityId=${item.activityId}&adsource=cjhdc`,
                'Cookie': `LZ_TOKEN_KEY=${$.LZ_TOKEN_KEY}; LZ_TOKEN_VALUE=${$.LZ_TOKEN_VALUE};lz_wq_auth_token=${$.isvObfuscatorToken}`,
            }
        }
        $.post(options, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if(data){
                        data = JSON.parse(data);
                        if(data.data && data.data.name){
                            console.log("")
                        }
                        if(data.errorMessage){
                            console.log(data.errorMessage)
                        }
                    }
                    console.log(data)
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data.data);
            }
        })
    })
}
function getMyPing() {
    return new Promise(resolve => {
        let options = {
            url: `https://lzkjdz-isv.isvjd.com/customer/getMyPing`,
            body: `userId=599119&token=${$.isvObfuscatorToken}&fromType=APP`,
            headers: {
                'Accept':'application/json, text/javascript, */*; q=0.01',
                'User-Agent': `Mozilla/5.0 (Linux; U; Android 8.0.0; zh-cn; Mi Note 2 Build/OPR1.170623.032) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/61.0.3163.128 Mobile Safari/537.36 XiaoMi/MiuiBrowser/10.1.1`,
                'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8',
                'X-Requested-With':'XMLHttpRequest',
                'Host':'lzkjdz-isv.isvjd.com',
                'Origin':'https://lzkjdz-isv.isvjd.com',
                'Referer':'https://lzkjdz-isv.isvjd.com/wxAssemblePage/activity/?activityId=67dfd244aacb438893a73a03785a48c7',
                'Cookie': `LZ_TOKEN_KEY=${$.LZ_TOKEN_KEY}; LZ_TOKEN_VALUE=${$.LZ_TOKEN_VALUE};lz_wq_auth_token=${$.isvObfuscatorToken};`,
            }
        }
        $.post(options, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if(resp.statusCode == 200){
                        let cookies = resp.headers['set-cookie']
                        if(cookies && cookies.length>=2 && cookies[2]){
                            $.LZ_TOKEN_KEY = cookies[0].substring(cookies[0].indexOf("=") + 1, cookies[0].indexOf(";"))
                            $.LZ_TOKEN_VALUE = cookies[1].substring(cookies[1].indexOf("=") + 1, cookies[1].indexOf(";"))
                            $.AUTH_C_USER = cookies[2].substring(cookies[2].indexOf("=") + 1, cookies[2].indexOf(";"))
                            // $.lz_jdpin_token = cookies[3].substring(cookies[3].indexOf("=") + 1, cookies[3].indexOf(";"))
                        }
                    }
                    data = JSON.parse(data);
                    $.secretPin = data.data.secretPin
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data.data);
            }
        })
    })
}

function getIsvObfuscatorToken() {
    return new Promise(resolve => {
        $.post({
            url: `https://api.m.jd.com/client.action?functionId=isvObfuscator&area=19_1601_50258_50374&body=%7B%22url%22%3A%22https%3A%5C/%5C/lzkjdz-isv.isvjcloud.com%22%2C%22id%22%3A%22%22%7D&build=167741&client=apple&clientVersion=10.0.8&d_brand=apple&d_model=iPhone13%2C2&eid=eidI2ad5812337s3ghGuVeflROmNL7t9SyzhxIIRr8y39ehVQQzh3oXWc/QdZtuYpoU84EZvJqBkJ%2BWEUsc7iuc80hh3Y5nnWIpS4d3eVHSbXWGspkRV&isBackground=N&joycious=100&lang=zh_CN&networkType=3g&networklibtype=JDNetworkBaseAF&openudid=753d213009c85f60f8ce9df3a678389ffa3fb1c5&osVersion=14.7&partner=apple&rfs=0000&scope=11&screen=1170%2A2532&sign=2ffec555b43aad6c6463a59e6c6171be&st=1627614815813&sv=110&uemps=0-0&uts=0f31TVRjBStY4dJWmgbcW8p0brUbXrZeoPCj0W437gnaYlBn4xmhsA4SI6O1KP%2Bjy8ofgHABHMZEb884H1fvzolH4z%2BqsI5NgKKljgs8iMmxPuBc9EiSzSIb/2Nvf8QPLPCnJDgvjjZ3RMgrfBQasXg8AYpNrVCvUNhXVXFz3GSSC6EQIRlil7ZW45YN60Mu3JbKwlXFJXLeSIvplU/nXw%3D%3D&uuid=hjudwgohxzVu96krv/T6Hg%3D%3D&wifiBssid=unknown`,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; U; Android 8.0.0; zh-cn; Mi Note 2 Build/OPR1.170623.032) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/61.0.3163.128 Mobile Safari/537.36 XiaoMi/MiuiBrowser/10.1.1',
                'Content-Type':'application/x-www-form-urlencoded',
                'Host':'api.m.jd.com',
                'Referer':'',
                'Cookie': cookie,
            }
        }, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    data = JSON.parse(data);
                    if(data && data.code == 0){
                        $.isvObfuscatorToken = data.token
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data.token);
            }
        })
    })
}

function getCommonInfoToken() {
    return new Promise(resolve => {
        let options = {
            "url": `https://lzkjdz-isv.isvjd.com/wxAssemblePage/activity/?activityId=67dfd244aacb438893a73a03785a48c7`,
            "headers": {
                "Host": "lzkjdz-isv.isvjd.com",
                "Cookie": cookie,
                "Connection": "keep-alive",
                "Accept": "application/json, text/plain, */*",
                "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
                "Accept-Language": "zh-cn",
                "Referer": "https://lzkj-isv.isvjd.com/",
                "Accept-Encoding": "gzip, deflate, br",
            }
        };
        $.get(options, async (err, resp, data) => {
            try {
                if(resp.statusCode == 200){
                    let cookies = resp.headers['set-cookie']
                    $.LZ_TOKEN_KEY = cookies[0].substring(cookies[0].indexOf("=") + 1, cookies[0].indexOf(";"))
                    $.LZ_TOKEN_VALUE = cookies[1].substring(cookies[1].indexOf("=") + 1, cookies[1].indexOf(";"))

                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data);
            }
        })
    })
}

function jsonParse(str) {
    if (typeof str == "string") {
        try {
            return JSON.parse(str);
        } catch (e) {
            console.log(e);
            $.msg($.name, '', '请勿随意在BoxJs输入框修改内容\n建议通过脚本去获取cookie')
            return [];
        }
    }
}
// prettier-ignore
function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}

