# -- coding: utf-8 --
"""
const $ = new Env("serv00 保号");
serv00 保号
[Script]
cron "0 0 10 ? * MON/14" script-path=serv00_login.py,tag=serv00 保号
"""

import json
import asyncio
from pyppeteer import launch
from datetime import datetime, timedelta
import aiofiles
import random
import requests
import os
from notify import send
os.environ['PYPPETEER_DOWNLOAD_HOST'] = "https://npmmirror.com/mirrors"

def format_to_iso(date):
    return date.strftime('%Y-%m-%d %H:%M:%S')

async def delay_time(ms):
    await asyncio.sleep(ms / 1000)

# 全局浏览器实例
browser = None

# 消息
message = ""

async def login(username, password, panelnum):
    global browser

    page = None  # 确保 page 在任何情况下都被定义
    serviceName = 'ct8' if 'ct8' in panelnum else 'serv00'
    try:
        if not browser:
            browser = await launch(headless=True, args=['--no-sandbox', '--disable-setuid-sandbox'])

        page = await browser.newPage()
        url = f'https://panel{panelnum}/login/?next=/'
        await page.goto(url)

        username_input = await page.querySelector('#id_username')
        if username_input:
            await page.evaluate('''(input) => input.value = ""''', username_input)

        await page.type('#id_username', username)
        await page.type('#id_password', password)

        login_button = await page.querySelector('#submit')
        if login_button:
            await login_button.click()
        else:
            raise Exception('无法找到登录按钮')

        await page.waitForNavigation()

        is_logged_in = await page.evaluate('''() => {
            const logoutButton = document.querySelector('a[href="/logout/"]');
            return logoutButton !== null;
        }''')

        return is_logged_in

    except Exception as e:
        print(f'{serviceName}账号 {username} 登录时出现错误: {e}')
        return False

    finally:
        if page:
            await page.close()
# 显式的浏览器关闭函数
async def shutdown_browser():
    global browser
    if browser:
        await browser.close()
        browser = None

async def main():
    global message
    accounts = os.environ["serv00_AUTH"]
    if accounts:
        accounts = json.loads(accounts)

    for account in accounts:
        username = account['username']
        password = account['password']
        panelnum = account['panelnum']

        serviceName = 'ct8' if 'ct8' in panelnum else 'serv00'
        is_logged_in = await login(username, password, panelnum)

        now_beijing = format_to_iso(datetime.utcnow() + timedelta(hours=8))
        if is_logged_in:
            message += f"✅*{serviceName}*账号 *{username}* 于北京时间 {now_beijing}登录面板成功！\n\n"
            print(f"{serviceName}账号 {username} 于北京时间 {now_beijing}登录面板成功！")
        else:
            message += f"❌*{serviceName}*账号 *{username}* 于北京时间 {now_beijing}登录失败\n\n❗请检查*{username}*账号和密码是否正确。\n\n"
            print(f"{serviceName}账号 {username} 登录失败，请检查{serviceName}账号和密码是否正确。")

        delay = random.randint(1000, 8000)
        await delay_time(delay)
        
    message += f"🔚脚本结束，如有异常点击下方按钮👇"
    send("serv00 保号",message)
    print(f'所有{serviceName}账号登录完成！')
    # 退出时关闭浏览器
    await shutdown_browser()

if __name__ == '__main__':
    asyncio.run(main())
