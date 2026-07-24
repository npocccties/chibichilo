import { PrismaClient } from "@prisma/client";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import addMinutes from "date-fns/addMinutes";

const prisma = new PrismaClient();
const sessionStore = new PrismaSessionStore(prisma, {
  checkPeriod: addMinutes(0, 2).getTime(),
  dbRecordIdIsSessionId: true,
});

export { sessionStore };
export default prisma;
