// 发送ajax请求
/*
* 1. 封装功能函数
*   1. 功能点明确
*   2. 函数内部应该保留固定代码(静态的)
*   3. 将动态的数据抽取成形参，由使用者根据自身的情况动态的传入实参
*   4. 一个良好的功能函数应该设置形参的默认值(ES6的形参默认值)
* 2. 封装功能组件
*   1. 功能点明确
*   2. 组件内部保留静态的代码
*   3. 将动态的数据抽取成props参数，由使用者根据自身的情况以标签属性的形式动态传入props数据
*   4. 一个良好的组件应该设置组件的必要性及数据类型
*     props: {
*       msg: {
*         required: true,
*         default: 默认值，
*         type: String
*       }
*     }
*
* */

/**
 * 
  export default  (url, data={}, method='GET') => {
  return new Promise((resolve, reject) => {
    // 1. new Promise初始化promise实例的状态为pending
    wx.request({
      url,
      data,
      method,
      success: (res) => {
        // console.log('请求成功: ', res);
        resolve(res.data); // resolve修改promise的状态为成功状态resolved
      },
      fail: (err) => {
        // console.log('请求失败: ', err);
        reject(err); // reject修改promise的状态为失败状态 rejected
      }
    })
  })
}

//其他页面调用
import request from '../../utils/request'

onLoad: async function (options) {
    let result = await request('http://localhost:3000/banner',{type: 2});
    console.log('结果数据: ',result)
},
 * 
 */

/* 
import config from './config'
export default  (url, data={}, method='GET') => {
  return new Promise((resolve, reject) => {
    // 1. new Promise初始化promise实例的状态为pending
    wx.request({
      url: config.host + url,
      data,
      method,
      header: {
        cookie: wx.getStorageSync('cookies')?wx.getStorageSync('cookies').find(item => item.indexOf('MUSIC_U') !== -1):''
      },
      success: (res) => {
        // console.log('请求成功: ', res);
        if(data.isLogin){// 登录请求
          // 将用户的cookie存入至本地
          wx.setStorage({
            key: 'cookies',
            data: res.cookies
          })
        }
        resolve(res.data); // resolve修改promise的状态为成功状态resolved
      },
      fail: (err) => {
        // console.log('请求失败: ', err);
        reject(err); // reject修改promise的状态为失败状态 rejected
      }
    })
  })
  
} */

import config from './config'
export default  (url, data={}, method='GET') => {
  return new Promise((resolve, reject) => {
    // 1. new Promise初始化promise实例的状态为pending
    wx.request({
      url: config.host + url,
      //url: config.mobileHost + url, /* 外网访问时开启 */
      //url: config.host_Api + url,
      data,
      method,
      header:{ //需要请求头，携带cookie
        /* 这里判断是否登录，无cookie传空字符串 */
         cookie:wx.getStorageSync('cookies')?wx.getStorageSync('cookies').find(item => item.indexOf('MUSIC_U') !== -1): ''  //indexOf查询数组里包含MUSIC_U字符串的数组返回
      },
      success: (res) => {
        if(data.isLogin){ //登录请求
           //将用户的cookie存入缓存本地
           wx.setStorage({
             data: res.cookies,  //读取的时候是一个JS对象（数组）
             key: 'cookies'
           })
        }
        resolve(res.data); // resolve修改promise的状态为成功状态resolved
      },
      fail: (err) => {
        // console.log('请求失败: ', err);
        reject(err); // reject修改promise的状态为失败状态 rejected
      }
    })
  })
}

 // 请求轮播图数据
  /* getBanners(){
    let that = this;
    wx.request({
      url: 'http://localhost:3000/banner', //http://localhost:3000 服务器端口
      data:{type: 2}, //获取iphone机型
      success:(res) =>{
        //console.log(res);
        //console.log(res.data.banners[0].pic);
        that.setData({
          banners:res.data.banners
        })
      },
      fail:(err) =>{
        console.log(err);
      }
    })
  }, 

  onLoad: function (options) {
    //获取轮播图数据
    this.getBanners();
  },

  data: {
    carouselImgUrls: [
      "/../../static/images/nvsheng.jpg",
      "/../../static/images/nvsheng.jpg",
      "/../../static/images/nvsheng.jpg",
      "/../../static/images/nvsheng.jpg",
      "/../../static/images/nvsheng.jpg"
    ],
  },

 */