import { NextResponse } from "next/server";
import * as fs from 'fs/promises';
import { existsSync, mkdirSync, createReadStream } from "fs";

export async function GET(request: Request, { params } : { params: {filename: string | string[]} }) {
  try {
    
    const filepath = './storage/' + (Array.isArray(params.filename) ? (params.filename as string[]).join("/") : params.filename as string)

    // console.log({filepath})

    if (!existsSync(filepath)){
      throw 'Not found'
    }

    const fileStream = await fs.readFile(filepath)


    return new Response(fileStream);
  }
  catch (e) {
    console.log(e)
    return NextResponse.json("Error", {status: 400})
  }
}