# Underdog Shorts: writes NN-slug/script.json for 10 true underdog success stories.
# Each line is [id, shot, narration]. A shot names a background, the cast on screen (pose, expression, turn),
# props, and optional overlays (a stamp or a counter). Run: python3 scripts.py
import json, os, re

def C(id, x=960, y=400, s=.9, pose='rest', expr='neutral', turn=0, **k): return dict(id=id, x=x, y=y, s=s, pose=pose, expr=expr, turn=turn, **k)
def P(type, x=960, y=900, s=1, **k): return dict(type=type, x=x, y=y, s=s, **k)
def S(bg, cast=(), props=(), **k): return dict(bg=bg, cast=list(cast), props=list(props), **k)
DESK = lambda col='#7a4c2c', y=820: P('desk', 960, y, 1.6, col=col, front=True)

def ep(n, slug, title, cast, lines):
    out = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')
    d = dict(series='Underdogs', episode=n, title=title, out=out, cast=cast, voice='kokoro:am_michael',
             sections=[dict(name=title, lines=[[f'u{n:02d}_{i + 1}', s, t] for i, (s, t) in enumerate(lines)])])
    os.makedirs(f'{n:02d}-{slug}', exist_ok=True); json.dump(d, open(f'{n:02d}-{slug}/script.json', 'w'), indent=1)

SUIT = lambda top, tie='#5a2a2a', **k: dict(outfit='suit', top=top, tie=tie, **k)
EXEC = [dict(skin='#e9b48c', hairCol='#3a2a20', hair='side', **SUIT('#2e3440', '#6a2a2a'), seed=7), dict(skin='#d9a07a', hairCol='#8a8a8a', hair='bald', facial='mustache', facialCol='#6a6a6a', **SUIT('#4a3a30', '#2a4a6a'), seed=8)]

ep(1, 'dyson', 'The Man Who Failed 5,126 Times', {
    'dyson': dict(skin='#ecbf9a', hairCol='#6a5040', hair='side', glasses='round', outfit='shirt', top='#5a7aa0', shirt='#8fb0cf', seed=1),
    'wife': dict(skin='#f0c6a4', hairCol='#8a5a3a', hair='bob', fem=1, outfit='sweater', top='#8a4a5a', seed=2),
    'exec1': EXEC[0], 'exec2': EXEC[1]}, [
    (S('home', [C('dyson', 820, 400, .9, 'hold', 'annoyed', .2, hold=dict(type='oldvac', s=.5, y=640))]),
     'In 1978, James Dyson got annoyed with his vacuum cleaner. It kept losing suction.'),
    (S('workshop', [C('dyson', 1180, 400, .9, 'chin', 'think', -.3)], [P('sketch', 560, 420, .8, kind='cyclone')]),
     'The bag kept clogging with dust. So he wondered, what if a vacuum had no bag at all?'),
    (S('workshop', [C('dyson', 1450, 420, .85, 'desk', 'determined', -.4)], [P('table', 760, 760, 1.2), P('protos', 820, 760, .9, n=6)], counter=dict(label='PROTOTYPE', from_=1, to=900, pre='#')),
     'He started building prototypes in his workshop. One after another.'),
    (S('kitchen', [C('wife', 640, 420, .85, 'desk', 'worried', .3), C('dyson', 1300, 400, .9, 'neck', 'tired', -.3)], [P('papers', 640, 760, 1.2, n=6), P('table', 960, 800, 1.6, front=True)], bgo=dict(night=True)),
     'Year after year, they failed. The family got by on his wife\'s art teaching income, and growing debts.'),
    (S('workshop', [C('dyson', 1300, 400, .9, 'cheer', 'grin', -.2)], [P('vacuum', 640, 900, 1.2, col='#f2c032')], counter=dict(label='PROTOTYPE', from_=5126, to=5127, pre='#'), cam='in', focus=[900, 500]),
     'After about five years, prototype number five thousand, one hundred and twenty seven finally worked.'),
    (S('oldoffice', [C('exec1', 700, 400, .88, 'crossed', 'skeptical', .3), C('exec2', 1250, 420, .88, 'crossed', 'annoyed', -.3)], stamp='NO THANKS'),
     'But the big manufacturers weren\'t interested. Selling replacement bags was a very good business.'),
    (S('street', [C('dyson', 960, 300, .45, 'wave', 'smile', 0, walk=1)], [P('boxes', 960, 1000, .7, n=4, label='DC01', col='#f2c032')]),
     'So he licensed it in Japan first. Then, in 1993, he launched his own machine in Britain.'),
    (S('home', [C('dyson', 1250, 400, .9, 'present', 'proud', -.2)], [P('vacuum', 620, 920, 1.25, col='#f2c032')], cam='out'),
     'Within two years it was the best selling vacuum in the country. Five thousand failures, and one idea that worked.'),
])

