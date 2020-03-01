// pages/playlist/playlist.js
const MAX_LIMIT = 15;

Page({
  /**
   * 页面的初始数据
   */
  data: {
    swiperImgUrl: [
      {
        url: 'http://p1.music.126.net/oeH9rlBAj3UNkhOmfog8Hw==/109951164169407335.jpg',
      },
      {
        url: 'http://p1.music.126.net/xhWAaHI-SIYP8ZMzL9NOqg==/109951164167032995.jpg',
      },
      {
        url: 'http://p1.music.126.net/Yo-FjrJTQ9clkDkuUCTtUg==/109951164169441928.jpg',
      }
    ],
    playlist: [
    ]
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this._getPlaylist()
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
    this.setData({
      playlist: []
    })
    this._getPlaylist()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this._getPlaylist()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  _getPlaylist() {
    // 显示提示框提示用户,避免请求时间过长造成'假死现象'
    wx.showLoading({
      title: '数据请求中... '
    })
    // 调用云函数获取歌曲列表
    wx.cloud.callFunction({
      name: 'music',
      data: {
        $url: 'playlist',
        // 从第几条开始
        start: this.data.playlist.length,
        // 一次获取几条
        count: MAX_LIMIT
      }
    }).then(res => {
      console.log(res);
      this.setData({
        playlist: this.data.playlist.concat(res.result.data)
      })
      // 数据请求完毕停止下拉刷新操作
      wx.stopPullDownRefresh()
      // 数据请求完毕停止显示提示框
      wx.hideLoading()
    })
  }
})