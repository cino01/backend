const crypto = require("crypto");
const { promisify } = require("util");

const jwt = require("jsonwebtoken");
const User = require("../models/userModule");
const AppError = require("../utils/appError");
const asyncCatcher = require("../utils/asyncCatcher");
const sendEmail = require("../utils/email");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),

    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") {
    cookieOptions.secure = true;
  }
  res.cookie("jwt", token, cookieOptions);
  // Remove password from output

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signUp = asyncCatcher(async (req, res, next) => {
  const newUser = await User.create(req.body);

  // Generate confirmation token
  const confirmationToken = jwt.sign(
    { email: newUser.email },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );

  // Send confirmation email
  console.log('it here')
  const confirmationLink = `${req.protocol}://${req.get(
    "host"
  )}/api/users/confirm/${confirmationToken}`;
  const message = `Please use this link to confirm your registration: ${confirmationLink}`;

  await sendEmail({
    email: newUser.email,
    subject: "Confirmation Email",
    message,
  });

  // Send token back to the client
  createSendToken(newUser, 200, res);
});
exports.confirmRegistration = asyncCatcher(async (req, res, next) => {
  const { token } = req.params;

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    // Update user's confirmation status in the database
    await User.findOneAndUpdate(
      { email: decodedToken.email },
      { verified: true }
    );

    res.send("verifed ya chikour"); // Redirect to login page after confirmation
  } catch (err) {
    // Handle invalid or expired token
    return next(new AppError("Invalid or expired token", 400));
  }
});
exports.login = asyncCatcher(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  createSendToken(user, 200, res);
});

exports.protect = asyncCatcher(async (req, res, next) => {
  ///GET THE TOKEN AND CHECK IF IT'S EXICT
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError("you are unlogged pelase login to get that", 401));
  }

  /// VERIFICATION THE TOKEN IF IT'S VALID
  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // console.log(decode);

  const currentUser = await User.findById(decode.id);
  if (!currentUser) {
    return next(
      new AppError("the user belonging to this token has no longer exist.", 401)
    );
  }
  //CHECK IF THE USER DIDN'T CHANGE HIS PASSWORD
  console.log(decode.iat);
  if (currentUser.passwordChangedAfter(decode.iat)) {
    return next(new AppError("please relogin the password changed", 401));
  }

  req.user = currentUser;
  next();
});

exports.signOut = asyncCatcher(async (req, res, next) => {
  // Clear the JWT cookie
  res.clearCookie("jwt");

  // Send a success response
  res.status(200).json({ status: "success" });
});

exports.forgotPassword = asyncCatcher(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  console.log("suuuuuuuuuuuuuuuuuuuuuuuuuuui  ");
  if (!user) {
    return next(new AppError("there is no user with this email", 404));
  }
  // generate the random reset token
  const resetToken = user.createPasswordResetToken();
  console.log("wait for saving ");
  await user.save({ validateBeforeSave: false });
  // 3) Send it to user's email
  console.log("befor reset url");
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/users/resetPassword/${resetToken}`;
  console.log("after it");
  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf
     you didn't forget your password, please ignore this email!`;
  console.log("before sending eamil");
  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10 min)",
      message,
    });
    console.log("email sent");
    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError("there was an error sending the mail", 500));
  }
});

exports.resetPassword = asyncCatcher(async (req, res, next) => {
  //1 get user based on the token

  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  ///2 if token has not expired, and there is user , set the new password
  if (!user) {
    return next(new AppError("token is ivailed or expired", 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  ///3 update changedpasswordAt property for the user

  ///4 log the user in , send jwt
  createSendToken(user, 200, res);
});
