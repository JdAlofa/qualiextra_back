
import { User } from "@prisma/client";
// user type from Prisma, excluding the password field.
export default interface UserResponse extends Omit<User, "password"> {}