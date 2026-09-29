const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./src/models/user");

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected");

        const existingUser = await User.findOne({
            email: "admin@apisentinel.com"
        });

        if (existingUser) {
            console.log("Admin user already exists");
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash(
            "admin123",
            10
        );

        const user = await User.create({
            name: "Security Admin",
            email: "admin@apisentinel.com",
            password: hashedPassword,
            role: "Administrator"
        });

        console.log("Admin user created successfully!");
        console.log("Email:", user.email);
        console.log("Password: admin123");

        process.exit(0);

    } catch (error) {
        console.error(
            "Error creating admin:",
            error
        );

        process.exit(1);
    }
};

createAdmin();