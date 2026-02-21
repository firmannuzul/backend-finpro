import { NextFunction, Request, Response } from "express";
import { AuthService } from "./auth.service.js";

export class AuthController {
  constructor(private authService: AuthService) {}

  register = async (req: Request, res: Response) => {
    const result = await this.authService.register(req.body);
    res.status(200).send(result);
  };

  registerAdmin = async (req: Request, res: Response) => {
    const result = await this.authService.registerAdmin(req.body);
    res.status(200).send(result);
  };

  login = async (req: Request, res: Response) => {
    const result = await this.authService.login(req.body);
    res.status(200).send(result);
  };

  google = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.googleService(req.body.accessToken);
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };

  forgotPassword = async (req: Request, res: Response) => {
    const result = await this.authService.forgotPassword(req.body);
    res.status(200).send(result);
  };

  resetPassword = async (req: Request, res: Response) => {
    const authUserId = Number(res.locals.user.id);
    const result = await this.authService.resetPassword(req.body, authUserId);
    res.status(200).send(result);
  };
}
