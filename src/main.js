import Vue from 'vue'
import App from './App.vue'

import i18n from './i18n'

import { Button, Table,Modal ,Card,Select,Option,Input,Icon,Affix,BackTop,LoadingBar,Message,Dropdown,DropdownMenu,DropdownItem,RadioGroup,Radio} from 'iview';

Vue.component('Button', Button);
Vue.component('Table', Table);
Vue.component('Modal', Modal);
Vue.component('Card', Card);
Vue.component('Select', Select);
Vue.component('Option', Option);
Vue.component('IViewInput', Input);
Vue.component('Icon', Icon);
Vue.component('Affix', Affix);
Vue.component('BackTop', BackTop);
Vue.component('Message', Message);
Vue.component('Loading', LoadingBar);
Vue.component('Dropdown', Dropdown);
Vue.component('DropdownMenu', DropdownMenu);
Vue.component('DropdownItem', DropdownItem);
Vue.component('RadioGroup', RadioGroup);
Vue.component('Radio', Radio);

Vue.prototype.$Message = Message;
Vue.prototype.$Loading = LoadingBar;
import 'iview/dist/styles/iview.css';
import '../theme/index.less';

// iView 按需导入组件
Vue.config.productionTip = false

new Vue({
  render: h => h(App),
  i18n
}).$mount('#app')
