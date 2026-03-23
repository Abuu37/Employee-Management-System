import transporter from "../config/mail.js";


const sendCredentialsEmail = async (name, email, password) => {

    try{
        
        await transporter.sendMail({
            from:' "EMS Admin" <ibrahimabuu37@gmail.com>',
            to: email,
            subject: "Your EMS Account Credentials",
            html: ` 
                <p>Hello ${name},</p>
                <p>Your account has been created:</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Password:</strong> ${password}</p>
                <p>Please change your password after logging in for the first time.</p>
                <br/>
                <p>Best regards,<br/>EMS Admin</p>
            `
        });

    } catch(error){
        console.log("Failed to send email:", error);
    }
}
export { sendCredentialsEmail };