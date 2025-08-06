import {
  Controller,
  Get,
  Route,
  Path,
  Put,
  Delete,
  Body,
  Response,
  Tags,
  Security,
  Request,
} from "tsoa";
import prisma from "../lib/prisma";
import bcrypt from "bcryptjs";
import UserUpdateRequestBody from "../lib/requests_bodies/UserUpdateRequestBody";
import UserResponse from "../lib/requests_bodies/UserResponse";
import { AuthenticatedRequest } from "../lib/auth";

@Route("users")
@Tags("Users")
@Security("jwt")
export class UsersController extends Controller {
  @Security("jwt", ["Admin"])
  @Get()
  @Response(200, "Success")
  public async getUsers(): Promise<UserResponse[]> {
    const users = await prisma.user.findMany();
    return users.map(({ password, ...user }) => user);
  }

  @Get("{userId}")
  @Response(200, "Success")
  @Response(404, "Not Found")
  @Response(403, "Forbidden")
  public async getUser(
    @Path() userId: string,
    @Request() req: AuthenticatedRequest
  ): Promise<UserResponse> {
    if (
      !req.user ||
      (req.user.role.toUpperCase() !== "ADMIN" && req.user.id !== userId)
    ) {
      this.setStatus(403);
      throw new Error("Forbidden");
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      this.setStatus(404);
      throw new Error("User not found");
    }
    //returns new user obj w/o password
    const { password, ...userResponse } = user;
    return userResponse;
  }

  @Put("{userId}")
  @Response(200, "Success")
  @Response(404, "Not Found")
  @Response(403, "Forbidden")
  public async updateUser(
    @Path() userId: string,
    @Body() body: UserUpdateRequestBody,
    @Request() req: AuthenticatedRequest
  ): Promise<UserResponse> {
    if (
      !req.user ||
      (req.user.role.toUpperCase() !== "ADMIN" && req.user.id !== userId)
    ) {
      this.setStatus(403);
      throw new Error("Forbidden");
    }

    const { firstName, lastName, password } = body;

    let hashedPassword;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          // Conditionally include fields in the update data only if they were provided.
          // This prevents accidentally overwriting existing fields with null or undefined.
          ...(firstName && { firstName }),
          ...(lastName && { lastName }),
          ...(hashedPassword && { password: hashedPassword }),
        },
      });

      const { password, ...userResponse } = updatedUser;
      return userResponse;
    } catch (error) {
      this.setStatus(404);
      throw new Error("User not found");
    }
  }

  @Security("jwt", ["Admin"])
  @Delete("{userId}")
  @Response(204, "No Content")
  @Response(404, "Not Found")
  public async deleteUser(@Path() userId: string): Promise<void> {
    try {
      await prisma.user.delete({ where: { id: userId } });
      this.setStatus(204);
      return;
    } catch (error) {
      this.setStatus(404);
      throw new Error("User not found");
    }
  }
}
