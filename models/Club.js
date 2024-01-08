const Club = (Sequelize, DataTypes) => {
  return Sequelize.define(
    "club",
    {
      club_id: {
        // clubPost 테이블과 1:다 연결 -> 동아리 하나에 게시글 여러 개
        // clubSchedule 테이블과 1:다 연결 -> 동아리 하나에 일정 여러 개
        // clubChat 테이블과 1:다 연결 -> 동아리 하나에 채팅글 여러 개
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      }, // 생성한 유저아이디를 저장해놓고 변경하면 userid 값을 변경 (User의 userid)
      club_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      leader_id: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      limit: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      location: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      field: {
        type: DataTypes.STRING(35),
        allowNull: false,
      },
      keyword: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
    },
    {
      tableName: "club",
      freezeTableName: true,
      timestamps: false,
    }
  );
};

module.exports = Club;
