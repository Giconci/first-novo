import { zodToJsonSchema } from "zod-to-json-schema";
import { registerSchema } from "@/schemas/registerSchema";

export const registerJsonSchema = zodToJsonSchema(
  registerSchema as any,
  {
    name: "Register"
  }
);
