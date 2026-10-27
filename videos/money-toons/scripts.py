# Paisa Toons: 10 finance and money-making shorts in three looks, drawn by ../tech-shorts/engine3d/sets/money/paisa.js:
#   faceless (clay mannequins, warm cinematic rooms), toon (desi caricatures, big noses), flat (cel-shaded with outlines).
# Hindi voice, Hinglish captions. Each line: (speaker, shot or None to keep the previous shot, Devanagari, caption, stat or None).
# A shot is a dict for BUILD.pt: room, cast [[id, x, z, rotY, pose, opts]], props [[kind, x, y, z, scale, rotY, arg]], cam, move ...
# Writes NN-slug/script.json (for voice.py) and NN-slug/script3d.json (for the 3D page).
import json, os, math
H = os.path.dirname(os.path.abspath(__file__))
NOTE = 'Seekhne ke liye hai, financial advice nahi. Returns guaranteed nahi hote.'
NARR = ['hm_omega', 1.0]
PI = math.pi

def cam(kind='mid', x=0.0, y=0.0):
    return {'wide': [[x, 3.6, 13.5], [x, 1.9, 0]], 'mid': [[x, 3.3, 10.5], [x, 1.85, 0]], 'close': [[x, 3.0, 6.8], [x, 2.35, 0]], 'closeSit': [[x, 2.6, 6.8], [x, 1.7, 0]],
            'low': [[x, 1.5, 8.5], [x, 2.3, 0]], 'high': [[x, 7.0, 10.5], [x, 1.2, 0]], 'prop': [[x, 2.8 + y, 7.4], [x, 1.3 + y, 0]], 'back': [[x, 3.0, 10.5], [x, 2.0, -3]]}[kind]
def S(room, cast=(), props=(), c=None, move='push', **kw):
    d = dict(room=room, cast=[list(a) for a in cast], props=[list(p) for p in props], cam=c or cam('mid'), move=move); d.update(kw); return d
def P(id, x, z=0.0, ry=0.0, pose='idle', **o): return [id, x, z, ry, pose, o]

