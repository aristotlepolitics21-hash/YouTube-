# Money Shorts: writes NN-slug/script.json for all 10 episodes.
# Each line is [id, beat, narration]. A beat holds the on-screen headline (*word* = orange accent),
# the top label, the presenter's pose and face, and one prop card. Run: python3 scripts.py
import json, os, re

O, I, G, K = '#f0502a', '#171512', '#f2b632', '#2f9e5b'   # orange, ink, gold, green

def ep(n, slug, title, counter, beats):
    lines = [[f'm{n:02d}_{i + 1}', dict(label=b[0], head=b[1], pose=b[3], face=b[4], prop=b[5], **({'count': b[6]} if len(b) > 6 else {})), b[2]] for i, b in enumerate(beats)]
    out = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')
    d = dict(series='Money Shorts', episode=n, title=title, out=out, counter=counter, voice='kokoro:am_michael', sections=[dict(name=title, lines=lines)])
    os.makedirs(f'{n:02d}-{slug}', exist_ok=True); json.dump(d, open(f'{n:02d}-{slug}/script.json', 'w'), indent=1)

ep(1, 'start-early', 'Same 100 Dollars, Double the Money', {'label': 'AT 65', 'pre': '$'}, [
    ('hook', 'Same *$100* a month. Double the money.', 'Two people invest the same hundred dollars a month. One ends up with twice as much.', 'point', 'grin',
     {'type': 'versus', 'a': {'t': 'ALEX', 'big': '$100/mo', 'sub': 'invests'}, 'b': {'t': 'SAM', 'big': '$100/mo', 'sub': 'invests'}}),
    ('setup', 'Alex starts at *20*. Sam waits until 30.', 'Alex starts at twenty. Sam waits until thirty. Both keep going until sixty five.', 'present', 'smile',
     {'type': 'timeline', 'min': 20, 'max': 65, 'ticks': [20, 30, 65], 'rows': [['ALEX', 20, 65, O], ['SAM', 30, 65, I]]}),
    ('the math', 'Both earn about *7%* a year', "Say they both earn about seven percent a year in an index fund. That's a long term average, not a promise.", 'think', 'think',
     {'type': 'stat', 'big': '7%', 'sub': 'LONG-TERM AVERAGE, NOT GUARANTEED'}),
    ('sam', 'Sam ends with about *$180K*', 'Sam puts in forty two thousand dollars, and ends up with about a hundred and eighty thousand.', 'idle', 'smile',
     {'type': 'bank', 'label': 'SAM AT 65', 'to': 180105, 'chip': 'put in $42,000'}, 180105),
    ('alex', 'Alex ends with about *$379K*', 'Alex puts in just twelve thousand more, and ends up with about three hundred and seventy nine thousand.', 'cheer', 'wow',
     {'type': 'chart', 'title': 'PORTFOLIO', 'xl': ['AGE 20', 'AGE 65'], 'series': [
         {'pts': [0, 8, 18, 33, 53, 80, 115, 162, 223, 300, 379], 'end': 'ALEX $379K'}, {'pts': [0, 0, 0, 8, 18, 33, 53, 80, 112, 148, 180], 'col': I, 'end': 'SAM $180K'}]}, 379259),
    ('why', 'Your money earns *money*', 'That extra money is compound growth. Your returns start earning returns of their own, and ten extra years lets that snowball roll.', 'present', 'happy',
     {'type': 'coins', 'n': 13, 'label': 'COMPOUNDING'}),
    ('takeaway', 'The best time to start is *today*', "So you don't need a lot of money. You need time. Start small, and start now.", 'thumbs', 'grin',
     {'type': 'tags', 'items': ['START SMALL', 'START NOW', 'STAY CONSISTENT']}),
])

