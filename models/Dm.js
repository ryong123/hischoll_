const Dm = (Sequelize, DataTypes) => {
    const model = Sequelize.define(
        "dm",
        {
            note_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey:true,
            },
            dm_content:{
                type: DataTypes.STRING(200),
                allowNull: true
            },
            room_name:{
                type: DataTypes.STRING(120),
                allowNull: false
            },
            from_nick:{
                type: DataTypes.STRING(50),
                allowNull: false
            }
        },
        {
            freezeTableName: true,
            timestamp: true,
        }
    )
    return model;
};

module.exports = Dm;

