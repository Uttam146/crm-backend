const { userStatus, userTypes } = require("../utils/constants");
const User = require("../Models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../utils/NotificationClient");
const { userRegistration, forgotPasswordMail } = require("../script/authScripts");
const url = require('url');

exports.confirmation = async (req, res) => {
    try {
        const usertoken = jwt.verify(req.params.token, process.env.SECRET);
        const user = await User.find({ userId: usertoken.userId });
        if (user) {
            await User.findOneAndUpdate({ _id: user._id }, { isVerified: true, userStatus: 'APPROVED' });
            if (user[0].userTypes === 'ADMIN' || user[0].userTypes === 'ENGINEER' || user[0].userTypes === 'CUSTOMER') {
                res.redirect(`${process.env.FRONTEND_URL}/login?${req.params.token}`);
            } else {
                res.send('Hacker');
            }
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
            { userId: user.userId },
            process.env.SECRET,
            { expiresIn: '1hr' },
            (err, emailToken) => {
                const url = `${process.env.SERVER_URL}/crm/confirmation/${emailToken}`
                const { subject, html, text } = userRegistration(user, url);
                sendEmail([user.email], subject, html, text);
            }
        )
        res.status(201).send(user);

    }
    catch (err) {
        res.status(500).send(err);
    }
}

exports.newsignUp = async (req, res) => {
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
        password: bcrypt.hashSync('cluster@123', 8)
    }

    try {
        const user = await User.create(userObj);

        //send the notification to the registered email that you are registered succesfully
        jwt.sign(
            { id: user._id },
            process.env.SECRET,
            { expiresIn: '1hr' },
            (err, emailToken) => {
                const url = `${process.env.SERVER_URL}/crm/confirmation/${emailToken}`
                const { subject, html, text } = userRegistration(user, url);
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

    const isPasswordValid = bcrypt.compareSync(req.body.password.toString(), user.password);

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

exports.signInByToken = async (req, res) => {
    try {
        const { id } = jwt.verify(req.params.token, process.env.SECRET);
        const user = await User.findOne({ _id: id });
        if (user === null) {
            return res.status(400).send({ message: "Invalid link" });
        }
        res.status(200).send({
            name: user.name,
            userId: user.userId,
            email: user.email,
            userType: user.userTypes,
            userStatus: user.userStatus,
            accessToken: req.params.token
        })
    } catch (err) {
        res.status(400).send({ message: err });
    }
}

exports.forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (user) {
            if (!user.isVerified || user.userStatus != 'APPROVED') {
                return res.status(200).send({
                    message: 'Please Verify Email Send to your EmailId'
                })
            }

            jwt.sign({ id: user.userId }, process.env.SECRET, { expiresIn: 86400 }, (err, emailToken) => {
                const url = `${process.env.SERVER_URL}/crm/resetpassword/${emailToken}`
                const { subject, html, text } = forgotPasswordMail(user, url);
                sendEmail([user.email], subject, html, text);
            });
            return res.status(200).send({
                message: 'Email Send to your emailId'
            })
        }

        res.status(200).send({
            message: 'Incorrect EmailId'
        })

    }
    catch (err) {
        res.status(400).send({ message: err });
    }
}

exports.resetpassword = async (req, res) => {
    try {
        const usertoken = jwt.verify(req.params.token, process.env.SECRET);
        const user = await User.find({ userId: usertoken.userId });
        if (user) {
            res.redirect(`${process.env.FRONTEND_URL}/forgotpassword?${req.params.token}`);
        } else {
            res.send('Hacker');
        }
    } catch (err) {
        console.log(err);
        res.send(err);
    }
}

exports.changePassword = async (req, res) => {
    
    try {
        const user = await User.findOneAndUpdate({userId:req.userId},{password:bcrypt.hashSync(req.body.password, 8)});
        return res.status(200).send({
            message: 'Paassword is reset'
        })
    } catch (err) {
        console.log(err);
        res.send(err);
    }
}