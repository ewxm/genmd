<template>
  <div id="app" class="bg">
    <!-- 头部控件 -->
    <div class="title">
      <h3 class="title-center">{{$t('title')}}</h3>
      <div class="title-right">
        <digital-clock 
        class="clock"
        :blink="true"
        :displaySeconds="true"
        :twelveHour="false"/>
        <Dropdown :transfer="true" @on-click="handleSelectedLang">
          <a href="javascript:void(0)" style="color:#19be6b;">
              {{language}}
              <Icon color="#19be6b" type="ios-arrow-down"></Icon>
          </a>
          <DropdownMenu slot="list">
              <DropdownItem v-for="item of $supportLang" :name="item.key" :key="item.key">{{item.value}}</DropdownItem>
          </DropdownMenu>
        </Dropdown>
          <a :href="githubURL">
            <svg class="octicon octicon-mark-github v-align-middle" height="32" viewBox="0 0 16 16" version="1.1" width="32" aria-hidden="true"><path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"></path></svg>
          </a>
      </div>
    </div>
    <!-- 模态框 -->
    <Modal v-model="showMarkdownModel" fullscreen :title="$t('title_build_md')" >
      <markdown v-model="markdownContent" ref="md" class="md" />
      <div slot="footer">
        <Button type="text" @click="() => (this.showMarkdownModel = false)">{{$t('close_window')}}</Button>
        <Button type="text" @click="downloadMarkdown">{{$t('download_md')}}</Button>
      </div>
    </Modal>
    <Modal v-model="showDescModel" draggable scrollable :title="$t('btn_add_description')">
      <p>{{$t('splicing_fill')}}</p>
      <IViewInput style="marginTop:8px;" type="textarea" :rows="20" v-model="inputDescriptions" @on-change="fillDesc($event.target.value)" />
    </Modal>
    <Modal v-model="showPlayModel" :title="$t('voide_tutorial')" width="1000">
      <video
        controls
        width="100%"
        ref="video"
        @playing="handleVideoPlay"
        @ended="handleVideoEnd"
      >
        <source :src="playURL" type="video/mp4" />Sorry, your browser doesn't support embedded videos.
      </video>
    </Modal>
    <Modal v-model="showHeaderModel" :fullscreen="false" :closable="false" @on-ok="saveHeader">
      <div slot="header" style="color:#f60;display:flex;">
        <p>
          <Icon type="ios-cog-outline" :size="20" />
          <span>{{$t('btn_add_header')}}</span>
        </p>
        <Button shape="circle" icon="md-add" type="text" @click="addHeader" />
      </div>
      <Table   border :columns="headerColumns" :data="headerContent"></Table>
    </Modal>
    <!-- 地址栏 -->
    <Card :padding="8" bordered dis-hover>
      <IViewInput
        class="value-content"
        v-model="inputURL"
        @on-change="handleInputURL($event.target.value)"
      >
        <Select
          v-model="requestMethod"
          slot="prepend"
          style="width: 80px"
          @on-change="handleMethodChange"
        >
          <Option v-for="m in httpMethod" :value="m" :label="m" :key="m">{{m}}</Option>
        </Select>

        <Button slot="append" :loading="loading" icon="ios-send" @click="send" class="send">
          <span v-if="loading">{{$t('sending')}}</span>
          <span v-else>{{$t('send')}}</span>
        </Button>
      </IViewInput>
    </Card>
    <!-- 接口名称输入组件 -->
    <Card :padding="8" bordered dis-hover class="card">
      <IViewInput class="value-content" v-model="apiName" :placeholder="$t('holder_interface_name')" ref="inputIName">
        <Select v-model="levelTitle" slot="prepend" style="width: 80px">
          <Option v-for="index of Array.from({length: 15}).map((v, k) => k+1)" :value="index" :key="index">{{`${$t('select_title')} (${index})`}}</Option>
        </Select>
      </IViewInput>
    </Card>
    <!-- GET请求展示组件 -->
    <Card v-if="isLikeGet" :padding="8" bordered dis-hover class="card">
      <div class="label">
          <div class="rqs-types">
            <h6 class="title-label">{{$t('request_string_params')}}</h6>
            <Icon
              class="plus"
              size="16"
              type="md-add"
              @click="addQueryItem"/>
          </div>
      </div>
      <Table border :columns="queryColumns" :data="queryContent"></Table>
    </Card>
     <!-- POST请求展示组件 -->
    <Card v-if="!isLikeGet" :padding="8" bordered dis-hover class="card" key="postBody">
      <div class="label">
          <div class="rqs-types">
            <h6 class="title-label">{{$t('request_post_payload')}}</h6>
            <Icon
              v-if="isFormData"
              class="plus"
              size="16"
              type="md-add"
              @click="addRequestItem"/>
          </div>
          <RadioGroup v-if="!isLikeGet" :value="requestType" @on-change="changeRequestType">
            <Radio v-for="type of requestTypes" :label="type.label" :key="type.label">{{type.label}}</Radio>
          </RadioGroup>
      </div>
      
      <Table v-if="isFormData" border :columns="requestColumns" :data="requestContent"></Table>
      <IViewInput
        v-else
        class="value-content"
        v-model="requestBody"
        :disabled="isNoneData"
        type="textarea"
        :rows="10"
        placeholder
        @on-blur="prettifyBody"
        @on-change="handleWriteRaw"
      />
    </Card>
    <!-- 响应展示组件 -->
    <Card :padding="8" bordered dis-hover class="card">
      <h6 class="title-label">{{$t('response')}}</h6>
      <Table class="value-content" border :columns="responseColumns" :data="responseContent"></Table>
    </Card>
    <!-- 固定按钮 -->
    <Affix :offset-bottom="20">
      <div class="btn-group">
        <Button class="btn" :type="buttomStyle" ghost @click="showAddHeaders">{{$t('btn_add_header')}}</Button>
        <Button v-if="false" class="btn" :type="buttomStyle" ghost @click="showHow">{{$t('btn_tutorial')}}</Button>
        <Button class="btn" :type="buttomStyle" ghost @click="openCORSSite">{{$t('btn_cors')}}</Button>
        <Button class="btn" :type="buttomStyle" ghost @click="showAutoFillView">{{$t('btn_add_description')}}</Button>
        <Button class="btn" :type="buttomStyle" ghost @click="resetData">{{$t('btn_reset')}}</Button>
        <Button class="btn" :type="buttomStyle" ghost @click="showMarkdownView">{{$t('btn_build_md')}}</Button>
      </div>
    </Affix>
    <BackTop :height="100" :bottom="20">
      <div class="top">{{$t('btn_back_top')}}</div>
    </BackTop>
  </div>
