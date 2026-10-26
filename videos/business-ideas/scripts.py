# Writes NN-slug/script-hi.json (Hindi voice, Hinglish captions) and NN-slug/script-en.json (English) for every idea.
# Every skit runs the same ten beats: the hero is stuck, Chacha Ji pitches the business, the cost, a setup tip, a customer
# at the new shop, the price, the daily earnings, a growth tip, and "life set!".
# A line is (Devanagari for the Hindi voice, Roman Hinglish caption, English line). English captions show ₹; the voice reads "rupees".
import json, os, re
H = os.path.dirname(os.path.abspath(__file__))
NOTE = {'hi': 'Figures rough estimates hain, sheher aur season ke hisaab se badalte hain', 'en': 'Figures are rough estimates and vary by city and season'}
CHACHA = {'name': 'Chacha Ji', 'look': 'topi', 'skin': '#c68642', 'stache': True, 'tag': '#3d6fd1'}
CUST = {
    'pandit': ({'name': 'Pandit Ji', 'look': 'tilak', 'skin': '#d39b6a', 'stache': True, 'tag': '#f28c28'}, ['hm_omega+hm_psi', .92], ['am_michael', 1.0]),
    'priya': ({'name': 'Priya', 'look': 'kurti', 'skin': '#d39b6a', 'tag': '#9b5de5', 'colors': {'kurti': '#9b5de5'}}, ['hf_beta', 1.05], ['af_nicole', 1.05]),
    'rohit': ({'name': 'Rohit', 'look': 'shirt', 'skin': '#c68642', 'tag': '#2b6cb0', 'colors': {'shirt': '#2b6cb0', 'shirt2': '#9ecbff'}}, ['hm_omega+hm_psi', 1.1], ['am_echo', 1.05]),
    'aunty': ({'name': 'Sharma Aunty', 'look': 'saree', 'skin': '#d39b6a', 'tag': '#3aa76d', 'colors': {'saree': '#3aa76d', 'blouse': '#e63946'}}, ['hf_beta', 1.0], ['af_sarah', 1.0]),
}
VOICE = {'hi': {'chacha': ['hm_omega', .98], 'male': ['hm_psi', 1.05], 'female': ['hf_alpha', 1.05]},
         'en': {'chacha': ['bm_george', 1.0], 'male': ['am_puck', 1.05], 'female': ['af_bella', 1.05]}}
SPEAKERS = ['hero', 'chacha', 'hero', 'chacha', 'chacha', 'cust', 'hero', 'chacha', 'chacha', 'hero']

