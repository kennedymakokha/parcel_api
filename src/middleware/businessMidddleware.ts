import { Request, Response, NextFunction } from "express";

interface TenantRequest extends Request {
  business?: string;
}

export const tenantMiddleware = (
  req: TenantRequest,
  res: Response,
  next: NextFunction
) => {
  const business = req.headers["x-business-id"];

  if (!business) {
    return res.status(400).json({ message: "business ID missing" });
  }

  req.business = business as string;
  next();
};