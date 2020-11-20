// const struct = require('python-struct');

/** @param {Buffer} data */
function PRNT(data) {
  // console.log(struct.unpack('4sxBxxxBxxI', data));
  const packetData = {
    type: data.slice(0, 4).toString(),
    protocol: data.slice(4, 8)[1],
    length: data.slice(8, 12)[1],
    channel: data.slice(12, 16).readInt32BE(0),
    msg: data.slice(40, data.slice(8, 12)[1]).toString().split('\x00')[0]
  };
  return packetData;
}

module.exports = PRNT;