EPISODES = [
 # 1 ---------------------------------------------------------------------------------------------------------------------------
 dict(n=1, slug='sip-500-rupees', title='₹500 Ki SIP Ka Jaadu', look='faceless', voices={'N': NARR, 'riya': ['hf_alpha', 1.04], 'arjun': ['hm_psi', 1.04]},
  cast={'riya': 'Riya', 'arjun': 'Arjun'},
  chars={'riya': dict(coat=0xd6bf9a, shirt=0xe8dccb, pants=0x4a5a7a, hair=0x6b4226, bun=True, bag=True), 'arjun': dict(shirt=0x3a3a40, pants=0x2a2a30, hair=0x1d1410),
         'old': dict(shirt=0xd8c8b0, pants=0x8a7a6a, hair=0xc8c8c8, bun=True)},
  lines=[
  ('N', S('cafe', [P('riya', -1.15, .3, .9, 'sittalk'), P('arjun', 1.15, .3, -.9, 'sit')], [['table', 0, 0, .3], ['chair', -1.15, 0, .3, 1, .9], ['chair', 1.15, 0, .3, 1, -.9], ['cup', -.35, 1.05, .35], ['cup', .35, 1.05, .25]], [[0, 3.2, 9.8], [0, 1.4, 0]]),
   'रिया और अर्जुन, दोनों की सैलरी एक जैसी। पर तीस साल बाद, एक के पास लाखों, दूसरे के पास कुछ नहीं।', 'Riya aur Arjun, dono ki salary ek jaisi. Par 30 saal baad, ek ke paas lakhon, doosre ke paas kuch nahi.', None),
  ('arjun', S('cafe', [P('riya', -1.15, .3, .9, 'sit'), P('arjun', 1.15, .3, -.9, 'sitshrug')], [['table', 0, 0, .3], ['chair', -1.15, 0, .3, 1, .9], ['chair', 1.15, 0, .3, 1, -.9], ['cup', -.35, 1.05, .35], ['cup', .35, 1.05, .25]], cam('closeSit', 1.0)),
   'मैं तो एस आई पी तब करूँगा, जब सैलरी बढ़ेगी।', 'Main to SIP tab karunga, jab salary badhegi.', None),
  ('riya', S('cafe', [P('riya', -1.15, .3, .9, 'sitphone', hold='phone', holdArg='chart', holdS=.9, holdRy=-.6), P('arjun', 1.15, .3, -.9, 'sit')], [['table', 0, 0, .3], ['chair', -1.15, 0, .3, 1, .9], ['chair', 1.15, 0, .3, 1, -.9], ['cup', -.35, 1.05, .35]], cam('closeSit', -1.0)),
   'मैं तो अभी से करूँगी। सिर्फ़ पाँच सौ रुपये महीना।', 'Main to abhi se karungi. Sirf 500 rupaye mahina.', ['₹500', 'Har mahina SIP']),
  ('N', S('marine', [P('riya', 0, .5, PI / 2, 'walk', walk=[-2.2, 2.2])], c=[[0, 3.0, 10.5], [0, 1.9, 0]], move='pan'),
   'बीस साल में रिया ने कुल एक लाख बीस हज़ार लगाए।', '20 saal mein Riya ne kul 1 lakh 20 hazaar lagaye.', ['₹1.2 lakh', '20 saal mein lagaye']),
  ('N', S('park', [P('riya', -1.2, .4, .5, 'point')], [['cointree', 1.0, 0, -.2, 1.3]], cam('mid', 0)),
   'अगर बारह प्रतिशत सालाना रिटर्न मिले, तो ये बन जाता है लगभग पाँच लाख।', 'Agar 12 percent saalana return mile, to ye ban jaata hai lagbhag 5 lakh.', ['₹5 lakh', '20 saal, 12% maan kar']),
  ('N', S('balcony', [P('old', -.6, .2, .4, 'hold', hold='cup', holdS=.9)], [['plant', 1.4, 0, .3], ['chair', -.6, 0, -.5, 1, .4]], cam('mid', -.2)),
   'और तीस साल तक चलाया? लगभग सत्रह लाख साठ हज़ार!', 'Aur 30 saal tak chalaya? Lagbhag 17 lakh 60 hazaar!', ['₹17.6 lakh', '30 saal, 12% maan kar']),
  ('arjun', S('night', [P('arjun', 0, .2, 0, 'sitsad')], [['desk', 0, 0, .9, .8], ['chair', 0, 0, .2], ['calc', -.4, 1.0, .9], ['papers', .4, 1.0, .9, 1, 0, 5]], cam('closeSit', 0)),
   'मैंने दस साल देर से शुरू किया। मेरे पास उसका एक-तिहाई भी नहीं।', 'Maine 10 saal der se shuru kiya. Mere paas uska ek-tihaai bhi nahi.', None),
  ('N', S('cafe', [], [['table', 0, 0, 0, 1.2], ['hourglass', 0, 1.25, 0, .8]], cam('prop', 0, .3)),
   'यही है कंपाउंडिंग का जादू। पैसा नहीं, टाइम सबसे बड़ा हीरो है।', 'Yahi hai compounding ka jaadu. Paisa nahi, time sabse bada hero hai.', None),
  ('N', S('city', [P('riya', -.5, 1, PI, 'walk', walk=[-.5, -.5, 1.5, -3]), P('arjun', .6, 1, PI, 'walk', walk=[.6, .6, 1.5, -3])], c=cam('back'), move='push', last=True),
   'रिटर्न गारंटीड नहीं होता, मार्केट ऊपर-नीचे होता है। पर शुरुआत आज करो।', 'Return guaranteed nahi hota, market upar-neeche hota hai. Par shuruaat aaj karo.', None)]),
 # 2 ---------------------------------------------------------------------------------------------------------------------------
 dict(n=2, slug='iphone-emi-trap', title='iPhone EMI Ka Chakkar', look='toon', voices={'N': NARR, 'lucky': ['hm_psi', 1.08], 'jugnu': ['hm_omega+hm_psi', 1.05]},
  cast={'lucky': 'Lucky', 'jugnu': 'Jugnu'},
  chars={'lucky': dict(skin='brown', shirt=0xff8a3d, pants=0xd8701e, hair=0x1d1410, messy=True, stache=True), 'jugnu': dict(skin='wheat', kurta=0x9aa0a8, shirt=0x9aa0a8, pants=0x2a2a30, beard=True, messy=True, hair=0x1d1410),
         'seth': dict(skin='fair', shirt=0x9b5de5, pants=0x2a2a30, chains=True, belly=True, stache='big', hair=0x1d1410)},
  lines=[
  ('N', S('shop', [P('lucky', 0, .6, .25, 'shock')], c=cam('mid', 0)), 'लकी की सैलरी पच्चीस हज़ार। और सपना? नया आईफ़ोन!', 'Lucky ki salary 25 hazaar. Aur sapna? Naya iPhone!', ['₹25,000', 'Lucky ki salary']),
  ('jugnu', S('street', [P('lucky', -.85, .5, .5, 'think'), P('jugnu', .85, .5, -.5, 'point')], c=cam('mid', 0)), 'अरे टेंशन क्या, ई एम आई पे ले ले! बस चार हज़ार महीना!', 'Arre tension kya, EMI pe le le! Bas 4 hazaar mahina!', None),
  ('N', S('shop', [P('lucky', -.9, .6, .4, 'give', hold='papers', holdArg=1), P('seth', 1.1, -.8, -.4, 'hips')], c=cam('mid', 0)),
   'अस्सी हज़ार का फ़ोन, चौबीस महीने की ई एम आई, सोलह प्रतिशत ब्याज। कुल दिए, चौरानवे हज़ार।', '₹80,000 ka phone, 24 mahine ki EMI, 16% byaaj. Kul diye, ₹94,000.', ['₹94,000', '₹80,000 ka phone, EMI pe']),
  ('N', S('home', [P('lucky', 0, .4, 0, 'sad')], moth=True, mothAt=[0, 0, 1.2], c=cam('close', 0)), 'अब हर महीने, सैलरी आते ही चार हज़ार ग़ायब।', 'Ab har mahine, salary aate hi 4 hazaar gayab.', None),
  ('lucky', S('home', [P('lucky', 0, .4, 0, 'shock')], [['scooter', 1.8, 0, -.6, 1, -.4]], fly='bills', c=cam('mid', 0)), 'बाइक की सर्विस, घर का किराया, और ये ई एम आई... पैसे ख़त्म!', 'Bike ki service, ghar ka kiraya, aur ye EMI... paise khatam!', None),
  ('jugnu', S('street', [P('lucky', -.85, .5, .5, 'shrug'), P('jugnu', .85, .5, -.5, 'holdup', hold='card', holdS=.7)], c=cam('mid', .3)), 'कोई ना, क्रेडिट कार्ड से भर दे!', 'Koi na, credit card se bhar de!', None),
  ('N', S('studio', [P('lucky', 0, 0, 0, 'shock')], [['net', 0, 0, 0, 1.25]], c=cam('mid', 0)),
   'और यहीं से शुरू होता है क़र्ज़ का जाल। क्रेडिट कार्ड का ब्याज, साल का छत्तीस से बयालीस प्रतिशत तक।', 'Aur yahin se shuru hota hai karz ka jaal. Credit card ka byaaj, saal ka 36 se 42 percent tak.', ['36–42%', 'Credit card byaaj (saal)']),
  ('N', S('home', [P('lucky', -.7, .4, .5, 'give', hold='cash', holdArg=2, holdS=.5)], [['piggy', .8, 0, .5, 1.1, -.5]], coinDrop=True, c=cam('mid', 0)), 'नियम सीधा है। जो चीज़ कमाई नहीं बढ़ाती, उसे ई एम आई पे मत लो।', 'Rule seedha hai. Jo cheez kamai nahi badhati, use EMI pe mat lo.', None),
  ('lucky', S('street', [P('lucky', 0, .6, 0, 'cheer')], [['piggy', 1.4, 0, .4, 1, -.4]], fly='coins', c=cam('mid', 0), last=True), 'पहले बचत, फिर आईफ़ोन! अब लकी सच में लकी है!', 'Pehle bachat, phir iPhone! Ab Lucky sach mein lucky hai!', None)]),
 # 3 ---------------------------------------------------------------------------------------------------------------------------
 dict(n=3, slug='cibil-score', title='CIBIL Score Kya Hai?', look='flat', voices={'N': NARR, 'bunty': ['hm_omega', 1.06], 'iyer': ['hf_beta', 1.0]},
  cast={'bunty': 'Bunty Bhai', 'iyer': 'Bank Manager'},
  chars={'bunty': dict(skin='fair', shirt=0xffffff, pants=0x3a8a3a, glasses=True, hair=0x1d1410, stache=True, belly=True), 'iyer': dict(skin='wheat', saree=0x3d6fd1, shirt=0x3d6fd1, hair=0x1d1410, bun=True, glasses=True, bindi=True),
         'wife': dict(skin='wheat', saree=0xff4fa3, shirt=0xff4fa3, hair=0x1d1410, bun=True, bindi=True), 'hub': dict(skin='brown', shirt=0x3d7bff, pants=0x2a3150, hair=0x1d1410, stache=True)},
  lines=[
  ('N', S('bank', [P('bunty', 0, .6, PI / 2, 'walk', walk=[-3, 0], hold='papers', holdArg=2, holdS=.7)], c=cam('mid', 0), move='pan', bg='#bfe8ff'), 'बंटी भाई, घर के लिए लोन लेने बैंक पहुँचे।', 'Bunty bhai, ghar ke liye loan lene bank pahunche.', None),
  ('iyer', S('bank', [P('iyer', 1.2, -.4, -.6, 'point'), P('bunty', -1.1, .6, .6, 'idle')], [['desk', 1.2, 0, .5, .7], ['laptop', 1.2, .85, .5, .8, -.6, 'alert']], c=cam('mid', 0), bg='#bfe8ff'), 'सॉरी सर, आपका सिबिल स्कोर पाँच सौ अस्सी है। लोन रिजेक्ट।', 'Sorry sir, aapka CIBIL score 580 hai. Loan reject.', ['580', 'Bunty ka CIBIL score']),
  ('bunty', S('bank', [P('bunty', 0, .4, 0, 'shock')], c=cam('close', 0), bg='#bfe8ff'), 'सिबिल? ये कौन सा नया दुश्मन है?', 'CIBIL? Ye kaun sa naya dushman hai?', None),
  ('N', S('studio', [P('bunty', -1.6, .5, .5, 'point')], [['gauge', .8, 1.6, 0, 1.4]], gaugeFrom=.05, gaugeTo=.95, c=cam('mid', -.2), bg='#ffe9a8'), 'सिबिल स्कोर, तीन सौ से नौ सौ के बीच एक नंबर है। ये बताता है कि आप क़र्ज़ लौटाने में कितने भरोसेमंद हो।', 'CIBIL score, 300 se 900 ke beech ek number hai. Ye batata hai ki aap karz lautane mein kitne bharosemand ho.', ['300–900', 'CIBIL score range']),
  ('N', S('studio', [P('wife', -1.0, .8, .3, 'cheer'), P('hub', .2, .8, .1, 'holdup', hold='key', holdS=.5)], [['house', 1.6, 0, -1.2, 1.4, -.3]], c=cam('mid', 0), bg='#c8f0c8'), 'सात सौ पचास से ऊपर अच्छा माना जाता है। लोन जल्दी, और कम ब्याज पे मिलता है।', '750 se upar achha maana jaata hai. Loan jaldi, aur kam byaaj pe milta hai.', ['750+', 'Achha score']),
  ('N', S('mall', [P('bunty', 0, .6, PI / 2, 'walk', walk=[-2.5, 1.5], hold='card', holdS=.6)], [['bags', 2.2, 0, .2]], c=cam('mid', 0), move='pan', bg='#ffd6ec'), 'बंटी भाई की गलती? क्रेडिट कार्ड का बिल लेट भरना, और पूरी लिमिट इस्तेमाल करना।', 'Bunty bhai ki galti? Credit card ka bill late bharna, aur poori limit istemaal karna.', None),
  ('N', S('home', [P('bunty', -.5, .5, .3, 'phone', hold='phone', holdArg='bill', holdS=.9)], [['calendar', 1.4, 3.0, -2.9, 1.4, 0, 'ticks']], c=cam('mid', 0), bg='#ffe0a8'), 'नियम: हर ई एम आई और बिल टाइम पे भरो। और कार्ड की लिमिट का तीस प्रतिशत से कम इस्तेमाल करो।', 'Rule: har EMI aur bill time pe bharo. Aur card ki limit ka 30 percent se kam istemaal karo.', ['30% se kam', 'Card limit ka use']),
  ('N', S('studio', [P('bunty', 0, .4, 0, 'shock')], fly='bills', c=cam('mid', 0), bg='#ffd0c0'), 'और एक साथ बहुत सारे लोन अप्लाई मत करो। हर एन्क्वायरी स्कोर गिराती है।', 'Aur ek saath bahut saare loan apply mat karo. Har enquiry score girati hai.', None),
  ('bunty', S('studio', [P('bunty', -.4, .8, .2, 'holdup', hold='key', holdS=.55), P('iyer', -1.8, .2, .5, 'cheer')], [['house', 1.5, 0, -1.2, 1.4, -.3]], fly='coins', c=cam('mid', 0), bg='#c8f0c8', last=True), 'एक साल बाद, स्कोर सात सौ अस्सी! अब घर भी, और कम ब्याज भी!', 'Ek saal baad, score 780! Ab ghar bhi, aur kam byaaj bhi!', ['780', 'Ek saal baad'])]),
 # 4 ---------------------------------------------------------------------------------------------------------------------------
 dict(n=4, slug='paisa-double-scam', title='30 Din Mein Paisa Double?', look='toon', voices={'N': NARR, 'bholu': ['hm_psi', 1.06], 'seth': ['hm_omega', .95]},
  cast={'bholu': 'Bholu', 'seth': 'Chamkila Seth'},
  chars={'bholu': dict(skin='wheat', shirt=0xf4f1e8, pants=0x2b6cb0, hair=0x1d1410, stache=True, belly=True), 'bholu_g': dict(skin='wheat', shirt=0xf4f1e8, pants=0x2b6cb0, hair=0x1d1410, stache=True, belly=True, glasses=True),
         'seth': dict(skin='fair', shirt=0x9b5de5, pants=0x1d1d24, chains=True, shades=True, belly=True, stache='big', hair=0x1d1410), 'wife': dict(skin='brown', saree=0xe63977, shirt=0xe63977, hair=0x1d1410, bun=True, bindi=True),
         'cop': dict(skin='brown', shirt=0xc9b47a, pants=0x8a7a3a, cap=0x8a7a3a, stache='big')},
  lines=[
  ('N', S('village', [P('bholu', -.3, .6, .2, 'sitphone', hold='phone', holdArg='chat', holdS=.9)], [['charpai', -.3, 0, .6, 1, .2]], c=cam('mid', -.2)), 'भोलू को व्हाट्सऐप पे मैसेज आया। तीस दिन में पैसा डबल!', 'Bholu ko WhatsApp pe message aaya. 30 din mein paisa double!', None),
  ('seth', S('office', [P('seth', 0, -.2, 0, 'sittalk')], [['desk', 0, 0, .7, .8], ['chair', 0, 0, -.2], ['cash', -.6, 1.0, .7, 1, .2, 6], ['cash', .6, 1.0, .7, 1, -.3, 5]], c=cam('closeSit', 0)), 'भाई, बस दस हज़ार लगाओ, तीस दिन में बीस हज़ार! गारंटीड!', 'Bhai, bas 10 hazaar lagao, 30 din mein 20 hazaar! Guaranteed!', ['₹10,000 → ₹20,000', '"Guaranteed" (30 din)']),
  ('N', S('village', [P('bholu', 0, .6, 0, 'dance')], fly='notes', c=cam('mid', 0)), 'पहले महीने, सच में डबल मिला। भोलू ख़ुश।', 'Pehle mahine, sach mein double mila. Bholu khush.', None),
  ('bholu', S('village', [P('bholu', -.6, .6, .5, 'give', hold='cash', holdArg=8, holdS=.8), P('seth', 1.1, .4, -.6, 'hips'), P('wife', -2.2, -.4, .5, 'shock')], c=cam('mid', -.3)), 'अब तो पूरे दो लाख लगाऊँगा! बीवी के गहने भी!', 'Ab to poore 2 lakh lagaunga! Biwi ke gehne bhi!', ['₹2 lakh', 'Sab kuch daav pe']),
  ('N', S('street', [P('bholu', -1.2, .8, .3, 'cry')], [['shutter', .7, 0, -1.0]], fly='bills', c=cam('mid', -.2)), 'अगले दिन। ऐप बंद, नंबर बंद, ऑफ़िस पे ताला।', 'Agle din. App band, number band, office pe taala.', None),
  ('N', S('studio', [], [['pyramid', 0, 0, 0, 1.6]], c=[[0, 3.4, 11.5], [0, 2.4, 0]]), 'इसे पॉन्ज़ी स्कीम कहते हैं। नए लोगों का पैसा, पुराने लोगों को देकर भरोसा जीता जाता है।', 'Ise Ponzi scheme kehte hain. Naye logon ka paisa, purane logon ko dekar bharosa jeeta jaata hai.', None),
  ('N', None, 'याद रखो। कोई भी गारंटीड डबल रिटर्न, फ़्रॉड है।', 'Yaad rakho. Koi bhi guaranteed double return, fraud hai.', ['Guaranteed double?', '= Fraud!']),
  ('N', S('police', [P('bholu', -1.0, .7, .5, 'phone', hold='phone', holdArg='alert', holdS=.9), P('cop', 1.1, -.2, -.5, 'sittalk')], [['desk', 1.1, 0, .6, .7], ['chair', 1.1, 0, -.2, 1, -.5], ['papers', 1.0, .87, .6, 1, 0, 3]], c=cam('mid', 0)), 'फ़्रॉड हो जाए, तो तुरंत उन्नीस सौ तीस पे कॉल करो, और साइबर क्राइम पोर्टल पे शिकायत करो।', 'Fraud ho jaaye, to turant 1930 pe call karo, aur cybercrime.gov.in pe shikayat karo.', ['1930', 'Cyber fraud helpline']),
  ('bholu', S('home', [P('bholu_g', 0, .5, 0, 'wise')], c=cam('close', 0), last=True), 'अब मैं सिर्फ़ सेबी रजिस्टर्ड जगह पे पैसा लगाता हूँ। लालच नहीं, समझ!', 'Ab main sirf SEBI registered jagah pe paisa lagata hoon. Lalach nahi, samajh!', None)]),
 # 5 ---------------------------------------------------------------------------------------------------------------------------
 dict(n=5, slug='inflation-explained', title='Mehangai Chupchaap Paisa Kha Rahi Hai', look='faceless', voices={'N': NARR, 'kabir': ['hm_psi', 1.06], 'dada': ['hm_omega+hm_psi', .88]},
  cast={'kabir': 'Kabir', 'dada': 'Dadaji'},
  chars={'young': dict(shirt=0xf4f1e8, pants=0x6a5a4a, hair=0x1d1410), 'kabir': dict(shirt=0x2a3a6a, pants=0x3a4a6a, hair=0x1d1410), 'dada': dict(kurta=0xf2e6cc, shirt=0xf2e6cc, pants=0xf4f1e8, hair=0xe0e0e0),
         'p1': dict(shirt=0x8a6a4a, pants=0x3a3a42, hair=0x2a1a12), 'p2': dict(shirt=0x5a7a8a, pants=0x3a3a42, hair=0x4a2a1a, bun=True), 'woman': dict(shirt=0xc86a4a, pants=0x3a4a6a, hair=0x2a1a12, hairStyle='long')},
  lines=[
  ('N', S('street', [P('young', 0, .6, PI / 2, 'walk', walk=[-2.4, 2.2])], c=cam('mid', 0), move='pan', roomOpt=dict(top='#c8a070', bottom='#e8c8a0', floor=0xa88a68)), 'उन्नीस सौ पंचानवे में दादाजी की सैलरी थी पाँच हज़ार। और घर चल जाता था।', '1995 mein Dadaji ki salary thi 5 hazaar. Aur ghar chal jaata tha.', ['₹5,000', '1995 ki salary']),
  ('kabir', S('mall', [P('kabir', 0, .5, 0, 'shrug')], [['bags', 1.4, 0, .3, 1, 0, 1]], c=cam('mid', 0)), 'दादाजी, आज पाँच हज़ार में तो एक हफ़्ता भी नहीं चलता!', 'Dadaji, aaj 5 hazaar mein to ek hafta bhi nahi chalta!', None),
  ('N', S('mall', [P('kabir', -.8, .5, .3, 'think')], fly='bills', c=cam('mid', 0)), 'इसी को महँगाई, यानी इन्फ़्लेशन कहते हैं। हर साल चीज़ें थोड़ी महँगी हो जाती हैं।', 'Isi ko mehangai, yaani inflation kehte hain. Har saal cheezein thodi mehngi ho jaati hain.', None),
  ('N', S('cafe', [], [['table', 0, 0, 0, 1.2], ['cash', -.35, 1.25, 0, 1.3, .2, 6], ['cash', .4, 1.25, .1, 1.3, -.3, 6]], shrink=True, c=cam('prop', 0, .2)), 'अगर महँगाई छह प्रतिशत सालाना हो, तो आज के एक लाख रुपये, बीस साल बाद सिर्फ़ इकतीस हज़ार जितने काम के रहेंगे।', 'Agar mehangai 6% saalana ho, to aaj ke 1 lakh rupaye, 20 saal baad sirf 31 hazaar jitne kaam ke rahenge.', ['₹31,000', 'Aaj ke ₹1 lakh ki value, 20 saal baad']),
  ('kabir', S('home', [P('kabir', -1.0, .6, .5, 'think')], [['almirah', .9, 0, -.6, 1, -.3]], c=cam('mid', 0), roomOpt=dict(keyI=1.8)), 'मतलब लॉकर में रखा पैसा, चुपचाप घट रहा है?', 'Matlab locker mein rakha paisa, chupchaap ghat raha hai?', None),
  ('N', S('bank', [P('p1', -1.6, .4, .3, 'idle'), P('p2', 0, .2, 0, 'hold', hold='papers', holdArg=1, holdS=.6), P('kabir', 1.6, .4, -.3, 'idle')], c=cam('wide', 0)), 'बिल्कुल। इसलिए पैसा ऐसी जगह लगाओ, जहाँ रिटर्न, महँगाई से ज़्यादा मिलने की उम्मीद हो।', 'Bilkul. Isliye paisa aisi jagah lagao, jahan return, mehangai se zyada milne ki ummeed ho.', None),
  ('N', S('office', [P('woman', 0, .1, 0, 'type')], [['desk', 0, 0, .8, .8], ['chair', 0, 0, .1], ['laptop', 0, .98, .8, .9, PI, 'chart'], ['plant', 1.5, 0, -.5]], c=cam('closeSit', 0), roomOpt=dict(top='#f3d2a6', bottom='#c9946a')), 'जैसे लंबी अवधि के लिए इंडेक्स फ़ंड, पी पी एफ़ या ई पी एफ़। हर ऑप्शन का रिस्क अलग होता है।', 'Jaise lambi avadhi ke liye index fund, PPF ya EPF. Har option ka risk alag hota hai.', None),
  ('dada', S('village', [P('dada', -.6, .8, PI / 2, 'walk', walk=[-2.2, .6]), P('kabir', .6, .8, PI / 2, 'walk', walk=[-1.0, 1.8])], c=cam('mid', 0), move='pan', last=True), 'बेटा, पैसा बचाओ भी, और बढ़ाओ भी।', 'Beta, paisa bachao bhi, aur badhao bhi.', None)]),
 # 6 ---------------------------------------------------------------------------------------------------------------------------
 dict(n=6, slug='term-insurance-vs-endowment', title='Insurance Ka Sach', look='flat', voices={'N': NARR, 'gattu': ['hm_psi', 1.06], 'tiwari': ['hm_omega', 1.02]},
  cast={'gattu': 'Gattu', 'tiwari': 'Agent Tiwari'},
  chars={'gattu': dict(skin='wheat', shirt=0x8fd3ff, pants=0x3a4a6a, glasses=True, hair=0x1d1410, scale=1.06), 'tiwari': dict(skin='brown', shirt=0x8a5a3a, pants=0x3a3a3a, stache=True, belly=True, bindi=True, hair=0x1d1410, scale=.92),
         'pooja': dict(skin='fair', saree=0xff4fa3, shirt=0xff4fa3, hair=0x1d1410, bun=True, bindi=True), 'kid': dict(skin='wheat', shirt=0xffd23f, pants=0x3d7bff, hair=0x1d1410, scale=.6)},
  lines=[
  ('N', S('home', [P('gattu', -1.2, .4, .4, 'idle'), P('pooja', -2.2, .1, .4, 'idle'), P('tiwari', 1.3, .6, -.5, 'wave', hold='brochure', holdS=.7)], c=cam('mid', -.3), bg='#ffe0a8'), 'गट्टू की शादी हुई, और घर पे आए एजेंट तिवारी।', 'Gattu ki shaadi hui, aur ghar pe aaye Agent Tiwari.', None),
  ('tiwari', S('home', [P('tiwari', .9, .3, -.4, 'sittalk', hold='brochure', holdS=.7), P('gattu', -.9, .3, .4, 'sit')], [['sofa', -.9, 0, -.2, .9, .4], ['chair', .9, 0, .2, 1, -.4]], c=cam('mid', 0), bg='#ffe0a8'), 'ये लो एंडोमेंट पॉलिसी। इंश्योरेंस भी, इन्वेस्टमेंट भी! साल का बस एक लाख।', 'Ye lo endowment policy. Insurance bhi, investment bhi! Saal ka bas ek lakh.', ['₹1 lakh / saal', 'Endowment premium']),
  ('gattu', S('home', [P('gattu', -.5, .3, .1, 'sitsad'), P('pooja', .7, .3, -.1, 'sit')], [['sofa', 0, 0, -.2, 1.2]], c=cam('closeSit', 0), bg='#ffe0a8'), 'और अगर मुझे कुछ हो गया तो?', 'Aur agar mujhe kuch ho gaya to?', None),
  ('tiwari', S('home', [P('tiwari', 0, .4, 0, 'count')], c=cam('close', 0), bg='#ffe0a8'), 'फ़ैमिली को मिलेंगे दस लाख।', 'Family ko milenge 10 lakh.', ['₹10 lakh', 'Endowment cover']),
  ('N', S('studio', [P('gattu', 0, .6, 0, 'shock')], [['poster', -1.9, 1.6, 0, 1, .3, [1.1, .9, '#ffffff', ['ENDOWMENT', '₹10 L'], '#1d2442']], ['poster', 1.9, 2.0, 0, 1, -.3, [1.7, 1.5, '#3cc85a', ['TERM', '₹1 CR'], '#ffffff']]], c=cam('mid', 0), bg='#c8f0ff'), 'अब देखो टर्म इंश्योरेंस। लगभग बारह हज़ार साल के प्रीमियम में, एक करोड़ का कवर। तीस साल के नॉन-स्मोकर के लिए।', 'Ab dekho term insurance. Lagbhag 12 hazaar saal ke premium mein, 1 crore ka cover. 30 saal ke non-smoker ke liye.', ['₹1 crore', 'Term cover (~₹12,000/saal)']),
  ('N', S('studio', [P('gattu', -.7, .3, .2, 'idle'), P('pooja', .6, .3, -.2, 'idle'), P('kid', 0, .9, 0, 'cheer')], [['umbrella', 0, 0, .3, 1.15]], fly='notes', c=cam('mid', 0), bg='#5a6a9a'), 'टर्म प्लान सिर्फ़ सुरक्षा है। कुछ हुआ, तो फ़ैमिली को पूरा पैसा। कुछ नहीं हुआ, तो कुछ वापस नहीं।', 'Term plan sirf suraksha hai. Kuch hua, to family ko poora paisa. Kuch nahi hua, to kuch wapas nahi.', None),
  ('N', S('studio', [], [['snail', -1.2, 0, 0, 1.6]], c=cam('prop', 0, .1), bg='#d8f0c0'), 'और एंडोमेंट का रिटर्न? आम तौर पे सिर्फ़ पाँच-छह प्रतिशत।', 'Aur endowment ka return? Aam taur pe sirf 5-6 percent.', ['~5–6%', 'Endowment ka return']),
  ('N', S('studio', [], [['table', 0, 0, 0, 1.3], ['jar', -.7, 1.25, 0, .9, 0, 'shield'], ['jar', .7, 1.25, 0, .9, 0, 'coins']], c=cam('prop', 0, .5), bg='#ffe9a8'), 'इसलिए कहते हैं: इंश्योरेंस और इन्वेस्टमेंट अलग रखो। टर्म प्लान लो, बाक़ी पैसा इन्वेस्ट करो।', 'Isliye kehte hain: insurance aur investment alag rakho. Term plan lo, baaki paisa invest karo.', None),
  ('gattu', S('home', [P('gattu', -.8, .5, .4, 'stop'), P('tiwari', 1.1, .5, -.5, 'shock')], c=cam('mid', 0), bg='#ffe0a8', last=True), 'सॉरी तिवारी जी। पहले कंपैरिज़न, फिर सिग्नेचर!', 'Sorry Tiwari ji. Pehle comparison, phir signature!', None)]),
 # 7 ---------------------------------------------------------------------------------------------------------------------------
 dict(n=7, slug='freelancing-side-income', title='Naukri Ke Saath Side Income', look='faceless', voices={'N': NARR, 'meera': ['hf_alpha', 1.04]},
  cast={'meera': 'Meera'},
  chars={'meera': dict(shirt=0xd8a030, pants=0x3a4a6a, hair=0x2a1a12, hairStyle='long'), 'meera_b': dict(shirt=0xd8a030, pants=0x3a4a6a, hair=0x2a1a12, hairStyle='long', bag=True, coat=0x8a6a4a)},
  lines=[
  ('N', S('office', [P('meera', 0, .1, 0, 'sitsad')], [['desk', 0, 0, .8, .8], ['chair', 0, 0, .1], ['laptop', 0, .98, .8, .9, PI, 'code']], c=cam('closeSit', 0), roomOpt=dict(top='#3a3550', bottom='#6a5a7a')), 'मीरा की नौ से छह की नौकरी, और महीने के आख़िर में ख़ाली जेब।', 'Meera ki 9 se 6 ki naukri, aur mahine ke aakhir mein khaali jeb.', None),
  ('meera', S('city', [P('meera', 0, .8, .3, 'think')], c=cam('close', 0)), 'कुछ एक्स्ट्रा कमाई हो जाती, तो कितना अच्छा होता।', 'Kuch extra kamai ho jaati, to kitna achha hota.', None),
  ('N', S('night', [P('meera', 0, .1, 0, 'type')], [['desk', 0, 0, .8, .8], ['chair', 0, 0, .1], ['laptop', 0, .98, .8, .9, PI, 'video'], ['cup', .8, 1.05, .8]], c=cam('closeSit', 0)), 'उसने रात में, यूट्यूब से वीडियो एडिटिंग सीखी। फ़्री सॉफ़्टवेयर, और पुराना लैपटॉप।', 'Usne raat mein, YouTube se video editing seekhi. Free software, aur purana laptop.', None),
  ('N', S('home', [P('meera', 0, .5, 0, 'phone', hold='phone', holdArg='grid', holdS=.9)], c=cam('close', 0), roomOpt=dict(top='#f3d2a6', bottom='#c9946a')), 'फिर इंस्टाग्राम पे अपना काम दिखाया, और क्रिएटर्स को मैसेज किए।', 'Phir Instagram pe apna kaam dikhaya, aur creators ko message kiye.', None),
  ('N', S('home', [P('meera', 0, .5, 0, 'cheer')], fly='notes', c=cam('mid', 0), roomOpt=dict(top='#f3d2a6', bottom='#c9946a')), 'पहला क्लाइंट मिला। एक रील के पाँच सौ रुपये। धीरे-धीरे, दो हज़ार तक।', 'Pehla client mila. Ek reel ke 500 rupaye. Dheere-dheere, 2 hazaar tak.', ['₹500 → ₹2,000', 'Ek reel edit (approx)']),
  ('N', S('cafe', [P('meera', 0, .1, 0, 'type')], [['table', 0, 0, .8], ['chair', 0, 0, .1], ['laptop', 0, .98, .8, .9, PI, 'video'], ['cup', .55, 1.05, .9]], c=cam('closeSit', 0)), 'छह महीने बाद, हर महीने तीस हज़ार से ज़्यादा। सिर्फ़ वीकेंड और रातों में।', 'Chhe mahine baad, har mahine 30 hazaar se zyada. Sirf weekend aur raaton mein.', ['₹30,000+', 'Mahine ki side income']),
  ('meera', None, 'स्किल एक बार सीखो, कमाई बार-बार।', 'Skill ek baar seekho, kamai baar-baar.', None),
  ('N', S('office', [], [['desk', 0, 0, 0, 1.0], ['laptop', -.3, 1.22, 0, 1.0, 0, 'video'], ['cup', .8, 1.3, .1], ['calc', .5, 1.25, .3], ['plant', 1.6, 0, -.4]], c=cam('prop', 0, .3), roomOpt=dict(top='#f3d2a6', bottom='#c9946a')), 'शुरुआत के लिए, वीडियो एडिटिंग, ग्राफ़िक डिज़ाइन, या कंटेंट राइटिंग। बस एक लैपटॉप और लगन चाहिए।', 'Shuruaat ke liye, video editing, graphic design, ya content writing. Bas ek laptop aur lagan chahiye.', None),
  ('N', S('city', [P('meera_b', 0, .8, PI / 2, 'walk', walk=[-2.2, 1.6])], c=cam('mid', 0), move='pan', last=True), 'पहले पोर्टफ़ोलियो बनाओ, फिर पैसा माँगो। और पेमेंट का कुछ हिस्सा हमेशा एडवांस में लो।', 'Pehle portfolio banao, phir paisa maango. Aur payment ka kuch hissa hamesha advance mein lo.', None)]),
 # 8 ---------------------------------------------------------------------------------------------------------------------------
 dict(n=8, slug='gold-jewellery-vs-gold-fund', title='Gehna Ya Gold Fund?', look='toon', voices={'N': NARR, 'chachi': ['hf_beta', .98], 'dablu': ['hm_psi', 1.08]},
  cast={'chachi': 'Chachi', 'dablu': 'Dablu'},
  chars={'chachi': dict(skin='wheat', saree=0xff4fa3, shirt=0xff4fa3, hair=0x1d1410, bun=True, bindi=True, belly=True, noseK=.8), 'dablu': dict(skin='brown', shirt=0x3aa76d, pants=0x2f4f8f, messy=True, hair=0x1d1410, scale=.95, noseK=1.2),
         'jeweller': dict(skin='fair', kurta=0xffd23f, shirt=0xffd23f, pants=0xf4f1e8, stache='big', belly=True, hair=0x1d1410)},
  lines=[
  ('chachi', S('jeweller', [P('chachi', -.4, .6, -.2, 'point')], c=cam('mid', 0)), 'इस धनतेरस, एक लाख का सोना लेंगे!', 'Is Dhanteras, ek lakh ka sona lenge!', ['₹1 lakh', 'Sone ka budget']),
  ('dablu', S('jeweller', [P('chachi', -1.1, .6, .4, 'shock'), P('dablu', .9, .7, -.4, 'stop')], c=cam('mid', 0)), 'चाची, रुको! पहले बिल देखो।', 'Chachi, ruko! Pehle bill dekho.', None),
  ('N', S('jeweller', [P('jeweller', 0, -2.4, 0, 'count')], [['calc', .6, 1.32, -1.5, 1.2]], c=[[0, 3.2, 7.6], [0, 2.1, -1.8]]), 'गहने पे मेकिंग चार्ज, आम तौर पे आठ से पच्चीस प्रतिशत। ऊपर से तीन प्रतिशत जी एस टी।', 'Gehne pe making charge, aam taur pe 8 se 25 percent. Upar se 3 percent GST.', ['8–25%', 'Making charge + 3% GST']),
  ('N', S('jeweller', [P('chachi', -.9, .2, .3, 'give', hold='necklace', holdS=.6), P('jeweller', .9, -2.4, -.2, 'give', hold='cash', holdArg=1, holdS=.5)], c=[[0, 3.2, 9.0], [0, 1.9, -1.0]]), 'और जब बेचने जाओ, तो मेकिंग चार्ज वापस नहीं मिलता।', 'Aur jab bechne jaao, to making charge wapas nahi milta.', None),
  ('chachi', S('jeweller', [P('chachi', 0, .5, 0, 'shock')], c=cam('close', 0)), 'हैं?! मतलब एक लाख का गहना, बेचने पे कम?', 'Hain?! Matlab ek lakh ka gehna, bechne pe kam?', None),
  ('N', S('home', [P('dablu', -.7, .3, .4, 'sitphone', hold='phone', holdArg='gold', holdS=.9), P('chachi', .8, .3, -.3, 'sit')], [['sofa', 0, 0, -.2, 1.3]], c=cam('mid', 0)), 'इन्वेस्टमेंट के लिए, गोल्ड ई टी एफ़ या गोल्ड म्यूचुअल फ़ंड बेहतर। ना मेकिंग चार्ज, ना चोरी का डर।', 'Investment ke liye, gold ETF ya gold mutual fund behtar. Na making charge, na chori ka darr.', None),
  ('dablu', S('home', [P('dablu', 0, .5, 0, 'wise')], c=cam('close', 0)), 'पहनने के लिए गहना, बचत के लिए गोल्ड फ़ंड!', 'Pehenne ke liye gehna, bachat ke liye gold fund!', None),
  ('chachi', S('village', [P('chachi', -.8, .7, .3, 'dance'), P('dablu', .8, .7, -.3, 'dance')], [['diya', -1.6, 0, 1.4], ['diya', 0, 0, 1.7], ['diya', 1.6, 0, 1.4]], c=cam('mid', 0), roomOpt=dict(top='#2a1a3a', bottom='#ff9a50', keyI=2.2), last=True), 'वाह बेटा! अब गहना भी, और समझदारी भी!', 'Waah beta! Ab gehna bhi, aur samajhdaari bhi!', None)]),
 # 9 ---------------------------------------------------------------------------------------------------------------------------
 dict(n=9, slug='lifestyle-inflation', title='Salary Badhi, Bachat Kyun Nahi?', look='flat', voices={'N': NARR, 'vicky': ['hm_psi', 1.1], 'neha': ['hf_alpha', 1.04]},
  cast={'vicky': 'Vicky', 'neha': 'Neha'},
  chars={'vicky': dict(skin='wheat', shirt=0x9b5de5, pants=0x2a2a30, messy=True, hair=0x1d1410), 'neha': dict(skin='fair', shirt=0xffd23f, pants=0x3a4a6a, ponytail=True, glasses=True, hair=0x1d1410, hairStyle='long')},
  lines=[
  ('N', S('office', [P('vicky', 0, .5, 0, 'cheer')], fly='notes', c=cam('mid', 0), bg='#b8c8ff'), 'विक्की की सैलरी, तीस हज़ार से साठ हज़ार हो गई!', 'Vicky ki salary, 30 hazaar se 60 hazaar ho gayi!', ['₹30k → ₹60k', 'Nayi salary']),
  ('vicky', S('street', [P('vicky', -.6, .6, .3, 'holdup', hold='phone', holdArg='video', holdS=.9)], [['scooter', 1.4, 0, -.2, 1.1, -.5, 0xe63946], ['food', 1.6, 0, 1.0, .8]], c=cam('mid', .2), bg='#9ad8ff'), 'अब तो लाइफ़ सेट! नई कार, नया फ़ोन, रोज़ स्विगी!', 'Ab to life set! Nayi car, naya phone, roz Swiggy!', None),
  ('N', S('home', [P('vicky', 0, .4, 0, 'sad')], [['calendar', 1.5, 3.0, -2.9, 1.4, 0, 'end']], moth=True, mothAt=[0, 0, 1.0], c=cam('mid', 0), bg='#ffe0a8'), 'पर महीने के आख़िर में, फिर वही हाल। बचत ज़ीरो।', 'Par mahine ke aakhir mein, phir wahi haal. Bachat zero.', ['₹0', 'Mahine ke aakhir mein bachat']),
  ('N', S('studio', [], [['scale', 0, 0, 0, 1.4]], c=cam('prop', 0, .8), bg='#ffe9a8'), 'इसे लाइफ़स्टाइल इन्फ़्लेशन कहते हैं। कमाई बढ़ी, तो ख़र्चे भी उतने ही बढ़ गए।', 'Ise lifestyle inflation kehte hain. Kamai badhi, to kharche bhi utne hi badh gaye.', None),
  ('neha', S('cafe', [P('neha', -1.15, .3, .9, 'sittalk'), P('vicky', 1.15, .3, -.9, 'sit')], [['table', 0, 0, .3], ['chair', -1.15, 0, .3, 1, .9, 0xff8a3d], ['chair', 1.15, 0, .3, 1, -.9, 0xff8a3d], ['cup', -.35, 1.05, .35, 1, 0, 0], ['cup', .35, 1.05, .25]], c=cam('mid', 0), bg='#ffd8b0'), 'विक्की, जब सैलरी बढ़े, तो कम से कम आधा हिस्सा बचत में डाल।', 'Vicky, jab salary badhe, to kam se kam aadha hissa bachat mein daal.', ['50%', 'Har increment ka']),
  ('N', S('studio', [], [['pipe', 0, 0, 0, 1.2]], c=cam('prop', 0, .4), bg='#c8f0ff'), 'सैलरी आते ही, पहले बचत अपने आप कट जाए। बचा हुआ ख़र्च करो।', 'Salary aate hi, pehle bachat apne aap kat jaaye. Bacha hua kharch karo.', None),
  ('N', S('home', [P('vicky', -.6, .5, .3, 'phone', hold='phone', holdArg='bill', holdS=.9)], [['table', 1.0, 0, .2, .8], ['piggy', 1.0, .98, .2, .6]], c=cam('mid', 0), bg='#ffe0a8'), 'विक्की ने तीस हज़ार की बढ़त में से, पंद्रह हज़ार बचाने शुरू किए।', 'Vicky ne 30 hazaar ki badhat mein se, 15 hazaar bachaane shuru kiye.', ['₹15,000', 'Har mahine bachat']),
  ('vicky', S('street', [P('vicky', -.5, .7, .3, 'cheer')], [['scooter', 1.3, 0, .1, 1, -.5, 0x3d7bff], ['piggy', 2.2, 0, .9, .8, -.5]], fly='coins', c=cam('mid', .2), bg='#9ad8ff', last=True), 'अब कमाई भी बढ़ रही है, और बचत भी!', 'Ab kamai bhi badh rahi hai, aur bachat bhi!', None)]),
 # 10 --------------------------------------------------------------------------------------------------------------------------
 dict(n=10, slug='rule-of-72', title='Rule of 72: Paisa Kab Double?', look='faceless', voices={'N': NARR, 'zoya': ['hf_alpha', 1.08]},
  cast={'zoya': 'Zoya'},
  chars={'teacher': dict(shirt=0x8a7a5a, pants=0x4a4a52, hair=0xa8a8a8, coat=0x7a6a4a), 'zoya': dict(shirt=0xffffff, pants=0x2a3a5a, ponytail=True, hair=0x1d1410, hairStyle='long'),
         's1': dict(shirt=0x5a7a9a, pants=0x2a3a5a, hair=0x2a1a12), 's2': dict(shirt=0xb86a5a, pants=0x2a3a5a, hair=0x4a2a1a, bun=True), 'clerk': dict(shirt=0xc8a878, pants=0x3a3a42, hair=0x2a1a12, bun=True), 'man': dict(shirt=0x5a5a62, pants=0x2a2a30, hair=0x1d1410)},
  lines=[
  ('N', S('classroom', [P('teacher', 1.4, .2, -.5, 'point')], c=cam('mid', 0), roomOpt=dict(board=['Paisa double', 'kab hoga?'])), 'पैसा कितने साल में डबल होगा? इसकी एक आसान ट्रिक है, रूल ऑफ़ सेवंटी टू।', 'Paisa kitne saal mein double hoga? Iski ek aasaan trick hai, Rule of 72.', None),
  ('N', S('classroom', [P('teacher', 1.6, .2, -.6, 'count')], c=[[0, 3.4, 8.2], [0, 3.0, -2]], roomOpt=dict(board=['72 ÷ byaaj', '= saal'])), 'बहत्तर को ब्याज दर से भाग दो। जो आए, उतने साल में पैसा डबल।', '72 ko byaaj dar se bhaag do. Jo aaye, utne saal mein paisa double.', ['72 ÷ byaaj = saal', 'Rule of 72']),
  ('N', S('bank', [P('clerk', 0, -2.6, 0, 'idle'), P('s2', 0, .4, PI * .9, 'hold', hold='papers', holdArg=1, holdS=.6)], c=[[1.8, 3.2, 8.0], [0, 1.9, -1.0]]), 'एफ़ डी पे छह प्रतिशत? बहत्तर भाग छह, यानी बारह साल में डबल।', 'FD pe 6 percent? 72 bhaag 6, yaani 12 saal mein double.', ['12 saal', 'FD ~6%']),
  ('N', S('park', [], [['cointree', 0, 0, 0, 1.4]], c=cam('prop', 0, .8)), 'अगर बारह प्रतिशत मिले, तो सिर्फ़ छह साल में डबल।', 'Agar 12 percent mile, to sirf 6 saal mein double.', ['6 saal', '12% return (agar mile)']),
  ('zoya', S('classroom', [P('s1', -1.6, .6, .2, 'sit'), P('zoya', 0, .6, 0, 'wave'), P('s2', 1.6, .6, -.2, 'sit')], [['chair', -1.6, 0, .6, 1, .2], ['chair', 1.6, 0, .6, 1, -.2]], c=cam('mid', 0), roomOpt=dict(board=['72 ÷ 3 = ?'])), 'और सेविंग्स अकाउंट का तीन प्रतिशत?', 'Aur savings account ka 3 percent?', None),
  ('N', S('office', [], [['desk', 0, 0, 0, 1.0], ['snail', -.9, 1.22, 0, .8]], c=cam('prop', 0, .5)), 'पूरे चौबीस साल! तब तक महँगाई उसे खा चुकी होगी।', 'Poore 24 saal! Tab tak mehangai use kha chuki hogi.', ['24 saal', '72 ÷ 3']),
  ('N', S('night', [P('man', 0, .2, 0, 'sitsad')], [['sofa', 0, 0, -.1, 1.1], ['envelopes', 0, 0, 1.2, 1.4]], c=cam('mid', 0)), 'उल्टा भी काम करता है। छत्तीस प्रतिशत वाला क्रेडिट कार्ड क़र्ज़, सिर्फ़ दो साल में डबल हो जाता है!', 'Ulta bhi kaam karta hai. 36 percent wala credit card karz, sirf 2 saal mein double ho jaata hai!', ['2 saal', 'Credit card karz ~36%']),
  ('N', S('city', [P('s1', -1.2, 1, PI, 'walk', walk=[-1.2, -1.2, 1.5, -3]), P('zoya', 0, 1, PI, 'walk', walk=[0, 0, 2, -2.5]), P('man', 1.3, 1, PI, 'walk', walk=[1.3, 1.3, 1.2, -3.2])], c=cam('back'), last=True), 'इसलिए, ब्याज कमाओ, ब्याज भरो मत। अगली बार कोई स्कीम देखो, पहले रूल ऑफ़ सेवंटी टू लगाओ।', 'Isliye, byaaj kamao, byaaj bharo mat. Agli baar koi scheme dekho, pehle Rule of 72 lagao.', None)]),
]

if __name__ == '__main__':
    for e in EPISODES:
        d = f"{H}/{e['n']:02d}-{e['slug']}"; os.makedirs(d, exist_ok=True)
        lines, l3, shot = [], [], None
        for sp, sh, deva, cap, stat in e['lines']:
            if sh is not None: shot = sh
            p = dict(shot, look=e['look'], chars=e['chars'], speaker=sp, stat=stat)
            lines.append([sp, {'stat': stat} if stat else {}, deva, cap]); l3.append(['pt', p, cap])
        ep = dict(num=e['n'], title=e['title'], look=e['look'], cast={'N': 'Narrator', **e['cast']}, note=NOTE)
        json.dump(dict(out=f"{e['n']:02d}-{e['slug']}", ep=ep, voices=e['voices'], sections=[dict(name=e['title'], lines=lines)]), open(f"{d}/script.json", 'w'), ensure_ascii=False, indent=1)
        json.dump(dict(out=f"{e['n']:02d}-{e['slug']}", ep=ep, sets='money/paisa.js', style='lively', sections=[dict(name=e['title'], lines=l3)]), open(f"{d}/script3d.json", 'w'), ensure_ascii=False)
        print(d, len(lines), 'lines')
