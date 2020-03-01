// components/progress-bar/progress-bar.js
let movableAreaWidth = 0;
let movableViewWidth = 0;
// 获取全局唯一音频管理器
const backgroundAudioManager = wx.getBackgroundAudioManager();
// 当前秒数
let currentSec = -1;
// 总时长,以秒为单位 
let duration = 0;
// 表示当前进度条是否在拖拽 解决: 当进度条拖动跟update事件冲突问题
let isMoving = false;
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isSame: Boolean
  },

  /**
   * 组件的初始数据
   */
  data: {
    showTime: {
      currentTime: '00:00',
      totalTime: '00:00'
    },
    movableDis: 0,
    progress: 0
  },

  /**
   * 组件的方法列表
   */
  lifetimes: {
    // 生命周期,组件在页面上布局完成以后
    ready() {
      if (this.properties.isSame && this.data.showTime.totalTime == '00:00') {
        this._setTime()
      }
      this._getMovableDis()
      // 生命周期,组件在页面上布局完成一号
      this._bindBGMEvent()
    },
  },
  methods: {
    // 目前效果较差,待优化
    onChange(event) {
      // 拖动
      if (event.detail.source == 'touch') {
        // backgroundAudioManager.stop()
        this.data.progress = event.detail.x / (movableAreaWidth - movableViewWidth) * 100;
        this.data.movableDis = event.detail.x;
        isMoving = true;
      }
    },
    onTouchEnd() {
      let currentTimeFmt = this._dateFormat(Math.floor(backgroundAudioManager.currentTime));
      this.setData({
        progress: this.data.progress,
        movableDis: this.data.movableDis,
        ['showTime.currentTime']: `${currentTimeFmt.min}:${currentTimeFmt.sec}`
      })
      backgroundAudioManager.seek(duration * this.data.progress / 100);
      isMoving = false
    },
    _getMovableDis() {
      const qurey = this.createSelectorQuery();
      qurey.select('.movable-area').boundingClientRect()
      qurey.select('.movable-view').boundingClientRect()
      qurey.exec(rect => {
        console.log(rect);
        movableAreaWidth = rect[0].width;
        movableViewWidth = rect[1].width;
      })
    },
    _bindBGMEvent() {
      // 播放事件
      backgroundAudioManager.onPlay(() => {
        console.log('onPlay');
        isMoving = false
        this.triggerEvent('musicPlay')
      })
      // 停止播放事件
      backgroundAudioManager.onStop(() => {
        console.log('onStop')
      })
      // 暂停事件
      backgroundAudioManager.onPause(() => {
        console.log('Pause')
        this.triggerEvent('musicPause')
      })
      // 音频正在加载中
      backgroundAudioManager.onWaiting(() => {
        console.log('onWaiting')
      })
      // 音频加载完毕可以播放回调
      backgroundAudioManager.onCanplay(() => {
        console.log('onCanplay')
        // 获取音乐播放总时长
        if (typeof backgroundAudioManager.duration != 'undefined') {
          this._setTime()
        } else {
          setTimeout(() => {
            this._setTime()
          }, 1000)
        }
      })
      // 监听音乐播放进度
      backgroundAudioManager.onTimeUpdate(() => {
        // 获取当前已播放时长
        const currentTime = backgroundAudioManager.currentTime
        // 获取总时长
        const duration = backgroundAudioManager.duration;
        // 获取当前播放秒数,需要1s只设置一次
        const sec = currentTime.toString().split('.')[0];
        if (sec != currentSec && !isMoving) {
          // 拿到 分 和 秒
          const currentTimeFmt = this._dateFormat(currentTime);
          // 设置小圆点距离,进度条,左侧播放时间
          this.setData({
            movableDis: (movableAreaWidth - movableViewWidth) * currentTime / duration,
            progress: currentTime / duration * 100,
            ['showTime.currentTime']: `${currentTimeFmt.min}:${currentTimeFmt.sec}`
          })
          currentSec = sec;
          // 联动歌词
          this.triggerEvent('timeUpdate', currentTime)
        }
      })
      // 
      backgroundAudioManager.onEnded(() => {
        console.log("onEnded")
        this.triggerEvent('musicEnd')
      })

      backgroundAudioManager.onError((res) => {
        wx.showLoading({
          title: '错误:' + res.errCode
        })
      })
    },
    _setTime() {
      duration = backgroundAudioManager.duration;
      const durationFmt = this._dateFormat(duration)
      this.setData({
        ['showTime.totalTime']: `${durationFmt.min}:${durationFmt.sec}`
      })
    },
    // 格式化时间
    _dateFormat(sec) {
      const min = Math.floor(sec / 60);
      sec = Math.floor(sec % 60);
      return {
        'min': this._parse0(min),
        'sec': this._parse0(sec)
      }
    },
    // 补零
    _parse0(sec) {
      return sec < 10 ? '0' + sec : sec
    }
  }
})
