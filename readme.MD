# UB Relayer

The relayer acts as a **central**, and has two jobs: connecting to peers over bluetooth, and broadcasting messages to other relayers.

When a periphirial (bluetooth device) connects, and sends a message to the relayer, the relayer will broadcast that message across the other relayers and connected bluetooth devices.

#### To run
1. `yarn install`
2. `node index.js`
