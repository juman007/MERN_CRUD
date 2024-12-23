import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import transporter from "../config/nodeMailer.js";

// Register a new user
export const register = async (req, res) => {
   const { name, email, password } = req.body;

   // Check for missing fields
   if (!name || !email || !password) {
      return res.json({ success: false, message: "Missing Details" });
   }

   try {
      // Check if the user already exists
      const existingUser = await userModel.findOne({ email });

      if (existingUser) {
         return res.json({ success: false, message: "Email already exists" });
      }

      // Hash the user's password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create and save the new user
      const user = new userModel({ name, email, password: hashedPassword });
      await user.save();

      // Generate a JWT token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
         expiresIn: "7d",
      });

      // Set a cookie with the token
      res.cookie("token", token, {
         httpOnly: true,
         secure: process.env.NODE_ENV === "production", // Use secure cookies in production
         sameSite: process.env.NODE_ENV === "production" ? "none" : "strict", // Adjust same-site settings based on environment
         maxAge: 7 * 24 * 60 * 60 * 1000, // Token expiry time in milliseconds
      });

      // sending wellcome email
      const mailOptions = {
         from: process.env.SENDER_EMAIL,
         to: email,
         subject: "Welcome to My Website!",
         text: `Thank you for registering on our website! Your account has been created successfully with email id:${email}.`,
      };

      await transporter.sendMail(mailOptions);

      // Respond with success message
      res.json({ success: true, message: "User registered successfully" });
   } catch (error) {
      // Handle errors
      res.json({ success: false, message: error.message });
   }
};

// Login a user
export const login = async (req, res) => {
   const { email, password } = req.body;

   // Check for missing fields
   if (!email || !password) {
      return res.json({
         success: false,
         message: "Email and password are required",
      });
   }

   try {
      // Find the user by email
      const user = await userModel.findOne({ email });

      if (!user) {
         return res.json({ success: false, message: "User not found" });
      }

      // Check if the password matches the hashed password in the database
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
         return res.json({ success: false, message: "Invalid password" });
      }

      // Generate a JWT token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
         expiresIn: "7d",
      });

      // Set a cookie with the token
      res.cookie("token", token, {
         httpOnly: true,
         secure: process.env.NODE_ENV === "production", // Use secure cookies in production
         sameSite: process.env.NODE_ENV === "production" ? "none" : "strict", // Adjust same-site settings based on environment
         maxAge: 7 * 24 * 60 * 60 * 1000, // Token expiry time in milliseconds
      });

      // Respond with success message
      res.json({ success: true, message: "User login successfully" });
   } catch (error) {
      // Handle errors
      res.json({ success: false, message: error.message });
   }
};

// Logout a user
export const logout = async (req, res) => {
   try {
      // Clear the token cookie
      res.clearCookie("token", {
         httpOnly: true,
         secure: process.env.NODE_ENV === "production", // Use secure cookies in production
         sameSite: process.env.NODE_ENV === "production" ? "none" : "strict", // Adjust same-site settings based on environment
      });

      // Respond with success message
      res.json({ success: true, message: "Logged Out" });
   } catch (error) {
      // Handle errors
      res.json({ success: false, message: error.message });
   }
};

// Send a verification OTP to the user's registered email
export const sendVerifyOtp = async (req, res) => {
   try {
      const { userId } = req.body;

      const user = await userModel.findById(userId);

      // Check if the user's account is already verified
      if (user.IsAccountVerified) {
         return res.json({
            success: false,
            message: "Account is already verified",
         });
      }

      // Generate a random 6-digit verification OTP
      const otp = String(Math.floor(100000 + Math.random() * 900000));

      // Set the OTP and its expiration time in the user's database record
      user.verifyOtp = otp;
      user.verifyOtpExpiredAt = Date.now() + 24 * 60 * 60 * 1000; // OTP expires in 24 hours

      await user.save();

      // Prepare email options for sending the OTP
      const mailOptions = {
         from: process.env.SENDER_EMAIL, // Sender's email address from environment variables
         to: user.email, // Recipient's email address
         subject: "Account Verification OTP", // Email subject
         text: `Your OTP is ${otp}. Verify your account using this OTP.`, // Email content
      };

      // Send the OTP email to the user
      await transporter.sendMail(mailOptions);

      res.json({ success: true, message: "Verification OTP sent on Email" });
   } catch (error) {
      // Handle any errors and send a failure response
      res.json({ success: false, message: error.message });
   }
};

