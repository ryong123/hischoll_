const ClubSchedule = (Sequelize, DataTypes) => {
  return Sequelize.define(
    "clubSchedule",
    {
      schedule_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      date: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      time: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      content: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
    },
    {
      tableName: "clubSchedule",
      freezeTableName: true,
      timestamps: false,
    }
  );
};

module.exports = ClubSchedule;