ep(2, 'sanders', 'He Started Over in His Sixties', {
    'sanders': dict(skin='#f0c4a0', hairCol='#eeeeee', hair='swept', facial='goatee', glasses='heavy', outfit='whitesuit', top='#f4f1ea', seed=1),
    'cust': dict(skin='#d9a07a', hairCol='#2a1a12', hair='side', outfit='shirt', top='#6a8a6a', shirt='#9ab89a', seed=3),
    'owner': dict(skin='#e6b088', hairCol='#4a3a2e', hair='slick', facial='mustache', outfit='apron', shirt='#e8e0d0', seed=4)}, [
    (S('diner', [C('sanders', 960, 380, .88, 'hold', 'smile', 0, hold=dict(type='bucket', s=.5, y=470))]),
     'In the 1950s, Harland Sanders ran a busy roadside cafe in Kentucky, famous for its fried chicken.'),
    (S('road', [], [P('sign', 1400, 900, 1, text='CAFE', w=300, h=130), P('car', 700, 1000, .7, col='#3a5a8a')]),
     'Then a new interstate highway was built, and it bypassed his town.'),
    (S('diner', [C('sanders', 960, 380, .88, 'neck', 'sad', .2)], stamp='SOLD'),
     'The customers vanished. He sold everything at auction, and was left with little more than a small social security check.'),
    (S('home', [C('sanders', 960, 420, .88, 'chin', 'think', .3)], [P('armchair', 960, 1080, 1.4)], bgo=dict(night=True), counter=dict(label='AGE', from_=65, to=66)),
     'He was in his sixties. Most people would have retired.'),
    (S('road', [], [P('car', 960, 1000, .9, col='#f4f1ea'), P('cooker', 700, 700, .6)]),
     'Instead, he loaded a pressure cooker into his car, and drove from restaurant to restaurant.'),
    (S('diner', [C('sanders', 680, 400, .86, 'hold', 'smile', .3, hold=dict(type='bucket', s=.45, y=470)), C('owner', 1300, 420, .88, 'crossed', 'skeptical', -.3)], stamp='NO'),
     'He offered owners a deal. He\'d share his recipe, and they\'d pay him a nickel for every chicken they sold. Many said no.'),
    (S('road', [], [P('car', 960, 1000, .9, col='#f4f1ea')], bgo=dict(), counter=dict(label='RESTAURANTS', from_=1, to=600, suf='+')),
     'He kept going, often sleeping in his car. By 1964, more than six hundred restaurants were selling his chicken.'),
    (S('oldoffice', [C('sanders', 960, 380, .88, 'present', 'proud', 0)], [P('cheque', 1450, 700, .7, amount='$2,000,000')], cam='out'),
     'That year, he sold the company for two million dollars. Not bad for a man who started over in his sixties.'),
])

