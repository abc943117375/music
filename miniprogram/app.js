//app.js
App({
  onLaunch: function () {
    this.checkUpdate();
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        // env: 'my-env-id',
        traceUser: true,
      })
      this.getOpenid()
    }

    this.globalData = {
      playingMusicId: -1,
      openid: -1
    }
  },
  setPlayingMusicId(music) {
    this.globalData.playingMusicId = music;
  },
  getPlayingMusicId() {
    return this.globalData.playingMusicId
  },
  getOpenid() {
    console.log(1212);
    wx.cloud.callFunction({
      name: 'login',
    }).then(res => {
      console.log(323323);
      const openid = res.result.openid;
      this.globalData.openid = openid;
      if (wx.getStorageSync(openid) == '') {
        wx.setStorageSync(openid, [])
      }
    })
  },
  checkUpdate() {
    const updeteManager = wx.getUpdateManager()
    // 检测版本更新 
    updeteManager.onCheckForUpdate(res => {
      if (res.hasUpdate) {
        updeteManager.onUpdateReady(() => {
          wx.showModal({
            title: '更新提示',
            content: '新版本已经准备好,是否要重启应用',
            success: res => {
              if (res.confirm) {
                updeteManager.applyUpdate()
              }
            }
          })
        })
      }
    })
  }
})
