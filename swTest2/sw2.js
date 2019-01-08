// workbox 2.x 是将 workbox 核心内容放在 workbox-sw node_modules 包里维护的
// workbox 3.x 开始是将 workbox 核心 lib 放在 CDN 维护
// 当然也可以挪到自己的 CDN 维护
importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.0.0-alpha.3/workbox-sw.js');

if (workbox) {
    workbox.skipWaiting();
    workbox.clientsClaim();
    console.log(`Yay! workbox is loaded 🎉`);
    /* ------------------------------------------------------------------------------------------------------------
    precache (预缓存) 静态文件
        如果你有一些静态资源是需要永远的离线缓存，除非重新上线才更新缓存的话，
        precache 的工作是在 Service Worker install 时候通过 Cache API 完成的
    */
    workbox.precaching.precacheAndRoute([
        './index.html',
        './main.js',
        {
            url: './main.css',
            // 这里需要注意的是这个 revision 的值，当预缓存的文件就任何变动的时候就会被更新，
            // 如果 revision 没有更新，那当你更新 Service Worker 的时候，被缓存的文件也不会被更新。
            revision: 'g7d2a1'
        },
    ]);

    /* ------------------------------------------------------------------------------------------------------------
    路由请求缓存 
    */
    // 1⃣️“路由”只不过是两个函数：一个“匹配”函数，用于确定路由是否应该与请求匹配;
    // 一个“处理”函数，它应该处理请求并使用响应进行响应。
    const matchCb = ({url, event}) => {
       return (url.pathname === '/special/url');
    };
    const handlerCb = ({url, event, params}) => {
        return fetch(event.request)
            .then((response) => {
                return response.text();
            })
            .then((responseBody) => {
                return new Response(`${responseBody} <!-- Look Ma. Added Content. -->`);
            });
    };
    workbox.routing.registerRoute(matchCb, handlerCb);

    // 2⃣️workbox 策略
    workbox.routing.registerRoute(
        /.*\.css/,
        // 1.用缓存的响应（如果可用），回落至网络请求，网络请求用于更新缓存。
        workbox.strategies.staleWhileRevalidate({
            cacheName: 'css-cache', //更改策略使用的缓存
        })
        // workbox.strategies.cacheFirst() //2.缓存优先（缓存回落到网络）
        // workbox.strategies.networkFirst() //3.网络优先（网络回落到缓存）
        // workbox.strategies.networkOnly() // 4.仅限网络
        // workbox.strategies.cacheOnly() // 5.仅限缓存
    );

    /*------------------------------------------------------------------------------------------------------------
    workbox.expiration配置
    在缓存中应该允许项目存储在缓存中的时间长度或者应该在缓存中保留多少项目时，通常会对缓存施加限制。
    Workbox通过workbox-cache-expiration插件提供此功能 ，允许您限制缓存中的条目数和/或删除已经缓存了很长时间的条目。
    */
    // 使用插件
    workbox.routing.registerRoute(
        /images/,
        workbox.strategies.cacheFirst({
            cacheName: 'image-cache',
            plugins: [
            new workbox.expiration.Plugin({
                // Only cache requests for a week
                maxAgeSeconds: 7 * 24 * 60 * 60,
                // Only cache 10 requests.
                maxEntries: 10,
            }),
            ]
        })
    );

    self.addEventListener('push', (event) => {
        const title = 'Workbox 通知';
        const options = {
            body: event.data.text()
        };
        event.waitUntil(self.registration.showNotification(title, options));
    });
}
else {
    console.log(`Boo! workbox didn't load 😬`);
    alert(`Boo! workbox didn't load 😬`)
}