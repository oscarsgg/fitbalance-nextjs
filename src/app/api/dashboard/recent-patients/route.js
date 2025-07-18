import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb"; // 👈 necesitas importar el cliente aquí

// export async function GET(request) {
//   try {
//     const token = request.cookies.get("token")?.value;

//     if (!token) {
//       return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
//     }

//     let decoded;
//     try {
//       decoded = jwt.verify(token, process.env.JWT_SECRET || "default-secret");
//     } catch (err) {
//       return NextResponse.json({ error: "Invalid token" }, { status: 401 });
//     }

//     const nutritionistIdStr = decoded.nutritionistId?.toString();

//     if (!nutritionistIdStr || !ObjectId.isValid(nutritionistIdStr)) {
//       return NextResponse.json({ error: "Invalid nutritionist ID" }, { status: 400 });
//     }

//     const client = await clientPromise;
//     const db = client.db("fitbalance");

//     const recentPatients = await db
//       .collection("Patients")
//       .find({ nutritionist_id: new ObjectId(nutritionistIdStr) })
//       .sort({ registration_date: -1 })
//       .limit(3)
//       .project({ password: 0 }) // 👈 opcional: excluye password
//       .toArray();

//     return NextResponse.json({ recentPatients });
//   } catch (error) {
//     console.error("Error fetching recent patients:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch recent patients" },
//       { status: 500 }
//     );
//   }
// }

export async function GET(request) {
  try {
    // Get token from cookies
    const token = request.cookies.get("token")?.value

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")

    // Get patients for this nutritionist
    const patients = await Patient.findByNutritionist(decoded.nutritionistId)  
     

    return NextResponse.json({ patients })
  } catch (error) {
    console.error("Get patients error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
