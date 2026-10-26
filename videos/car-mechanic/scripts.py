# Car Mechanic 101: writes NN-slug/script.json for 10 animated explainers on how cars work.
# Beat format matches ../money-shorts: [id, beat, narration]; props come from the money engine plus engine/diagrams.js.
import json, os, re

O, I, G, K, B = '#f0502a', '#171512', '#f2b632', '#2f9e5b', '#5aa0d8'
LOOK = {'hat': '#c8402a', 'hatD': '#a3321f', 'jacket': '#2f4a6a', 'jacketD': '#253b55', 'tee': '#dcd8d0'}

def ep(n, slug, title, beats, counter=None):
    lines = [[f'c{n:02d}_{i + 1}', dict(label=b[0], head=b[1], pose=b[3], face=b[4], prop=b[5], **({'count': b[6]} if len(b) > 6 else {})), b[2]] for i, b in enumerate(beats)]
    out = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')
    d = dict(series='Car Mechanic 101', episode=n, of=20, title=title, out=out, counter=counter, look=LOOK, voice='kokoro:am_michael', sections=[dict(name=title, lines=lines)])
    os.makedirs(f'{n:02d}-{slug}', exist_ok=True); json.dump(d, open(f'{n:02d}-{slug}/script.json', 'w'), indent=1)

ep(1, 'engine', 'How a Car Engine Works', [
    ('hook', 'Your car runs on *tiny explosions*', 'Every time you drive, your engine is setting off thousands of tiny explosions every minute.', 'point', 'grin', {'type': 'engine4', 'speed': 2.4}),
    ('the cylinder', 'It all happens in a *cylinder*', 'Inside each cylinder, a piston slides up and down. A rod connects it to the crankshaft, which turns that motion into spinning.', 'present', 'smile', {'type': 'engine4', 'speed': 1.2}),
    ('stroke 1', 'Stroke one: *intake*', 'Stroke one, intake. The piston moves down, and the intake valve lets in air and fuel.', 'count', 'smile', {'type': 'engine4', 'stroke': 0}),
    ('stroke 2', 'Stroke two: *compression*', 'Stroke two, compression. Both valves close, and the piston squeezes the mixture into a tiny space.', 'think', 'think', {'type': 'engine4', 'stroke': 1}),
    ('stroke 3', 'Stroke three: *power*', 'Stroke three, power. The spark plug fires, the mixture burns, and the pressure shoves the piston down. This is what drives the car.', 'cheer', 'wow', {'type': 'engine4', 'stroke': 2}),
    ('stroke 4', 'Stroke four: *exhaust*', 'Stroke four, exhaust. The exhaust valve opens, and the piston pushes the burnt gas out. Then it all starts again.', 'present', 'smile', {'type': 'engine4', 'stroke': 3}),
    ('the math', 'At 3,000 rpm: *1,500* bangs a minute', 'Each cylinder fires once every two turns. So at three thousand rpm, that is fifteen hundred power strokes a minute, in every cylinder.', 'count', 'grin', {'type': 'stat', 'from': 0, 'to': 1500, 'sub': 'POWER STROKES PER MINUTE, PER CYLINDER'}),
    ('remember it', 'Suck, squeeze, bang, *blow*', 'Mechanics remember it as suck, squeeze, bang, blow.', 'thumbs', 'happy', {'type': 'engine4', 'speed': 3}),
])

ep(2, 'anatomy', "What's Actually Inside a Car", [
    ('hook', "What's *inside* your car?", "Let's strip a car down to the systems that actually make it work.", 'point', 'grin', {'type': 'carmap', 'hi': []}),
    ('engine', 'The *engine* makes the power', 'The engine, or the motor in an electric car, makes the power. The radiator keeps it from cooking itself.', 'present', 'smile', {'type': 'carmap', 'hi': ['engine', 'radiator']}),
    ('gearbox', 'The *gearbox* changes the ratio', 'The gearbox trades engine speed for pulling power, so you can pull away slowly or cruise fast.', 'think', 'think', {'type': 'carmap', 'hi': ['gearbox']}),
    ('drivetrain', 'The *drivetrain* feeds the wheels', 'The driveshaft and differential carry that power to the driven wheels. This one is rear wheel drive.', 'present', 'smile', {'type': 'carmap', 'hi': ['shaft', 'diff']}),
    ('control', 'Steering, suspension, *brakes*', 'Steering points the wheels, suspension keeps the tyres on the road, and the brakes turn your speed into heat.', 'count', 'smile', {'type': 'carmap', 'hi': ['steer', 'susp', 'brakes']}),
    ('chassis', 'The *body* holds it all together', 'The body shell ties everything together, and protects you in a crash.', 'present', 'smug', {'type': 'chassis', 'mode': 'mono'}),
    ('electrics', '*Electrics* run everything else', 'A battery starts the car, then the alternator keeps it charged, powering lights, sensors and dozens of small computers.', 'think', 'smile', {'type': 'carmap', 'hi': ['battery', 'tank']}),
    ('takeaway', 'Six systems, *one* machine', 'Six systems working as one. Over the next episodes, we will open each of them up.', 'thumbs', 'grin', {'type': 'tags', 'items': ['ENGINE', 'GEARBOX', 'DRIVETRAIN', 'CHASSIS', 'BRAKES', 'ELECTRICS']}),
])

