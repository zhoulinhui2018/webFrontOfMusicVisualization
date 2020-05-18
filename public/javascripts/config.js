var config = [];

// 后端地址
config.protocol = 'http'
config.port = 8080;
config.host = '127.0.0.1';
//config.host = '62.234.154.66';
config.baseUrl=config.protocol+'://'+config.host+':'+config.port;

// 音乐文件保存路径，相对于app.js (末尾加'/')
config.mediaPathInRoute = 'public/media/';
//config.mediaPathInRoute = '/root/UploadFiles/';

// 音乐文件保存路径，相对于静态路径 (末尾加'/')
config.mediaPath = '/media/';
//config.mediaPath = '/';

if (typeof(module) != "undefined") {
   module.exports = config;
}
exports = config;