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


def format_pm2_list(output):
    # 将输出按行拆分
    lines = output.splitlines()

    # 查找标题行和数据行
    header = lines[1]  # 标题行在第2行（第一行是pm2 list的命令输出说明）

    # 处理每一行输出，跳过前两行（表头和命令说明）
    formatted_msg = ""
    for line in lines[3:]:
        # 分割每一行的列数据
        columns = [column.strip() for column in line.split("│")]

        # 去除空字符串
        columns = [col for col in columns if col]

        # 确保每行至少有12列
        if len(columns) >= 12:
            id = columns[0].strip()
            name = columns[1].strip()
            status = columns[8].strip()
            pid = columns[5].strip()
            uptime = columns[6].strip()
            memory = columns[10].strip()
            cpu = columns[9].strip()
            user = columns[11].strip()

            # 合并属性并简化输出
            formatted_msg += f"{id}: {name} ({status})\n"
            formatted_msg += f"PID: {pid} ({uptime})\n"
            formatted_msg += f"Memory: {memory}\n"
            formatted_msg += f"CPU: {cpu}\n"
            formatted_msg += "------\n"

    return formatted_msg

def ssh_connect(host, port, username, password, command):
    try:
        # 创建SSH客户端
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(hostname=host, port=port, username=username, password=password)
        print(f"成功连接到 {host}:{port}")
        ispm2 = command and 'pm2 list' in command[-1]
        # 确保传递的是字符串类型
        if isinstance(command, list):
            command = "\n".join(command)

        stdin, stdout, stderr = client.exec_command(command)
        output = stdout.read().decode()
        error = stderr.read().decode()
        msg = f"连接{host}服务器成功"
        if output:
            if ispm2:
                msg += f"\n\n命令输出：\n{format_pm2_list(output)}"
            else:
                msg += f"\n\n命令输出：\n{output}"
        if error:
            msg += f"\n命令错误：{error}"

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
            'command_to_execute', f'/home/{username}/.npm-global/bin/pm2 list')  # 需执行的命令，默认都为ls -la
        command_to_execute = command_to_execute.split("\n")
        # 遍历所有的服务器配置
        msg = ssh_connect(server_host, server_port,
                          username, password, command_to_execute)
        msgs += msg + "\n"
    send("Serv00保号信息", msgs)
