import os
import paramiko
import json
from notify import send


def ssh_connect(host, port, username, password, command):
    """
    自动通过SSH连接服务器并执行命令。

    :param host: 服务器IP地址或域名
    :param port: SSH端口号
    :param username: SSH用户名
    :param password: SSH密码
    :param command: 要执行的命令
    :return: 命令执行的输出
    """
    try:
        # 创建SSH客户端
        client = paramiko.SSHClient()
        # 自动添加未知主机到known_hosts
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        # 连接服务器
        client.connect(hostname=host, port=port,
                       username=username, password=password)
        print(f"成功连接到 {host}:{port}")

        # 执行命令
        stdin, stdout, stderr = client.exec_command(command)
        output = stdout.read().decode()
        error = stderr.read().decode()

        if output:
            msg = "连接{}服务器成功，命令输出：{}".format(host, output)

        if error:
            msg = "连接{}服务器成功，命令错误：{}".format(host, error)

        print(msg)
        return msg

    except Exception as e:
        msg = "连接{}服务器失败：{}".format(host, e)
        print(msg)
        return msg
    finally:
        # 确保关闭连接
        client.close()
        print("{}连接已关闭".format(host))


if __name__ == "__main__":
    accounts = os.environ["serv00_AUTH"]
    if accounts:
        accounts = json.loads(accounts)

    msgs = "Serv00保号\n"
    for account in accounts:
        username = account['username']  # SSH用户名
        password = account['password']  # SSH密码
        server_host = account['server_host']  # 服务器IP或域名
        server_port = account['server_port']  # SSH端口号,默认都为22
        command_to_execute = account.get(
            'command_to_execute', 'ls -la')  # 需执行的命令，默认都为ls -la
        command_to_execute = command_to_execute.split("\n")
        # 遍历所有的服务器配置
        msg = ssh_connect(server_host, server_port,
                          username, password, command_to_execute)
        msgs += msg + "\n"
    send("Serv00保号信息", msgs)
