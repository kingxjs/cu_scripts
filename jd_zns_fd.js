/*
炸年兽-福袋
活动入口：主页右下角
0 0 0/3 * * *
 */
const $ = new Env('炸年兽-福袋');
const notify = $.isNode() ? require('./sendNotify') : '';
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
const JD_API_HOST = 'https://api.m.jd.com/client.action';
var myDate = new Date();
var hour = myDate.getHours();
//IOS等用户直接用NobyDa的jd cookie
let cookiesArr = [], isLoginInfo = {}, message, secretp;
if ($.isNode()) {
  Object.keys(jdCookieNode).forEach((item) => {
    cookiesArr.push(jdCookieNode[item])
  });
  if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => { };
} else {
  cookiesArr = [$.getdata("CookieJD"), $.getdata("CookieJD2"), ...$.toObj($.getdata("CookiesJD") || "[]").map((item) => item.cookie)].filter((item) => !!item);
}
$.shareCodes = [

]
$.shareCodesArr = {};
$.newShareCodes = [];
!(async () => {
  if (!cookiesArr[0]) {
    $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', { "open-url": "https://bean.m.jd.com/bean/signIndex.action" });
    return;
  }
  $.activityId = '';
  $.totalScore = 0;
  $.taskBo = false;
  $.homeMainInfo = {};
  $.inviteIdCodesArr = {}
  console.log(`开始获取活动信息`);
  for (let i = 0; (cookiesArr.length < 3 ? i < cookiesArr.length : i < 3) && $.activityId === ''; i++) {
    $.index = i + 1;
    $.cookie = cookiesArr[i];
    $.UserName = decodeURIComponent($.cookie.match(/pt_pin=([^; ]+)(?=;?)/) && $.cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
    $.pre_session = decodeURIComponent($.cookie.match(/pre_session=([^; ]+)(?=;?)/) && $.cookie.match(/pre_session=([^; ]+)(?=;?)/)[1]);
    if ($.pre_session) {
      $.pre_session = $.pre_session.split('|')[0]
    }
    if ($.pre_session == 'null') {
      $.pre_session = randomString(40)
    }
    $.isLogin = true;
    $.nickName = ''
    if (isLoginInfo[$.UserName] === false) {

    } else {
      if (!isLoginInfo[$.UserName]) {
        await TotalBean();
        isLoginInfo[$.UserName] = $.isLogin
      }
    }
    if (!isLoginInfo[$.UserName]) {
      if ($.isNode()) {
        await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
      }
      continue
    }
    console.log(`\n******开始【京东账号${$.index}】${$.nickName || $.UserName}*********\n`);

    // await get_shop_list();
    //await travel_getHomeData();
    //await travel_getSignHomeData();
    //await travel_collectAtuoScore();
    //var j = 0;
    //$.taskBo = true;
    //do {
    //  console.log(`=============== 进行第${j + 1}轮任务 ===============`)
    //  $.taskBo = false;
    //  await getTaskDetail();
    //  if ($.taskBo == true) {
    //    j++;
    //    await $.wait((10 + Math.random()) * 1000)
    //  } else {
    //    console.log('已做完所有任务，请间隔一段时间在运行\n')
    //    break;
    //  }
    //} while ($.taskBo)

    $.taskBo = true;
    console.log(`=============== 开始做福袋任务 ===============\n`)
    await qryCompositeMaterials();
    // while ($.homeMainInfo.raiseInfo && $.homeMainInfo.raiseInfo.remainScore >= $.homeMainInfo.raiseInfo.cityConfig.clockNeedsCoins) {
    //   await travel_raise()
    // }
  }
  // for (let i = 0; (cookiesArr.length < 3 ? i < cookiesArr.length : i < 3) && $.activityId === ''; i++) {
  //   $.index = i + 1;
  //   $.cookie = cookiesArr[i];
  //   $.UserName = decodeURIComponent($.cookie.match(/pt_pin=([^; ]+)(?=;?)/) && $.cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
  //   if($.UserName=='king学佳') continue;
  //   if ($.shareCodes && $.shareCodes.length) {
  //     console.log(`\n自己账号内部循环互助\n`);
  //     for (let j = 0; j < $.shareCodes.length; j++) {
  //       if ($.shareCodes[j] == $.shareCodesArr[$.UserName]) {
  //         console.log(`\n不能助力自己\n`);
  //         continue;
  //       }
  //       console.log(`账号${$.UserName} 去助力 ${$.shareCodes[j]}`)
  //       await friendsHelp($.shareCodes[j])
  //       await $.wait(2000)
  //     }
  //   }
  // }
})().catch((e) => { $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '') }).finally(() => { $.done(); });

async function showMsg() {
  if ($.isNode()) {
    $.msg($.name, '', `【京东账号${$.index}】${$.nickName}\n${message}`);
    await notify.sendNotify(`${$.name} - 账号${$.index} - ${$.nickName}`, `【京东账号${$.index}】${$.nickName}\n${message}`);
  }
}

