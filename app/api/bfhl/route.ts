import { NextRequest, NextResponse } from "next/server";

interface FileInfo {
    valid: boolean;
    mimeType: string;
    sizeKb: number;
}

interface ApiResponse {
    is_success: boolean;
    user_id: string;
    email: string;
    roll_number: string;
    numbers: string[];
    alphabets: string[];
    highest_lowercase_alphabet: string[];
    is_prime_found: boolean;
    file_valid: boolean;
    file_mime_type: string;
    file_size_kb: string;
}

function isPrime(num: number): boolean {
    if (num <= 1) return false;
    if (num <= 3) return true;
    if (num % 2 === 0 || num % 3 === 0) return false;
    
    for (let i = 5; i * i <= num; i += 6) {
        if (num % i === 0 || num % (i + 2) === 0) return false;
    }
    return true;
}

async function getFileInfo(base64String: string): Promise<FileInfo> {
    try {
        const base64Data: string = base64String.replace(/^data:.*?;base64,/, "");
        
        const buffer: Buffer = Buffer.from(base64Data, 'base64');
        
        const isPNG: boolean = buffer[0] === 0x89 && 
                              buffer[1] === 0x50 && 
                              buffer[2] === 0x4E && 
                              buffer[3] === 0x47;
        
        return {
            valid: isPNG,
            mimeType: isPNG ? "image/png" : "unknown",
            sizeKb: Math.round(buffer.length / 1024)
        };
    } catch (error) {
        return {
            valid: false,
            mimeType: "unknown",
            sizeKb: 0
        };
    }
}

export async function GET(req : NextRequest){

    return NextResponse.json({
        operation_code: 1
    },{
        status: 200
    })
}

export async function POST(req : NextRequest){
    
    try{
        const body = await req.json();
        const data = body.data

        const numbers: string[] = data.filter((item: string) => !isNaN(Number(item)));
        const alphabets: string[] = data.filter((item: string) => isNaN(Number(item)));
        
        const lowercaseAlphabets: string[] = alphabets.filter((char: string) => char === char.toLowerCase());
        const highestLowercase: string[] = lowercaseAlphabets.length > 0 ? 
            [lowercaseAlphabets.reduce((a: string, b: string) => a > b ? a : b)] : 
            [" "];
        
        const isPrimeFound: boolean = numbers.some((num: string) => isPrime(parseInt(num)));
        
        const fileInfo: FileInfo = await getFileInfo(body.file_b64);

        const response: ApiResponse = {
            is_success: true,
            user_id: "Chandrashekhar_Choudha_29112002",
            email: "chandrashekharchoudha@gmail.com",
            roll_number: "0101CS211040",
            numbers: numbers,
            alphabets: alphabets,
            highest_lowercase_alphabet: highestLowercase,
            is_prime_found: isPrimeFound,
            file_valid: fileInfo.valid,
            file_mime_type: fileInfo.mimeType,
            file_size_kb: fileInfo.sizeKb.toString()
        };
        
        return NextResponse.json({
            response
        })
    } catch(e){
        return NextResponse.json({
            msg : "error occur"
        },{
            status : 403
        })
    }

}