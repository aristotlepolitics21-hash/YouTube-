# Brand Stories: how famous companies really started, and the money moves that made them.
# Same shot format and engine as ../underdog-shorts. Writes NN-slug/script.json. Run: python3 scripts.py
import json, os, re

def C(id, x=960, y=400, s=.9, pose='rest', expr='neutral', turn=0, **k): return dict(id=id, x=x, y=y, s=s, pose=pose, expr=expr, turn=turn, **k)
def P(type, x=960, y=900, s=1, **k): return dict(type=type, x=x, y=y, s=s, **k)
def S(bg, cast=(), props=(), **k): return dict(bg=bg, cast=list(cast), props=list(props), **k)
DESK = lambda col='#7a4c2c', y=820: P('desk', 960, y, 1.6, col=col, front=True)

def ep(n, slug, title, cast, lines):
    out = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')
    d = dict(series='Brand Stories', episode=n, title=title, out=out, cast=cast, voice='kokoro:am_michael',
             sections=[dict(name=title, lines=[[f'b{n:02d}_{i + 1}', s, t] for i, (s, t) in enumerate(lines)])])
    os.makedirs(f'{n:02d}-{slug}', exist_ok=True); json.dump(d, open(f'{n:02d}-{slug}/script.json', 'w'), indent=1)

SUIT = lambda top, tie='#5a2a2a', **k: dict(outfit='suit', top=top, tie=tie, **k)
EXEC = [dict(skin='#e9b48c', hairCol='#3a2a20', hair='side', **SUIT('#2e3440', '#6a2a2a'), seed=7), dict(skin='#d9a07a', hairCol='#8a8a8a', hair='bald', facial='mustache', facialCol='#6a6a6a', **SUIT('#4a3a30', '#2a4a6a'), seed=8)]
WORKER = dict(skin='#e6b48e', hairCol='#5a4030', hair='side', outfit='shirt', top='#6a7a8a', shirt='#8a9aa8', seed=9)

ep(1, 'volkswagen', 'How Volkswagen Began', {
    'porsche': dict(skin='#ecbf9a', hairCol='#3a2a1c', hair='slick', facial='mustache', outfit='suit', top='#4a4a44', tie='#2a2a3a', seed=1),
    'saver': dict(skin='#e6b48e', hairCol='#6a4a2a', hair='side', outfit='shirt', top='#8a7a5a', shirt='#b8a888', seed=2),
    'hirst': dict(skin='#ecc29e', hairCol='#6a5040', hair='side', facial='mustache', outfit='suit', top='#7a7048', tie='#4a4430', hat='cap', hatCol='#6a6440', seed=3),
    'nordhoff': dict(skin='#e2b088', hairCol='#9a9a9a', hair='slick', glasses='round', outfit='suit', top='#2e3440', tie='#3a3a5a', seed=4),
    'exec1': EXEC[0], 'exec2': EXEC[1]}, [
    (S('street', [C('saver', 1400, 300, .45, 'neck', 'sad', -.2)], [P('bike', 600, 980, .9)]),
     'In the 1930s, most Germans could not afford a car. The government wanted a cheap one for everyone. A people\'s car. In German, a Volkswagen.'),
    (S('workshop', [C('porsche', 1350, 400, .88, 'present', 'determined', -.3)], [P('beetle', 640, 960, 1, col='#7a9ab0')]),
     'Engineer Ferdinand Porsche designed it. Small, round, cheap to run, and big enough for a family.'),
    (S('home', [C('saver', 1350, 400, .88, 'hold', 'smile', -.3)], [P('stamps', 640, 560, .9)], counter=dict(label='SAVERS', from_=0, to=336000, suf='+')),
     'Workers bought savings stamps, a few marks a week, to pay for one. Over three hundred thousand people signed up.'),
    (S('factory', [C('saver', 960, 400, .88, 'head', 'sad', 0)], bgo=dict(), stamp='NO CARS'),
     'Then war broke out in 1939. The factory, run by the Nazi regime, built military vehicles instead, using forced labour. Not one saver got a car.'),
    (S('ruins', [C('hirst', 960, 400, .88, 'hips', 'determined', .1)], [P('rubble', 960, 1080, 1.2, front=True)]),
     'In 1945, the bombed factory fell under British control. A British officer, Major Ivan Hirst, got it building cars again.'),
    (S('oldoffice', [C('exec1', 700, 400, .88, 'crossed', 'skeptical', .3), C('exec2', 1250, 420, .88, 'shrug', 'annoyed', -.3)], stamp='NO FUTURE'),
     'British car makers were offered the whole factory for free. They looked at the car, and decided it had no future.'),
    (S('road', [], [P('beetle', 960, 1000, .8, col='#d9603a')]),
     'Under new boss Heinrich Nordhoff, the little car was sold all over the world. Americans nicknamed it the Beetle.'),
    (S('street', [C('nordhoff', 1450, 300, .45, 'present', 'proud', -.2)], [P('beetle', 520, 1000, .7, col='#3a8a6a'), P('beetle', 1000, 1000, .55, col='#e2b04a')], counter=dict(label='BEETLES SOLD BY 1972', from_=0, to=15007034), cam='out'),
     'In 1972, the Beetle overtook the Ford Model T as the best selling car ever made. The car nobody wanted had sold over fifteen million.'),
])

