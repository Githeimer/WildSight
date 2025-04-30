import { supabase } from "@/lib/supabase";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const { data, error } = await supabase
            .from("devices")
            .select("*");

        if (error) {
            console.error("Error fetching device data:", error);
            return new Response("Error fetching device data", { status: 500 });
        }

        const totalDevices = data.length;
        const availableDevices = data.filter(device => !device.isActive).length;

        const response = {
            totalDevices,
            availableDevices,
            devices: data,
        };

        return new Response(JSON.stringify(response), { status: 200 });
    } catch (error) {
        console.error("Unexpected error:", error);
        return new Response("Unexpected error in Device Getting", { status: 500 });
    }
}