ep(3, 'disney', 'He Lost Everything, Then Drew a Mouse', {
    'walt': dict(skin='#eec29e', hairCol='#3a2a1c', hair='slick', facial='mustache', outfit='suit', top='#5a4a3a', tie='#2a3a5a', seed=1),
    'roy': dict(skin='#e6b48e', hairCol='#4a3a2a', hair='side', glasses='round', outfit='suit', top='#3a4a5a', tie='#6a3a2a', seed=2),
    'boss': dict(skin='#e2aa86', hairCol='#1d1714', hair='slick', facial='mustache', outfit='period', top='#1f2a3a', tie='#7a2a2a', seed=3)}, [
    (S('oldoffice', [C('walt', 1250, 400, .88, 'write', 'smile', -.3)], [P('sketch', 600, 430, .7, kind='lines'), DESK('#6b4a30')]),
     'In 1921, a young cartoonist named Walt Disney started his own studio in Kansas City.'),
    (S('oldoffice', [C('walt', 960, 400, .88, 'head', 'sad', 0)], [P('papers', 960, 820, 1.4, n=8, front=True)], stamp='BANKRUPT'),
     'It was called Laugh-O-Gram. By 1923, it was bankrupt.'),
    (S('street', [C('walt', 900, 300, .45, 'hold', 'determined', .2, walk=1, hold=dict(type='suitcase', s=.6, y=560))]),
     'He moved to Hollywood with a cardboard suitcase and very little money, and started again with his brother Roy.'),
    (S('oldoffice', [C('walt', 1300, 400, .88, 'present', 'grin', -.3), C('roy', 600, 420, .85, 'rest', 'smile', .3)], [P('sketch', 960, 460, .65, kind='rabbit')]),
     'Their studio had a hit: a cartoon rabbit called Oswald.'),
    (S('oldoffice', [C('boss', 680, 400, .88, 'crossed', 'smug' if False else 'skeptical', .3), C('walt', 1300, 400, .88, 'rest', 'surprised', -.3)], stamp='NOT YOURS'),
     'Then, in 1928, his distributor took control of Oswald, and hired away most of his animators.'),
    (S('train', [C('walt', 960, 420, .88, 'write', 'think', .2)], [P('notebook', 960, 830, 1, front=True), P('sketch', 1500, 520, .45, kind='mouse')], bgo=dict()),
     'On the train ride home, Walt started sketching a new character. A mouse.'),
    (S('cinema', [], [], cam='in', focus=[960, 300]),
     'Later that year, Steamboat Willie became one of the first cartoons with synchronised sound. Audiences loved it.'),
    (S('oldoffice', [C('walt', 960, 400, .88, 'chin', 'proud', .1)], [DESK('#6b4a30')], cam='out'),
     'Losing his first big character pushed him to create the one that built an empire.'),
])

ep(4, 'rowling', 'Rejected 12 Times', {
    'jo': dict(skin='#f2c8a8', hairCol='#9a6a3a', hair='long', fem=1, outfit='sweater', top='#5a6a8a', seed=1, eye='#4a7a6a'),
    'pub': dict(skin='#e6b48e', hairCol='#6a6a6a', hair='side', glasses='rect', outfit='suit', top='#3a3a44', tie='#7a3a2a', seed=2),
    'alice': dict(skin='#f4cfb0', hairCol='#c98a4a', hair='ponytail', fem=1, kid=1, outfit='tee', top='#d98a4a', seed=3)}, [
    (S('kitchen', [C('jo', 960, 400, .88, 'hold', 'tired', .1, hold=dict(type='baby', s=.7, y=420))], bgo=dict(night=True)),
     'In the early 1990s, Joanne Rowling was a single mother in Edinburgh, living on welfare benefits.'),
    (S('kitchen', [C('jo', 960, 420, .88, 'desk', 'sad', .2)], [P('papers', 960, 800, 1.2, n=5), P('table', 960, 830, 1.6, front=True)], bgo=dict(night=True)),
     'She later said that, at the time, she was the biggest failure she knew.'),
    (S('cafe', [C('jo', 820, 420, .88, 'write', 'think', .3)], [P('stroller', 1450, 1000, .8), P('table', 820, 830, 1.4, front=True), P('notebook', 820, 800, .9, front=True)]),
     'But she kept writing a story about a boy wizard, often in cafes, while her baby daughter slept.'),
    (S('home', [C('jo', 1300, 400, .88, 'desk', 'determined', -.3)], [P('typewriter', 700, 880, 1), P('letter', 700, 520, .7, rot=-.1)], bgo=dict(night=True)),
     'When it was finished, she typed it up and sent it out to publishers.'),
    (S('home', [], [P('letter', 520, 400, .9, rot=-.15, stamp='NO'), P('letter', 960, 560, .9, rot=.08, stamp='NO'), P('letter', 1400, 380, .9, rot=-.05, stamp='NO')], counter=dict(label='REJECTIONS', from_=1, to=12)),
     'Twelve publishers turned it down.'),
    (S('office', [C('pub', 700, 400, .88, 'hold', 'surprised', .3, hold=dict(type='book', s=.5, y=430, col='#8a3a2a')), C('alice', 1300, 520, .6, 'cheer', 'grin', -.3)]),
     'Then a small publisher, Bloomsbury, gave it to the chairman\'s eight year old daughter. She loved it, and they said yes.'),
    (S('office', [], [P('stack', 760, 960, 1.4, n=8, cols=['#8a3a2a'], label='THE BOY WIZARD'), P('stack', 1180, 960, 1.4, n=6, cols=['#8a3a2a'], label='THE BOY WIZARD')], counter=dict(label='FIRST PRINT RUN', from_=0, to=500)),
     'Harry Potter and the Philosopher\'s Stone came out in 1997, with a first printing of just five hundred hardbacks.'),
    (S('studio', [C('jo', 960, 400, .88, 'wave', 'grin', 0)], [], cam='out', counter=dict(label='COPIES SOLD', from_=0, to=500000000, suf='+')),
     'Today, the series has sold more than five hundred million copies.'),
])

