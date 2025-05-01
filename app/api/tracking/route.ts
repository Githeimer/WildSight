import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  console.log("API route hit: POST /api/tracking");
  
  try {
    const body = await req.json();
    const { device_id, timestamp, temperature, humidity, lat, lon } = body;
    
    console.log("Received tracking data:", { device_id, timestamp, temperature, humidity, lat, lon });
    
    if (!device_id || !timestamp) {
      return NextResponse.json({ error: "device_id and timestamp are required." }, { status: 400 });
    }
    
    const { data, error } = await supabase
      .from("tracking_data")
      .insert([{ device_id, timestamp, temperature, humidity, lat, lon }]);
    
    if (error) {
      console.error("Error inserting tracking data:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Try to refresh the materialized view
    try {
      await supabase.rpc('refresh_latest_positions');
      console.log("Successfully refreshed latest positions view");
    } catch (viewError) {
      console.warn("Error refreshing latest positions view:", viewError);
      // Continue even if view refresh fails
    }
    
    console.log("Successfully inserted tracking data");
    return NextResponse.json({ message: "Data inserted", data });
  } catch (err) {
    console.error("Unexpected error in tracking POST route:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" }, 
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  console.log("API route hit: GET /api/tracking");
  
  // http://localhost:3000/api/tracking?device_id=12345
  const device_id = req.nextUrl.searchParams.get("device_id");
  
  if (!device_id) {
    return NextResponse.json({ error: "device_id is required as a query param" }, { status: 400 });
  }
  
  console.log("Fetching tracking data for device_id:", device_id);
  
  try {
    const { data, error } = await supabase
      .from("tracking_data")
      .select("*")
      .eq("device_id", device_id)
      .order("timestamp", { ascending: false });
    
    if (error) {
      console.error("Error fetching tracking data:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    console.log(`Successfully fetched ${data?.length || 0} tracking records`);
    return NextResponse.json({ data });
  } catch (err) {
    console.error("Unexpected error in tracking GET route:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" }, 
      { status: 500 }
    );
  }
}