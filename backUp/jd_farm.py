
'''
cron: 46 6,11,17,23 * * *
东东农场
new Env('东东农场py')
1、shareCode 为自己的助力码，但是需要别人为自己助力
2、waterTimesLimit 自定义的每天浇水最大次数
3、retainWaterLimit 完成10次浇水任务的基础上,希望水滴始终高于此数;优先级高于waterTimesLimit
4、水滴高于100时,默认使用翻倍卡;其他情况不使用道具

'''

import json
import requests
import time
import notify
import os
import re
import ssl
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.poolmanager import PoolManager

from Free_proxy_pool import proxy_pool


class MyAdapter(HTTPAdapter):
    def init_poolmanager(self, connections, maxsize, block=False):
        self.poolmanager = PoolManager(num_pools=connections,
                                       maxsize=maxsize,
                                       block=block,
                                       ssl_version=ssl.PROTOCOL_TLSv1)


proxy = None

waterTimesLimit = 20  # 自定义的每天浇水最大次数
retainWaterLimit = 100  # 完成10次浇水任务的基础上,希望水滴始终高于此数
waterFriendLimit = 2  # [0,2]   0: 始终不替他人浇水   2: 替他人浇水2次以完成任务获得25水

shareCodes = ['c041cad170774d169fa2c6af2c9ff2b8',
              '10e2fb8a50924e0d9f7d53e893397468', 'cdbe415367e842d79b665ae03aeac098']


def postTemplate(cookies, functionId, body):
    headers = {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
        'Host': 'api.m.jd.com',
        'Content-Type': 'application/x-www-form-urlencoded',
    }
    params = (
        ('functionId', functionId),
    )
    data = {
        'body': json.dumps(body),
        "appid": "wh5",
        "clientVersion": "9.1.0"
    }
    session = requests.Session()
    session.mount('https://', MyAdapter())

    response = session.post(
        'https://api.m.jd.com/client.action', headers=headers, cookies=cookies, data=data, params=params, proxies=proxy)
    return response.json()


def getTemplate(cookies, functionId, body):
    headers = {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
        'Host': 'api.m.jd.com',
    }
    body["version"] = 4
    body["channel"] = 1
    params = (
        ('functionId', functionId),
        ('body', json.dumps(body)),
        ('appid', 'wh5'),
    )
    session = requests.Session()
    session.mount('https://', MyAdapter())
    response = session.get('https://api.m.jd.com/client.action',
                            headers=headers, params=params, cookies=cookies, proxies=proxy)
    return response.json()


def duck(cookies):
    print("\n【小鸭子】")
    for _ in range(4):
        result = postTemplate(cookies, "getFullCollectionReward", {
                              "type": 2, "version": 6})
        # print(result)
        if result["code"] == "10" or result["hasLimit"]:
            print(">>>小鸭子游戏达到上限,跳出")
            return


def luck(cookies):
    print("\n【随机水滴】")
    result = postTemplate(cookies, "gotWaterGoalTaskForFarm", {"type": 3})
    if result["code"] == "0":
        print("addEnergy ", result["addEnergy"])
    if result["code"] == "7":
        print("暂无")


def water(cookies):
    print("\n【Water】")
    result = postTemplate(cookies, "initForFarm", {"version": 2})
    totalWaterTaskTimes = postTemplate(cookies, "taskInitForFarm", {"version": 2})[
        "totalWaterTaskInit"]["totalWaterTaskTimes"]
    toFlowTimes = result["toFlowTimes"]
    toFruitTimes = result["toFruitTimes"]
    totalEnergy = result["farmUserPro"]["totalEnergy"]
    print(f"当前水滴: {totalEnergy}")
    doubleCard = postTemplate(cookies, "myCardInfoForFarm",
                              {"version": 4, "channel": 1})["doubleCard"]
    # print("检索[水滴翻倍卡]")
    if doubleCard > 0 and totalEnergy >= 100:
        print("存在[水滴翻倍卡],且水滴高于100")
        for i in range(doubleCard):
            print("使用[翻倍卡]", postTemplate(cookies, "userMyCardForFarm",
                                          {"cardType": "doubleCard"}))

    if totalWaterTaskTimes >= 10 and totalEnergy < retainWaterLimit+10:
        print(
            f"""10次浇水完成,保留水滴{totalEnergy}g (retainWaterLimit={retainWaterLimit} 限制)""")
        print("跳出自动浇水")
        return
    if totalWaterTaskTimes >= waterTimesLimit:
        print("跳过浇水")
        print(f"今日实际浇水 {totalWaterTaskTimes} 次")
        print(f"已达今日最大浇水 {waterTimesLimit} 次")
        print("\n请自行修改 waterTimesLimit")
        return
    for i in range(waterTimesLimit):
        print(f"自动浇水...[{i}]")
        time.sleep(1)
        waterInfo = postTemplate(cookies, "waterGoodForFarm", {})  # 实际浇水
        print(waterInfo)
        totalEnergy = waterInfo["totalEnergy"]
        totalWaterTimes = waterInfo["totalWaterTimes"]
        if waterInfo["finished"]:
            print("\n水果成熟,退出浇水")
            return
        if waterInfo["treeEnergy"] == 10:
            # 奖励30水
            print(postTemplate(cookies, "gotStageAwardForFarm", {"type": 1}))
            totalEnergy += 30
        if waterInfo["treeEnergy"] == toFlowTimes*10:
            # 奖励40水
            print(postTemplate(cookies, "gotStageAwardForFarm", {"type": 2}))
            totalEnergy += 40
        if waterInfo["treeEnergy"] == toFruitTimes*10:
            # 奖励50水
            print(postTemplate(cookies, "gotStageAwardForFarm", {"type": 3}))
            totalEnergy += 50
        if totalWaterTimes >= 10 and totalEnergy < retainWaterLimit+10:
            print(
                f"""10次浇水完成,保留水滴{totalEnergy}g (retainWaterLimit= {retainWaterLimit}限制)""")
            print("跳出自动浇水")
            return
        if totalWaterTimes >= waterTimesLimit:
            print("跳过浇水")
            print(f"今日实际浇水 {totalWaterTimes} 次")
            print(f"已达今日最大浇水 {waterTimesLimit} 次")
            print("\n请自行修改 waterTimesLimit")
            return
        if totalEnergy < 10:
            print("水滴不足")
            return


