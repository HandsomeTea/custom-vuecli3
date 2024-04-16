# 环境
- nodejs v20.11.1
- npm 10.2.4
- vue3

# docker-compose
- 启动项目：在项目根目录执行`sudo docker-compose -f docker-compose.yaml up -d`。
- 查看容器启动状态：`sudo docker ps -a --filter name=custom-vuecli3`。
- 停止容器：`sudo docker stop custom-vuecli3`。
- 重启容器：`sudo docker restart custom-vuecli3`。
- 删除容器：`sudo docker rm custom-vuecli3`。
- 查看容器日志：`sudo docker logs -f custom-vuecli3`。
- 进入容器：`sudo docker exec -it custom-vuecli3 /bin/bash`，进入容器可执行项目的build，lint等指令。
  - 退出:`exit`。
- 开发环境webpack-dev-server接口代理
  - 接口域名可直接用`http://ip:port`，不用映射，如：接口地址在本机`http://localhost:8080`，本机ip为`1.2.3.4`，则webpack的接口代理地址应设为`http://1.2.3.4:8080`。

# docker
