const bleno = require('bleno');


const UB_SSID = 'c3fcb7cb-aed4-4a5a-9565-ca4cbb76b0ff'

let BlenoPrimaryService = bleno.PrimaryService;

let characteristics = require('./characteristics');

console.log('UB relayer');

bleno.on('stateChange', function(state) {
  console.log('on -> stateChange: ' + state);

  if (state === 'poweredOn') {
    bleno.startAdvertising('echo', [UB_SSID]);
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