def friends(cookies):
    print("\n【好友浇水】")
    data = postTemplate(cookies, "friendListInitForFarm",
                        {"version": 4, "channel": 1})
    print(f"""今日邀请 {data["inviteFriendCount"]}/10""")
    if data["inviteFriendCount"] > 0 and data["inviteFriendCount"] > data["inviteFriendGotAwardCount"]:
        print("领取邀请奖励")
        print(postTemplate(cookies, "awardInviteFriendForFarm", {}))
    if waterFriendLimit == 0:
        print("始终不为好友浇水\n跳过")
        return
    needWater = [i["shareCode"]
                 for i in data["friends"] if i["friendState"] == 1]
    waterFriendCountKey = postTemplate(cookies, "taskInitForFarm", {})[
        "waterFriendTaskInit"]["waterFriendCountKey"]
    print(f"今日为好友浇水次数:{waterFriendCountKey}")
    needWater = shareCodes+needWater
    if waterFriendCountKey >= waterFriendLimit:
        print("助力浇水完成\n")
        return
    N = waterFriendLimit - waterFriendCountKey
    for i in needWater:
        print(i)
        if N == 0:
            return
        data = postTemplate(cookies, "waterFriendForFarm",
                            {"shareCode": i, "version": 6})
        print(data)
        if data["code"] == "0":
            N -= 1
        if data["code"] == "11":
            print("水滴不够,跳出")
            return


def bag(cookies):
    print("\n【背包】")
    data = postTemplate(cookies, "myCardInfoForFarm",
                        {"version": 6, "channel": 1})
    beanCard = data['beanCard']
    fastCard = data["fastCard"]
    doubleCard = data["doubleCard"]
    signCard = data["signCard"]
    print(f"""水滴换豆卡 {beanCard}""")
    print(f"""快速浇水卡 {fastCard}""")
    print(f"""水滴翻倍卡 {doubleCard}""")
    print(f"""额外签到卡 {signCard}""")
    if signCard > 0:
        print("使用【额外签到卡】 ", postTemplate(
            cookies, "userMyCardForFarm", {"cardType": "signCard", "version": 6}))


