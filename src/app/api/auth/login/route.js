import { NextResponse } from "next/server";
import { Nutritionist } from "@/models/Nutritionist";
import jwt from "jsonwebtoken";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const nutritionist = await Nutritionist.findByEmail(email.toLowerCase());
    if (!nutritionist) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const isValidPassword = await Nutritionist.verifyPassword(password, nutritionist.password);
    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    if (!nutritionist.isActive) {
      return NextResponse.json({ error: "Account is deactivated. Please contact support." }, { status: 401 });
    }

    await Nutritionist.updateLastLogin(nutritionist._id);

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error("Missing JWT_SECRET environment variable");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const token = jwt.sign(
      {
        nutritionistId: nutritionist._id,
        email: nutritionist.email,
        name: nutritionist.name,
        specialization: nutritionist.specialization,
      },
      jwtSecret,
      { expiresIn: "7d" }
    );

    const response = NextResponse.json(
      {
        message: "Login successful",
        nutritionist: {
          id: nutritionist._id,
          name: nutritionist.name,
          email: nutritionist.email,
          specialization: nutritionist.specialization,
          licenseNumber: nutritionist.licenseNumber,
          phone: nutritionist.phone,
        },
      },
      { status: 200 }
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // en segundos
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}