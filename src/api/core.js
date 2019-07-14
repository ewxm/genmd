import requset from "@/utils/request";

/**
 * 发起请求
 */
export const sendRequest = (config) => {
    return requset(config);
}