const nodeMailer = require('nodemailer')


const sendMails = async (senderDetails) => {
    const transporter = nodeMailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: 'kelley96@ethereal.email',
            pass: 'yQy7f3qUgz7G6cU1CP'
        }
    });

    const mailOptions = {
        from: 'Nwadiaro Miracle <nwadiaromiraclechukwuma@gmail.com>',
        to: senderDetails.email,
        subject: senderDetails.subject,
        html: senderDetails.message,
    };

    await transporter.sendMail(mailOptions);

};

module.exports = sendMails