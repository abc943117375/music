// 云函数入口文件
const cloud = require('wx-server-sdk');

const tcbRouter = require('tcb-router');
cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  // 定义当前服务,使用类似于koa的路由工具
  const app = new tcbRouter({ event })

  // 创建中间件
  app.use(async (ctx, next) => {
    ctx.data = {};
    // 获取用户openid  在event.userInfo中是自带的
    ctx.data.openId = event.userInfo.openId
    await next()
  })

  app.router('music', async (ctx, next) => {
    // 获取当前歌曲名字
    ctx.data.musicNmae = '数鸭子';
    await next()
  }, async (ctx, next) => {
    // 获取当前歌曲类型
    ctx.data.musicType = '儿歌'
    ctx.body = {
      data: ctx.data
    }
  })

  app.router('music', async (ctx, next) => {
    // 获取当前歌曲名字
    ctx.data.movieNmae = '千与千寻';
    await next()
  }, async (ctx, next) => {
    // 获取当前歌曲类型
    ctx.data.movieType = '日本动画片'
    ctx.body = {
      data: ctx.data
    }
  })


  // 返回当前服务
  return app.serve()
}