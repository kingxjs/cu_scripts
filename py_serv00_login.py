# -- coding: utf-8 --
"""
const $ = new Env("serv00 保号");
serv00 保号
[Script]
cron "0 0 10 ? * MON/14" script-path=serv00_login.py,tag=serv00 保号
"""
import os
import paramiko
import json
from notify import send


def ssh_connect(host, port, username, password, command):
    try:
        # 创建SSH客户端
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(hostname=host, port=port, username=username, password=password)
        print(f"成功连接到 {host}:{port}")

        # 确保传递的是字符串类型
        if isinstance(command, list):
            command = "\n".join(command)

        stdin, stdout, stderr = client.exec_command(command)
        output = stdout.read().decode()
        error = stderr.read().decode()

        if output:
            msg = f"连接{host}服务器成功，命令输出：{output}"

        if error:
            msg = f"连接{host}服务器成功，命令错误：{error}"

        print(msg)
        return msg

    except Exception as e:
        msg = f"连接{host}服务器失败：{e}"
        print(msg)
        return msg
    finally:
        client.close()
        print(f"{host}连接已关闭")



if __name__ == "__main__":
    accounts = os.environ["serv00_AUTH"]
    if accounts:
        accounts = json.loads(accounts)

    msgs = "Serv00保号\n"
    for account in accounts:
        username = account['username']  # SSH用户名
        password = account['password']  # SSH密码
        server_host = account['server_host']  # 服务器IP或域名
        server_port = account.get('server_port',22)  # SSH端口号,默认都为22
        command_to_execute = account.get(
            'command_to_execute', 'ls -la')  # 需执行的命令，默认都为ls -la
        command_to_execute = command_to_execute.split("\n")
        # 遍历所有的服务器配置
        msg = ssh_connect(server_host, server_port,
                          username, password, command_to_execute)
        msgs += msg + "\n"
    send("Serv00保号信息", msgs)
