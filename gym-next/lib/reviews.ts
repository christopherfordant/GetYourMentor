export type Review = {
  id: string;
  reservationId: string;
  authorEmail: string;
  rating: number;
  comment: string;
  createdAt: string;
};

import { assertDemoFallbackAllowed } from "@/lib/runtime";

const memoryReviews: Review[] = [];

function supabaseConfig() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && key) return { url: url.replace(/\/$/, ""), key };
  assertDemoFallbackAllowed("Supabase Reviews");
  return null;
}

export async function createReview(review: Review) {
  if (memoryReviews.some((item) => item.reservationId === review.reservationId)) {
    throw new Error("Un avis existe déjà pour cette réservation");
  }

  const config = supabaseConfig();
  if (config) {
    const response = await fetch(`${config.url}/rest/v1/gym_reviews`, {
      method: "POST",
      headers: {
        apikey: config.key,
        Authorization: `Bearer ${config.key}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        id: review.id,
        reservation_id: review.reservationId,
        author_email: review.authorEmail,
        rating: review.rating,
        comment: review.comment,
        created_at: review.createdAt,
      }),
    });
    if (!response.ok) throw new Error(response.status === 409 ? "Un avis existe déjà pour cette réservation" : `Supabase review error (${response.status})`);
    const [saved] = await response.json();
    return { ...review, id: saved.id ?? review.id, createdAt: saved.created_at ?? review.createdAt };
  }

  memoryReviews.push(review);
  return review;
}
