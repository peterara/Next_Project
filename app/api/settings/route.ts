import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { userSettings, users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }
    
    const settings = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, parseInt(userId)))
      .limit(1)
    
    if (settings.length === 0) {
      // Return default settings if none exist
      return NextResponse.json({
        success: true,
        data: {
          theme: 'light',
          pollingInterval: 2000
        }
      })
    }
    
    return NextResponse.json({
      success: true,
      data: settings[0]
    })
  } catch (error) {
    console.error('Error fetching user settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user settings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, theme, pollingInterval } = await request.json()
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }
    
    // Validate theme
    if (theme && !['light', 'dark'].includes(theme)) {
      return NextResponse.json(
        { success: false, error: 'Invalid theme value' },
        { status: 400 }
      )
    }
    
    // Validate polling interval
    if (pollingInterval && (pollingInterval < 1000 || pollingInterval > 30000)) {
      return NextResponse.json(
        { success: false, error: 'Polling interval must be between 1000 and 30000 ms' },
        { status: 400 }
      )
    }
    
    // Check if settings exist for this user
    const existingSettings = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, parseInt(userId)))
      .limit(1)
    
    let result
    
    if (existingSettings.length > 0) {
      // Update existing settings
      result = await db
        .update(userSettings)
        .set({
          theme: theme || existingSettings[0].theme,
          pollingInterval: pollingInterval || existingSettings[0].pollingInterval,
          updatedAt: new Date()
        })
        .where(eq(userSettings.userId, parseInt(userId)))
        .returning()
    } else {
      // Create new settings
      result = await db
        .insert(userSettings)
        .values({
          userId: parseInt(userId),
          theme: theme || 'light',
          pollingInterval: pollingInterval || 2000
        })
        .returning()
    }
    
    return NextResponse.json({
      success: true,
      data: result[0]
    })
  } catch (error) {
    console.error('Error updating user settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update user settings' },
      { status: 500 }
    )
  }
}
