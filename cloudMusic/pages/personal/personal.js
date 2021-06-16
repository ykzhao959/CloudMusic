import request from '../../utils/request'

/* 定义手指点击屏幕到顶部的距离 滑动到屏幕顶部的距离 总滑动的距离 */
let startY = 0; //手指起始的坐标
let moveY = 0; //手指移动的坐标
let moveDistance = 0; //手指移动的距离
Page({

  /**
   * 页面的初始数据
   */
  data: {
    coverTransForm: "translateY(0)",
    coverTransItion: '',
    userInfo: {}, //缓存中的用户信息
    recentPlayList: [] //用户历史播放记录
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let userInfo = wx.getStorageSync('userInfo'); //获取本地缓存数据wx.getStorageSync
    if(userInfo){
      //更新用户头像的状态
      this.setData({
        //使用缓存中的对象时，把json对象转换为JS对象
        userInfo: JSON.parse(userInfo)
      })

      //获取用户播放记录，用户id在userInfo对象里
      this.getUserRecentPlayList(this.data.userInfo.userId)
    }
  },

  /* 用户信息滑动功能实现 */
  //手指点击
  bindTouchStart(event){
    startY = event.touches[0].clientY;  //touches[0]捕捉第一个手指为标准
    this.setData({
      coverTransItion: ''
    })
  },
  //手指滑动
  bindTouchMove(event){
    moveY = event.touches[0].clientY;
    moveDistance = moveY - startY; //移动的距离
    //限制移动区域
    if(moveDistance <= 0){
      return;
    }
    if(moveDistance >= 80){
      moveDistance =80;
    }
    //动态更新coverTransForm的状态值
    this.setData({
      coverTransForm: `translateY(${moveDistance}rpx)`, /* Es6模板字符串,变量的地方用${} */
    })
  },
  //手指松开
  bindTouchEnd(){
    //将moveDistance恢复为原点
    this.setData({
      coverTransForm: `translateY(0rpx)`, /* Es6模板字符串,变量的地方用${} */
      coverTransItion: 'transform 1s linear'
    })
  },
  //跳转至登录页面的回调
  toLogin(){
    wx.navigateTo({
      url: '/pages/login/login',
    })
  },
  //获取用户历史播放记录的功能函数
  async getUserRecentPlayList(userId){
    let recentPlayListData = await request('/user/record',{uid: userId,type: 0}); /* type: 0 最近所有播放记录 type: 1 一周内的播放记录 */
    let index =0;
    let recentPlayList = recentPlayListData.allData.splice(0,20).map(item =>{ /* map对获取的歌曲对象进行加工 */
      //在获取的对象中，加工（添加）一个id属性，让每一次的id的index索引加1,防止歌曲重复
      item.id = index++;
      return item;
    })
    this.setData({
      recentPlayList: recentPlayList
    })
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