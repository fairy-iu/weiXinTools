var events = new Map()
/**
 * 消息订阅
 * key：消息标识
 * target：消息发起者，用来区分相同key不同的消息
 * callback：回调函数
 */
function sub(key, target, callback) {
  //消息对象
  var eobj = {'target':target,'callback':callback}
  //先通过key拿到对应的消息队列
  var value = events.get(key)
  //当前key已存在消息队列说明是不同页面相同的key的消息订阅
  if (Array.isArray(value)){
    //过滤出消息发起者不同的消息，相当于覆盖key和target都一样的消息
    value = value.filter(function(e){
      return e.target != target
    })
    //过滤出的队列重新插入此次订阅的消息
    value.push(eobj)
    events.set(key,value)
  }else {//不是队列表示字典中没有包含当前key的消息，直接插入
    events.set(key,[eobj])
  }
  console.log('function sub ', events)
}
/**
 * 消息发布
 * key：消息标识
 * data：回调数据
 */
function pub(key, data) {
  //通过key拿到消息队列
  var value = events.get(key)
  //如果队列存在则遍历队列，然后调用消息发起者的回调函数，并将data数据进行回调
  if (Array.isArray(value)){
    value.map(function(e){
      var target = e.target
      var callback = e.callback
      callback.call(target, data)
    })
  }
}
/**
 * 取消订阅
 * key：消息标识
 * target：消息发起者，用来区分相同key不同的消息
 */
function cancel(key,target) {
  var haskey = events.has(key)
  //是否存在此消息队列
  if(haskey){
    var value = events.get(key)
    if (Array.isArray(value)) {
      //如果队列中只有一条数据直接删除
      if(value.length == 1){
        events.delete(key)
      }else{
        //如果队列中存在多条数据则过滤出和当前取消订阅target不同的消息然后重新设置到key的消息队列中
        value = value.filter(function (e) {
          return e.target != target
        })
        events.set(key, value)
      }
    }
  }
  console.log('function cancel ',events)
}

module.exports = {
  sub: sub,
  pub: pub,
  cancel: cancel
}