ep(3, 'gearbox', 'Why Your Car Needs Gears', [
    ('hook', 'Why does a car need *gears*?', 'Why can a bicycle have one gear, but a car needs five or six?', 'think', 'think', {'type': 'gears', 'r1': 70, 'r2': 140}),
    ('the problem', 'Engines like a *narrow* speed range', 'A petrol engine only makes useful power in a band, roughly fifteen hundred to six thousand rpm. The wheels need to go from stopped to very fast.', 'shrug', 'smug',
     {'type': 'chart', 'title': 'ENGINE POWER', 'xl': ['IDLE', 'REDLINE'], 'series': [{'pts': [2, 6, 14, 26, 40, 54, 66, 74, 78, 76], 'end': 'sweet spot'}], 'max': 82}),
    ('low gear', 'First gear: *pulling* power', 'In first gear, a small gear drives a much bigger one. The wheels turn slowly, but with lots of force to get you moving.', 'present', 'grin', {'type': 'gears', 'r1': 60, 'r2': 170, 'label': 'LOW GEAR: SLOW BUT STRONG'}),
    ('high gear', 'Top gear: *speed*', 'In top gear, the gears are closer in size. The wheels spin fast while the engine stays relaxed on the motorway.', 'cheer', 'happy', {'type': 'gears', 'r1': 110, 'r2': 110, 'label': 'HIGH GEAR: FAST AND RELAXED'}),
    ('the clutch', 'The *clutch* connects and disconnects', 'In a manual car, the clutch briefly unhooks the engine from the gearbox, so gears can change without grinding.', 'count', 'smile', {'type': 'clutch'}),
    ('automatics', 'Automatics shift *for you*', 'Automatics use planetary gearsets and hydraulics, or computer controlled clutches, to change gear on their own.', 'present', 'smug', {'type': 'checklist', 'items': [['Torque converter autos', True], ['Dual clutch (DCT)', True], ['CVT: no fixed gears', True]]}),
    ('electric', 'EVs usually need *one* gear', 'Electric motors work well across a huge range of speeds, so most electric cars get by with a single gear.', 'point', 'wow', {'type': 'gears', 'r1': 70, 'r2': 120, 'label': 'MOST EVs: ONE GEAR'}),
    ('takeaway', 'Gears trade speed for *force*', 'Every gearbox does the same job. Trade speed for force, so the engine stays in its happy zone.', 'thumbs', 'grin', {'type': 'tags', 'items': ['LOW = FORCE', 'HIGH = SPEED', 'CLUTCH = DISCONNECT']}),
])

ep(4, 'brakes', 'How One Foot Stops Two Tonnes', [
    ('hook', 'One foot stops *two tonnes*', 'How can one foot stop a two tonne car? Hydraulics, and friction.', 'point', 'wow', {'type': 'brake'}),
    ('hydraulics', 'The pedal pushes *fluid*', 'The pedal pushes brake fluid through sealed pipes. Liquid barely compresses, so the push travels instantly to every wheel.', 'present', 'smile', {'type': 'brake', 'squeeze': .2}),
    ('multiply', 'Small piston, *big* force', 'A small piston at the pedal pushes bigger pistons at the wheels, multiplying the force. A vacuum or electric booster adds even more.', 'count', 'grin',
     {'type': 'versus', 'a': {'t': 'PEDAL PISTON', 'big': 'small', 'sub': 'short push'}, 'b': {'t': 'WHEEL PISTONS', 'big': 'BIG', 'sub': 'huge force'}, 'win': 'b'}),
    ('friction', 'Pads *squeeze* the disc', 'At the wheel, the caliper squeezes friction pads onto a spinning steel disc.', 'present', 'smile', {'type': 'brake'}),
    ('heat', 'Your speed becomes *heat*', 'Friction turns all that movement into heat. Race car discs can glow at over a thousand degrees.', 'shy', 'worried', {'type': 'brake', 'squeeze': 1}),
    ('abs', '*ABS* stops the wheels locking', 'A locked wheel skids, and you cannot steer. ABS senses this, and releases and reapplies the brake many times a second.', 'think', 'think', {'type': 'stat', 'big': 'ABS', 'sub': 'PULSES THE BRAKES SO YOU CAN STILL STEER'}),
    ('check', 'Warning signs to *never ignore*', 'Squealing or grinding, a soft or spongy pedal, or the car pulling to one side. Get them checked straight away.', 'count', 'worried', {'type': 'checklist', 'title': 'BRAKE WARNING SIGNS', 'items': [['Squealing or grinding', False], ['Soft, spongy pedal', False], ['Pulls to one side', False]]}),
    ('takeaway', 'Fluid, friction, *heat*', 'Fluid carries the force, friction does the work, and heat is where your speed goes.', 'thumbs', 'grin', {'type': 'tags', 'items': ['FLUID', 'FRICTION', 'HEAT']}),
])

