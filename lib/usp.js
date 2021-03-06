var SMSGHError = require('./error')
var utils = require('./utils')
var httpClient = require('./httpclient')

function callbackWrapper (cb) {
  if (!cb || typeof cb !== 'function') {
    throw new SMSGHError('Specify callback for request')
  }

  return function (err, res) {
    if (err) return cb(err, res)

    return cb(null, res.body)
  }
}

function USP (auth, token) {
  if (!auth) {
    throw new SMSGHError('No `auth` object provided for instantiation.')
  }

  if (!(this instanceof USP)) return new USP(auth, token)

  this.token = token
  this.defaultHeaders = {
    'Authorization': 'Basic ' + auth.basicAuth,
    'Cotent-Type': 'application/json',
    'Accept': 'application/json'
  }
}

USP.prototype.topupAirtime = function (network, amount, number, cb) {
  network = USP.NETWORK_IDS[network.toLowerCase()]
  var self = this

  if (!utils.isValidTelephoneNumber(number)) {
    throw new SMSGHError('Number `' + number + ' is invalid ')
  }

  cb = callbackWrapper(cb)

  httpClient.post({
    url: USP.BASE_URL + 'usp/airtime',
    headers: self.defaultHeaders,
    data: {
      network: network.toString(),
      amount: amount,
      phone: number,
      token: self.token
    }
  }, cb)
}

USP.prototype.payDSTV = function (account, amount, cb) {
  if (arguments.length < 2) {
    throw new SMSGHError('`payDSTV` expects `account` and `amount` arguments')
  }
  var self = this
  cb = callbackWrapper(cb)

  httpClient.post({
    url: USP.BASE_URL + 'usp/dstv',
    headers: self.defaultHeaders,
    data: {
      account: account,
      amount: amount,
      token: self.token
    }
  }, cb)
}

USP.prototype.querySurflineDevice = function (number, cb) {
  if (!utils.isValidTelephoneNumber(number)) {
    throw new SMSGHError('Number `' + number + '` is invalid ')
  }
  var self = this
  cb = callbackWrapper(cb)

  httpClient.post({
    url: USP.BASE_URL + 'usp/surfline?' + number,
    headers: self.defaultHeaders,
    data: {}
  }, cb)
}

USP.prototype.bundleSurflinePlus = function (device, amount, cb) {
  if (amount > 50 || !~[1, 5, 10, 20, 50].indexOf(amount)) {
    throw new SMSGHError('Specified amount must be either 1,5,10,20 or 50')
  }
  var self = this
  cb = callbackWrapper(cb)

  httpClient.post({
    url: USP.BASE_URL + 'usp/surflineplus',
    header: self.defaultHeaders,
    data: {
      device: device.toString(),
      amount: amount,
      token: self.token
    }
  }, cb)
}

USP.prototype.bundleSurfline = function (device, amount, bundle, cb) {
  if (amount > 50 || !~[1, 5, 10, 20, 50].indexOf(amount)) {
    throw new SMSGHError('Specified amount must be either 1,5,10,20 or 50')
  }

  cb = callbackWrapper(cb)
  var self = this
  httpClient.post({
    url: USP.BASE_URL + 'usp/surflineplus',
    header: self.defaultHeaders,
    data: {
      device: device.toString(),
      amount: amount,
      bundle: bundle,
      token: self.token
    }
  }, cb)
}

USP.prototype.payvodafoneInternet = function (account, amount, cb) {
  cb = callbackWrapper(cb)
  var self = this
  httpClient.post({
    url: USP.BASE_URL + 'usp/vodafone-internet',
    header: self.defaultHeaders,
    data: {
      account: account,
      amount: amount,
      token: self.token
    }
  }, cb)
}

USP.prototype.payVodafoneBills = function (account, amount, service, cb) {
  if (service !== 'postpaid' || service !== 'broadband') {
    throw new SMSGHError('`service` argument can be either `postpaid` or `broadband`')
  }

  cb = callbackWrapper(cb)
  var self = this
  httpClient.post({
    url: USP.BASE_URL + 'usp/vodafone',
    header: self.defaultHeaders,
    data: {
      account: account,
      amount: amount,
      service: service
    }
  }, cb)
}

USP.prototype.getAccountBalance = function (cb) {
  cb = callbackWrapper(cb)
  var self = this
  httpClient.get({
    url: USP + 'usp/account/' + self.token,
    header: self.defaultHeaders
  }, cb)
}

USP.NETWORK_IDS = {
  airtel: 62006,
  vodafone: 62002,
  expresso: 62004,
  mtn: 62001,
  globacom: 62007,
  tigo: 62003
}

USP.BASE_URL = 'https://api.smsgh.com/'

module.exports = USP
