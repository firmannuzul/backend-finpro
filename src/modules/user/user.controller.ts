import { Request, Response } from "express";
import { UserService } from "./user.service.js";
import { plainToInstance } from "class-transformer";
import { PaginationQueryParams } from "../pagination/dto/pagination.dto.js";

export class UserController {
  constructor(private userService: UserService) {}

  updateProfile = async (req: Request, res: Response) => {
    const userId = res.locals.user.id;
    const body = req.body;

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

  updateCompanyProfile = async (req: Request, res: Response) => {
    const userId = res.locals.user.id;
    const body = req.body;

    const files = req.files as {
      photo?: Express.Multer.File[];
    };

    const filePhoto = files?.photo?.[0];
    const result = await this.userService.updateCompanyProfile(
      userId,
      body,
      filePhoto,
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

  getProfileCompany = async (req: Request, res: Response) => {
    const userId = res.locals.user.id;

    const profile = await this.userService.getProfileCompany(userId);

    res.status(200).send(profile);
  };

  getMyProfile = async (req: Request, res: Response) => {
    const userId = res.locals.user.id;

    const profile = await this.userService.getMyProfile(userId);

    res.status(200).send(profile);
  };

  getCompanies = async (req: Request, res: Response) => {
    const result = await this.userService.getCompanies();
    res.status(200).send(result);
  };

  getCompanie = async (req: Request, res: Response) => {
    const query = plainToInstance(PaginationQueryParams, req.query);
    const result = await this.userService.getCompanie(query);
    res.status(200).send(result);
  };
}
