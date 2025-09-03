import { NextRequest, NextResponse } from "next/server";
import { getAllMetricsWithSpecs } from "@/lib/system-metrics";
import { db } from "@/lib/db";
import { metricsHistory } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    // Get current system metrics with specifications
    const metrics = await getAllMetricsWithSpecs();

    // Store basic metrics in database (optional - for historical tracking)
    try {
      await db.insert(metricsHistory).values({
        cpuUsage: metrics.cpuUsage,
        memoryUsage: metrics.memoryUsage,
        diskUsage: metrics.diskUsage,
        timestamp: metrics.timestamp,
      });
    } catch (dbError) {
      // Log but don't fail the request if DB storage fails
      console.warn("Failed to store metrics in database:", dbError);
    }

    return NextResponse.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching system metrics:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch system metrics",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Optional: Get historical metrics
export async function POST(request: NextRequest) {
  try {
    const { userId, limit = 100 } = await request.json();

    let query = db
      .select()
      .from(metricsHistory)
      .orderBy(metricsHistory.timestamp)
      .limit(limit);

    if (userId) {
      query = query.where(eq(metricsHistory.userId, userId));
    }

    const history = await query;

    return NextResponse.json({
      success: true,
      data: history,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching metrics history:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch metrics history",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
