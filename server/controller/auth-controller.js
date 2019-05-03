const { validationResult } = require("express-validator/check");
const { UserModel } = require("../models/user");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.AuthController = class AuthController {
	async signin(req, res, next) {
		try {
			const { email, password } = req.body;

			const user = await UserModel.findOne({ email });

			if (!user) {
				const userNotFoundError = new Error("User not found");
				userNotFoundError.statusCode = 404;
				userNotFoundError.messages = ["user not found"];
				return next(userNotFoundError);
			}
			const passwordIsGood = await bcryptjs.compare(password, user.password);
			if (!passwordIsGood) {
				const invalidPasswordError = new Error("Invalid password");
				invalidPasswordError.statusCode = 500;
				invalidPasswordError.messages = ["invalid password"];
				return next(invalidPasswordError);
			}
			const token = jwt.sign(
				{ name: user.name, id: String(user._id) },
				"some-key",
				{ expiresIn: "1h" }
			);
			res.status(200).json({ name: user.name, token });
			return;
		} catch (e) {
			e.statusCode = 500;
			next(e);
			return e;
		}
	}

	async signup(req, res, next) {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			const validationErrors = new Error();
			validationErrors.messages = errors.array().map(m => m.msg);
			validationErrors.statusCode = 400;
			return next(validationErrors);
		}
		const { email, password, name } = req.body;
		const user = await UserModel.findOne({ email });
		if (user) {
			const userExistsError = new Error("Email address is registered already");
			userExistsError.statusCode = 400;
			userExistsError.messages = ["Email address is already reigstered."];
			return next(userExistsError);
		}
		const hashedPassword = await bcryptjs.hash(password, 12);
		const newUser = new UserModel({
			name,
			password: hashedPassword,
			email,
			status: "in-active"
		});

		await newUser.save();
		res.status(200).json({ message: "user created", id: user._id });
		return;
	}
};
