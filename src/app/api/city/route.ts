import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { readFile } from "fs/promises";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { country_code, states_code } = data;

    // Try to load cities.json dynamically (it may not exist in Docker builds)
    const citiesPath = path.join(process.cwd(), "src", "utility", "json", "cities.json");
    
    let Cities: any[] = [];
    try {
      const fileContent = await readFile(citiesPath, "utf-8");
      Cities = JSON.parse(fileContent);
    } catch {
      // File doesn't exist (e.g., Docker build without cities.json)
      return NextResponse.json([]);
    }

    const returnData = Cities.filter(
      (city: any) =>
        city.country_code == country_code && city.state_code == states_code
    );

    return NextResponse.json(returnData);
  } catch {
    return NextResponse.json([]);
  }
}
