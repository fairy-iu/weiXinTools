// utils/draw.js

class Draw {
  /**
   * 多行文本溢出
   * @param {Object} context - canvas组件的绘图上下文
   * @param {String} text - 文本内容
   * @param {Number} maxWidth - 文本最大宽度
   * @param {Number} maxRow - 文本最多显示行数
   * @param {String} fontSize - 字体大小
   * @param {String} textAlign - 字体对齐
   * @param {String} color - 文本颜色
   * @param {Number} lineHeight - 文本行高
   * @param {Number} x - 文本的x坐标
   * @param {Number} y - 文本的y坐标
   * @param {String} textBaseline - 文本的基线
   * @param {Boolean} isEllipsis - 文本是否显示省略号
   * @param {Boolean} broken - 单词是否截断显示【true → 单词截断显示，适用于：纯中文、中英混排、纯英文（不考虑英文单词的完整性）】【false → 单词完整显示，考虑英文单词的完整性，仅适用于纯英文】
   */
  drawTextOverflow(context, canvasParam) {
    let {
      text,
      maxWidth,
      maxRow,
      fontWeight = "normal",
      fontSize,
      color,
      lineHeight,
      x,
      y,
      textBaseline,
      broken = true,
      isEllipsis = true,
      textAlign = "left",
    } = canvasParam
    let arr = []
    let temp = ""
    let row = []
    let separator = broken ? "" : " "
    text = text.replace(/[\r\n]/g, "") // 去除回车换行符
    arr = text.split(separator)
    if (textBaseline) context.setTextBaseline(textBaseline)
    context.font = `normal ${fontWeight} ${fontSize}px sans-serif`
    // context.font = font+"px";  // 注意：一定要先设置字号，否则会出现文本变形
    context.fillStyle = color

    if (context.measureText(text).width <= maxWidth) {
      row.push(text)
      if (textAlign == "center")
        x += parseInt((maxWidth - context.measureText(text).width) / 2)
    } else {
      for (let i = 0; i < arr.length; i++) {
        // 超出最大行数且字符有剩余，添加...
        if (row.length == maxRow && i < arr.length - 1) {
          if (isEllipsis) row[row.length - 1] += "..."
          break
        }
        // 字符换行计算
        if (context.measureText(temp).width < maxWidth) {
          temp += arr[i] + separator
          // 遍历到最后一位字符
          if (i === arr.length - 1) {
            row.push(temp)
          }
        } else {
          i-- // 防止字符丢失
          row.push(temp)
          temp = ""
        }
      }
    }
    // 绘制文本
    for (let i = 0; i < row.length; i++) {
      context.fillText(row[i], x, y + i * lineHeight, maxWidth)
    }

    return {
      w: row.length > 1 ? maxWidth : context.measureText(text).width,
      h: row.length * lineHeight, //row.length * lineHeight
    }
    // return row.length * lineHeight;  // 返回文本高度
  }

  // 绘制弧矩形路径
  canvasToDrawArcRectPath(ctx, x, y, w, h, r = 0) {
    const [topLeftRadius, topRightRadius, bottomRightRadius, BottomLeftRadius] =
      Array.isArray(r) ? r : [r, r, r, r]
    /**
     * 1. 移动到圆弧起点
     *
     * 2. 绘制上直线
     * 3. 绘制右上角圆弧
     *
     * 4. 绘制右直线
     * 5. 绘制右下圆弧
     *
     * 6. 绘制下直线
     * 7. 绘制左下圆弧
     *
     * 8. 绘制左直线
     * 9. 绘制左上圆弧
     */
    ctx.beginPath()

    ctx.moveTo(x + topLeftRadius, y)

    // 右上
    ctx.lineTo(x + w - topRightRadius, y)
    ctx.arcTo(x + w, y, x + w, y + topRightRadius, topRightRadius)

    // 右下
    ctx.lineTo(x + w, y + h - bottomRightRadius)
    ctx.arcTo(x + w, y + h, x + w - bottomRightRadius, y + h, bottomRightRadius)

    // 左下
    ctx.lineTo(x + BottomLeftRadius, y + h)
    ctx.arcTo(x, y + h, x, y + h - BottomLeftRadius, BottomLeftRadius)

    // 左上
    ctx.lineTo(x, y + topLeftRadius)
    ctx.arcTo(x, y, x + topLeftRadius, y, topLeftRadius)

    ctx.closePath()
  }

