# Desi Comedy Shorts

Ten short comedy skits (1080×1920, 11–20 seconds each). 2D desi cartoon characters stand over real photographs, with a white emoji title box on top. There is a Hindi voice per character and Hinglish captions, and each skit ends on the punchline with a laughing-emoji burst.

The look follows the reference the user shared, using three recurring archetypes under different names:

- the lungi-vest-gamcha uncle with a big moustache;
- the long-haired guy in a black suit and round sunglasses;
- the big-eyed, white-faced boss with spiky orange hair.

| # | Skit | Cast | Background |
|---|---|---|---|
| 1 | 10th fail engineer | Power of 10th fail | road |
| 2 | Interview mein imaandari | Boss · Pappu · HR | office |
| 3 | Maths ka genius | Masterji · Golu | classroom |
| 4 | Bhoolne ki bimari | Doctor · Chhedi Lal | clinic |
| 5 | Bargaining ka badla | Lallu Dukaandar · Aunty Ji | kirana |
| 6 | Helmet kahan hai? | Havaldar · Bunty | traffic |
| 7 | WiFi ka password | Sharma Uncle · Monu | street |
| 8 | Topper ki copy | Examiner Sir · Raju | exam |
| 9 | Chaiwala shark pitch | Shark Sir · Investor Ji · Kallu | boardroom |
| 10 | Bank mein KYC | Bank Babu · Ramu Kaka | bank |

Each episode folder holds the video, `captions.srt`, `thumbnail.jpg` and `script.json`.

## Photo credits

The backgrounds come from Wikimedia Commons under CC BY, CC BY-SA or CC0. CC BY and CC BY-SA require a credit, so paste the matching line into each video's description:

- **road:** Asphalt Hot Mix Plant - Howrah 2011-12-10 00869.jpg by Biswarup Ganguly, CC BY 3.0, https://commons.wikimedia.org/wiki/File:Asphalt_Hot_Mix_Plant_-_Howrah_2011-12-10_00869.jpg
- **office:** India - Varanasi post office - 1582.jpg by Jorge Royan, CC BY-SA 3.0, https://commons.wikimedia.org/wiki/File:India_-_Varanasi_post_office_-_1582.jpg
- **classroom:** Jagseer S Sidhu teaching school students about Wikipedia.jpg by Jagseer S Sidhu, CC BY-SA 4.0, https://commons.wikimedia.org/wiki/File:Jagseer_S_Sidhu_teaching_school_students_about_Wikipedia.jpg
- **clinic:** Doctors Table.jpg by AuliRaha, CC BY-SA 4.0, https://commons.wikimedia.org/wiki/File:Doctors_Table.jpg
- **traffic:** Vengalloor Junction, Thodupuzha DSC02638 05.jpg by Ranjithsiji, CC BY-SA 4.0, https://commons.wikimedia.org/wiki/File:Vengalloor_Junction,_Thodupuzha_DSC02638_05.jpg
- **exam:** West Bengal Joint Entrance Examination - Howrah 2011-05-22 00283.jpg by Biswarup Ganguly, CC BY 3.0, https://commons.wikimedia.org/wiki/File:West_Bengal_Joint_Entrance_Examination_-_Howrah_2011-05-22_00283.jpg
- **boardroom:** Minimalist meeting room (Unsplash).jpg by Breather breather, CC0, https://commons.wikimedia.org/wiki/File:Minimalist_meeting_room_(Unsplash).jpg
- **street:** 166, Rua de Natal - 19th-20th century (4275527711).jpg by urbzoo, CC BY 2.0, https://commons.wikimedia.org/wiki/File:166,_Rua_de_Natal_-_19th-20th_century_(4275527711).jpg
- **kirana:** Grocery Shop in a small Town in South India (1).JPG by Ask27, CC BY-SA 3.0, https://commons.wikimedia.org/wiki/File:Grocery_Shop_in_a_small_Town_in_South_India_(1).JPG
- **bank:** HK 上環 Sheung Wan 中國銀行 Bank of China lobby interior VIP service counters n TV set monitor n queue ticket machine Feb 2017 IX1.jpg by Kinttwooarp, CC BY-SA 4.0, https://commons.wikimedia.org/wiki/File:HK_%E4%B8%8A%E7%92%B0_Sheung_Wan_%E4%B8%AD%E5%9C%8B%E9%8A%80%E8%A1%8C_Bank_of_China_lobby_interior_VIP_service_counters_n_TV_set_monitor_n_queue_ticket_machine_Feb_2017_IX1.jpg

## How it's made

1. `fetch_bg.py search OUTDIR` finds freely licensed candidates per scene.
2. `fetch_bg.py get PICKS.json bg` downloads the picks and writes `bg/credits.json`.
3. `scripts.py` holds the skits and writes each `script.json`. Each line is a speaker, a beat (background, cast, poses, expressions, effects, props), Devanagari for the voice, and a Hinglish caption.
4. `KOKORO_DIR=DIR ./make.sh NN-slug WORKDIR` voices the skit and renders it with `../business-ideas/engine` in comedy mode. Comedy mode adds:
   - a photo background with a slow zoom;
   - the title box;
   - emoji rain at the end;
   - shades, big eyes and shaggy hair as character options.