ep(2, 'ikea', 'How IKEA Began With Pens', {
    'ingvar': dict(skin='#f0c6a4', hairCol='#c9a06a', hair='side', outfit='sweater', top='#4a6a8a', seed=1, eye='#5a8aba'),
    'gillis': dict(skin='#ecc29e', hairCol='#6a5040', hair='slick', glasses='rect', outfit='shirt', top='#8a6a4a', shirt='#c8b090', seed=2),
    'exec1': EXEC[0], 'exec2': EXEC[1]}, [
    (S('home', [C('ingvar', 1300, 460, .78, 'hold', 'smile', -.3, hold=dict(type='letter', s=.4, y=430))], [P('papers', 600, 900, 1.2, n=6)]),
     'In 1943, a seventeen year old Swede named Ingvar Kamprad started a business selling pens, wallets and picture frames by mail.'),
    (S('home', [], [P('note', 960, 560, 1.4, lines=['I.K. = Ingvar Kamprad', 'E = Elmtaryd farm', 'A = Agunnaryd village'])]),
     'He called it IKEA. His initials, plus the farm and village where he grew up.'),
    (S('office', [C('ingvar', 1300, 420, .86, 'hold', 'grin', -.3, hold=dict(type='book', s=.5, y=430, col='#2a5a9a', title='CATALOGUE'))], [P('stack', 620, 960, 1.2, n=6, cols=['#2a5a9a', '#f2c032'])]),
     'A few years later he added furniture, made by local workshops and sold cheaply through his catalogue.'),
    (S('oldoffice', [C('exec1', 700, 400, .88, 'crossed', 'annoyed', .3), C('exec2', 1250, 420, .88, 'crossed', 'skeptical', -.3)], stamp='BOYCOTT'),
     'Rival furniture sellers were furious. They pressured suppliers to stop working with him.'),
    (S('workshop', [C('ingvar', 1300, 420, .86, 'write', 'determined', -.2)], [P('sketch', 600, 430, .7, kind='lines'), DESK('#8a6a4a')]),
     'So IKEA started designing its own furniture, and found new factories, including in Poland, where costs were lower.'),
    (S('street', [C('gillis', 1500, 300, .45, 'neck', 'think', -.2)], [P('car', 760, 1000, .8, col='#8a2a2a'), P('tablepiece', 760, 700, .6)]),
     'Then an employee, Gillis Lundgren, could not fit a table into his car. So he took the legs off.'),
    (S('workshop', [C('gillis', 1350, 420, .86, 'present', 'grin', -.3)], [P('flatbox', 640, 1000, 1, n=4, legs=True)]),
     'That became the flat pack. Cheaper to ship, cheaper to store, and the customer builds it at home.'),
    (S('studio', [], [P('globe', 960, 560, 1.4)], cam='out', stamp='NO.1'),
     'Today, IKEA is the biggest furniture retailer in the world. It started with pens.'),
])