IDEAS = [
 dict(slug='tyre-puncture-shop', title=('Tyre Puncture Ki Dukaan', 'Tyre Puncture Shop'), sign='ABDUL TIRE WALA', kind='tyre', cust='pandit', item='tyre',
  hero={'name': 'Abdul', 'look': 'lungi', 'skin': '#b5743f', 'stache': True, 'tag': '#2b6cb0'},
  final=('Abdul Ki Life Set! 😂', "Abdul's Life = Set! 😂"),
  stats={3: ('₹50,000', 'Total investment', 'Total kharcha'), 6: ('₹150', 'Per car puncture', 'Car puncture'), 7: ('₹1,500–2,500', 'Per day', 'Roz ki kamai')},
  lines=[
  ('नौकरी नहीं मिली यार... अब घर कैसे चलेगा?', 'Naukri nahi mili yaar... ab ghar kaise chalega?', 'No job again... how will I run the house now?'),
  ('अरे अब्दुल! रोना बंद कर। टायर पंक्चर की दुकान खोल ले!', 'Arre Abdul! Rona band kar. Tyre puncture ki dukaan khol le!', 'Arre Abdul, stop crying! Open a tyre puncture shop!'),
  ('पंक्चर की दुकान? उसमें कितना पैसा लगेगा, चाचा?', 'Puncture ki dukaan? Usme kitna paisa lagega, Chacha?', 'A puncture shop? How much money will that take, Chacha?'),
  ('बस पचास हज़ार। एक कंप्रेसर, टूल किट, और ट्यूबलेस किट।', 'Bas 50 hazaar. Ek compressor, tool kit, aur tubeless kit.', 'Just ₹50,000. A compressor, a tool kit and a tubeless repair kit.'),
  ('दुकान हाईवे या पेट्रोल पंप के पास खोलना। वहीं गाड़ियाँ सबसे ज़्यादा पंक्चर होती हैं।', 'Dukaan highway ya petrol pump ke paas kholna. Wahin gaadiyan sabse zyada puncture hoti hain.', "Open it near a highway or a petrol pump. That's where the most punctures happen."),
  ('भैया जल्दी करो! गाड़ी पंक्चर है, शादी में जाना है!', 'Bhaiya jaldi karo! Gaadi puncture hai, shaadi mein jaana hai!', "Hurry up, brother! My car has a puncture and I'm late for a wedding!"),
  ('दस मिनट, साहब। कार का डेढ़ सौ, बाइक का साठ।', 'Das minute, sahab. Car ka 150, bike ka 60.', 'Ten minutes, sir. ₹150 for a car, ₹60 for a bike.'),
  ('रोज़ पंद्रह-बीस गाड़ियाँ, यानी पंद्रह सौ से ढाई हज़ार रोज़ की कमाई।', 'Roz 15-20 gaadiyan, yaani ₹1,500 se ₹2,500 roz ki kamai.', 'Fifteen to twenty vehicles a day means ₹1,500 to ₹2,500 every day.'),
  ('टायर-ट्यूब बेचना, हवा भरना, सब एक्स्ट्रा कमाई। सुबह जल्दी खोलो, देर से बंद करो।', 'Tyre-tube bechna, hawa bharna, sab extra kamai. Subah jaldi kholo, der se band karo.', 'Selling tyres and tubes and filling air are extra income. Open early, close late.'),
  ('महीने के पचास-साठ हज़ार! अब्दुल की लाइफ़ सेट!', 'Mahine ke 50-60 hazaar! Abdul ki life set!', 'Fifty to sixty thousand a month! My life is set!')]),
 dict(slug='chai-stall', title=('Chai Ki Tapri', 'Tea Stall'), sign='RAJU CHAI WALA', kind='chai', cust='priya', item='glass', signColor='#ffb703',
  hero={'name': 'Raju', 'look': 'lungi', 'skin': '#a9683a', 'stache': True, 'tag': '#2f8f4e', 'colors': {'lungi': '#2f8f4e', 'lungi2': '#b7f0c8'}},
  final=('Raju Ki Life Set! 😂', "Raju's Life = Set! 😂"),
  stats={3: ('₹20,000', 'To start', 'Shuruaat'), 6: ('₹15', 'Per cup', 'Ek cup'), 7: ('₹1,500', 'Profit per day', 'Roz ka munafa')},
  lines=[
  ('बी.ए. पास हूँ, फिर भी बेरोज़गार। अब क्या करूँ?', 'B.A. pass hoon, phir bhi berozgaar. Ab kya karun?', 'I have a degree and still no job. What do I do now?'),
  ('अरे राजू, पूरा देश चाय पर चलता है। चाय की टपरी खोल!', 'Arre Raju, poora desh chai pe chalta hai. Chai ki tapri khol!', 'Arre Raju, the whole country runs on chai. Open a tea stall!'),
  ('चाय बेचकर कोई अमीर बनता है क्या, चाचा?', 'Chai bechkar koi ameer banta hai kya, Chacha?', 'Does anyone get rich selling tea, Chacha?'),
  ('शुरुआत बीस हज़ार में। ठेला, गैस, बर्तन, और अच्छी चायपत्ती।', 'Shuruaat 20 hazaar mein. Thela, gas, bartan, aur achhi chai patti.', 'You can start with ₹20,000. A stall, gas, utensils and good tea leaves.'),
  ('कॉलेज, ऑफ़िस या हॉस्पिटल के बाहर लगाना। वहाँ भीड़ कभी ख़त्म नहीं होती।', 'College, office ya hospital ke bahar lagana. Wahan bheed kabhi khatam nahi hoti.', 'Set up outside a college, office or hospital. The crowd there never ends.'),
  ('भैया, एक कटिंग चाय और दो बिस्कुट!', 'Bhaiya, ek cutting chai aur do biscuit!', 'Bhaiya, one cutting chai and two biscuits!'),
  ('ये लो मैडम, अदरक वाली स्पेशल। सिर्फ़ पंद्रह रुपये।', 'Ye lo madam, adrak wali special. Sirf 15 rupaye.', 'Here you go, madam, special ginger chai. Just ₹15.'),
  ('दिन के दो सौ कप, यानी लगभग पंद्रह सौ रुपये रोज़ का मुनाफ़ा।', 'Din ke 200 cup, yaani lagbhag ₹1,500 roz ka munafa.', 'Two hundred cups a day is about ₹1,500 profit every day.'),
  ('साथ में समोसा, बिस्कुट और बन-मस्का रखो। चाय से ज़्यादा उनमें कमाई है।', 'Saath mein samosa, biscuit aur bun-maska rakho. Chai se zyada unme kamai hai.', 'Keep samosas, biscuits and bun maska too. They earn more than the chai.'),
  ('महीने के चालीस हज़ार! राजू की लाइफ़ सेट!', 'Mahine ke 40 hazaar! Raju ki life set!', "Forty thousand a month! Raju's life is set!")]),
 dict(slug='mobile-repair', title=('Mobile Repair Shop', 'Mobile Repair Shop'), sign='SONU MOBILE WALA', kind='mobile', cust='pandit', item='phone', xhold='phone', signColor='#5fd0ff', signText='#1d3fa8',
  hero={'name': 'Sonu', 'look': 'shirt', 'skin': '#a9683a', 'tag': '#e24b4b'},
  final=('Sonu Ki Life Set! 😂', "Sonu's Life = Set! 😂"),
  stats={3: ('3 months', 'Training', 'Training'), 4: ('₹60,000', 'Tools + stock', 'Tools + stock'), 6: ('₹2,000', 'Screen replacement', 'Nayi screen'), 7: ('₹2,000–3,000', 'Per day', 'Roz ki kamai')},
  lines=[
  ('पूरा दिन फ़ोन चलाता हूँ, पर कमाई ज़ीरो।', 'Poora din phone chalata hoon, par kamai zero.', "I'm on my phone all day, but I earn zero."),
  ('तो फ़ोन चलाना छोड़, फ़ोन ठीक करना सीख! मोबाइल रिपेयर की दुकान खोल।', 'To phone chalana chhod, phone theek karna seekh! Mobile repair ki dukaan khol.', 'Then stop scrolling and learn to fix phones! Open a mobile repair shop.'),
  ('पर मुझे तो रिपेयर आता ही नहीं, चाचा!', 'Par mujhe to repair aata hi nahi, Chacha!', "But I don't know how to repair anything, Chacha!"),
  ('तीन महीने का कोर्स कर। फिर किसी दुकान पर छह महीने काम सीख।', 'Teen mahine ka course kar. Phir kisi dukaan pe chhe mahine kaam seekh.', 'Do a three-month course. Then learn on the job at a shop for six months.'),
  ('फिर साठ हज़ार में टूल्स, सोल्डरिंग मशीन और थोड़ा स्पेयर स्टॉक।', 'Phir 60 hazaar mein tools, soldering machine aur thoda spare stock.', 'Then ₹60,000 for tools, a soldering station and some spare parts.'),
  ('बेटा, मेरे फ़ोन की स्क्रीन टूट गई। पोते ने फेंक दिया!', 'Beta, mere phone ki screen toot gayi. Pote ne phenk diya!', 'Son, my phone screen is broken. My grandson threw it!'),
  ('एक घंटे में नई स्क्रीन, अंकल। दो हज़ार रुपये।', 'Ek ghante mein nayi screen, uncle. 2 hazaar rupaye.', 'New screen in one hour, uncle. ₹2,000.'),
  ('हर स्क्रीन पर आठ सौ तक का मुनाफ़ा। रोज़ के दो से तीन हज़ार आराम से।', 'Har screen pe 800 tak ka munafa. Roz ke 2-3 hazaar aaram se.', 'Up to ₹800 profit on every screen. ₹2,000 to ₹3,000 a day, easily.'),
  ('और कवर, चार्जर, टेम्पर्ड ग्लास बेच। बीस का ग्लास, डेढ़ सौ में बिकता है!', 'Aur cover, charger, tempered glass bech. 20 ka glass, 150 mein bikta hai!', 'And sell covers, chargers and screen guards. A ₹20 guard sells for ₹150!'),
  ('सोनू मोबाइल वाला, अब शहर में नंबर वन! लाइफ़ सेट!', 'Sonu Mobile Wala, ab sheher mein number one! Life set!', 'Sonu Mobile Wala, number one in town! Life set!')]),
 dict(slug='tiffin-service', title=('Tiffin Service', 'Tiffin Service'), sign='SUNITA TIFFIN SERVICE', kind='tiffin', cust='rohit', item='tiffin', signColor='#ffd23f', wall='#ffe3c2',
  hero={'name': 'Sunita', 'look': 'saree', 'skin': '#c68642', 'tag': '#e63977', 'female': True},
  final=('Sunita Ki Life Set! 😂', "Sunita's Life = Set! 😂"),
  stats={3: ('₹15,000', 'To start', 'Shuruaat'), 6: ('₹3,000', 'Per month, per person', 'Mahina, per grahak'), 7: ('₹90,000', '30 tiffins a month', '30 tiffin / mahina')},
  lines=[
  ('घर का ख़र्चा बढ़ता जा रहा है, और मैं घर पर बैठी हूँ।', 'Ghar ka kharcha badhta ja raha hai, aur main ghar pe baithi hoon.', "Household costs keep rising, and I'm just sitting at home."),
  ('सुनीता बेटी, तुम्हारे हाथ का खाना पूरा मोहल्ला याद करता है। टिफ़िन सर्विस शुरू करो!', 'Sunita beti, tumhare haath ka khana poora mohalla yaad karta hai. Tiffin service shuru karo!', 'Sunita, the whole street remembers your cooking. Start a tiffin service!'),
  ('पर खाना ख़रीदेगा कौन, चाचा जी?', 'Par khana kharidega kaun, Chacha ji?', 'But who will buy it, Chacha ji?'),
  ('पास के हॉस्टल, पीजी और ऑफ़िस वाले। शुरुआत पंद्रह हज़ार में, टिफ़िन और बड़े बर्तन।', 'Paas ke hostel, PG aur office wale. Shuruaat 15 hazaar mein, tiffin aur bade bartan.', 'Hostels, PGs and offices nearby. Start with ₹15,000 for tiffins and big pots.'),
  ('व्हाट्सऐप ग्रुप बनाओ, रोज़ का मेन्यू डालो। और एफ़ एस एस ए आई रजिस्ट्रेशन ज़रूर कराना।', 'WhatsApp group banao, roz ka menu daalo. Aur FSSAI registration zaroor karana.', 'Make a WhatsApp group and post the daily menu. And get your FSSAI food registration.'),
  ('आंटी, हॉस्टल का खाना खाकर तंग आ गया। महीने का टिफ़िन लगा दो!', 'Aunty, hostel ka khana khaake tang aa gaya. Mahine ka tiffin laga do!', "Aunty, I'm sick of hostel food. Sign me up for a monthly tiffin!"),
  ('दाल, सब्ज़ी, चार रोटी, चावल। महीने के तीन हज़ार।', 'Daal, sabzi, chaar roti, chawal. Mahine ke 3 hazaar.', 'Dal, sabzi, four rotis and rice. ₹3,000 a month.'),
  ('तीस ग्राहक, यानी महीने के नब्बे हज़ार। ख़र्चा निकाल कर भी पैंतीस-चालीस हज़ार बचेंगे।', '30 grahak, yaani mahine ke 90 hazaar. Kharcha nikaal kar bhi 35-40 hazaar bachenge.', 'Thirty customers means ₹90,000 a month. Even after costs, ₹35,000 to ₹40,000 stays with you.'),
  ('ग्राहक बढ़ें, तो डिलीवरी के लिए एक लड़का रख लेना।', 'Grahak badhein, to delivery ke liye ek ladka rakh lena.', 'When customers grow, hire a delivery boy.'),
  ('घर बैठे बिज़नेस! सुनीता की लाइफ़ सेट!', 'Ghar baithe business! Sunita ki life set!', "A business from home! Sunita's life is set!")]),
 dict(slug='sugarcane-juice', title=('Ganne Ka Juice', 'Sugarcane Juice Stall'), sign='PAPPU GANNA JUICE', kind='ganna', cust='pandit', item='juice', signColor='#b8f05a', signText='#1f6b35', start='street',
  hero={'name': 'Pappu', 'look': 'lungi', 'skin': '#b5743f', 'stache': True, 'tag': '#c0392b', 'colors': {'lungi': '#c0392b', 'lungi2': '#ffd0c8'}},
  final=('Pappu Ki Life Set! 😂', "Pappu's Life = Set! 😂"),
  stats={3: ('₹70,000', 'Machine + cart', 'Machine + thela'), 6: ('₹30', 'Per glass', 'Ek glass'), 7: ('₹3,000', 'Per summer day', 'Garmi mein roz')},
  lines=[
  ('इतनी गर्मी में काम ढूँढते-ढूँढते पसीने छूट गए।', 'Itni garmi mein kaam dhoondhte-dhoondhte paseene chhoot gaye.', 'Looking for work in this heat has me sweating buckets.'),
  ('पप्पू, इसी गर्मी को बिज़नेस बना! गन्ने के जूस का ठेला लगा!', 'Pappu, isi garmi ko business bana! Ganne ke juice ka thela laga!', 'Pappu, turn this heat into business! Start a sugarcane juice stall!'),
  ('मशीन तो बहुत महँगी होगी, चाचा?', 'Machine to bahut mehngi hogi, Chacha?', 'The machine must be really expensive, Chacha?'),
  ('मोटर वाली मशीन और ठेला, सब मिलाकर लगभग सत्तर हज़ार।', 'Motor wali machine aur thela, sab milakar lagbhag 70 hazaar.', 'A motorised machine and a cart, about ₹70,000 in all.'),
  ('मशीन साफ़ रखना, बर्फ़ साफ़ पानी की, और नींबू-अदरक डालना। लोग स्वाद के लिए लौटकर आते हैं।', 'Machine saaf rakhna, barf saaf paani ki, aur nimbu-adrak daalna. Log swaad ke liye laut kar aate hain.', 'Keep the machine clean, use clean ice, add lemon and ginger. People come back for the taste.'),
  ('भैया, एक बड़ा गिलास, बर्फ़ डाल के! गला सूख गया!', 'Bhaiya, ek bada glass, barf daal ke! Gala sookh gaya!', 'Bhaiya, one large glass with ice! My throat is dry!'),
  ('ठंडा-ठंडा गन्ना जूस। तीस रुपये गिलास!', 'Thanda-thanda ganna juice. 30 rupaye glass!', 'Ice-cold sugarcane juice. ₹30 a glass!'),
  ('एक गिलास में गन्ना बस छह-सात रुपये का। गर्मी में दिन के तीन हज़ार तक बचते हैं।', 'Ek glass mein ganna bas 6-7 rupaye ka. Garmi mein din ke 3 hazaar tak bachte hain.', 'The cane in a glass costs just ₹6 or ₹7. In summer you can keep up to ₹3,000 a day.'),
  ('पर ये सीज़नल है। सर्दी में यही ठेला सूप या भुट्टे का बना देना।', 'Par ye seasonal hai. Sardi mein yahi thela soup ya bhutte ka bana dena.', 'But it is seasonal. In winter, turn the same cart into soup or roasted corn.'),
  ('गर्मी आई, पैसा लाई! पप्पू की लाइफ़ सेट!', 'Garmi aayi, paisa laayi! Pappu ki life set!', "Summer came and brought money! Pappu's life is set!")]),
 dict(slug='pani-puri-cart', title=('Golgappe Ka Thela', 'Pani Puri Cart'), sign='GOLU GOLGAPPE WALA', kind='golgappa', cust='priya', item='plate', signColor='#ffcf4a',
  hero={'name': 'Golu', 'look': 'shirt', 'skin': '#c68642', 'tag': '#f28c28', 'colors': {'shirt': '#f28c28', 'shirt2': '#fff3b0'}},
  final=('Golu Ki Life Set! 😂', "Golu's Life = Set! 😂"),
  stats={3: ('₹15,000', 'To start', 'Shuruaat'), 6: ('₹40', 'Per plate', 'Ek plate'), 7: ('₹1,500–2,000', 'Profit per day', 'Roz ka munafa')},
  lines=[
  ('दोस्तों की नौकरी लग गई, मेरी अभी तक नहीं।', 'Doston ki naukri lag gayi, meri abhi tak nahi.', "All my friends got jobs. I still haven't."),
  ('गोलू, पूरा शहर किस चीज़ के लिए लाइन लगाता है? गोलगप्पे! ठेला लगा!', 'Golu, poora sheher kis cheez ke liye line lagata hai? Golgappe! Thela laga!', 'Golu, what does the whole city queue up for? Pani puri! Start a cart!'),
  ('गोलगप्पे? उसमें कितना ख़र्चा आएगा?', 'Golgappe? Usme kitna kharcha aayega?', 'Pani puri? How much will that cost?'),
  ('ठेला, मटके, बर्तन, सब पंद्रह हज़ार में।', 'Thela, matke, bartan, sab 15 hazaar mein.', 'Cart, pots and utensils, all for ₹15,000.'),
  ('सफ़ाई रखना! दस्ताने पहनो, पानी फ़िल्टर का। साफ़ ठेले पर भीड़ दुगनी लगती है।', 'Safai rakhna! Dastaane pehno, paani filter ka. Saaf thele pe bheed dugni lagti hai.', 'Keep it clean! Wear gloves and use filtered water. A clean cart draws double the crowd.'),
  ('भैया, तीखा वाला! और लास्ट में सूखी पूरी फ़्री!', 'Bhaiya, teekha wala! Aur last mein sookhi puri free!', 'Bhaiya, extra spicy! And the last dry puri is free!'),
  ('छह गोलगप्पे, चालीस रुपये। सूखी पूरी आपके लिए फ़्री, मैडम!', 'Chhe golgappe, 40 rupaye. Sookhi puri aapke liye free, madam!', 'Six puris for ₹40. And the dry puri is free for you, madam!'),
  ('शाम के चार घंटे, सौ प्लेट। आधा मुनाफ़ा, यानी पंद्रह सौ से दो हज़ार रोज़।', 'Shaam ke 4 ghante, 100 plate. Aadha munafa, yaani ₹1,500 se ₹2,000 roz.', 'Four evening hours, a hundred plates. Half is profit, so ₹1,500 to ₹2,000 a day.'),
  ('दही पूरी और चाट भी रखो। और शादी-पार्टी के ऑर्डर लो, वहाँ एक दिन में हफ़्ते की कमाई।', 'Dahi puri aur chaat bhi rakho. Aur shaadi-party ke order lo, wahan ek din mein hafte ki kamai.', 'Add dahi puri and chaat. And take wedding orders. One party pays like a whole week.'),
  ('गोलू के गोलगप्पे, फ़ुल डिमांड में! लाइफ़ सेट!', 'Golu ke golgappe, full demand mein! Life set!', "Golu's pani puri is in full demand! Life set!")]),
 dict(slug='xerox-shop', title=('Xerox Aur Online Form Shop', 'Xerox & Online Forms Shop'), sign='BUNTY XEROX CENTRE', kind='xerox', cust='pandit', item='paper', xhold='paper', signColor='#ffffff', signText='#1d4ed8',
  hero={'name': 'Bunty', 'look': 'shirt', 'skin': '#d39b6a', 'tag': '#3aa76d', 'colors': {'shirt': '#3aa76d', 'shirt2': '#d9f7c4'}},
  final=('Bunty Ki Life Set! 😂', "Bunty's Life = Set! 😂"),
  stats={3: ('₹1.5 lakh', 'Total setup', 'Total setup'), 6: ('₹2', 'Per copy', 'Ek copy'), 7: ('₹1,500+', 'Per day', 'Roz ki kamai')},
  lines=[
  ('दिन भर नौकरी के फ़ॉर्म भरता हूँ। पर जवाब कोई नहीं आता।', 'Din bhar naukri ke form bharta hoon. Par jawab koi nahi aata.', 'I fill job forms all day, but nobody ever replies.'),
  ('बंटी, जो फ़ॉर्म तू भरता है, वही दूसरों के भर! ज़ेरॉक्स और ऑनलाइन फ़ॉर्म की दुकान खोल!', 'Bunty, jo form tu bharta hai, wahi doosron ke bhar! Xerox aur online form ki dukaan khol!', 'Bunty, fill those forms for other people! Open a xerox and online forms shop!'),
  ('ज़ेरॉक्स मशीन? वो तो लाखों की आती है!', 'Xerox machine? Wo to laakhon ki aati hai!', 'A xerox machine? Those cost lakhs!'),
  ('पुरानी रीफ़र्बिश्ड मशीन, प्रिंटर, लैपटॉप और लैमिनेशन। डेढ़ लाख में सब।', 'Purani refurbished machine, printer, laptop aur lamination. Dedh lakh mein sab.', 'A refurbished machine, a printer, a laptop and a laminator. All for ₹1.5 lakh.'),
  ('दुकान कॉलेज, कचहरी या सरकारी दफ़्तर के पास लेना। वहाँ हर किसी को कॉपी चाहिए।', 'Dukaan college, kachehri ya sarkari daftar ke paas lena. Wahan har kisi ko copy chahiye.', 'Get a shop near a college, a court or a government office. Everyone there needs copies.'),
  ('बेटा, आधार की दस कॉपी, और ये पेंशन का फ़ॉर्म ऑनलाइन भर दो।', 'Beta, Aadhaar ki 10 copy, aur ye pension ka form online bhar do.', 'Son, ten copies of my Aadhaar, and fill in this pension form online.'),
  ('कॉपी दो रुपये की, और फ़ॉर्म भरने के सौ रुपये, अंकल।', 'Copy 2 rupaye ki, aur form bharne ke 100 rupaye, uncle.', '₹2 a copy, and ₹100 to fill in the form, uncle.'),
  ('एक कॉपी की लागत पचास पैसे। कॉपी, प्रिंट, फ़ॉर्म मिलाकर रोज़ के पंद्रह सौ से ज़्यादा।', 'Ek copy ki laagat 50 paise. Copy, print, form milakar roz ke ₹1,500 se zyada.', 'A copy costs 50 paise to make. Copies, prints and forms add up to over ₹1,500 a day.'),
  ('फ़ोटो, लैमिनेशन और स्टेशनरी भी रखो। एग्ज़ाम के सीज़न में तो लाइन लगेगी।', 'Photo, lamination aur stationery bhi rakho. Exam ke season mein to line lagegi.', "Add passport photos, lamination and stationery. In exam season there'll be a queue."),
  ('बंटी ज़ेरॉक्स, अब हर फ़ॉर्म यहीं! लाइफ़ सेट!', 'Bunty Xerox, ab har form yahin! Life set!', 'Bunty Xerox, every form done right here! Life set!')]),
 dict(slug='bike-car-wash', title=('Bike Aur Car Wash', 'Bike & Car Wash'), sign='KALLU WASHING CENTRE', kind='wash', cust='rohit', item='hose', signColor='#8fd3f4', signText='#1d3fa8',
  hero={'name': 'Kallu', 'look': 'lungi', 'skin': '#8d5524', 'stache': True, 'tag': '#6a4c93', 'colors': {'lungi': '#6a4c93', 'lungi2': '#e0d0ff'}},
  final=('Kallu Ki Life Set! 😂', "Kallu's Life = Set! 😂"),
  stats={3: ('₹60,000', 'Total setup', 'Total setup'), 6: ('₹120', 'Per bike wash', 'Bike wash'), 7: ('₹3,000+', 'Per day', 'Roz ki kamai')},
  lines=[
  ('सुबह से शाम तक घूमता हूँ, फिर भी जेब ख़ाली।', 'Subah se shaam tak ghoomta hoon, phir bhi jeb khaali.', 'I roam around from morning to night, and my pockets are still empty.'),
  ('कल्लू, शहर में गाड़ियाँ बहुत हैं, और धोने का टाइम किसी के पास नहीं। बाइक और कार वॉश खोल!', 'Kallu, sheher mein gaadiyan bahut hain, aur dhone ka time kisi ke paas nahi. Bike aur car wash khol!', 'Kallu, the city is full of vehicles and nobody has time to wash them. Open a bike and car wash!'),
  ('उसके लिए क्या-क्या चाहिए, चाचा?', 'Uske liye kya-kya chahiye, Chacha?', 'What do I need for that, Chacha?'),
  ('प्रेशर वॉशर, फ़ोम मशीन, वैक्यूम, और पानी वाली जगह। साठ हज़ार काफ़ी।', 'Pressure washer, foam machine, vacuum, aur paani wali jagah. 60 hazaar kaafi.', 'A pressure washer, a foam gun, a vacuum and a spot with water. ₹60,000 is enough.'),
  ('पानी की निकासी का इंतज़ाम रखना, और नगर पालिका से परमिशन ले लेना।', 'Paani ki nikasi ka intezaam rakhna, aur nagar palika se permission le lena.', 'Arrange proper drainage, and take permission from the municipality.'),
  ('भैया, बाइक कीचड़ से भरी है। आज डेट पे जाना है!', 'Bhaiya, bike keechad se bhari hai. Aaj date pe jaana hai!', 'Bhaiya, my bike is covered in mud, and I have a date today!'),
  ('फ़ोम वॉश, पॉलिश, शीशे जैसी चमक। बाइक एक सौ बीस, कार चार सौ।', 'Foam wash, polish, sheeshe jaisi chamak. Bike 120, car 400.', 'Foam wash and polish, shiny as a mirror. ₹120 a bike, ₹400 a car.'),
  ('रोज़ पंद्रह बाइक और पाँच कार, यानी दिन के तीन हज़ार से ज़्यादा।', 'Roz 15 bike aur 5 car, yaani din ke 3 hazaar se zyada.', 'Fifteen bikes and five cars a day means over ₹3,000 a day.'),
  ('और सोसाइटी में मंथली प्लान बेचो। रोज़ सुबह कार साफ़, छह सौ रुपये महीना।', 'Aur society mein monthly plan becho. Roz subah car saaf, 600 rupaye mahina.', 'And sell monthly plans in housing societies. A car cleaned every morning for ₹600 a month.'),
  ('कल्लू की गाड़ी चल पड़ी! लाइफ़ सेट!', 'Kallu ki gaadi chal padi! Life set!', "Kallu's business is rolling! Life set!")]),
 dict(slug='momos-stall', title=('Momos Ka Stall', 'Momos Stall'), sign='CHINTU MOMOS', kind='momos', cust='priya', item='plate', signColor='#ff6b6b', signText='#ffffff',
  hero={'name': 'Chintu', 'look': 'shirt', 'skin': '#b5743f', 'tag': '#1d4ed8', 'colors': {'shirt': '#1d4ed8', 'shirt2': '#ffd23f'}},
  final=('Chintu Ki Life Set! 😂', "Chintu's Life = Set! 😂"),
  stats={3: ('₹35,000', 'Total setup', 'Total setup'), 6: ('₹70', 'Per plate', 'Ek plate'), 7: ('₹2,500–3,000', 'Profit per day', 'Roz ki bachat')},
  lines=[
  ('घर वाले बोलते हैं कुछ काम कर। पर करूँ क्या?', 'Ghar wale bolte hain kuch kaam kar. Par karun kya?', 'My family keeps telling me to work. But doing what?'),
  ('चिंटू, आजकल हर गली में एक चीज़ बिकती है, मोमोज़! मोमोज़ का स्टॉल लगा!', 'Chintu, aajkal har gali mein ek cheez bikti hai, momos! Momos ka stall laga!', 'Chintu, one thing sells on every street these days: momos! Start a momos stall!'),
  ('पर मुझे मोमोज़ बनाने नहीं आते!', 'Par mujhe momos banane nahi aate!', "But I don't know how to make momos!"),
  ('यूट्यूब से सीख, दो हफ़्ते प्रैक्टिस कर। स्टीमर, ठेला, फ़्रिज, सब पैंतीस हज़ार में।', 'YouTube se seekh, do hafte practice kar. Steamer, thela, fridge, sab 35 hazaar mein.', 'Learn from YouTube and practise for two weeks. Steamer, cart and fridge, all for ₹35,000.'),
  ('असली जादू चटनी में है। ऐसी तीखी लाल चटनी बना, कि लोग दोबारा आएँ।', 'Asli jaadu chutney mein hai. Aisi teekhi laal chutney bana, ki log dobara aayein.', 'The real magic is the chutney. Make a red chutney so good that people come back.'),
  ('भैया, एक प्लेट स्टीम, एक प्लेट फ़्राइड। और चटनी एक्स्ट्रा!', 'Bhaiya, ek plate steam, ek plate fried. Aur chutney extra!', 'Bhaiya, one plate steamed, one plate fried. And extra chutney!'),
  ('आठ मोमोज़ की प्लेट, सत्तर रुपये। चटनी अनलिमिटेड!', 'Aath momos ki plate, 70 rupaye. Chutney unlimited!', 'Eight momos a plate for ₹70. Unlimited chutney!'),
  ('एक प्लेट की लागत पच्चीस-तीस रुपये। रोज़ अस्सी प्लेट, यानी ढाई-तीन हज़ार की बचत।', 'Ek plate ki laagat 25-30 rupaye. Roz 80 plate, yaani dhai-teen hazaar ki bachat.', 'A plate costs ₹25 to ₹30 to make. Eighty plates a day saves ₹2,500 to ₹3,000.'),
  ('तंदूरी और कुरकुरे मोमोज़ भी रख। उनका दाम ज़्यादा, मुनाफ़ा भी ज़्यादा।', 'Tandoori aur kurkure momos bhi rakh. Unka daam zyada, munafa bhi zyada.', 'Add tandoori and crispy momos too. They sell for more and earn more.'),
  ('चिंटू मोमोज़, शहर में फ़ेमस! लाइफ़ सेट!', 'Chintu Momos, sheher mein famous! Life set!', 'Chintu Momos, famous all over town! Life set!')]),
 dict(slug='ironing-press-stall', title=('Press Wala (Ironing)', 'Ironing Stall'), sign='MUNNA PRESS WALA', kind='press', cust='aunty', item='iron', signColor='#ffd23f',
  hero={'name': 'Munna', 'look': 'lungi', 'skin': '#a9683a', 'stache': True, 'tag': '#c0392b', 'colors': {'lungi': '#2b6cb0', 'lungi2': '#ffffff', 'vest': '#fff7d6'}},
  final=('Munna Ki Life Set! 😂', "Munna's Life = Set! 😂"),
  stats={3: ('₹10,000', 'To start', 'Shuruaat'), 6: ('₹15', 'Per piece', 'Ek kapda'), 7: ('₹2,000–3,000', 'Per day', 'Roz ki kamai')},
  lines=[
  ('छोटा-मोटा काम भी नहीं मिल रहा। क्या क़िस्मत है!', 'Chhota-mota kaam bhi nahi mil raha. Kya kismat hai!', "I can't even find small jobs. Just my luck!"),
  ('मुन्ना, हर घर में कपड़े प्रेस होते हैं, रोज़! प्रेस की दुकान खोल!', 'Munna, har ghar mein kapde press hote hain, roz! Press ki dukaan khol!', 'Munna, every home needs clothes ironed, every day! Open an ironing stall!'),
  ('प्रेस वाला? उसमें क्या कमाई होगी, चाचा?', 'Press wala? Usme kya kamai hogi, Chacha?', 'An ironing stall? How much can that earn, Chacha?'),
  ('भारी प्रेस, एक टेबल, और सोसाइटी के बाहर एक कोना। बस दस हज़ार।', 'Bhaari press, ek table, aur society ke bahar ek kona. Bas 10 hazaar.', 'A heavy iron, a table and a corner outside a housing society. Just ₹10,000.'),
  ('व्हाट्सऐप पर ऑर्डर ले, घर से कपड़े उठा, घर पर पहुँचा। यही तेरी सर्विस है।', 'WhatsApp pe order le, ghar se kapde utha, ghar pe pahuncha. Yahi teri service hai.', "Take orders on WhatsApp, pick up from homes, deliver back. That's your service."),
  ('मुन्ना, ये बीस कपड़े शाम तक चाहिए। साहब की मीटिंग है!', 'Munna, ye 20 kapde shaam tak chahiye. Sahab ki meeting hai!', 'Munna, I need these twenty clothes by evening. My husband has a meeting!'),
  ('शाम तक पक्का, आंटी जी। पंद्रह रुपये कपड़ा।', 'Shaam tak pakka, aunty ji. 15 rupaye kapda.', 'Done by evening, aunty ji. ₹15 a piece.'),
  ('रोज़ डेढ़-दो सौ कपड़े, यानी दो से तीन हज़ार रोज़।', 'Roz 150-200 kapde, yaani 2 se 3 hazaar roz.', 'One hundred fifty to two hundred pieces a day means ₹2,000 to ₹3,000 a day.'),
  ('स्टीम प्रेस ले ले, और ड्राई क्लीनर से टाई-अप कर। हर कपड़े पर कमीशन।', 'Steam press le le, aur dry cleaner se tie-up kar. Har kapde pe commission.', 'Get a steam iron and tie up with a dry cleaner. You earn commission on every piece.'),
  ('मुन्ना प्रेस वाला, पूरी सोसाइटी का फ़ेवरेट! लाइफ़ सेट!', 'Munna Press Wala, poori society ka favourite! Life set!', "Munna Press Wala, the whole society's favourite! Life set!")]),
]