ep(5, 'blakely', 'From Fax Machines to Billionaire', {
    'sara': dict(skin='#f4cdb0', hairCol='#e2c27a', hair='long', fem=1, outfit='blouse', top='#c84a5a', seed=1, eye='#4a6a9a'),
    'mill': dict(skin='#e2aa86', hairCol='#9a9a9a', hair='bald', facial='mustache', facialCol='#9a9a9a', outfit='apron', shirt='#6a7a8a', seed=2),
    'exec1': EXEC[0]}, [
    (S('office', [C('sara', 820, 400, .88, 'hold', 'smile', .3, hold=dict(type='fax', s=.5, y=470)), C('exec1', 1400, 420, .86, 'crossed', 'annoyed', -.3)], stamp='NO'),
     'For seven years, Sara Blakely sold fax machines door to door.'),
    (S('street', [C('sara', 960, 300, .45, 'rest', 'determined', 0, walk=1)]),
     'She heard no all day long. Later, she said it made her fearless.'),
    (S('home', [C('sara', 1250, 400, .88, 'hold', 'think', -.3, hold=dict(type='scissors', s=.6, y=440))], [P('fabric', 600, 820, .9)], bgo=dict(night=True)),
     'One evening, before a party, she cut the feet off her tights, to look smoother under her white trousers.'),
    (S('home', [C('sara', 1250, 400, .88, 'present', 'grin', -.3)], [P('money', 640, 900, 1.3, n=5)], counter=dict(label='SAVINGS', from_=0, to=5000, pre='$')),
     'She knew she had an idea. With five thousand dollars of her savings, she started a company.'),
    (S('factory', [C('mill', 700, 400, .88, 'phone', 'think', .3), C('sara', 1300, 400, .86, 'rest', 'worried', -.3)]),
     'Mill owners kept turning her down. Then one called back. His daughters had told him it was a great idea.'),
    (S('home', [C('sara', 960, 420, .88, 'write', 'determined', .1)], [P('notebook', 960, 830, 1, front=True), P('book', 1500, 700, .6, title='PATENTS')]),
     'She wrote much of her own patent application, and called the brand Spanx.'),
    (S('studio', [], [P('screen', 960, 560, 1.2, glow='#f6e3b0', text='ORDERS'), P('boxes', 960, 1060, .8, n=8, label='SPANX', col='#d9a0a8')]),
     'Then Oprah Winfrey named it one of her favourite things, and orders exploded.'),
    (S('studio', [C('sara', 960, 400, .88, 'cheer', 'grin', 0)], [P('news', 1500, 600, .55, head='YOUNGEST SELF-MADE BILLIONAIRE')], cam='out'),
     'In 2012, Forbes called her the world\'s youngest self-made woman billionaire.'),
])

