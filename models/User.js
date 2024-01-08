const User = (Sequelize, DataTypes) => {
    const model = Sequelize.define(
        'user',{
            userid_num:{
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey:true,
                autoIncrement: true,
                unique: true
            },
            userid:{
                type: DataTypes.STRING(20),
                allowNull: false,
                unique: true,
            },
            password:{
                type: DataTypes.STRING(200),
                allowNull: false,
            },
            school:{
                type: DataTypes.STRING(50),
                allowNull: false,
            },
            phone: {
                type: DataTypes.STRING(12),
                allowNull: false,
                unique: true,
            },
            profile_img:{
                type: DataTypes.STRING(200),
                allowNull: true,
            },
            nickname:{
                type: DataTypes.STRING(50),
                allowNull: false,
                unique: true,
            },
            birthday:{
                type : DataTypes.STRING(10),
                allowNull:false,
            },
            name:{
                type : DataTypes.STRING(100),
                allowNull:false,
            },
            grade: {
                type: DataTypes.STRING(1),
                allowNull: false,
            },
            classid: {
                type: DataTypes.STRING(2),
                allowNull: false,
            }
        },{
            freezeTableName: true,
            timestamps: true
        }
    )
    return model;
}

module.exports = User;