ep(3, 'nike', 'How Nike Started From a Car Boot', {
    'knight': dict(skin='#ecc29e', hairCol='#8a6a3a', hair='side', outfit='shirt', top='#5a7a9a', shirt='#9ab8d0', seed=1),
    'bowerman': dict(skin='#e6b48e', hairCol='#9a9a9a', hair='bald', outfit='sweater', top='#2a5a3a', seed=2),
    'carolyn': dict(skin='#f2c8a8', hairCol='#3a2a1c', hair='bob', fem=1, outfit='blouse', top='#c86a3a', seed=3)}, [
    (S('street', [C('knight', 1450, 300, .45, 'hold', 'smile', -.2, hold=dict(type='shoe', s=.35, y=480))], [P('car', 700, 1000, .8, col='#5a7a5a')]),
     'In 1964, a young runner named Phil Knight sold Japanese running shoes out of the back of his car, at track meets.'),
    (S('office', [C('knight', 680, 420, .86, 'shake', 'grin', .3), C('bowerman', 1300, 420, .86, 'shake', 'smile', -.3, flip=True)], counter=dict(label='EACH PUT IN', from_=0, to=500, pre='$')),
     'He and his old running coach, Bill Bowerman, each put in five hundred dollars.'),
    (S('kitchen', [C('bowerman', 1300, 420, .86, 'hold', 'think', -.3, hold=dict(type='shoe', s=.35, y=480))], [P('waffle', 640, 860, 1)]),
     'Bowerman was obsessed with lighter shoes. One morning, he poured rubber into his wife\'s waffle iron.'),
    (S('workshop', [], [P('shoe', 960, 760, 1.6)], cam='in'),
     'The bumpy waffle sole gripped the track, and it became one of their first big hits.'),
    (S('classroom', [C('carolyn', 960, 420, .86, 'write', 'smile', .1)], [P('notebook', 960, 830, 1, front=True)], counter=dict(label='LOGO DESIGN FEE', from_=0, to=35, pre='$')),
     'For a logo, they paid a design student, Carolyn Davidson, thirty five dollars.'),
    (S('office', [C('knight', 960, 420, .86, 'chin', 'skeptical', .2)]),
     'Knight wasn\'t sure about it. He reportedly said, I don\'t love it, but it will grow on me.'),
    (S('studio', [C('knight', 960, 420, .86, 'cheer', 'grin', 0)], [P('sign', 1500, 980, .8, text='NIKE = VICTORY', w=440, size=46)]),
     'They named the brand after the Greek goddess of victory. Nike.'),
    (S('office', [C('carolyn', 960, 420, .86, 'hold', 'happy', 0, hold=dict(type='cheque', s=.4, y=430, amount='SHARES'))], cam='out'),
     'Years later, Knight thanked Davidson with company shares. They were later reported to be worth over a million dollars.'),
])

ep(4, 'lego', 'How LEGO Survived Bankruptcy, Fire and Plastic', {
    'ole': dict(skin='#ecbf9a', hairCol='#6a5a4a', hair='slick', facial='mustache', outfit='apron', shirt='#e8e2d4', apron='#8a6a4a', seed=1, eye='#5a8aba'),
    'godtfred': dict(skin='#f0c6a4', hairCol='#8a6a3a', hair='side', outfit='suit', top='#3a4a5a', tie='#c84a3a', seed=2),
    'clerk': WORKER}, [
    (S('workshop', [C('ole', 960, 420, .86, 'neck', 'worried', .1)], [P('table', 960, 830, 1.6, front=True)]),
     'In 1932, during the Great Depression, a Danish carpenter named Ole Kirk Christiansen was running out of work.'),
    (S('workshop', [C('ole', 1350, 420, .86, 'hold', 'smile', -.3, hold=dict(type='duck', s=.35, y=480))], [P('duck', 600, 900, .9)]),
     'To survive, he started making wooden toys. Ducks, cars, and yo-yos.'),
    (S('workshop', [], [P('sign', 960, 980, 1.2, text='LEG GODT = PLAY WELL', w=760, size=54)]),
     'He called the company LEGO, from the Danish words leg godt. Play well.'),
    (S('factory', [C('ole', 1350, 420, .86, 'present', 'determined', -.3)], [P('gears', 620, 960, 1)]),
     'In 1947, he took a huge risk, and bought an expensive plastic moulding machine.'),
    (S('shop', [C('clerk', 960, 420, .86, 'crossed', 'skeptical', 0)], [P('boxes', 960, 1060, .8, n=4, label='RETURNS', front=True)], stamp='SENT BACK'),
     'At first, plastic toys did not sell well. Some shops sent them back.'),
    (S('oldoffice', [C('godtfred', 1350, 420, .86, 'present', 'grin', -.3)], [P('bricks', 600, 960, 1)]),
     'In 1958, his son Godtfred patented the stud and tube brick, so the pieces locked together firmly.'),
    (S('ruins', [C('godtfred', 960, 400, .86, 'head', 'sad', 0)], [P('rubble', 960, 1080, 1.2, front=True)], stamp='FIRE'),
     'Then, in 1960, a fire destroyed their wooden toy warehouse. They decided to focus on plastic bricks.'),
    (S('studio', [], [P('bricks', 960, 900, 1.6, n=14)], cam='out'),
     'Today, LEGO is one of the biggest toy companies in the world.'),
])