ep(6, 'honda', 'Rejected by Toyota, Then Ruined by an Earthquake', {
    'honda': dict(skin='#e2b088', hairCol='#1d1714', hair='slick', glasses='round', outfit='apron', shirt='#e8e2d4', apron='#5a6a7a', seed=1, eye='#2a1d14'),
    't1': dict(skin='#e6b88e', hairCol='#15110e', hair='side', glasses='rect', outfit='suit', top='#2e3440', tie='#3a3a3a', seed=2, eye='#2a1d14'),
    't2': dict(skin='#dcaa82', hairCol='#2a2420', hair='slick', outfit='suit', top='#3a3a44', tie='#5a2a2a', seed=3, eye='#2a1d14')}, [
    (S('workshop', [C('honda', 1250, 400, .88, 'hold', 'determined', -.3, hold=dict(type='rings', s=.5, y=470, n=3))], [P('gears', 600, 900, .8)]),
     'Soichiro Honda loved engines. In the 1930s, he started a company making piston rings.'),
    (S('oldoffice', [C('t1', 700, 400, .88, 'crossed', 'skeptical', .3), C('honda', 1300, 400, .88, 'rest', 'worried', -.3)], [P('rings', 960, 900, .9, front=True)], stamp='REJECTED'),
     'He tried to sell them to Toyota. They rejected almost all of them for poor quality.'),
    (S('classroom', [C('honda', 960, 420, .88, 'write', 'determined', .2)], [P('notebook', 960, 830, 1, front=True)]),
     'So he went back to school to study metal, and fixed his process. Toyota became a customer.'),
    (S('ruins', [C('honda', 960, 380, .8, 'head', 'sad', 0)], [P('rubble', 960, 1080, 1.2, front=True)]),
     'Then wartime bombing, and a huge earthquake in 1945, wrecked his factory.'),
    (S('oldoffice', [C('honda', 700, 400, .88, 'shake', 'tired', .3), C('t2', 1300, 400, .88, 'shake', 'neutral', -.3, flip=True)]),
     'He sold what was left of his business to Toyota.'),
    (S('street', [], [P('bike', 960, 980, 1.1, motor=True)]),
     'After the war, Japan was short of fuel and transport. So he started fixing small engines onto bicycles.'),
    (S('factory', [C('honda', 960, 400, .88, 'present', 'proud', .1)], [P('moto', 520, 1000, .8, col='#c0302a'), P('moto', 1450, 1000, .8, col='#c0302a')]),
     'In 1948, he founded the Honda Motor Company.'),
    (S('factory', [], [P('moto', 360, 1000, .7), P('moto', 960, 1000, .7, col='#2a4a8a'), P('moto', 1560, 1000, .7)], cam='out', stamp='NO.1'),
     'By 1959, Honda was the biggest motorcycle maker in the world.'),
])

ep(7, 'hershey', 'Two Failed Shops Before Chocolate', {
    'milton': dict(skin='#ecbf9a', hairCol='#3a2a1c', hair='slick', facial='mustache', outfit='period', top='#3a3a30', tie='#5a3a2a', seed=1),
    'clerk': dict(skin='#e2aa86', hairCol='#6a4a2a', hair='side', outfit='apron', shirt='#e8e0d0', seed=2)}, [
    (S('shop', [C('milton', 960, 420, .86, 'hold', 'smile', 0, hold=dict(type='pot', s=.35, y=470))]),
     'Milton Hershey left school young, and started out as an apprentice to a candy maker.'),
    (S('shop', [C('milton', 960, 420, .86, 'neck', 'sad', .2)], stamp='CLOSED'),
     'At eighteen, he opened his own candy shop in Philadelphia. After about six years, it failed.'),
    (S('street', [C('milton', 960, 300, .45, 'rest', 'tired', 0)], [P('sign', 1450, 980, .8, text='CLOSED', col='#efe6d0', tc='#b83228')]),
     'He tried again in New York. That failed too.'),
    (S('kitchen', [C('milton', 1250, 400, .88, 'hold', 'determined', -.3, hold=dict(type='pot', s=.4, y=470))], [P('pot', 600, 900, 1)]),
     'Broke, he went back home to Lancaster, Pennsylvania, and started making caramels.'),
    (S('factory', [C('milton', 1300, 400, .88, 'present', 'grin', -.3)], [P('boxes', 700, 1000, .9, n=8, label='CARAMELS', col='#c9a06a')]),
     'This time, it worked. His caramel company became a big success.'),
    (S('factory', [C('milton', 1350, 400, .88, 'rest', 'surprised', -.4)], [P('gears', 650, 960, 1.1)]),
     'Then, at a world fair in 1893, he saw German chocolate making machines, and bought them.'),
    (S('oldoffice', [C('milton', 960, 400, .88, 'hold', 'proud', 0, hold=dict(type='cheque', s=.4, y=430, amount='$1,000,000'))]),
     'In 1900, he sold the caramel company for one million dollars, to focus on chocolate.'),
    (S('shop', [C('milton', 1300, 400, .88, 'present', 'proud', -.3)], [P('bars', 640, 980, 1.2, n=8, label='CHOCOLATE')], cam='out'),
     'Two failed shops came first. Then came one of the best known chocolate bars in the world.'),
])

