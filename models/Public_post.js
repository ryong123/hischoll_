const PublicPost = (Sequelize, DataTypes) => {
    const model = Sequelize.define(
        'publicPost',{
            post_id: {
                type: DataTypes.INTEGER,
                primaryKey:true,
                allowNull: false,
                autoIncrement: true
            },
            title: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            content:{
                type: DataTypes.TEXT,
                allowNull: false,
            },
            image :{
                type: DataTypes.JSON,
                allowNull: true,
            },
        },{
            freezeTableName: true,
            timestamps: true
        }
    )
    return model;
}

module.exports = PublicPost;