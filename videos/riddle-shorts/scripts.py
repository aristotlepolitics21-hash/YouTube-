# Riddle Shorts: 10 escape-room style riddles, English voiceover, flat cartoon scenes with an hourglass countdown.
# Drawn by engine/page.html (the 2D toon engine plus engine/riddle.js). Each line: (speaker, beat, spoken text, caption).
# Beat keys: bg (scene), cast [[id, x, facing, extra]], pose/expr/fx/hold, props/front [[kind, x, y, scale, flip, arg]],
# state (scene switch), ask (question card) + timer (countdown seconds) + pause (silent think time), reveal + answer (cards).
# Writes NN-slug/script.json.
import json, os
H = os.path.dirname(os.path.abspath(__file__))
CTA = 'Follow for a new riddle every day!'
CTA_LINE = ('N', dict(pose={}, reveal=False), 'Did you get it right? Follow for a new riddle every day!', 'Did you get it right? Follow for a new riddle every day!')
V = {'N': ['am_michael', 1.04]}
PRISONER = dict(name='Prisoner', look='shirt', wear='stripes', hair='side', skin='#e0ac69', colors={'pants': '#f2f2f2', 'shoes': '#5a3a22'})
GUARD = lambda kc, hc: dict(name='Guard', look='kurta', hat='turban', stache='big', skin='#c68642', colors={'kurta': kc, 'hat': hc, 'pants': '#f4f1e8'})
def C(id, x, f=1, **e): return [id, x, f, {'s': 1.15, **e}]
THINK = 10

def think(q):  # the question line: card + countdown + silent think time
    return ('N', dict(ask=q, timer=THINK, pause=THINK - 1.5), f'{q} You have {THINK} seconds. Think!', f'{q} You have {THINK} seconds. Think!')

