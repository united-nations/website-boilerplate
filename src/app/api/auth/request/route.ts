import { requestMagicLink } from "@/features/auth/commands";
export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    const result = await requestMagicLink(email);
    return Response.json(result, { status: result.success ? 200 : 400 });
  } catch {
    return Response.json(
      { success: false, error: "Could not process request." },
      { status: 400 },
    );
  }
}