ep(2, 'latte', 'Is Coffee Really Making You Broke', {'label': 'PER YEAR', 'pre': '$'}, [
    ('hook', 'Is your coffee making you *broke*?', 'Is your daily coffee really the reason you never have any money?', 'think', 'think', {'type': 'cup', 'price': '$5'}),
    ('the math', '$5 a day is *$1,825* a year', 'Five dollars a day adds up to about eighteen hundred dollars a year.', 'present', 'wow',
     {'type': 'stat', 'from': 0, 'to': 1825, 'pre': '$', 'sub': 'PER YEAR ON COFFEE'}, 1825),
    ('invested', 'Invested? Maybe *$185K*', 'Invest that instead for thirty years at around seven percent, and it could grow to about a hundred and eighty five thousand.', 'point', 'grin',
     {'type': 'chart', 'title': 'IF YOU INVESTED IT', 'xl': ['YEAR 0', 'YEAR 30'], 'series': [{'pts': [0, 10, 22, 37, 56, 80, 109, 145, 185], 'end': '$185K'}]}),
    ('but', "That's not the *whole* story", "Sounds huge. But here's what the coffee argument leaves out.", 'shrug', 'smug',
     {'type': 'tags', 'items': ['HOUSING', 'TRANSPORT', 'FOOD']}),
    ('big three', 'The real money is in the *big three*', 'For most households, the biggest costs are housing, transport and food. That is where real savings hide.', 'present', 'smile',
     {'type': 'split', 'center': 'COSTS', 'parts': [['HOUSING', 33, O], ['TRANSPORT', 17, G], ['FOOD', 13, I], ['EVERYTHING ELSE', 37, '#fffdf8']], 'hi': 0}),
    ('compare', 'One big cut beats *100* small ones', 'Paying three hundred less on rent saves twice as much as skipping every coffee all year.', 'count', 'grin',
     {'type': 'versus', 'a': {'t': 'SKIP COFFEE', 'big': '$1,825', 'sub': 'per year'}, 'b': {'t': '$300 LESS RENT', 'big': '$3,600', 'sub': 'per year'}, 'win': 'b'}, 3600),
    ('takeaway', 'Enjoy the *coffee*. Fix the big stuff.', 'So enjoy the coffee. Just fix the big stuff first.', 'thumbs', 'happy', {'type': 'cup', 'heart': True}),
])

ep(3, 'pay-yourself-first', 'Why You Never Have Money Left Over', {'label': 'SAVED', 'pre': '$'}, [
    ('hook', 'Why is there never money *left over*?', "Ever notice there's never any money left at the end of the month?", 'shy', 'worried',
     {'type': 'bank', 'label': 'LEFT ON THE 30TH', 'from': 2000, 'to': 0, 'chip': 'again?!'}),
    ('problem', 'Spending *grows* to fill your pay', 'That is because spending quietly grows to fill whatever you earn.', 'shrug', 'sad',
     {'type': 'receipt', 'title': 'THIS MONTH', 'items': [['Rent', '$1,200'], ['Groceries', '$400'], ['Takeout', '$180'], ['Subscriptions', '$62'], ['Random stuff', '$158']], 'total': '$2,000'}),
    ('the fix', 'Pay *yourself* first', 'The fix is simple. Pay yourself first.', 'point', 'grin',
     {'type': 'phone', 'items': [['Payday', '+$2,000 deposited', K], ['Moved to savings', '$200, automatically', O], ['Left to spend', '$1,800', I]]}),
    ('when', 'Save on *payday*, not at the end', 'The day your pay lands, move a set amount into savings, before you spend anything.', 'present', 'smile',
     {'type': 'calendar', 'mark': [1], 'label': 'PAYDAY = SAVE DAY'}),
    ('how', 'Make it *automatic*', "Set it up as an automatic transfer, so you never have to decide again.", 'thumbs', 'smug',
     {'type': 'toggle', 'title': 'Auto-transfer', 'sub': '$200 on payday, every month'}),
    ('start', 'Start with just *10%*', "Even ten percent is a great start. On two thousand a month, that's twenty four hundred dollars a year.", 'count', 'happy',
     {'type': 'coins', 'n': 12, 'label': '$2,400 / YEAR'}, 2400),
    ('takeaway', "Spend what's left, *guilt free*", "Then spend what's left without the guilt. Future you already got paid.", 'cheer', 'grin',
     {'type': 'tags', 'items': ['PAY YOU FIRST', 'AUTOMATE IT', 'SPEND THE REST']}),
])