def takeTask(cookies):
    print("\n【任务列表】")
    taskList = postTemplate(cookies, "taskInitForFarm", {})
    if "signInit" in taskList:
        _signInit = taskList["signInit"]  # 连续签到
        print(f"""todaySigned: {_signInit["todaySigned"]}""")
        if not _signInit["todaySigned"]:
            print("连续签到")
            postTemplate(cookies, "signForFarm", {"type": 2})

    _gotBrowseTaskAdInit = taskList["gotBrowseTaskAdInit"]  # 浏览
    print(f"""BrowseTaskAd: {_gotBrowseTaskAdInit["f"]}""")
    if not _gotBrowseTaskAdInit["f"]:
        for i in _gotBrowseTaskAdInit["userBrowseTaskAds"]:
            print("浏览广告")
            postTemplate(cookies, "browseAdTaskForFarm", {
                         "type": 0, "advertId": i["advertId"]})
            time.sleep(0.4)
            postTemplate(cookies, "browseAdTaskForFarm", {
                         "type": 1, "advertId": i["advertId"]})

    _gotThreeMealInit = taskList["gotThreeMealInit"]  # 定时领水 6-9，11-14，17-21
    print(f"""ThreeMeal: {_gotThreeMealInit["f"]}""")
    if not _gotThreeMealInit["f"]:
        print("三餐定时领取")
        postTemplate(cookies, "gotThreeMealForFarm", {})

    _firstWaterInit = taskList["firstWaterInit"]  # 每日首次浇水
    print(f"""firstWater: {_firstWaterInit["f"]}""")
    if not _firstWaterInit["f"]:
        print("首次浇水奖励")
        postTemplate(cookies, "firstWaterTaskForFarm", {})

    _totalWaterTaskInit = taskList["totalWaterTaskInit"]  # 每日累计浇水
    print(
        f"""totalWaterTask: {_totalWaterTaskInit["f"]}  ({_totalWaterTaskInit["totalWaterTaskTimes"]}/10)""")
    if not _totalWaterTaskInit["f"] and _totalWaterTaskInit["totalWaterTaskTimes"] >= 10:
        print("浇水10次奖励")
        postTemplate(cookies, "totalWaterTaskForFarm", {})

    _waterRainInit = taskList["waterRainInit"]  # 收集水滴雨
    print(f"""waterRain: {_waterRainInit["winTimes"]}/2""")
    if not _waterRainInit["f"]:
        print(">>>>水滴雨")
        postTemplate(cookies, "waterRainForFarm", {
            "type": 1, "hongBaoTimes": 100, "version": 3})
    _waterFriendTaskInit = taskList["waterFriendTaskInit"]
    print(
        f"""waterFriend: {_waterFriendTaskInit["waterFriendCountKey"]}/{_waterFriendTaskInit["waterFriendMax"]}   {_waterFriendTaskInit["f"]}""")
    if not _waterFriendTaskInit["f"] and _waterFriendTaskInit["waterFriendCountKey"] >= _waterFriendTaskInit["waterFriendMax"]:
        print(">>>>帮助好友浇水奖励")
        postTemplate(cookies, "waterFriendGotAwardForFarm",
                     {"version": 4, "channel": 1})
    return _totalWaterTaskInit["totalWaterTaskTimes"]


def _help(cookies, shareCodes):
    for i in shareCodes:
        postTemplate(cookies, "initForFarm", {"shareCode": i})
        postTemplate(cookies, "initForFarm", {
            "shareCode": f"{i}-inviteFriend"})


def masterHelp(cookies):
    print("\n【助力得水】")
    help_me_list = postTemplate(cookies, "masterHelpTaskInitForFarm", {})
    masterHelpPeoples = len(help_me_list["masterHelpPeoples"])
    print(
        f"""完成进度 {masterHelpPeoples}/5   {help_me_list["f"]}""")
    if not help_me_list["f"] and masterHelpPeoples >= 5:
        print("领取奖励")
        help_me_list1 = postTemplate(
            cookies, "masterGotFinishedTaskForFarm", {})
        print(help_me_list1)


def clockIn(cookies):
    print("\n【打卡领水】")
    clockInInit = postTemplate(
        cookies, "clockInInitForFarm", {})
    if clockInInit["totalSigned"] == 7 and not clockInInit["gotClockInGift"]:  # 惊喜礼包
        print('[领取惊喜礼包]', postTemplate(cookies, "clockInForFarm", {"type": 2}))

    print(f"""todaySigned: {clockInInit["todaySigned"]}""")
    if not clockInInit["todaySigned"]:
        print("今日签到")
        print(postTemplate(cookies, "clockInForFarm", {"type": 1}))

    if "themes" in clockInInit:
        if clockInInit["themes"]:
            print(
                f""">>> 限时关注得水滴 {clockInInit["myFollowThemeConfigTimes"]}/3""")
            for i in [i["id"] for i in clockInInit["themes"] if not i["hadGot"]]:
                print(f"""关注id [{i}]""")
                postTemplate(cookies, "clockInFollowForFarm", {
                    "id": i, "type": "theme", "step": 1})
                time.sleep(0.5)
                postTemplate(cookies, "clockInFollowForFarm", {
                    "id": i, "type": "theme", "step": 2})
                time.sleep(0.5)

    if "venderCoupons" in clockInInit:
        if clockInInit["venderCoupons"]:
            print(
                f""">>> 限时领券得水滴 {clockInInit["myFollowVenderCouponTimes"]}/3""")
            for i in [i["id"] for i in clockInInit["venderCoupons"] if not i["hadGot"] and i["hadStock"]]:
                print(f"""领券id [{i}]""")
                time.sleep(0.5)
                postTemplate(cookies, "clockInFollowForFarm",
                             {"id": i, "type": "venderCoupon", "step": 1})
                time.sleep(0.5)
                postTemplate(cookies, "clockInFollowForFarm",
                             {"id": i, "type": "venderCoupon", "step": 2})


