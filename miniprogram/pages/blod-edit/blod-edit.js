// 输入文字最大的个数
const MAX_WORDS_NUM = 240;
// 当前最大上传图片数量
const MAX_IMG_NUM = 9;
const db = wx.cloud.database();
// 输入的文字内容
let content = '';
let userInfo = {}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 输入的文字个数
    wordsNum: 0,
    footerBottom: 0,
    images: [],
    selectPhoto: true,//添加图片元素是否显示
  },

  send() {
    if (content.trim() === '') {
      wx.showModal({
        title: '请输入内容',
        content: ''
      })
      return
    }
    wx.showLoading({
      title: '发布中....',
      mask: true
    })
    // 数据 -> 云数据库
    // 数据库:内容,图片
    // 图片: -> 云存储
    let promiseArr = []
    let fileIds = [];
    // 图片上传
    for (let i = 0; i < this.data.images.length; i++) {
      let p = new Promise((resolve, reject) => {
        let item = this.data.images[i];
        // 文件扩展名
        let suffix = /\.\w+$/.exec(item)[0]
        wx.cloud.uploadFile({
          cloudPath: `blog/${Date.now()}-${Math.random() * 10000000}${suffix}`,
          filePath: item,
          success: (res) => {
            console.log(res);
            fileIds = fileIds.concat(res.fileID)
            resolve()
          },
          fail: (err) => {
            console.error(err)
            reject()
          }
        })
      })
      promiseArr.push(p)
    }
    // 存入云数据库
    Promise.all(promiseArr).then(res => {
      // 小程序端上传数据,会自动携带openid
      db.collection('blog').add({
        data: {
          ...userInfo,
          content,
          img: fileIds,
          createTime: db.serverDate(),//服务端的时间
        }
      })
    })
      .then(res => {
        wx.showToast({
          title: '发布成功',
        })
        wx.hideLoading()
        // 返回blog页面  并且刷新
        wx.navigateBack({ delta: 1 })
        // 获取页面
        const pages = getCurrentPages()
        // 获取上一级页面
        const prevPage = pages[pages.length - 2];
        // 调用上一级页面的方法,清空blog列表并刷新
        prevPage.onPullDownRefresh();
      })
      .catch(err => {
        console.log(err);
        wx.hideLoading()
        wx.showToast({
          title: '发布失败'
        })
      })
  },
  // 预览图片
  onPreviewImage(event) {
    console.log(event.target.dataset.imgsrc);
    wx.previewImage({
      urls: this.data.images,
      current: '' + event.target.dataset.imgsrc
    })
  },
  // 删除图片
  onDelImage(event) {
    let index = event.target.dataset.index;
    this.data.images.splice(index, 1)
    this.setData({
      images: this.data.images
    })
    if (this.data.images.length <= MAX_IMG_NUM - 1) {
      this.setData({
        selectPhoto: true
      })
    }
  },
  // 选择图片
  onChooseImage() {
    let max = MAX_IMG_NUM - this.data.images.length;
    wx.chooseImage({
      count: max,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        console.log(res);
        this.setData({
          images: this.data.images.concat(res.tempFilePaths)
        })
        max = MAX_IMG_NUM - this.data.images.length;
        this.setData({
          selectPhoto: max <= 0 ? false : true
        })
      }
    })
  },
  // 失去焦点
  onBlur() {
    this.setData({
      footerBottom: 0,
    })
  },
  // 获得焦点
  onFocus(event) {
    // 模拟器获取的键盘高度为0
    console.log(event);
    this.setData({
      footerBottom: event.detail.height
    })
  },

  // 监听输入框输入事件
  onInput(event) {
    console.log(event.detail.value);
    let wordsNum = event.detail.value.length;
    if (wordsNum >= MAX_WORDS_NUM) {
      wordsNum = `最大字数为${MAX_WORDS_NUM}`
    }
    this.setData({
      wordsNum
    })
    content = event.detail.value
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    userInfo = options
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