// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()

const rp = require('request-promise');
// 获取推荐歌曲接口
const URL = 'http://musicapi.xiecheng.live/personalized';

const db = cloud.database();

const playlistCollection = db.collection('playlist')
const MAX_LIMIT = 10;
// 云函数入口函数
exports.main = async (event, context) => {
  // const list = await playlistCollection.get()
  // 突破小程序获取数据100条限制
  // 统计集合记录数,返回值是一个对象
  let countResult = await playlistCollection.count()
  // 拿到总数据,类型为number
  let total = countResult.total;
  // 总数除以100    向上取整
  const batchTimes = Math.ceil(total / MAX_LIMIT);
  const tasks = [];
  for (let i = 0; i < batchTimes; i++) {
    // 从数据库中取数据,从第 i*MAX_LIMIT 条数据开始去,取MAX_LIMIT 条,将结果保存到promise变量中
    let promise = await playlistCollection.skip(i * MAX_LIMIT).limit(MAX_LIMIT).get();
    tasks.push(promise)
  }

  let list = {
    data: []
  }
  // 如果tasks的长度大于0,说明需要重复获取多次才能取出数据库中的所有数据
  if (tasks.length > 0) {
    //    利用promise.all方法  等tasks中所有任务都执行完毕,用reduce方法进行汇总,第一个值为上一个值,第二个值为当前值
    list = (await Promise.all(tasks)).reduce((arr, cur) => {
      return {
        data: arr.data.concat(cur.data)
      }
    })
  }

  let playlist = await rp(URL).then(res => {
    return JSON.parse(res).result
  })

  // 数据去重
  let newData = [];
  // 循环数据库中的数据
  for (let i = 0; i < playlist.length; i++) {
    // 用于判断当前数据是否重复
    let flag = true;
    // 循环请求到的数据
    for (let j = 0; j < list.data.length; j++) {
      // 如果请求到的数据的id  和数据库中的数据的id 相同
      if (playlist[i].id == list.data[i].id) {
        // 说明数据库中已经有这个数据了,把flag改为false
        flag = false;
        // 并且直接跳出本次循环
        break;
      }
    }
    if (flag) {
      newData.push(playlist[i])
    }
  }


  for (let i = 0; i < newData.length; i++) {
    // 往云数据库的playlist中添加数据
    await playlistCollection.add({
      data: {
        // 使用es6 扩展运算符拿到item 里面的每一项
        ...newData[i],
        // 获取服务器上的时间
        createTime: db.serverDate(),
      }
    })
      .then(res => {
        console.log('插入成功')
      })
      .catch(err => {
        console.log(err)
      })
  }
  return newData.length
}