const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" })); // Allow all origins

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "rajpkothari2000@gmail.com",
        pass: "tcsnljwflmhzevmg"  // Ensure this is an App Password, not your normal Gmail password
    },
    debug: true,  // Enable debugging logs
    logger: true  // Log email activity
});

app.post("/send-email", async (req, res) => {
    const { email, message } = req.body;

    if (!email || !message) {
        return res.status(400).json({ message: "Missing email or message" });
    }

    const mailOptions = {
        from: "rajpkothari2000@gmail.com",
        to: email,
        subject: "RBM Robotics - Order Confirmation",
        text: message
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent:", info.response);  // Log response
        res.json({ message: "Email sent successfully!" });
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ message: `Failed to send email! Error: ${error.message}` });
    }
});

app.listen(3000, () => console.log("Server running on port 3000"));