ep(5, 'toyota', 'Toyota Started With Weaving Looms', {
    'sakichi': dict(skin='#e2b088', hairCol='#3a3a3a', hair='slick', facial='mustache', outfit='period', top='#3a3a30', tie='#4a3a2a', seed=1, eye='#2a1d14'),
    'kiichiro': dict(skin='#e6b88e', hairCol='#15110e', hair='slick', glasses='round', outfit='suit', top='#2e3440', tie='#3a3a3a', seed=2, eye='#2a1d14'),
    'brit': dict(skin='#ecc29e', hairCol='#8a6a4a', hair='side', facial='mustache', outfit='period', top='#2a2a30', tie='#6a2a2a', seed=3)}, [
    (S('factory', [C('sakichi', 1400, 420, .86, 'present', 'smile', -.3)], [P('loom', 640, 960, 1)]),
     'Before Toyota made cars, it made weaving looms.'),
    (S('workshop', [C('sakichi', 1350, 420, .86, 'chin', 'think', -.3)], [P('loom', 620, 960, .9)]),
     'Sakichi Toyoda invented automatic looms. His best one stopped by itself the moment a thread broke.'),
    (S('oldoffice', [C('brit', 680, 420, .86, 'shake', 'smile', .3), C('sakichi', 1300, 420, .86, 'shake', 'proud', -.3, flip=True)], counter=dict(label='PATENT RIGHTS', from_=0, to=100000, pre='£')),
     'In 1929, he sold the patent rights to a British company, Platt Brothers, for about a hundred thousand pounds.'),
    (S('workshop', [C('kiichiro', 1400, 420, .86, 'present', 'determined', -.3)], [P('car', 640, 1000, .8, col='#2a2a30')]),
     'His son Kiichiro used money from the loom business to start building cars.'),
    (S('oldoffice', [], [P('sign', 960, 980, 1.2, text='TOYODA  →  TOYOTA', w=760)], counter=dict(label='STROKES TO WRITE', from_=0, to=8)),
     'The name changed from Toyoda to Toyota. In Japanese it took eight strokes to write, and eight is a lucky number.'),
    (S('oldoffice', [C('kiichiro', 960, 420, .86, 'head', 'sad', 0)], [P('papers', 960, 820, 1.4, n=8, front=True)], stamp='NEAR BANKRUPT'),
     'Early cars struggled, and by 1950, the company was close to bankruptcy.'),
    (S('factory', [], [P('line', 960, 1000, 1)]),
     'It survived, and rebuilt around a new idea. Make only what is needed, and stop the line to fix every problem.'),
    (S('road', [], [P('car', 960, 1000, .9, col='#c8c8cc')], cam='out', stamp='NO.1'),
     'Today, Toyota sells more cars than any other company in the world. It all started with a loom.'),
])