// Verify the user's email using the provided OTP
export const verifyEmail = async (req, res) => {
   const { userId, otp } = req.body;

   // Check if userId or OTP is missing from the request
   if (!userId || !otp) {
      return res.json({ success: false, message: "Missing details" });
   }

   try {
      // Fetch the user details from the database using the userId
      const user = await userModel.findById(userId);

      // If user is not found in the database, return an error response
      if (!user) {
         return res.json({
            success: false,
            message: "User not found",
         });
      }

      // Check if the provided OTP matches the one stored in the database
      if (user.verifyOtp === " " || user.verifyOtp !== otp) {
         return res.json({
            success: false,
            message: "Invalid OTP",
         });
      }

      // Check if the OTP has expired
      if (user.verifyOtpExpiredAt < Date.now()) {
         return res.json({
            success: false,
            message: "OTP expired",
         });
      }

      // Mark the user's account as verified
      user.IsAccountVerified = true;

      // Clear the OTP and its expiration time from the user's database record
      user.verifyOtp = "";
      user.verifyOtpExpiredAt = 0;

      await user.save();

      res.json({ success: true, message: "Email verified successfully" });
   } catch (error) {
      // Handle any errors and send a failure response
      res.json({ success: false, message: error.message });
   }
};

// check if the user is authenticated
export const isAuthenticated = async (req, res) => {
   try {
      return res.json({ success: true });
   } catch (error) {
      res.json({ success: false, message: error.message });
   }
};

// sent Password Reset OTP
export const sendResetOtp = async (req, res) => {
   const { email } = req.body;

   if (!email) {
      return res.json({ success: false, message: "Email is required" });
   }

   try {
      const user = await userModel.findOne({ email });
      if (!user) {
         return res.json({ success: false, message: "User not found" });
      }
      // Generate a random 6-digit verification OTP
      const otp = String(Math.floor(100000 + Math.random() * 900000));

      // Set the OTP and its expiration time in the user's database record
      user.resetOtp = otp;
      user.resetOtpExpiredAt = Date.now() + 15 * 60 * 1000; // OTP expires in 24 hours

      await user.save();

      // Prepare email options for sending the OTP
      const mailOptions = {
         from: process.env.SENDER_EMAIL, // Sender's email address from environment variables
         to: user.email, // Recipient's email address
         subject: "Password Reset OTP", // Email subject
         text: `Your OTP for resetting your password is ${otp}.Use this OTP to procced with resetting your password`, // Email content
      };

      // Send the OTP email to the user
      await transporter.sendMail(mailOptions);

      return res.json({ success: true, message: "OTP sent to your email" });
   } catch (error) {
      res.json({ success: false, message: error.message });
   }
};

/// Reset User Password
export const resetPassword = async (req, res) => {
   const { email, otp, newPassword } = req.body;

   // Check if email, OTP, or new password is missing
   if (!email || !otp || !newPassword) {
      return res.json({
         success: false,
         message: "Email, OTP and new password are required",
      });
   }

   try {
      // Find the user by email in the database
      const user = await userModel.findOne({ email });

      // If user is not found, return an error response
      if (!user) {
         return res.json({ success: false, message: "User not found" });
      }

      // Check if the OTP is valid and matches the one stored in the database
      if (user.resetOtp === "" || user.resetOtp !== otp) {
         return res.json({ success: false, message: "Invalid OTP" });
      }

      // Check if the OTP has expired
      if (user.resetOtpExpiredAt < Date.now()) {
         return res.json({ success: false, message: "OTP expired" });
      }

      // Hash the new password before saving it to the database
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update the user's password and clear the OTP and expiration time
      user.password = hashedPassword;
      user.resetOtp = "";
      user.resetOtpExpiredAt = 0;

      await user.save();

      return res.json({
         success: true,
         message: "Password reset successfully",
      });
   } catch (error) {
      // Handle any errors and send a failure response
      return res.json({ success: false, message: error.message });
   }
};
