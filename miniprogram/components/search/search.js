// components/search/search.js
let keyword = '';

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    placeholder: {
      type: String,
      value: '请输入'
    }
  },
  // 接收外部class样式
  externalClasses: [
    'iconfont',
    'icon-sousuo'
  ],
  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    onSearch() {
      console.log(keyword);
      // 向外抛出方法
      this.triggerEvent('search', {
        keyword
      })
    },
    // 监听输入框输入
    onInput(event) {
      keyword = event.detail.value;
    },
  }
})
