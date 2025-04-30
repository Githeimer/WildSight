import { supabase } from "@/lib/supabase";
import { NextRequest } from "next/server";


export async function GET(req:NextRequest)
{
    try {  

        const { data, error } = await supabase
            .from("devices")
            .select("*")
            .eq("isActive", false); 


        if (error) {
            console.error("Error fetching device data:", error);
            return new Response("Error fetching device data", { status: 500 });
        }

        return new Response(JSON.stringify(data), { status: 200 });
    } catch (error) {
        console.error("Unexpected error:", error);
        return new Response("Unexpected error in Device Getting", { status: 500 });
    }
}