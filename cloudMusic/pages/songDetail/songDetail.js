import request from '../../utils/request'
import PubSub from 'pubsub-js'; /* 页面通信 */
import moment from 'moment'; /* 时间管理 */

//获取全局的实例 app.js
const appInstance = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isPlay: false, //判断歌曲是否播放
    song: {}, //歌曲详情对象
    musicId: '', //音乐id 全局，方便调用
    musicLink: '', //音乐的链接
    currentTime: '00:00', //实时歌曲播放时间
    durationTime: '00:00', //歌曲总时长
    currentWidth: 0, //实时进度条的宽度
    lyric: [],//歌词
    lyricTime: 0,//歌词对应的时间
    currentLyric: "",//当前歌词对象
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    /* options:用于接收路由跳转的query参数
    console.log(options); */
    /* 原生小程序中路由传参，对参数的长度有限制，如果参数长度过长，会自动截取
    console.log(typeof options.song); //string类型
    console.log(options.song);
    console.log(JSON.parse(options.song)); */

    let musicId = options.musicId;
    this.setData({
      //把获取到的音乐id更新到data中
      musicId: musicId
    })

    //判断音乐是否自动播放 只有音乐播放了才修改音乐是否播放的状态
    if(appInstance.globalData.isMusicPlay){
      this.changePlayState(true);
    }

    //获取歌曲详情的数据
    this.getMusicInfo(musicId);
    //获取歌词详情的数据
    this.getLyric(musicId);

    //自动播放当前音乐
    this.musicControl(true, musicId)

    /* 
      问题: 如果用户操作系统的控制音乐播放/暂停的按钮，页面不知道，导致页面是否显示播放的状态和真实的音乐播放状态不一致
      解决：
        1.通过控制音频的实例backgroundAudioManager监听音乐播放/暂停
    */

    //重新进入播放页面 判断是否同一条音乐还在继续播放
    if (appInstance.globalData.isMusicPlay && appInstance.globalData.musicId === musicId) {
      //修改当前页面的音乐播放状态为true
      this.setData({
        isPlay:true
      })
    }

    //创建控制音乐播放的实例
    this.backgroundAudioManager = wx.getBackgroundAudioManager(); /* wx.getBackgroundAudioManager背景音频,切换后台也可播放音频 */
    //监听系统的音乐播放/暂停 监听有音乐isPlay通过changePlayState方法改为true
    this.backgroundAudioManager.onPlay(() => {
      //修改音乐是否播放的状态
      this.changePlayState(true);
      //标识当前播放的哪一首音乐的id 使用于播放状态显示
      appInstance.globalData.musicId = musicId;
    });
    this.backgroundAudioManager.onPause(() => {
      //修改音乐是否暂停的状态
      this.changePlayState(false);
    });
    this.backgroundAudioManager.onStop(() => {
      //修改音乐是否关闭的状态
      this.changePlayState(false);
    });
    //监听音乐实时播放的进度
    this.backgroundAudioManager.onTimeUpdate(() =>{
      //获取歌词对应时间
      let lyricTime = Math.ceil(this.backgroundAudioManager.currentTime); 
      //格式化实时的播放时间
      let currentTime = moment(this.backgroundAudioManager.currentTime * 1000).format('mm:ss')
      //实时进度条的进度
      let currentWidth = this.backgroundAudioManager.currentTime/this.backgroundAudioManager.duration * 420;
      //更新实时播放时间
      this.setData({
        currentTime:currentTime,
        currentWidth:currentWidth,
        lyricTime:lyricTime,
      })
      this.getCurrentLyric();
    });
    //监听音乐播放自然结束
    this.backgroundAudioManager.onEnded(()=>{
      PubSub.subscribe('musicId', (msg,musicId) =>{
        //修改音乐是否播放的状态
        this.changePlayState(true);
        //获取音乐的详情信息
        this.getMusicInfo(musicId);
        //自动播放当前音乐
        this.musicControl(true,musicId)
        //取消订阅
        PubSub.unsubscribe('musicId');
      })
      //自动切换至下一首音乐 并且自动播放
      PubSub.publish('switchType', 'next');
      //还原进度条的长度为0,实时播放的时间也还原成0
      this.setData({
        currentTime: '00:00',
        currentWidth: 0,
        lyric: [],
        lyricTime: 0,
      })
    })
    //点击实时进度条实现音乐跳转播放
  },

  // 封装修改音乐播放状态的功能函数
  changePlayState(isPlay) {
    //修改音乐播放状态
    this.setData({
      isPlay: isPlay
    })
    //修改全局音乐播放的状态 标识哪一个音乐播放/暂停
    appInstance.globalData.isMusicPlay = isPlay;
  },

  //点击播放/暂停的回调
  handleMusicPlay() {
    let isplay = !this.data.isPlay;
    //修改是否播放的状态
    /*  this.setData({
       isPlay: isplay
     }) */

    let {
      musicId,musicLink
    } = this.data;
    //调用音乐播放/暂停回调
    this.musicControl(isplay, musicId, musicLink); //传入是否播放的参数
  },

  //请求音乐详情的功能函数
  async getMusicInfo(musicId) {
    let songData = await request('/song/detail', {
      ids: musicId
    })
    //获取音乐时长 使用moment().format()格式化时间 songData.songs[0].dt单位是ms
    let durationTime = moment(songData.songs[0].dt).format('mm:ss')

    this.setData({
      song: songData.songs[0],
      durationTime:durationTime
    })
    //获取到歌曲详情后，动态更改标签
    wx.setNavigationBarTitle({
      title: this.data.song.name,
    })
  },

  //点击播放/暂停的功能函数回调
  async musicControl(isplay, musicId,musicLink) {
    //创建控制音乐播放的实例 提升作用域
    //let backgroundAudioManager = wx.getBackgroundAudioManager(); /* wx.getBackgroundAudioManager背景音频,切换后台也可播放音频 */
    if (isplay) { //音乐播放
      if(!musicLink){ //判断音乐播放后是否是同一首音乐，如果是点击暂停与播放无需重新发送请求
        //获取音乐播放链接 需传入id
        let musicLinkData = await request('/song/url', {
          id: musicId
        })
        musicLink = musicLinkData.data[0].url; //音乐链接

        if(musicLink === null){
          wx.showToast({
            title: '请开通会员后听取',
            icon: 'none'
          })
          return;
        }

        //更新音乐链接
        this.setData({
          musicLink:musicLink
        })
      }
      

      //实现播放，需传入歌曲链接与歌曲名称
      this.backgroundAudioManager.src = musicLink;
      this.backgroundAudioManager.title = this.data.song.name;
    } else { //音乐暂停
      this.backgroundAudioManager.pause();
    }
  },

  //点击切歌的回调
  handleSwitch(event){
    //获取切歌的类型
    let type = event.currentTarget.id;

    //发布消息（切换歌曲时）应停止动画，关闭当前播放的音乐
    this.backgroundAudioManager.stop();

    //订阅来自recommendedSong页面发布的音乐musicId消息 每次执行都会多次订阅，需取消订阅
    PubSub.subscribe('musicId', (msg,musicId) =>{
      //修改音乐是否播放的状态
      this.changePlayState(true);
      //获取音乐的详情信息
      this.getMusicInfo(musicId);
      //自动播放当前音乐
      this.musicControl(true,musicId)
      //取消订阅
      PubSub.unsubscribe('musicId');
    })
    //发布消息数据给recommendedSong页面 PubSub.publish('事件名',发布数据)发布方
    PubSub.publish('switchType',type)
  },

  //获取歌词
  async getLyric(musicId){
    let lyricData = await request("/lyric", {id: musicId});
    let lyric = this.formatLyric(lyricData.lrc.lyric);
  },

  //传入初始歌词文本text
  formatLyric(text) {
    let result = [];
    let arr = text.split("\n"); //原歌词文本已经换好行了方便很多，我们直接通过换行符“\n”进行切割
    let row = arr.length; //获取歌词行数
    for (let i = 0; i < row; i++) {
      let temp_row = arr[i]; //现在每一行格式大概就是这样"[00:04.302][02:10.00]hello world";
      let temp_arr = temp_row.split("]");//我们可以通过“]”对时间和文本进行分离
      let text = temp_arr.pop(); //把歌词文本从数组中剔除出来，获取到歌词文本了！
      //再对剩下的歌词时间进行处理
      temp_arr.forEach(element => {
        let obj = {};
        let time_arr = element.substr(1, element.length - 1).split(":");//先把多余的“[”去掉，再分离出分、秒
        let s = parseInt(time_arr[0]) * 60 + Math.ceil(time_arr[1]); //把时间转换成与currentTime相同的类型，方便待会实现滚动效果
        obj.time = s;
        //排除空字符串（没有歌词）
			  if(text.length == 1 || text.length == 0) return true; //如果返回的长度为1就代表空字符串
        obj.text = text;
        result.push(obj); //每一行歌词对象存到组件的lyric歌词属性里
      });
    }
    result.sort(this.sortRule) //由于不同时间的相同歌词我们给排到一起了，所以这里要以时间顺序重新排列一下
    this.setData({
      lyric: result
    })
  },
  sortRule(a, b) { //设置一下排序规则
    return a.time - b.time;
  },

  //控制歌词播放
  getCurrentLyric(){
    let j;
    for(j=0; j<this.data.lyric.length-1; j++){
      if(this.data.lyricTime == this.data.lyric[j].time){
        this.setData({
          currentLyric : this.data.lyric[j].text
        })
      }
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