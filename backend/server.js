require('dotenv').config();
const app = require('./src/app');
const os = require('os');

const PORT = process.env.PORT || 3000;

// Helper to display local LAN IP so the user can connect their phone
function getLocalIpAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push(iface.address);
      }
    }
  }
  return addresses;
}

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('==================================================');
  console.log('  🥗 NutriSnap AI Backend Server');
  console.log('==================================================');
  console.log(`  Local:            http://localhost:${PORT}/api/health`);
  
  const localIps = getLocalIpAddresses();
  if (localIps.length > 0) {
    localIps.forEach(ip => {
      console.log(`  Mobile App (LAN): http://${ip}:${PORT}/api/health`);
    });
  }
  console.log(`  Environment:      ${process.env.NODE_ENV || 'development'}`);
  console.log('==================================================');
});

module.exports = server;
