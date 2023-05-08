const { userStatus, userTypes } = require("../utils/constants");
const User = require("../Models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../utils/NotificationClient");
const { userRegistration } = require("../script/authScripts");

exports.confirmation = async (req, res) => {
    try {
        const userid = jwt.verify(req.params.token, process.env.SECRET);
        const user = await User.find({ _id: userid.id });
        // console.log(user);
        if (user) {
            await User.findOneAndUpdate({ _id: user }, { isVerified: true })
            if(user.userTypes === 'ADMIN'){
                return res.redirect(`${process.env.FRONTEND_URL}/admin?token=${req.params.token}`)
            }else if(user.userTypes === 'CUSTOMER'){
                return res.redirect(`${process.env.FRONTEND_URL}/customer?token=${req.params.token}`)
            }else if(user.userTypes === 'ENGINEER'){
                return res.redirect(`${process.env.FRONTEND_URL}/engineer?token=${req.params.token}`)
            }
            
        } else {
            return res.send('Hacker');
            //Do Something
        }
    } catch (err) {
        console.log(err);
        res.send(err);
    }
}
exports.signUp = async (req, res) => {
    var userType = req.body.userType;
    var status;

    if (!userType || userType === userTypes.customer) {
        status = userStatus.approved
    } else {
        status = userStatus.pending;
    }

    const userObj = {
        name: req.body.name,
        userId: req.body.userId,
        email: req.body.email,
        userTypes: req.body.userType,
        userStatus: status,
        password: bcrypt.hashSync(req.body.password, 8)
    }

    try {
        const user = await User.create(userObj);

        //send the notification to the registered email that you are registered succesfully
        jwt.sign(
            { id: user._id },
            process.env.SECRET,
            { expiresIn: '1hr' },
            (err, emailToken) => {
                const url = `${process.env.SERVER_URL}/confirmation/${emailToken}`
                const { subject, html, text } = userRegistration(user,url);
                sendEmail([user.email], subject, html, text);
            }
        )
        res.status(201).send(user);

    }
    catch (err) {
        res.status(500).send(err);
    }
}


exports.signIn = async (req, res) => {

    const user = await User.findOne({ email: req.body.email });

    if (user === null) {
        return res.status(400).send({ message: "EmailId or password passed is invalid" });
    }
    if (user.isVerified == 0) {
        return res.status(400).send({ message: `Please verify the mail sent to your EmailID` });
    }
    if (user.userStatus != userStatus.approved) {
        return res.status(400).send({ message: `Cant allow user to login as this user is in ${user.userStatus} state` });
    }

    const isPasswordValid = bcrypt.compareSync(req.body.password, user.password);

    if (!isPasswordValid) {
        return res.status(401).send({ message: "Invalid password!" });
    }

    var token = jwt.sign({ id: user.userId }, process.env.SECRET, { expiresIn: 86400 });

    res.status(200).send({
        name: user.name,
        userId: user.userId,
        email: user.email,
        userType: user.userTypes,
        userStatus: user.userStatus,
        accessToken: token
    })
}