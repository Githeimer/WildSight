import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request:NextRequest)
{
    try {
        const {data:dataFromDB,error:errorFromDB} = await supabase.from("animals").select("*");

        if (errorFromDB) {
            console.error("Error fetching data:", errorFromDB);
            return NextResponse.json({error:"Something went wrong while fetching animal data!"});
        }

        console.log("Data fetched successfully:", dataFromDB);

        return NextResponse.json(dataFromDB,{status:200});        
    } catch (error) {
        console.error(error);
        return NextResponse.json({error:"Something went wrong while fetching animal data!"},{status:500});
    }
}