ep(6, 'nintendo', 'Nintendo Started as a Card Company', {
    'fusajiro': dict(skin='#e2b088', hairCol='#3a3a3a', hair='slick', facial='beard', facialCol='#4a4a4a', outfit='period', top='#2a2a30', tie='#3a3a3a', seed=1, eye='#2a1d14'),
    'hiroshi': dict(skin='#e6b88e', hairCol='#15110e', hair='slick', glasses='rect', outfit='suit', top='#2e3440', tie='#6a2a2a', seed=2, eye='#2a1d14'),
    'yokoi': dict(skin='#e8bc94', hairCol='#15110e', hair='side', glasses='round', outfit='shirt', top='#f2ede2', shirt='#f2ede2', tie='#2a3a6a', seed=3, eye='#2a1d14')}, [
    (S('shop', [C('fusajiro', 1350, 420, .86, 'present', 'smile', -.3)], [P('cards', 620, 900, 1)]),
     'Nintendo was founded in 1889, in Kyoto, Japan. It made hand painted playing cards.'),
    (S('shop', [], [P('cards', 960, 860, 1.4, n=5)], counter=dict(label='YEARS OF CARDS', from_=0, to=70)),
     'For decades, playing cards were the whole business.'),
    (S('street', [C('hiroshi', 1500, 300, .45, 'shrug', 'think', -.2)], [P('car', 700, 1000, .7, col='#e2b04a'), P('boxes', 700, 640, .45, n=4, label='RICE')]),
     'In the 1960s, the company tried new businesses. A taxi company, instant rice, and even short stay hotels.'),
    (S('oldoffice', [C('hiroshi', 960, 420, .86, 'head', 'sad', 0)], stamp='FLOPPED'),
     'Almost all of them flopped.'),
    (S('factory', [C('yokoi', 1350, 420, .86, 'present', 'grin', -.3)], [P('arm', 640, 700, 1)]),
     'Then a young engineer, Gunpei Yokoi, built an extending grabber arm for fun. The boss turned it into a hit toy.'),
    (S('office', [C('yokoi', 1350, 420, .86, 'desk', 'think', -.3)], [P('screen', 640, 600, .8, glow='#9ab07a'), DESK('#8a8478')]),
     'Nintendo moved into toys, then into electronic games.'),
    (S('home', [], [P('console', 760, 800, 1.3), P('screen', 1380, 560, .7, glow='#9ab07a')], counter=dict(label='GAME BOYS SOLD', from_=0, to=118000000, suf='+')),
     'In 1983 came the Famicom console. Then, in 1989, the Game Boy, from Yokoi\'s team. It sold well over a hundred million.'),
    (S('studio', [C('hiroshi', 960, 420, .86, 'cheer', 'grin', 0)], cam='out'),
     'A playing card company became one of the biggest names in video games.'),
])

ep(7, 'samsung', 'Samsung Started Selling Dried Fish', {
    'lee': dict(skin='#e6b88e', hairCol='#2a2420', hair='slick', outfit='suit', top='#3a3a44', tie='#2a3a5a', seed=1, eye='#2a1d14'),
    'kunhee': dict(skin='#e2b088', hairCol='#15110e', hair='side', glasses='rect', outfit='suit', top='#2a2a30', tie='#6a2a2a', seed=2, eye='#2a1d14'),
    'exec1': EXEC[0], 'exec2': EXEC[1], 'buyer': WORKER}, [
    (S('shop', [C('lee', 960, 420, .86, 'present', 'smile', 0)]),
     'In 1938, Lee Byung-chul opened a small trading shop in Daegu, Korea.'),
    (S('shop', [C('lee', 1400, 420, .86, 'hips', 'proud', -.3)], [P('crates', 640, 1000, .9)]),
     'It sold dried fish, vegetables, and noodles.'),
    (S('oldoffice', [], [P('sign', 960, 980, 1.2, text='SAMSUNG = THREE STARS', w=820, size=52)]),
     'He called it Samsung, which means three stars.'),
    (S('factory', [C('lee', 1350, 420, .86, 'present', 'determined', -.3)], [P('boxes', 640, 1000, .9, n=8, label='SUGAR')]),
     'After the Korean War, he moved into sugar, textiles, and insurance.'),
    (S('office', [C('lee', 1350, 420, .86, 'present', 'smile', -.3)], [P('screen', 640, 600, .8, glow='#c8c8c8')]),
     'In 1969, Samsung started making electronics. Early products included black and white TVs.'),
    (S('shop', [C('buyer', 960, 420, .86, 'crossed', 'skeptical', 0)]),
     'For years, its electronics were seen as cheap and second rate.'),
    (S('oldoffice', [C('kunhee', 960, 420, .86, 'point', 'determined', .1)], stamp='CHANGE'),
     'In 1993, his son, chairman Lee Kun-hee, told managers to change everything, except their wives and children.'),
    (S('studio', [], [P('phone', 760, 620, 1.6), P('phone', 1160, 620, 1.6)], cam='out'),
     'Today, Samsung is one of the biggest phone and chip makers in the world. It began with dried fish.'),
])

