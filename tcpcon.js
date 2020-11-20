const net = require('net');
const struct = require('python-struct');
const fs = require('fs');

const client = net.createConnection({
  port: 29100
});

const helloData = [
  0x50, 0x50, 0x43, 0x52, 
  0x00, 0xd3, 0x00, 0x00, 
  0x00, 0x31, 0x00, 0x01, 
  0x01, 0x00, 0x01, 0x00, 
  0x50, 0x69, 0x70, 0x65, 
  0x54, 0x65, 0x73, 0x74, 
  0x00, 0x46, 0x72, 0x6f, 
  0x6d, 0x20, 0x27, 0x4c, 
  0x6f, 0x63, 0x61, 0x6c, 
  0x68, 0x6f, 0x73, 0x74, 
  0x3a, 0x32, 0x39, 0x30, 
  0x30, 0x30, 0x27, 0x00, 
  0x2b
];

async function sendCMD(cmd) {
  const initialData = Buffer.from([0x43, 0x4d, 0x4e, 0x44, 0x00, 0xD2, 0x00, 0x00]);
  const endian = Buffer.from(struct.pack('!h', cmd.length + 13));
  const padding = Buffer.from([0x0, 0x0]);
  const command = Buffer.from(cmd + '\n', 'utf8');
  const terminator = Buffer.from([0x00]);
  const fin = Buffer.concat([initialData, endian, padding, command, terminator]);
  client.write(fin);
}

const packetTypes = {};
const commandFiles = fs.readdirSync('./packets').filter(file => file.endsWith('.js'));
commandFiles.forEach((ptype) => {
  packetTypes[ptype.replace('.js', '')] = require(`./packets/${ptype}`);
});

client.on('connect', () => {
  console.log('conn ' + client.remotePort);
  client.write(Buffer.from(helloData));
});

client.on('data', (data) => {
  console.log(`PACKET TYPE: ${struct.unpack('<4s', data)[0]}`);
  if (packetTypes[struct.unpack('<4s', data)[0]]) 
    console.log(packetTypes[struct.unpack('<4s', data)[0]](data));
});

client.on('error', (err) => {
  console.log('error ' + err);
});

client.on('close', () => {
  console.log('connection killed');
  client.connect({ port: 29100 });
});