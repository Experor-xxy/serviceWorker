// 可以这么注册 Service Worker
if ('serviceWorker' in navigator) {
    // 为了保证首屏渲染性能，可以在页面 load 完之后注册 Service Worker
    window.onload = function () {
        navigator.serviceWorker.register('/swTest2/sw.js');
    };
}