/**
  作者: Created by youkaizhao 
  说明: 登录流程
  1. 收集表单项数据
  2. 前端验证
    1) 验证用户信息(账号，密码)是否合法
    2) 前端验证不通过就提示用户，不需要发请求给后端
    3) 前端验证通过了，发请求(携带账号, 密码)给服务器端
  3. 后端验证
    1) 验证用户是否存在
    2) 用户不存在直接返回，告诉前端用户不存在
    3) 用户存在需要验证密码是否正确
    4) 密码不正确返回给前端提示密码不正确
    5) 密码正确返回给前端数据，提示用户登录成功(会携带用户的相关信息)
*/
import request from '../../utils/request'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    phone: '', //手机号
    password: '' //登录密码
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  //表单项内容发生改变的回调
  /* 
    事件委托，如何找到触发事件的对象
    1.（event.target)指向的可能是绑定的子元素，也可能不是绑定的子元素
    2. (event.currenTarget)要求绑定事件的元素一定是触发事件的元素
  */
  handleInput(event){
    //拿到表单数据
    /* event.currentTarget.id指向各表单所绑定的id */
    let type = event.currentTarget.id; //方法1：id传值 取值：phone || password
    //console.log(type,event.detail.value); //输出表单数据
    //let type = event.currentTarget.dataset.type; //方法2：data-type传值 type是key
    this.setData({
      /* 根据找到匹配的id修改相对应的值 */
      [type]: event.detail.value
    })
  },

  //登录的回调
  async login(){
    //1.收集表单项数据
    let {phone,password} = this.data;

    //2.前端验证
    /* 手机号验证 */
    if(!phone){
      //提示用户
      wx.showToast({
        title: '手机号不能为空',
        icon: 'none'
      })
      return; /* 如果输入错误，不执行后续代码 */
    }
    //手机号正则表达式
		let phoneReg = /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/;
    if(!phoneReg.test(phone)){
      wx.showToast({
        title: '手机号格式错误',
        icon: 'none'
      })
      return;
    }

    /* 密码验证 */
    if(!password){
      wx.showToast({
        title: '密码不能为空',
        icon: 'none'
      })
      return;
    }
    //密码至少包含 数字和英文，长度6-16
    let passwordReg = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,16}$/;
    if(!passwordReg.test(password)){
      wx.showToast({
        title: '密码格式错误',
        icon: 'none'
      })
      return;
    }

    //3.后端验证
    /* 登录验证请求 */
    let result = await request('/login/cellphone', {phone: phone,password: password,isLogin:true}); //传入一个isLogin判断登录成功为true传给请求request页面
    if(result.code === 200){
      wx.showToast({
        title: '登录成功',
      })
      //跳转之前将用户的信息存储至本地wx.setStorageSync
      //存储缓存的对象建议存储为JSON对象
      /* userInfo是key，result.profile是JS对象，是请求里其中存储个人信息的数组，这里需要转换为json对象 */
      wx.setStorageSync('userInfo', JSON.stringify(result.profile))

      //登录成功跳转至个人中心
      /* 因为数据是存储在缓存中，单纯跳转页面无法让跳转页面刷新获取缓存数据，用wx.reLaunch强制其他页面关闭，刷新跳转页面 */
      wx.reLaunch({
        url: '/pages/personal/personal',
      })
    }else if(result.code === 400){
      wx.showToast({
        title: '手机号错误',
        icon: 'none'
      })
    }else if(result.code === 502){
      wx.showToast({
        title: '密码错误',
        icon: 'none'
      })
    }else{
      wx.showToast({
        title: '登录失败，请仔细检查信息，再重新登录',
        icon: 'none'
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})