// Function to generate verification code
function generateVerificationCode() {
    var min = 100000;
    var max = 999999;
    var range = max - min + 1;
    // Using traditional Math.random() for older syntax
    return (Math.floor(Math.random() * range) + min).toString();
  }
  
  // Function to send verification email
  function sendVerificationEmail(email, code) {
    var nodemailer = require("nodemailer");
  
    // Create transporter with email service credentials
    var transporter = nodemailer.createTransport({
      service: "gmail", // Use your email service provider
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  
    // Mail options
    var mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Verification Code",
      text: "Your verification code is: " + code,
      html: "<b>Your verification code is: " + code + "</b>",
    };
  
    // Send email
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  }
  
  // Export the functions using module.exports
  module.exports = {
    generateVerificationCode: generateVerificationCode,
    sendVerificationEmail: sendVerificationEmail
  };
  