ep(5, 'suspension', 'Why Your Car Does Not Bounce', [
    ('hook', 'Why your car *doesn\'t bounce*', 'Hit a bump in a car, and it barely moves. Here is why.', 'point', 'grin', {'type': 'suspension', 'mode': 'good'}),
    ('springs', '*Springs* soak up the bump', 'Springs between the wheel and the body compress over a bump, so the body does not get the full hit.', 'present', 'smile', {'type': 'suspension', 'mode': 'spring', 'label': 'SPRING ONLY'}),
    ('problem', 'But springs keep *bouncing*', 'On their own, springs would keep bouncing after every bump, like a pogo stick.', 'shrug', 'worried', {'type': 'suspension', 'mode': 'none', 'label': 'BOING BOING'}),
    ('dampers', '*Shock absorbers* calm it down', 'Shock absorbers, or dampers, force oil through tiny holes. That turns the bounce into heat, and the car settles at once.', 'present', 'smug', {'type': 'suspension', 'mode': 'good', 'label': 'SPRING + DAMPER'}),
    ('real job', 'The real job: *grip*', 'The real job is not comfort. It keeps the tyres pressed onto the road, so you can steer and brake.', 'count', 'smile', {'type': 'checklist', 'items': [['Tyres stay on the road', True], ['Steering stays sharp', True], ['Shorter stopping', True]]}),
    ('worn', 'Worn shocks are *dangerous*', 'Worn dampers can make your stopping distance longer, and make the car wallow and float over bumps.', 'shy', 'worried', {'type': 'versus', 'a': {'t': 'GOOD SHOCKS', 'big': 'planted', 'sub': 'tyres stay down'}, 'b': {'t': 'WORN SHOCKS', 'big': 'floaty', 'sub': 'longer stops'}, 'win': 'a'}),
    ('test', 'Try the *bounce test*', 'Push down hard on one corner and let go. If it bounces more than once or twice, get your shocks checked.', 'present', 'grin', {'type': 'suspension', 'mode': 'good'}),
    ('takeaway', 'Springs hold, dampers *control*', 'Springs hold the car up. Dampers control the bounce. Together, they keep you on the road.', 'thumbs', 'happy', {'type': 'tags', 'items': ['SPRINGS', 'DAMPERS', 'GRIP']}),
])

ep(6, 'turbo', 'How a Turbo Makes Free Power', [
    ('hook', 'Power from your *exhaust*?', 'A turbo makes extra power from something your engine would otherwise throw away. Its exhaust.', 'point', 'wow', {'type': 'turbo'}),
    ('air', 'Engines need *air*', 'Engines burn fuel with air. Squeeze in more air, and you can burn more fuel, and make more power.', 'present', 'smile', {'type': 'engine4', 'stroke': 0}),
    ('turbine', 'Exhaust spins a *turbine*', 'Hot exhaust gas rushes past a turbine wheel, spinning it at well over a hundred thousand rpm.', 'count', 'grin', {'type': 'turbo'}),
    ('compressor', 'Which spins a *compressor*', 'On the same shaft, a compressor wheel crams fresh air into the engine, under pressure.', 'present', 'smug', {'type': 'turbo'}),
    ('downsizing', 'Small engine, *big* power', 'That lets a small engine make the power of a much bigger one, while using less fuel when you are cruising.', 'cheer', 'happy', {'type': 'versus', 'a': {'t': 'NO TURBO', 'big': '2.0 L', 'sub': 'big engine'}, 'b': {'t': 'TURBO', 'big': '1.4 L', 'sub': 'similar power'}, 'win': 'b'}),
    ('lag', 'The catch: *turbo lag*', 'The catch is turbo lag. A short delay while the exhaust builds up enough flow to spin it up.', 'shrug', 'smug', {'type': 'chart', 'title': 'BOOST AFTER YOU FLOOR IT', 'xl': ['0 s', '2 s'], 'series': [{'pts': [0, 1, 2, 5, 12, 30, 60, 85, 95, 98], 'end': 'boost!'}], 'max': 100}),
    ('care', 'Treat it *kindly*', 'Warm the engine up before driving hard, and after a hard run, drive gently for a minute so oil can cool the bearings.', 'count', 'smile', {'type': 'checklist', 'items': [['Warm up before boosting', True], ['Cool down after hard driving', True], ['Change the oil on time', True]]}),
    ('takeaway', 'Exhaust in, *power* out', 'Exhaust spins the turbine, the turbine spins the compressor, and the compressor feeds the engine more air.', 'thumbs', 'grin', {'type': 'turbo'}),
])

ep(7, 'differential', 'Why Your Wheels Spin at Different Speeds', [
    ('hook', 'Your wheels spin at *different speeds*', 'Every time you turn a corner, your left and right wheels spin at different speeds.', 'point', 'wow', {'type': 'diff'}),
    ('why', 'The outside wheel goes *farther*', 'In a turn, the outer wheel travels a longer path than the inner wheel, in the same amount of time.', 'present', 'smile', {'type': 'diff'}),
    ('problem', 'A solid axle would *scrub*', 'If both driven wheels were locked together, one would have to skid. Tyres would wear, and the car would fight every corner.', 'shrug', 'worried', {'type': 'tags', 'items': ['TYRE SCRUB', 'WEAR', 'BAD HANDLING']}),
    ('the fix', 'The *differential* fixes it', 'The differential, a clever set of gears, lets the two wheels turn at different speeds while both are still driven.', 'present', 'grin', {'type': 'diff', 'gearset': True}),
    ('weakness', 'The weakness: *one wheel spin*', 'A simple open diff sends power where it is easiest to go. On ice or mud, that is the wheel that is spinning.', 'facepalm', 'sad', {'type': 'stat', 'big': 'STUCK', 'sub': 'ONE WHEEL SPINS, THE OTHER GETS NOTHING'}),
    ('lsd', '*Limited slip* fights back', 'Limited slip and locking differentials push power to the wheel with grip, which is why off roaders and sports cars use them.', 'count', 'smug', {'type': 'checklist', 'items': [['Open diff: cheap, smooth', True], ['Limited slip: better grip', True], ['Locker: off-road hero', True]]}),
    ('awd', 'All wheel drive uses *several*', 'All wheel drive cars may have a differential at the front, the rear, and one in the middle.', 'think', 'think', {'type': 'carmap', 'hi': ['diff', 'gearbox']}),
    ('takeaway', 'Corners need a *diff*', 'No differential, no smooth corners. A small box of gears doing a very clever job.', 'thumbs', 'grin', {'type': 'diff', 'gearset': True}),
])

