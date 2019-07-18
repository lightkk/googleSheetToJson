import Vue from 'vue';
import './main.scss';
import App from './app.vue';

let root = document.createElement('div');
document.body.appendChild(root);

new Vue({
  render: (h)=> h(App)
}).$mount(root);
