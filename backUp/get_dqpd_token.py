# Python3.7
# encoding = utf-8
# python get_dqpd_token.py -c [True/False 是否清除抓取记录] -k [搜索关键字，多个用空格隔开，需使用双引号，例："美妆 电脑"] -jd [True/False 是否只查询有京豆的]
# 参数都可空
import requests
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.poolmanager import PoolManager
import ssl
import re
import json
from bs4 import BeautifulSoup
from urllib import parse
import time
import random
import os
import argparse

from requests.sessions import session
from notify import send
import jd_bean_api
from datetime import datetime


class MyAdapter(HTTPAdapter):
    def init_poolmanager(self, connections, maxsize, block=False):
        self.poolmanager = PoolManager(num_pools=connections,
                                       maxsize=maxsize,
                                       block=block,
                                       ssl_version=ssl.PROTOCOL_TLSv1)


KEYWORD = ""
cookie = 'pt_key=AAJhoKCuADDQMxIdeEcpuX8xmUQvYZHFXlkM_ZZy8Fj8dVYEc6nXYOQ5ES9srIIy8EwN2fxRRl0; pt_pin=king%E5%AD%A6%E4%BD%B3;'
if "JDCOOKIE" in os.environ and os.environ["JDCOOKIE"]:
    cookie = os.environ["JDCOOKIE"]
base = 'https://item.jd.com'
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.90 Safari/537.36',
    'Connection': 'keep-alive',
    # 参考:https://search.jd.com/Search?keyword=python&enc=utf-8&wq=python
}

m_headers = {
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1 Edg/94.0.4606.71',
    'Connection': 'keep-alive',
    'Referer': 'https://shop.m.jd.com/',
    'Cache-Control': 'no-cache',
    'Cookie': cookie
    # 参考:https://search.jd.com/Search?keyword=python&enc=utf-8&wq=python
}
url_list = []
token_list = []
all_token_list = []
sc_shop_list = []  # 关注有礼链接
token_msg_list = []
max_token_count = 10  # 获取token的数量
self_token = ''  # 当前店铺的token
self_token_msg = ''  # 当前店铺的token
jingdou = True  # 只获取签到有京豆的
isjingdou = False  # 签到有京豆的

shopurlList = []  # 转链后的店铺地址
shopList = []  # 转链前的店铺地址

# 不同浏览器的UA
header_list = [
    # 遨游
    {"User-Agent": "Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1; Maxthon 2.0)",
     'Connection': 'keep-alive', },
    # 火狐
    {"User-Agent": "Mozilla/5.0 (Windows NT 6.1; rv:2.0.1) Gecko/20100101 Firefox/4.0.1",
     'Connection': 'keep-alive', },
    # 谷歌
    {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_0) AppleWebKit/535.11 (KHTML, like Gecko) Chrome/17.0.963.56 Safari/535.11",
     'Connection': 'keep-alive', }
]