ep(4, 'emergency-fund', 'One Car Repair Away From Debt', {'label': 'FUND', 'pre': '$'}, [
    ('hook', 'One *car repair* away from debt?', 'Could you pay a surprise thousand dollar bill tomorrow, without a credit card?', 'shy', 'worried',
     {'type': 'receipt', 'title': 'GARAGE INVOICE', 'items': [['Brake pads', '$420'], ['Rotors', '$330'], ['Labour', '$250']], 'total': '$1,000'}),
    ('the fix', "That's what an *emergency fund* is for", "That's exactly what an emergency fund is for. Money set aside only for real emergencies.", 'present', 'smile',
     {'type': 'coins', 'n': 10, 'label': 'EMERGENCY FUND'}),
    ('goal', 'Aim for *3 to 6* months of costs', 'A common goal is three to six months of your essential expenses.', 'point', 'smile',
     {'type': 'stat', 'big': '3–6', 'sub': 'MONTHS OF ESSENTIAL COSTS'}),
    ('start', 'Start with *$1,000*', 'That can feel huge, so start with a mini goal, like your first thousand dollars.', 'thumbs', 'grin',
     {'type': 'bank', 'label': 'EMERGENCY FUND', 'from': 0, 'to': 1000, 'chip': 'first goal: done'}, 1000),
    ('where', 'Keep it *separate*', 'Keep it in a separate savings account, so it is easy to reach in a crisis, but not too easy to spend.', 'present', 'smug',
     {'type': 'versus', 'a': {'t': 'CHECKING', 'big': 'spend', 'sub': 'day to day'}, 'b': {'t': 'SAVINGS', 'big': 'safety', 'sub': 'hands off'}, 'win': 'b'}),
    ('rules', 'Emergencies *only*', "A new phone? Not an emergency. Losing your job or a medical bill? That's what it's for.", 'count', 'think',
     {'type': 'checklist', 'title': 'IS IT AN EMERGENCY?', 'items': [['New phone', False], ['Job loss', True], ['Medical bill', True], ['Concert tickets', False]]}),
    ('takeaway', 'Sleep *better* tonight', "It won't make you rich. But it stops one bad week from turning into years of debt.", 'thumbs', 'happy',
     {'type': 'tags', 'items': ['START WITH $1K', 'KEEP IT SEPARATE', 'REFILL IT']}),
])

ep(5, 'minimum-payment', 'The Credit Card Trap', {'label': 'TOTAL PAID', 'pre': '$'}, [
    ('hook', 'This *$3,000* takes 11 years to pay off', 'Here is how a three thousand dollar credit card balance can take eleven years to pay off.', 'point', 'wow',
     {'type': 'card', 'bal': '$3,000'}),
    ('setup', 'The card charges *22%* a year', 'Say your card charges twenty two percent interest, and you pay sixty dollars a month.', 'present', 'smile',
     {'type': 'card', 'bal': '$3,000', 'tag': '22% APR'}),
    ('the trap', 'Most of it is *interest*', 'At first, about fifty five dollars of that sixty is just interest. Only five dollars touches the debt.', 'shy', 'worried',
     {'type': 'bars', 'items': [['INTEREST', 55, O], ['DEBT', 5, I]], 'pre': '$'}),
    ('the cost', '11 years. About *$8,200*.', 'Keep paying sixty a month, and it takes over eleven years. You pay about eight thousand two hundred dollars in total.', 'facepalm', 'sad',
     {'type': 'bank', 'label': 'TOTAL PAID', 'from': 0, 'to': 8207, 'chip': 'for a $3,000 balance'}, 8207),
    ('the fix', 'Pay *$150* instead?', 'Pay a hundred and fifty a month instead, and it is gone in just over two years, for about thirty eight hundred.', 'count', 'grin',
     {'type': 'versus', 'a': {'t': '$60 / MONTH', 'big': '11 yrs', 'sub': '$8,207 total'}, 'b': {'t': '$150 / MONTH', 'big': '26 mo', 'sub': '$3,771 total'}, 'win': 'b'}, 3771),
    ('plan', 'Pay *more* than the minimum', 'So pay more than the minimum every month, and tackle your highest interest debt first.', 'point', 'smile',
     {'type': 'checklist', 'items': [['Pay more than the minimum', True], ['Highest rate first', True], ['Stop adding new debt', True]]}),
    ('takeaway', 'Make interest work *for* you', 'Interest is great when you earn it, and painful when you pay it.', 'thumbs', 'smug',
     {'type': 'tags', 'items': ['EARN INTEREST', "DON'T PAY IT"]}),
])

