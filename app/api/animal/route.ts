import { NextRequest,NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request:NextRequest)
{
    try {
        const body = await request.json();
        console.log("Received animal data:");
        console.log(body);

        const {data:dataFromDB,error:errorFromDB} = await supabase.from("animals").insert([]).select("*");

        if (errorFromDB) {
            console.error("Error inserting data:", errorFromDB);
            return NextResponse.json({error:"Something went wrong while storing animal data!"});
        }

        console.log("Data inserted successfully:", dataFromDB);

        return NextResponse.json({message:"Animal data stored successfully!"},{status:200});        
    } catch (error) {
        console.error(error);
        return NextResponse.json({error:"Something went wrong while storing animal data!"},{status:500});
    }
}   