ep(8, 'airbnb', 'Three Air Mattresses and a Rent Problem', {
    'brian': dict(skin='#ecc29e', hairCol='#3a2a1c', hair='side', outfit='hoodie', top='#5a6a7a', seed=1),
    'joe': dict(skin='#e6b48e', hairCol='#1d1714', hair='buzz', stubble=1, outfit='tee', top='#c98a3a', seed=2),
    'guest': dict(skin='#c98e6a', hairCol='#15110e', hair='curly', glasses='rect', outfit='shirt', top='#5a8a7a', shirt='#8ab8a8', seed=3)}, [
    (S('home', [C('brian', 680, 400, .86, 'neck', 'worried', .3), C('joe', 1280, 400, .86, 'hold', 'sad', -.3, hold=dict(type='calendar', s=.5, y=430, month='RENT DUE', day='1'))]),
     'In 2007, two young designers in San Francisco couldn\'t afford their rent.'),
    (S('street', [], [P('sign', 960, 1000, 1, text='NO VACANCY', w=520, col='#2b2622', tc='#f2c94a')]),
     'A big design conference was coming to town, and the hotels were full.'),
    (S('home', [C('joe', 1300, 400, .86, 'present', 'grin', -.3)], [P('mattress', 760, 1000, .75, n=3)]),
     'So they blew up three air mattresses on their living room floor, and rented them out, with breakfast.'),
    (S('home', [C('brian', 1300, 420, .86, 'desk', 'smile', -.3), C('guest', 600, 420, .86, 'wave', 'grin', .3)], [P('laptop', 1300, 820, .8, front=True, text='AIR BED + BREAKFAST')]),
     'They called it Air Bed and Breakfast.'),
    (S('office', [C('brian', 960, 420, .86, 'desk', 'sad', .1)], [P('laptop', 960, 820, .9, front=True, text='0 replies')], stamp='NO REPLY'),
     'Investors weren\'t interested. Many didn\'t even reply.'),
    (S('kitchen', [C('joe', 1300, 400, .86, 'present', 'grin', -.3)], [P('cereal', 640, 900, 1.1)], counter=dict(label='RAISED', from_=0, to=30000, pre='$')),
     'To stay alive, they designed and sold election themed cereal boxes, and raised about thirty thousand dollars.'),
    (S('office', [C('brian', 640, 400, .86, 'cheer', 'grin', .3), C('joe', 1300, 400, .86, 'point', 'smile', -.3)]),
     'That hustle helped get them into the startup programme Y Combinator, in 2009.'),
    (S('studio', [], [P('globe', 960, 560, 1.4)], cam='out'),
     'Today, Airbnb has hosted guests in almost every country on Earth.'),
])

