import nodemailer from "nodemailer";

// Create a transporter object using SMTP transport
const transporter = nodemailer.createTransport({
     service: "Gmail",
    auth: {
        user: 'ibrahimabuu37@gmail.com',
        pass: 'cdik kcky rjqw echm',
    },
});

export default transporter;
