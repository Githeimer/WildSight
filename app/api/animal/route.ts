import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Define the Animal interface to match our form data structure
interface Animal {
  tag_id: string;
  species: string;
  birth_date: string | null;
  sex: string | null;
  weight: number | null;
  notes: string | null;
  device_id: string | null;
}

// GET handler to fetch all animals
export async function GET(request: NextRequest) {
    console.log("API route hit: GET /api/animal");
    
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

// POST handler to create a new animal
export async function POST(request: NextRequest) {
  console.log("API route hit: POST /api/animal");
  
  try {
    // Parse the request body
    const body = await request.json() as Animal;
    console.log("Received animal data:", body);
    
    // Validate required fields
    if (!body.tag_id || !body.species) {
      return NextResponse.json(
        { error: "Tag ID and species are required fields" },
        { status: 400 }
      );
    }
    
    // Insert data into Supabase
    const { data: dataFromDB, error: errorFromDB } = await supabase
      .from("animals")
      .insert([
        {
          tag_id: body.tag_id,
          species: body.species,
          birth_date: body.birth_date || null,
          sex: body.sex || null,
          weight: body.weight || null,
          notes: body.notes || null,
          device_id: body.device_id
        }
      ])
      .select("*");
    
    if (errorFromDB) {
      // Handle database errors
      console.error("Error inserting animal data:", errorFromDB);
      
      // Handle unique constraint violation
      if (errorFromDB.code === '23505') {
        return NextResponse.json(
          { error: "An animal with this Tag ID already exists" },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { error: "Something went wrong while storing animal data!" },
        { status: 500 }
      );
    }
    
    // If device_id is provided, update the device's isActive status
    if (body.device_id) {
      try {
        // Check if the column exists before updating
        const { data: columnInfo } = await supabase
          .from('devices')
          .select('*')
          .limit(1);
        
        // If isActive exists as a column
        if (columnInfo && columnInfo.length > 0 && 'isactive' in columnInfo[0]) {
          const { data: deviceData, error: deviceError } = await supabase
            .from("devices")
            .update({ isactive: true })
            .eq("id", body.device_id)
            .select("*");
          
          if (deviceError) {
            console.error("Error updating device data:", deviceError);
            // We'll continue even if this fails
          } else {
            console.log("Successfully updated device active status");
          }
        } else {
          console.log("isactive column not found in devices table, skipping update");
        }
      } catch (deviceUpdateError) {
        console.error("Error during device update:", deviceUpdateError);
        // Continue even if device update fails
      }
    }
    
    console.log("Animal data inserted successfully:", dataFromDB);
    
    return NextResponse.json(
      {
        message: "Animal data stored successfully!",
        animal: dataFromDB[0]
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Something went wrong while storing animal data!" },
      { status: 500 }
    );
  }
}