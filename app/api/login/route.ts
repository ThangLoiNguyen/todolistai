import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { token } = await req.json();

  const response = NextResponse.json({ success: true });
  response.cookies.set("firebase-token", token, {
    httpOnly: true,
    secure: true,
    path: "/",
  });
  return response;
}
