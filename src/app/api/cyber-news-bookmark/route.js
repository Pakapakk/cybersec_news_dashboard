"use server"

import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("cyber_news_db");
    const bookmarks = await db.collection("news_bookmark").find({}).toArray();
    return new Response(JSON.stringify(bookmarks), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Failed to fetch bookmarks:", err);
    return new Response(JSON.stringify({ error: "Failed to fetch bookmarks" }), {
      status: 500,
    });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const client = await clientPromise;
    const db = client.db("cyber_news_db");

    await db.collection("news_bookmark").updateOne(
      { _id: body._id },
      { $set: body },
      { upsert: true }
    );

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error("Failed to add bookmark:", err);
    return new Response(JSON.stringify({ error: "Failed to add bookmark" }), {
      status: 500,
    });
  }
}

export async function DELETE(req) {
  try {
    const body = await req.json();
    const client = await clientPromise;
    const db = client.db("cyber_news_db");

    await db.collection("news_bookmark").deleteOne({ "News Title": body.title });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error("Failed to delete bookmark:", err);
    return new Response(JSON.stringify({ error: "Failed to delete bookmark" }), {
      status: 500,
    });
  }
}

