import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    console.log("API route hit: /api/devices/available");
    
    try {
        // Try to handle both cases (isActive and isactive)
        let queryBuilder = supabase
            .from("devices")
            .select("*");
        
        // First check if the column exists by getting schema
        const { data: columnInfo, error: columnError } = await supabase.rpc('get_column_names', { table_name: 'devices' }).catch(() => {
            // If the function doesn't exist, we'll try a simple query instead
            return { data: null, error: new Error("RPC not available") };
        });
        
        // If we couldn't get column info, we'll try both column names
        if (!columnInfo || columnError) {
            console.log("Using fallback approach to check inactive devices");
            
            // Try with isactive (lowercase)
            let { data: data1, error: error1 } = await queryBuilder
                .eq("isactive", false);
            
            if (error1) {
                console.log("First attempt failed, trying with isActive (camelcase)");
                // If that fails, try with isActive (camelcase)
                let { data: data2, error: error2 } = await supabase
                    .from("devices")
                    .select("*")
                    .eq("isActive", false);
                
                if (error2) {
                    console.error("Both attempts failed:", error1, error2);
                    // If both fail, return all devices
                    let { data: allDevices, error: allError } = await supabase
                        .from("devices")
                        .select("*");
                    
                    if (allError) {
                        throw allError;
                    }
                    
                    console.log("Returning all devices as fallback");
                    return NextResponse.json(allDevices, { status: 200 });
                }
                
                console.log(`Successfully fetched ${data2?.length || 0} inactive devices (camelcase)`);
                return NextResponse.json(data2, { status: 200 });
            }
            
            console.log(`Successfully fetched ${data1?.length || 0} inactive devices (lowercase)`);
            return NextResponse.json(data1, { status: 200 });
        } else {
            // We know the column names, use the correct one
            const columns = Array.isArray(columnInfo) ? columnInfo : [];
            const hasIsactive = columns.includes('isactive');
            const hasIsActive = columns.includes('isActive');
            
            if (hasIsactive) {
                const { data, error } = await queryBuilder.eq("isactive", false);
                if (error) throw error;
                console.log(`Successfully fetched ${data?.length || 0} inactive devices (lowercase column)`);
                return NextResponse.json(data, { status: 200 });
            } else if (hasIsActive) {
                const { data, error } = await queryBuilder.eq("isActive", false);
                if (error) throw error;
                console.log(`Successfully fetched ${data?.length || 0} inactive devices (camelcase column)`);
                return NextResponse.json(data, { status: 200 });
            } else {
                // No active column found, return all devices
                const { data, error } = await supabase.from("devices").select("*");
                if (error) throw error;
                console.log(`No active status column found. Returning all ${data?.length || 0} devices`);
                return NextResponse.json(data, { status: 200 });
            }
        }
    } catch (error) {
        console.error("Unexpected error fetching available devices:", error);
        return NextResponse.json(
            { error: "Error fetching available devices" },
            { status: 500 }
        );
    }
}