m_header_list = [
    {"User-Agent": "jdapp;android;10.1.6;10;network/wifi;Mozilla/5.0 (Linux; Android 10; ONEPLUS A5010 Build/QKQ1.191014.012; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045230 Mobile Safari/537.36",
     'Connection': 'keep-alive', 'Referer': 'https://shop.m.jd.com/'},
    {"User-Agent": "jdapp;iPhone;10.1.6;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
     'Connection': 'keep-alive', 'Referer': 'https://shop.m.jd.com/'},
    {"User-Agent": "jdapp;android;10.1.6;10;network/wifi;Mozilla/5.0 (Linux; Android 10; GM1910 Build/QKQ1.190716.003; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045230 Mobile Safari/537.36",
     'Connection': 'keep-alive', 'Referer': 'https://shop.m.jd.com/'},
    {"User-Agent": "jdapp;android;10.1.6;9;network/wifi;Mozilla/5.0 (Linux; Android 9; 16T Build/PKQ1.190616.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/6.2 TBS/044942 Mobile Safari/537.36",
     'Connection': 'keep-alive', 'Referer': 'https://shop.m.jd.com/'},
    {"User-Agent": "jdapp;iPhone;10.1.6;13.6;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 13_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
     'Connection': 'keep-alive', 'Referer': 'https://shop.m.jd.com/'},
    {"User-Agent": "jdapp;android;10.1.6;9;network/wifi;Mozilla/5.0 (Linux; Android 9; MI 6 Build/PKQ1.190118.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/6.2 TBS/044942 Mobile Safari/537.36",
     'Connection': 'keep-alive', 'Referer': 'https://shop.m.jd.com/'},
    {"User-Agent": "jdapp;android;10.1.6;11;network/wifi;Mozilla/5.0 (Linux; Android 11; Redmi K30 5G Build/RKQ1.200826.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045511 Mobile Safari/537.36",
     'Connection': 'keep-alive', 'Referer': 'https://shop.m.jd.com/'},
    {"User-Agent": "jdapp;android;10.1.6;10;network/wifi;Mozilla/5.0 (Linux; Android 10; M2006J10C Build/QP1A.190711.020; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045230 Mobile Safari/537.36",
     'Connection': 'keep-alive', 'Referer': 'https://shop.m.jd.com/'},
    {"User-Agent": "jdapp;iPhone;10.1.6;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
     'Connection': 'keep-alive', 'Referer': 'https://shop.m.jd.com/'},
]
# 不同的代理IP
proxy_list = [
    {"http": "127.0.0.1:1082"},
    # {"http": "159.75.218.213:3128"},
    # {'http': '117.114.149.66:55443'},
    # {'http': '111.231.86.149:7890'},
    # {'http': '111.231.86.149:7890'},
    # {'http': '27.191.60.54:3256'},
    # {'http': '106.55.15.244:8889'},
    # {'http': '117.114.149.66:55443'},
    # {'http': '27.191.60.242:8089'},
    # {'http': '115.218.1.193:9000'},
]


def get_index(url):

    global self_token_msg
    # 一开始的请求页面
    session = requests.Session()
    session.mount('https://', MyAdapter())

    # 随机获取UA和代理IP
    header = random.choice(header_list)
    proxy = random.choice(proxy_list)
    html = session.get(url, headers=header, proxies=proxy)
    html.encoding = 'utf-8'
    # if html.text.find('=https://passport.jd.com/uc/login'):
    #     return False
    soup = BeautifulSoup(html.text, 'lxml')
    items = soup.select('li.gl-item')
    for item in items:
        self_token_msg = ''
        # 获取店铺链接
        shop_dom = item.select('li.gl-item .gl-i-wrap .p-shop .J_im_icon a')
        if shop_dom:
            shop = shop_dom[0]
            inner_url = shop.get('href')
            shop_name = shop.string
            pattern = re.compile('//mall.jd.com/index-(.+).html')
            cid = pattern.findall(inner_url)
            shop_id = cid[0]
            if shop_id not in url_list:
                get_sign_token(cid[0])
                sleep = random.randint(0, 5)
                print(
                    f"{KEYWORD}：等待{sleep}秒，{len(url_list)}、当前：{shop_name} {shop_id} {self_token} {self_token_msg}，已获取到 {len(token_list)} 个token")
                time.sleep(sleep)

    return True


def writeHis(shop):
    current_file = os.path.dirname(os.path.abspath(__file__))
    baconFile = open(f'{current_file}\\dpqd_shopid.txt', 'a')
    try:
        baconFile.write(f'{shop}\n')
    finally:
        baconFile.close()


