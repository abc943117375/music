// pages/player/player.js
let musiclist = []
// 正在播放的歌曲的index
let nowPlayingIndex = 0;
// 获取全局唯一的背景音频管理器
const backgroundAudioManager = wx.getBackgroundAudioManager();
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    picUrl: '',
    isPlaying: false,//false不播放  true播放,
    isLyricShow: false,//表示当前歌词是否显示
    lyric: '',
    isSame: false,//表示当前点击歌曲和正在播放歌曲是否是同一首
  },
  // 获得歌曲详情以及全局唯一的背景音频管理器
  loadMusicDetail(musicId) {
    if (musicId == app.getPlayingMusicId()) {
      this.setData({ isSame: true })
    } else {
      this.setData({ isSame: false })
    }
    let music = musiclist[parseInt(nowPlayingIndex)];
    wx.setNavigationBarTitle({
      title: music.name,
    })
    this.data.isSame || backgroundAudioManager.stop();
    app.setPlayingMusicId(musicId)
    this.setData({
      picUrl: music.al.picUrl,
      isPlaying: false
    })
    wx.showLoading({
      title: '数据请求中...'
    })
    wx.cloud.callFunction({
      name: "music",
      data: {
        musicId,
        $url: 'musicUrl'
      }
    }).then(res => {
      let result = JSON.parse(res.result);
      if (result.data[0].url === null) {
        wx.showLoading({
          text: '无权限播放'
        })
        return
      }
      // 如果当前点击的和正在播放的歌曲不是同一首
      if (!this.data.isSame) {
        backgroundAudioManager.src = result.data[0].url;
        backgroundAudioManager.title = music.name;
        backgroundAudioManager.coverImgUrl = music.al.picUrl;
        backgroundAudioManager.singer = music.ar[0].name;
        backgroundAudioManager.singer = music.al.name;
      }
      this.setData({
        isPlaying: true
      })
      wx.hideLoading();

      // 加载歌词
      wx.cloud.callFunction({
        name: 'music',
        data: {
          musicId,
          $url: 'lyric',
        }
      })
        .then(res => {
          console.log(res);
          let lyric = '暂无歌词';
          const lrc = JSON.parse(res.result).lrc
          if (lrc) {
            lyric = lrc.lyric
          }
          this.setData({
            lyric,
          })
        })
    })
  },
  togglePlaying() {
    // 正在播放
    if (this.data.isPlaying) {
      backgroundAudioManager.pause()
    } else {
      backgroundAudioManager.play()
    }
    this.setData({
      isPlaying: !this.data.isPlaying
    })
  },
  // 上一首
  onPrev() {
    backgroundAudioManager.stop()
    nowPlayingIndex--;
    if (nowPlayingIndex < 0) {
      nowPlayingIndex = musiclist.length - 1;
    }
    this.loadMusicDetail(musiclist[nowPlayingIndex].id)
  },
  // 下一首
  onNext() {
    backgroundAudioManager.stop()
    nowPlayingIndex++;
    if (nowPlayingIndex == musiclist.length) {
      nowPlayingIndex = 0;
    }
    this.loadMusicDetail(musiclist[nowPlayingIndex].id)
  },
  // 二选一显示歌词与封面 
  _onChangeLyricShow() {
    this.setData({
      isLyricShow: !this.data.isLyricShow
    })
  },
  timeUpdate(event) {
    // 根据选择器获取子组件  传递事件  updeta(参数为当前正在播放时间)
    this.selectComponent('.lyric').update(event.detail)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    nowPlayingIndex = options.index;
    musiclist = wx.getStorageSync('musiclist');
    this.loadMusicDetail(options.musicId)
  },

  onPlay() {
    this.setData({
      isPlaying: true
    })
    console.log('播放')
  },
  onPause() {
    this.setData({
      isPlaying: false
    })
    console.log('暂停')
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