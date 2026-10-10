const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

async function sendEmail(to, subject, message) {

    const info = await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: to,
        subject: subject,
        text: message
    });

    return info;
}

async function registrationEmail(userEmail){
    subject = "Welcome to our platform!";
    message = "Thank you for registering with us. We are excited to have you on board!";

    await sendEmail(userEmail, subject, message);

}

async function transactionEmail(userEmail, amount){
    subject = "Transaction Confirmation";
    message = `A transaction of amount ${amount} to ${userEmail} has been successfully processed. Thank you for using our services.`;

    await sendEmail(userEmail, subject, message);
}

module.exports = {
    registrationEmail,
    transactionEmail
};