  // 绘制块元素
  canvasToDrawBlock(ctx, params) {
    return new Promise(async (resolve) => {
      const {
        x,
        y,
        url,
        width,
        height,
        radius,
        border,
        borderColor,
        backgroundColor,
      } = params
      if (border) {
        ctx.setFillStyle(borderColor ?? "#fff")
        this.canvasToDrawArcRectPath(
          ctx,
          x - border,
          y - border,
          width + border * 2,
          height + border * 2,
          radius
        )
        ctx.fill()
      }

      if (backgroundColor) {
        ctx.setFillStyle(backgroundColor)
        this.canvasToDrawArcRectPath(ctx, x, y, width, height, radius)
        ctx.fill()
      }

      if (url) {
        let tempImageUrl = url
        ctx.save()
        this.canvasToDrawArcRectPath(ctx, x, y, width, height, radius)
        ctx.clip()
        if (/^(https:|http)/.test(url)) {
          // const { path: tempImageUrl } = await getImageInfoSync(url)
          const data = await getImageInfoSync(url)
          tempImageUrl = data.path
        }
        ctx.drawImage(tempImageUrl, x, y, width, height)
      }

      ctx.restore()
      resolve()
    })
  }
  // 获取图片信息（主要用于把远程 url转为微信临时文件以绘制图片）
  getImageInfoSync(url, ...args) {
    return new Promise((resolve, reject) => {
      if (url === "") reject({ errMsg: "图片为空" })
      wx.getImageInfo({
        src: url,
        success: (res) => {
          resolve({ ...res, ...args })
        },
        fail: (err) => {
          reject(err)
          console.log("获取图片信息失败******", err)
        },
      })
    })
  }
  // 把base64转为图片
  async base64ToImg(data) {
    // function downBase64(data) {
    return new Promise((resolve, reject) => {
      let resData = data.replace(/^data:image\/\w+;base64,/, "")
      const buffer = wx.base64ToArrayBuffer(resData)
      const fsm = wx.getFileSystemManager()
      const filePath = `${wx.env.USER_DATA_PATH}/tmp_base64src.png`
      fsm.writeFile({
        filePath: filePath,
        data: buffer,
        encoding: "utf8",
        // encoding: 'binary',
        success: (res) => {
          resolve(filePath)
          console.log("写入成功, 路径: ", filePath, res)
        },
        fail: (err) => {
          console.log("写入失败******", err)
          reject(err)
        },
      })
    })
    // }
    // let res = await downBase64(data)
    // return new Promise((resolve, reject) => {
    //   // console.log('new URL-------',new URL(res));
    //   console.log('保存的图片路径-----',res);
    //   wx.downloadFile({
    //     url: res,
    //     success: (res2) => {
    //       resolve(res2)
    //     },
    //     fail: (err) => {
    //       reject(err)
    //       console.log("下载失败******", err)
    //     }
    //   })
    // })
  }
  /**
   * imgSourceWidth,imgSourceHeight : 图片的原始高度；
   * fitWidth,fitHeight: 图片保持比例缩放后，要能够塞进这个大小范围内；
   * 返回对象为适配处理后的图片尺寸，该尺寸是刚刚好可以装到fitWidth和fitHeight中的，不多一个像素，也不少一个像素，并且保持原始的图片宽高显示比例；
   * 返回示例：{width:100,height:100}
   * 如果计算失败，返回null
   */
  aspectFitImg(imgSourceWidth, imgSourceHeight, fitWidth, fitHeight) {
    if (imgSourceWidth > fitWidth) {
      let d = imgSourceWidth / fitWidth
      let th = imgSourceHeight / d
      return this.aspectFitImg(fitWidth, th, fitWidth, fitHeight)
    } else if (imgSourceHeight > fitHeight) {
      let d = imgSourceHeight / fitHeight
      let tw = imgSourceWidth / d
      return this.aspectFitImg(tw, fitHeight, fitWidth, fitHeight)
    } else if (imgSourceWidth <= fitWidth && imgSourceHeight <= fitHeight) {
      return { width: imgSourceWidth, height: imgSourceHeight }
    } else {
      return this.aspectFitImg(
        imgSourceWidth,
        imgSourceWidth,
        fitWidth,
        fitHeight
      )
    }
  }
  aspectImg(imgSourceWidth, imgSourceHeight, FitWidth, FitHeight) {
    let w, h, leftNum, topNum
    if (imgSourceWidth > 0 && imgSourceHeight > 0) {
      if (imgSourceWidth / imgSourceHeight >= FitWidth / FitHeight) {
        if (imgSourceWidth > FitWidth) {
          w = FitWidth
          h = (imgSourceHeight * FitWidth) / imgSourceWidth
        } else {
          w = imgSourceWidth
          h = imgSourceHeight
        }
      } else {
        if (imgSourceHeight > FitHeight) {
          h = FitHeight
          w = (imgSourceWidth * FitHeight) / imgSourceHeight
        } else {
          w = imgSourceWidth
          h = imgSourceHeight
        }
      }
    }
    topNum = FitHeight > h ? (FitHeight - h) / 2 : 0
    leftNum = FitWidth > w ? (FitWidth - w) / 2 : 0
    return {
      w,
      h,
      leftNum,
      topNum,
    }
  }

  coverImg(box_w, box_h, source_w, source_h) {
    var sx = 0,
      sy = 0,
      sWidth = source_w,
      sHeight = source_h
    if (source_w > source_h || (source_w == source_h && box_w < box_h)) {
      sWidth = (box_w * sHeight) / box_h
      sx = (source_w - sWidth) / 2
    } else if (source_w < source_h || (source_w == source_h && box_w > box_h)) {
      sHeight = (box_h * sWidth) / box_w
      sy = (source_h - sHeight) / 2
    }
    return {
      sx,
      sy,
      sWidth,
      sHeight,
    }
  }

  cacheImg(url, name) {
    const fs = wx.getFileSystemManager()
    const time = new Date().getTime()
    const obj = app.storage.get("CACHE_IMG") || {}
    // let T=1000*60*60*24*30;
    return new Promise((resolve, reject) => {
      let path = "",
        existence

      try {
        path = obj[name]
        if (path) {
          existence = fs.accessSync(path.url)
          resolve(path.url)
          return
        }
      } catch (error) {
        console.log("error:", error)
      }

      wx.downloadFile({
        url: url,
        success: function (res) {
          if (res.statusCode === 200) {
            fs.saveFile({
              tempFilePath: res.tempFilePath, // 传入一个临时文件路径
              success(res) {
                console.log("图片缓存成功", res.savedFilePath) // res.savedFilePath 为一个本地缓存文件路径
                // wx.setStorageSync(name,{url: res.savedFilePath,time:time})
                obj[name] = { url: res.savedFilePath, time: time }
                app.storage.set("CACHE_IMG", obj)
                // wx.setStorageSync(name,{url: res.savedFilePath,time:time})
                resolve(res.savedFilePath)
              },
            })
          } else {
            console.log("响应失败", res.statusCode)
          }
        },
      })
    })
  }
}

export default Draw