ep(8, 'structure', 'How Your Car Is Built to Crash', [
    ('hook', 'Your car is *designed* to crush', 'Your car is designed to crush in a crash. On purpose. Here is why.', 'point', 'wow', {'type': 'chassis', 'mode': 'crash'}),
    ('old way', 'Old way: *body on frame*', 'Older cars, and many trucks, bolt the body onto a heavy steel ladder frame. Tough, but heavy.', 'present', 'smile', {'type': 'chassis', 'mode': 'frame'}),
    ('new way', 'Most cars: *monocoque*', 'Most modern cars use a monocoque, or unibody. The body shell itself is the frame. Lighter and stiffer.', 'present', 'grin', {'type': 'chassis', 'mode': 'mono'}),
    ('crumple', '*Crumple zones* absorb the hit', 'The front and back are built to fold up in a crash, soaking up energy, so your body does not have to.', 'count', 'smug', {'type': 'chassis', 'mode': 'crash'}),
    ('cage', 'The cabin is a *safety cage*', 'The passenger cell uses ultra high strength steel, built to keep its shape around you.', 'present', 'smile', {'type': 'chassis', 'mode': 'crash'}),
    ('physics', 'Slower stop, *smaller* force', 'Crumpling makes the stop take a little longer. Spreading it out over more time means much lower forces on you.', 'think', 'think', {'type': 'versus', 'a': {'t': 'RIGID CAR', 'big': 'sudden', 'sub': 'huge forces'}, 'b': {'t': 'CRUMPLE ZONE', 'big': 'gradual', 'sub': 'lower forces'}, 'win': 'b'}),
    ('restraints', 'Belts and airbags *finish* the job', 'Seatbelts and airbags hold you in place, while the car absorbs the crash around you.', 'count', 'smile', {'type': 'checklist', 'items': [['Crumple zones', True], ['Safety cage', True], ['Seatbelts', True], ['Airbags', True]]}),
    ('takeaway', 'Crushed car, *safe* people', 'A crushed car is often a car that did its job.', 'thumbs', 'grin', {'type': 'chassis', 'mode': 'crash'}),
])

ep(9, 'cooling', 'Why Your Engine Does Not Melt', [
    ('hook', 'Most of your fuel becomes *heat*', 'A petrol engine turns only around a third of its fuel into movement. Most of the rest becomes heat.', 'point', 'wow', {'type': 'split', 'center': 'FUEL', 'parts': [['MOVEMENT', 30, K], ['HEAT + LOSSES', 70, O]], 'hi': 1}),
    ('coolant', '*Coolant* carries heat away', 'Coolant flows through passages around the cylinders, soaking up heat.', 'present', 'smile', {'type': 'cooling'}),
    ('pump', 'The *water pump* keeps it moving', 'A water pump, driven by the engine or an electric motor, keeps it circulating.', 'count', 'smile', {'type': 'cooling'}),
    ('radiator', 'The *radiator* dumps the heat', 'Hot coolant flows through the radiator, where air rushing through thin fins carries the heat away. A fan helps when you are stopped.', 'present', 'grin', {'type': 'cooling'}),
    ('thermostat', 'The *thermostat* is the gatekeeper', 'When the engine is cold, the thermostat stays shut so it warms up fast. At around ninety degrees, it opens.', 'think', 'think', {'type': 'cooling', 'open': False}),
    ('danger', 'Overheating can *wreck* an engine', 'Overheating can warp the cylinder head and blow the head gasket. If the temperature gauge climbs high, pull over safely.', 'shy', 'worried', {'type': 'stat', 'big': 'PULL OVER', 'sub': 'IF THE TEMPERATURE GAUGE HITS RED', 'col': O}),
    ('safety', 'Never open a *hot* radiator cap', 'The system is under pressure. Opening it hot can spray scalding coolant. Always wait for it to cool down.', 'facepalm', 'worried', {'type': 'checklist', 'items': [['Open the cap when hot', False], ['Wait until it cools', True], ['Check level when cold', True]]}),
    ('takeaway', 'Pump, radiator, *thermostat*', 'Pump it round, cool it in the radiator, and let the thermostat decide when.', 'thumbs', 'grin', {'type': 'cooling'}),
])

