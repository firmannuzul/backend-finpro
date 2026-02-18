import { PrismaClient } from "../../../generated/prisma/client.js";
import { ApiError } from "../../utils/api-error.js";
import { comparePassword, hashPassword } from "../../utils/password.js";
import { CloudinaryService } from "../cloudinary/cloudinary.service.js";
import { UpdateProfileDTO } from "./dto/update-profile.dto.js";

export class UserService {
  constructor(
    private prisma: PrismaClient,
    private cloudinaryService: CloudinaryService,
  ) {}

  // updateProfile = async (
  //   userId: number,
  //   body: UpdateProfileDTO,
  //   photoPath?: Express.Multer.File,
  //   cvResumePath?: Express.Multer.File,
  // ) => {
  //   let photoUrl: string | undefined;
  //   let cvUrl: string | undefined;

  //   if (photoPath) {
  //     const uploadRes = await this.cloudinaryService.upload(photoPath);
  //     photoUrl = uploadRes.secure_url;
  //   }

  //   // if (cvResumePath) {
  //   //   const uploadRes =
  //   //     await this.cloudinaryService.upload(cvResumePath);
  //   //   cvUrl = uploadRes.secure_url;
  //   // }

  //   if (cvResumePath) {
  //     const uploadRes = await this.cloudinaryService.upload(cvResumePath);
  //     cvUrl = uploadRes.secure_url;
  //   }

  //   await this.prisma.applicantProfile.upsert({
  //     where: { userId },
  //     update: {
  //       ...body,
  //       ...(photoUrl && { photoPath: photoUrl }),
  //       ...(cvUrl && { cvResumePath: cvUrl }),
  //       dob: new Date(body.dob),
  //     },
  //     create: {
  //       userId,
  //       ...body,
  //       dob: new Date(body.dob),
  //       photoPath: photoUrl,
  //       cvResumePath: cvUrl,
  //     },
  //   });

  //   return {
  //     message: "Update Profile success",
  //     requestBody: body,
  //     photoUploaded: !!photoUrl,
  //     cvUploaded: !!cvUrl,
  //     photoUrl,
  //     cvUrl,
  //   };
  // };

  updateProfile = async (
    userId: number,
    body: UpdateProfileDTO,
    photoPath?: Express.Multer.File,
    cvResumePath?: Express.Multer.File,
  ) => {
    let photoUrl: string | undefined;
    let cvUrl: string | undefined;

    if (photoPath) {
      const uploadRes = await this.cloudinaryService.upload(photoPath);
      photoUrl = uploadRes.secure_url;
    }

    if (cvResumePath) {
      const uploadRes = await this.cloudinaryService.upload(cvResumePath);
      cvUrl = uploadRes.secure_url;
    }

    const updateData: any = {};

    if (body.name) updateData.name = body.name;
    if (body.gender) updateData.gender = body.gender;
    if (body.phone) updateData.phone = body.phone;
    if (body.address) updateData.address = body.address;
    if (body.lastEducation) updateData.lastEducation = body.lastEducation;

    if (body.dob) {
      const parsed = new Date(body.dob);
      if (!isNaN(parsed.getTime())) {
        updateData.dob = parsed;
      }
    }

    if (photoUrl) updateData.photoPath = photoUrl;
    if (cvUrl) updateData.cvResumePath = cvUrl;

    await this.prisma.applicantProfile.upsert({
      where: { userId },
      update: updateData,
      create: {
        userId,
        ...updateData,
      },
    });

    return {
      message: "Update Profile success",
      updatedFields: Object.keys(updateData),
      photoUploaded: !!photoUrl,
      cvUploaded: !!cvUrl,
    };
  };

  changePassword = async (
    userId: number,
    currentPassword: string,
    newPassword: string,
  ) => {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    if (!user.password) {
      throw new ApiError("User has no password set", 400);
    }

    const isValid = await comparePassword(currentPassword, user.password);
    if (!isValid) {
      throw new ApiError("Current password is incorrect", 400);
    }

    if (currentPassword === newPassword) {
      throw new ApiError("New password must be different", 400);
    }

    const hashed = await hashPassword(newPassword);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });

    return { message: "Password updated successfully" };
  };

  getProfile = async (userId: number) => {
    return this.prisma.applicantProfile.findUnique({
      where: { userId },
    });
  };
}
