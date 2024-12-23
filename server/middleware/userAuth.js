import jwt from "jsonwebtoken";

// Middleware to authenticate the user based on the token
const userAuth = async (req, res, next) => {
   // Extract the token from the cookies
   const { token } = req.cookies;

   // Check if the token is missing
   if (!token) {
      return res.json({
         success: false,
         message: "Not Authorized. Login Again",
      });
   }

   try {
      // Verify the token using the secret key
      const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

      // If the decoded token contains a user ID, attach it to the request body
      if (tokenDecode.id) {
         req.body.userId = tokenDecode.id;
      } else {
         // If the token does not contain a valid user ID, respond with an error
         return res.json({
            success: false,
            message: "Not Authorized. Login Again",
         });
      }

      // Proceed to the next middleware or route handler
      next();
   } catch (error) {
      // Handle any errors during token verification and send a failure response
      res.json({
         success: false,
         message: error.message,
      });
   }
};

export default userAuth;
