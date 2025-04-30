import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { device_id, timestamp, temperature, humidity, lat, lon } = body;

    if (!device_id || !timestamp) {
      return NextResponse.json({ error: "device_id and timestamp are required." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("tracking_data")
      .insert([{ device_id, timestamp, temperature, humidity, lat, lon }]);

    if (error) {
      console.error(error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Data inserted", data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
    // http://localhost:3000/api/tracking?device_id=12345
  const device_id = req.nextUrl.searchParams.get("device_id");

  if (!device_id) {
    return NextResponse.json({ error: "device_id is required as a query param" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("tracking_data")
    .select("*")
    .eq("device_id", device_id)
    .order("timestamp", { ascending: false });

  if (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
