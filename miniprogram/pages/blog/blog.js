// pages/blog/blog.js
// 搜搜的关键字
let keyword = '';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    modalShow: false,//控制底部弹出层是否显示
    blogList: [],
  },

  // 点击搜索
  onSearch(event) {
    this.setData({
      blogList: []
    })
    keyword = event.detail.keyword;
    this._loadBlogList()
  },
  // 跳转页面
  goComment(event) {
    wx.navigateTo({
      url: `../blog-comment/blog-comment?blogId=${event.target.dataset.blogid}`,
    })
  },
  // 发布
  onPublish() {
    // 判断用户是否授权
    wx.getSetting({  //返回用户授权信息 
      success: (res) => {
        // 如果用户已授权
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: (res) => {
              // console.log(res);
              this.onLoginsuccess({ detail: res.userInfo })
            }
          })
        } else {
          // 如果用户没有授权
          this.setData({
            modalShow: true
          })
        }
      }
    })
  },
  // 授权成功
  onLoginsuccess(event) {
    const detail = event.detail;
    wx.navigateTo({
      url: `../blod-edit/blod-edit?nickName=${detail.nickName}&avatarUrl=${detail.avatarUrl}`,
    })

  },
  // 授权失败
  onLoginfail(event) {
    wx.showModal({
      title: '只有授权的用户才能发布',
      content: ''
    })
  },
  // 加载列表
  _loadBlogList(start = 0) {
    wx.showLoading({
      title: '拼命加载中'
    })
    wx.cloud.callFunction({
      name: "blog",
      data: {
        keyword,
        start,
        count: 10,
        $url: 'list',
      }
    })
      .then(res => {
        this.setData({
          blogList: this.data.blogList.concat(res.result)
        })
        wx.hideLoading()
        wx.stopPullDownRefresh()
      })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this._loadBlogList()
    // 微信小程序端调用云数据库
    /*  const db = wx.cloud.database()
     db.collection('blog').orderBy('createTime', 'desc').get().then((res)=>{
       console.log(res)
       const data = res.data
       for (let i = 0, len = data.length; i<len; i++){
         data[i].createTime = data[i].createTime.toString()
       }
       this.setData({
         blogList: data
       })
     }) */
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
      blogList: []
    })
    this._loadBlogList()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this._loadBlogList(this.data.blogList.length)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (event) {
    console.log(event);
    let blogObj = event.target.dataset.blog;
    return {
      title: blogObj.content,
      path: `/pages/blog-comment/blog-comment?blogId=${blogObj._id}`,
      // imgUrl:''
    }
  }
})