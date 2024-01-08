const PublicPostCommentLike = (Sequelize, DataTypes) => {
    const model = Sequelize.define(
        "publicPostCommentLike",
        {
            like_id: {
                type: DataTypes.STRING(20),
                allowNull: false,
            },
        },
        {
            freezeTableName: true,
            timestamp: true,
        }
    )
    return model;
};

module.exports = PublicPostCommentLike;
