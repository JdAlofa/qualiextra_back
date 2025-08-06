import {
  Controller,
  Post,
  Route,
  Body,
  Tags,
  Response,
  Get,
  Path,
  Query,
} from "tsoa";
import prisma from "../lib/prisma";
import bcrypt from "bcryptjs";
import disposableEmailDomains from "disposable-email-domains";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import UserCreationRequestBody from "../lib/requests_bodies/UserCreationRequestBody";
import LoginRequestBody from "../lib/requests_bodies/LoginRequestBody";

const JWT_SECRET =
  process.env.JWT_SECRET || "fallback-secret-key-that-should-be-really-hard-to-guess";

@Route("auth")
@Tags("Authentication")
export class AuthController extends Controller {
  @Post("register")
  @Response(201, "Created")
  @Response(400, "Bad Request")
  public async register(
    @Body() body: UserCreationRequestBody
  ): Promise<{ message: string }> {
    const { firstName, lastName, email, password } = body;

    // blocking the disposable email addresses
    const domain = email.split("@")[1];
    if (disposableEmailDomains.includes(domain)) {
      this.setStatus(400);
      return { message: "Temporary email addresses are not allowed." };
    }

    // checking if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      this.setStatus(400);
      return { message: "User with this email already exists." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // genereating verification token
    const token = crypto.randomBytes(32).toString("hex");
    const verificationToken = {
      token,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };

    try {
      await prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          password: hashedPassword,
          verificationToken: {
            create: verificationToken,
          },
        },
      });

      console.log(`Verification token for ${email}: ${token}`);

      this.setStatus(201);
      return {
        message: "User created successfully. Please verify your email.",
      };
    } catch (error) {
      this.setStatus(500);
      return { message: "Internal Server Error" };
    }
  }

  @Post("login")
  @Response(200, "Success")
  @Response(400, "Bad Request")
  @Response(401, "Unauthorized")
  public async login(
    @Body() body: LoginRequestBody
  ): Promise<{ loginJWT: string } | { message: string }> {
    const { email, password } = body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      this.setStatus(401);
      return { message: "Invalid email or password." };
    }

    if (!user.emailVerified) {
      this.setStatus(401);
      return { message: "Email not verified. Please check your inbox." };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      this.setStatus(401);
      return { message: "Invalid email or password." };
    }

    const loginJWT = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: "2h",
    });

    return { loginJWT };
  }

  @Get("verify-email")
  @Response(200, "Success")
  @Response(400, "Bad Request")
  public async verifyEmail(
    @Query() token: string
  ): Promise<{ message: string }> {
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verificationToken) {
      this.setStatus(400);
      return { message: "Invalid verification token." };
    }

    if (new Date() > verificationToken.expires) {
      this.setStatus(400);
      return { message: "Verification token has expired." };
    }

    await prisma.user.update({
      where: { id: verificationToken.userId },
      data: { emailVerified: true },
    });

    await prisma.verificationToken.delete({
      where: { id: verificationToken.id },
    });

    return { message: "Email verified successfully. You can now log in." };
  }
}
