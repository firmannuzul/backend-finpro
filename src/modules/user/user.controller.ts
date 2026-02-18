import { Request, Response } from "express";
import { UserService } from "./user.service.js";

export class UserController {
  constructor(private userService: UserService) {}

  updateProfile = async (req: Request, res: Response) => {
    const userId = res.locals.user.id;
    const body = req.body;

    console.log("CONTROLLER BODY:", body);
    console.log("FILES RAW:", req.files);

    console.log("FILES RAW:", req.files); // 👈 TARUH DI SINI

    const files = req.files as {
      photo?: Express.Multer.File[];
      cv?: Express.Multer.File[];
    };

    const filePhoto = files?.photo?.[0];
    const fileCV = files?.cv?.[0];
    const result = await this.userService.updateProfile(
      userId,
      body,
      filePhoto,
      fileCV,
    );
    res.status(200).send(result);
  };

  changePassword = async (req: Request, res: Response) => {
    const userId = res.locals.user.id;
    const { currentPassword, newPassword } = req.body;

    const result = await this.userService.changePassword(
      userId,
      currentPassword,
      newPassword,
    );

    return res.status(200).send(result);
  };

  getProfile = async (req: Request, res: Response) => {
    const userId = res.locals.user.id;

    const profile = await this.userService.getProfile(userId);

    res.status(200).send(profile);
  };
}
