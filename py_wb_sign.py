# -- coding: utf-8 --
"""
const $ = new Env("微博签到");
微博签到
[Script]
cron "31 8 * * *" script-path=zq_Adv_video.js,tag=微博签到
"""

from logging import fatal
import os
from urllib import parse
import requests
import json
from io import StringIO
from notify import send
import time
import random as rand

requests.packages.urllib3.disable_warnings()
sio = StringIO()


def get_params(u):
    l1 = dict(parse.parse_qsl(parse.urlsplit(u).query))
    params = {}
    for key in l1:
        if key in ["from", "uid", "s", "gsid", "c", 'aid']:
            params[key] = l1[key]
    return params


def sign(params):
    headers = {
        "User-Agent": "ua=HUAWEI-YAL-AL00__weibo__11.3.4__android__android10"}
    url = 'https://api.weibo.cn/2/checkin/add'
    req = requests.get(url, params=params, headers=headers,
                       verify=False).content.decode('utf-8')
    result = json.loads(req)
    if result.get("status") == 10000:
        sio.write(
            f'连续签到: {result.get("data").get("continuous")}天\n本次收益: {result.get("data").get("desc")}\n')
        print(
            f'连续签到: {result.get("data").get("continuous")}天\n本次收益: {result.get("data").get("desc")}\n')
    elif result.get("errno") == 30000:
        sio.write(f"每日签到: 已签到\n")
        print(f"每日签到: 已签到\n")
    elif result.get("status") == 90005:
        sio.write(f'每日签到: {result.get("msg")}\n')
        print(f'每日签到: {result.get("msg")}\n')
    else:
        sio.write(f"每日签到: 签到失败\n")
        print(f"每日签到: 签到失败\n")


def card(params):
    headers = {"User-Agent": "HUAWEI-YAL-AL00__weibo__11.3.4__android__android10"}
    url = "https://api.weibo.cn/2/!/ug/king_act_home"
    response = requests.get(url, params=params, headers=headers, verify=False)
    result = response.json()
    if result.get("status") == 10000:
        nickname = result.get("data").get("user").get("nickname")
        sio.write(
            f'用户昵称: {nickname}\n每日打卡: {result.get("data").get("signin").get("title").split("<")[0]}天\n'
            f'积分总计: {result.get("data").get("user").get("energy")}\n'
        )
        print(
            f'用户昵称: {nickname}\n每日打卡: {result.get("data").get("signin").get("title").split("<")[0]}天\n'
            f'积分总计: {result.get("data").get("user").get("energy")}\n'
        )
    else:
        sio.write(f"每日打卡: 活动过期或失效\n")
        print(f"每日打卡: 活动过期或失效\n")


def pay(params):
    headers = {
        "Accept-Encoding": "gzip, deflate",
        "Connection": "keep-alive",
        "Content-Type": "application/x-www-form-urlencoded",
        "Host": "pay.sc.weibo.com",
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; YAL-AL00 Build/HUAWEIYAL-AL00; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/83.0.4103.106 Mobile Safari/537.36 Weibo (HUAWEI-YAL-AL00__weibo__11.3.4__android__android10)",
    }
    params['lang'] = "zh_CN"
    params["wm"] = "9006_2001"
    url = "https://pay.sc.weibo.com/aj/mobile/home/welfare/signin/do"
    response = requests.post(url, headers=headers, params=params, verify=False)
    result = response.json()
    if result.get("status") == 1:
        sio.write(f'微博钱包: {result.get("score")} 积分\n')
        print(f'微博钱包: {result.get("score")} 积分\n')
    elif result.get("status") == 2:
        sio.write(f"微博钱包: 已签到\n")
        print(f"微博钱包: 已签到\n")
    else:
        sio.write(f"微博钱包: Cookie失效\n")
        print(f"微博钱包: Cookie失效\n")


def topicContentList(cookie):
    headers = {
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Content-Type": "application/json; charset=utf-8",
        "Host": "weibo.com",
        "referer": "https://weibo.com/u/page/follow/6055200039/231093_-_chaohua",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36 Edg/92.0.902.84",
        "cookie": cookie,
    }
    params = {
        "tabid": "231093_-_chaohua",
        "count": 100,
    }
    url = "https://weibo.com/ajax/profile/topicContent"
    req = requests.get(url, params=params, headers=headers,
                       verify=False).content.decode('utf-8')
    try:
        result = json.loads(req)
    except:
        sio.write("cookie 已失效")
        print("cookie 已失效")
        return
    if result.get("ok") == 1:
        list = result["data"]["list"]
        print(f"共 {len(list)} 个超话")
        for item in list:
            topic_name = item["topic_name"]
            oid = item["oid"].split(":")
            CONTAINER_ID = oid[1]
            url2 = "https://weibo.com/p/aj/general/button"
            params2 = {
                "api": 'http://i.huati.weibo.com/aj/super/checkin',
                "id": CONTAINER_ID,
            }
            req2 = requests.get(url2, params=params2, headers=headers,
                                verify=False).content.decode('utf-8')
            result2 = json.loads(req2)
            msg = result2["msg"]
            if result2["code"] == 100000:
                sio.write(f"{topic_name}: 已签到\n")
            else:
                sio.write(f"{topic_name}: {msg}\n")
            sleep = rand.randint(100, 1000)/100
            print(f"当前签到：{topic_name}，下一个等待：{sleep}秒")
            time.sleep(sleep)


def main():
    # current_file = os.path.dirname(os.path.abspath(__file__))
    # with open(f'{current_file}/WB_U.txt') as f: u = f.read() #用户任务签到使用，打开微博抓包
    # with open(f'{current_file}/WB_C.txt') as f: cookie = f.read() #超话签到使用
    u = os.environ["WB_U"]
    cookie = os.environ["WB_Cookie"]
    try:
        if u:
            print("开始微博签到")
            global sio
            u = u.split('\n')
            sio = StringIO()
            for i in u:
                params = get_params(i)
                # card(params)
                sign(params)
                pay(params)
            digest = sio.getvalue().strip()
            send('微博签到', digest)
    except:
        print("签到失败")
        send('微博签到', "签到失败")
    try:
        if cookie:
            print("开始微博超话签到")
            cookie = cookie.split('\n')
            sio = StringIO()
        
            for i in cookie:
                topicContentList(i)
            digest = sio.getvalue().strip()
            send('微博超话签到', digest)
    except:
        print("签到失败")
        send('微博超话签到', "签到失败")
      
if __name__ == '__main__':
    main()