//获取店铺列表
function get_shop_list() {
  return new Promise((resolve) => {
    var body = { "qryParam": "[{\"type\":\"advertGroup\",\"mapTo\":\"babelCountDownFromAdv\",\"id\":\"05884370\"},{\"type\":\"advertGroup\",\"mapTo\":\"feedBannerT\",\"id\":\"05860672\"},{\"type\":\"advertGroup\",\"mapTo\":\"feedBannerS\",\"id\":\"05861001\"},{\"type\":\"advertGroup\",\"mapTo\":\"feedBannerA\",\"id\":\"05861003\"},{\"type\":\"advertGroup\",\"mapTo\":\"feedBannerB\",\"id\":\"05861004\"},{\"type\":\"advertGroup\",\"mapTo\":\"feedBottomHeadPic\",\"id\":\"05872092\"},{\"type\":\"advertGroup\",\"mapTo\":\"feedBottomData0\",\"id\":\"05908556\"},{\"type\":\"advertGroup\",\"mapTo\":\"fissionData\",\"id\":\"05863777\"},{\"type\":\"advertGroup\",\"mapTo\":\"newProds\",\"id\":\"05864483\"}]", "activityId": "2vVU4E7JLH9gKYfLQ5EVW6eN2P7B", "pageId": "", "reqSrc": "", "applyKey": "jd_star" }
    var options = taskPostUrl('qryCompositeMaterials', body, "qryCompositeMaterials")
    $.post(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          data = JSON.parse(data);
          if (data && data['code'] === '0' || data['code'] === 0) {
            var item_list = data.data.feedBottomData0.list;
            $.shop_list = []

            for (let i = 0; i < item_list.length; i++) {
              const item = item_list[i];
              $.shop_list.push({
                'shopId': item['link'],
                'venderId': item['extension']['shopInfo']['venderId']
              })
              await jm_promotion_queryPromotionInfoByShopId({
                'shopId': item['link'],
                'venderId': item['extension']['shopInfo']['venderId']
              })
            }
          } else {
            console.log(data.data.bizMsg)
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    })
  })
}
function jm_promotion_queryPromotionInfoByShopId(shop) {
  return new Promise((resolve) => {
    var options = taskPostUrl('jm_promotion_queryPromotionInfoByShopId', { "shopId": shop.shopId, "channel": 20 })
    $.post(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          data = JSON.parse(data);
          if (data && data.success) {
            var wxUrl = data.data.wxUrl;
            wxUrl = transform(wxUrl)
            shop["miniAppId"] = wxUrl.appId;
            await get_shop_info(shop)
          } else {
            console.log(data.data.bizMsg)
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    })
  })
}
function get_shop_info(shop) {
  return new Promise((resolve) => {
    var options = taskJDZZUrl2(`functionId=jm_marketing_maininfo&body=${escape(JSON.stringify(shop))}&client=wh5&clientVersion=1.0.0&appid=shop_view`)
    $.post(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          // console.info(data)
          data = JSON.parse(data);
          if (data && data.success) {
            var task_list = data.data.project.viewTaskVOS;
            var shop_name = data.data.shopInfoVO.shopName;
            console.info(`开始做店铺:《${shop_name}》的任务`)
            if (shop_name.indexOf('誉佰利家具旗舰店') == -1) { return; }
            var res1 = await followShop(shop.shopId, shop.miniAppId)
            for (let i = 0; i < task_list.length; i++) {
              var params = JSON.parse(JSON.stringify(shop));
              const task = task_list[i];
              console.info(`开始做任务:${task.name},${task.type}`)
              // if (task.type === 1) {
              //   params['taskId'] = task.id
              //   params['token'] = task.token
              //   params['opType'] = 2
              //   params['functionIdFixed'] = 'jm_task_process_play'
              //   for (let j = 0; j < task.coinCost; j++) {
              //     var res = await jm_task_process(shop_name, params)
              //     if (res)
              //       console.info(`店铺:《${shop_name}》, 抽奖一次, 获得奖励:${JSON.stringify(res.awardVO)}`)
              //   }
              // }
              // else
              if (task.type === 8) {
                params['taskId'] = task.id
                params['token'] = task.token
                params['opType'] = 1
                for (let i = task.finishCount, j = 0; i < task.totalCount; ++i, ++j) {
                  await jm_task_process(shop_name, params)
                  if (!$.duration || $.duration < 9) $.duration = 9;
                  console.info(`等待${$.duration}秒`)
                  await $.wait(($.duration + Math.random()) * 1000)
                }
              }
              else if (task.type === 3 || task.type === 5) {
                params['taskId'] = task.id
                params['token'] = task.token
                for (let i = task.finishCount, j = 0; i < task.totalCount; ++i, ++j) {
                  await jm_goods_taskGoods(shop_name, params)
                  if (!$.duration || $.duration < 9) $.duration = 9;
                  console.info(`等待${$.duration}秒`)
                  await $.wait(($.duration + Math.random()) * 1000)
                }
              }
            }
          } else {
            console.log(data.data.bizMsg)
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    })
  })
}
//关注店铺
function followShop(shopId, miniAppId) {
  return new Promise((resolve) => {
    var options = taskPostUrl3('followShop', { "shopId": shopId, "follow": true, "type": 0, "sourceRpc": "shop_app_myfollows_shop", "refer": "https://wq.jd.com/pages/index/index" })
    options.headers['Origin'] = `https://service.vapp.jd.com/`;
    options.headers['Referer'] = `https://service.vapp.jd.com/${miniAppId}/1/page-frame.html`;
    $.post(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          console.info(`关注店铺：${data}`)
          data = JSON.parse(data);
          if (data && data.success) {
            resolve(data.data);
          } else {
            console.log(data.code)
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    })
  })
}
//完成店铺任务
function jm_task_process(shop_name, params) {
  return new Promise((resolve) => {
    var options = taskPostUrl3('jm_task_process', params)
    options.headers['Origin'] = `https://service.vapp.jd.com`;
    options.headers['Referer'] = `https://service.vapp.jd.com/${params['miniAppId']}/1/page-frame.html`;
    options.headers['User-Agent'] = 'JD4iPhone\/167853 (iPhone; iOS 14.8; Scale\/3.00)';
    $.post(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          console.info(data)
          data = JSON.parse(data);
          if (data && data.code == 200) {
            resolve(data.data);
          } else {
            console.log(data.msg)
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    })
  })
}
//加购浏览 店铺商品
function jm_goods_taskGoods(shop_name, params) {
  return new Promise((resolve) => {
    var options = taskPostUrl3('jm_goods_taskGoods', params)
    options.headers['Origin'] = `https://service.vapp.jd.com`;
    options.headers['Referer'] = `https://service.vapp.jd.com/${params['miniAppId']}/1/page-frame.html`;
    options.headers['User-Agent'] = 'JD4iPhone\/167853 (iPhone; iOS 14.8; Scale\/3.00)';
    $.post(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          data = JSON.parse(data);
          if (data && data.success) {
            sku_list = data.data.skuList;
            for (let i = 0; i < sku_list.length; i++) {
              const sku = sku_list[i];
              var p = JSON.parse(JSON.stringify(params));
              p['opType'] = 2
              p['referSource'] = sku['skuId']
              var res = await jm_task_process(shop_name, p)
              console.info(`店铺:《${shop_name}》, 加购《${sku['name']}》, 获得奖励:${res && res.awardVO}`)
              if (!$.duration || $.duration < 9) $.duration = 9;
              console.info(`等待${$.duration}秒`)
              await $.wait(($.duration + Math.random()) * 1000)
            }
          } else {
            console.log(data.msg)
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    })
  })
}
//获取任务列表并完成任务
function getTaskDetail() {
  return new Promise(async resolve => {
    const options = taskJDZZUrl("travel_getTaskDetail")
    $.post(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (data) {
            data = JSON.parse(data);
            if (data.code === 0) {
              if (data.data && data['data']['bizCode'] === 0) {
                if (data.data.result.inviteId == null) {
                  console.log("黑号")
                }
                console.log(`\n\n助力码：${data.data.result.inviteId}\n`)
                if ($.shareCodes.indexOf(data.data.result.inviteId) == -1)
                  $.shareCodes.push(data.data.result.inviteId)
                $.shareCodesArr[$.UserName] = data.data.result.inviteId;
                $.newShareCodes.push(data.data.result.inviteId)
                var lotteryTaskVos = data.data.result.lotteryTaskVos;

                if (lotteryTaskVos && lotteryTaskVos.length > 0) {
                  var lotteryTaskVo = lotteryTaskVos[0]
                  if (lotteryTaskVo.times == lotteryTaskVo.maxTimes) {
                    for (let i = 0; i < lotteryTaskVo.badgeAwardVos.length; i++) {
                      var badgeAwardVo = lotteryTaskVo.badgeAwardVos[i];
                      if (badgeAwardVo.status != 4) {
                        await travel_getBadgeAward(badgeAwardVo.awardName, badgeAwardVo.awardToken);
                      }
                    }
                  }
                }
                for (let vo of data.data.result.taskVos) {
                  console.log(`去做${vo.taskName} 任务，${vo.times}/${vo.maxTimes}，${vo.taskType}，${vo['taskId']}`)
                  if (vo.taskType === 7) {
                    for (let i = vo.times, j = 0; i < vo.maxTimes; ++i, ++j) {
                      $.taskBo = true;
                      let item = vo['browseShopVo'][j]
                      console.log(`去做${vo.taskName}任务，${i + 1}/${vo.maxTimes}，${item.shopName}`)
                      $.duration = vo.waitDuration + 1
                      if ($.duration < 9) $.duration = 9;
                      await travel_collectScore(vo['taskId'], item['taskToken'])
                      await $.wait(($.duration + Math.random()) * 1000)
                      await qryViewkitCallbackResult(item['taskToken'])
                    }
                  }
                  else if (vo.taskType === 9 || vo.taskType === 3 || vo.taskType === 6 || vo.taskType === 26) {
                    for (let i = vo.times, j = 0; i < vo.maxTimes; ++i, ++j) {
                      $.taskBo = true;
                      let item = vo['shoppingActivityVos'][j]
                      console.log(`去做${vo.taskName}任务，${i + 1}/${vo.maxTimes}，${item.title}`)
                      $.duration = vo.waitDuration + 1
                      if ($.duration < 9) $.duration = 9;
                      await travel_collectScore(vo['taskId'], item['taskToken'])
                      await $.wait(($.duration + Math.random()) * 1000)
                      if (vo['taskId'] !== 10 && vo['taskId'] !== 13 && vo['taskId'] !== 7 && vo['taskId'] !== 32) {
                        await qryViewkitCallbackResult(item['taskToken'])
                      }
                    }
                  }
                  else if (vo.taskType === 0) {

                    let item = vo['simpleRecordInfoVo']
                    for (let i = vo.times, j = 0; i < vo.maxTimes; ++i, ++j) {
                      $.taskBo = true;
                      console.log(`去做${vo.taskName}任务，${i + 1}/${vo.maxTimes}`)

                      $.duration = vo.waitDuration + 1

                      if ($.duration < 9) $.duration = 9;

                      await travel_collectScore(vo['taskId'], item['taskToken'])

                      await $.wait(($.duration + Math.random()) * 1000)
                    }
                  }
                  else if (vo.taskType === 2 || vo.taskType === 5) {
                    $.taskBo = true;
                    await travel_getFeedDetail(vo.taskId)
                  }
                  else if (vo.taskType === 21) {
                    if (process.env.FS_LEVEL != 'card') {
                      console.log('不入会,FS_LEVEL=card入会')

                      continue;

                    }
                    $.taskBo = true;
                    for (var o = 0; o < vo.brandMemberVos.length; o++) {
                      if (vo.brandMemberVos[o].status == 1) {
                        console.log(`\n\n ${vo.brandMemberVos[o].title}`)
                        memberUrl = vo.brandMemberVos[o].memberUrl
                        memberUrl = transform(memberUrl)
                        if ($.index <= 10) //限制开卡账号数目
                          await join(vo.brandMemberVos[o].vendorIds, memberUrl.channel, memberUrl.shopId ? memberUrl.shopId : "")
                        await travel_collectScore(vo['taskId'], vo.brandMemberVos[o].taskToken)
                      }

                    }
                  }
                }
              }
            } else {
              console.log(`\n\nsecretp失败:${JSON.stringify(data)}\n`)
            }


          } else {
            console.log(`京东服务器返回空数据`)
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      }
      finally {
        resolve(data);
      }
    })
  })
}
//获取拼图店铺
function qryCompositeMaterials() {
  return new Promise(async resolve => {
    const options = taskPostUrl("qryCompositeMaterials", { "qryParam": "[{\"type\":\"advertGroup\",\"mapTo\":\"logoListRemain\",\"id\":\"06079449\"}]", "activityId": "41AJZXRUJeTqdBK9bPoPgUJiodcU", "pageId": "", "reqSrc": "", "applyKey": "jd_star" }, "qryCompositeMaterials")
    $.post(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (data) {
            data = JSON.parse(data);
            var privateDomainList = data.data.logoListRemain.list;
            for (let i = 0; i < privateDomainList.length; i++) {
              const element = privateDomainList[i];
              var venderLink1 = element.extension.venderLink1
              var encryptActivityId = venderLink1.match(/(?<=Zeus\/).+(?=\/index.html)/);
              if (encryptActivityId.length > 0) {
                encryptActivityId = encryptActivityId[0];
              }
              console.log(`=============== 进行第${i + 1}个店铺拼图任务 ===============\n`)
              await factory_getStaticConfig(encryptActivityId)
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      }
      finally {
        resolve(data);
      }
    })
  })
}
//获取拼图店铺appId
function factory_getStaticConfig(encryptActivityId) {
  return new Promise(async resolve => {
    const options = taskPostUrl("factory_getStaticConfig", { "encryptActivityId": encryptActivityId, "channelId": 1 })
    $.post(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (data) {
            data = JSON.parse(data);
            var appId = data.data.result.appId;
            var j = 0;
            do {
              console.log(`=============== 进行第${j + 1}轮任务 ===============`)
              $.taskBo = false;
              await template_mongo_getHomeData(appId)
              if ($.taskBo == true) {
                j++;
                await $.wait((10 + Math.random()) * 1000)
              } else {
                console.log('已做完所有任务，请间隔一段时间在运行\n')
                break;
              }
            } while ($.taskBo)

          }
        }
      } catch (e) {
        $.logErr(e, resp)
      }
      finally {
        resolve(data);
      }
    })

  })
}
//获取拼图店铺的任务
function template_mongo_getHomeData(appId) {
  return new Promise(async resolve => {
    const options = taskPostUrl("template_mongo_getHomeData", { "taskToken": "", "appId": appId, "channelId": 1 })
    $.post(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (data) {
            $.duration = 9;
            data = JSON.parse(data);
            $.userLightChance = data.data.result.userInfo.userLightChance || 0;
            for (let vo of data.data.result.taskVos) {
              var taskId = vo.taskId
              $.duration = vo.waitDuration + 1
              if ($.duration < 9) $.duration = 9;
              switch (vo.taskType) {
                case 12:
                  var taskToken = vo.simpleRecordInfoVo.taskToken
                  if (vo.times != vo.maxTimes) {
                    console.log(`去签到，${vo['taskId']}`)
                    await template_mongo_collectScore(appId, taskId, taskToken)
                    await $.wait(($.duration + Math.random()) * 1000)
                  }
                  break;
                case 1:
                case 3:
                case 15:
                  var tmp = vo.followShopVo;
                  if (vo.taskType == 3) tmp = vo.shoppingActivityVos;
                  if (vo.taskType == 15) tmp = vo.productInfoVos;

                  for (let i = vo.times, j = 0; i < vo.maxTimes; ++i, ++j) {
                    let item = tmp[j]
                    $.taskBo = true;
                    console.log(`去做${vo.taskName}任务，${i + 1}/${vo.maxTimes}，${vo['taskId']}`)
                    $.duration = vo.waitDuration + 1
                    if ($.duration < 9) $.duration = 9;
                    await template_mongo_collectScore(appId, taskId, item.taskToken)
                    await $.wait(($.duration + Math.random()) * 1000)
                  }
                  break;
              }
            }
            if ($.userLightChance > 0) {
              console.log(`可以点亮 ${$.userLightChance} 块拼图`)
              var fAll = [1, 2, 3, 4, 5, 6];
              var fragmentList = data.data.result.userInfo.fragmentList;
              var new_arr = fAll;
              if (fragmentList && fragmentList.length > 0) {
                new_arr = fAll.filter((x) => !fragmentList.some((item) => x === item));
              }
              if (new_arr.length == 0) {
                new_arr = fAll;
              }
              var userLightChance2 = $.userLightChance;

              while (userLightChance2 > 0) {
                var j = $.userLightChance - userLightChance2;
                const fragmentId = new_arr[j];
                if (j < new_arr.length) {
                  await template_mongo_lottery(appId, fragmentId)
                  await $.wait(($.duration + Math.random()) * 1000)
                  userLightChance2--;
                } else {
                  new_arr = fAll;
                  $.userLightChance = j;
                  userLightChance2 = $.userLightChance
                  // await template_mongo_lottery(appId)
                  // await $.wait(($.duration + Math.random()) * 1000)
                }
              }
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      }
      finally {
        resolve(data);
      }
    })

  })
}
//点击拼图
function template_mongo_lottery(appId, fragmentId) {
  return new Promise((resolve) => {
    var body = { "appId": appId }
    if (fragmentId) {
      body['fragmentId'] = fragmentId;
    }
    var options = taskPostUrl('template_mongo_lottery', body)
    $.post(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          data = JSON.parse(data);
          if (data && data.data['bizCode'] === 0) {
            if (fragmentId)
              console.log(`第 ${fragmentId} 块拼图 已点亮，等待${$.duration}秒`)
            else
              console.log(`图案 已拼成，等待${$.duration}秒`)
          } else {
            console.log(data.data.bizMsg)
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    })
  })
}
//完成任务
function template_mongo_collectScore(appId, taskId, itemToken) {
  return new Promise((resolve) => {
    var options = taskPostUrl('template_mongo_collectScore', { appId: appId, taskId: taskId, taskToken: itemToken, actionType: 0, safeStr: { "log": "", "sceneid": "HYJGJSh5", "random": randomString(6) } }, 'template_mongo_collectScore')
    $.post(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          data = JSON.parse(data);
          if (data && data.data['bizCode'] === 0) {
            data = data.data;
            if (data.result.userActionResult && data.result.userActionResult.lightChance) {
              $.userLightChance += data.result.userActionResult.lightChance;
            }
            if (data.result.score)
              console.log(`拼图 任务完成成功，获得${data.result.score}金币`)
            else if (data.result.taskToken)
              console.log(`拼图 任务请求成功，等待${$.duration}秒`)
            else {
              console.log(`拼图 任务请求结果未知`)
            }
          } else {
            console.log(data.data.bizMsg)
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    })
  })
}

