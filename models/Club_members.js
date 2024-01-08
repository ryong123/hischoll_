const ClubMembers = (Sequelize, DataTypes) => {
  return Sequelize.define(
    "clubMembers",
    {
      member_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      motivation: {
        type: DataTypes.STRING(400),
        allowNull: true,
      },
      introduction: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      isMember: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
    },
    {
      tableName: "clubMembers",
      freezeTableName: true,
      timestamps: true,
    }
  );
};

module.exports = ClubMembers;
