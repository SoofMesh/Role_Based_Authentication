const mongoose = require("mongoose");
const bcrypt = require('bcryptjs')

const user = new mongoose.Schema({
			
    username: {
        type: String,
        unique: true,
        required: true  
    },
    email: {
        type: String,
        unique: true,
        required: true  
    },
    password: {
        type: String,
        required: true  
    },
    roles: {
        type: Array,
        required: true  
    }
});

    const User = new mongoose.model("user", user); 

    async function create()
    {
        if(await User.findOne({roles:'superAdmin'})){
            return
        }
        else{
            const password = await bcrypt.hash('abc', 10);
            const user = new User({username: 'admin1', email: 'admin1@gmail.com', password});
            user.roles.push('superAdmin')
                
            await user.save();
        }        
    }
     create();

        module.exports = User;