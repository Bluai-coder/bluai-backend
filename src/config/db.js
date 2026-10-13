// const { Sequelize } = require('sequelize');
// const dotenv = require('dotenv');

// // Load environment variables
// dotenv.config();

// // Setup Sequelize connection
// const sequelize = new Sequelize(
//   process.env.DB_NAME,    // Database name
//   process.env.DB_USER,    // Username
//   process.env.DB_PASS,    // Password
//   {
//     host: process.env.DB_HOST,   // Host
//     dialect: 'postgres',         // Change dialect to 'postgres'
//     logging: false,              // Disable logging (optional)
//     port: process.env.DB_PORT || 5432, // Default port for PostgreSQL is 5432
//   }
// ); 

// // Test the connection
// sequelize.authenticate()
//   .then(() => console.log('Connection established successfully'))
//   .catch(err => console.error('Unable to connect to the database:', err));

// module.exports = sequelize;
    
    
    


const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD, // FIXED
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    port: process.env.DB_PORT || 5432,
    logging: false,
  }
);

// Test connection
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');
  } catch (err) {
    console.error('❌ Unable to connect to the database:', err);
  }
})();

module.exports = sequelize;