ep(10, 'electric', 'How an Electric Car Works', [
    ('hook', 'How an *electric car* works', 'No pistons, no gearbox full of gears, no exhaust. So how does an electric car work?', 'point', 'grin', {'type': 'ev'}),
    ('battery', 'A huge *battery* in the floor', 'Hundreds or even thousands of cells sit in a flat pack under the floor, storing energy as direct current.', 'present', 'smile', {'type': 'ev'}),
    ('inverter', 'The *inverter* is the brain', 'The inverter turns that DC into alternating current for the motor, and controls exactly how fast it spins.', 'count', 'smug', {'type': 'ev'}),
    ('motor', 'The *motor* pushes with magnets', 'Inside the motor, magnetic fields push and pull the rotor around. Full pulling power from zero rpm.', 'cheer', 'wow', {'type': 'ev'}),
    ('regen', 'Braking *makes* electricity', 'When you lift off, the motor works in reverse as a generator, slowing the car and sending energy back to the battery.', 'present', 'happy', {'type': 'ev', 'regen': True}),
    ('maintenance', 'Far *fewer* parts to service', 'No oil changes, no spark plugs, no clutch, no exhaust. Far fewer moving parts to wear out.', 'thumbs', 'grin', {'type': 'checklist', 'items': [['Oil changes', False], ['Spark plugs', False], ['Exhaust system', False]]}),
    ('still', 'Tyres and brakes still *matter*', 'Tyres, suspension and brakes still need care. And EVs are heavy, so tyres can wear faster.', 'shrug', 'smug', {'type': 'tags', 'items': ['TYRES', 'SUSPENSION', 'BRAKES', '12V BATTERY']}),
    ('takeaway', 'Battery, inverter, *motor*', 'Battery stores it, inverter controls it, motor turns it into motion. That is an electric car.', 'thumbs', 'happy', {'type': 'ev'}),
])

# ---------- batch 2: how things work, car care, comparisons ----------
ep(11, 'spark-plugs', 'How a Spark Plug Lights Your Engine', [
    ('hook', '*20,000 volts*, thousands of times a minute', 'Your car turns twelve volts into a spark of over twenty thousand volts, thousands of times a minute.', 'point', 'wow', {'type': 'spark'}),
    ('battery', 'It starts with *12 volts*', 'The battery supplies about twelve volts. Far too weak to jump a gap on its own.', 'present', 'smile', {'type': 'spark'}),
    ('coil', 'The *coil* multiplies it', 'An ignition coil uses two windings of wire to step that up to tens of thousands of volts, in an instant.', 'count', 'grin', {'type': 'stat', 'from': 12, 'to': 20000, 'suf': '+ V', 'sub': 'WHAT THE COIL MAKES FROM 12 VOLTS'}),
    ('the gap', 'The spark *jumps the gap*', 'At the tip of the plug, the voltage jumps a gap of about a millimetre, lighting the fuel and air.', 'present', 'smug', {'type': 'spark'}),
    ('timing', 'Fired at the *perfect* moment', 'The engine computer fires each plug just before the piston reaches the top, so the burn pushes at exactly the right time.', 'think', 'think', {'type': 'engine4', 'stroke': 2}),
    ('worn', 'Worn plugs *misfire*', 'Over time the tips wear and the gap grows. You get rough idling, hard starts, and worse fuel economy.', 'shy', 'worried', {'type': 'spark', 'mode': 'worn'}),
    ('when', 'Change them *on schedule*', 'Many plugs last tens of thousands of miles, long life iridium ones much longer. Your service book has the exact interval.', 'count', 'smile', {'type': 'checklist', 'title': 'SIGNS OF WORN PLUGS', 'items': [['Rough idle', False], ['Hard starting', False], ['Worse fuel economy', False]]}),
    ('takeaway', 'Battery, coil, *spark*', 'Twelve volts in, twenty thousand out, one tiny spark at a time.', 'thumbs', 'grin', {'type': 'spark'}),
])

ep(12, 'fuel-injection', 'How Your Car Mixes Fuel and Air', [
    ('hook', 'The perfect mix: *14.7 to 1*', 'For petrol to burn cleanly, it needs about fourteen point seven parts air to one part fuel, by weight.', 'point', 'grin', {'type': 'injector', 'ratio': True}),
    ('old', 'Old cars used *carburettors*', 'Older cars used a carburettor, which let airflow suck fuel in. Simple, but not very precise.', 'shrug', 'smug', {'type': 'tags', 'items': ['CARBURETTOR', 'NOT PRECISE', 'CHOKE ON COLD DAYS']}),
    ('injector', 'Now: *fuel injectors*', 'Modern engines use injectors. Electric valves that spray a fine mist of fuel, many times a second.', 'present', 'smile', {'type': 'injector'}),
    ('ecu', 'The *ECU* does the maths', 'The engine computer reads sensors, like how much air is coming in, and decides exactly how much fuel to spray.', 'think', 'think', {'type': 'injector', 'ratio': True}),
    ('oxygen', 'The *oxygen sensor* checks the result', 'An oxygen sensor in the exhaust checks the burn, and the computer fine tunes the mix constantly.', 'count', 'smug', {'type': 'injector'}),
    ('direct', 'Port vs *direct* injection', 'Port injection sprays into the intake. Direct injection sprays straight into the cylinder, at very high pressure, for better efficiency.', 'present', 'grin', {'type': 'versus', 'a': {'t': 'PORT', 'big': 'intake', 'sub': 'simpler'}, 'b': {'t': 'DIRECT', 'big': 'cylinder', 'sub': 'more efficient'}, 'win': 'b'}),
    ('signs', 'Clogged injectors *cost* you', 'Dirty or clogged injectors can cause misfires, hesitation, and poor fuel economy.', 'shy', 'worried', {'type': 'checklist', 'items': [['Misfires', False], ['Hesitation', False], ['Poor fuel economy', False]]}),
    ('takeaway', 'Measure, spray, *burn*', 'Sensors measure, the computer decides, the injector sprays. Hundreds of times a minute.', 'thumbs', 'happy', {'type': 'injector', 'ratio': True}),
])

