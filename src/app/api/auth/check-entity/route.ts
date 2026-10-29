import { checkEntityForToken } from "@/features/auth/commands";
export async function POST(request: Request) {
  try {
    const { token } = await request.json();
    const result = await checkEntityForToken(token);
    return Response.json(result, { status: result.success ? 200 : 400 });
  } catch {
    return Response.json(
      { success: false, error: "Could not check link." },
      { status: 400 },
    );
  }
}