ep(6, 'fifty-thirty-twenty', 'The Simplest Budget Ever', {'label': 'BUDGET', 'pre': '$'}, [
    ('hook', 'The simplest *budget* ever', 'Hate budgeting? Try the simplest budget there is. Fifty, thirty, twenty.', 'wave', 'grin',
     {'type': 'split', 'center': '100%', 'parts': [['NEEDS', 50, O], ['WANTS', 30, G], ['FUTURE YOU', 20, I]]}),
    ('needs', '*50%* for needs', 'Fifty percent goes to needs. Rent, bills, groceries, and getting to work.', 'present', 'smile',
     {'type': 'split', 'center': 'NEEDS', 'parts': [['NEEDS', 50, O], ['WANTS', 30, G], ['FUTURE YOU', 20, I]], 'hi': 0}),
    ('wants', '*30%* for wants', 'Thirty percent is for wants. Eating out, hobbies, streaming, trips.', 'cheer', 'happy',
     {'type': 'split', 'center': 'WANTS', 'parts': [['NEEDS', 50, O], ['WANTS', 30, G], ['FUTURE YOU', 20, I]], 'hi': 1}),
    ('future', '*20%* for future you', 'And twenty percent goes to future you. Savings, investing, and paying off debt.', 'point', 'smug',
     {'type': 'split', 'center': 'FUTURE', 'parts': [['NEEDS', 50, O], ['WANTS', 30, G], ['FUTURE YOU', 20, I]], 'hi': 2}),
    ('example', 'On *$3,000* a month', "On three thousand a month after tax, that's fifteen hundred, nine hundred, and six hundred.", 'present', 'smile',
     {'type': 'bars', 'items': [['NEEDS', 1500, O], ['WANTS', 900, G], ['FUTURE', 600, I]], 'pre': '$'}, 3000),
    ('honest', "It's a *guide*, not a law", "If rent eats more than half, that's normal in a lot of cities. Adjust the numbers, keep the idea.", 'shrug', 'smug',
     {'type': 'tags', 'items': ['60 / 20 / 20', '70 / 20 / 10', 'ADJUST IT']}),
    ('takeaway', 'Give every dollar a *job*', 'The point is simple. Every dollar gets a job before the month starts.', 'thumbs', 'grin',
     {'type': 'checklist', 'items': [['Needs covered', True], ['Wants planned', True], ['Future you paid', True]]}),
])

