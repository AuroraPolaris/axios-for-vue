# axios-for-vue
axios结合vue的插件，主要是为了模仿`vue-resource`保留`this` 作用域的特征

## how to use
```
var axiosPlugin = require('axiosPlugin')

Vue.use(axiosPlugin);
```

## feature
```
new Vue({
  data: {
    result: '' 
  },
  mounted: function () {
    this.$http.get('/api/get').then(function (response) {
      // this is vue instance
      this.result = response.data; 
    })
  }
})
```

