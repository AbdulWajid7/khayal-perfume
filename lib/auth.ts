import bcryptjs from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { dbConnect, toJSON } from "@/lib/mongoose";
import { User, type IUser } from "@/models/User";
import { Post } from "@/models/Post";

const SESSION_COOKIE = "khayal-admin-session";

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("Please define AUTH_SECRET environment variable");
  return new TextEncoder().encode(secret);
}

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: "admin" | "editor";
};

export async function hashPassword(password: string): Promise<string> {
  return bcryptjs.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcryptjs.compare(password, hash);
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role?: "admin" | "editor";
}): Promise<IUser> {
  await dbConnect();
  const passwordHash = await hashPassword(data.password);
  const user = await User.create({
    name: data.name,
    email: data.email,
    passwordHash,
    role: data.role || "editor",
  });
  return toJSON(user) as unknown as IUser;
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<SessionUser | null> {
  await dbConnect();
  const user = await User.findOne({ email: email.toLowerCase().trim() }).lean();
  if (!user) return null;
  const match = await verifyPassword(password, user.passwordHash);
  if (!match) return null;
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

export async function createSession(user: SessionUser): Promise<void> {
  const secret = getSecret();
  const token = await new SignJWT(user)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1d")
    .sign(secret);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const secret = getSecret();
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function requireAuth(allowedRoles?: ("admin" | "editor")[]) {
  const session = await getSession();
  if (!session) return null;
  if (allowedRoles && !allowedRoles.includes(session.role)) return null;
  return session;
}

export async function seedInitialAdmin() {
  await dbConnect();
  const count = await User.countDocuments();
  if (count > 0) return;

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return;

  await createUser({ name: "Admin", email, password, role: "admin" });
}

export async function seedSamplePosts(authorId: string) {
  await dbConnect();
  const count = await Post.countDocuments();
  if (count > 0) return;

  await Post.insertMany([
    {
      title: "The Art of Oud: Why Khayal Builds Fragrance Around Imagination",
      slug: "the-art-of-oud",
      metaTitle: "The Art of Oud | Khayal Journal",
      metaDescription:
        "Discover why oud remains the soul of luxury perfumery and how Khayal transforms raw resin into liquid imagination.",
      focusKeyword: "oud perfume",
      excerpt:
        "Discover why oud remains the soul of luxury perfumery and how Khayal transforms raw resin into liquid imagination.",
      content: "<p>Oud has been treasured for centuries across the Middle East and South Asia. At Khayal, we source the most resonant resins and let imagination guide the composition.</p>",
      publishedAt: new Date("2026-08-01"),
      readTime: 8,
      tags: ["Ingredients"],
      status: "published",
      authorId,
      schemaType: "BlogPosting",
    },
    {
      title: "How to Choose a Signature Scent Without Testing Fifty Bottles",
      slug: "how-to-choose-signature-scent",
      metaTitle: "How to Choose a Signature Scent | Khayal Journal",
      metaDescription:
        "A practical guide to finding a fragrance that feels like an extension of your personality, mood, and memory.",
      focusKeyword: "signature scent",
      excerpt:
        "A practical guide to finding a fragrance that feels like an extension of your personality, mood, and memory.",
      content: "<p>Start with what you already love: the smell of rain, old books, sandalwood incense. A signature scent is a memory you choose to wear.</p>",
      publishedAt: new Date("2026-08-05"),
      readTime: 6,
      tags: ["Scent Guides"],
      status: "published",
      authorId,
      schemaType: "BlogPosting",
    },
    {
      title: "The Ritual of Gifting Fragrance: Notes That Speak for You",
      slug: "ritual-of-gifting-fragrance",
      metaTitle: "The Ritual of Gifting Fragrance | Khayal Journal",
      metaDescription:
        "Why perfume is the most intimate gift you can give, and how to select one that carries meaning beyond the bottle.",
      focusKeyword: "perfume gift",
      excerpt:
        "Why perfume is the most intimate gift you can give, and how to select one that carries meaning beyond the bottle.",
      content: "<p>Fragrance is invisible, but it lingers. The right perfume says something the giver cannot put into words.</p>",
      publishedAt: new Date("2026-08-08"),
      readTime: 5,
      tags: ["Gifting"],
      status: "published",
      authorId,
      schemaType: "BlogPosting",
    },
  ] as unknown as Parameters<typeof Post.insertMany>[0]);
}