ep(7, 'digital-products', 'Make It Once, Sell It Forever', {'label': 'SALES', 'pre': ''}, [
    ('hook', 'Make it *once*, sell it again and again', 'One of the simplest side hustles is making something once, and selling it again and again.', 'point', 'grin',
     {'type': 'phone', 'items': [['New sale', '+$12  Budget Planner', K], ['New sale', '+$12  Budget Planner', K], ['New sale', '+$12  Budget Planner', K]]}, 3),
    ('what', 'Think *digital products*', 'Think templates, planners, presets, printables, or short guides.', 'present', 'smile',
     {'type': 'tags', 'items': ['TEMPLATES', 'PLANNERS', 'PRESETS', 'PRINTABLES', 'GUIDES']}),
    ('idea', 'Sell what you *already* know', 'Start with something you already know. A budget sheet, a workout plan, a study guide.', 'think', 'think',
     {'type': 'chat', 'text': 'Help me outline a simple monthly budget spreadsheet for students, with tabs for income, bills and savings.'}),
    ('where', 'List it where buyers *search*', 'List it on marketplaces like Etsy or Gumroad, where people are already searching.', 'present', 'smile',
     {'type': 'product', 'name': 'Budget Planner', 'price': '$12', 'cta': 'BUY NOW'}),
    ('honest', 'Most start *slow*', 'Be realistic. Most products sell slowly at first, and some never sell at all.', 'shrug', 'smug',
     {'type': 'bars', 'items': [['MONTH 1', 2, I], ['MONTH 2', 3, I], ['MONTH 3', 7, O], ['MONTH 4', 11, O]], 'suf': ' sold'}, 11),
    ('loop', 'Test, tweak, *repeat*', 'Make a few, see which one gets interest, then make that one better.', 'count', 'smile',
     {'type': 'checklist', 'items': [['Make 3 small products', True], ['See what sells', True], ['Improve the winner', True]]}),
    ('takeaway', '*Small* income that stacks', "It won't replace your job overnight. But small sales can stack up over time.", 'thumbs', 'happy',
     {'type': 'coins', 'n': 11, 'label': 'SIDE INCOME'}),
])

ep(8, 'creators-paid', 'How YouTubers Actually Get Paid', None, [
    ('hook', 'How YouTubers *actually* get paid', "How do YouTubers actually make money? It's not just ads.", 'point', 'smug',
     {'type': 'tags', 'items': ['ADS', 'SPONSORS', 'MEMBERSHIPS', 'MERCH', 'AFFILIATES']}),
    ('step 1', 'First, get *monetized*', 'To earn from ads, you join the YouTube Partner Program. Usually a thousand subscribers and four thousand public watch hours in a year.', 'present', 'smile',
     {'type': 'yt', 'rows': [['Subscribers', 1000, 1000], ['Watch hours (12 mo)', 4000, 4000]]}),
    ('or shorts', 'Or *10 million* Shorts views', 'Or a thousand subscribers and ten million Shorts views in ninety days.', 'count', 'wow',
     {'type': 'stat', 'big': '10M', 'sub': 'SHORTS VIEWS IN 90 DAYS'}),
    ('long videos', 'Long videos: *55%* of ad money', 'On long videos, creators keep about fifty five percent of the ad money their videos bring in.', 'present', 'grin',
     {'type': 'split', 'center': 'ADS', 'parts': [['CREATOR', 55, O], ['YOUTUBE', 45, I]], 'hi': 0}),
    ('shorts', 'Shorts: *45%* of their share', 'Shorts work differently. Ad money goes into a shared pool, and creators keep forty five percent of their share.', 'think', 'think',
     {'type': 'split', 'center': 'SHORTS', 'parts': [['CREATOR', 45, O], ['YOUTUBE', 55, I]], 'hi': 0}),
    ('the big one', 'The bigger money: *sponsors*', 'For a lot of creators, the bigger money comes from sponsors, where brands pay for a mention.', 'cheer', 'happy',
     {'type': 'phone', 'items': [['New email', 'Brand deal proposal', O], ['Affiliate payout', '+$84 this week', K], ['New member', 'joined your channel', G]]}),
    ('takeaway', 'Never rely on *one* stream', 'The smartest creators never rely on just one income stream.', 'thumbs', 'grin',
     {'type': 'checklist', 'items': [['Ads', True], ['Sponsors', True], ['Members and merch', True], ['Your own products', True]]}),
])