def get_sign_token(shopid):
    global self_token
    self_token = ''
    url = f"https://wq.jd.com/shopbranch/GetUrlSignDraw?channel=1&venderId={shopid}&_"+(str(
        round(time.time() * 1000)))+"=&sceneval=2&g_login_type=1&callback=getUrlSignDraw&g_ty=ls"

    # 随机获取UA和代理IP
    header = random.choice(m_header_list)
    proxy = random.choice(proxy_list)

   # html = session.get(url, headers=header, proxies=proxy)
    try:
        data = requests.get(url, headers=header, proxies=proxy)
        data = loads_jsonp(data.text)
        if data["data"] != {}:
            url_list.append(shopid)
            writeHis(shopid)
            isvUrl = parse.unquote(data["data"]["isvUrl"])
            if isvUrl:
                token_q = parse.parse_qs(parse.urlparse(isvUrl).query)
                token = token_q.get('token')
                if token:
                    self_token = str(token[0])
                    # print(f"签到Token：{token_q.get('token')[0]}")
                    if self_token not in token_list:
                        # shop_url = f"https://mall.jd.com/index-{shopid}.html"
                        shop_url = f"https://shop.m.jd.com/?shopId={shopid}"
                        interact_center_shopSign_getActivityInfo(self_token)
                        if isjingdou & jingdou:
                            shopurl = getSuperClickUrl(shop_url)
                            if shopurl:
                                shopList.append(shop_url)
                                shopurlList.append(shopurl)
                            token_msg_list.append(self_token_msg)
                            token_list.append(self_token)
                        elif jingdou == False:
                            shopurl = getSuperClickUrl(shop_url)
                            if shopurl:
                                shopList.append(shop_url)
                                shopurlList.append(shopurl)
                            token_msg_list.append(self_token_msg)
                            token_list.append(self_token)
                    if len(token_list) >= max_token_count:
                        # print(f"查询到 {len(url_list)} 家店铺")
                        # print(
                        #     f"已获取到 {max_token_count} 个token：{'&'.join(token_list)}")
                        exit()
    except Exception as e:
        print('get_sign_token', e)


def getSuperClickUrl(materialInfo):
    global shopurlList
    if cookie:
        try:
            body = {
                "funName": "getSuperClickUrl",
                "param": {
                    "materialInfo": materialInfo,
                    "ext1": "200|100_2|"
                },
                "unionId": 2020568451
            }
            url = "https://api.m.jd.com/api?functionId=ConvertSuperLink&appid=u&_=" + \
                (str(round(time.time() * 1000))) + \
                "&body="+json.dumps(body)+"&loginType=2"
            s_headers = {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_8 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.16(0x1800102e) NetType/WIFI Language/zh_CN',
                'Connection': 'keep-alive',
                'Referer': 'https://servicewechat.com/wxf463e50cd384beda/132/page-frame.html',
                'Cookie': cookie
            }
            data = requests.get(url, headers=s_headers)
            data = loads_jsonp(data.text)
            if data['code'] == 200:
                return data['data']['originalContext']
        except Exception as e:
            print('getSuperClickUrl', e)
    return ""


def interact_center_shopSign_getActivityInfo(token):

    global self_token_msg
    global isjingdou
    isjingdou = False
    body = {"token": token, "venderId": ""}
    url = f"https://api.m.jd.com/api?appid=interCenter_shopSign&t={(str(round(time.time() * 1000)))}&loginType=2&functionId=interact_center_shopSign_getActivityInfo&body={json.dumps(body)}&jsonp=jsonp1000"
    data = requests.get(url, headers=m_headers)
    msg = []
    try:
        data = loads_jsonp(data.text)
        if data['code'] == 200:
            prizeRuleList = data["data"]["prizeRuleList"]
            continuePrizeRuleList = data["data"]["continuePrizeRuleList"]
            if isAvailable2(data["data"]['startTime']):
                if len(prizeRuleList) > 0:
                    e = prizeRuleList[0]["prizeList"][0]
                    i = e["type"]
                    discount = e["discount"]
                    if i == 4:
                        isjingdou = True
                        msg.append(f"日签{discount}豆")
                    # elif i == 6:
                    #     msg.append(f"日签{discount}积分")
                    elif i == 14:
                        isjingdou = True
                        msg.append(f"日签{discount / 100}红包")

                if len(continuePrizeRuleList) != 0:
                    for continuePrizeRule in continuePrizeRuleList:
                        e = continuePrizeRule["prizeList"][0]
                        days = continuePrizeRule["days"]
                        i = e["type"]
                        discount = e["discount"]
                        if i == 4:
                            if isAvailable(data["data"]['endTime'], days):
                                isjingdou = True
                            msg.append(f"{days}天{discount}豆")
                        # elif i == 6:
                        #     msg.append(f"连签{days}天{discount}积分")
                        elif i == 14:
                            if isAvailable(data["data"]['endTime'], days):
                                isjingdou = True
                            msg.append(f"{days}天{discount / 100}元红包")
                self_token_msg = ",".join(msg)
    except Exception as e:
        print('interact_center_shopSign_getActivityInfo', e)


