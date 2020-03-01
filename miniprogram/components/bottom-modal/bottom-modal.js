// components/bottom-modal/bottom-modal.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    modalShow: Boolean
  },
  options: {
    styleIsolation: "apply-shared",
    multipleSlots: true,// 在组件定义时的选项中启用多slot支持
  },
  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 点击关闭弹出层
    onClose() {
      this.setData({
        modalShow: false
      })
    }
  }
})