ep(8, 'coca-cola', 'Coca-Cola Sold Its Bottling Rights for 1 Dollar', {
    'pemberton': dict(skin='#ecbf9a', hairCol='#5a4a3a', hair='slick', facial='beard', outfit='period', top='#3a3a30', tie='#5a3a2a', seed=1),
    'candler': dict(skin='#e6b48e', hairCol='#8a8a8a', hair='bald', facial='mustache', facialCol='#6a6a6a', outfit='period', top='#2a2a30', tie='#7a2a2a', seed=2),
    'bottler': dict(skin='#e9b48c', hairCol='#3a2a20', hair='side', outfit='suit', top='#5a4a3a', tie='#2a4a3a', seed=3)}, [
    (S('shop', [C('pemberton', 1350, 420, .86, 'hold', 'smile', -.3, hold=dict(type='glass', s=.45, y=480))]),
     'In 1886, an Atlanta pharmacist named John Pemberton mixed a new syrup, and sold it at a soda fountain.'),
    (S('diner', [], [P('glass', 960, 860, 1.4)], counter=dict(label='GLASSES PER DAY', from_=0, to=9)),
     'In its first year, it sold about nine glasses a day.'),
    (S('oldoffice', [C('pemberton', 960, 420, .86, 'neck', 'tired', 0)], [P('papers', 960, 820, 1.4, n=8, front=True)]),
     'Pemberton was ill and short of money. He sold the rights off in pieces, and died in 1888.'),
    (S('oldoffice', [C('candler', 960, 420, .86, 'hold', 'proud', 0, hold=dict(type='cheque', s=.4, y=430, amount='$2,300'))]),
     'A businessman, Asa Candler, gained control for around two thousand three hundred dollars.'),
    (S('street', [C('candler', 1450, 300, .45, 'present', 'grin', -.2)], [P('coupon', 720, 800, 1)]),
     'Candler handed out coupons for free glasses, so people would try it, and come back.'),
    (S('oldoffice', [C('candler', 680, 420, .86, 'shake', 'smug', .3), C('bottler', 1300, 420, .86, 'shake', 'grin', -.3, flip=True)], counter=dict(label='BOTTLING RIGHTS', from_=0, to=1, pre='$')),
     'In 1899, he sold the rights to bottle it across most of America, for one dollar.'),
    (S('factory', [C('bottler', 1400, 420, .86, 'cheer', 'grin', -.3)], [P('bottle', 640, 1000, 1, n=5)]),
     'He thought bottles were a passing fad. The bottlers became millionaires.'),
    (S('studio', [], [P('bottle', 960, 900, 1.2, n=7)], cam='out', counter=dict(label='SERVINGS PER DAY', from_=0, to=2000000000, suf='+')),
     'Today, the company\'s drinks are served around two billion times a day.'),
])

