import { createTransport, Transporter } from "nodemailer";
import path from "path";
import fs from "fs/promises";
import handlebars from "handlebars";
import { MAIL_PASS, MAIL_USER } from "../../config/env.js";

export class MailService {
  transporter: Transporter;

  constructor() {
    this.transporter = createTransport({
      service: "gmail",
      auth: {
        user: MAIL_USER,
        pass: MAIL_PASS,
      },
    });
  }

  // private renderTemplate = async (templateName: string, context: object) => {
  //   const templateDir = path.resolve(__dirname, "./templates");
  //   const templatePath = path.join(templateDir, `${templateName}.hbs`);
  //   const templateSource = await fs.readFile(templatePath, "utf-8");
  //   const compiledTemplate = handlebars.compile(templateSource);
  //   return compiledTemplate(context);
  // };

  private renderTemplate = async (templateName: string, context: object) => {
    const templatePath = path.join(
      process.cwd(),
      "src",
      "modules",
      "mail",
      "templates",
      `${templateName}.hbs`,
    );

    const templateSource = await fs.readFile(templatePath, "utf-8");
    const compiledTemplate = handlebars.compile(templateSource);

    return compiledTemplate(context);
  };

  sendEmail = async (
    to: string,
    subject: string,
    templateName: string,
    context: object,
  ) => {
    const html = await this.renderTemplate(templateName, context);

    await this.transporter.sendMail({
      to,
      subject,
      html,
    });
  };
}
