import { Router } from "express";
import { ValidationMiddleware } from "../../middlewares/validation.middleware.js";

import { UserController } from "./user.controller.js";
import { JwtMiddleware } from "../../middlewares/jwt.middleware.js";
import { UpdateProfileDTO } from "./dto/update-profile.dto.js";
import { UploaderMiddleware } from "../../middlewares/uploader.middleware.js";
import { ChangePasswordDTO } from "./dto/change-password.dto.js";
import { UpdateCompanyProfileDTO } from "./dto/update-company-profile.dto.js";

export class UserRouter {
  private router: Router;

  constructor(
    private userController: UserController,
    private validationMiddleware: ValidationMiddleware,
    private jwtMiddleware: JwtMiddleware,
    private uploaderMiddleware = new UploaderMiddleware(),
  ) {
    this.router = Router();
    this.initializedRoutes();
  }

  private initializedRoutes = () => {
    this.router.patch(
      "/updateprofile",
      this.jwtMiddleware.verifyToken(process.env.JWT_SECRET!),

      this.uploaderMiddleware.upload().fields([
        { name: "photo", maxCount: 1 },
        { name: "cv", maxCount: 1 },
      ]),
      this.validationMiddleware.validateBody(UpdateProfileDTO),

      this.userController.updateProfile,
    );

    this.router.patch(
      "/updateprofile/companyprofile",
      this.jwtMiddleware.verifyToken(process.env.JWT_SECRET!),

      this.uploaderMiddleware.upload().fields([{ name: "photo", maxCount: 1 }]),
      this.validationMiddleware.validateBody(UpdateCompanyProfileDTO),

      this.userController.updateCompanyProfile,
    );

    this.router.patch(
      "/updateprofile/change-password",
      this.jwtMiddleware.verifyToken(process.env.JWT_SECRET!),
      this.validationMiddleware.validateBody(ChangePasswordDTO),
      this.userController.changePassword,
    );

    this.router.get(
      "/profile",
      this.jwtMiddleware.verifyToken(process.env.JWT_SECRET!),
      this.userController.getProfile,
    );

    this.router.get(
      "/profile-company",
      this.jwtMiddleware.verifyToken(process.env.JWT_SECRET!),
      this.userController.getProfileCompany,
    );

    this.router.get(
      "/me/profile",
      this.jwtMiddleware.verifyToken(process.env.JWT_SECRET!),
      this.userController.getMyProfile,
    );

    this.router.get("/companies", this.userController.getCompanies);

    this.router.get("/companie", this.userController.getCompanie);
  };

  getRouter = () => {
    return this.router;
  };
}
