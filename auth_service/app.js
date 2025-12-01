const mongoose = require('mongoose');
const uuid = require('uuid');
const cors = require('cors');

const {send_mail} = require('../Queue_service/email');
const {io_redis} = require('../Queue_service/redis');

const express = require('express');
const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/udemy_clone_v1')
.then(()=>{console.log("mongodb connected")})
.catch((error)=>{console.log(error)});

const userSchema = new mongoose.Schema({
    username : {
        type : String,
        required : function(){
            return this.authProvider.length === 0
        }
    },
    email : {
        type : String,
        required : true
    },
    password : {
        type : String,
        required : function(){
            return this.authProvider.length === 0;
        }
    },
    role : {
        type : String,
        default : 'student'
    },
    authProvider : [
        {
            providerName : String,
            providerId : String
        }
    ],
    createdAt : {
        type : Date,
        default : Date.now()
    }
});

const userModel = mongoose.model('User',userSchema);

app.get('/',(req,res)=>{
    res.json({msg:'hi from backend'});
});

app.post('/register',async (req,res)=>{
    try {
        const { username , email , password } = req.body;
        console.log( username , email , password);
        
        const checkUser = await userModel.find({email});
        if(checkUser.length > 0){
            return res.json({success:false , msg:'user found' , redirectUrl:'/login'});
        }
        let otp = Math.floor(100000 + Math.random() * 900000);
        let uuid_token = uuid.v4();
        await io_redis.set(`pending:${uuid_token}`,JSON.stringify({username,email,password,otp}));
        let awai = await io_redis.get(`pending:${uuid_token}`)
        console.log(JSON.parse(awai));

        let result = await send_mail({
            to : email, 
            from : "anupbute23@gmail.com",
            subject : "otp",
            text : `${otp}`
        });
 
        if(result){
            return res.json({success : true , token : `${uuid_token}` , redirectUrl : '/verify-otp'}).status(200);
        }else{
            io_redis.del(`pending:${uuid_token}`);
            return res.json({success : false , msg : 'error1' , redirectUrl : '/'}).status(500);
        }
    } catch (error) {
        console.log(error);
        return res.json({success : false , msg : 'error2' , redirectUrl : '/register'}).status(500);
    }
}); 

app.post('/verify-otp',async (req,res)=>{
    try {
        const {uuid_token , otp} = req.body;
        let user_data = JSON.parse(await io_redis.get(`pending:${uuid_token}`));

        if(!user_data.otp == otp){
            io_redis.del(`pending:${uuid_token}`);
            return res.json({success : false , msg : 'wrong otp' , redirectUrl : '/register'});
        }
        
        const newUser = new userModel({
            username:user_data.username,
            password:user_data.password,
            email:user_data.email
        });

        await newUser.save();
        return res.json({success:true , msg : 'register success' , redirectUrl:'/login'})
    } catch (error) {
        console.log(error);
        return res.status(500).json({success:false , msg : 'register fail' , redirectUrl:'/register'});        
    }
})

app.post('/login',async (req,res)=>{
    const { email , password } = req.body;

    const result = await userModel.findOne({email});
    if(result){
        if(result.password === password){
            return res.json({success:true , username:result.username , redirectUrl:'/'}).status(200);
        }
    }else{
        return res.json({success:false , msg:'email or password wrong', redirectUrl:'/register'}).status(300);
    }
});

app.listen(4040);