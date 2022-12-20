import { Request } from "express";


export interface IRequest extends Request {
	decoded?: {
		email?: string,
		id?: string
	};
	token?: any
}
