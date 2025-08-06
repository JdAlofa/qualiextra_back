import { Request } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "fallback-secret-key-that-should-be-really-hard-to-guess";

export interface AuthenticatedRequest extends Request {
  user?: { id:string; role: string; iat: number; exp: number };
}

export function expressAuthentication(
  request: AuthenticatedRequest,
  securityName: string,
  scopes?: string[]
): Promise<any> {
  if (securityName === "jwt") {
    const token = request.headers.authorization?.split(" ")[1];

    return new Promise((resolve, reject) => {
      if (!token) {
        return reject(new Error("No token provided"));
      }
      jwt.verify(
        token,
        JWT_SECRET,
        (err: any, decoded: any) => {
          if (err) {
            reject(err);
          } else {
            // Check if the user has the required scopes
            if (scopes) {
              const userRoles = [decoded.role.toUpperCase()];
              const hasAllScopes = scopes.every((scope) =>
                userRoles.includes(scope.toUpperCase())
              );
              if (!hasAllScopes) {
                reject(new Error("JWT does not contain required scope."));
              }
            }
            resolve(decoded);
          }
        }
      );
    });
  }
  // Fallback for other security types if any
  return Promise.reject(new Error("No security defined for this route"));
}
