const db = wx.cloud.database();
let userInfo = {}
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    blogId: String,
    blog: Object
  },
  externalClasses: [
    "icon-fenxiang",
    'icon-pinglun',
    'iconfont'
  ],
  /**
   * 组件的初始数据
   */
  data: {
    // 登录组件是否显示
    loginShow: false,
    // 当前底部弹出层是否显示
    modalShow: false,
    // 评论框输入的值
    content: ''
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onComment() {
      // 判断用户是否授权
      wx.getSetting({
        success: (res) => {
          console.log(res);
          // 如果有['scopte.userInfo']就说明用户已经授权
          if (res.authSetting['scope.userInfo']) {
            console.log(res);
            wx.getUserInfo({
              success: (res) => {
                userInfo = res.userInfo
                //显示评论弹出层
                this.setData({ modalShow: true })
              }
            })
          } else {
            this.setData({ loginShow: true })
          }
        }
      })
    },
    onLoginsuccess(event) {
      userInfo = event.detail
      // 授权成功时授权框消失,评论框显示
      this.setData({ loginShow: false }, () => {
        this.setData({ modalShow: true })
      })
    },
    onLoginfail() {
      wx.showModal({
        title: "授权用户才能进行评价",
        content: ''
      })
    },
    onSend(event) {
      // console.log(event);
      // let formId = event.detail.formId
      // 插入数据库
      let content = this.data.content
      if (content.trim() === '') {
        wx.showModal({
          title: "评论内容不能为空",
          content: ''
        })
        return
      }
      wx.showLoading({
        title: '评价中',
        mask: true
      })
      db.collection('blog-comment').add({
        data: {
          content,
          createTime: db.serverDate(),
          blogId: this.properties.blogId,
          nickName: userInfo.nickName,
          avatarUrl: userInfo.avatarUrl
        }
      }).then(res => {
        wx.hideLoading()
        wx.showToast({
          title: '评论成功'
        })
        this.setData({
          modalShow: false,
          content: ''
        })
        // 父元素刷新评论页面
        this.triggerEvent('refreshCommentList')
      })
    },
    onInput(event) {
      console.log(event);
      this.setData({
        content: event.detail.value
      })
    },
  }
})
