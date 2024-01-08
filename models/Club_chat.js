const ClubChat = (Sequelize, DataTypes) => {
  return Sequelize.define(
    "clubChat",
    {
      chats_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      from_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      userid_num: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      content: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
    },
    {
      tableName: "clubChat",
      freezeTableName: true,
      timestamps: true,
    }
  );
};

module.exports = ClubChat;
