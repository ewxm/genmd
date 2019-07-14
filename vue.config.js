const path = require('path')

module.exports = {
    lintOnSave: true,
    css: {
        loaderOptions: {
            // 给 less-loader 传递选项
            less: {
                sourceMap: true,
                javascriptEnabled: true
            }
        }
    },
    chainWebpack: config => {
        config.resolve.alias
            .set('@', path.join(__dirname, 'src'))
    },
    devServer: {
        port: 9000,
        open: true
    },
    // 设为false打包时不生成.map文件
    productionSourceMap: false

}