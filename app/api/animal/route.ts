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

export async function POST(request: NextRequest) {
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
      console.error("Error inserting data:", errorFromDB);
      
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

    const { data: deviceData, error: deviceError } = await supabase.from("devices").update({isActive:true}).eq("id", body.device_id).select("*");
    if (deviceError) {
      console.error("Error updating device data:", deviceError);
      return NextResponse.json(
        { error: "Something went wrong while updating device data!" },
        { status: 500 }
      );
    }
    

    console.log("Data inserted successfully:", dataFromDB);

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