ep(13, 'charging', 'How Your Car Starts and Charges', [
    ('hook', 'What happens when you *turn the key*?', 'What actually happens in the second you turn the key, or press start?', 'point', 'grin', {'type': 'charging', 'mode': 'start'}),
    ('starter', 'The *starter motor* spins the engine', 'The battery sends a huge current, hundreds of amps, to the starter motor, which spins the engine until it fires.', 'present', 'wow', {'type': 'charging', 'mode': 'start'}),
    ('battery', 'The battery is *drained* a bit', 'Starting takes a big gulp of energy from the battery. Now something has to put it back.', 'shrug', 'smug', {'type': 'bank', 'label': 'BATTERY CHARGE', 'from': 100, 'to': 97, 'pre': '', 'chip': 'percent, after starting'}),
    ('alternator', 'The *alternator* recharges it', 'Once running, a belt from the engine spins the alternator, which generates electricity to recharge the battery.', 'present', 'smile', {'type': 'charging'}),
    ('everything', 'It powers *everything*', 'While driving, the alternator powers the lights, wipers, radio and all the computers.', 'count', 'grin', {'type': 'tags', 'items': ['LIGHTS', 'WIPERS', 'RADIO', 'COMPUTERS', 'BATTERY']}),
    ('warning', 'Battery light = *charging problem*', 'If the battery warning light comes on while driving, the alternator usually is not charging. Get it checked soon.', 'shy', 'worried', {'type': 'dash', 'hi': ['battery']}),
    ('life', 'Batteries wear out', 'Car batteries often last around three to five years. Slow cranking on cold mornings is a classic warning sign.', 'think', 'think', {'type': 'checklist', 'items': [['Slow cranking', False], ['Dim lights at idle', False], ['Clicking when starting', False]]}),
    ('takeaway', 'Battery starts, *alternator* runs', 'The battery starts the car. The alternator keeps it all running.', 'thumbs', 'happy', {'type': 'charging'}),
])

ep(14, 'steering', 'How Your Steering Wheel Turns the Wheels', [
    ('hook', 'How does turning *a wheel* turn the wheels?', 'How does turning a round wheel in your hands point the tyres left and right?', 'point', 'grin', {'type': 'rack'}),
    ('pinion', 'A small gear: the *pinion*', 'At the bottom of the steering column is a small gear, called the pinion.', 'present', 'smile', {'type': 'rack'}),
    ('rack', 'It moves a *rack* sideways', 'It meshes with a toothed bar, the rack. Turning the pinion slides the rack left or right.', 'count', 'smug', {'type': 'rack'}),
    ('tie rods', '*Tie rods* push the wheels', 'Tie rods on each end of the rack push and pull the front wheels, so they point where you want.', 'present', 'grin', {'type': 'rack'}),
    ('assist', 'Power steering *helps* you', 'Without help, steering a parked car is hard work. Older cars use a hydraulic pump. Most new cars use an electric motor.', 'cheer', 'happy', {'type': 'rack', 'assist': True, 'label': 'ELECTRIC POWER STEERING'}),
    ('alignment', 'Alignment keeps it *straight*', 'If the car pulls to one side, or the wheel is off centre, your wheel alignment may need adjusting.', 'think', 'think', {'type': 'checklist', 'items': [['Car pulls to one side', False], ['Wheel off centre', False], ['Uneven tyre wear', False]]}),
    ('warning', "Don't ignore *noises*", 'Clunks, whining when turning, or a heavy wheel can mean worn parts or a power steering fault.', 'shy', 'worried', {'type': 'tags', 'items': ['CLUNKING', 'WHINING', 'HEAVY WHEEL']}),
    ('takeaway', 'Pinion turns, *rack* slides', 'Pinion turns, rack slides, tie rods push, and the wheels turn.', 'thumbs', 'grin', {'type': 'rack'}),
])

ep(15, 'tyre-codes', 'What the Numbers on Your Tyres Mean', [
    ('hook', 'Your tyre is *talking* to you', 'That string of numbers on your tyre tells you almost everything about it.', 'point', 'grin', {'type': 'tyre'}),
    ('width', '205 = *width*', 'The first number is the width of the tyre in millimetres.', 'present', 'smile', {'type': 'tyre', 'hi': 0}),
    ('profile', '55 = *sidewall* height', 'The next is the profile. The sidewall height is fifty five percent of the width.', 'count', 'smug', {'type': 'tyre', 'hi': 1}),
    ('rim', 'R16 = *radial*, 16-inch rim', 'R means radial construction, and sixteen is the wheel size in inches.', 'present', 'grin', {'type': 'tyre', 'hi': 3}),
    ('load speed', '91V = *load* and speed', 'Ninety one is the load index, six hundred and fifteen kilos per tyre. V is the speed rating, up to two hundred and forty kilometres an hour.', 'think', 'think', {'type': 'tyre', 'hi': 5}),
    ('age', 'Check the *date code*', 'A four digit code shows when it was made. Twenty three, twenty one means week twenty three of 2021. Rubber ages, even unused.', 'count', 'smile', {'type': 'tyre', 'date': True}),
    ('tread', 'Tread depth *matters*', 'In the UK and Europe, the legal minimum tread is one point six millimetres. Many experts suggest replacing at three.', 'shy', 'worried', {'type': 'tread', 'depth': 2}),
    ('takeaway', 'Read your *sidewall*', 'Width, profile, rim size, load, speed, and age. All printed on the side of your tyre.', 'thumbs', 'happy', {'type': 'tyre', 'hi': 4}),
])

