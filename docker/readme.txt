启动项目
sudo docker-compose -f ./docker/compose.yaml up -d

查看容器启动状态
sudo docker ps -a --filter name=custom-vuecli3

停止容器
sudo docker stop custom-vuecli3

重启容器
sudo docker restart custom-vuecli3

删除容器
sudo docker rm custom-vuecli3

查看容器日志
sudo docker logs -f custom-vuecli3

进入容器(进入容器可执行项目的build，lint等指令)
sudo docker exec -it custom-vuecli3 /bin/bash
    退出
    exit
