<template>
  <div>
    <div class="form">
      <p>
          <span>試算表網址：</span>
          <input class="sheetUrl" type="text" v-model="sheetUrl" placeholder="請輸入試算表網址"> 
      </p>
      <p>
          <span>sheet：</span>
          <input class="sheetNum" type="text" v-model="sheetNum" placeholder="1"> 
      </p>
      <p>
          <span></span>
          <button @click="getJson" >產生JSON</button>
      </p>
    </div>

    <div class="copy-block">
      <button @click="copy" :disabled="!json_data">複製JSON</button>
    </div>
    <div id="result">
      <span v-if="loading"> loading... </span>
      <pre v-else-if="json_data" id="json-block">{{ JSON.stringify(json_data, undefined, 2) }}</pre>
      <span class="empty-text" v-else>沒有資料</span>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'Content',
  data() {
    return {
      sheetUrl: '',
      sheetId: '',
      sheetNum: '1',
      json_data: null,
      loading: false
    }
  },
  methods: {
    getJson() {
      if(!this.findSheetId()) return false;
      const _this = this;

      _this.loading = true
      axios.get(`https://spreadsheets.google.com/feeds/list/${_this.sheetId}/${this.sheetNum}/public/values?alt=json`)
        .then(function (response) {
          _this.json_data = _this.buildJson(response);
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(function () {
          _this.loading = false
        });

    },
    findSheetId() {
      const url = this.sheetUrl.split('/');
      let target = url.findIndex( n => n === 'd');
      if(target > -1) {
        this.sheetId = url[target+1];
        return true
      }
      return false;
    },
    buildJson(response) {
      const { data } = response;
      let rows = [];
        if (data && data.feed && data.feed.entry) {
          data.feed.entry.forEach(entry => {
            const keys = Object.keys(entry);
            let newRow = {};

            keys.forEach(key => {
              const gsxCheck = key.indexOf('gsx$');
              if(gsxCheck > -1) {
                const name = key.substring(4);
                const content = entry[key];
                const value = content.$t;
                if(['oid', 'sourcelang', 'targetlang'].indexOf(name) > -1) {
                  let keyName = '';
                  switch(name) {
                    case 'oid':
                      keyName = 'prodOid';
                      break;
                    case 'sourcelang':
                      keyName = 'sourceLang';
                      break;
                    case 'targetlang':
                      keyName = 'targetLang';
                      break;
                  }
                  newRow[keyName] = value;
                }
              }
            });

            rows.push(newRow);
          }); 

          return rows;
        } else {
          return null
        }
    },
    copy() {
      let TextRange = document.createRange();
      TextRange.selectNode(document.getElementById('json-block'));
      let sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(TextRange);
      document.execCommand("copy");
      alert("已複製到剪貼簿。");
    }
  }
}
</script>