</template>

<script>

import cloneDeep from "lodash/cloneDeep";
import xmlFormatter from 'xml-formatter';
import DigitalClock from "vue-digital-clock";
import markdown from "@/components/markdown";
import FieldData from "@/struct/FieldData"
import { setLanguage, getFieldType,downloadString , xml2js } from '@/utils/utils'

import { getWatchers } from "@/api/github"
import { sendRequest } from "@/api/core"
import constant from "@/constant"
import qs from 'qs';

export default {
  name: "app",
  components: {
    markdown,
    DigitalClock
  },
  mounted() {
    getWatchers();
    this.updateQueryString();
    this.getHeaders()
    this.lang = this.$i18n.locale
  },
  computed: {

    /**
     * 右上角显示的语言名称
     */
    language(){
      const defaultName = 'Language'
      if(this.lang){
        let targetItem = this.$supportLang.find(item => item.key === this.lang);
        return targetItem ? targetItem.value : defaultName
      }else{
        return defaultName
      }
    },
    /**
     * 当前选中的请求方法是否是GET传参风格
     */
    isLikeGet(){
      // "GET","POST","PUT","DELETE","OPTIONS","PATCH","TRACE","HEAD","CONNECT"
      return ["GET","OPTIONS","TRACE","HEAD","CONNECT"].includes(this.requestMethod)
    },
    /**
     * 是否是表单数据
     */
    isFormData(){
      return !this.isLikeGet && (this.requestType === 'application/x-www-form-urlencoded' || this.requestType === 'multipart/form-data')
    },
    /**
     * 是否是多部件表单
     */
    isMultipartFormData(){
      return !this.isLikeGet && (this.requestType === 'multipart/form-data')
    },
    /**
     * 是否是无参请求体
     */
    isNoneData(){
      return !this.isLikeGet && this.requestType === 'none'
    },
    /**
     * 底部Button的风格
     */
    buttomStyle(){
      return this.responseContent.length > 0 ? 'success' : 'default'
    },
  },
  methods: {

    /**
     * 切换请求体类型
     */
    changeRequestType(type){
      this.requestType = type
      this.requestBody = ''
      this.requestContent = []
      this.responseBody = {}
      this.responseContent = []
    },

    /**
     * 下载markdown
     */
    downloadMarkdown(){
      downloadString(this.$refs.md.getMarkdownValue(),`${this.apiName || Date.now()}.md`)
    },

    /**
     * 切换语言
     */
    handleSelectedLang(lang){
      if(lang !== this.$i18n.locale){
        setLanguage(lang)
        this.$i18n.locale = lang
        this.lang = lang
        window.location.reload();
      }
    },

    /**
     * 填充描述信息
     */
    fillDesc(v) {
      if (v) {
        let descriptions = v.split("->");
        let len = descriptions.length;
        for (let i = 0; i < len; i++) {
          if(this.responseContent[i].description != descriptions[i]){
            let oldDescription = this.responseContent[i];
            this.responseContent.splice(i,1,Object.assign({},oldDescription,{ description: descriptions[i]}))
          }
        }
      }
    },

    /**
     * 地址栏变化
     */
    handleInputURL(value) {
      if (value.includes("?")) {
        let querystring = value.split("?")[1];
        if (querystring.startsWith("&")) {
          querystring = querystring.substr(1, querystring.length);
        }
        let qary = querystring.split("&");
        let rd = [];
        for (let qar of qary) {
          let [key, value] = qar.split("=");
          rd.push({
            key,
            value,
            description: key
          });
        }
        this.queryContent = rd;
      }
    },

    /**
     * 清空调试数据
     */
    resetData() {
      localStorage.clear();
      // 重置头状态
      this.headerContent = [];
      // 重置 GET 参数
      this.queryContent = [];
      // 重置 POST 参数
      this.requestBody = ''
      this.requestContent = []
      // 重置响应
      this.responseBody = {}
      this.responseContent = [];
    },

    /**
     * 视频进入全屏
     */
    handleVideoPlay() {
      if (this.showPlayModel) this.$refs.video.webkitRequestFullScreen();
    },

    /**
     * 视频退出全屏
     */
    handleVideoEnd() {
      if (this.showPlayModel) this.$refs.video.webkitExitFullscreen();
    },

    /**
     * 获取头信息
     */
    getHeaders() {
      let headers = localStorage.getItem("headers");
      if (headers) {
        try {
          this.headerContent = JSON.parse(headers);
        } catch (error) {
          // nothing
        }
      }
    },

    /**
     * 添加头
     */
    addHeader() {
      this.headerContent.push({
        key: "",
        value: "",
        description: ""
      });
    },

    /**
     * 保存头信息
     */
    saveHeader() {
      try {
        localStorage.setItem("headers", JSON.stringify(this.headerContent));
      } catch (error) {
        // nothing
      }
    },

    /**
     * 显示头管理视图
     */
    showAddHeaders() {
      this.showHeaderModel = true;
    },

    /**
     * 移除表格中请求头
     */
    removeHeaderItem(index) {
      this.headerContent.splice(index, 1);
      try {
        localStorage.setItem("headers", JSON.stringify(this.headerContent));
      } catch (error) {
        // nothing
      } 
    },

    /**
     * 禁用或启用表格中请求头
     */
    toggleHeaderState(index,state) {
      this.headerContent.splice(index, 1 ,{ ...this.headerContent[index] ,disabled: state});
    },

    /**
     * 显示自动填充描述视图
     */
    showAutoFillView() {
      this.showDescModel = true;
      // Object k => 'k1->k2->k3...'
      let len = this.responseContent.length;
      let description = ''
      if(this.responseContent && len){
        for(let i = 0;i<len;i++){
          if(i > 0){
            description+= '->'
          }
          description += this.responseContent[i].key
        }
      }
      this.inputDescriptions = description
    },

    /**
     * 显示播放
     */
    showHow() {
      this.showPlayModel = true;
    },

    /**
     * 打开跨域支持站点
     */
    openCORSSite() {
      const url = `<script>location.replace("https://enable-cors.org/server.html")<\/script>`
      window.open('javascript:window.name;', url);
    },

    /**
     * 显示 Markdown 视图
     */
    showMarkdownView() {

      // 不强制让用户输入接口名，但是第一次需要提醒（针对没耐心的用户优化体验）
      if(!this.apiName && !localStorage.getItem('has-show-in')){
        this.$refs.inputIName.focus()
        this.$Message.warning('请输入接口名称');
        localStorage.setItem('has-show-in',true)
        return;
      }
      
      this.showMarkdownModel = true;
      // 视图渲染完毕后滚动1像素让底部button显示出来
      this.$nextTick(() => {
              
      let getType = "`GET` & `Query Params`";
      let postType = `${this.requestMethod} & ${this.requestType}`;
      let requestBody = "?";
      if (this.requestMethod === "GET") {
        for (let i = 0; i < this.queryContent.length; i++) {
          let { key, value } = this.queryContent[i];
          requestBody += `${key}=${value}`;
          if (i < this.queryContent.length - 1) {
            requestBody += "&";
          }
        }
      } else {
          requestBody = this.requestBody;
      }
    let paramName = this.$t('th_param_name');
    let paramType = this.$t('th_param_type');
    let paramRequired = this.$t('th_param_required');
    let paramDesc = this.$t('th_param_description');
    let paramExample = this.$t('th_param_example');
    let defaultRequired = this.$t('yes');
      // 生成入参表格
      let requestBodyTable = `|${paramName}|${paramType}|${paramRequired}|${paramDesc}|${paramExample}|
|------|-------|----|-------|----|`;
      if (this.requestMethod === "GET") {
        for (let i = 0; i < this.queryContent.length; i++) {
          let { key, value, description } = this.queryContent[i];
          let type = this.$t(`data_type_${getFieldType(value)}`);
          requestBodyTable += `\n|${key}|${type}|${defaultRequired}|${description}|${value}|`;
        }
      } else {
        for (let i = 0; i < this.requestContent.length; i++) {
          let { key, value, description } = this.requestContent[i];
          let type = this.$t(`data_type_${getFieldType(value)}`);
          requestBodyTable += `\n|${key}|${type}|${defaultRequired}|${description}|${value}|`;
        }
      }

      // 生成出参表格
      let responseBodyTable = `|${paramName}|${paramType}|${paramRequired}|${paramDesc}|${paramExample}|
|------|-------|----|-------|----|`;
      for (let i = 0; i < this.responseContent.length; i++) {
        let responseItem = this.responseContent[i];
        let type = this.$t(`data_type_${getFieldType(responseItem.value)}`);
        responseBodyTable += `\n|${responseItem.key}|${type}|${defaultRequired}|${responseItem.description}|${responseItem.value}|`;
      }
      let url = this.inputURL;
      let md = `
## ${this.levelTitle}、${this.apiName}

> ${this.$t('api_trans_info').replace('GET',this.requestMethod)}

### ${this.levelTitle}.1. ${this.$t('th_req_url')}

\`${url}\`

### ${this.levelTitle}.2. ${this.$t('th_req_type')}

${this.requestMethod === "GET" ? getType : postType}

### ${this.levelTitle}.3. ${this.$t('th_req_template')}
\`\`\`json
${requestBody}
\`\`\`
### ${this.levelTitle}.4. ${this.$t('th_req_description')}

${requestBodyTable}

### ${this.levelTitle}.5. ${this.$t('th_res_template')}

\`\`\`json
${JSON.stringify(this.responseBody, null, 4)}
\`\`\`
### ${this.levelTitle}.6. ${this.$t('th_res_description')}
${responseBodyTable}
`;

      this.markdownContent = md;
      this.$refs.md.updateMarkdownText(md);

      }, 600);

    },
    /**
     * 发送请求
     */
    async send() {
      if(!this.inputURL){
        this.$Message.warning(this.$t('msg_interface_url'))
        return;
      }
      this.loading = true;
      this.$Loading.start();

      // 基本配置
      let opt = {
        method: this.requestMethod,
        url: this.inputURL,
        headers:{
          'Content-Type': 'application/json'
        }
      };

      // 追加请求体
      let localHeaders = localStorage.getItem("headers");
      if (localHeaders) {
        let headers = JSON.parse(localHeaders);
        headers.forEach(item => {
          if(!item.disabled){
            opt.headers[item.key] = item.value;
          }
        });
      }

      if (this.requestMethod === "GET") {
        // let params = {};
        // this.queryContent.forEach(item => {
        //   params[item.key] = item.value;
        // })
        // opt.params = params;
      } else {
        opt.headers['Content-Type'] = this.requestType
        if(this.requestType === "application/x-www-form-urlencoded"){
          let data = {};
          this.requestContent.forEach(item => {
            data[item.key] = item.value;
          })
          // 数据编码
          opt.data = qs.stringify(data)
          this.requestBody = qs.stringify(data)
        }else if(this.requestType === 'multipart/form-data'){
          let data = new FormData();
          let raw = '';
          this.requestContent.forEach(item => {
            data.append(item.key, item.value)
            let isFile = item.value instanceof File;
            raw += '------WebKitFormBoundary55FCp0yvRjUfw5MK\n'
            raw += `Content-Disposition: form-data;name="${item.key}"`
            if(isFile){
              raw += `;filename="${item.value.name}"\n`
              raw += `Content-Type: ${item.value.type || 'application/octet-stream'}`
              raw += '\n\n'
            }else{
              raw += '\n'
              raw += `${item.value}\n`
            }
          })
          raw += '------WebKitFormBoundary55FCp0yvRjUfw5MK--'
          opt.data = data
          this.requestBody = raw
        }else if(this.requestType === 'none'){
          // no body
        }else{
          // Text 、XML ...
          opt.data = this.requestBody;
        }
      }
      let body;
      try {
        body = await sendRequest(opt);
        this.$Message.success(this.$t('http_req_success'));
        this.$Loading.finish();
      } catch (error) {
        if(!this.$Message.isShow){
          this.$Message.isShow = true
          this.$Message.error(error.toString());
          this.$Message.isShow = false
        }
        this.$Loading.error();
      } finally {
        this.loading = false;
      }

      this.responseBody = body;

      this.responseContent = this.createFieldCollection(body);

      // 视图渲染完毕后滚动1像素让底部button显示出来
      this.$nextTick(()=>{
        window.scrollBy(0,window.scrollY + 1)
      })
      
    },
    /**
     * 生成一个请求和响应对象字段集合
     */
    createFieldCollection(obj){
      let fieldArray = [];
      /**
       * key 当前节点字段的键
       * originalKey 当前节点字段的虚拟键
       * value 当前节点字段的值
       * description 当前节点字段的键（一个描述信息的占位字段）
       * parent 父级字段节点
       */
      function nodeUp(field) {

          // 获取链式KEY值
          const getChainKey = () => {
              let keys = [];
              for (let f of field) {
                  keys.unshift(f.originalKey)
              }
              return keys.reduce((accumulator, currentValue) => `${accumulator}.${currentValue}`)
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
                                      nodeUp(new FieldData(key, `[[{${key}}]]`, item[0][key], key, field))
                                  }
                              }else{
                                  // 展开对象的每个节点
                                  for (let key in item) {
                                      nodeUp(new FieldData(key, `[{${key}}]`, item[key], key, field))
                                  }
                              }

                          }else{
                              // 到达末尾节点
                              fieldArray.push(Object.assign(field, { key: getChainKey() }))
                          }
                      } else {
                          // 无值时
                          fieldArray.push(Object.assign(field, { key: getChainKey() }))
                      }
                  } else {
                      if (field.value.length > 0) {
                          let item = field.value[0];
                          // 暂不支持多维数组
                          if(typeof item === 'object'){
                              // 展开对象的每个节点
                              if((item instanceof Array) && (item.length > 0) && !(item[0] instanceof Array)) {
                                  for (let key in item[0]) {
                                      nodeUp(new FieldData(key, `[[{${key}}]]`, item[0][key], key, field))
                                  }
                              }else{
                                  for (let key in item) {
                                      nodeUp(new FieldData(key, `[{${key}}]`, item[key], key, field))
                                  }
                              }
                            
                          }else{
                              // 到达末尾节点
                              fieldArray.push(field)
                          }
                      } else {
                          // 无值时
                          fieldArray.push(field)
                      }
                  }

              } else {
                  if (field.parent) {
                      let node = new FieldData(getChainKey(), field.key, field.value, field.description, null);

                      fieldArray.push(node)
                      for (let key in field.value) {
                          nodeUp(new FieldData(key, key, field.value[key], key, field))
                      }

                  } else {
                      fieldArray.push(field)
                      for (let key in field.value) {
                          nodeUp(new FieldData(key, key, field.value[key], key, field))
                      }
                  }
              }
          } else {
              fieldArray.push(Object.assign(field, { key: getChainKey() }))
          }
      }

      for (let key in obj) {
          let value = obj[key];
          let description = key;
          if (typeof value === 'object' && typeof value !== null) {
              // 顶层对象字段节点
              let node = new FieldData(key, key, value, description, null)
              nodeUp(node)
          } else {
              // 顶层基本类型节点
              let node = new FieldData(key, key, value, description, null)
              fieldArray.push(node)
          }
      }
      return fieldArray
    },

    /**
     * 请求方法切换事件
     */
    handleMethodChange(requestMethod) {
      this.responseBody = {}
      this.responseContent = []
    },

    /**
     * 有新的请求数据输入
     */
    async handleWriteRaw() {
      try{
        let objData = {}
        if(this.requestType === 'application/json'){
          objData = JSON.parse(this.requestBody)
        }else if(this.requestType === 'application/xml'){
          objData = await xml2js(this.requestBody)
        }
        // 对象转换为表数据
        this.requestContent = this.createFieldCollection(objData);
      }catch(e){
        // nothing
      }
    },

    /**
     * 格式化JSON或者XML
     */
    prettifyBody(){
      try{
        if(this.requestType === 'application/json'){
          let data = JSON.parse(this.requestBody)
          this.requestBody = JSON.stringify(data,null,4)
        }else if(this.requestType === 'application/xml'){
          // this.requestBody = xmlFormatter(this.requestBody)
          // nothing
        }
      }catch(e){
        // nothing
      }
    },

    /**
     * 添加一行查参数
     */
    addQueryItem() {
      this.queryContent.push({
        key: '',
        value: "",
        description: ""
      });
      this.updateQueryString();
    },

    /**
     * 移除表格中请求参数的某一行
     */
    removeQueryItem(index) {
      this.queryContent.splice(index, 1);
      this.updateQueryString();
    },

    /**
     * 更新查询参数URL
     */
    updateQueryString() {
      let querystring = ''
      let length = this.queryContent.length;
      let appendLength = length - 1;
      for(let i = 0 ;i < length; i++){
        let param = this.queryContent[i]
        querystring += `${param.key}=${param.value}`
        if(i < appendLength){
          querystring += '&'
        }
      }
      this.inputURL = this.inputURL.split('?')[0] + '?' + querystring
    },

    /**
     * 添加一行查参数
     */
    addRequestItem() {
      this.requestContent.push({
        key: '',
        value: "",
        description: ""
      });
    },

    /**
     * 移除表格中请求参数
     */
    removeRequestItem(index) {
      this.requestContent.splice(index, 1);
    },

    /**
     * 移除表格中响应
     */
    removeResponseItem(index) {
      this.responseContent.splice(index, 1);
    }
    
  },
  data() {
    return {
      // 接口地址
      githubURL: constant.GITHUB_PROJECT_URL,
      inputURL: constant.GITHUB_PROJECT_INFO,
      playURL: constant.GITHUB_VIDEO_URL,

      loading: false,

      // 模态组件
      showPlayModel: false,
      showDescModel: false,
      showMarkdownModel: false,
      showHeaderModel: false,
      // 标题组件
      levelTitle: 1,
      // 接口名
      apiName: "",
      // markdown 文本
      markdownContent: '',
      // 当前语言
      lang:'',

      // 箭头拼接的描述信息
      inputDescriptions: "",
      // 请求方法
      requestMethod: "GET",
      // 请求类型
      requestType:'application/json',
      // 支持的请求类型
      requestTypes:[
        {
          label:'none',
        },
        {
          label:'application/json',
        },
        {
          label:'application/xml',
        },
        {
          label:'application/x-www-form-urlencoded',
        },
        {
          label:'multipart/form-data',
        }
      ],
      // 支持的请求方法
      httpMethod: [
        "GET",
        "POST",
        "PUT",
        "DELETE",
        "OPTIONS",
        "PATCH",
        "TRACE",
        "HEAD",
        "CONNECT"
      ],
      // 头Render 函数
      headerColumns: [
        {
          title: this.$t('key'),
          key: "name",
          render: (h, params) => {
            let { value, description ,disabled = false} = this.headerContent[params.index];
            return h("IViewInput", {
              props: {
                value: params.row.key,
                disabled: disabled
              },
              on: {
                "on-change": event => {
                  this.headerContent.splice(params.index,1,{
                    key: event.target.value,
                    value,
                    description
                  });
                }
              }
            });
          }
        },
        {
          title: this.$t('value'),
          key: "age",
          render: (h, params) => {
            // let { key ,value, description ,disabled = false} = this.headerContent[params.index];
            let { key , description ,disabled = false} = this.headerContent[params.index];
            return h("IViewInput", {
              props: {
                value: params.row.value,
                disabled: disabled
              },
              on: {
                "on-change": event => {
                  this.headerContent.splice(params.index,1,{
                    key,
                    value: event.target.value,
                    description
                  });
                }
              }
            });
          }
        },
        {
          title: this.$t('description'),
          key: "address",
          render: (h, params) => {
            let { key ,value ,disabled = false} = this.headerContent[params.index];
            return h("IViewInput", {
              props: {
                value: params.row.description,
                disabled: disabled
              },
              on: {
                "on-change": event => {
                  this.headerContent.splice(params.index,1,{
                    key,
                    value,
                    description: event.target.value
                  });
                }
              }
            });
          }
        },
        {
          title: this.$t('action'),
          key: "action",
          width: 150,
          align: "center",
          render: (h, params) => {
            // let { key ,value, description ,disabled = false} = this.headerContent[params.index];
            let {  disabled = false} = this.headerContent[params.index];
            return h("div", [
              h(
                "Button",
                {
                  props: {
                    type: "error",
                    size: "small"
                  },
                  on: {
                    click: () => {
                      this.removeHeaderItem(params.index);
                      this.getHeaders();
                    }
                  }
                },
                this.$t('btn_delete')
              ),
              h(
                "Button",
                {
                  props: {
                    type: disabled ? "success" : "warning" ,
                    size: "small",
                    ghost: true,
                  },
                  style: {
                    marginLeft: '5px'
                  },
                  on: {
                    click: () => {
                      this.toggleHeaderState(params.index,!disabled);
                      this.saveHeader();
                      this.getHeaders();
                    }
                  }
                },
                disabled ? this.$t('btn_enable'):this.$t('btn_disabled')
              )
            ]);
          }
        }
      ],
      // 头表格数据
      headerContent: [],
      // GET请求Render函数
      queryColumns: [
        {
          title: this.$t('key'),
          key: "name",
          render: (h, params) => {
            const index = params.index
            const queryContentItem = this.queryContent[index]
            return h("IViewInput", {
              props: {
                value: params.row.key
              },
              on: {
                "on-change": event => {
                  this.queryContent.splice(index,1,{ ...queryContentItem , key: event.target.value})
                  this.updateQueryString()
                }
              }
            });
          }
        },
        {
          title: this.$t('value'),
          key: "age",
          render: (h, params) => {
            const index = params.index
            const queryContentItem = this.queryContent[index]
            return h("IViewInput", {
              props: {
                value: params.row.value
              },
              on: {
                "on-change": event => {
                  this.queryContent.splice(index,1,{ ...queryContentItem , value: event.target.value})
                  this.updateQueryString()
                }
              }
            });
          }
        },
        {
          title: this.$t('description'),
          key: "address",
          render: (h, params) => {
            const index = params.index
            const queryContentItem = this.queryContent[index]
            return h("IViewInput", {
              props: {
                value: params.row.description
              },
              on: {
                "on-change": event => {
                  this.queryContent.splice(index,1,{ ...queryContentItem , description: event.target.value})
                }
              }
            });
          }
        },
        {
          title: this.$t('action'),
          key: "action",
          width: 150,
          align: "center",
          render: (h, params) => {
            return h("div", [
              h(
                "Button",
                {
                  props: {
                    type: "error",
                    size: "small"
                  },
                  on: {
                    click: () => {
                      this.removeQueryItem(params.index);
                    }
                  }
                },
                this.$t('btn_delete')
              )
            ]);
          }
        }
      ],
      // GET请求表格数据
      queryContent: [
      ],
      // POST请求Render函数
      requestColumns: [
        {
          title: this.$t('key'),
          key: "key",
          render: (h, params) => {
            const index = params.index;
            let requestContentItem = this.requestContent[params.index];
            const isFileType = requestContentItem.type === 'File';
            let fieldType =  isFileType ? 'File' : 'Text';
            return h("IViewInput", {
              props: {
                value: params.row.key
              },
              on: {
                "on-change": event => {
                  this.requestContent.splice(index,1,{ ...requestContentItem, key: event.target.value })
                }
              }
            },
            this.isMultipartFormData ? [
              h('Dropdown',{
                props: {
                  transfer: true
                },
                on:{
                  'on-click': (type) => {
                    this.requestContent.splice(index,1,{ ...requestContentItem, type: type })
                  }
                },
                slot: 'append',
              },[
                h('a',{ props: { href: 'javascript:void(0)' } },[
                  fieldType,
                  h('Icon',{ props: { type: 'ios-arrow-down' } })
                ]),
                h('DropdownMenu',{ slot:'list' },[
                  h('DropdownItem',{ props: { name: 'Text'} },"Text"),
                  h('DropdownItem',{ props: { name: 'File'} },"File"),
                ])
              ])
            ] : []);
          }
        },
        {
          title: this.$t('value'),
          key: "value",
          render: (h, params) => {
            const index = params.index
            const requestContentItem = this.requestContent[index];
            const isFileType = requestContentItem.type === 'File';
            return isFileType ? h('input',{
                domProps: {
                  type: 'file'
                },
                on: {
                  change: (e) => {
                    const [ file ] = e.target.files;
                    this.requestContent.splice(index,1,{ ...requestContentItem, value: file })
                  }
                }
              })
              :
              h("IViewInput", {
              props: {
                value: params.row.value
              },
              on: {
                "on-change": event => {
                  this.requestContent.splice(index,1,{ ...requestContentItem, value: event.target.value })
                }
              }
            }
           );
          }
        },
        {
          title: this.$t('description'),
          key: "description",
          render: (h, params) => {
            const index = params.index
            const requestContentItem = this.requestContent[index];
            return h("IViewInput", {
              props: {
                value: params.row.description
              },
              on: {
                "on-change": event => {
                  this.requestContent.splice(index,1,{ ...requestContentItem, description: event.target.value })
                }
              }
            });
          }
        },
        {
          title: this.$t('action'),
          key: "action",
          width: 150,
          align: "center",
          render: (h, params) => {
            return h("div", [
              h(
                "Button",
                {
                  props: {
                    type: "error",
                    size: "small"
                  },
                  on: {
                    click: () => {
                      this.removeRequestItem(params.index);
                    }
                  }
                },
                this.$t('btn_delete')
              )
            ]);
          }
        }
      ],
      // POST请求原始值
      requestBody: "",
      // POST请求表格数据
      requestContent: [],

      // 响应表格Render函数
      responseColumns: [
        {
          title: this.$t('key'),
          key: "name",
          render: (h, params) => {
            return h("div", [params.row.key]);
          }
        },
        {
          title: this.$t('value'),
          key: "age",
          render: (h, params) => {
            return h("div", [params.row.value]);
          }
        },
        {
          title: this.$t('description'),
          key: "address",
          render: (h, params) => {
            const index = params.index
            const responseContentItem = this.responseContent[index];
            return h("IViewInput", {
              props: {
                value: params.row.description
              },
              on: {
                "on-change": event => {
                  this.responseContent.splice(index,1,{... responseContentItem ,description: event.target.value})
                }
              }
            });
          }
        },
        {
          title: this.$t('action'),
          key: "action",
          width: 150,
          align: "center",
          render: (h, params) => {
            return h("div", [
              h(
                "Button",
                {
                  props: {
                    type: "error",
                    size: "small"
                  },
                  on: {
                    click: () => {
                      this.removeResponseItem(params.index);
                    }
                  }
                },
                this.$t('btn_delete')
              )
            ]);
          }
        }
      ],
      // 响应体原始值
      responseBody: {},
      // 响应表格数据
      responseContent: [],
    };
  }
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  padding: 8px;
  height: 100%;
  width:100%;
}
html{
  height: 100%;
  width:100%;
}
body{
  height: 100%;
  width:100%;
}
.bg {
  	background-image:url('./assets/fly.jpeg');
    background-size:cover;
}