ep(9, 'rule-of-72', 'When Will Your Money Double', {'label': 'YEARS', 'pre': ''}, [
    ('hook', 'When will your money *double*?', 'Here is a quick trick to see when your money will double. The rule of seventy two.', 'wave', 'grin',
     {'type': 'stat', 'big': '72', 'sub': 'THE RULE OF 72'}),
    ('the rule', '72 ÷ your rate = *years*', 'Divide seventy two by your yearly return. The answer is roughly how many years it takes to double.', 'present', 'smile',
     {'type': 'stat', 'big': '72 ÷ 8 = 9', 'sub': 'YEARS TO DOUBLE AT 8%', 'col': I}, 9),
    ('example', 'At *8%*: about 9 years', 'At eight percent a year, seventy two divided by eight is nine. Your money doubles in about nine years.', 'point', 'happy',
     {'type': 'chart', 'title': '$1,000 AT 8% A YEAR', 'xl': ['YEAR 0', 'YEAR 18'], 'series': [{'pts': [1, 1.17, 1.36, 1.59, 1.85, 2.16, 2.52, 2.94, 3.43, 4.0], 'end': '$4,000'}], 'max': 4.2}, 9),
    ('savings', 'At *2%*: 36 years', 'In a savings account paying two percent? About thirty six years.', 'shrug', 'sad',
     {'type': 'versus', 'a': {'t': 'AT 8%', 'big': '9 yrs', 'sub': 'to double'}, 'b': {'t': 'AT 2%', 'big': '36 yrs', 'sub': 'to double'}, 'win': 'a'}, 36),
    ('debt', 'It works on *debt* too', 'It works on debt too. At twenty four percent interest, an unpaid balance can double in about three years.', 'shy', 'worried',
     {'type': 'card', 'bal': '$2K → $4K', 'tag': '24% APR'}, 3),
    ('prices', 'And on *prices*', 'And at three percent inflation, prices double in about twenty four years.', 'think', 'think',
     {'type': 'versus', 'a': {'t': 'TODAY', 'big': '$5', 'sub': 'a coffee'}, 'b': {'t': 'IN 24 YEARS', 'big': '$10', 'sub': 'same coffee'}}, 24),
    ('takeaway', 'Make *72* work for you', 'So use it both ways. Help your money double, and stop your debt from doing the same.', 'thumbs', 'grin',
     {'type': 'tags', 'items': ['72 ÷ RATE', 'GROW SAVINGS', 'KILL DEBT']}),
])

ep(10, 'twenty-four-hours', 'The 24 Hour Rule', {'label': 'KEPT', 'pre': '$'}, [
    ('hook', "*Don't* hit buy yet", 'Before you hit buy on that thing in your cart, try the twenty four hour rule.', 'point', 'smug',
     {'type': 'product', 'name': 'Wireless Earbuds', 'price': '$129', 'cta': 'BUY NOW'}),
    ('the trick', 'Stores *want* you to rush', 'Countdown timers, only two left, flash sales. They are built to make you decide fast.', 'shy', 'worried',
     {'type': 'timer', 'from': 3599, 'speed': 1, 'sub': 'ONLY 2 LEFT!'}),
    ('the rule', 'Wait *24 hours*', "So wait a full day before buying anything you didn't plan for.", 'present', 'smile',
     {'type': 'timer', 'label': 'COOL-OFF TIMER', 'from': 86399, 'speed': 2400, 'sub': 'ADDED TO WISHLIST'}),
    ('why', 'The urge *fades*', "Often, by tomorrow, the urge has faded, and you can't remember why you wanted it.", 'think', 'think',
     {'type': 'chart', 'title': 'HOW MUCH I WANT IT', 'xl': ['NOW', '+24 HOURS'], 'series': [{'pts': [10, 8.6, 7, 5.6, 4.4, 3.4, 2.7, 2.2, 2], 'end': 'meh'}], 'max': 10.5}, 129),
    ('still?', 'Still want it? *Buy it.*', "Still want it after a day, and it fits your budget? Then buy it, guilt free.", 'thumbs', 'grin',
     {'type': 'checklist', 'items': [['Still want it tomorrow', True], ['Fits the budget', True], ['Not just a sale', True]]}),
    ('bigger', 'Big purchase? Try *30 days*', 'For bigger purchases, stretch it to thirty days.', 'count', 'smile',
     {'type': 'calendar', 'title': 'WISHLIST WAIT', 'cross': 30, 'label': '30-DAY RULE'}),
    ('takeaway', 'Wait a day, regret *less*', 'One tiny pause, and a lot fewer things you regret buying.', 'cheer', 'happy',
     {'type': 'tags', 'items': ['WAIT 24H', 'CHECK BUDGET', 'THEN DECIDE']}),
])
