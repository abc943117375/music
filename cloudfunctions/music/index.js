// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database();
// 引入tcb路径对云云函数进行路由优化
const TcbRouter = require('tcb-router')
const rp = require('request-promise');
const BASE_URL = 'http://musicapi.xiecheng.live';

// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({ event });

  // 创建playlist路由
  app.router('playlist', async (ctx, next) => {
    // 直接将结果返回
    ctx.body = await db.collection('playlist')
      .skip(event.start)
      .limit(event.count)
      // orderBy:排序 两个参数,第一个:字段,列名  第二个:排序方式,默认是正序 desc表示倒序
      .orderBy('createTime', 'desc')
      .get()
      .then(res => {
        return res
      })
  })
  app.router('musiclist', async (ctx, next) => {
    ctx.body = await rp(BASE_URL + '/playlist/detail?id=' + parseInt(event.playlistId))
      .then((res) => JSON.parse(res))
  })

  app.router('musicUrl', async (ctx, next) => {
    ctx.body = await rp(BASE_URL + '/song/url?id=' + event.musicId)
      .then(res => res)
  })

  app.router('lyric', async (ctx, nex) => {
    ctx.body = await rp(BASE_URL + `/lyric?id=${event.musicId}`)
      .then(res => {
        return res
      })
  })

  return app.serve()
}