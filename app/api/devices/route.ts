import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    console.log("API route hit: /api/devices");
    
    try {
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
        
        // Calculate stats
        const totalDevices = data.length;
        const availableDevices = data.filter(device => !device.isactive).length;
        
        const response = {
            totalDevices,
            availableDevices,
            devices: data,
        };
        
        return NextResponse.json(response, { status: 200 });
    } catch (error) {
        console.error("Unexpected error:", error);
        return NextResponse.json(
            { error: "Unexpected error in Device Getting" },
            { status: 500 }
        );
    }
}