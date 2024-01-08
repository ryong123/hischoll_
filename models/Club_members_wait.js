const ClubMembersWait = (Sequelize, DataTypes) => {
    return Sequelize.define(
        "clubMembersWait",
        {
            motivation: {
                type: DataTypes.STRING(400),
                allowNull: false,
            },
            introduction: {
                type: DataTypes.STRING(200),
                allowNull: false,
            },
        },
        {
            tableName: "clubMembersWait",
            freezeTableName: true,
            timestamps: false,
        }
    );
};

module.exports = ClubMembersWait;
