import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import { getProfileProcedure } from "./routes/profile/get-profile/route";
import { updateProfileProcedure } from "./routes/profile/update-profile/route";
import { getWorkoutsProcedure } from "./routes/workouts/get-workouts/route";
import { createWorkoutProcedure } from "./routes/workouts/create-workout/route";
import { getNutritionLogsProcedure } from "./routes/nutrition/get-nutrition-logs/route";
import { createNutritionLogProcedure } from "./routes/nutrition/create-nutrition-log/route";
import { getUserContextProcedure } from "./routes/chat/get-user-context/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  profile: createTRPCRouter({
    get: getProfileProcedure,
    update: updateProfileProcedure,
  }),
  workouts: createTRPCRouter({
    list: getWorkoutsProcedure,
    create: createWorkoutProcedure,
  }),
  nutrition: createTRPCRouter({
    logs: getNutritionLogsProcedure,
    create: createNutritionLogProcedure,
  }),
  chat: createTRPCRouter({
    getUserContext: getUserContextProcedure,
  }),
});

export type AppRouter = typeof appRouter;