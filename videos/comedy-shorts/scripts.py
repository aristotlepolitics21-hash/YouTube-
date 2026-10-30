# Desi Comedy Shorts: 2D cartoon characters over real photos, a white emoji title box on top, Hindi voices, Hinglish captions.
# Drawn by ../business-ideas/engine (photo backgrounds, mode 'comedy'). Each line: (speaker, beat, Devanagari, caption).
# A beat: bg 'photo:KEY' (bg/KEY.jpg), cast [[id, x, facing, extra]], pose/expr/fx/hold per character; the last beat is final.
# Writes NN-slug/script.json.
import json, os
H = os.path.dirname(os.path.abspath(__file__))
S = 1.28  # characters stand big in the frame, as in the reference

# the three looks from the reference, reused under different names in each skit
def uncle(name, **k): return dict(name=name, look='lungi', skin='#c68642', stache='big', tag='#f28c28', colors={'lungi': '#2b6cb0', 'lungi2': '#9ecbff', 'gamcha': '#f28c28', **k.pop('colors', {})}, **k)
def boss(name, **k): return dict(name=name, look='suit', skin='#f4f4f4', bigeye=True, hair='spiky', hairColor='#f28c28', tag='#e63946', colors={'suit': '#1d1d24', 'tie': '#d62828'}, **k)
def shades(name, **k): return dict(name=name, look='suit', skin='#f0c8a0', hair='shaggy', shades=True, tag='#1d1d24', colors={'suit': '#1d1d24', 'tie': '#ffffff', **k.pop('colors', {})}, **k)
V = {'uncle': ['hm_psi', .96], 'boss': ['hm_omega', 1.06], 'shades': ['hm_omega+hm_psi', 1.08], 'kid': ['hm_psi', 1.16], 'f1': ['hf_alpha', 1.06], 'f2': ['hf_beta', 1.02]}
def C(id, x, f=1, **e): return [id, x, f, {'s': S, **e}]

