const ClubPost = (Sequelize, DataTypes) => {
  return Sequelize.define(
    "clubPost",
    {
      post_id: {
        // clubPostComment 테이블과 1:다 연결 -> 게시글 하나에 댓글 여러개
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      image: {
        // 최대 5개
        type: DataTypes.JSON,
        allowNull: true,
      },
      userid_num: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      click: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: "clubPost",
      freezeTableName: true,
      timestamps: true,
    }
  );
};

module.exports = ClubPost;
