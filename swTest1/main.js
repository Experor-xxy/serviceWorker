console.log('main.js执行')
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('/swTest1/sw.js', { scope: '/swTest1/' })
            .then(function (registration) {
                console.log('注册成功');
                var serviceWorker;
                if (registration.installing) {
                    serviceWorker = registration.installing;
                    console.log('当前注册状态---installing');
                } else if (registration.waiting) {
                    serviceWorker = registration.waiting;
                    console.log('当前注册状态---waiting');
                } else if (registration.active) {
                    serviceWorker = registration.active;
                    console.log('当前注册状态---active');
                }
                if (serviceWorker) {
                    console.log('当前service worker状态：',serviceWorker.state);
                    serviceWorker.addEventListener('statechange', function (e) {
                        console.log('Service Worker状态变化为---' + e.target.state);
                        // if(e.target.state=='installing'){
                            // self.clients.claim()
                        // }
                    });
                }
                // 注册成功
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            })
            .catch(function (err) {

                // 注册失败:(
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}else{
    alert('不支持SW')
}

fetch('./test.json')
.then(res=>res.json())
.then(data=>{
    document.getElementById('app').innerHTML = JSON.stringify(data)
    console.log('FetchRequest--->',data)
})
