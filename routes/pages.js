const { isLoggedIn, isNotLoggedIn } = require('./middlewares');


router.get('/profile',isLoggedIn, (req,res)=>{
  res.render('profile',{title:'내 정보',user:req.user});
});



router.get('/register',isNotLoggedIn,(req,res)=>{
  res.render('register',{
    title:"회원가입",
    user:req.user
  });
});