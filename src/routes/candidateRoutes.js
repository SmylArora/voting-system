const express = require("express");
const router = express.Router();
const User = require('./../models/user');
const Candidate = require('./../models/candidate');
const { jwtAuthMiddleware, genrateToken } = require("./../../jwt");

const checkAdminRoles = async (userId) => {
    try {
        const user = await User.findById(userId);
        return user.role === 'admin';
    }
    catch (error) {
        return false;

    }
}

router.post('/newcandidate', jwtAuthMiddleware, async (req, res) => {
    try {
        if (!await checkAdminRoles(req?.user?.id)) {
            return res.status(403).json({ message: "User is not admin" })
        }
        const data = req.body;
        const newCandidate = new Candidate(data);
        const response = await newCandidate.save();
        console.log(response, "response Saved");

        res.status(200).json({ candidate: response });

    } catch (error) {
        console.log(error, "error");
        res.status(500).json({ error: "Internal server error" });

    }
});

router.put('./:candidateId', async (req, resp) => {
    try {
        if (!checkAdminRoles(req?.user?.id)) {
            return resp.status(403).json({ message: "User is not admin" })
        }
        const candidateId = req.params.candidateId;
        const candidateData = req.body;
        const response = await User.findByIdAndUpdate(candidateId, candidateData, {
            new: true,
            runValidators: true,
        });
        if (!response) {
            resp.status(404).json({ error: "Candidate Not Found" });
        }
        resp.status(200).json(response);
    }
    catch (error) {
        console.log(error);
        resp.status


    }
})

router.delete('./:candidateId', async (req, resp) => {
    try {
        if (!checkAdminRoles(req?.user?.id)) {
            return resp.status(404).json({ message: "User is not admin" })
        }
        const candidateId = req.params.candidateId;
        const response = await Candidate.findByIdAndDelete(candidateId);
        if (!response) {
            resp.status(404).json({ error: "Candidate Not Found" });
        }
        resp.status(200).json(response);
    }
    catch (error) {
        console.log(error);
        resp.status


    }
})
router.post("/vote/:candidateId", jwtAuthMiddleware, async (req, resp) => {
    const candidateId = req.params.candidateId;
    const userId = req.user.id;
    try {
        const candidate = await Candidate.findById(candidateId);
        if (!candidate) {
            return resp.status(404).json({ message: "Candidate not found" });
        }
        const user = await User.findById(userId);
        if (!user) {
            return resp.status(404).json({ message: "User not found" });
        }

        if (user.isvoted) {
            return resp.status(400).json({
                message: "You have already voted"
            })
        }
        if (user.role==="admin") {
            return resp.status(403).json({ message: "Admin cannot cast a vote" });
        }
        //update thr candidate document to record the vote
        candidate.votes.push({ user: userId });
        candidate.voteCount++;
        await candidate.save();


        //updaet the user document 
        user.isvoted = true;
        await user.save()
        resp.status(200).json({ message: "Vote Casted sucessfully" });


    } catch (error) {
        console.log(err);
        resp.status(500).json({ error: "Internal Server error" });
    }

});
router.get('/allcandidates', async(req , resp)=>{
    try {
    const candidates = await Candidate.find()
      .populate('votes.user', 'name email');
        resp.status(200).json({candidates:candidates});

    }catch(error){
        console.log(error, "error");
        resp.status(500).json({error:"Internal Server Error"});
    }

})

router.get("/vote/count", async (req, resp) => {
    try {
        //find all the candidates and sort them by votecount
        const candidate = await Candidate.find().sort({ voteCount: 'desc' });
        const voteRecord = candidate.map((candidate) => {
            return {
                party: candidate.party,
                voteCount: candidate.voteCount
            }
        })
        return resp.status(200).json(voteRecord); c
    } catch (error) {
        console.log(error, "error");
        resp.send(500).json({ error: "Internal Server Error" });
    }

})


module.exports = router;