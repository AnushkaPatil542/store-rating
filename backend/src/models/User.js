const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define(
    "User",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },

        name: {
            type: DataTypes.STRING(60),
            allowNull: false
        },

        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },

        password: {
            type: DataTypes.STRING,
            allowNull: false
        },

        address: {
            type: DataTypes.STRING(400),
            allowNull: false
        },

        role: {
            type: DataTypes.ENUM("ADMIN", "USER", "STORE_OWNER"),
            allowNull: false,
            defaultValue: "USER"
        }
    },
    {
        tableName: "users",
        timestamps: true
    }
);

module.exports = User;