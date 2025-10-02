---
title: 总结目前国内加速拉取 docker 镜像的几种方法
description: 国内加速拉取Docker镜像方法总结
publishDate: 2024-06-13 23:14
tags:
- Docker
- 工具
- 技巧
---

## 目前仍可用的镜像(随时可能失效)

```sh
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{
    "registry-mirrors": [
        "https://docker.m.daocloud.io",
        "https://huecker.io",
        "https://dockerhub.timeweb.cloud",
        "https://noohub.ru"
    ]
}
EOF
sudo systemctl daemon-reload
sudo systemctl restart docker
```

## 使用 Nginx

需要有一台国外服务器, 按下面添加 Nginx 配置即可:

```
server {
            listen 443 ssl;
            server_name 域名;

            ssl_certificate 证书地址;
            ssl_certificate_key 密钥地址;

            proxy_ssl_server_name on; # 启用SNI

            ssl_session_timeout 24h;
            ssl_ciphers 'ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
            ssl_protocols TLSv1 TLSv1.1 TLSv1.2 TLSv1.3;

            location / {
                    proxy_pass https://registry-1.docker.io;  # Docker Hub 的官方镜像仓库

                    proxy_set_header Host registry-1.docker.io;
                    proxy_set_header X-Real-IP $remote_addr;
                    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                    proxy_set_header X-Forwarded-Proto $scheme;

                    # 关闭缓存
                    proxy_buffering off;

                    # 转发认证相关的头部
                    proxy_set_header Authorization $http_authorization;
                    proxy_pass_header  Authorization;

                    # 对 upstream 状态码检查，实现 error_page 错误重定向
                    proxy_intercept_errors on;
                    # error_page 指令默认只检查了第一次后端返回的状态码，开启后可以跟随多次重定向。
                    recursive_error_pages on;
                    # 根据状态码执行对应操作，以下为301、302、307状态码都会触发
                    #error_page 301 302 307 = @handle_redirect;

                    error_page 429 = @handle_too_many_requests;
            }
            #处理重定向
            location @handle_redirect {
                    resolver 1.1.1.1;
                    set $saved_redirect_location '$upstream_http_location';
                    proxy_pass $saved_redirect_location;
            }
            # 处理429错误
            location @handle_too_many_requests {
                    proxy_set_header Host 替换为在CloudFlare Worker设置的域名;  # 替换为另一个服务器的地址
                    proxy_pass http://替换为在CloudFlare Worker设置的域名;
                    proxy_set_header Host $http_host;
            }
    }


```

## 使用代理

主要是设置让服务器的 docker 走代理

首先新建目录和文件

```sh
mkdir -p /etc/systemd/system/docker.service.d
vim /etc/systemd/system/docker.service.d/http-proxy.conf
```

然后在文件中粘贴以下内容, 注意代理地址需要换成你自己服务器的内网 ip 和代理端口

```sh
[Service]
Environment="HTTP_PROXY=http://192.168.8.125:10819"
Environment="HTTPS_PROXY=http://192.168.8.125:10819"
Environment="NO_PROXY=your-registry.com,10.10.10.10,*.example.com"
```

重启 docker

```sh
systemctl daemon-reload
systemctl restart docker
```

检查环境变量是否生效

```sh
systemctl show --property=Environment docker
```

## 使用 Cloudflare 反向代理