ep(16, 'oil', 'When Should You Really Change Your Oil', [
    ('hook', 'Oil is your engine\'s *blood*', 'Without oil, an engine can destroy itself in minutes.', 'point', 'wow', {'type': 'oilsys'}),
    ('job', 'Oil does *four* jobs', 'It lubricates moving parts, carries away heat, traps dirt, and helps seal the pistons.', 'present', 'smile', {'type': 'tags', 'items': ['LUBRICATE', 'COOL', 'CLEAN', 'SEAL']}),
    ('pump', 'A *pump* keeps it flowing', 'An oil pump pushes oil from the sump up to the crankshaft, camshafts and turbo.', 'count', 'grin', {'type': 'oilsys'}),
    ('wear', 'Oil *wears out*', 'Over time, oil breaks down and fills with dirt, so it protects less and less.', 'shrug', 'smug', {'type': 'oilsys', 'dirty': True}),
    ('grades', '5W-30: what it *means*', 'In 5W-30, the 5W is how well it flows when cold, the W is for winter. The 30 is its thickness when hot.', 'think', 'think', {'type': 'versus', 'a': {'t': 'COLD START', 'big': '5W', 'sub': 'flows easily'}, 'b': {'t': 'HOT', 'big': '30', 'sub': 'stays thick'}}),
    ('interval', 'Follow your *manual*', 'Many modern cars go five to ten thousand miles, or a year, between changes. Your owner\'s manual has the real answer.', 'count', 'smile', {'type': 'checklist', 'items': [['Check the manual', True], ['Change at least yearly', True], ['Use the right grade', True]]}),
    ('check', 'Check it *yourself*', 'Engine off, car level, pull the dipstick, wipe it, dip again. The level should sit between min and max.', 'present', 'grin', {'type': 'oilsys', 'level': .6}),
    ('takeaway', 'Fresh oil, *long* engine life', 'Oil changes are cheap. Engines are not.', 'thumbs', 'happy', {'type': 'oilsys'}),
])

ep(17, 'warning-lights', 'What Your Dashboard Lights Mean', [
    ('hook', 'Your dashboard uses *traffic light* colours', 'Your dashboard lights follow a simple colour code. Learn it, and you will know how worried to be.', 'point', 'grin', {'type': 'dash', 'hi': ['all']}),
    ('red', '*Red* means stop', 'Red means a serious problem. Pull over safely, and do not keep driving.', 'shy', 'worried', {'type': 'dash', 'hi': ['oil', 'temp', 'battery', 'brake']}),
    ('oil', 'Red oil can: *pressure*', 'The red oil can means low oil pressure. Stop the engine as soon as it is safe. Driving on can wreck it.', 'present', 'worried', {'type': 'dash', 'hi': ['oil']}),
    ('temp', 'Thermometer: *overheating*', 'The thermometer means the engine is too hot. Pull over, switch off, and let it cool.', 'facepalm', 'worried', {'type': 'dash', 'hi': ['temp']}),
    ('amber', '*Amber* means check soon', 'Amber or yellow means get it checked soon. Like tyre pressure, ABS, or the engine light.', 'think', 'think', {'type': 'dash', 'hi': ['engine', 'tpms', 'abs']}),
    ('flashing', 'Flashing engine light: *slow down*', 'A steady engine light means get it checked. A flashing one means a serious misfire. Ease off and get help.', 'shy', 'worried', {'type': 'dash', 'hi': ['engine'], 'flash': 'engine'}),
    ('green', '*Green* and *blue* are info', 'Green and blue just tell you something is on, like your lights or high beams.', 'present', 'smile', {'type': 'dash', 'hi': ['beam']}),
    ('takeaway', 'Red stop, amber *check*', 'Red, stop. Amber, check. Green and blue, all good.', 'thumbs', 'happy', {'type': 'dash', 'hi': ['all']}),
])

