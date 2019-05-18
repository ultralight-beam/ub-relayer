const util = require('util');
const bleno = require('bleno');
const WebSocket = require('ws');

// Setup
const wss = new WebSocket.Server({port: 8000});
const BlenoCharacteristic = bleno.Characteristic;
const UUID = '00000000-0000-0000-0000-000000000001'
const EchoCharacteristic = function() {
  EchoCharacteristic.super_.call(this, {
    uuid: UUID,
    properties: ['read', 'write', 'notify'],
    value: null
  });

  this._value = Buffer.alloc(0);
  this._updateValueCallback = null;
};

// WS Global
let connections = [];
wss.on('connection', function connection(ws) {
  connections.push(ws);
	
  ws.on('message', function incoming(message) {
    relay(message)
  });

});

function relay(msg) {
  connections.forEach(function(conn) {
    conn.send(msg);
  })
}

util.inherits(EchoCharacteristic, BlenoCharacteristic);

// Listeners
EchoCharacteristic.prototype.onReadRequest = function(offset, callback) {
  console.log('EchoCharacteristic - onReadRequest: value = ' + this._value.toString('utf8'));
  console.log(this._value);

  callback(this.RESULT_SUCCESS, this._value);
};

EchoCharacteristic.prototype.onWriteRequest = function(data, offset, withoutResponse, callback) {
  this._value = data;

  console.log('EchoCharacteristic - onWriteRequest: value = ' + this._value.toString('utf8'));
  console.log(this._value);

  if (this._updateValueCallback) {
    console.log('EchoCharacteristic - onWriteRequest: notifying');

    this._updateValueCallback(this._value);
  }

  callback(this.RESULT_SUCCESS);
};

EchoCharacteristic.prototype.onSubscribe = function(maxValueSize, updateValueCallback) {
  console.log('EchoCharacteristic - onSubscribe');

  this._updateValueCallback = updateValueCallback;
};

EchoCharacteristic.prototype.onUnsubscribe = function() {
  console.log('EchoCharacteristic - onUnsubscribe');

  this._updateValueCallback = null;
};

module.exports = EchoCharacteristic;
