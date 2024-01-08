const PublicPostComment = (Sequelize, DataTypes) => {
    const model = Sequelize.define(
        "publicPostComment",{
            comment_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
            },
            comment:{
                type: DataTypes.STRING(200),
                allowNull: false,
            },
            comment_nickname:{
                type: DataTypes.STRING(50),
                allowNull: false,
            }
        },
        {
            freezeTableName: true,
            timestamps: true
        }
    )
    return model;
}
module.exports = PublicPostComment;