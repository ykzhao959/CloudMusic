//封装的请求方法
import request from '../../utils/request'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    bannerList: [], //轮播图数据
    recommendList: [], //推荐列表数据
    topList: [], //排行榜数据
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    //请求轮播图数据
    let bannerListData = await request('/banner', {
      type: 2
    });
    this.setData({
      bannerList: bannerListData.banners
    });

    //请求推荐列表数据
    let recommendListData = await request('/personalized', {
      limit: 15
    });
    if (recommendListData.code === 200) {
      this.setData({
        recommendList: recommendListData.result
      });
    }

    //请求排行榜数据
    /* 
      需求分析：
        1.需要根据idx的值获取对应的数据
        2.idx的取值范围是0~20，我们需要0~4
        3.需要发送5次请求
    */
    // let index = 0;
    // let resulArr = [];
    // while (index < 5) {
    //   /* 循环5次，发送5次请求，每一次请求id不同 */
    //   let topListData = await request('/top/list', {idx: index++}); /* 这里拿到的是一个大对象 */
    //   let topListItem = {
    //     name: topListData.playlist.name,
    //     tracks: topListData.playlist.tracks.slice(0, 3)
    //   } /* 把对象截取为自己的对象，拿到排行榜名称跟3条排行榜歌曲数据 */
    //   resulArr.push(topListItem); /* 把每一次请求获取到的歌曲数据存放到resulArr中 */
    //   //更新topList的状态值
    //   /* 
    //     1.坏处：放在循环体外，需要等循环体发送完全部的请求才可以执行，会导致长数据白屏，用户体验差
    //     2.好处：放在循环体内，根据每一次的请求返回的数据完成更新渲染
    //   */
    //   this.setData({
    //     topList: resulArr
    //   })
    // }

    //排行榜数据id
    let topListidData = await request('/toplist');
    this.setData({
      topListId: topListidData.list.slice(0, 5),
    });

    let index = 0;
    let resultArr = [];
    while (index < 5) {
      let topListData = await request('/playlist/detail', {
        id: topListidData.list[index++].id,
      });
      let topListItem = {
        name: topListData.playlist.name,
        tarcks: topListData.playlist.tracks.slice(0, 4),
      };
      resultArr.push(topListItem);

      this.setData({
        topList: resultArr,
      });
    }

  },

  //跳转至 RecommendSong 页面的回调
  toRecommendSong() {
    wx.navigateTo({
      url: '/pages/recommendedSong/recommendedSong',
    });
  },

  //跳转至 other页面
  toOther() {
    wx.navigateTo({
      url: '/pages/other/other',
    });
  },
  //跳转播放页面
  toSongDetail(event) {
    wx.navigateTo({
      url: '/pages/songDetail/songDetail?song=' + event.currentTarget.id
    })
  },
  //跳转到歌单歌曲列表页面
  toPlayList(event) {
    wx.navigateTo({
      url: '/pages/playlist/playlist?id=' + event.currentTarget.id
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