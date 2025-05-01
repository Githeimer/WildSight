import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    console.log("API route hit: /api/devices");
    
    try {
        // Fetch all devices from the database
        const { data, error } = await supabase
            .from("devices")
            .select("*");
        
        if (error) {
            console.error("Error fetching device data:", error);
            return NextResponse.json(
                { error: "Error fetching device data" }, 
                { status: 500 }
            );
        }
        
        const activeDevices = data.filter(device => device.isactive);
        const availableDevices = data.filter(device => !device.isactive);
        
        // Format the response to include the devices array directly
        return NextResponse.json({
            totalDevices: data.length,
            activeDevices: activeDevices.length,
            availableDevices: availableDevices.length,
            devices: data
        }, { status: 200 });
    } catch (error) {
        console.error("Unexpected error:", error);
        return NextResponse.json(
            { error: "Unexpected error in Device Getting" },
            { status: 500 }
        );
    }
}