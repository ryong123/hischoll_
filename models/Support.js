const Support = (Sequelize, DataTypes) => {
    const model = Sequelize.define(
        "support",{
            qa_id: {
                primaryKey:true,
                allowNull: false,
                type: DataTypes.INTEGER,
                autoIncrement: true
            },
            qa_content:{
                type: DataTypes.STRING(300),
                allowNull: false,
            },
            qa_comment:{
                type: DataTypes.STRING(300),
                autoIncrement: true
            }
        },{
            freezeTableName: true,
            timestamps: true
        }
    )
    return model;
}

module.exports = Support;