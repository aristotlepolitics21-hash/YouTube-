# 100 Business Ideas

Desi cartoon skits (1080×1920, about 50 seconds each), made in batches of 10.

- **Batch 2 onward:** one language (a Hindi voice with Hinglish captions) and a fresh cast in every video.
- **Batch 1:** made in both Hindi and English, with a recurring Chacha Ji.

Each skit follows the same ten beats:

1. The hero is stuck (no job, no money).
2. A mentor (Chacha Ji in batch 1; Papa, Mummy, Dadi, a friend and so on in batch 2) pitches the business.
3. The hero asks a question.
4. The mentor gives the setup cost.
5. The mentor gives a setup tip.
6. A customer arrives at the new shop.
7. The hero quotes the price.
8. The mentor gives the daily earnings.
9. The mentor gives a growth tip.
10. "<Name> Ki Life Set! 😂"

## Batch 1 (Hindi + English)

| # | Idea | Shop sign |
|---|---|---|
| 1 | Tyre puncture shop | ABDUL TIRE WALA |
| 2 | Chai stall | RAJU CHAI WALA |
| 3 | Mobile repair | SONU MOBILE WALA |
| 4 | Tiffin service | SUNITA TIFFIN SERVICE |
| 5 | Sugarcane juice | PAPPU GANNA JUICE |
| 6 | Pani puri cart | GOLU GOLGAPPE WALA |
| 7 | Xerox & online forms | BUNTY XEROX CENTRE |
| 8 | Bike & car wash | KALLU WASHING CENTRE |
| 9 | Momos stall | CHINTU MOMOS |
| 10 | Ironing stall | MUNNA PRESS WALA |

## Batch 2 (Hindi, new cast each video)

| # | Idea | Shop sign | Hero · mentor · customer |
|---|---|---|---|
| 11 | Cooler & AC repair | RAMESH COOLER CENTRE | Ramesh · Papa · Gupta Ji |
| 12 | Mehendi artist | PINKY MEHENDI ARTS | Pinky · Mummy · Neha (bride) |
| 13 | Tuition classes | VIKAS TUITION CLASSES | Vikas · Dadi · Verma Ji |
| 14 | Photo studio | AJAY PHOTO STUDIO | Ajay · Bablu · Sardar Ji |
| 15 | Anda bhurji cart | SHAMBHU ANDA CENTRE | Shambhu · Kamla · Sunny |
| 16 | Cloud kitchen | NEETU'S KITCHEN | Neetu · Monu Bhaiya · Delivery Raju |
| 17 | Kabadi (scrap) | LALLAN KABADI WALA | Lallan · Pradhan Ji · Mishra Aunty |
| 18 | Phool mala shop | KISHAN PHOOL BHANDAR | Kishan · Pujari Ji · Ritu |
| 19 | Vada pav stall | GANESH VADA PAV | Ganesh · Aai · Mehta Saab |
| 20 | Tailoring boutique | SALMA BOUTIQUE | Salma · Abbu · Tanya |

Each batch 2 episode folder holds `NN-slug.mp4`, `captions.srt`, `thumbnail.jpg` and `script.json`.

Each batch 1 episode folder holds:

- both videos;
- `captions-hi.srt` / `captions-en.srt`;
- `thumbnail-hi.jpg` / `thumbnail-en.jpg`;
- `script-hi.json` / `script-en.json`.

Money figures are rough Indian estimates. They vary by city and season, and the last beat of each video says so.

## How it's made

1. Each batch file writes the scripts:
   - `scripts.py` writes batch 1. Each line is Devanagari for the Hindi voice, a Roman Hinglish caption, and an English line.
   - `batch2.py` writes batch 2: Devanagari plus a Hinglish caption, with each character's look and voice defined per video.
2. `KOKORO_DIR=DIR ./make.sh NN-slug WORKDIR` voices, renders and muxes each episode.

Voices are Kokoro, one per character. Batch 2 sets each character's voice in `batch2.py`, mixing hm_omega, hm_psi, hf_alpha, hf_beta, blends of them and different speeds. Batch 1 used:

| Character | Hindi | English |
|---|---|---|
| Chacha Ji | hm_omega | bm_george |
| Male hero | hm_psi | am_puck |
| Female hero | hf_alpha | af_bella |
| Customers | blended or female voices (set per customer in `scripts.py`) | |

The renderer is `engine/page.html` with `engine/render.cjs`. It is all code-drawn:

- **Backgrounds:** home, street, and a shop with a big sign banner, scalloped awning, nimbu-mirchi and props for each business.
- **Characters:** IK arms, poses, expressions, talking mouths, blinking, and props in hand. Each character mixes:
  - **Outfit:** lungi + vest + gamcha, kurta, dhoti, saree, kurti + dupatta, checked shirt, t-shirt, suit or hoodie.
  - **Hair:** short, puffy, spiky, side-parted, bald, bun, plait or long.
  - **Headwear:** Gandhi topi, turban, cap or skullcap.
  - **Extras:** beard, moustache, glasses, tilak, bindi, grey hair, a heavier or slimmer build, and height.
- **Overlays:** a white dialogue box with a speaker tag and word-by-word highlighting, money stickers, and the "life set" finish with coin rain.
