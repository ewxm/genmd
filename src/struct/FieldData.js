/**
 * 可遍历字段数据
 */
export default class FieldData {
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
                if(this.finish){
                    return { done: true};
                }else{
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