const KEY_LANG = 'language'
export const localSave = (key, value) => {
    localStorage.setItem(key, value)
  }
  
  export const localRead = (key) => {
    return localStorage.getItem(key) || ''
  }

  
  export const setLanguage = (value) => {
    return localSave(KEY_LANG,value)
  }

  export const getLanguage = () => {
    return localRead(KEY_LANG)
  }

  export const getType = () => {
    if(typeof responseItem.value === 'string'){
      // 字段类型为字符串
    }else if(typeof responseItem.value === 'number'){
      // 字段类型为数值(float/int/double/long)
    }
  }

  