import {
  Controller,
  Get,
  Request,
  Route,
  Security,
  Tags,
  Response,
} from "tsoa";
import prisma from "../lib/prisma";
import { AuthenticatedRequest } from "../lib/auth";

@Route("private")
@Tags("Private")
@Security("jwt")
export class PrivateController extends Controller {
  @Get()
  @Response(200, "Success")
  @Response(404, "Not Found")
  public async getPrivateMessage(
    @Request() req: AuthenticatedRequest
  ): Promise<{ message: string }> {
    if (!req.user) {
      this.setStatus(401);
      return { message: "Unauthorized" };
    }
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    if (!user) {
      this.setStatus(404);
      // This is a bit of an edge case, since the user ID comes from a valid token,
      // but the user might have been deleted from the DB since the token was issued.
      return { message: "User not found" };
    }

    return { message: `Hello ${user.firstName}` };
  }
}
