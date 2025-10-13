import { api } from "convex/_generated/api";
import { FunctionReturnType } from "convex/server";

export type ChalkboardItem = FunctionReturnType<
  typeof api.chalkboard.getPersonalChalkboard
>[number];