//完成浏览商品列表
function travel_getFeedDetail(taskId) {
  return new Promise((resolve) => {
    var options = taskPostUrl('travel_getFeedDetail', { taskId: taskId }, 'travel_getFeedDetail')
    $.post(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          data = JSON.parse(data);
          if (data && data.data['bizCode'] === 0) {
            if (taskId == 4) {
              var vo = data.data.result.taskVos[0]

              for (let i = vo.times, j = 0; i < vo.maxTimes; ++i, ++j) {
                let item = vo['browseShopVo'][j]
                console.log(`去做${vo.taskName}任务，${i + 1}/${vo.maxTimes}`)
                $.duration = vo.waitDuration + 1
                if ($.duration < 9) $.duration = 9;
                await travel_collectScore(vo['taskId'], item['taskToken'])
                await $.wait(($.duration + Math.random()) * 1000)
                // await qryViewkitCallbackResult(item['taskToken'])
              }

            } else {
              var vo = data.data.result.addProductVos[0]

              for (let i = vo.times, j = 0; i < vo.maxTimes; ++i, ++j) {
                let item = vo['productInfoVos'][j]
                console.log(`去做${vo.taskName}任务，${i + 1}/${vo.maxTimes}`)
                $.duration = vo.waitDuration + 1
                if ($.duration < 9) $.duration = 9;
                await travel_collectScore(vo['taskId'], item['taskToken'])
                await $.wait(($.duration + Math.random()) * 1000)
                // await qryViewkitCallbackResult(item['taskToken'])
              }
            }

          } else {
            console.log(data.data.bizMsg)
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    })
  })
}
//获取活动信息
function travel_getHomeData() {
  return new Promise((resolve) => {
    var options = taskPostUrl('travel_getHomeData', {}, 'travel_getHomeData')
    $.post(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          data = JSON.parse(data);
          if (data && data.data['bizCode'] === 0) {
            //console.log(data.data.result)
            $.homeMainInfo = data.data['result']['homeMainInfo']
            secretp = data.data['result']['homeMainInfo']["secretp"]
          } else {
            console.log(data.data.bizMsg)
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    })
  })
}