ep(9, 'whatsapp', 'From Food Stamps to 19 Billion', {
    'jan': dict(skin='#ecc6a4', hairCol='#3a2a1c', hair='buzz', stubble=1, outfit='tee', top='#3a3a44', seed=1, eye='#5a7a9a'),
    'mom': dict(skin='#f0c8a8', hairCol='#6a4a3a', hair='bun', fem=1, outfit='sweater', top='#6a5a7a', seed=2),
    'brian': dict(skin='#e6b48e', hairCol='#6a5040', hair='side', glasses='rect', outfit='shirt', top='#4a5a6a', shirt='#7a8a9a', seed=3)}, [
    (S('kitchen', [C('mom', 680, 420, .86, 'desk', 'tired', .3), C('jan', 1300, 440, .78, 'rest', 'sad', -.3)], [P('table', 960, 850, 1.6, front=True)]),
     'At sixteen, Jan Koum moved from Ukraine to California with his mother. They relied on food stamps to get by.'),
    (S('shop', [C('jan', 960, 420, .86, 'hold', 'tired', 0, hold=dict(type='broom', s=.45, y=520, rot=.2))]),
     'He swept floors at a grocery store to help pay the bills.'),
    (S('office', [C('jan', 960, 420, .86, 'desk', 'determined', .1)], [P('laptop', 960, 820, .9, front=True, text='> learning...')]),
     'He taught himself computer networking, and later spent nine years as an engineer at Yahoo.'),
    (S('office', [C('brian', 960, 420, .86, 'desk', 'sad', .1)], [P('laptop', 960, 820, .9, front=True, text='Not this time')], stamp='REJECTED'),
     'In 2009, his friend Brian Acton applied for jobs at Facebook and Twitter. Both turned him down.'),
    (S('home', [C('jan', 960, 420, .86, 'phone', 'think', .2)], [], bgo=dict(night=True)),
     'That same year, Jan bought an iPhone, and had an idea for an app. They called it WhatsApp.'),
    (S('office', [], [P('note', 960, 560, 1.3, lines=['No ads!', 'No games!', 'No gimmicks!'])]),
     'They kept it simple. A note on Jan\'s desk said: no ads, no games, no gimmicks.'),
    (S('office', [C('jan', 640, 400, .86, 'shake', 'grin', .3), C('brian', 1300, 400, .86, 'cheer', 'grin', -.3)], [], counter=dict(label='SOLD TO FACEBOOK', from_=0, to=19, pre='$', suf=' BILLION')),
     'In 2014, Facebook bought WhatsApp for about nineteen billion dollars. The company that turned Brian down.'),
    (S('street', [C('jan', 960, 300, .45, 'hold', 'proud', 0, hold=dict(type='papers', s=.4, y=470, n=2))], [P('sign', 1450, 990, .8, text='SOCIAL SERVICES', w=520, size=44)], cam='out'),
     'Jan signed the deal outside the old welfare office, where he once queued for food stamps.'),
])

ep(10, 'ford', 'Two Failed Car Companies First', {
    'ford': dict(skin='#ecbf9a', hairCol='#6a6a6a', hair='slick', outfit='suit', top='#3a3a40', tie='#2a2a2a', seed=1),
    'inv1': EXEC[0], 'inv2': EXEC[1]}, [
    (S('shed', [C('ford', 600, 420, .8, 'hips', 'determined', .3)], [P('quad', 1350, 980, 1.1)], bgo=dict(hole=True)),
     'In 1896, Henry Ford built his first car in a shed behind his house. It was too wide for the door, so he knocked out part of the wall.'),
    (S('factory', [C('ford', 960, 400, .88, 'neck', 'sad', 0)], stamp='CLOSED'),
     'In 1899, he started the Detroit Automobile Company. It built very few cars, and shut down within two years.'),
    (S('factory', [C('ford', 1300, 400, .88, 'crossed', 'annoyed', -.3)], [P('car', 650, 1000, .8, col='#5a2a2a')], stamp='RENAMED'),
     'His second company failed too. He left, and it was later renamed Cadillac.'),
    (S('oldoffice', [C('inv1', 680, 400, .88, 'crossed', 'skeptical', .3), C('inv2', 1280, 400, .88, 'shrug', 'annoyed', -.3)]),
     'A lot of investors had lost faith in him.'),
    (S('oldoffice', [C('ford', 680, 400, .88, 'shake', 'determined', .3), C('inv1', 1300, 400, .88, 'shake', 'smile', -.3, flip=True)]),
     'But in 1903, on his third try, he started the Ford Motor Company.'),
    (S('street', [C('ford', 1400, 300, .45, 'present', 'proud', -.2)], [P('car', 700, 1000, 1, col='#1d1d22')]),
     'In 1908 came the Model T. Simple, tough, and affordable.'),
    (S('factory', [], [P('line', 960, 1000, 1)], counter=dict(label='MINUTES PER CAR', from_=750, to=93)),
     'In 1913, his moving assembly line cut the time to build a car from about twelve hours, to about an hour and a half.'),
    (S('street', [C('ford', 960, 300, .45, 'wave', 'proud', 0)], [P('car', 420, 1000, .7), P('car', 1500, 1000, .7, col='#3a3a40')], cam='out'),
     'Two failed companies came first. Then came one of the most famous names in cars.'),
])