def loads_jsonp(_jsonp):
    try:
        return json.loads(re.match(".*?({.*}).*", _jsonp, re.S).group(1))
    except:
        raise ValueError('Invalid Input')


def str2bool(v):
    if isinstance(v, bool):
        return v
    if v.lower() in ('yes', 'true', 't', 'y', '1'):
        return True
    elif v.lower() in ('no', 'false', 'f', 'n', '0'):
        return False
    else:
        raise argparse.ArgumentTypeError('Boolean value expected.')


def follow():
    data = requests.get(
        "https://gitee.com/curtinlv/Public/raw/master/FollowGifts/shopid.txt")
    url_list = data.text.split('\n')
    maxCount = 20
    maxIndex = 0
    for shop_url in url_list:
        if maxCount <= maxIndex:
            break
        if shop_url:
            shop_url_a = shop_url.replace("'", "\"")
            shop_data2 = loads_jsonp(shop_url_a)
            shopid = shop_data2["shopid"]
            shopurl = getSuperClickUrl(
                f"https://shop.m.jd.com/?shopId={shopid}")
            print(maxIndex+1, shopurl)
            if shopurl:
                sc_shop_list.append(shopurl)
            time.sleep(random.randint(0, 5))
            maxIndex += 1
    if len(sc_shop_list) > 0:
        try:
            send('关注有礼', '\n'.join(sc_shop_list))
        except Exception as ex:
            send('关注有礼', '\n'.join(sc_shop_list))


def isAvailable(endTime, days):
    timestamp = endTime / 1000
    date = datetime.fromtimestamp(timestamp)
    now = datetime.now()
    result = (date - now).total_seconds()
    result = result/60/60/24
    return result >= days


def isAvailable2(startTime):
    timestamp = startTime / 1000
    date = datetime.fromtimestamp(timestamp)
    now = datetime.now()
    c_year = now.year
    c_month = now.month
    c_day = now.day
    t_year = date.year
    t_month = date.month
    t_day = date.day

    return c_year == t_year and c_month == t_month and c_day == t_day


def checkOldToken():
    # 校验之前的token是否有效
    current_file = os.path.dirname(os.path.abspath(__file__))
    url_file_path = f'{current_file}/dpqd_token.txt'
    old_token_list = []
    if os.path.exists(url_file_path):
        with open(url_file_path) as f:
            urls = f.read()
        old_token_list = urls.split('\n')
    if len(old_token_list) > 0:
        for old_token in old_token_list:
            if old_token:
                interact_center_shopSign_getActivityInfo(old_token)
                shop_url = f'https://h5.m.jd.com/babelDiy/Zeus/2PAAf74aG3D61qvfKUM5dxUssJQ9/index.html?token={old_token}'
                if isjingdou & jingdou:
                    shopurl = getSuperClickUrl(shop_url)
                    if shopurl:
                        shopList.append(shop_url)
                        shopurlList.append(shopurl)
                    token_msg_list.append(self_token_msg)
                    token_list.append(old_token)
                elif jingdou == False:
                    shopurl = getSuperClickUrl(shop_url)
                    if shopurl:
                        shopList.append(shop_url)
                        shopurlList.append(shopurl)
                    token_msg_list.append(self_token_msg)
                    token_list.append(old_token)

                print(f"校验：{old_token} {self_token_msg}")
                sleep = random.randint(0, 5)
                time.sleep(sleep)
    if len(token_list) >= max_token_count:
        exit()