def beats(idea, lang):
    sad_fx = 'sweat' if idea.get('start') == 'street' else 'tears'
    st = {k: [v[0], v[2] if lang == 'hi' else v[1]] for k, v in idea['stats'].items()}
    b = [
        dict(bg=idea.get('start', 'home'), cast=[['hero', 420, 1]], pose={'hero': 'sad'}, expr={'hero': 'sad'}, fx={'hero': sad_fx}),
        dict(cast=[['hero', 290, 1], ['chacha', 790, -1]], pose={'hero': 'idle', 'chacha': 'point'}, expr={'hero': 'shock', 'chacha': 'smug'}, fx={'chacha': 'idea'}),
        dict(pose={'hero': 'scratch', 'chacha': 'hips'}, expr={'hero': 'think', 'chacha': 'neutral'}, fx={'hero': 'question'}),
        dict(pose={'hero': 'idle', 'chacha': 'count'}, expr={'hero': 'neutral', 'chacha': 'happy'}),
        dict(pose={'hero': 'think', 'chacha': 'explain'}, expr={'hero': 'think', 'chacha': 'smug'}),
        dict(bg='shop', cast=[['hero', 280, 1], ['cust', 790, -1]], pose={'hero': 'hips', 'cust': 'explain'}, expr={'hero': 'happy', 'cust': 'shock'}, fx={'cust': 'sweat'},
             hold={'cust': idea.get('xhold')} if idea.get('xhold') else {}),
        dict(pose={'hero': 'give', 'cust': 'idle'}, expr={'cust': 'happy'}, hold={'hero': idea['item'], 'cust': None}),
        dict(cast=[['hero', 220, 1], ['chacha', 560, -1], ['cust', 880, -1]], pose={'hero': 'money', 'chacha': 'count', 'cust': 'idle'}, expr={'hero': 'happy', 'chacha': 'happy', 'cust': 'lol'},
             hold={'hero': 'cash', 'cust': idea['item']}, fx={'hero': 'stars'}),
        dict(pose={'chacha': 'explain', 'hero': 'think'}, expr={'chacha': 'smug', 'hero': 'smug'}, fx={}),
        dict(cast=[['hero', 240, 1], ['chacha', 560, -1], ['cust', 870, -1]], pose={'hero': 'cheer', 'chacha': 'cheer', 'cust': 'cheer'}, expr={'hero': 'lol', 'chacha': 'lol', 'cust': 'lol'},
             hold={'hero': None, 'cust': None}, final=True),
    ]
    for k, v in st.items(): b[k]['stat'] = v
    return b

