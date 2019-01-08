var VERSION = 'my-test-cache-v1';

// 确保 Service Worker 不会在 waitUntil() 里面的代码执行完毕之前安装完成。
self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(VERSION).then(function (cache) {
            console.log('install',event)
            return cache.addAll([
                './',
                './index.html',
                './main.css',
                './main.js',
                './boy.jpg',
                // '/swTest1/test.json',
            ]);
        })
    );
});

self.addEventListener('activate', function (event) {
    // console.log('-----------activate事件执行-----------')
    event.waitUntil(
        Promise.all([
            // 更新客户端
            self.clients.claim(),
            // 清理旧版本
            caches.keys().then(function (cacheList) {
                return Promise.all(
                    cacheList.map(function (cacheName) {
                        // 如果当前版本和缓存版本不一致
                        if (cacheName !== VERSION) {
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
        ])
    );
});

self.addEventListener('fetch', function (event) {
    // console.log('addEventListener--Fetch',event)
    event.respondWith(
        caches.match(event.request).then(function (response) {
            // 代理可以搞一些代理的事情
            // console.log('------------------------------------')
            // console.log('Proxy-response',event,response)
            // console.log('------------------------------------')
            
            // 如果 Service Worker 有自己的返回，就直接返回，减少一次 http 请求
            if (response) {
                return response;
            }

            // 如果 service worker 没有返回，那就得直接请求真实远程服务
            var request = event.request.clone(); // 把原始请求拷过来
            return fetch(request).then(function (httpRes) {

                // http请求的返回已被抓到，可以处置了。

                // 请求失败了，直接返回失败的结果
                if (!httpRes || httpRes.status !== 200) {
                    return httpRes;
                }

                // 请求成功的话，将请求缓存起来。
                // var responseClone = httpRes.clone();
                // console.log('Proxy-responseClone',responseClone)
                // caches.open(VERSION).then(function (cache) {
                //     cache.put(event.request, responseClone);
                // });
                return httpRes
            });
        })
    );
});
