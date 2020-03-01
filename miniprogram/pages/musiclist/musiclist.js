// pages/musiclist/musiclist.js
// const BASE
Page({

  /**
   * 页面的初始数据
   */
  data: {
    musiclist: [],
    listInfo: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    // 调用云函数
    wx.showLoading({
      title: '数据请求中...'
    })
    wx.cloud.callFunction({
      // 云函数名
      name: "music",
      // 参数
      data: {
        // 歌单id
        playlistId: options.playlistId,
        // tcb-router 
        $url: 'musiclist'
      }
    }).then(res => {
      // 数据获取成功后更新data里面的数据
      const pl = res.result.playlist
      this.setData({
        musiclist: pl.tracks,
        'listInfo.coverImgUrl': pl.coverImgUrl,
        'listInfo.name': pl.name
      })
      this._setMusiclist()
      wx.hideLoading()
    })
  },
  _setMusiclist() {
    wx.setStorageSync('musiclist', this.data.musiclist)
  },
})