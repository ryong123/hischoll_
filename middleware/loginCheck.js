const { getSignedFile } = require("./s3");

exports.isLoggedIn = async (req, res, next) => {
  if (req.isAuthenticated()) {
    res.locals.isLoggedIn = req.isAuthenticated();
    const { name, profile_img } = req.user;
    // console.log('loginCheck profile_img : ', profile_img);
    if (profile_img == '' || profile_img == undefined) {
      const signedFile = null
      res.locals.foundUser = { name, signedFile };
      res.locals.signedFile = signedFile;
      next();
    } else {
      const signedFile = await getSignedFile(profile_img);
      // console.log('loginCheck signedFile : ', signedFile);
      res.locals.foundUser = { name, signedFile };
      res.locals.signedFile = signedFile;
      next();


      
    }
  } else {
    res.redirect("/login");
  }
};

exports.isNotLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    next();
  } else {
    res.redirect("/");
  }
};

exports.preventIndex = (req, res, next) => {
  if (!req.isAuthenticated()) {
    next();
  } else {
    res.redirect("Home");
  }
};
