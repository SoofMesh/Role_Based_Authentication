const express = require('express')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')

const mongoose = require("mongoose")

const path = require('path')


const port = process.env.PORT || 3000

const JWT_SECRET = 'jlkj080808lgjlsdk@#%$(**&&jglsjglk24242jdgj$#%#@!@@$sdgdd'

require('./db/conn.js')

const User = require('./db/user.js');

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser())
app.use(cors());


app.use(express.static(path.join(__dirname, './public')));

app.get('/', (req, res)=>{
    //Name of the user should be displayed properly
})

app.get('/login', (req, res)=>{
    let token = req.cookies.JWT

    if(token) res.redirect('/') 
    else res.sendFile(path.join(__dirname, 'login.html'))
})

app.get('/register', (req, res)=>{
    let token = req.cookies.JWT

    if(token) res.redirect('/') 
    else res.sendFile(path.join(__dirname, 'register.html'))
})

app.get('/admin', async (req, res)=>{
    
    let token = req.cookies.JWT
    
    if(token){
        let decodedData = await jwt.verify(JSON.parse(token), JWT_SECRET)

        decodedData.roles.includes('admin') || decodedData.roles.includes('superAdmin') ? res.sendFile(path.join(__dirname, 'adminDash.html')) : null
    }
    else res.sendFile(path.join(__dirname, 'login.html'))    
});

app.get('/seller', async (req, res)=>{
    let token = req.cookies.JWT
    if(token){
        let decodedData = jwt.verify(JSON.parse(token), JWT_SECRET)

        decodedData.roles.includes('seller') ? res.sendFile(path.join(__dirname, 'sellerDash.html')) : null
    }
    else res.sendFile(path.join(__dirname, 'login.html'))    
});

app.get('/customer', async (req, res)=>{
    let token = req.cookies.JWT
    if(token){
        let decodedData = jwt.verify(JSON.parse(token), JWT_SECRET)

        decodedData.roles.includes('customer') ? res.sendFile(path.join(__dirname, 'customerDash.html')) : null
    }
    else res.sendFile(path.join(__dirname, 'login.html'))    
});


app.post("/logInUser-api", async (req, res)=>{
    const {email, password} = req.body;   
    
    let user = await User.findOne({email})
    let roles = user?.roles   

    if(user){
        if(await bcrypt.compare(password, user.password)){
            let token = jwt.sign(
                {
                    id: user._id,
                    roles
                },
                JWT_SECRET,
                { expiresIn: "1h" }
            )   

            await res.cookie('JWT', 
                JSON.stringify(token), 
                {
                    expires: new Date( Date.now() + 60000)
                }
            )
            res.redirect('/')
        }
    }
});

app.post("/registerUser-api", async (req, res)=>{

    let token = req.cookies.JWT

    if(token) res.redirect('/') 
    else{
        const {username, email, password: plainTextPassword, repeatpassword, catg} = req.body;
        
        if(plainTextPassword === repeatpassword){
                const password = await bcrypt.hash(plainTextPassword, 10);                   
                
                    try{ 
                        let user = new User({
                            username,
                            email,
                            password                            
                        });                 

                        if(catg === 'seller'){
                            user.roles.push('seller')
                        }
                        else if(catg === 'customer'){
                            user.roles.push('customer')                            
                        }
                        await user.save()

                        token = jwt.sign(
                            {
                                id: user._id,
                                roles: user.roles
                            },
                            JWT_SECRET,
                            { expiresIn: "1h" }
                        ) 
                        
                        await res.cookie('JWT', 
                            JSON.stringify(token), 
                            {
                                expires: new Date( Date.now() + (1*60*60*1000) )
                            }
                        ) 
                        res.redirect('/')                               
                    }
                    catch(error){
                        if(error.code ===11000){
                            return res.json({
                                status: 'error',
                                error: 'User already exists'
                            })
                        } 
                        throw error;     
                    }                               
        }
        else{
            console.log('Passwords not matching...')
        }
    }
});

app.listen(port, ()=>{
    console.log(`server started at port ${port}`);
});