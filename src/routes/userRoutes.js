const express = require("express");
const router = express.Router();
const User = require('./../models/user');
const { jwtAuthMiddleware, genrateToken } = require('./../../jwt');

router.post('/signup', async (req, res) => {
    try {
        const data = req.body;
         const existingAadhaar = await User.findOne({ addharNumber: data.addharNumber });
        if (existingAadhaar) {
            return res.status(400).json({
                message: "Aadhaar number already registered"
            });
        }
        if (data.role === "admin") {
            const existingAdmin = await User.findOne({ role: "admin" });
            if (existingAdmin) {
                return res.status(400).json({ message: "Admin already exits . only one admin  is allowed " });
            }

        }
        const newUser = new User(data);
        const response = await newUser.save();
        console.log(response, "response Saved");
        const payload = {
            id: response.id,
        }
        const token = genrateToken(payload);
        console.log("Genrated Token", token);
        res.status(200).json({ user: response, token: token });

    } catch (error) {
        console.log(error, "error");
        res.status(500).json({ message: "Internal server error" });

    }
});


router.post('/login', async (req, resp) => {
    try {
        //get addharNumber and password from the request body 
        const { addharNumber, password } = req.body;
        const user = await User.findOne({ addharNumber: addharNumber });
        // if the user does not exist  or password doesnot match , return error
        if (!user || !(await user.comparePassword(password))) {
            return resp.status(401).json({ message: "Invalid username or password" });
        }

        //genrate token 
        const payload = {
            id: user.id,
            username: user.username

        }
        // instead of passing only  username i can pass  both id and username for token gerration together as a  payload 

        const token = genrateToken(payload);
        resp.json({ token : token , user : user});


    } catch (error) {
        console.error(error);
        console.log(error, "errrrrr");
        resp.status(500).json({ error: "Inernal server error " })

    }
})

router.get('/allperson', jwtAuthMiddleware, async (req, resp) => {
    try {
        const data = await User.find();
        console.log('Data fetched', data);
        resp.status(200).json(data);


    } catch (error) {
        console.log(error);
        resp.status(500).json({ error: "Internal Server Error" });

    }
})

router.get('/allperson/:type', jwtAuthMiddleware, async (req, resp) => {
    try {
        const type = req.params.type;
        if (type === "owner" || type === "officer" || type === "worker") {
            const data = await User.find({ work: type });
            console.log('Data fetched', data);
            resp.status(200).json(data);
        } else {

            resp.status(404).json({ error: "Inavlid work type" })
        }



    } catch (error) {
        console.log(error);
        resp.status(500).json({ error: "Internal Server Error" });

    }
})

router.put('/:id', async (req, resp) => {
    try {
        const id = req.params.id;
        const updatedData = req.body;
        const response = await User.findByIdAndUpdate(id, updatedData, {
            new: true,
            runValidators: true,
        });
        if (!response) {
            resp.status(404).json({ error: "Person Not Found" });
        }
        resp.status(200).json(response);


    } catch (error) {
        resp.status(500).json({ error: "Internal Server Error" });
    }
})

router.delete('/:id', async (req, resp) => {
    try {
        const personId = req.params.id;
        console.log(personId, "personId");
        const response = await User.findByIdAndDelete(personId);
        console.log(response, "delete response");

        if (!response) {
            console.log(response, "delete response");
            resp.status(404).json({ error: "Person Id is Invalid" });
        }
        resp.status(200).json({ message: "Person Deleted Sucessfully" });


    } catch (error) {
        console.log(error, "error");
        resp.status(500).json({ error: "Internal Server Error" })
    }

})


router.get('/profile', jwtAuthMiddleware, async (req, resp) => {
    try {
        const userData = req.user;
        const userId = userData.id;
        const user = await User.findById(userId);
        resp.status(200).json({ user });


    } catch (error) {
        console.log(error, "error");
        resp.status(500).json({ error: "Internal Server Error" })

    }
})

router.put('./profile/password', async (req, resp) => {
    try {
        const userId = req.user;
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(userId);
        // if the user does not exist  or password doesnot match , return error
        if (!(await user.comparePassword(currentPassword))) {
            return resp.status(401).json({ error: "Invalid username or password" });
        }
        user.password = newPassword;
        await user.save();
        console.log('Password Updated');
        resp.status(200).json({ message: "Password updated " })
    }
    catch (error) {
        console.log(error);
        resp.status


    }
})

module.exports = router;
