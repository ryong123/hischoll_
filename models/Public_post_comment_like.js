const PublicPostCommentLike = (Sequelize, DataTypes) => {
  const model = Sequelize.define(
    "publicPostCommentLike",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      likeid_num: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      freezeTableName: true,
      timestamp: false,
    }
  );
  return model;
};

module.exports = PublicPostCommentLike;
