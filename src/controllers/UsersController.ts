import {
  Controller,
  Get,
  Route,
} from "tsoa";

import { User } from "@prisma/client";
import prisma from "../lib/prisma";

export type UserResponse = Omit<User,'password'>;

@Route("users")
export class UsersController extends Controller {
  @Get()
  public async getUsers(): Promise<UserResponse[]> {
    const users= await prisma.user.findMany();
    return users.map(({ password, ...user }) => user);
  }
}