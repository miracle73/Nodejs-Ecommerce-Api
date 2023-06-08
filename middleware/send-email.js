const nodeMailer = require('nodemailer')


const sendMails = async (senderDetails) => {
    const transporter = nodeMailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: 'bryce.murphy@ethereal.email',
            pass: 'Bu6tCNTed8evUqMpPr'
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