'use strict';

const { Sequelize, Op, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.Op = Op;

// Admin
db.Admin = require('./admin.model')(sequelize, DataTypes);

// Blog Posts
db.Blog = require('./blog.model')(sequelize, DataTypes);

// Gallery
db.Gallery = require('./gallery.model')(sequelize, DataTypes);

// Product
db.Product = require('./product.model')(sequelize, DataTypes);

module.exports = db;