.content {
  margin-top: 10px;
}

.label {
  padding-bottom: 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.plus {
  margin-left: 4px;
}
input {
  color: #515a6e;
}
h6 {
  display: inline;
  margin: 0, 0, 10px, 0;
}

.md {
  width: 100%;
  height: 100%;
}

.tip {
  color: #19be6b;
  margin-top: 20px;
}
.btn {
  color: white;
  margin-top: 12px;
  margin-left: 5px;
}

.title-label {
  color: #17233d;
}

.value-content {
  margin-top: 6px;
}
.card {
  margin-top: 10px;
}
.top {
  padding: 10px;
  background: #19be6b95;
  color: #fff;
  text-align: center;
  border-radius: 2px;
}
.title {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-align: center;
  padding-bottom: 5px;
}

.title-right{
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-align: center;
  padding-bottom: 5px;
}

.title a  {
  width:20px;
  height: 20px;
}

 .title svg{
  width:inherit;
  height:inherit;
}

.title-center {
  color: white;
  text-decoration: underline;
}

.clock {
  background-color: #263238;
  color: #eceff1;
  padding: 0.3rem 0.6rem;
  margin-right: 5px;
  font-size: 0.5rem;
  font-family: "Menlo", monospace;

}

.rqs-types {
  display: flex;
  flex-direction: row;

}
/* github theme */
.gh-text, .gh-text, .gh-count{
  color: #19be6b90;
}

</style>