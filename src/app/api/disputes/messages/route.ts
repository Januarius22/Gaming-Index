import { NextResponse } from "next/server";
import { submitDisputeMessage } from "@/actions/disputes";

export async function POST(request: Request) {
  const formData = await request.formData();
  const result = await submitDisputeMessage(formData);

  return NextResponse.json(result, {
    status: result.status === "error" ? 400 : 200
  });
}
