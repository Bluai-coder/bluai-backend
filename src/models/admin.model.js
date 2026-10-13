// models/admin.model.js

module.exports = (sequelize, DataTypes) => {
    const Admin = sequelize.define("admins", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
            validate: { isEmail: true },
        },
        password_hash: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        full_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        role: {
            type: DataTypes.STRING(50),
            defaultValue: 'admin',
            validate: {
                isIn: [['super_admin', 'admin', 'support']],
            },
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        last_login_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        last_login_ip: {
            type: DataTypes.INET,
            allowNull: true,
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    }, {
        timestamps: false,
        underscored: true,
        tableName: 'admins',
        schema: 'public',  // Important: specify the schema
    });

    return Admin;
};