ep(9, 'mcdonalds', 'McDonald\'s Is Really a Property Business', {
    'kroc': dict(skin='#ecbf9a', hairCol='#4a4a4a', hair='slick', outfit='suit', top='#3a3a44', tie='#7a2a2a', seed=1),
    'dick': dict(skin='#e6b48e', hairCol='#6a6a6a', hair='bald', glasses='round', outfit='apron', shirt='#f2ede2', apron='#f2ede2', seed=2),
    'mac': dict(skin='#e9b48c', hairCol='#5a5a5a', hair='side', outfit='apron', shirt='#f2ede2', apron='#f2ede2', tie='#2a2a3a', seed=3),
    'sonneborn': dict(skin='#e2aa86', hairCol='#2a2420', hair='slick', glasses='rect', outfit='suit', top='#2e3440', tie='#3a3a5a', seed=4)}, [
    (S('oldoffice', [C('kroc', 1350, 420, .86, 'present', 'smile', -.3)], [P('mixer', 620, 960, .9)]),
     'In 1954, Ray Kroc was a fifty two year old salesman, selling milkshake mixers.'),
    (S('road', [C('kroc', 1400, 300, .45, 'chin', 'think', -.2)], [P('sign', 700, 980, .9, text='8 MIXERS?', w=360)]),
     'One small restaurant in California had ordered eight of them. He drove out to see why.'),
    (S('diner', [C('dick', 680, 420, .86, 'present', 'smile', .3), C('mac', 1300, 420, .86, 'hold', 'grin', -.3, hold=dict(type='burger', s=.3, y=480))]),
     'Brothers Dick and Mac McDonald had built a super fast kitchen. A short menu, made like a factory line.'),
    (S('diner', [C('kroc', 680, 420, .86, 'shake', 'grin', .3), C('mac', 1300, 420, .86, 'shake', 'smile', -.3, flip=True)]),
     'Kroc convinced them to let him sell franchises.'),
    (S('oldoffice', [C('kroc', 960, 420, .86, 'shrug', 'worried', 0)], [P('money', 960, 830, 1, n=2, front=True)]),
     'But the franchise fees barely made him any money.'),
    (S('oldoffice', [C('sonneborn', 1350, 420, .86, 'point', 'smug', -.3)], [P('deed', 620, 600, .8)]),
     'His finance man, Harry Sonneborn, had an idea. Own or lease the land under each restaurant, and charge the owners rent.'),
    (S('oldoffice', [C('kroc', 960, 420, .86, 'hold', 'proud', 0, hold=dict(type='cheque', s=.4, y=430, amount='$2,700,000'))]),
     'In 1961, Kroc bought out the brothers for two point seven million dollars.'),
    (S('street', [], [P('buildings', 960, 1000, 1, n=4, label='RENT'), P('burger', 1600, 700, .6)], cam='out'),
     'Today, McDonald\'s owns a huge amount of property. Some say it\'s a real estate business that happens to sell burgers.'),
])

ep(10, 'lamborghini', 'A Tractor Maker Took On Ferrari', {
    'ferruccio': dict(skin='#e6b48e', hairCol='#3a2a1c', hair='side', facial='mustache', outfit='shirt', top='#5a6a7a', shirt='#9aa8b8', seed=1),
    'enzo': dict(skin='#ecbf9a', hairCol='#e8e8e8', hair='swept', glasses='heavy', outfit='suit', top='#2a2a30', tie='#2a2a3a', seed=2)}, [
    (S('workshop', [C('ferruccio', 1350, 420, .86, 'present', 'determined', -.3)], [P('tractor', 640, 1000, .8)]),
     'After World War Two, an Italian mechanic named Ferruccio Lamborghini built tractors from old military machines.'),
    (S('road', [C('ferruccio', 1450, 300, .45, 'cheer', 'grin', -.2)], [P('sports', 720, 1000, .8, col='#c83a2a')]),
     'His tractor company made him rich. Rich enough to buy a Ferrari.'),
    (S('road', [C('ferruccio', 1450, 300, .45, 'head', 'annoyed', -.2)], [P('sports', 720, 1000, .8, col='#c83a2a', smoke=True)]),
     'But the clutch on his Ferrari kept failing.'),
    (S('oldoffice', [C('ferruccio', 680, 420, .86, 'point', 'annoyed', .3), C('enzo', 1300, 420, .86, 'crossed', 'smug', -.3)], stamp='STICK TO TRACTORS'),
     'The story goes, he complained to Enzo Ferrari himself, who told him to stick to making tractors.'),
    (S('workshop', [C('ferruccio', 1350, 420, .86, 'hold', 'skeptical', -.3, hold=dict(type='rings', s=.3, y=480, n=2))], [P('gears', 620, 960, .9)]),
     'He later said he found the clutch was much the same part as in his tractors, sold at a much higher price.'),
    (S('factory', [C('ferruccio', 960, 420, .86, 'hips', 'determined', 0)]),
     'So in 1963, he started his own sports car company.'),
    (S('studio', [], [P('sports', 960, 900, 1.2, col='#e2a82a')], cam='in'),
     'In 1966 came the Miura, one of the first mid-engined road supercars. It stunned the car world.'),
    (S('road', [], [P('tractor', 560, 1000, .6), P('sports', 1300, 1000, .7, col='#e2a82a')], cam='out'),
     'An angry tractor maker built one of the most famous supercar brands on Earth.'),
])
