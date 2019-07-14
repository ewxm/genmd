import requset from "@/utils/request";
import constant from "@/constant"

/**
 * 得到项目的Start数
 */
export const getWatchers = () => {
    return requset({ url: constant.GITHUB_PROJECT_INFO });
}