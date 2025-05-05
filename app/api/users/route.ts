import { getConnection } from "@/lib/db";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/auth.config";
import bcrypt from "bcrypt";

// Get all users (admin only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conn = await getConnection();
    const [users] = await conn.execute('SELECT id, username, email, role, created_at, last_login, is_active FROM users');
    await conn.end();

    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Create new user (admin only)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { username, password, email, role } = await request.json();
    
    if (!username || !password || !email || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['admin', 'user'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const conn = await getConnection();

    // Check if username or email already exists
    const [existing] = await conn.execute(
      'SELECT username, email FROM users WHERE username = ? OR email = ?',
      [username, email]
    ) as any;

    if (existing.length > 0) {
      await conn.end();
      const field = existing[0].username === username ? 'username' : 'email';
      return NextResponse.json({ error: `This ${field} is already in use` }, { status: 400 });
    }

    // Hash the password before storing it
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create the user with hashed password
    await conn.execute(
      'INSERT INTO users (username, password, email, role, is_active) VALUES (?, ?, ?, ?, TRUE)',
      [username, hashedPassword, email, role]
    );
    await conn.end();

    return NextResponse.json({ message: 'User created successfully' });
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'Username or email already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Update user (admin only)
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, username, email, role, is_active } = await request.json();
    
    if (!id || !username || !email || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const conn = await getConnection();
    
    // Check if user exists
    const [existingUsers] = await conn.execute('SELECT id FROM users WHERE id = ?', [id]);
    if (!(existingUsers as any[]).length) {
      await conn.end();
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update user
    await conn.execute(
      'UPDATE users SET username = ?, email = ?, role = ?, is_active = ? WHERE id = ?',
      [username, email, role, is_active === undefined ? true : is_active, id]
    );
    await conn.end();

    return NextResponse.json({ message: 'User updated successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Delete user (admin only)
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const conn = await getConnection();
    await conn.execute('DELETE FROM users WHERE id = ?', [id]);
    await conn.end();

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
