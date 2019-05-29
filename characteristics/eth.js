const util = require('util');
const bleno = require('bleno');
const ethers = require('ethers');

// Setup
const BlenoCharacteristic = bleno.Characteristic;
const UUID = '00000000-0000-0000-0000-000000000002';
const provider = ethers.getDefaultProvider('goerli')

function relay(msg) {
  const tx = msg.toString('utf8')
  console.log('relay to goerli', tx);
  return provider.sendTransaction(tx);
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

  relay(this._value).then(tx => {
    console.log(JSON.stringify(tx))
    const url = 'https://goerli.etherscan.io/tx/' + tx.hash;
    console.log(url);

    if (this._updateValueCallback) {
      this._updateValueCallback(Buffer.from(url));
    }
  }).catch(e => {
    console.log(e)
  });

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
