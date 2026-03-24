import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

export async function POST() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;

  if (sessionToken) {
    await prisma.session.deleteMany({ where: { sessionToken } });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.delete("session");
  return response;
}
