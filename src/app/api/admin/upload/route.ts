import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "ไม่พบไฟล์" }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
    
    // Ensure upload directory exists
    await mkdir(uploadDir, { recursive: true });

    const uploadedFiles: { url: string; filename: string }[] = [];

    for (const file of files) {
      // Validate file type
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
      if (!allowedTypes.includes(file.type)) {
        continue; // Skip invalid files
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        continue; // Skip files too large
      }

      // Generate unique filename
      const ext = file.name.split(".").pop() || "jpg";
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8);
      const filename = `product_${timestamp}_${random}.${ext}`;

      // Write file to disk
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filePath = path.join(uploadDir, filename);
      await writeFile(filePath, buffer);

      uploadedFiles.push({
        url: `/uploads/products/${filename}`,
        filename,
      });
    }

    if (uploadedFiles.length === 0) {
      return NextResponse.json(
        { error: "ไม่มีไฟล์ที่ถูกต้อง (รองรับ: JPG, PNG, WebP, GIF ขนาดไม่เกิน 5MB)" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      files: uploadedFiles,
      message: `อัพโหลดสำเร็จ ${uploadedFiles.length} ไฟล์`,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการอัพโหลด" }, { status: 500 });
  }
}
