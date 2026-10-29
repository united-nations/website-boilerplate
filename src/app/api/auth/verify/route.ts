import { verifyMagicToken } from "@/features/auth/commands";
export async function POST(request: Request) {
  try {
    const { token, entity } = await request.json();
    const result = await verifyMagicToken(token, entity);
    return Response.json(result, { status: result.success ? 200 : 400 });
  } catch {
    return Response.json(
      { success: false, error: "Could not complete sign-in." },
      { status: 400 },
    );
  }
}
