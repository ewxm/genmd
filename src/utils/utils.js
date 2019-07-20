import { parseString } from 'xml2js';
const KEY_LANG = 'language'

/**
 * 设置本地值
 * @param {键} key 
 * @param {值} value 
 */
export const localSave = (key, value) => {
  localStorage.setItem(key, value)
}

/**
 * 读取本地值
 */
export const localRead = (key) => {
  return localStorage.getItem(key) || ''
}

/**
 * 设置语言
 * @param {新语言} value 
 */
export const setLanguage = (value) => {
  return localSave(KEY_LANG, value)
}

/**
 * 获取语言
 */
export const getLanguage = () => {
  return localRead(KEY_LANG)
}

/**
 * TODO 待优化 获取字段类型
 */
export const getFieldType = (value) => {
  let type = 'unknown';
  if (value === undefined || value === 'undefined') {
    // 未知类型
    type = 'unknown';
  } else if (value === null || value === 'null') {
    // 未知类型
    type = 'unknown';
  } else if (typeof value === 'string') {
    // 字段类型为字符串
    type = 'string'
  } else if (typeof value === 'number') {
    // 字段类型为数值(float/int/double/long)
    const isFloat = (n) => ~~n !== n
    if (isFloat(value)) {
      // 浮点(单/双)
      type = 'float';
    } else {
      // 整型 (长短)
      type = 'int';
    }
  } else if (value instanceof Array) {
    // 数组
    type = 'array';
  } else if (typeof value === 'object') {
    // 字段类型为数值(float/int/double/long)
    type = 'object';
  } else if (value === true || value === false) {
    // 布尔
    type = 'boolean';
  }
  return type
}

/**
 * 下载一个字符串
 * @param {字符串} content 
 * @param {文件名} title 
 */
export const downloadString = (content,title) => {
  const blob = new Blob([content])
  const href = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.setAttribute('href', href)
  a.setAttribute('download', title)
  a.click()
}

/**
 * xml 2 obj
 * @param {字符串} xml 
 */
export const xml2js = (xml) => {
  return new Promise((resolve,reject) => {
    parseString(xml,(err,result) => {
      if(err){
        reject(err)
      }else{
        resolve(result)
      }
    })
  })
}
