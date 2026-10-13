require('dotenv').config();
const app = require('./app');
const os = require('os');

const getLocalIp = () => {
  const interfaces = os.networkInterfaces();
  for (const name in interfaces) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) return iface.address;
    }
  }
  return 'localhost';
};

const PORT = process.env.PORT || 8000;
const localIp = getLocalIp();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://${localIp}:${PORT}`);
  console.log(`Local:   http://localhost:${PORT}`);
});