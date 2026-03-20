"use client";
import { Tweet } from "@/lib/cities";
import { PANIC_KEYWORDS } from "@/lib/risk";

interface Props {
  tweets: Tweet[];
}

function CheckBadge() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" style={{ display: "inline", verticalAlign: "middle", marginLeft: 3 }}>
      <circle cx="6" cy="6" r="5.5" fill="#22d3ee" opacity="0.85" />
      <path d="M3 6l2 2 4-4" stroke="white" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function detectPanicWords(text: string): string[] {
  const lower = text.toLowerCase();
  return PANIC_KEYWORDS.filter((k) => lower.includes(k));
}

export default function SocialFeed({ tweets }: Props) {
  const panicCount = tweets.filter((t) => t.panic).length;

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.18em", color: "rgba(236,234,229,0.45)", textTransform: "uppercase" }}>
          Signal Feed
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#f43f5e", display: "inline-block" }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "#f43f5e", letterSpacing: "0.1em" }}>
            {panicCount} PANIC SIGNALS
          </span>
        </div>
      </div>

      {/* Feed */}
      <div style={{ maxHeight: 240, overflowY: "auto" }}>
        {tweets.map((tweet, i) => {
          const panicWords = detectPanicWords(tweet.text);
          return (
            <div
              key={i}
              style={{
                padding: "9px 0",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                animation: `tweetIn 0.35s ${i * 0.07}s ease both`,
              }}
            >
              {/* User row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 3, gap: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4, minWidth: 0 }}>
                  <span style={{
                    fontFamily: "var(--font-mono)", fontSize: 9,
                    color: tweet.panic ? "#f87171" : "#22d3ee",
                    opacity: 0.85, whiteSpace: "nowrap",
                  }}>
                    @{tweet.user}
                  </span>
                  {tweet.verified && <CheckBadge />}
                  {tweet.location && (
                    <span style={{
                      fontFamily: "var(--font-mono)", fontSize: 7,
                      color: "rgba(255,255,255,0.18)",
                      padding: "1px 5px",
                      border: "1px solid rgba(255,255,255,0.08)",
                      whiteSpace: "nowrap",
                    }}>
                      {tweet.location}
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  {tweet.retweets && (
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 7, color: "rgba(255,255,255,0.2)" }}>
                      ↻{tweet.retweets > 999 ? `${(tweet.retweets / 1000).toFixed(1)}K` : tweet.retweets}
                    </span>
                  )}
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 7, color: "rgba(255,255,255,0.2)" }}>
                    {tweet.time} ago
                  </span>
                </div>
              </div>

              {/* Tweet text */}
              <p style={{
                fontSize: 11,
                color: tweet.panic ? "rgba(236,234,229,0.8)" : "rgba(236,234,229,0.5)",
                lineHeight: 1.5,
                margin: 0,
              }}>
                {tweet.text}
              </p>

              {/* Panic badge */}
              {tweet.panic && (
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                  <span style={{
                    width: 4, height: 4, borderRadius: "50%",
                    background: "#f43f5e", display: "inline-block",
                    animation: "pulseOp 0.9s infinite",
                  }} />
                  <span style={{
                    fontFamily: "var(--font-mono)", fontSize: 7,
                    color: "#f87171", letterSpacing: "0.1em",
                  }}>
                    PANIC KEYWORD DETECTED — {panicWords.slice(0, 3).join(", ")}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
