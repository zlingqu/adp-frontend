#FROM docker.dm-ai.cn/public/node:10-frontend-0.01
FROM docker.dm-ai.cn/public/node:15.12.0-slim-adp-frontend
WORKDIR /app
ADD . .
RUN pwd && ls -lh
RUN npm config set registry https://npm.dm-ai.cn/repository/npm/ && npm install && npm run build

FROM docker.dm-ai.cn/public/nginx:1.17
ENV TZ=Asia/Shanghai
COPY --from=0 /app/dist /usr/share/nginx/html
COPY --from=0 /app/nginx.conf /etc/nginx/conf.d/default.conf
