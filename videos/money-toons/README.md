# Paisa Toons

Ten finance and money-making shorts (1080×1920, about 45–55 seconds each), with a Hindi voice and Hinglish captions. They come in three looks, all rendered in code:

- **Faceless 3D:** smooth clay mannequins with blank faces in warm, cinematic rooms.
- **Desi toon 3D:** caricatures with big noses and thick moustaches, in sunny desi sets.
- **Flat 2D:** cel shading with black outlines, like a 2D sitcom.

| # | Episode | Look |
|---|---|---|
| 1 | ₹500 Ki SIP Ka Jaadu (compounding) | Faceless |
| 2 | iPhone EMI Ka Chakkar | Toon |
| 3 | CIBIL Score Kya Hai? | Flat |
| 4 | 30 Din Mein Paisa Double? (Ponzi scams, 1930 helpline) | Toon |
| 5 | Mehangai Chupchaap Paisa Kha Rahi Hai (inflation) | Faceless |
| 6 | Insurance Ka Sach (term vs endowment) | Flat |
| 7 | Naukri Ke Saath Side Income (freelancing) | Faceless |
| 8 | Gehna Ya Gold Fund? | Toon |
| 9 | Salary Badhi, Bachat Kyun Nahi? (lifestyle inflation) | Flat |
| 10 | Rule of 72: Paisa Kab Double? | Faceless |

Each episode folder holds:

- the video;
- `captions.srt` and `thumbnail.jpg`;
- `script.json` (the voice lines);
- `script3d.json` (the shots).

`thumbnails.jpg` shows all ten thumbnails.

Returns and costs are illustrative. The SIP and Rule of 72 figures assume the stated rates. Every video ends with "Seekhne ke liye hai, financial advice nahi. Returns guaranteed nahi hote."

## How it's made

1. `scripts.py` holds every episode. Each line is a speaker, a shot, Devanagari for the Kokoro voice, a Hinglish caption and an optional money sticker.
2. A shot names a room, a cast with poses and props in hand, the props, and the camera.
3. `KOKORO_DIR=DIR ./make.sh NN-slug WORKDIR` does the rest:
   - voices each character with its own voice through `engine/voice.py`;
   - builds the page with `../tech-shorts/engine3d/build_page.py`;
   - renders in 3 parallel segments and adds the audio.

The shots are drawn by `../tech-shorts/engine3d/sets/money/paisa.js`:

- **Characters:** a look-aware character builder on top of the Body Shorts person rig. It adds the faceless mode, giant toon noses, moustaches, beards, sarees, coats, caps, turbans, chains and glasses.
- **Rooms:** about 15, including a café, office, bank, Marine Drive, a city street, a desi street, a village, a jeweller, a mobile shop, a classroom and a police station.
- **Finance props:** a coin tree, coin hourglass, gullak, debt net, CIBIL gauge, Ponzi pyramid, umbrella, snail, jars, a savings pipe and a balance scale.
- **Flat look:** a cel-shading pass with outlines.
- **Overlays:** the series tag, a speaker pill and the money sticker. They are drawn through the `OVERLAY2` hook in `pixar.js`.

The references the user shared were AI-generated 3D and 2D cartoon frames. The image-generation services available had no credits left, so these looks are recreated in three.js instead.
