import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
    console.log("API route hit: /api/animals/all");
    
    try {
        // Log that we're attempting to connect to Supabase
        console.log("Attempting to fetch animals from Supabase...");
        
        const { data: dataFromDB, error: errorFromDB } = await supabase
            .from("animals")
            .select("*");
        
        if (errorFromDB) {
            console.error("Supabase error fetching animals:", errorFromDB);
            return NextResponse.json(
                { error: "Database error: " + errorFromDB.message },
                { status: 400 }
            );
        }
        
        if (!dataFromDB || dataFromDB.length === 0) {
            console.log("No animals found in database");
            // Return empty array instead of error - this is not an error condition
            return NextResponse.json([], { status: 200 });
        }
        
        console.log(`Successfully fetched ${dataFromDB.length} animals from database`);
        
        return NextResponse.json(dataFromDB, { status: 200 });
    } catch (error) {
        // Log the actual error object for debugging
        console.error("Unexpected error in API route:", error);
        
        return NextResponse.json(
            { error: "Server error: " + (error instanceof Error ? error.message : "Unknown error") },
            { status: 500 }
        );
    }
}