SKITS = [
 dict(n=1, slug='10th-fail-engineer', title='😆 Power of 10th fail 😆', bg='road', final='10th fail, 100% dimaag 😆',
  cast={'boss': boss('Engineer Sahab'), 'shades': shades('Contractor'), 'bhola': uncle('Bhola')}, voices={'boss': V['boss'], 'shades': V['shades'], 'bhola': V['uncle']},
  lines=[
  ('boss', dict(bg='photo:road', cast=[C('boss', 200, 1), C('bhola', 560, -1), C('shades', 850, -1)], pose={'boss': 'explain'}, expr={'boss': 'neutral', 'bhola': 'neutral'}), 'इस सड़क की लंबाई नापनी है। मेज़रिंग टेप दो दिन में आएगा।', 'Is sadak ki lambai napni hai. Measuring tape do din mein aayega.'),
  ('shades', dict(pose={'shades': 'shrug', 'boss': 'idle'}, expr={'shades': 'sad'}), 'सर, तब तक काम बंद रहेगा।', 'Sir, tab tak kaam band rahega.'),
  ('bhola', dict(pose={'bhola': 'count', 'shades': 'idle'}, expr={'bhola': 'smug', 'shades': 'neutral'}, fx={'bhola': 'idea'}), 'साहब, टेप की क्या ज़रूरत? मेरी चप्पल पूरी एक फ़ुट की है।', 'Sahab, tape ki kya zaroorat? Meri chappal poori ek foot ki hai.'),
  ('boss', dict(pose={'boss': 'shrug', 'bhola': 'idle'}, expr={'boss': 'think'}, fx={'boss': 'question'}), 'तो?', 'To?'),
  ('bhola', dict(cast=[C('boss', 200, 1), C('bhola', 760, 1), C('shades', 890, -1)], pose={'bhola': 'point'}, expr={'bhola': 'happy'}, fx={}), 'मैं चलता हूँ, आप गिनती करते जाओ!', 'Main chalta hoon, aap ginti karte jao!'),
  ('boss', dict(pose={'boss': 'cheer', 'bhola': 'hips', 'shades': 'facepalm'}, expr={'boss': 'lol', 'bhola': 'smug', 'shades': 'shock'}, final=True), 'वाह! इसको चीफ़ इंजीनियर बना दो!', 'Waah! Isko chief engineer bana do!')]),
 dict(n=2, slug='interview-imaandari', title='😂 Interview mein imaandari 😂', bg='office', final='Seedha jawab 😆',
  cast={'boss': boss('Boss'), 'pappu': uncle('Pappu'), 'hr': shades('HR Sir')}, voices={'boss': V['boss'], 'pappu': V['uncle'], 'hr': V['shades']},
  lines=[
  ('boss', dict(bg='photo:office', cast=[C('boss', 250, 1), C('pappu', 720, -1)], pose={'boss': 'explain'}, expr={'pappu': 'neutral'}), 'अपनी सबसे बड़ी कमज़ोरी बताओ।', 'Apni sabse badi kamzori batao.'),
  ('pappu', dict(pose={'pappu': 'hips', 'boss': 'idle'}, expr={'pappu': 'smug'}), 'ईमानदारी, साहब।', 'Imaandaari, sahab.'),
  ('boss', dict(pose={'boss': 'shrug', 'pappu': 'idle'}, expr={'boss': 'think'}, fx={'boss': 'question'}), 'ईमानदारी कोई कमज़ोरी नहीं होती!', 'Imaandaari koi kamzori nahi hoti!'),
  ('pappu', dict(pose={'pappu': 'shrug', 'boss': 'idle'}, expr={'pappu': 'smug', 'boss': 'shock'}, fx={}), 'मुझे आपकी राय से कोई फ़र्क़ नहीं पड़ता।', 'Mujhe aapki raay se koi farq nahi padta.'),
  ('hr', dict(cast=[C('boss', 230, 1), C('pappu', 600, -1), C('hr', 860, -1)], pose={'hr': 'point', 'boss': 'facepalm'}, expr={'hr': 'lol', 'boss': 'shock'}, final=True), 'सर, बंदा ईमानदार तो है!', 'Sir, banda imaandaar to hai!')]),
 dict(n=3, slug='maths-ka-genius', title='😆 Maths ka genius 😆', bg='classroom', final='Business mind 😆',
  cast={'teacher': dict(name='Masterji', look='kurta', skin='#d39b6a', glasses=True, hair='bald', grey=True, stache=True, tag='#3aa76d', colors={'kurta': '#f4f1e8', 'jacket': '#6b4c3b'}),
        'golu': dict(name='Golu', look='shirt', skin='#c68642', hair='puffy', tag='#e24b4b', s=1.0, colors={'shirt': '#ffffff', 'shirt2': '#cfe0ff', 'pants': '#2f4f8f'})},
  voices={'teacher': ['hm_omega', .95], 'golu': V['kid']},
  lines=[
  ('teacher', dict(bg='photo:classroom', cast=[C('teacher', 280, 1), C('golu', 760, -1, s=1.05)], pose={'teacher': 'explain'}), 'गोलू, तुम्हारे पास दस आम हैं। मैंने पाँच माँग लिए। कितने बचे?', 'Golu, tumhare paas 10 aam hain. Maine 5 maang liye. Kitne bache?'),
  ('golu', dict(pose={'golu': 'count', 'teacher': 'idle'}, expr={'golu': 'smug'}), 'दस, सर।', '10, sir.'),
  ('teacher', dict(pose={'teacher': 'shrug', 'golu': 'idle'}, expr={'teacher': 'angry'}, fx={'teacher': 'question'}), 'दस कैसे?', '10 kaise?'),
  ('golu', dict(pose={'golu': 'hips', 'teacher': 'facepalm'}, expr={'golu': 'lol', 'teacher': 'shock'}, fx={}, final=True), 'क्योंकि मैं दूँगा ही नहीं!', 'Kyunki main dunga hi nahi!')]),
 dict(n=4, slug='bhoolne-ki-bimari', title='😂 Bhoolne ki bimari 😂', bg='clinic', final='Doctor bhi confuse 😆',
  cast={'doc': shades('Doctor Sahab', colors={'suit': '#f4f6f8', 'tie': '#3d7bff'}), 'chhedi': uncle('Chhedi Lal')}, voices={'doc': V['shades'], 'chhedi': V['uncle']},
  lines=[
  ('chhedi', dict(bg='photo:clinic', cast=[C('chhedi', 300, 1), C('doc', 760, -1)], pose={'chhedi': 'scratch'}, expr={'chhedi': 'sad'}), 'डॉक्टर साहब, मुझे भूलने की बीमारी है।', 'Doctor sahab, mujhe bhoolne ki bimari hai.'),
  ('doc', dict(pose={'doc': 'explain', 'chhedi': 'idle'}, expr={'doc': 'think'}), 'अच्छा? ये बीमारी कब से है?', 'Achha? Ye bimari kab se hai?'),
  ('chhedi', dict(pose={'chhedi': 'shrug', 'doc': 'idle'}, expr={'chhedi': 'shock'}, fx={'chhedi': 'question'}), 'कौन सी बीमारी?', 'Kaun si bimari?'),
  ('doc', dict(pose={'doc': 'facepalm', 'chhedi': 'idle'}, expr={'doc': 'sad', 'chhedi': 'neutral'}, fx={}), 'ठीक है, फ़ीस पहले दे दो। पाँच सौ रुपये।', 'Theek hai, fees pehle de do. 500 rupaye.'),
  ('chhedi', dict(pose={'chhedi': 'shrug', 'doc': 'shrug'}, expr={'chhedi': 'smug', 'doc': 'shock'}, final=True), 'कौन सी फ़ीस?', 'Kaun si fees?')]),
 dict(n=5, slug='bargaining-ka-badla', title='😆 Bhaiya, 8 ka de do 😆', bg='kirana', final='Bargaining ka badla 😆',
  cast={'lallu': uncle('Lallu Dukaandar', colors={'lungi': '#2f8f4e', 'lungi2': '#b7f0c8'}), 'aunty': dict(name='Aunty Ji', look='saree', skin='#d39b6a', tag='#e63977', colors={'saree': '#e63977', 'blouse': '#ffd23f'})},
  voices={'lallu': V['uncle'], 'aunty': V['f2']},
  lines=[
  ('aunty', dict(bg='photo:kirana', cast=[C('lallu', 300, 1), C('aunty', 760, -1)], pose={'aunty': 'point'}), 'भैया, ये बिस्कुट का पैकेट कितने का?', 'Bhaiya, ye biscuit ka packet kitne ka?'),
  ('lallu', dict(pose={'lallu': 'count', 'aunty': 'idle'}, expr={'lallu': 'happy'}), 'दस रुपये का, बहन जी। दस बिस्कुट हैं।', '10 rupaye ka, behen ji. 10 biscuit hain.'),
  ('aunty', dict(pose={'aunty': 'hips', 'lallu': 'idle'}, expr={'aunty': 'smug'}), 'आठ का दे दो ना।', '8 ka de do na.'),
  ('lallu', dict(pose={'lallu': 'give', 'aunty': 'idle'}, hold={'lallu': 'plate'}, expr={'lallu': 'smug', 'aunty': 'happy'}, fx={'lallu': 'idea'}), 'ठीक है। ये लो, आठ रुपये में आठ बिस्कुट!', 'Theek hai. Ye lo, 8 rupaye mein 8 biscuit!'),
  ('aunty', dict(pose={'aunty': 'shrug', 'lallu': 'idle'}, hold={'lallu': None}, expr={'aunty': 'shock'}, fx={'aunty': 'question'}), 'और बाक़ी दो?', 'Aur baaki do?'),
  ('lallu', dict(pose={'lallu': 'hips', 'aunty': 'facepalm'}, expr={'lallu': 'lol', 'aunty': 'angry'}, fx={}, final=True), 'वो आपकी दो रुपये की बचत में गए!', 'Wo aapki 2 rupaye ki bachat mein gaye!')]),
 dict(n=6, slug='helmet-kahan-hai', title='😂 Helmet kahan hai? 😂', bg='traffic', final='Helmet pehno, dard nahi hoga 😆',
  cast={'cop': shades('Havaldar', hat='cap', colors={'suit': '#8a7a3a', 'tie': '#c9b47a', 'hat': '#8a7a3a'}), 'bunty': dict(name='Bunty', look='tshirt', skin='#c68642', hair='spiky', tag='#3d7bff', colors={'shirt': '#3d7bff', 'pants': '#2a2a30', 'logo': 'COOL'})},
  voices={'cop': V['shades'], 'bunty': V['kid']},
  lines=[
  ('cop', dict(bg='photo:traffic', cast=[C('cop', 300, 1), C('bunty', 760, -1)], pose={'cop': 'point'}, expr={'cop': 'angry'}), 'रुको! हेलमेट कहाँ है?', 'Ruko! Helmet kahan hai?'),
  ('bunty', dict(pose={'bunty': 'shrug', 'cop': 'idle'}, expr={'bunty': 'smug'}), 'सर, घर पे है।', 'Sir, ghar pe hai.'),
  ('cop', dict(pose={'cop': 'hips', 'bunty': 'idle'}, expr={'cop': 'think'}, fx={'cop': 'question'}), 'घर पे क्यों?', 'Ghar pe kyun?'),
  ('bunty', dict(pose={'bunty': 'scratch', 'cop': 'idle'}, expr={'bunty': 'happy'}, fx={}), 'सर, सर में दर्द था, तो उसे आराम करने छोड़ आया।', 'Sir, sar mein dard tha, to use aaram karne chhod aaya.'),
  ('cop', dict(pose={'cop': 'count', 'bunty': 'facepalm'}, hold={'cop': 'paper'}, expr={'cop': 'smug', 'bunty': 'shock'}, fx={'bunty': 'sweat'}, final=True), 'अच्छा? तो चालान भी आराम से कटेगा। हज़ार रुपये!', 'Achha? To challan bhi aaram se katega. 1000 rupaye!')]),
 dict(n=7, slug='wifi-password', title='😆 WiFi ka password 😆', bg='street', final='Smart padosi 😆',
  cast={'sharma': uncle('Sharma Uncle', colors={'lungi': '#8a5a30', 'lungi2': '#f0d9a8'}), 'monu': dict(name='Monu', look='hoodie', skin='#d39b6a', hair='puffy', tag='#9b5de5', colors={'hoodie': '#9b5de5', 'pants': '#2a2a30'})},
  voices={'sharma': V['uncle'], 'monu': V['kid']},
  lines=[
  ('sharma', dict(bg='photo:street', cast=[C('sharma', 300, 1), C('monu', 760, -1)], pose={'sharma': 'wave'}, expr={'sharma': 'happy'}), 'मोनू बेटा, तुम्हारे वाई फ़ाई का पासवर्ड क्या है?', 'Monu beta, tumhare WiFi ka password kya hai?'),
  ('monu', dict(pose={'monu': 'hips', 'sharma': 'idle'}, expr={'monu': 'smug'}), 'पहले चाय पिलाओ।', 'Pehle chai pilao.'),
  ('sharma', dict(pose={'sharma': 'shrug', 'monu': 'idle'}, expr={'sharma': 'angry'}), 'अरे पिला दूँगा, पहले पासवर्ड तो बताओ!', 'Arre pila dunga, pehle password to batao!'),
  ('monu', dict(pose={'monu': 'facepalm', 'sharma': 'idle'}, expr={'monu': 'sad'}), 'वही तो बताया, अंकल। पहले चाय पिलाओ, बिना स्पेस के!', 'Wahi to bataya, uncle. PehleChaiPilao, bina space ke!'),
  ('sharma', dict(pose={'sharma': 'cheer', 'monu': 'shock'}, expr={'sharma': 'lol', 'monu': 'shock'}, final=True), 'वाह! अब तो रोज़ चाय भी मिलेगी, और इंटरनेट भी!', 'Waah! Ab to roz chai bhi milegi, aur internet bhi!')]),
 dict(n=8, slug='topper-ki-copy', title='😂 Topper ki copy 😂', bg='exam', final='Copy bhi imaandari se 😆',
  cast={'sir': boss('Examiner Sir'), 'raju': uncle('Raju', colors={'lungi': '#6a4c93', 'lungi2': '#e0d0ff'})}, voices={'sir': V['boss'], 'raju': V['uncle']},
  lines=[
  ('sir', dict(bg='photo:exam', cast=[C('sir', 270, 1), C('raju', 760, -1)], pose={'sir': 'point'}, hold={'sir': 'paper'}, expr={'sir': 'angry'}), 'राजू! तुमने पूरा पेपर रोहित से कॉपी किया है!', 'Raju! Tumne poora paper Rohit se copy kiya hai!'),
  ('raju', dict(pose={'raju': 'namaste', 'sir': 'idle'}, expr={'raju': 'sad'}), 'नहीं सर, क़सम से, अपना लिखा है।', 'Nahi sir, kasam se, apna likha hai.'),
  ('sir', dict(pose={'sir': 'shrug', 'raju': 'idle'}, expr={'sir': 'think'}, fx={'sir': 'question'}), 'तो कॉपी पे नाम रोहित क्यों लिखा है?', 'To copy pe naam Rohit kyun likha hai?'),
  ('raju', dict(pose={'raju': 'scratch', 'sir': 'facepalm'}, hold={'sir': None}, expr={'raju': 'smug', 'sir': 'shock'}, fx={}, final=True), 'सर, इमोशनल अटैचमेंट हो गया था।', 'Sir, emotional attachment ho gaya tha.')]),
 dict(n=9, slug='chaiwala-shark-pitch', title='😆 Power of 10th fail investor 😆', bg='boardroom', final='Profit from day 1 😆',
  cast={'shark': boss('Shark Sir'), 'shark2': shades('Investor Ji'), 'kallu': uncle('Kallu Chaiwala')}, voices={'shark': V['boss'], 'shark2': V['shades'], 'kallu': V['uncle']},
  lines=[
  ('shark', dict(bg='photo:boardroom', cast=[C('shark', 210, 1), C('kallu', 560, -1), C('shark2', 855, -1)], pose={'shark': 'explain'}), 'आपका बिज़नेस क्या है?', 'Aapka business kya hai?'),
  ('kallu', dict(pose={'kallu': 'give', 'shark': 'idle'}, hold={'kallu': 'glass'}, expr={'kallu': 'happy'}), 'चाय, साहब। रोज़ पाँच सौ कप।', 'Chai, sahab. Roz 500 cup.'),
  ('shark2', dict(pose={'shark2': 'shrug', 'kallu': 'idle'}, expr={'shark2': 'think'}, fx={'shark2': 'question'}), 'इसमें टेक्नोलॉजी कहाँ है?', 'Isme technology kahan hai?'),
  ('kallu', dict(pose={'kallu': 'wave', 'shark2': 'idle'}, hold={'kallu': 'phone'}, expr={'kallu': 'smug'}, fx={'kallu': 'idea'}), 'साहब, यू पी आई स्कैनर है ना!', 'Sahab, UPI scanner hai na!'),
  ('shark', dict(pose={'shark': 'count', 'kallu': 'idle'}, hold={'kallu': None}, expr={'shark': 'smug'}, fx={}), 'और फ़ंडिंग कितनी चाहिए?', 'Aur funding kitni chahiye?'),
  ('kallu', dict(pose={'kallu': 'give', 'shark': 'facepalm', 'shark2': 'shock'}, hold={'kallu': 'glass'}, expr={'kallu': 'lol', 'shark': 'shock'}, final=True), 'फ़ंडिंग नहीं, आप बस चाय का पैसा दे दो। दस रुपये!', 'Funding nahi, aap bas chai ka paisa de do. 10 rupaye!')]),
 dict(n=10, slug='bank-kyc', title='😂 Bank mein KYC 😂', bg='bank', final='Logic mein dum hai 😆',
  cast={'clerk': shades('Bank Babu', colors={'suit': '#2b6cb0', 'tie': '#ffffff'}), 'ramu': uncle('Ramu Kaka', grey=True, hair='bald')}, voices={'clerk': V['shades'], 'ramu': ['hm_omega+hm_psi', .9]},
  lines=[
  ('clerk', dict(bg='photo:bank', cast=[C('clerk', 280, 1), C('ramu', 760, -1)], pose={'clerk': 'explain'}), 'काका, के वाई सी अपडेट करनी है। एड्रेस प्रूफ़ लाए?', 'Kaka, KYC update karni hai. Address proof laaye?'),
  ('ramu', dict(pose={'ramu': 'give', 'clerk': 'idle'}, hold={'ramu': 'paper'}, expr={'ramu': 'happy'}), 'हाँ बेटा, ये लो।', 'Haan beta, ye lo.'),
  ('clerk', dict(pose={'clerk': 'give', 'ramu': 'idle'}, hold={'ramu': None, 'clerk': 'paper'}, expr={'clerk': 'shock'}, fx={'clerk': 'sweat'}), 'ये तो बिजली का बिल है... दो हज़ार पंद्रह का!', 'Ye to bijli ka bill hai... 2015 ka!'),
  ('ramu', dict(pose={'ramu': 'hips', 'clerk': 'idle'}, expr={'ramu': 'smug'}, fx={}), 'घर तो वही है ना, बेटा। हम कहीं शिफ़्ट नहीं हुए!', 'Ghar to wahi hai na, beta. Hum kahin shift nahi hue!'),
  ('clerk', dict(pose={'clerk': 'facepalm', 'ramu': 'cheer'}, hold={'clerk': None}, expr={'clerk': 'sad', 'ramu': 'lol'}, final=True), 'काका, आपका लॉजिक तो बैंक से भी मज़बूत है!', 'Kaka, aapka logic to bank se bhi mazboot hai!')]),
]

if __name__ == '__main__':
    for k in SKITS:
        d = f"{H}/{k['n']:02d}-{k['slug']}"; os.makedirs(d, exist_ok=True)
        ep = dict(num=k['n'], title=k['title'], final=k['final'], mode='comedy', cast=k['cast'])
        lines = [[sp, b, deva, cap] for sp, b, deva, cap in k['lines']]
        json.dump(dict(out=f"{k['n']:02d}-{k['slug']}", ep=ep, voices=k['voices'], photos={k['bg']: f"../bg/{k['bg']}.jpg"},
                       sections=[dict(name=k['title'], lines=lines)]), open(f"{d}/script.json", 'w'), ensure_ascii=False, indent=1)
        print(d, len(lines), 'lines')
