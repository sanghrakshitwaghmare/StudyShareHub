const nodemailer = require("nodemailer");

// Dynamic transporter builder
const getTransporter = async () => {
    // If SMTP variables exist in environment config, use them (Gmail, Mailtrap, etc.)
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        console.log(`Using configured SMTP server: ${process.env.SMTP_HOST}`);
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === "true", // true for 465, false for 587
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }

    // Dynamic test environment fallback (Ethereal Email)
    console.log("No SMTP environment keys found. Creating Ethereal SMTP test account...");
    const testAccount = await nodemailer.createTestAccount();
    console.log(`Ethereal Test SMTP Account generated: User: ${testAccount.user}`);
    
    return nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // TLS
        auth: {
            user: testAccount.user,
            pass: testAccount.pass
        }
    });
};

/**
 * Sends a HTML styled email to a target address
 * @param {Object} options - { email, subject, html }
 * @returns {Promise<String|null>} - Returns the Ethereal web preview URL if used, or null
 */
const sendEmail = async (options) => {
    try {
        const transporter = await getTransporter();
        
        const mailOptions = {
            from: process.env.FROM_EMAIL || '"StudyShareHub Student Desk" <noreply@studysharehub.edu>',
            to: options.email,
            subject: options.subject,
            html: options.html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Email successfully dispatched: ID ${info.messageId}`);

        // Get test preview URL if using Ethereal
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
            console.log(`--------------------------------------------------`);
            console.log(`Test Email Sent! View Preview Web URL:`);
            console.log(`${previewUrl}`);
            console.log(`--------------------------------------------------`);
            return previewUrl;
        }
        
        return null;
    } catch (error) {
        console.error("Failed to deliver email notification:", error);
        // Do not crash the application if email delivery fails (fallback/resiliency)
        return null;
    }
};

module.exports = sendEmail;
