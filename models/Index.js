const Sequelize = require("sequelize");
const config = require(__dirname + "/../config/config.js")["development"];

const db = {};

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

const User = require("./User")(sequelize, Sequelize);
const Public_post = require("./Public_post")(sequelize, Sequelize);
const Public_post_comment = require("./Public_post_comment")(
  sequelize,
  Sequelize
);
const Public_post_comment_like = require("./Public_post_comment_like")(
  sequelize,
  Sequelize
);
const Dm = require("./Dm")(sequelize, Sequelize);

const Club = require("./Club")(sequelize, Sequelize);
const Club_members = require("./Club_members")(sequelize, Sequelize);
const Club_schedule = require("./Club_schedule")(sequelize, Sequelize);
const Club_post = require("./Club_post")(sequelize, Sequelize);
const Club_post_comment = require("./Club_post_comment")(sequelize, Sequelize);
const Club_post_comment_like = require("./Club_post_comment_like")(
  sequelize,
  Sequelize
);
const Club_chat = require("./Club_chat")(sequelize, Sequelize);
const Support = require("./Support")(sequelize, Sequelize);

// User DM = > 1:N

User.hasMany(Dm, {
  foreignKey: "userid_num",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Dm.belongsTo(User, {
  foreignKey: "userid_num",
});

// User Pubic_Post => 1:N
User.hasMany(Public_post, {
  foreignKey: "userid_num",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Public_post.belongsTo(User, {
  foreignKey: "userid_num",
});

// User C_members => 1:N
User.hasMany(Club_members, {
  foreignKey: "userid_num",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Club_members.belongsTo(User, {
  foreignKey: "userid_num",
});

Club.hasMany(Club_members, {
  foreignKey: "club_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Club_members.belongsTo(User, {
  foreignKey: "club_id",
});

// Public_post P_Comment => 1:N
Public_post.hasMany(Public_post_comment, {
  foreignKey: "post_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Public_post_comment.belongsTo(Public_post, {
  foreignKey: "post_id",
});

// P_Comment P_Comment_like => 1:N
Public_post_comment.hasMany(Public_post_comment_like, {
  foreignKey: "comment_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Public_post_comment_like.belongsTo(Public_post_comment, {
  foreignKey: "comment_id",
});

// Club C_post => 1:N
Club.hasMany(Club_post, {
  foreignKey: "club_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Club_post.belongsTo(Club, {
  foreignKey: "club_id",
});

// C_Post C_P_Comment => 1:N
Club_post.hasMany(Club_post_comment, {
  foreignKey: "post_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Club_post_comment.belongsTo(Club_post, {
  foreignKey: "post_id",
});

// C_P_comment C_P_C_like => 1:N
Club_post_comment.hasMany(Club_post_comment_like, {
  foreignKey: "comment_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Club_post_comment_like.belongsTo(Club_post_comment, {
  foreignKey: "comment_id",
});

//Club C_Chat => 1:N
Club.hasMany(Club_chat, {
  foreignKey: "club_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Club_chat.belongsTo(Club, {
  foreignKey: "club_id",
});

//Club Club_Schedule => 1:N
Club.hasMany(Club_schedule, {
  foreignKey: "club_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Club_schedule.belongsTo(Club, {
  foreignKey: "club_id",
});

User.hasMany(Support, {
  foreignKey: "userid_num",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Support.belongsTo(User, {
  foreignKey: "userid_num",
});

db.User = User;
db.Public_post = Public_post;
db.Public_post_comment = Public_post_comment;
db.Public_post_comment_like = Public_post_comment_like;

db.Club = Club;
db.Club_chat = Club_chat;
db.Club_members = Club_members;
db.Club_post = Club_post;
db.Club_post_comment = Club_post_comment;
db.Club_post_comment_like = Club_post_comment_like;
db.Club_schedule = Club_schedule;
db.Support = Support;

db.Dm = Dm;

module.exports = db;
