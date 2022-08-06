const nodemailer = require("nodemailer");
/*
although it's shown that xoauth2 is not used in this file, 
but without this module, the authentication cannot be done here
xoauth2 is required in the background, as a side-effect
*/
const xoauth2 = require("xoauth2");

const sendMail = (target_email, purpose = "verify", msg = "") => {
  let sender_email = process.env.SENDER_MAIL_ID;

  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      type: "OAuth2",
      user: process.env.SENDER_MAIL_ID,
      clientId: process.env.MAIL_CLIENT_ID,
      clientSecret: process.env.MAIL_CLIENT_SECRET,
      refreshToken: process.env.MAIL_REFRESH_TOKEN,
      accessToken: process.env.MAIL_ACCESS_TOKEN,
    },
  });
  if (purpose === "verify") {
    let otp = Math.floor(100000 + Math.random() * 900000);
    //as Math.random gives number between 0 and 1 inclusive of 0 but not 1 so 6-digit will only be there

    let mailOptions = {
      from: `Booknutz ${sender_email}`,
      to: target_email,
      subject: "Verification Email",
      html: `<h2>Your OTP is ${otp}.</h2><br> <h3>Enter this otp in the verification page.<h3> <h3>Please don't share with anyone.</h3>`,
    };

    let temp = true;
    transporter.sendMail(mailOptions, (err, res) => {
      if (err) {
        temp = false;
      }
    });
    if (temp === false) {
      return {
        mailSent: false,
      };
    } else {
      return {
        mailSent: true,
        otp,
      };
    }
  } else if (purpose === "purchase") {
    let mailOptions = {
      from: `Booknutz <${sender_email}`,
      to: target_email,
      subject: "Purchase Email",
      html: `<h2>${msg}</h2>`,
    };
    transporter.sendMail(mailOptions);
  }
};

module.exports = sendMail;