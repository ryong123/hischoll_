const ClubPostCommentLike = (Sequelize, DataTypes) => {
  return Sequelize.define(
    "clubPostCommentLike",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      likeid_num: {
        type: DataTypes.INTEGER,
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
