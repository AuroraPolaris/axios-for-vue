var axios = require('axios');
var Es6Promise = require('Promise');

/**
 * Promise adapter.
 *
 * */
function PromiseObj(executor, context) {
  if (executor instanceof Promise || executor instanceof Es6Promise) {
    this.promise = executor;
  } else {
    this.promise = new Promise(executor.bind(context));
  }
  this.context = context;
}
PromiseObj.all = function (iterable, context) {
  return new PromiseObj(Promise.all(iterable), context);
};
PromiseObj.resolve = function (value, context) {
  return new PromiseObj(Promise.resolve(value), context);
};
PromiseObj.reject = function (reason, context) {
  return new PromiseObj(Promise.reject(reason), context);
};
PromiseObj.race = function (iterable, context) {
  return new PromiseObj(Promise.race(iterable), context);
};
var p = PromiseObj.prototype;
p.bind = function (context) {
  this.context = context;
  return this;
};
p.then = function (fulfilled, rejected) {
  if (fulfilled && fulfilled.bind && this.context) {
    fulfilled = fulfilled.bind(this.context);
  }
  if (rejected && rejected.bind && this.context) {
    rejected = rejected.bind(this.context);
  }
  return new PromiseObj(this.promise.then(fulfilled, rejected), this.context);
};
p.catch = function (rejected) {
  if (rejected && rejected.bind && this.context) {
    rejected = rejected.bind(this.context);
  }
  return new PromiseObj(this.promise.catch(rejected), this.context);
};
p.finally = function (callback) {
  return this.then(function (value) {
    callback.call(this);
    return value;
  }, function (reason) {
    callback.call(this);
    return Promise.reject(reason);
  });
};


var axiosInstance = axios.create({
    //baseURL: 'https://some-domain.com/api/',
    timeout: 2000
});
var getInstance = function (context) {
  return {
    get: function (url, config) {
      return new PromiseObj(axiosInstance.get(url, config), context)
    },
    post: function (url, body, config) {
      return new PromiseObj(axiosInstance.post(url, body, config), context)
    },
    put: function (url, body, config) {
      return new PromiseObj(axiosInstance.put(url, body, config), context);
    },
    'delete': function (url, config) {
      return new PromiseObj(axiosInstance.delete(url, config), context)
    }
  }
}


var installed = false;

module.exports = function (Vue) {
  if (installed) {
    return
  }
  installed = true;
  Vue.http = axiosInstance;
  Object.defineProperties(Vue.prototype, {
    $http: {
      get: function () {
        return getInstance(this);
      }
    }
  });
}


