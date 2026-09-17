"use client";

import { useState } from "react";

export function ReviewForm({ reservationId }: { reservationId: string }) {
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setError("");
    const response = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reservationId, rating: Number(rating), comment }),
    });
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error ?? "Avis impossible");
      return;
    }
    setSubmitted(true);
  }

  if (submitted) return <p data-review-success>Merci pour votre avis.</p>;

  return (
    <div data-review-form>
      <h4>Votre avis</h4>
      <label>
        Note
        <select value={rating} onChange={(event) => setRating(event.target.value)}>
          {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} / 5</option>)}
        </select>
      </label>
      <label>
        Commentaire
        <textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Partagez votre expérience" />
      </label>
      <button type="button" onClick={submit}>Publier mon avis</button>
      {error ? <p role="alert">{error}</p> : null}
    </div>
  );
}