RIDDLES = [
 dict(n=1, slug='two-guards-two-doors', title='Two Guards, Two Doors',
  cast={'p': PRISONER, 'g1': GUARD('#a8323a', '#e8b030'), 'g2': GUARD('#3a5aa8', '#e0e0e0')},
  lines=[
  ('N', dict(bg='dungeon2', cast=[C('p', 540, 1)], pose={'p': 'sad'}, expr={'p': 'sad'}, fx={'p': 'sweat'}), "You're locked in a dungeon with two doors. One leads to freedom. The other leads to a hungry beast.", "You're locked in a dungeon with two doors. One leads to freedom. The other leads to a hungry beast."),
  ('N', dict(cast=[C('g1', 230, 1), C('p', 540, 1), C('g2', 850, -1)], pose={'g1': 'idle', 'g2': 'idle', 'p': 'scratch'}, hold={'g1': 'spear', 'g2': 'spear'}, expr={'p': 'think'}, fx={'p': 'question'}), 'Each door has a guard. One always tells the truth. The other always lies. You do not know which is which.', "Each door has a guard. One always tells the truth. The other always lies. You don't know which is which."),
  ('N', dict(fx={}, pose={'p': 'count'}, expr={'p': 'neutral'}), 'You may ask only one question, to only one guard.', 'You may ask only one question, to only one guard.'),
  think('What one question gets you out?'),
  ('N', dict(reveal=True, answer="Ask: which door would the|OTHER guard say is freedom?|Then take the opposite door.", pose={'p': 'point'}, expr={'p': 'smug'}), 'Ask either guard: which door would the other guard say leads to freedom? Then take the opposite door.', 'Ask either guard: which door would the other guard say leads to freedom? Then take the opposite door.'),
  ('N', dict(state='right', reveal=False, pose={'p': 'cheer', 'g1': 'idle', 'g2': 'idle'}, expr={'p': 'lol', 'g1': 'shock', 'g2': 'shock'}), "The truthful guard reports the liar's wrong answer. The liar twists the truthful one's answer. Either way, you hear the wrong door.", "The truthful guard reports the liar's wrong answer. The liar twists the truthful one's answer. Either way, you hear the wrong door."),
  CTA_LINE]),
 dict(n=2, slug='three-deadly-doors', title='Three Deadly Doors', cast={'p': PRISONER},
  lines=[
  ('N', dict(bg='hall3', cast=[C('p', 540, 1, y=120)], pose={'p': 'sad'}, expr={'p': 'sad'}), 'A prisoner gets one last chance to escape. There are three doors. Behind the first is a raging fire.', 'A prisoner gets one last chance to escape. There are three doors. Behind the first is a raging fire.'),
  ('N', dict(pose={'p': 'shock'}, expr={'p': 'shock'}, fx={'p': 'sweat'}), 'Behind the second, assassins with sharp swords. Behind the third, lions that have not eaten in three years.', "Behind the second, assassins with sharp swords. Behind the third, lions that haven't eaten in three years."),
  think('Which door is the safest?'),
  ('N', dict(reveal=True, answer='The third door!', state='lion', fx={}, pose={'p': 'point'}, expr={'p': 'smug'}), 'The third door!', 'The third door!'),
  ('N', dict(reveal=False, front=[['lion', 880, 1500, .9, -1, 'dead']], pose={'p': 'cheer'}, expr={'p': 'lol'}), 'Lions that have not eaten in three years would have starved long ago. The room is safe.', "Lions that haven't eaten in three years would have starved long ago. The room is safe."),
  CTA_LINE]),
 dict(n=3, slug='magnifying-glass-or-dragon', title='The Glass or the Dragon', cast={'p': PRISONER},
  lines=[
  ('N', dict(bg='sunroom', cast=[C('p', 540, 1, y=140)], pose={'p': 'scratch'}, expr={'p': 'think'}, props=[['magnifier', 270, 760, .9], ['beam', 270, 760, 1, 1, 'on'], ['dragon', 790, 1060, .85, -1]]), "You're trapped in a stone room with two exits.", "You're trapped in a stone room with two exits."),
  ('N', dict(pose={'p': 'shock'}, expr={'p': 'shock'}, fx={'p': 'sweat'}), 'Through the first is a giant magnifying glass. The sunlight through it will burn you instantly.', 'Through the first is a giant magnifying glass. The sunlight through it will burn you instantly.'),
  ('N', dict(fx={}, pose={'p': 'shrug'}, expr={'p': 'sad'}), 'The second exit is guarded by a fire breathing dragon.', 'The second exit is guarded by a fire-breathing dragon.'),
  think('How do you escape?'),
  ('N', dict(reveal=True, answer='Wait until night!', state='night', props=[['magnifier', 270, 760, .9], ['beam', 270, 760, 1, 1, 'off'], ['dragon', 790, 1060, .85, -1]], pose={'p': 'point'}, expr={'p': 'smug'}), 'Wait until night!', 'Wait until night!'),
  ('N', dict(reveal=False, pose={'p': 'cheer'}, expr={'p': 'lol'}), 'With no sunlight, the magnifying glass cannot burn you. Just walk out through the first exit.', "With no sunlight, the magnifying glass can't burn you. Just walk out through the first exit."),
  CTA_LINE]),
 dict(n=4, slug='mirror-and-table', title='The Mirror and the Table', cast={'p': PRISONER},
  lines=[
  ('N', dict(bg='room', cast=[C('p', 300, 1, y=120)], pose={'p': 'sad'}, expr={'p': 'sad'}, props=[['mirror', 760, 800, 1.1], ['table', 760, 1500, 1.2]]), "You're locked in a room with no doors and no windows.", "You're locked in a room with no doors and no windows."),
  ('N', dict(pose={'p': 'shrug'}, expr={'p': 'think'}, fx={'p': 'question'}), 'All you have is a mirror and a table.', 'All you have is a mirror and a table.'),
  think('How do you get out?'),
  ('N', dict(reveal=True, answer='Look in the mirror.|You see what you saw!', fx={}, pose={'p': 'point'}, expr={'p': 'smug'}), 'Look in the mirror. You see what you saw.', 'Look in the mirror. You see what you saw.'),
  ('N', dict(reveal=False, props=[['mirror', 760, 800, 1.1], ['table', 760, 1500, 1.2, 1, 'cut'], ['hole', 760, 1620, 1.2]], hold={'p': None}, front=[['saw', 220, 1240, .9]], pose={'p': 'give'}, expr={'p': 'happy'}), 'Take the saw and cut the table in half. Two halves make a whole. Climb out through the hole!', 'Take the saw and cut the table in half. Two halves make a whole. Climb out through the hole!'),
  ('N', dict(pose={'p': 'cheer'}, expr={'p': 'lol'}, front=[]), 'Yes, it is a pun riddle. Did it get you?', "Yes, it's a pun riddle. Did it get you?"),
  CTA_LINE]),
 dict(n=5, slug='coconut-tree-race', title='The Coconut Tree Race', cast={},
  lines=[
  ('N', dict(bg='jungle', cast=[], props=[['coconut', 500, 1300, 1]], front=[['monkey', 200, 1500, .7, 1], ['squirrel', 820, 1560, .9, -1], ['bird', 820, 860, 1, -1]]), 'A monkey, a squirrel and a bird race to the top of a coconut tree.', 'A monkey, a squirrel and a bird race to the top of a coconut tree.'),
  ('N', dict(), 'Who will get the banana first?', 'Who will get the banana first?'),
  think('Who gets the banana?'),
  ('N', dict(reveal=True, answer='Nobody!'), 'Nobody!', 'Nobody!'),
  ('N', dict(reveal=False, front=[['monkey', 200, 1500, .7, 1], ['squirrel', 820, 1560, .9, -1], ['bird', 820, 860, 1, -1], ['emoji', 540, 760, 1.4, 1, '🥥']]), 'It is a coconut tree. You will not find any bananas on it.', "It's a coconut tree. You won't find any bananas on it."),
  CTA_LINE]),
 dict(n=6, slug='wolf-goat-cabbage', title='Wolf, Goat and Cabbage', cast={'f': dict(name='Farmer', look='dhoti', hat='cap', stache=True, skin='#b5743f', colors={'hat': '#3aa76d', 'kurta': '#f2e6cc'})},
  lines=[
  ('N', dict(bg='river', cast=[C('f', 300, 1, y=40, s=1.0)], pose={'f': 'scratch'}, expr={'f': 'think'}, props=[['boat', 600, 1250, .9]], front=[['wolf', 560, 1700, .7, -1], ['goat', 760, 1720, .8, -1], ['cabbage', 940, 1730, .9]]), 'A farmer must cross a river with a wolf, a goat and a cabbage.', 'A farmer must cross a river with a wolf, a goat and a cabbage.'),
  ('N', dict(pose={'f': 'count'}), 'His boat can carry only him and one of them at a time.', 'His boat can carry only him and one of them at a time.'),
  ('N', dict(pose={'f': 'shock'}, expr={'f': 'shock'}, fx={'f': 'sweat'}), 'Left alone, the wolf eats the goat, and the goat eats the cabbage.', 'Left alone, the wolf eats the goat, and the goat eats the cabbage.'),
  think('How does he get all three across?'),
  ('N', dict(reveal=True, answer='Goat over. Wolf over,|bring the goat back.|Cabbage over. Goat over.', fx={}, pose={'f': 'point'}, expr={'f': 'smug'}), 'Take the goat across first. Go back and take the wolf, but bring the goat back with you.', 'Take the goat across first. Go back and take the wolf, but bring the goat back with you.'),
  ('N', dict(reveal=False, pose={'f': 'cheer'}, expr={'f': 'lol'}), 'Leave the goat, and take the cabbage across to the wolf. Finally, go back for the goat.', 'Leave the goat, and take the cabbage across to the wolf. Finally, go back for the goat.'),
  CTA_LINE]),
 dict(n=7, slug='bridge-and-torch', title='The Bridge and the Torch',
  cast={'a': dict(name='A', look='tshirt', skin='#e0ac69', hair='spiky', colors={'shirt': '#3d7bff', 'logo': '1'}), 'b': dict(name='B', look='kurti', skin='#c68642', colors={'kurti': '#f15bb5'}),
        'c': dict(name='C', look='shirt', skin='#a9683a', stache=True, colors={'shirt': '#3aa76d', 'shirt2': '#c7f0d0'}), 'd': dict(name='D', look='kurta', skin='#d39b6a', hair='bald', grey=True, beard=True, colors={'kurta': '#f4f1e8'})},
  lines=[
  ('N', dict(bg='bridge', cast=[C('a', 120, 1, s=.8, y=-60), C('b', 280, 1, s=.8, y=-60), C('c', 440, 1, s=.8, y=-60), C('d', 600, 1, s=.8, y=-60)], hold={'a': 'torch'}, pose={'a': 'idle'}, front=[['sign', 120, 1700, .8, 1, '1 min'], ['sign', 280, 1780, .8, 1, '2 min'], ['sign', 440, 1700, .8, 1, '5 min'], ['sign', 600, 1780, .8, 1, '10 min']]), 'Four people must cross a shaky bridge at night. They have one torch, and the bridge holds only two at a time.', 'Four people must cross a shaky bridge at night. They have one torch, and the bridge holds only two at a time.'),
  ('N', dict(), 'They take 1, 2, 5 and 10 minutes to cross. A pair walks at the slower person\'s speed.', "They take 1, 2, 5 and 10 minutes to cross. A pair walks at the slower person's speed."),
  ('N', dict(pose={'d': 'scratch'}, expr={'d': 'think'}, fx={'d': 'question'}), 'The torch must be carried on every crossing, and they have only 17 minutes.', 'The torch must be carried on every crossing, and they have only 17 minutes.'),
  think('Can everyone cross in 17 minutes?'),
  ('N', dict(reveal=True, answer='1+2 go (2) · 1 back (3)|5+10 go (13) · 2 back (15)|1+2 go (17)', fx={}), '1 and 2 cross: 2 minutes. 1 comes back: 3 minutes.', '1 and 2 cross: 2 minutes. 1 comes back: 3 minutes.'),
  ('N', dict(reveal=False, pose={'a': 'cheer', 'b': 'cheer', 'c': 'cheer', 'd': 'cheer'}, expr={'a': 'lol', 'b': 'lol', 'c': 'lol', 'd': 'lol'}), 'The two slowest, 5 and 10, cross together: 13 minutes. 2 comes back: 15. Then 1 and 2 cross again: exactly 17!', 'The two slowest, 5 and 10, cross together: 13 minutes. 2 comes back: 15. Then 1 and 2 cross again: exactly 17!'),
  CTA_LINE]),
 dict(n=8, slug='eight-gold-balls', title="The King's 8 Gold Balls", cast={'k': dict(name='King', look='kurta', hat='crown', beard=True, grey=True, skin='#e0ac69', colors={'kurta': '#6a3a9a', 'jacket': '#ffcf33'})}, voices={'k': ['bm_lewis', .98]},
  lines=[
  ('N', dict(bg='treasury', cast=[C('k', 230, 1, y=60)], pose={'k': 'hips'}, props=[['scale', 700, 1500, .8]], front=[['balls', 640, 1700, .9, 1, 8]]), 'The king has 8 gold balls. They look the same, but one is slightly heavier.', 'The king has 8 gold balls. They look the same, but one is slightly heavier.'),
  ('k', dict(pose={'k': 'point'}, expr={'k': 'smug'}), 'Find the heavy one, and you may use my scale only twice!', 'Find the heavy one, and you may use my scale only twice!'),
  think('How do you find it in 2 weighings?'),
  ('N', dict(reveal=True, answer='Weigh 3 vs 3.|Balanced? Weigh the last 2.', pose={'k': 'idle'}, props=[['scale', 700, 1500, .8, 1, 'left']]), 'Put 3 balls on each side. If they balance, the heavy ball is one of the 2 left over. Weigh those two.', 'Put 3 balls on each side. If they balance, the heavy ball is one of the 2 left over. Weigh those two.'),
  ('N', dict(reveal=False, front=[['balls', 640, 1700, .9, -1, 8]], pose={'k': 'cheer'}, expr={'k': 'lol'}), 'If one side is heavier, take those 3. Weigh one against another. If they balance, it is the third ball.', "If one side is heavier, take those 3. Weigh one against another. If they balance, it's the third ball."),
  CTA_LINE]),
 dict(n=9, slug='two-fathers-two-sons', title='Two Fathers, Two Sons',
  cast={'gp': dict(name='Grandpa', look='kurta', hair='bald', grey=True, beard=True, skin='#c68642', colors={'kurta': '#f4f1e8', 'jacket': '#6b4c3b'}), 'dad': dict(name='Dad', look='shirt', stache=True, skin='#c68642', colors={'shirt': '#3d7bff', 'shirt2': '#cfe0ff'}),
        'kid': dict(name='Son', look='tshirt', skin='#c68642', hair='puffy', s=.8, colors={'shirt': '#ffd23f'})},
  lines=[
  ('N', dict(bg='lake', cast=[C('gp', 300, 1, y=-120, s=.95), C('dad', 540, 1, y=-120, s=.95), C('kid', 760, -1, y=-120, s=.75)], props=[['boat', 540, 1500, 1.5]], front=[['boat', 540, 1500, 1.5]]), 'Two fathers and two sons go fishing. Together they catch exactly three fish.', 'Two fathers and two sons go fishing. Together they catch exactly three fish.'),
  ('N', dict(front=[['boat', 540, 1500, 1.5], ['fish', 300, 1180, .8], ['fish', 540, 1180, .8], ['fish', 760, 1180, .8, -1]], pose={'gp': 'give', 'dad': 'give', 'kid': 'cheer'}), 'Each of them takes home one whole fish. How is that possible?', 'Each of them takes home one whole fish. How is that possible?'),
  think('How does everyone get one fish?'),
  ('N', dict(reveal=True, answer='There are only 3 people!'), 'There are only three people!', 'There are only three people!'),
  ('N', dict(reveal=False, pose={'gp': 'cheer', 'dad': 'point', 'kid': 'cheer'}, expr={'gp': 'lol', 'dad': 'smug', 'kid': 'lol'}), 'A grandfather, his son, and his grandson. The dad in the middle is both a father and a son.', 'A grandfather, his son, and his grandson. The dad in the middle is both a father and a son.'),
  CTA_LINE]),
 dict(n=10, slug='second-place-race', title='The Race Riddle',
  cast={'you': dict(name='You', look='tshirt', skin='#e0ac69', hair='spiky', colors={'shirt': '#e63946', 'logo': 'YOU'}), 'r2': dict(name='Runner', look='tshirt', skin='#a9683a', hair='short', colors={'shirt': '#3d7bff', 'logo': '2'}),
        'r1': dict(name='Leader', look='tshirt', skin='#d39b6a', hair='puffy', colors={'shirt': '#ffd23f', 'logo': '1'})},
  lines=[
  ('N', dict(bg='track', cast=[C('r1', 860, 1, s=.95), C('r2', 520, 1, s=.95), C('you', 220, 1, s=.95)], pose={'r1': 'idle', 'r2': 'idle', 'you': 'idle'}, expr={'you': 'smug'}), "You're running a race. Just before the finish line, you overtake the person in second place.", "You're running a race. Just before the finish line, you overtake the person in second place."),
  think('What place are you in now?'),
  ('N', dict(reveal=True, answer='Second place!', cast=[C('r1', 860, 1, s=.95), C('you', 560, 1, s=.95), C('r2', 260, 1, s=.95)], pose={'you': 'cheer', 'r2': 'sad'}, expr={'you': 'lol', 'r2': 'sad'}), 'Second place!', 'Second place!'),
  ('N', dict(reveal=False), 'You took their spot, so now you are second. The leader is still ahead of you. Most people say first. Did you?', "You took their spot, so now you're second. The leader is still ahead of you. Most people say first. Did you?"),
  CTA_LINE]),
]

if __name__ == '__main__':
    for r in RIDDLES:
        d = f"{H}/{r['n']:02d}-{r['slug']}"; os.makedirs(d, exist_ok=True)
        lines = [[sp, b, say, cap] for sp, b, say, cap in r['lines']]
        cast = {'N': {'name': 'Narrator'}, **r['cast']}
        json.dump(dict(out=f"{r['n']:02d}-{r['slug']}", ep=dict(num=r['n'], title=r['title'], mode='riddle', cta=CTA, cast=cast), voices={**V, **r.get('voices', {})},
                       sections=[dict(name=r['title'], lines=lines)]), open(f"{d}/script.json", 'w'), ensure_ascii=False, indent=1)
        print(d, len(lines), 'lines')