def turnTable(cookies):
    print("\n【天天抽奖】")
    result = getTemplate(cookies, "initForTurntableFarm", {})
    if "turntableBrowserAds" in result:
        for i in result["turntableBrowserAds"]:
            if i["status"]:
                continue
            print("浏览广告>>")
            print(getTemplate(cookies, "browserForTurntableFarm",
                              {"type": 1, 'adId': i["adId"], }))
            time.sleep(1)
            print(getTemplate(cookies, "browserForTurntableFarm",
                              {"type": 2, 'adId': i["adId"], }))
    if "timingGotStatus" in result:
        if not result["timingGotStatus"] and result["sysTime"]-result["timingLastSysTime"] > 14400000:  # 领取定时奖励
            print('[定时奖励] ', getTemplate(
                cookies, "timingAwardForTurntableFarm", {}))
    print(
        f"""为我助力: {result["masterHelpTimes"]}/{result["helpedTimesByOther"]}""")

    for i in shareCodes:
        getTemplate(cookies, "initForFarm", {"shareCode": f"{i}-3"})  # 助力

    result = getTemplate(cookies, "initForTurntableFarm", {})
    for i in range(result["remainLotteryTimes"]):  # 抽奖次数
        print(f'[抽奖 {i}] ', getTemplate(
            cookies, "lotteryForTurntableFarm", {"type": 1}))  # 抽奖
        time.sleep(2)


def get_cookies():
    # secret = os.environ["JD_COOKIE"]
    secret= "pt_key=AAJjSXstADBYfMf9k5zuHRqdv7Qh0sgqB-kbZOAtw9l-078sYblAtH0GyVHEHgSZxPHezP-H59U;  pt_pin=king%E5%AD%A6%E4%BD%B3;&pt_key=AAJjSXxGADBM3Nc8qWCJwOQnprCaPnSJ2zIgI37XBsfTTtZOXJdFF4ZKoVJH9uiP1zXs4WbkQw8; pt_pin=kingxjbei;&pt_key=AAJjUfS5ADDysTT5oL5P0StxJBvlC9zs40Q2oWwUwdwcXdeKfHAdRG15lxtso8r9CG5zsYsBvBg; pt_pin=jd_dTxmQzOLolGc;"

    cookiesLists = []  # 重置cookiesList
    if '&' in secret:
        for line in secret.split('&'):
            pt_pin = re.findall(r'pt_pin=([^; ]+)(?=;?)', line)[0]
            pt_key = re.findall(r'pt_key=([^; ]+)(?=;?)', line)[0]
            cookiesLists.append({"pt_pin": pt_pin, "pt_key": pt_key})
    else:
        for line in secret.split('\n'):
            pt_pin = re.findall(r'pt_pin=([^; ]+)(?=;?)', line)[0]
            pt_key = re.findall(r'pt_key=([^; ]+)(?=;?)', line)[0]
            cookiesLists.append({"pt_pin": pt_pin, "pt_key": pt_key})
    return cookiesLists


def run():
    global proxy

    proxy = proxy_pool.Free_proxy_pool().get_a_proxy()

    for cookies in get_cookies():
        result = postTemplate(cookies, 'initForFarm', {"version": 4})
        treeState = result["treeState"]
        if treeState == 0:
            print("还未开始种植")
            continue
        if treeState in [2, 3]:
            print("可以兑换了")
            notify.send("东东农场",
                        f"""东东农场可兑换【{cookies["pt_pin"]}】""", f"""东东农场 账号【{cookies["pt_pin"]}】 可以兑换了""")
            continue
        nickName = result["farmUserPro"]["nickName"]
        myshareCode = result["farmUserPro"]["shareCode"]
        treeEnergy = result["farmUserPro"]["treeEnergy"]
        lastTimes = int(
            (result["farmUserPro"]["treeTotalEnergy"]-treeEnergy)/10)
        print(
            f"""\n\n[ {nickName} ]\n{result["farmUserPro"]["name"]} (通用红包)""")
        print(f'已经薅了{result["farmUserPro"]["winTimes"]}次')
        print(f"""我的助力码: {myshareCode}""")
        print(
            f"""treeEnergy: {treeEnergy}/{result["farmUserPro"]["treeTotalEnergy"]}""")
        print(
            f"""剩余浇水次数: {lastTimes}""")
        turnTable(cookies)
        clockIn(cookies)
        _help(cookies, shareCodes)
        takeTask(cookies)
        # masterHelp(cookies)
        luck(cookies)
        duck(cookies)
        friends(cookies)
        bag(cookies)
        water(cookies)
        print("\n")
        print("##"*30)


if __name__ == "__main__":
    run()
