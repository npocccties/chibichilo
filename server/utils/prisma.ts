import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import { addMinutes } from "date-fns";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });
const sessionStore = new PrismaSessionStore(prisma, {
  checkPeriod: addMinutes(new Date(0), 2).getTime(),
  dbRecordIdIsSessionId: true,
});

export { sessionStore };
export default prisma;
