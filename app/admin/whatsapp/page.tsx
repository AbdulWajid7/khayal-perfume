import type { Metadata } from "next";
import {
  deleteAnswer,
  getAnswers,
  getBotStats,
  getInbox,
  markThreadDone,
  replyToCustomer,
  saveAnswer,
} from "@/lib/admin/whatsapp";
import { geminiConfigured, geminiModel } from "@/lib/gemini";
import type { IBotAnswer } from "@/models/BotAnswer";

export const metadata: Metadata = { title: "WhatsApp Assistant | Khayal Admin" };
export const dynamic = "force-dynamic";

const card = "bg-pure border border-border rounded-2xl p-6 shadow-sm";
const primary =
  "bg-gold text-pure rounded-lg px-4 py-2 text-sm font-medium hover:bg-gold-light transition-colors";
const secondary =
  "border border-border text-ink rounded-lg px-4 py-2 text-sm hover:bg-cream transition-colors";

function time(value: string | Date) {
  return new Date(value).toLocaleString("en-PK", {
    timeZone: "Asia/Karachi",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

function AnswerForm({ answer, submitLabel }: { answer?: IBotAnswer; submitLabel: string }) {
  return (
    <form action={saveAnswer} className="space-y-3">
      {answer && <input type="hidden" name="id" value={answer._id} />}
      <div>
        <label className="block text-xs text-stone mb-1">Customer question</label>
        <input name="question" defaultValue={answer?.question} required className="input-admin" />
      </div>
      <div>
        <label className="block text-xs text-stone mb-1">Answer the bot should give</label>
        <textarea name="answer" defaultValue={answer?.answer} required rows={3} className="input-admin" />
      </div>
      <div>
        <label className="block text-xs text-stone mb-1">
          Keywords, comma separated (English and Roman Urdu, e.g. price, qeemat, rate)
        </label>
        <input name="keywords" defaultValue={answer?.keywords.join(", ")} className="input-admin" />
      </div>
      <button type="submit" className={primary}>
        {submitLabel}
      </button>
    </form>
  );
}

export default async function WhatsAppAssistantPage() {
  const [stats, inbox, answers] = await Promise.all([getBotStats(), getInbox(), getAnswers()]);
  const aiOn = geminiConfigured();

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="font-serif-display text-ink text-3xl font-medium">WhatsApp Assistant</h1>
        <p className="mt-1 text-stone text-sm">
          The bot answers typed questions from your products, FAQ and the answer library below. Questions it
          can&apos;t answer, and customers who ask for a person, land in &quot;Needs a reply&quot;. Every answer you
          save teaches the bot.
        </p>
      </div>

      <section className={card}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-ink">
            AI answers:{" "}
            {aiOn ? (
              <span className="text-green-700 font-medium">On ({geminiModel()})</span>
            ) : (
              <span className="text-amber-700 font-medium">
                Off. Add GEMINI_API_KEY in Vercel to switch it on. Until then the bot uses the answer library.
              </span>
            )}
          </p>
          <p className="text-xs text-stone">Last 7 days</p>
        </div>
        <dl className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
          {[
            ["Messages", stats.messages],
            ["Answered by AI", stats.ai],
            ["From library", stats.library],
            ["Unanswered", stats.unanswered],
            ["Asked for a person", stats.needsHuman],
          ].map(([label, value]) => (
            <div key={label as string} className="rounded-xl bg-cream px-3 py-3">
              <dd className="font-serif-display text-2xl text-ink">{value}</dd>
              <dt className="text-xs text-stone mt-1">{label}</dt>
            </div>
          ))}
        </dl>
      </section>

      <section className="space-y-4">
        <h2 className="text-ink text-xl font-medium">Needs a reply ({inbox.length})</h2>
        {!inbox.length && <p className="text-sm text-stone">Nothing waiting. The bot handled everything.</p>}
        {inbox.map((thread) => {
          const lastQuestion = [...thread.messages].reverse().find((m) => m.direction === "in" && m.text)?.text || "";
          return (
            <article key={thread.waId} className={card}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-ink">
                  +{thread.waId}{" "}
                  <a
                    href={`https://wa.me/${thread.waId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gold-deep text-xs underline ml-2"
                  >
                    Open in WhatsApp
                  </a>
                </p>
                <p className="text-xs text-stone">Last message {time(thread.lastAt)}</p>
              </div>
              <ol className="mt-4 space-y-2">
                {thread.messages.map((m) => (
                  <li
                    key={m._id}
                    className={`max-w-[85%] rounded-xl px-3 py-2 text-sm whitespace-pre-line ${
                      m.direction === "in" ? "bg-cream text-ink" : "bg-ink/5 text-ink ml-auto"
                    }`}
                  >
                    {m.text || (m.replyId ? `[tapped ${m.replyId}]` : "")}
                    <span className="block text-[11px] text-stone mt-1">
                      {time(m.createdAt)}
                      {m.direction === "in" && m.needsHuman ? " · asked for a person" : ""}
                      {m.direction === "in" && m.unanswered ? " · bot couldn't answer" : ""}
                      {m.direction === "out" && m.handledBy === "ai" ? " · AI" : ""}
                    </span>
                  </li>
                ))}
              </ol>
              {thread.canReply ? (
                <form action={replyToCustomer} className="mt-4 space-y-3">
                  <input type="hidden" name="waId" value={thread.waId} />
                  <input type="hidden" name="question" value={lastQuestion} />
                  <textarea name="text" required rows={3} placeholder="Type your reply" className="input-admin" />
                  <label className="flex items-center gap-2 text-sm text-ink">
                    <input type="checkbox" name="saveAnswer" value="true" className="h-4 w-4" />
                    Also teach the bot: save this as the answer to &quot;{lastQuestion.slice(0, 80)}&quot;
                  </label>
                  <div className="flex gap-3">
                    <button type="submit" className={primary}>
                      Send on WhatsApp
                    </button>
                  </div>
                </form>
              ) : (
                <p className="mt-4 text-sm text-amber-700">
                  More than 24 hours have passed, so WhatsApp only allows approved templates. Call the customer or
                  message them from the WhatsApp app.
                </p>
              )}
              <form action={markThreadDone} className="mt-3">
                <input type="hidden" name="waId" value={thread.waId} />
                <button type="submit" className={secondary}>
                  Mark as done
                </button>
              </form>
            </article>
          );
        })}
      </section>

      {answers.suggested.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-ink text-xl font-medium">Suggested answers to approve ({answers.suggested.length})</h2>
          <p className="text-sm text-stone">
            Drafted each morning from questions the bot couldn&apos;t answer. Edit if needed, then approve. Nothing
            here is sent to customers until you approve it.
          </p>
          {answers.suggested.map((a) => (
            <article key={a._id} className={card}>
              {a.exampleMessage && (
                <p className="text-xs text-stone mb-3">Customer asked: &quot;{a.exampleMessage}&quot;</p>
              )}
              <AnswerForm answer={a} submitLabel="Approve" />
              <form action={deleteAnswer} className="mt-3">
                <input type="hidden" name="id" value={a._id} />
                <button type="submit" className={secondary}>
                  Discard
                </button>
              </form>
            </article>
          ))}
        </section>
      )}

      <section className="space-y-4">
        <h2 className="text-ink text-xl font-medium">Answer library ({answers.live.length})</h2>
        <div className={card}>
          <h3 className="text-sm font-medium text-ink mb-3">Add an answer</h3>
          <AnswerForm submitLabel="Add to library" />
        </div>
        {answers.live.map((a) => (
          <details key={a._id} className={card}>
            <summary className="cursor-pointer text-sm text-ink">
              {a.question}
              <span className="text-xs text-stone ml-2">used {a.timesUsed}×</span>
            </summary>
            <div className="mt-4">
              <AnswerForm answer={a} submitLabel="Save changes" />
              <form action={deleteAnswer} className="mt-3">
                <input type="hidden" name="id" value={a._id} />
                <button type="submit" className={secondary}>
                  Delete
                </button>
              </form>
            </div>
          </details>
        ))}
      </section>
    </div>
  );
}