def main():

    global KEYWORD
    global url_list
    global jingdou
    try:
        checkOldToken()
        parser = argparse.ArgumentParser('')
        parser.add_argument('-c', '--clearable', default=True)
        parser.add_argument('-k', '--KEYWORD', default='旗舰店 自营 美妆 护肤 电器 手机 母婴 服装 玩具')
        parser.add_argument('-jd', '--jingdou', default=True)
        args = parser.parse_args()
        clearable = str2bool(args.clearable)
        jingdou = str2bool(args.jingdou)  # 只获取签到有京豆的
        KEYWORDs = args.KEYWORD.split(" ")
        current_file = os.path.dirname(os.path.abspath(__file__))
        url_file_path = f'{current_file}/dpqd_shopid.txt'
        if os.path.exists(url_file_path):
            if not clearable:
                with open(url_file_path) as f:
                    urls = f.read()
                url_list = urls.split('\n')
            else:
                open(url_file_path, 'w').close()

        index_result = True
        for KeyWord in KEYWORDs:
            if index_result == False:
                print('获取错误，请稍后再试')
                break
            print(f"开始关键词：{KeyWord}")
            KEYWORD = KeyWord
            KEYWORD_encode = parse.quote(KeyWord)
            for i in range(1, 500, 2):
                if index_result == False:
                    print('获取错误，请稍后再试')
                    break
                url = 'https://search.jd.com/Search?keyword={}&page={}'.format(
                    KEYWORD_encode, i)
                index_result = get_index(url)
    except Exception as e:
        print(e)
    finally:
        print(f"查询到 {len(url_list)} 家店铺")
        print(f"已获取到 {len(token_list)} 个token {'&'.join(token_list)}")
        if len(token_list) > 0:
            # print('转链前：', shopList)
            # print('转链后：', shopurlList)
            current_file = os.path.dirname(os.path.abspath(__file__))
            url_file_path = f'{current_file}/dpqd_token.txt'
            baconFile = open(url_file_path, 'wb')
            try:
                baconFile.write('\n'.join(token_list))
            finally:
                baconFile.close()
                msg_list1 = [rv for r in zip(
                    token_msg_list, token_list) for rv in r]
                print('token：', msg_list1)

                msg_list = [rv for r in zip(token_msg_list,
                                            shopurlList) for rv in r]
                print('短链：', msg_list)
                try:
                    t_list = []
                    if len(msg_list1) >= 4:
                        t_list = msg_list1[:len(
                            msg_list1)-2] + msg_list[len(msg_list1)-2:]
                    else:
                        t_list = msg_list
                    # print(t_list)
                    if len(t_list) > 0:
                        send('店铺签到', 'https://t.me/jd_dp_token\n新增\n'+'\n'.join(t_list))
                except Exception as ex:
                    print(ex)

    # token_list = ['连签15天50.0豆', '4575711E8DE40C9344E01693FB41EB4E', '连签5天5.0豆', '396DF5D0CA7E35723DE5CB0B2A8E7CBB',
    #               '连签14天20.0豆', '1102E73F72195078E9ACC9A79445A547', '日签1.0豆,连签3天20.0豆', '45EFFBC945D2038B9988426827CA4615', '连签2天1.0豆', 'ACE4FF2ED7A0DAB1E08280CEC6B6A04B']

    # msg_list = ['连签15天50.0豆', 'https://u.jd.com/nMPjazg', '连签5天5.0豆', 'https://u.jd.com/ndP7Ldu',
    #             '连签14天20.0豆', 'https://u.jd.com/nwPfZTl', '日签1.0豆,连签3天20.0豆', 'https://u.jd.com/ntP76lv', '连签2天1.0豆', 'https://u.jd.com/nMPEerl']
    # try:
    #     t_list = []
    #     if len(token_list) > 4:
    #         t_list = token_list[:4] + msg_list[4:]
    #         # send('店铺签到TOKEN', '\n'.join(token_list[:2]))
    #     else:
    #         t_list = token_list
    #         # send('店铺签到TOKEN', '\n'.join(token_list))
    #     print(t_list)
    #     send('店铺签到', '\n'.join(t_list))
    # except Exception as ex:
    #     print(ex)


if __name__ == '__main__':
    main()
