let data = {
    th_param_name: '参数名',
    th_param_type: '参数类型',
    th_param_required: '必填',
    th_param_description: '参数说明',
    th_param_example: '示例'
}
let temp = '';
for(let key in data){
    temp += `${data[key]}\n`
}
console.log(temp)
let result = `имя параметра 
 тип параметра 
 обязательно заполнять 
 описание параметров 
 пример `
let resultSet = result.split('\n');

let newObj = {}
let keys = Object.keys(data);
for(let i = 0;i<keys.length;i++ ){
    newObj[keys[i]] = resultSet[i]
}
console.log(newObj)

let test = `title_1: '标题(1)'`
for(let i = 0;i<20;i++){
    console.log(`<Option :value="${i}">{{$t('title_${i}')}}</Option>`)
}
console.log(test)