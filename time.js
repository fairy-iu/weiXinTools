// 时间戳转时间（验证）

function dateFormat(time) {
  var t = new Date(time)
  let year = t.getFullYear()
  let month = t.getMonth() + 1
  let day = t.getDate()
  let hours = t.getHours()
  let minutes = t.getMinutes()
  let seconds = t.getSeconds()
  // 补0
  month = month < 10 ? "0" + month : month
  day = day < 10 ? "0" + day : day
  hours = hours < 10 ? "0" + hours : hours
  minutes = minutes < 10 ? "0" + minutes : minutes
  seconds = seconds < 10 ? "0" + seconds : seconds
  return (
    year +
    "-" +
    month +
    "-" +
    day +
    "  " +
    hours +
    ":" +
    minutes +
    ":" +
    seconds
  )
}

// 1、现在的时间
console.log(new Date().getTime())

// 2、今天开始时间的时间戳
console.log(new Date(new Date().toLocaleDateString()).getTime())

// 3、今天结束时间的时间戳
console.log(
  new Date(new Date().toLocaleDateString()).getTime() + 24 * 60 * 60 * 1000 - 1
)

// 4、本周开始时间的时间戳
console.log(
  new Date(new Date().toLocaleDateString()).getTime() -
    (new Date().getDay() - 1) * 24 * 60 * 60 * 1000
)

// 5、本月开始时间的时间戳
console.log(
  new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime()
)

// 6、本月结束时间的时间戳
console.log(
  new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getTime() +
    24 * 60 * 60 * 1000 -
    1
)

// 7、本年开始时间的时间戳
console.log(new Date(new Date().getFullYear(), 0).getTime())

// 8、本年结束时间的时间戳
console.log(
  new Date(new Date().getFullYear(), 11, 31).getTime() + 24 * 60 * 60 * 1000 - 1
)
