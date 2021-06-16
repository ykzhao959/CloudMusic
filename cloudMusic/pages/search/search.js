import request from '../../utils/request'

//函数节流判断
let isSend = false;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    placeholderContainer: '', //默认placeholder的内容
    hotList: [], //热搜榜数据
    searchContent: '', //用户输入的表单项数据
    searchList: [], //关键字 模糊查询的数据
    historyList: [] //搜索历史记录数据
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //获取初始化的数据
    this.getInitData();
    //获取本地历史记录
    this.getSearchHistory();
  },

  //请求初始化的数据
  async getInitData(){
    let placeholderData = await request('/search/default')
    let hotData = await request('/search/hot/detail')
    this.setData({
      placeholderContainer:placeholderData.data.showKeyword,
      hotList:hotData.data
    })
  },

  //读取本地的历史记录的功能函数
  getSearchHistory(){
    let historyList = wx.getStorageSync('searchHistory')
    if(historyList){
      this.setData({
        historyList:historyList
      })
    }
  },
 
  //表单项内容发生改变的回调
  handleInput(event){
    //更新searchContent的状态数据
    this.setData({
      searchContent: event.detail.value.trim()  /* trim清除空格 */
    })
    /* 函数节流 */
    if(isSend){
      return
    }
    isSend = true;
    //发请求获取关键字模糊查询数据
    this.getSearchList();
    //函数节流 定时器
    setTimeout(() =>{
      isSend = false;
    },300)
  },

  //获取搜索数据的功能函数
  async getSearchList(){
    if(!this.data.searchContent){
      this.setData({
        searchList:[]
      })
      return;
    }
    let {searchContent,historyList} = this.data
    let searchListData = await request('/search',{keywords: searchContent,limit: 10})
    this.setData({
      searchList: searchListData.result.songs,
  });

    //如果重新搜索的记录和以前的历史记录相同则无需重新添加,并把相同的记录排名靠前
    if(historyList.indexOf(searchContent) !== -1){
      historyList.splice(historyList.indexOf(searchContent), 1)  /* 先删掉相同的记录，再插入，实现排名靠前 */
    }
    //将搜索的关键字添加到搜索历史记录中 unshift()将最新插入的数据放在首位
    historyList.unshift(searchContent);
    this.setData({
      historyList:historyList
    })

    //将历史记录存入本地
    wx.setStorageSync('searchHistory', historyList)
  },

  //点击x清空搜索框的搜索内容
  clearSearchContent(){
    this.setData({
      searchContent: '',
      searchList:[]
    })
  },

  //点击删除图标所有搜索历史记录
  deleteSearchHistory(){
    //拟态框
    wx.showModal({
      content: '确定是否删除历史记录',
       success:(res) =>{
        //console.log(res);
        if(res.confirm){
          //清空data中的historyList
          this.setData({
            historyList: []
          })
          //移除本地的历史记录缓存
          wx.removeStorageSync('searchHistory')
        }
       }
    })
  },

  //跳转视频页面
  toVideo(){
    wx.reLaunch({
      url:'/pages/video/video'
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