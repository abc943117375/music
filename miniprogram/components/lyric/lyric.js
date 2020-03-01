// components/lyric/lyric.js
let lyricHeight = 0;
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isLyricShow: {
      type: Boolean,
      value: false
    },
    lyric: String,
  },
  // 属性监听器
  observers: {
    lyric(lrc) {
      // 如果当前歌词字符串等于  暂无歌词(这是player中设置的默认值)
      if (lrc == '暂无歌词') {
        this.setData({
          lrcList: [
            {
              lrc,
              time: 0
            }
          ],
          nowLyricIndex: -1
        })
      } else {
        console.log(lrc);
        this._parseLyric(lrc)
      }
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    lrcList: [],
    nowLyricIndex: 0, //当前选中歌词的索引
    scrollTop: 0,//歌词滚动条滚动的高度
  },

  lifetimes: {
    ready() {
      // 750rpx  获取当前设备信息
      wx.getSystemInfo({
        success(res) {
          // 求出1rpx 的大小
          lyricHeight = res.screenWidth / 750 * 64;
          console.log(lyricHeight);
        },
      })
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    update(currentTime) {
      let lrcList = this.data.lrcList;
      if (lrcList.length == 0) { //如果没有歌词
        return
      }
      for (let i = 0; i < lrcList.length; i++) {
        // 判断当前时间是否大于歌词中最后一句的时间
        if (currentTime > lrcList[lrcList.length - 1].time) {
          if (this.data.nowLyricIndex != -1) {
            this.setData({
              nowLyricIndex: -1,
              scrollTop: lrcList.length * lyricHeight
            })
          }
        }
        if (currentTime <= lrcList[i].time) {
          this.setData({
            nowLyricIndex: i - 1,
            scrollTop: (i - 1) * lyricHeight
          })
          console.log(this.data.scrollTop);
          break
        }
      }
    },
    // 解析歌词
    _parseLyric(sLyric) {
      let line = sLyric.split('\n');
      let _lrcList = [];
      line.forEach(elem => {
        // 使用match方法通过正则获取歌词的时间
        let time = elem.match(/\[(\d{2,}):(\d{2})(?:\.(\d{2,3}))?]/g);
        if (time !== null) {
          // 根据已经拿到的歌词时间分割当前元素,取下标为1的元素,也就是歌词
          let lrc = elem.split(time)[1];
          let timeReg = time[0].match(/(\d{2,}):(\d{2})(?:\.(\d{2,3}))?/);
          // 把时间单位转化为秒    分钟转秒                   秒转整形                毫秒转秒
          let time2Seconds = parseInt(timeReg[1]) * 60 + parseInt(timeReg[2]);
          // 每次循环都往数组中添加追加一个数据
          _lrcList.push({
            time: time2Seconds,
            lrc,
          })
        }
      })
      // 将解析出来的歌词数组更新到data中
      this.setData({
        lrcList: _lrcList
      })
    }
  }
})
