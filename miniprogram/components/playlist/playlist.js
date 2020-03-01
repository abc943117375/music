
// components/playlist/playlist.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    playlist: { type: Object }
  },
  // 数据监听器
  observers: {
    // 使用数组取值的方式监听playlist.playCount
    ['playlist.playCount'](count) {
      // 此处切记不可以直接给监听的属性直接赋值,会导致死循环
      this.setData({
        _count: this._tranNumber(count, 2)
      })
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    _count: 0
  },
  /**
   * 组件的方法列表
   */
  methods: {
    // 跳转到
    goToMusiclist() {
      wx.navigateTo({
        url: `../../pages/musiclist/musiclist?playlistId=${this.properties.playlist.id}`,
      })
    },
    // 转换播放数量 
    _tranNumber(num, point) {
      let numStr = num.toString().split('.')[0];
      if (numStr.length < 6) {
        // 十万以下直接return
        return numStr
      } else if (numStr.length >= 6 && numStr.length <= 8) {
        // 
        let decimal = numStr.substring(numStr.length - 4, numStr.length - 4 + point);
        return parseFloat(parseInt(num / 10000) + '.' + decimal) + '万';
      } else if (numStr.length > 8) {
        let decimal = numStr.substring(numStr.length - 8, numStr.length - 8 + point)
        return parseFloat(parseInt(num / 100000000) + '.' + decimal) + '亿'
      }
    }
  }
})
