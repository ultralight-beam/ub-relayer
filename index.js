const bleno = require('bleno');
const Web3 = require( 'web3');
const Shh = require ('web3-shh').Shh;

const UB_RELAYER_NAME = 'UB Relayer'
const UB_SSID = '00756c74-7261-6c69-6768-74206265616d'

let BlenoPrimaryService = bleno.PrimaryService;

let characteristics = require('./characteristics');

console.log('UB relayer');

const shh = new Shh('ws://0.0.0.0:8546', null, {});
shh.subscribe('messages', {
    symKeyID: '',
    sig: '',
    ttl: 20,
    topics: ['9ad157d0'],
    minPow: 0.8,
}, (error, message, subscription) => {

    console.log(message);
})

bleno.on('stateChange', function(state) {
  console.log('on -> stateChange: ' + state);

  if (state === 'poweredOn') {
    bleno.startAdvertising(UB_RELAYER_NAME, [UB_SSID]);
  } else {
    bleno.stopAdvertising();
  }
});

bleno.on('advertisingStart', function(error) {
  console.log('on -> advertisingStart: ' + (error ? 'error ' + error : 'success'));

  if (!error) {
    bleno.setServices([
      new BlenoPrimaryService({
        uuid: UB_SSID,
        characteristics: characteristics.map(Characteristic => new Characteristic())
      })
    ]);
  }
});
