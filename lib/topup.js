var httpClient = require('./httpclient')
var utils = require('./utils')
var SMSGHError = require('./error')

/**
 * TopUp description
 * @param {String} apiKey api key provided by SMSGH
 */
function TopUp (apiKey) {
  if (!(this instanceof TopUp)) return new TopUp(apiKey)

  if (!apiKey || typeof apiKey !== 'string') {
    throw new SMSGHError('TopUp expects an api key as a string')
  }

  this.apiKey = apiKey
}

/**
 * topItUp description
 * @param  {Object} opts The options object
 *   Example:
 *       {
 *           phone: '2332000000000',
 *           network: 'tigo',
 *           lineType: 0,
 *           amount: 5,
 *           method: 'GET'
 *       }
 *       phone: The phone number for which a top-up is being made. Must be of the form ‘233xxxxxxxxx’.
 *       network: The Mobile network
 *       lineType: Whether or not the service is prepaid or postpaid
 *       amount: The amount of credit to top up in Ghana cedis. Must be a positive integer (1, 2, 3, …)
 *       method: The type of method to use whether 'POST' or 'GET' default: 'GET'
 * @param {Function} callback The function that is called with an error if any and the response after
 * the api call has been made
 */
TopUp.prototype.topItUp = function (opts, callback) {
  if (!opts || typeof opts !== 'object') {
    callback(new SMSGHError('`topItUp` expects an options param and must be an object'), null)
  }
  opts.network = opts.network.toLowerCase()
  opts.method = (opts.method !== undefined ? opts.method : 'GET').toLowerCase()
  callback = callback || function () {}

  var validNetwork = false
  for (var i = 0, l = TopUp.NETWORKS.length; i < l; i++) {
    if (TopUp.NETWORKS[i] === opts.network) {
      validNetwork = true
      break
    }
  }

  if (!validNetwork) {
    callback(new SMSGHError('Available network types are: `mtn`, `vodafone`, `expresso`, `airtel`, `tigo` or `glo`'), null)
  }

  var formattedString = utils.serialize({
    'phone': opts.phone,
    'line-type': opts.lineType,
    'network': opts.network,
    'amount': opts.amount,
    'api-key': this.apiKey
  }, false, true)

  if (opts.method === 'get') {
    httpClient.get({
      url: TopUp.BASE_URL + '?' + formattedString
    }, callback)
  } else {
    httpClient.post({
      url: TopUp.BASE_URL,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: formattedString
    }, callback)
  }
}

TopUp.BASE_URL = 'https://api.smsgh.com/credit/topup'

TopUp.NETWORKS = ['mtn', 'vodafone', 'expresso', 'airtel', 'tigo', 'glo']

module.exports = TopUp
