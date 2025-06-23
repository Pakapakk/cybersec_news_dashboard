"use server";

import clientPromise from "@/lib/mongodb";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return new Response("Missing userId", { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("cyber_news_db");
    const bookmarks = await db
      .collection("news_bookmark")
      .find({ userId })
      .toArray();

    return new Response(JSON.stringify(bookmarks), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Failed to fetch bookmarks:", err);
    return new Response(
      JSON.stringify({ error: "Failed to fetch bookmarks" }),
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const client = await clientPromise;
    const db = client.db("cyber_news_db");

    const { userId, _id, ...rest } = body;

    // Combine userId and news _id to create a unique composite _id
    const compositeId = `${userId}::${_id}`;

    await db.collection("news_bookmark").updateOne(
      { _id: compositeId },
      { $set: { userId, newsId: _id, ...rest } },
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

    await db.collection("news_bookmark").deleteOne({
      "News Title": body.title,
      userId: body.userId, // required now
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error("Failed to delete bookmark:", err);
    return new Response(JSON.stringify({ error: "Failed to delete bookmark" }), {
      status: 500,
    });
  }
}