def tts_en(s): return re.sub(r'₹([\d,.]+)( lakh)?', lambda m: f"{m.group(1)}{m.group(2) or ''} rupees", s)

for n, idea in enumerate(IDEAS, 1):
    d = f"{H}/{n:02d}-{idea['slug']}"; os.makedirs(d, exist_ok=True)
    hero = idea['hero']; cust, cv_hi, cv_en = CUST[idea['cust']]
    for lang in ('hi', 'en'):
        V = VOICE[lang]; i = 0 if lang == 'hi' else 1
        ep = dict(num=n, of=100, title=idea['title'][i], sign=idea['sign'], kind=idea['kind'], final=idea['final'][i], note=NOTE[lang],
                  cast={'hero': hero, 'chacha': CHACHA, 'cust': cust}, **{k: idea[k] for k in ('signColor', 'signText', 'wall') if k in idea})
        bs = beats(idea, lang)
        lines = [[sp, bs[j], (l[0] if lang == 'hi' else tts_en(l[2])), (l[1] if lang == 'hi' else l[2])] for j, (sp, l) in enumerate(zip(SPEAKERS, idea['lines']))]
        voices = {'chacha': V['chacha'], 'hero': V['female' if hero.get('female') else 'male'], 'cust': cv_hi if lang == 'hi' else cv_en}
        out = f"{n:02d}-{idea['slug']}-{'hindi' if lang == 'hi' else 'english'}"
        json.dump(dict(out=out, ep=ep, voices=voices, sections=[dict(name=idea['title'][1], lines=lines)]), open(f"{d}/script-{lang}.json", 'w'), ensure_ascii=False, indent=1)
print(len(IDEAS), 'ideas')