//获取活动签到信息
function travel_getSignHomeData() {
  return new Promise((resolve) => {
    var options = taskPostUrl('travel_getSignHomeData', {}, 'travel_getSignHomeData')
    $.post(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          data = JSON.parse(data);
          if (data && data.data['bizCode'] === 0) {
            if (data.data.result.todayStatus != 1) {
              await travel_sign();
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    })
  })
}
//领取次数奖励
function travel_getBadgeAward(title, awardToken) {
  return new Promise((resolve) => {
    var options = taskPostUrl('travel_getBadgeAward', { awardToken: awardToken }, 'travel_getBadgeAward')
    $.post(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          data = JSON.parse(data);
          if (data && data.data['bizCode'] === 0) {
            console.log(`${title} 领取成功`)
          } else {
            console.log(data.data.bizMsg)
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    })
  })
}
//收取金币
function travel_collectAtuoScore() {
  return new Promise((resolve) => {
    var options = taskPostUrl('travel_collectAtuoScore', { ss: { "extraData": { "log": "", "sceneid": "HYJhPageh5" }, "secretp": secretp, "random": randomString(6) } }, 'travel_collectAtuoScore')
    options.headers['Referer'] = 'https://wbbny.m.jd.com/babelDiy/Zeus/2vVU4E7JLH9gKYfLQ5EVW6eN2P7B/index.html?babelChannel=jdappsyfc&from=home&lng=116.381621&lat=39.971922&sid=848ed40bf83b638d83b87f0732342a2w&un_area=1_2810_55541_0'
    options.headers['Origin'] = 'https://wbbny.m.jd.com'

    console.info(options)
    $.post(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          data = JSON.parse(data);
          if (data && data.data['bizCode'] === 0) {
            console.log(`金币收取成功`)
          } else {
            console.log(`金币收取：${data.data.bizMsg}`)
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    })
  })
}
//签到
function travel_sign() {
  return new Promise((resolve) => {
    var options = taskPostUrl('travel_sign', { ss: { "extraData": { "log": "", "sceneid": "HYJhPageh5" }, "secretp": secretp, "random": randomString(6) } }, 'travel_sign')
    $.post(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          data = JSON.parse(data);
          if (data && data.data['bizCode'] === 0) {
            console.log(`签到成功`)
          } else {
            console.log(data.data.bizMsg)
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    })
  })
}

//好友邀请助力
function friendsHelp(inviteId) {
  return new Promise((resolve) => {
    var options = taskPostUrl('travel_collectScore', { ss: { "extraData": { "log": "", "sceneid": "HYJhPageh5" }, "secretp": secretp, "random": randomString(6) }, inviteId: inviteId }, 'travel_collectScore')
    $.post(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          data = JSON.parse(data);
          if (data && data.data && data.data['bizCode']) {
            console.log(`助力 ${inviteId} : ${data.data.bizMsg}`)
          } else {
            console.log(data.data.bizMsg)
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    })
  })
}

//打卡领红包
function travel_raise() {
  return new Promise((resolve) => {
    var options = taskPostUrl('travel_raise', { "ss": { "extraData": { "log": "", "sceneid": "HYJhPageh5" }, "secretp": secretp, "random": randomString(6) } }, 'travel_raise')
    $.post(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          data = JSON.parse(data);
          if (data && data.data['bizCode'] === 0) {
            $.homeMainInfo.raiseInfo = data.data['result']['raiseInfo']
          } else {
            console.log(data.data.bizMsg)
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    })
  })
}
//完成任务
function travel_collectScore(taskId, itemToken) {
  return new Promise((resolve) => {
    var options = taskPostUrl('travel_collectScore', { taskId: taskId, taskToken: itemToken, actionType: 1, ss: { "extraData": { "log": "", "sceneid": "HYJhPageh5" }, "secretp": secretp, "random": randomString(6) } }, 'travel_collectScore')
    $.post(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          data = JSON.parse(data);
          if (data && data.data['bizCode'] === 0) {
            data = data.data;
            if (data.result.score)
              console.log(`任务完成成功，获得${data.result.score}金币`)
            else if (data.result.taskToken)
              console.log(`任务请求成功，等待${$.duration}秒`)
            else {
              console.log(`任务请求结果未知`)
            }
          } else {
            console.log(data.data.bizMsg)
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    })
  })
}

function qryViewkitCallbackResult(taskToken) {
  let body = {
    "dataSource": "newshortAward",
    "method": "getTaskAward",
    "reqParams": `{\"taskToken\":\"${taskToken}\"}`
  }
  return new Promise(resolve => {
    $.post(taskPostUrl2("qryViewkitCallbackResult", body,), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data.code === "0") {
              console.log(data.toast.subTitle)
            } else {
              console.log(`任务完成失败，错误信息：${JSON.stringify(data)}`)
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}
function taskPostUrl(function_id, body = {}, function_id2) {
  let url = `${JD_API_HOST}`;
  if (function_id2) {
    url += `?functionId=${function_id2}`;
  }
  return {
    url,
    body: `functionId=${function_id}&body=${escape(JSON.stringify(body))}&client=wh5&clientVersion=1.0.0`,
    headers: {
      "Accept": "application/json, text/plain, */*",
      "Accept-Encoding": "gzip, deflate, br",
      "Accept-Language": "zh-cn",
      "Connection": "keep-alive",
      "Content-Type": "application/x-www-form-urlencoded",
      "Cookie": $.cookie,
      "Host": "api.m.jd.com",
      "Origin": "https://wbbny.m.jd.com",
      "Referer": "https://wbbny.m.jd.com/babelDiy/Zeus/2vVU4E7JLH9gKYfLQ5EVW6eN2P7B/index.html?babelChannel=jdappsyfc&shareType=team&inviteId=E7unasWZBJTSra-Ra-L5tMswsS-SlLJJjLHA&mpin=RnFjwjRbbjbZw9RV_sYmBgLc&from=sc&lng=116.381909&lat=39.971877&sid=848ed40bf83b638d83b87f0732342a2w&un_area=1_2810_55541_0",
      "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('../USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
    },
    timeout: 10000,
  }
}
function taskPostUrl2(function_id, body = {}, function_id2) {
  let url = `${JD_API_HOST}`;
  if (function_id2) {
    url += `?functionId=${function_id2}`;
  }
  return {
    url,
    body: `functionId=${function_id}&body=${escape(JSON.stringify(body))}&client=wh5&clientVersion=1.0.0`,
    headers: {
      "Cookie": $.cookie,
      "origin": "https://wbbny.m.jd.com",
      "referer": "https://wbbny.m.jd.com/",
      'Content-Type': 'application/x-www-form-urlencoded',
      "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('../USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1")
    }
  }
}
function taskPostUrl3(function_id, body = {}, function_id2) {
  let url = `${JD_API_HOST}`;
  if (function_id2) {
    url += `?functionId=${function_id2}`;
  }
  return {
    url,
    body: `functionId=${function_id}&body=${escape(JSON.stringify(body))}&client=wh5&clientVersion=10.0.0&uuid=${$.pre_session}&appid=shop_view&t=${(new Date).getTime()}&eid=eidI374A0112Q0NGMzY5RTItQUNBOC00Nw%3D%3D4TVThAzwO7B3noqPTjLi8HvRnf5ZIdhigqvCSo4m5l2bJQJbD8a%2Frf9nqKqKh241mJSaOnR52SCzJYK0`,
    headers: {
      "Accept": "*/*",
      "Accept-Encoding": "gzip, deflate, br",
      "Accept-Language": "zh-cn",
      "Connection": "keep-alive",
      "Content-Type": "application/x-www-form-urlencoded",
      "Cookie": $.cookie,
      "Host": "api.m.jd.com",
      "Origin": "https://wbbny.m.jd.com",
      "Referer": "https://wbbny.m.jd.com/babelDiy/Zeus/2vVU4E7JLH9gKYfLQ5EVW6eN2P7B/index.html?babelChannel=jdappsyfc&shareType=team&inviteId=E7unasWZBJTSra-Ra-L5tMswsS-SlLJJjLHA&mpin=RnFjwjRbbjbZw9RV_sYmBgLc&from=sc&lng=116.381909&lat=39.971877&sid=848ed40bf83b638d83b87f0732342a2w&un_area=1_2810_55541_0",
      "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('../USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
    },
    timeout: 10000,
  }
}
function safeGet(data) {
  try {
    if (typeof JSON.parse(data) == "object") {
      return true;
    }
  } catch (e) {
    console.log(e);
    console.log(`京东服务器访问数据为空，请检查自身设备网络情况`);
    return false;
  }
}

function taskJDZZUrl(functionId, body = {}) {
  return {
    url: `${JD_API_HOST}?functionId=${functionId}&body=${escape(JSON.stringify(body))}&client=wh5&clientVersion=1.0.0`,
    headers: {
      'Cookie': $.cookie,
      'Host': 'api.m.jd.com',
      'Connection': 'keep-alive',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Origin': 'https://wbbny.m.jd.com',
      'Referer': 'https://wbbny.m.jd.com/babelDiy/Zeus/2vVU4E7JLH9gKYfLQ5EVW6eN2P7B/index.html?babelChannel=jdappsyfc&from=home&lng=116.381712&lat=39.971913&sid=848ed40bf83b638d83b87f0732342a2w&un_area=1_2810_55541_0',
      'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
      'Accept-Language': 'zh-cn',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept': 'application/json, text/plain, */*',
    }
  }
}

function taskJDZZUrl2(params) {
  return {
    url: `${JD_API_HOST}?${params}`,
    headers: {
      'Cookie': $.cookie,
      'Host': 'api.m.jd.com',
      'Connection': 'keep-alive',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Origin': 'https://wbbny.m.jd.com',
      'Referer': 'https://wbbny.m.jd.com/babelDiy/Zeus/2vVU4E7JLH9gKYfLQ5EVW6eN2P7B/index.html?babelChannel=jdappsyfc&from=home&lng=116.381712&lat=39.971913&sid=848ed40bf83b638d83b87f0732342a2w&un_area=1_2810_55541_0',
      'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
      'Accept-Language': 'zh-cn',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept': 'application/json, text/plain, */*',
    }
  }
}


function TotalBean() {
  return new Promise(async resolve => {
    const options = {
      url: "https://wq.jd.com/user_new/info/GetJDUserInfoUnion?sceneval=2",
      headers: {
        Host: "wq.jd.com",
        Accept: "*/*",
        Connection: "keep-alive",
        Cookie: $.cookie,
        "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
        "Accept-Language": "zh-cn",
        "Referer": "https://home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&",
        "Accept-Encoding": "gzip, deflate, br"
      }
    }
    $.get(options, (err, resp, data) => {
      try {
        if (err) {
          $.logErr(err)
        } else {
          if (data) {
            data = JSON.parse(data);
            if (data['retcode'] === 1001) {
              $.isLogin = false; //cookie过期
              return;
            }
            if (data['retcode'] === 0 && data.data && data.data.hasOwnProperty("userInfo")) {
              $.nickName = data.data.userInfo.baseInfo.nickname;
            }
          } else {
            console.log('京东服务器返回空数据');
          }
        }
      } catch (e) {
        $.logErr(e)
      } finally {
        resolve();
      }
    })
  })
}
function transform(str) {
  var REQUEST = new Object,
    data = str.slice(str.indexOf("?"), str.length - 1),
    aParams = data.substr(1).split("&");
  for (i = 0; i < aParams.length; i++) {
    var aParam = aParams[i].split("=");
    REQUEST[aParam[0]] = aParam[1]
  }
  return REQUEST
}

function randomString(e) {
  e = e || 32;
  let t = "abcdef0123456789",
    a = t.length,
    n = "";
  for (i = 0; i < e; i++)
    n += t.charAt(Math.floor(Math.random() * a));
  return n
}

// md5
!function (n) { function t(n, t) { var r = (65535 & n) + (65535 & t); return (n >> 16) + (t >> 16) + (r >> 16) << 16 | 65535 & r } function r(n, t) { return n << t | n >>> 32 - t } function e(n, e, o, u, c, f) { return t(r(t(t(e, n), t(u, f)), c), o) } function o(n, t, r, o, u, c, f) { return e(t & r | ~t & o, n, t, u, c, f) } function u(n, t, r, o, u, c, f) { return e(t & o | r & ~o, n, t, u, c, f) } function c(n, t, r, o, u, c, f) { return e(t ^ r ^ o, n, t, u, c, f) } function f(n, t, r, o, u, c, f) { return e(r ^ (t | ~o), n, t, u, c, f) } function i(n, r) { n[r >> 5] |= 128 << r % 32, n[14 + (r + 64 >>> 9 << 4)] = r; var e, i, a, d, h, l = 1732584193, g = -271733879, v = -1732584194, m = 271733878; for (e = 0; e < n.length; e += 16) { i = l, a = g, d = v, h = m, g = f(g = f(g = f(g = f(g = c(g = c(g = c(g = c(g = u(g = u(g = u(g = u(g = o(g = o(g = o(g = o(g, v = o(v, m = o(m, l = o(l, g, v, m, n[e], 7, -680876936), g, v, n[e + 1], 12, -389564586), l, g, n[e + 2], 17, 606105819), m, l, n[e + 3], 22, -1044525330), v = o(v, m = o(m, l = o(l, g, v, m, n[e + 4], 7, -176418897), g, v, n[e + 5], 12, 1200080426), l, g, n[e + 6], 17, -1473231341), m, l, n[e + 7], 22, -45705983), v = o(v, m = o(m, l = o(l, g, v, m, n[e + 8], 7, 1770035416), g, v, n[e + 9], 12, -1958414417), l, g, n[e + 10], 17, -42063), m, l, n[e + 11], 22, -1990404162), v = o(v, m = o(m, l = o(l, g, v, m, n[e + 12], 7, 1804603682), g, v, n[e + 13], 12, -40341101), l, g, n[e + 14], 17, -1502002290), m, l, n[e + 15], 22, 1236535329), v = u(v, m = u(m, l = u(l, g, v, m, n[e + 1], 5, -165796510), g, v, n[e + 6], 9, -1069501632), l, g, n[e + 11], 14, 643717713), m, l, n[e], 20, -373897302), v = u(v, m = u(m, l = u(l, g, v, m, n[e + 5], 5, -701558691), g, v, n[e + 10], 9, 38016083), l, g, n[e + 15], 14, -660478335), m, l, n[e + 4], 20, -405537848), v = u(v, m = u(m, l = u(l, g, v, m, n[e + 9], 5, 568446438), g, v, n[e + 14], 9, -1019803690), l, g, n[e + 3], 14, -187363961), m, l, n[e + 8], 20, 1163531501), v = u(v, m = u(m, l = u(l, g, v, m, n[e + 13], 5, -1444681467), g, v, n[e + 2], 9, -51403784), l, g, n[e + 7], 14, 1735328473), m, l, n[e + 12], 20, -1926607734), v = c(v, m = c(m, l = c(l, g, v, m, n[e + 5], 4, -378558), g, v, n[e + 8], 11, -2022574463), l, g, n[e + 11], 16, 1839030562), m, l, n[e + 14], 23, -35309556), v = c(v, m = c(m, l = c(l, g, v, m, n[e + 1], 4, -1530992060), g, v, n[e + 4], 11, 1272893353), l, g, n[e + 7], 16, -155497632), m, l, n[e + 10], 23, -1094730640), v = c(v, m = c(m, l = c(l, g, v, m, n[e + 13], 4, 681279174), g, v, n[e], 11, -358537222), l, g, n[e + 3], 16, -722521979), m, l, n[e + 6], 23, 76029189), v = c(v, m = c(m, l = c(l, g, v, m, n[e + 9], 4, -640364487), g, v, n[e + 12], 11, -421815835), l, g, n[e + 15], 16, 530742520), m, l, n[e + 2], 23, -995338651), v = f(v, m = f(m, l = f(l, g, v, m, n[e], 6, -198630844), g, v, n[e + 7], 10, 1126891415), l, g, n[e + 14], 15, -1416354905), m, l, n[e + 5], 21, -57434055), v = f(v, m = f(m, l = f(l, g, v, m, n[e + 12], 6, 1700485571), g, v, n[e + 3], 10, -1894986606), l, g, n[e + 10], 15, -1051523), m, l, n[e + 1], 21, -2054922799), v = f(v, m = f(m, l = f(l, g, v, m, n[e + 8], 6, 1873313359), g, v, n[e + 15], 10, -30611744), l, g, n[e + 6], 15, -1560198380), m, l, n[e + 13], 21, 1309151649), v = f(v, m = f(m, l = f(l, g, v, m, n[e + 4], 6, -145523070), g, v, n[e + 11], 10, -1120210379), l, g, n[e + 2], 15, 718787259), m, l, n[e + 9], 21, -343485551), l = t(l, i), g = t(g, a), v = t(v, d), m = t(m, h) } return [l, g, v, m] } function a(n) { var t, r = "", e = 32 * n.length; for (t = 0; t < e; t += 8) { r += String.fromCharCode(n[t >> 5] >>> t % 32 & 255) } return r } function d(n) { var t, r = []; for (r[(n.length >> 2) - 1] = void 0, t = 0; t < r.length; t += 1) { r[t] = 0 } var e = 8 * n.length; for (t = 0; t < e; t += 8) { r[t >> 5] |= (255 & n.charCodeAt(t / 8)) << t % 32 } return r } function h(n) { return a(i(d(n), 8 * n.length)) } function l(n, t) { var r, e, o = d(n), u = [], c = []; for (u[15] = c[15] = void 0, o.length > 16 && (o = i(o, 8 * n.length)), r = 0; r < 16; r += 1) { u[r] = 909522486 ^ o[r], c[r] = 1549556828 ^ o[r] } return e = i(u.concat(d(t)), 512 + 8 * t.length), a(i(c.concat(e), 640)) } function g(n) { var t, r, e = ""; for (r = 0; r < n.length; r += 1) { t = n.charCodeAt(r), e += "0123456789abcdef".charAt(t >>> 4 & 15) + "0123456789abcdef".charAt(15 & t) } return e } function v(n) { return unescape(encodeURIComponent(n)) } function m(n) { return h(v(n)) } function p(n) { return g(m(n)) } function s(n, t) { return l(v(n), v(t)) } function C(n, t) { return g(s(n, t)) } function A(n, t, r) { return t ? r ? s(t, n) : C(t, n) : r ? m(n) : p(n) } $.md5 = A }(this);
// prettier-ignore
function Env(t, e) { "undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0); class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return "POST" === e && (s = this.post), new Promise((e, i) => { s.call(this, t, (t, s, r) => { t ? i(t) : e(s) }) }) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new class { constructor(t, e) { this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `🔔${this.name}, 开始!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; const i = this.getdata(t); if (i) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise(e => { this.get({ url: t }, (t, s, i) => e(i)) }) } runScript(t, e) { return new Promise(s => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r; const [o, h] = i.split("@"), n = { url: `http://${h}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": o, Accept: "*/*" } }; this.post(n, (t, e, i) => s(i)) }).catch(t => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e); if (!s && !i) return {}; { const i = s ? t : e; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), r = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r) } } lodash_get(t, e, s) { const i = e.replace(/\[(\d+)\]/g, ".$1").split("."); let r = t; for (const t of i) if (r = Object(r)[t], void 0 === r) return s; return r } lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t) } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : ""; if (r) try { const t = JSON.parse(r); e = t ? this.lodash_get(t, i, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i), h = i ? "null" === o ? null : o || "{}" : "{}"; try { const e = JSON.parse(h); this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i) } catch (e) { const o = {}; this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i) } } else s = this.setval(t, e); return s } getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null } setval(t, e) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = (() => { })) { t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } }).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) })) } post(t, e = (() => { })) { if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.post(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) }); else if (this.isQuanX()) t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t)); else if (this.isNode()) { this.initGotEnv(t); const { url: s, ...i } = t; this.got.post(s, i).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) }) } } time(t, e = null) { const s = e ? new Date(e) : new Date; let i = { "M+": s.getMonth() + 1, "d+": s.getDate(), "H+": s.getHours(), "m+": s.getMinutes(), "s+": s.getSeconds(), "q+": Math.floor((s.getMonth() + 3) / 3), S: s.getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in i) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length))); return t } msg(e = t, s = "", i = "", r) { const o = t => { if (!t) return t; if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : this.isSurge() ? { url: t } : void 0; if ("object" == typeof t) { if (this.isLoon()) { let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"]; return { openUrl: e, mediaUrl: s } } if (this.isQuanX()) { let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl; return { "open-url": e, "media-url": s } } if (this.isSurge()) { let e = t.url || t.openUrl || t["open-url"]; return { url: e } } } }; if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) { let t = ["", "==============📣系统通知📣=============="]; t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t) } } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { const s = !this.isSurge() && !this.isQuanX() && !this.isLoon(); s ? this.log("", `❗️${this.name}, 错误!`, t.stack) : this.log("", `❗️${this.name}, 错误!`, t) } wait(t) { return new Promise(e => setTimeout(e, t)) } done(t = {}) { const e = (new Date).getTime(), s = (e - this.startTime) / 1e3; this.log("", `🔔${this.name}, 结束! 🕛 ${s} 秒`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t) } }(t, e) }