ep(18, 'diesel-vs-petrol', 'Diesel vs Petrol Engines', [
    ('hook', 'Diesels have *no spark plugs*', 'A diesel engine has no spark plugs. So how does it ignite its fuel?', 'point', 'wow', {'type': 'engine4', 'diesel': True, 'speed': 2}),
    ('squeeze', 'It *squeezes* air until it is hot', 'A diesel squeezes air much harder than a petrol engine. That makes it hot enough to ignite fuel on contact.', 'present', 'smile', {'type': 'engine4', 'diesel': True, 'stroke': 1}),
    ('inject', 'Fuel is sprayed *into* the hot air', 'At the top of the stroke, fuel is injected into that hot air, and it lights by itself.', 'count', 'grin', {'type': 'engine4', 'diesel': True, 'stroke': 2}),
    ('ratio', 'Much higher *compression*', 'Petrol engines usually compress around ten to one. Diesels, roughly fifteen to twenty to one.', 'think', 'think', {'type': 'versus', 'a': {'t': 'PETROL', 'big': '~10:1', 'sub': 'spark ignites'}, 'b': {'t': 'DIESEL', 'big': '~18:1', 'sub': 'heat ignites'}}),
    ('pros', 'Diesel: *torque* and economy', 'Diesels make lots of low down pulling power, and usually go further on a litre of fuel. Great for towing and long trips.', 'present', 'grin', {'type': 'checklist', 'items': [['Strong low-down torque', True], ['Better fuel economy', True], ['Great for towing', True]]}),
    ('cons', 'But: *filters* and short trips', 'Modern diesels have particulate filters that need hot, longer drives to clean themselves. Lots of short trips can clog them.', 'shy', 'worried', {'type': 'tags', 'items': ['DPF CLOGGING', 'PRICIER REPAIRS', 'NEEDS LONG DRIVES']}),
    ('petrol', 'Petrol: *smooth* and simple', 'Petrol engines rev higher, are quieter, cheaper to buy, and better for short city trips.', 'present', 'smile', {'type': 'engine4', 'speed': 3}),
    ('takeaway', 'Long trips *diesel*, short trips petrol', 'Lots of long motorway miles, diesel makes sense. Mostly short trips, petrol or hybrid is usually better.', 'thumbs', 'happy', {'type': 'versus', 'a': {'t': 'LONG TRIPS', 'big': 'diesel', 'sub': 'motorway miles'}, 'b': {'t': 'SHORT TRIPS', 'big': 'petrol', 'sub': 'city driving'}}),
])

ep(19, 'hybrid-vs-electric', 'Hybrid vs Plug-In vs Electric', [
    ('hook', 'Hybrid, plug-in or *electric*?', 'Hybrid, plug-in hybrid, or fully electric. What is actually the difference?', 'point', 'grin', {'type': 'hybrid', 'mode': 'engine'}),
    ('hybrid', 'Hybrid: engine + *small* battery', 'A regular hybrid has an engine, an electric motor, and a small battery. You never plug it in.', 'present', 'smile', {'type': 'hybrid', 'mode': 'engine'}),
    ('regen', 'It charges *itself*', 'The engine and braking recharge the battery, and the motor helps out, especially in slow traffic.', 'count', 'smug', {'type': 'hybrid', 'mode': 'regen'}),
    ('plugin', 'Plug-in: a *bigger* battery', 'A plug-in hybrid has a bigger battery you charge at home, enough for many short trips on electricity alone.', 'present', 'grin', {'type': 'hybrid', 'mode': 'plug'}),
    ('ev mode', 'Then the engine is *backup*', 'When the battery runs low, the engine takes over, so long trips are no problem.', 'think', 'think', {'type': 'hybrid', 'mode': 'ev', 'showPlug': True}),
    ('electric', 'Electric: battery *only*', 'A fully electric car has no engine at all. A big battery, a motor, and a charging port.', 'cheer', 'wow', {'type': 'ev'}),
    ('which', 'Which one *suits* you?', 'Can charge at home and drive mostly short trips? Electric or plug-in. No charging? A regular hybrid is easy.', 'count', 'smile', {'type': 'checklist', 'items': [['Home charging: EV or plug-in', True], ['No charging: hybrid', True], ['Lots of towing: check range', True]]}),
    ('takeaway', 'Self-charging, plug-in, or *pure electric*', 'Hybrid charges itself. Plug-in charges from the wall too. Electric is all battery.', 'thumbs', 'happy', {'type': 'tags', 'items': ['HYBRID', 'PLUG-IN', 'ELECTRIC']}),
])

ep(20, 'timing-belt', 'The Belt That Can Destroy Your Engine', [
    ('hook', 'One belt can *wreck* your engine', 'There is a belt inside many engines that, if it snaps, can destroy the engine in a second.', 'point', 'wow', {'type': 'timing', 'snap': True}),
    ('job', 'The *timing belt*', 'The timing belt links the crankshaft to the camshafts, keeping the pistons and valves perfectly in step.', 'present', 'smile', {'type': 'timing'}),
    ('half', 'The cams turn at *half* speed', 'The camshaft turns once for every two turns of the crank, because each valve opens once every four strokes.', 'count', 'grin', {'type': 'timing'}),
    ('valves', 'Cams push the *valves*', 'Lobes on the camshaft push the valves open at exactly the right moment.', 'present', 'smug', {'type': 'engine4', 'speed': 1.4}),
    ('snap', 'If it snaps: *crunch*', 'In many engines, called interference engines, a snapped belt lets pistons smash into open valves.', 'facepalm', 'sad', {'type': 'timing', 'snap': True}),
    ('cost', 'A *cheap* job vs a big bill', 'Replacing the belt on schedule is far cheaper than rebuilding a wrecked engine.', 'shrug', 'worried', {'type': 'versus', 'a': {'t': 'REPLACE ON TIME', 'big': 'cheap', 'sub': 'planned service'}, 'b': {'t': 'BELT SNAPS', 'big': 'costly', 'sub': 'engine damage'}, 'win': 'a'}),
    ('when', 'Check your *interval*', 'Many belts are due somewhere around sixty to a hundred thousand miles, or a set number of years. Timing chains usually last much longer.', 'count', 'think', {'type': 'checklist', 'items': [['Find the interval in your manual', True], ['Belt or chain? Ask', True], ['Replace the water pump too', True]]}),
    ('takeaway', 'Do not *skip* the belt', 'If your engine has a timing belt, do not skip it. It is one service that can save the whole engine.', 'thumbs', 'grin', {'type': 'timing'}),
])