登录到[Cloudflare](https://dash.cloudflare.com/)控制台, 新建 worker, 在 worker.js 文件中输入以下代码, 注意需要自行修改代码中的域名

```js
'use strict'

const hub_host = 'registry-1.docker.io'
const auth_url = 'https://auth.docker.io'
const workers_url = 'https://你的域名'
const workers_host = '你的域名'
const home_page_url = 'https://qninq.cn/file/html/dockerproxy.html'

/** @type {RequestInit} */
const PREFLIGHT_INIT = {
    status: 204,
    headers: new Headers({
        'access-control-allow-origin': '*',
        'access-control-allow-methods': 'GET,POST,PUT,PATCH,TRACE,DELETE,HEAD,OPTIONS',
        'access-control-max-age': '1728000',
    }),
}

/**
 * @param {any} body
 * @param {number} status
 * @param {Object<string, string>} headers
 */
function makeRes(body, status = 200, headers = {}) {
    headers['access-control-allow-origin'] = '*'
    return new Response(body, {status, headers})
}


/**
 * @param {string} urlStr
 */
function newUrl(urlStr) {
    try {
        return new URL(urlStr)
    } catch (err) {
        return null
    }
}


addEventListener('fetch', e => {
    const ret = fetchHandler(e)
        .catch(err => makeRes('cfworker error:\n' + err.stack, 502))
    e.respondWith(ret)
})


/**
 * @param {FetchEvent} e
 */
async function fetchHandler(e) {
    const getReqHeader = (key) => e.request.headers.get(key);

    let url = new URL(e.request.url);

    if (url.pathname === '/') {
        // Fetch and return the home page HTML content with replacement
        let response = await fetch(home_page_url);
        let text = await response.text();
        text = text.replace(/{workers_host}/g, workers_host);
        return new Response(text, {
            status: response.status,
            headers: response.headers
        });
    }

    if (url.pathname === '/token') {
        let token_parameter = {
            headers: {
                'Host': 'auth.docker.io',
                'User-Agent': getReqHeader("User-Agent"),
                'Accept': getReqHeader("Accept"),
                'Accept-Language': getReqHeader("Accept-Language"),
                'Accept-Encoding': getReqHeader("Accept-Encoding"),
                'Connection': 'keep-alive',
                'Cache-Control': 'max-age=0'
            }
        };
        let token_url = auth_url + url.pathname + url.search
        return fetch(new Request(token_url, e.request), token_parameter)
    }

    url.hostname = hub_host;

    let parameter = {
        headers: {
            'Host': hub_host,
            'User-Agent': getReqHeader("User-Agent"),
            'Accept': getReqHeader("Accept"),
            'Accept-Language': getReqHeader("Accept-Language"),
            'Accept-Encoding': getReqHeader("Accept-Encoding"),
            'Connection': 'keep-alive',
            'Cache-Control': 'max-age=0'
        },
        cacheTtl: 3600
    };

    if (e.request.headers.has("Authorization")) {
        parameter.headers.Authorization = getReqHeader("Authorization");
    }

    let original_response = await fetch(new Request(url, e.request), parameter)
    let original_response_clone = original_response.clone();
    let original_text = original_response_clone.body;
    let response_headers = original_response.headers;
    let new_response_headers = new Headers(response_headers);
    let status = original_response.status;

    if (new_response_headers.get("Www-Authenticate")) {
        let auth = new_response_headers.get("Www-Authenticate");
        let re = new RegExp(auth_url, 'g');
        new_response_headers.set("Www-Authenticate", response_headers.get("Www-Authenticate").replace(re, workers_url));
    }

    if (new_response_headers.get("Location")) {
        return httpHandler(e.request, new_response_headers.get("Location"))
    }

    let response = new Response(original_text, {
        status,
        headers: new_response_headers
    })
    return response;

}


/**
 * @param {Request} req
 * @param {string} pathname
 */
function httpHandler(req, pathname) {
    const reqHdrRaw = req.headers

    // preflight
    if (req.method === 'OPTIONS' &&
        reqHdrRaw.has('access-control-request-headers')
    ) {
        return new Response(null, PREFLIGHT_INIT)
    }

    let rawLen = ''

    const reqHdrNew = new Headers(reqHdrRaw)

    const refer = reqHdrNew.get('referer')

    let urlStr = pathname

    const urlObj = newUrl(urlStr)

    /** @type {RequestInit} */
    const reqInit = {
        method: req.method,
        headers: reqHdrNew,
        redirect: 'follow',
        body: req.body
    }
    return proxy(urlObj, reqInit, rawLen, 0)
}


/**
 *
 * @param {URL} urlObj
 * @param {RequestInit} reqInit
 */
async function proxy(urlObj, reqInit, rawLen) {
    const res = await fetch(urlObj.href, reqInit)
    const resHdrOld = res.headers
    const resHdrNew = new Headers(resHdrOld)

    // verify
    if (rawLen) {
        const newLen = resHdrOld.get('content-length') || ''
        const badLen = (rawLen !== newLen)

        if (badLen) {
            return makeRes(res.body, 400, {
                '--error': `bad len: ${newLen}, except: ${rawLen}`,
                'access-control-expose-headers': '--error',
            })
        }
    }
    const status = res.status
    resHdrNew.set('access-control-expose-headers', '*')
    resHdrNew.set('access-control-allow-origin', '*')
    resHdrNew.set('Cache-Control', 'max-age=1500')

    resHdrNew.delete('content-security-policy')
    resHdrNew.delete('content-security-policy-report-only')
    resHdrNew.delete('clear-site-data')

    return new Response(res.body, {
        status,
        headers: resHdrNew
    })
}
```

部署完成后，点击设置->触发器->添加自定义域，绑定自己的域名即可

![undefined](https://p0.meituan.net/csc/a3719b4893c57a0bde64412a04baf3c73415492.png)

## 使用 Github Action + 阿里云私有仓库

使用 Github Action 将国外的 Docker 镜像转存到阿里云私有仓库，供国内服务器使用

项目地址：[tech-shrimp/docker_image_pusher: 使用 Github Action 将国外的 Docker 镜像转存到阿里云私有仓库，供国内服务器使用，免费易用](https://github.com/tech-shrimp/docker_image_pusher)

项目的文档写的很详细，不再赘述

## 参考

[自建 Docker Hub 加速镜像 (lty520.faith)](https://blog.lty520.faith/%E5%8D%9A%E6%96%87/%E8%87%AA%E5%BB%BAdocker-hub%E5%8A%A0%E9%80%9F%E9%95%9C%E5%83%8F/)

[tech-shrimp/docker_image_pusher: 使用 Github Action 将国外的 Docker 镜像转存到阿里云私有仓库，供国内服务器使用，免费易用](https://github.com/tech-shrimp/docker_image_pusher)

[都在蹭 CF 搭建 dockerhub 镜像代理，基于论坛看到的一个代码糊了个前端 - 软件分享 - LINUX DO](https://linux.do/t/topic/107726)