# 环境
- nodejs v20.11.1
- npm 10.2.4
- vue3

# 功能
- 登录。
- 接口鉴权，接口调用封装。
- 角色/用户管理。
- 根据router配置生成菜单。
- 前端路由鉴权。
- SSE实现消息推送。
- 终端显示日志。
- 远程连接终端并执行指令(前端实现终端功能)。
- 前端代码预览展示。
- 普通数据列表/可折叠数据列表。
- 数据可视化(echarts)，关系图(相关算法演示)。
- ai相关，ai聊天(流式传输markdown到前端显示)，ai图片生成。
- 前端三级菜单展示和界面切换。
- websocket使用json-rpc2.0数据传输，使用async/await发送/接受消息。
- 其它：
  - 右键菜单组件。
  - 多语言支持(vue-i18n)，vue-store等。
  - 常用ui组件库集成，tailwind集成。
  - 常用工具函数封装。
  - 生产/开发/测试环境配置设计。
  - webpack配置，eslint配置。
  - docker及docker-compose配置。

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
