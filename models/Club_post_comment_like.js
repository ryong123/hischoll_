const ClubPostCommentLike = (Sequelize, DataTypes) => {
  return Sequelize.define(
    "clubPostCommentLike",
    {
      like_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
    },
    {
      tableName: "clubPostCommentLike",
      freezeTableName: true,
      timestamps: false,
    }
  );
};

module.exports = ClubPostCommentLike;
