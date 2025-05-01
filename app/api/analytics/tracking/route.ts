import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  console.log("API route hit: GET /api/analytics/tracking");
  
  try {
    // Get query parameters
    const url = new URL(req.url);
    const startDate = url.searchParams.get("start_date");
    const endDate = url.searchParams.get("end_date");
    const deviceId = url.searchParams.get("device_id");
    
    console.log("Query params:", { startDate, endDate, deviceId });
    
    // Validate required parameters
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "start_date and end_date are required query parameters" },
        { status: 400 }
      );
    }
    
    // Start building the query
    let query = supabase
      .from("tracking_data")
      .select("*");
    
    // We need to be careful about date comparison with timestamp fields
    // Convert ISO strings to proper timestamp format if needed
    try {
      // Add date range filters
      query = query
        .gte("timestamp", startDate)
        .lte("timestamp", endDate);
      
      // Add device filter if provided
      if (deviceId) {
        query = query.eq("device_id", deviceId);
      }
      
      // Execute the query
      const { data, error } = await query.order("timestamp", { ascending: false });
      
      if (error) {
        console.error("Error fetching tracking data:", error);
        return NextResponse.json(
          { error: "Error fetching tracking data: " + error.message },
          { status: 500 }
        );
      }
      
      console.log(`Successfully fetched ${data?.length || 0} tracking records`);
      
      // If querying for a specific device, return a simple array
      if (deviceId) {
        return NextResponse.json({ data: { [deviceId]: data || [] } });
      }
      
      // For all devices, group by device_id
      const groupedData: { [deviceId: string]: any[] } = {};
      
      data?.forEach(item => {
        const deviceId = item.device_id.toString();
        if (!groupedData[deviceId]) {
          groupedData[deviceId] = [];
        }
        groupedData[deviceId].push(item);
      });
      
      return NextResponse.json({ data: groupedData });
    } catch (queryError) {
      console.error("Error in query execution:", queryError);
      return NextResponse.json(
        { error: "Database query error: " + (queryError instanceof Error ? queryError.message : "Unknown error") },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error("Unexpected error in analytics tracking API:", err);
    return NextResponse.json(
      { error: "Unexpected error: " + (err instanceof Error ? err.message : "Unknown error") },
      { status: 500 }
    );
  }
}