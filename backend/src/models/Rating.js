const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Rating = sequelize.define(
    "Rating",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },

        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        store_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        rating: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                max: 5
            }
        }
    },
    {
        tableName: "ratings",
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ["user_id", "store_id"]
            }
        ]
    }
);

module.exports = Rating;