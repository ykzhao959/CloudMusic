import request from '../../utils/request';

import PubSub from 'pubsub-js'; /* 页面通信 */
Page({

  /**
   * 页面的初始数据
   */
  data: {
    day: "",
    month: "",
    recommendList: [], // 推荐列表数据
    index: 0, //表示点击音乐的下标
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //判断用户是否登录
    let userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
        wx.showToast({
            title: '请先登录授权',
            icon: 'none',
            duration: 2000,
            success: () => {
                //跳转至登录界面
                wx.reLaunch({
                    url: '/pages/login/login',
                });
            },
        });
    }

    //当前日期
    let day = new Date().getDate();
    let month = new Date().getMonth() + 1;
    if(day < 10){
      day = "0" + day
    }
    if(month < 10){
      month = "0" + month
    }
    //更新日期的状态数据
    this.setData({
      day: day,
      month:month
    })

    // 获取每日推荐的数据
    this.getRecommendList();

    //订阅来自songDetail页面发布的消息 PubSub.subscribe('事件名',接收发布方数据)订阅方
    PubSub.subscribe('switchType',(msg,type) =>{
      let {recommendList,index} = this.data;
      if(type === 'pre'){ //上一首
        //当前用户点击最顶部切换到尾部歌曲功能
        (index === 0) && (index = recommendList.length)

        index -= 1; //当前下标减1，即上一首的下标
      }else{ //下一首
        //当前用户点击尾部切换到最顶部歌曲功能
        (index === recommendList.length -1) && (index = -1)
        
        index += 1; //当前下标加1，即下一首的下标
      }

      //获取完新的歌曲下标，需更新下标
      this.setData({
        index:index
      })

      //获取当前歌曲id
      let musicId = recommendList[index].id;
      //将musicId回传给songDetail页面
      PubSub.publish('musicId',musicId);
    });
  },

  //获取每日推荐的状态数据
  async getRecommendList(){
    let recommendListData = await request('/recommend/songs');
    this.setData({
      recommendList: recommendListData.recommend
    });
  },  

  //点击音乐跳转播放界面
  toSongDetail(event){
    let {song,index} = event.currentTarget.dataset;
    this.setData({
      index:index
  })

    //路由跳转传参：query参数
    wx.navigateTo({
      /* JS对象会被转换为object的toString字符串，需要转为json对象才可以使用 */
      /* 不能直接将song对象作为参数传递，长度过长，会被自动截取 */
      //url: '/pages/songDetail/songDetail?song=' + JSON.stringify(song)
      url: '/pages/songDetail/songDetail?musicId=' + song.id
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