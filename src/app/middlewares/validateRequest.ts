import type { NextFunction, Request, Response } from "express";
import type { z } from "zod";

export function validateRequest(schema: z.ZodObject) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const result = await schema.safeParseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
      cookies: req.cookies,
    });

    if (!result.success) {
      next(result.error);
      return;
    }

    req.body = result.data.body ?? req.body;
    next();
  };
}
