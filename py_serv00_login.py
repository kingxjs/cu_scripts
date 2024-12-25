# -- coding: utf-8 --
"""
const $ = new Env("serv00 保号");
serv00 保号
[Script]
cron "0 0 10 ? * MON/14" script-path=serv00_login.py,tag=serv00 保号
"""

import json
import time
from datetime import datetime, timedelta
import random
import os
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from notify import send

# 配置Chrome选项
chrome_options = Options()
chrome_options.headless = False
chrome_options.add_argument('--headless')
chrome_options.add_argument('--no-sandbox')
chrome_options.add_argument('--disable-dev-shm-usage')
chrome_options.add_argument(
    "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
)

# 消息
message = ""

def format_to_iso(date):
    return date.strftime('%Y-%m-%d %H:%M:%S')

def login(username, password, panelnum):
    serviceName = 'ct8' if 'ct8' in panelnum else 'serv00'
    driver = None
    try:
        driver = webdriver.Chrome(service=Service('/usr/bin/chromedriver'), options=chrome_options)
        url = f'https://panel{panelnum}.serv00.com/login/?next=/'
        print(f'打开 {url}')
        driver.set_page_load_timeout(60)  # 设置页面加载超时时间
        driver.get(url)
        print(f'获取输入框')
        username_input = driver.find_element(By.ID, 'id_username')
        password_input = driver.find_element(By.ID, 'id_password')
        
        print(f'输入账号密码')
        username_input.clear()
        username_input.send_keys(username)
        password_input.send_keys(password)
        print(f'登录')
        login_button = driver.find_element(By.ID, 'submit')
        login_button.click()

        print(f'等待页面加载')
        # 等待页面加载
        time.sleep(3000)

        # 检查是否登录成功
        is_logged_in = len(driver.find_elements(By.CSS_SELECTOR, 'a[href="/logout/"]')) > 0
        print(f'登录 {is_logged_in}')
        return is_logged_in

    except Exception as e:
        print(f'{serviceName}账号 {username} 登录时出现错误: {e}')
        return False

    finally:
        if driver:
            driver.quit()

def main():
    global message
    accounts = os.environ.get("serv00_AUTH")
    if accounts:
        accounts = json.loads(accounts)

    for account in accounts:
        username = account['username']
        password = account['password']
        panelnum = account['panelnum']

        serviceName = 'ct8' if 'ct8' in panelnum else 'serv00'
        is_logged_in = login(username, password, panelnum)

        now_beijing = format_to_iso(datetime.utcnow() + timedelta(hours=8))
        if is_logged_in:
            message += f"✅*{serviceName}*账号 *{username}* 于北京时间 {now_beijing}登录面板成功！\n\n"
            print(f"{serviceName}账号 {username} 于北京时间 {now_beijing}登录面板成功！")
        else:
            message += f"❌*{serviceName}*账号 *{username}* 于北京时间 {now_beijing}登录失败\n\n❗请检查*{username}*账号和密码是否正确。\n\n"
            print(f"{serviceName}账号 {username} 登录失败，请检查{serviceName}账号和密码是否正确。")

        delay = random.randint(1000, 8000)
        time.sleep(delay)

    message += f"🔚脚本结束，如有异常点击下方按钮👇"
    send("serv00 保号", message)
    print(f'所有{serviceName}账号登录完成！')

if __name__ == '__main__':
    main()
