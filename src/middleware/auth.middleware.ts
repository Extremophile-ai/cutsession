import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Request, Response, NextFunction } from "express";
import { IRequest } from "../interface/IRequest.interface";

dotenv.config();

export default class Authentication {
	static async authenticate(req: IRequest, res: Response, next: NextFunction) {
		try {
			const { authorization } = req.headers;
			let decoded: any;

			if (authorization) {
				try {
					const token = authorization.split(" ")[1];
					decoded = jwt.verify(token, process.env.JWT_SECRET as string);
				} catch (error) {
					return res.status(410).json({
						error: true,
						message: "Session expired, you have to login.",
					});
				}

				req.decoded = decoded;
				return next();
			}
			return res.status(401).json({
				error: true,
				message: "Sorry, you have to login.",
			});
		} catch (error) {
			return res.status(500).json({
				error: true,
				message: "Server Error",
			});
		}
	}

	

	// static async authorize(req: Request, res: Response, next: NextFunction) {
	// 	if (
	// 		req.headers["x-api-key"] &&
	// 		req.headers["x-api-key"] === process.env.API_KEY
	// 	) {
	// 		return next();
	// 	}
	// 	res.status(403).send({ message: "Access denied" });
	// }
}
