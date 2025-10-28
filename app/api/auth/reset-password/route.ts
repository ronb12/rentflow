import { NextRequest, NextResponse } from 'next/server';
import { sendPasswordResetEmail } from '@/lib/email';
import crypto from 'crypto';

// Store reset tokens in memory (in production, use Redis or database)
const resetTokens = new Map<string, { email: string; expires: number }>();

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Generate a secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + (60 * 60 * 1000); // 1 hour from now

    // Store the token
    resetTokens.set(resetToken, {
      email,
      expires: expiresAt
    });

    // Send the password reset email
    const result = await sendPasswordResetEmail({
      to: email,
      resetToken,
      userName: email.split('@')[0] // Use email prefix as name
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Password reset instructions sent to your email'
      });
    } else {
      return NextResponse.json(
        { error: result.message },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json(
      { error: 'Reset token is required' },
      { status: 400 }
    );
  }

  const tokenData = resetTokens.get(token);

  if (!tokenData) {
    return NextResponse.json(
      { error: 'Invalid or expired reset token' },
      { status: 400 }
    );
  }

  if (Date.now() > tokenData.expires) {
    resetTokens.delete(token);
    return NextResponse.json(
      { error: 'Reset token has expired' },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    email: tokenData.email
  });
}

export async function PUT(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Token and new password are required' },
        { status: 400 }
      );
    }

    const tokenData = resetTokens.get(token);

    if (!tokenData) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    if (Date.now() > tokenData.expires) {
      resetTokens.delete(token);
      return NextResponse.json(
        { error: 'Reset token has expired' },
        { status: 400 }
      );
    }

    // In a real app, you would update the password in the database here
    // For now, we'll just simulate success
    console.log(`Password reset for ${tokenData.email} with new password`);

    // Clean up the token
    resetTokens.delete(token);

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully'
    });

  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
