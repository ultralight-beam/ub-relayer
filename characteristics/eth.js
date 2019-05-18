const util = require('util');
const bleno = require('bleno');
const WebSocket = require('ws');

// Setup
const wss = new WebSocket.Server({port: 8000});
const BlenoCharacteristic = bleno.Characteristic;
const UUID = '00000000-0000-0000-0000-000000000002';

// WS Global
let connections = [];
wss.on('connection', function connection(ws) {
	connections.push(ws);

	ws.on('message', function incoming(message) {
		relay(message)
	});

});

function relay(msg) {
	console.log(`Broadcasting to ${connections.length} nodes...`);
	connections.forEach(function(conn) {
		console.log(`Sending message :: ${msg} to :: ${conn}`);
		conn.send(msg);
	})
}

// Main Entry Point
const EthCharacteristic = function(type) {
	EthCharacteristic.super_.call(this, {
		uuid: UUID,
		properties: ['read', 'write', 'notify'],
		value: null
	});
	this._type = type;
	this._value = Buffer.alloc(0);
	this._updateValueCallback = null;
};

util.inherits(EthCharacteristic, BlenoCharacteristic);

// Listeners
EthCharacteristic.prototype.onReadRequest = function(offset, callback) {
	console.log('EthCharacteristic - onReadRequest: value = ' + this._value.toString('utf8'));
	console.log(this._value);

	callback(this.RESULT_SUCCESS, this._value);
};

EthCharacteristic.prototype.onWriteRequest = function(data, offset, withoutResponse, callback) {
	this._value = data;

	console.log('EthCharacteristic - onWriteRequest: value = ' + this._value.toString('utf8'));
	console.log(this._value);

	if (this._updateValueCallback) {
		console.log('EthCharacteristic - onWriteRequest: Begin broadcast...');
		relay(this._value);
	}

	callback(this.RESULT_SUCCESS);
};

EthCharacteristic.prototype.onSubscribe = function(maxValueSize, updateValueCallback) {
	console.log('EthCharacteristic - onSubscribe');

	this._updateValueCallback = updateValueCallback;
};

EthCharacteristic.prototype.onUnsubscribe = function() {
	console.log('EthCharacteristic - onUnsubscribe');

	this._updateValueCallback = null;
};

module.exports = EthCharacteristic;
