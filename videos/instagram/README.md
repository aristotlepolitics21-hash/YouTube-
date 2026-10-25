# Instagram (@scimotion_lab)

Every Short in this repo is also posted as an Instagram Reel. This folder holds the posting queue
and the auto-reply setup.

## 1. Build the posts

```
python videos/tools/instagram_pack.py              # Tue/Fri 18:00, starting tomorrow
python videos/tools/instagram_pack.py --days mon,wed,fri --time 17:30
```

- Writes `final/instagram.md` next to each Short's video: the caption, a first comment with the sources, and the cover text.
- Writes `queue.csv` here: every Reel that hasn't been posted yet, each with a posting slot.
- When a Reel goes live, add its slug to `posted.txt`. The next run then leaves it out of the queue.
- To override the generated caption, question or hashtags for one Short, add an `instagram` key to its `short.json` (see the tool's docstring).

## 2. Schedule them (scheduler app)

Any scheduler that can publish Reels directly (Buffer, Later, Metricool) needs a **Professional**
Instagram account, either Creator or Business. Switching is free: Settings → Account type and tools → Switch to professional account.

For each row in `queue.csv`:

1. Upload the `video` file as a Reel.
2. Paste the **Caption** section from `caption_file`.
3. Set the cover to a frame showing the **Cover text**.
4. Schedule it for `post_at`.
5. Paste the **First comment** (Buffer and Later both have a first-comment field).

Videos are git-ignored, so render them first with `shorts3d` or the sciencefacts build. They land at the `video` path.

## 3. Auto-replies to comments and DMs (ManyChat)

ManyChat is an official Meta partner. Its free plan covers keyword auto-replies to Instagram comments and DMs.

1. Sign up at manychat.com → connect Instagram. This needs the Professional account from step 2.
2. Create the automations below. For each one: Automation → New → *User comments on your post or reel*, or *User sends a message*.

| Trigger | Where | Reply |
|---|---|---|
| Comment contains `ANIMATE` | Any Reel | Public reply: "Sent you a DM 🎬". DM: "Hey! Want to learn how these animations are made? Tell me your level (total beginner / some Blender / pro) and I'll send you where to start." |
| DM contains `animation`, `learn`, `course` | DMs | "Thanks for reaching out! 🧪 Are you a total beginner, do you know some Blender, or are you a pro? I'll reply personally within 24h." |
| Comment contains `source` or `sources` | Any Reel | Public reply: "Sources are pinned in the first comment 📚" |
| Default first DM (no keyword) | DMs | "Hey, thanks for messaging SciMotion Lab! 🌌 I read every DM and reply within a day. Meanwhile: new animated science every Tue & Fri." |

To make the `ANIMATE` trigger work, add this line to the caption of one Reel a week:
*"Comment ANIMATE and I'll show you how this was made."*

Keep replies that need judgement (collab offers, questions about the science) for yourself.
ManyChat hands the conversation over to you once its reply is sent.
