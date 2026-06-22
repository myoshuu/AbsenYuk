import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";
import { apiError } from "@/lib/errors";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);

    const existingEmail = await prisma.user.findUnique({
      where: { email: data.email },
      select: { id: true },
    });
    if (existingEmail) {
      return NextResponse.json(
        { error: { code: "EMAIL_EXISTS", message: "Email sudah terdaftar" } },
        { status: 409 }
      );
    }

    const existingUsername = await prisma.user.findUnique({
      where: { username: data.username },
      select: { id: true },
    });
    if (existingUsername) {
      return NextResponse.json(
        { error: { code: "USERNAME_EXISTS", message: "Username sudah digunakan" } },
        { status: 409 }
      );
    }

    const id = uuidv4().slice(0, 12);
    const password = await bcrypt.hash(data.password, 12);

    await prisma.user.create({
      data: {
        id,
        username: data.username,
        email: data.email,
        password,
        role: data.role,
      },
    });

    return NextResponse.json(
      { message: "Registrasi berhasil", user: { id, username: data.username, email: data.email, role: data.role } },
      { status: 201 }
    );
  } catch (error: any) {
    if (error?.issues) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: error.issues[0].message } },
        { status: 400 }
      );
    }
    if (error?.code === "P2002" && error?.meta?.target?.includes("username")) {
      return NextResponse.json(
        { error: { code: "USERNAME_EXISTS", message: "Username sudah digunakan" } },
        { status: 409 }
      );
    }
    if (error?.code === "P2002" && error?.meta?.target?.includes("email")) {
      return NextResponse.json(
        { error: { code: "EMAIL_EXISTS", message: "Email sudah terdaftar" } },
        { status: 409 }
      );
    }
    const err = apiError(error);
    return NextResponse.json(err.body, { status: err.status });
  }
}
