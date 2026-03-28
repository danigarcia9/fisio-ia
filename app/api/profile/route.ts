import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import {
  CreateProfileRequestSchema,
  UpdateProfileRequestSchema,
} from "@/lib/schemas/profile";

// GET — Fetch the first professional profile (Phase 0: single user)
export async function GET() {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("professional_profiles")
    .select("*")
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") {
    return NextResponse.json(
      { error: "Failed to fetch profile", details: error.message },
      { status: 500 }
    );
  }

  if (!data) {
    return NextResponse.json({ profile: null });
  }

  return NextResponse.json({ profile: data });
}

// POST — Create a new professional profile
export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = CreateProfileRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("professional_profiles")
    .insert({
      name: parsed.data.name,
      email: parsed.data.email ?? null,
      contexts: parsed.data.contexts,
      active_context_id: parsed.data.activeContextId,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Failed to create profile", details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ profile: data }, { status: 201 });
}

// PATCH — Update an existing professional profile
export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const parsed = UpdateProfileRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const supabase = createServiceClient();

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (parsed.data.name) updateData.name = parsed.data.name;
  if (parsed.data.email !== undefined) updateData.email = parsed.data.email;
  if (parsed.data.contexts) updateData.contexts = parsed.data.contexts;
  if (parsed.data.activeContextId)
    updateData.active_context_id = parsed.data.activeContextId;

  const { data, error } = await supabase
    .from("professional_profiles")
    .update(updateData)
    .eq("id", parsed.data.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Failed to update profile", details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ profile: data });
}
