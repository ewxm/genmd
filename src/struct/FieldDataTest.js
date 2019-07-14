const body = {
    "code": 0,
    "msg": "成功",
    "arr_null": [],
    "arr_null_2": [
        {
            arr_name_2:'zs',
            arr_sex_2:1
        },
        {
            arr_name_2:'lisi',
            arr_sex_2:1
        }
    ],
    "arr_null_3": [
        [
            {
                arr_name_3:'zs22',
                arr_sex_3:1
            },
            {
                arr_name_3:'lisi22',
                arr_sex_3:1
            }
        ],
        [
            {
                arr_name:'zs',
                arr_sex:1
            },
            {
                arr_name:'zs',
                arr_sex:1
            }
        ]
    ],
    "data": {
        id: 1111,
        price: 23.3,
        c1:{
            id: 111101,
            price: 24.3,
            c1_child1:[
                {
                    id: 1111101,
                    price: 22,
                }
            ],
            c1_child2:[
                "A","B","C"
            ],
            c1_child3:[
                [
                    {
                        id: 3333333333,
                        price: 3333333333,
                        c1_child6:null,
                        d: [
                            {
                                id: 3333333333,
                                price: 3333333333,
                            }
                        ]
                    }
                ]
            ],
            c1_child4:[],
            c1_child5:{},
        },
        c2:{
            id: 222202,
            price: 345.3,
            c2_1:{
                id: 2121,
                price: 2121.3,
                c2_1_1:{
                    id: 211211,
                    price: 211211.3,
                }
            }
        }
    }
}
/**
 * 可遍历字段数据
 */
class FieldData {
    /**
     * @param {健名} key 
     * @param {原始键名} originalKey 
     * @param {值} value 
     * @param {描述} description 
     * @param {父字段} parent 
     */
    constructor(key, originalKey, value, description, parent) {
        this.key = key;
        this.originalKey = originalKey;
        this.value = value;
        this.description = description;
        this.parent = parent;
        // 迭代器记录值
        this.nextNode = null;
        this.finish = false;
    }
    /**
     * 迭代器部署字段
     */
    [Symbol.iterator]() {
        return this;
    }
    /**
     * 迭代方法
     */
    next() {
        if (this.nextNode) {
            if (this.nextNode.parent) {
                let current = this.nextNode;
                this.nextNode = this.nextNode.parent; // 将next指向下一个父节点
                return { done: false, value: current }
            } else {
                if (this.finish) {
                    return { done: true };
                } else {
                    this.finish = true;
                    return { done: false, value: this.nextNode };
                }
            }
        } else {
            this.nextNode = this.parent; // 将next指向下一个父节点
            return { done: false, value: this };
        }
    }
}

this.responseBody = body;

let arr = [];
/**
 * key 当前节点字段的键
 * originalKey 当前节点字段的虚拟键
 * value 当前节点字段的值
 * description 当前节点字段的键（一个描述信息的占位字段）
 * parent 父级字段节点
 */
function te(field) {

    // 获取链式KEY值
    const getChainKey = () => {
        let keys = [];
        for (let f of field) {
            keys.unshift(f.originalKey)
        }
        return keys.reduce((accumulator, currentValue) => `${accumulator}->${currentValue}`)
    }

    if (typeof field.value === 'object' && typeof field.value !== null) {
        if (field.value instanceof Array) {
            if (field.parent) {
                if (field.value.length > 0) {
                    let item = field.value[0];
                    if(typeof item === 'object'){
                        // 展开对象的每个节点
                        if((item instanceof Array) && (item.length > 0) && !(item[0] instanceof Array)) {
                            for (let key in item[0]) {
                                te(new FieldData(key, `[[{${key}}]]`, item[0][key], key, field))
                            }
                        }else{
                            // 展开对象的每个节点
                            for (let key in item) {
                                te(new FieldData(key, `[{${key}}]`, item[key], key, field))
                            }
                        }

                    }else{
                        // 到达末尾节点
                        arr.push(Object.assign(field, { key: getChainKey() }))
                    }
                } else {
                    // 无值时
                    arr.push(Object.assign(field, { key: getChainKey() }))
                }
            } else {
                if (field.value.length > 0) {
                    let item = field.value[0];
                    // 暂不支持多维数组
                    if(typeof item === 'object'){
                        // 展开对象的每个节点
                        if((item instanceof Array) && (item.length > 0) && !(item[0] instanceof Array)) {
                            for (let key in item[0]) {
                                te(new FieldData(key, `[[{${key}}]]`, item[0][key], key, field))
                            }
                        }else{
                            for (let key in item) {
                                te(new FieldData(key, `[{${key}}]`, item[key], key, field))
                            }
                        }
                       
                    }else{
                        // 到达末尾节点
                        arr.push(field)
                    }
                } else {
                    // 无值时
                    arr.push(field)
                }
            }

        } else {
            if (field.parent) {
                let node = new FieldData(getChainKey(), field.key, field.value, field.description, null);

                arr.push(node)
                for (let key in field.value) {
                    te(new FieldData(key, key, field.value[key], key, field))
                }

            } else {
                arr.push(field)
                for (let key in field.value) {
                    te(new FieldData(key, key, field.value[key], key, field))
                }
            }
        }
    } else {
        arr.push(Object.assign(field, { key: getChainKey() }))
    }
}

for (let key in body) {
    let value = body[key];
    let description = key;
    if (typeof value === 'object' && typeof value !== null) {
        // 顶层对象字段节点
        let node = new FieldData(key, key, value, description, null)
        te(node)
    } else {
        // 顶层基本类型节点
        let node = new FieldData(key, key, value, description, null)
        arr.push(node)
    }
}

console.log('--------------------')

for (let item of arr) {
    console.log(`${item.key.padEnd(30," ")}       ${item.value?item.value.toString().padEnd(15," "):'空'}       ${item.originalKey.padEnd(15," ")}`)
}