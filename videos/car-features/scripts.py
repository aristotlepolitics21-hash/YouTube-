# Car Features: writes NN-slug/script.json for 10 car feature shorts built on real, freely licensed photos.
# Each line is [id, beat, narration]; a beat picks a photo (index into NN-slug/photos.json), a camera move, a label, and a spec card.
# Specs are for the Indian-market versions where the car is sold in India, and are claimed/manufacturer figures that vary by variant and year.
import json, os, re

def ep(n, slug, model, kind, lines, note='Specs vary by variant and year. Check with your dealer.'):
    photos = json.load(open(f'{n:02d}-{slug}/photos.json'))
    rows = []
    for i, (b, t) in enumerate(lines):
        b = dict(b); b['photo'] = b.get('photo', i) % len(photos); rows.append([f'f{n:02d}_{i + 1}', b, t])
    out = re.sub(r'[^a-z0-9]+', '-', (model + ' ' + kind).lower()).strip('-')
    d = dict(series='Car Features', episode=n, model=model, kind=kind, title=f'{model}: {kind}', out=out, note=note, photos=photos, voice='kokoro:am_michael', sections=[dict(name=model, lines=rows)])
    json.dump(d, open(f'{n:02d}-{slug}/script.json', 'w'), indent=1)

ep(1, 'vw-virtus', 'Volkswagen Virtus', 'the safe sedan', [
    (dict(label='sedan', tags=['MID-SIZE SEDAN', 'MADE IN INDIA', 'MQB A0 IN']), 'This is the Volkswagen Virtus. A mid size sedan, built in India on Volkswagen\'s M Q B A zero I N platform.'),
    (dict(label='engines', specs=[['115 PS', '1.0 TSI turbo'], ['150 PS', '1.5 TSI turbo']]), 'It comes with two turbo petrol engines. A one litre with a hundred and fifteen P S, and a one point five with a hundred and fifty.'),
    (dict(label='1.5 TSI', specs=[['250 Nm', 'torque'], ['7-speed', 'DSG automatic']]), 'The bigger engine makes two hundred and fifty newton metres, and pairs with a quick seven speed dual clutch gearbox.'),
    (dict(label='clever bit', spec=['2 of 4', 'cylinders shut off when cruising']), 'A clever trick. When you are cruising gently, the one point five can switch off two of its four cylinders to save fuel.'),
    (dict(label='boot', spec=['521 L', 'boot space']), 'The boot is huge for its class, at five hundred and twenty one litres.'),
    (dict(label='safety', spec=['5 stars', 'Global NCAP, adults and children']), 'And the big one. Five stars in Global N CAP crash tests, for both adults and children.'),
    (dict(label='inside', tags=['10" TOUCHSCREEN', 'DIGITAL COCKPIT', 'VENTILATED SEATS', 'SUNROOF']), 'Top versions get a ten inch touchscreen, digital dials, ventilated front seats and a sunroof.'),
    (dict(label='verdict', tags=['SOLID BUILD', 'PUNCHY TURBO', 'TOP SAFETY']), 'Solid build, punchy turbo engines, and top safety scores. A sedan for people who still love sedans.'),
])

ep(2, 'kia-seltos', 'Kia Seltos', 'the feature king', [
    (dict(label='mid-size SUV', tags=['MID-SIZE SUV', 'BEST-SELLER', 'MADE IN INDIA']), 'The Kia Seltos is one of India\'s most popular mid size SUVs, and the car that launched Kia in India in 2019.'),
    (dict(label='engines', specs=[['115 PS', '1.5 petrol'], ['160 PS', '1.5 turbo'], ['116 PS', '1.5 diesel']]), 'Three engines. A one point five petrol, a one point five turbo petrol with a hundred and sixty P S, and a one point five diesel.'),
    (dict(label='turbo', specs=[['253 Nm', 'turbo petrol torque'], ['DCT', 'dual-clutch auto']]), 'The turbo makes two hundred and fifty three newton metres, and pairs with a dual clutch automatic.'),
    (dict(label='gearboxes', tags=['MANUAL', 'CVT', 'DUAL-CLUTCH', 'TORQUE CONVERTER']), 'Depending on the engine, you get manual, C V T, dual clutch or torque converter automatics.'),
    (dict(label='screens', spec=['2 × 10.25"', 'twin screens, one panel']), 'Inside, two ten point two five inch screens sit in one curved panel.'),
    (dict(label='ADAS', spec=['Level 2', 'driver assistance']), 'Level two driver assistance. Adaptive cruise, lane keeping, and automatic emergency braking.'),
    (dict(label='features', tags=['PANORAMIC SUNROOF', '360° CAMERA', 'VENTILATED SEATS', '6 AIRBAGS']), 'Plus a panoramic sunroof, a three sixty camera, ventilated seats, and six airbags as standard.'),
    (dict(label='verdict', tags=['LOADED', 'THREE ENGINES', 'EASY TO LIVE WITH']), 'If you want the most features for your money in this class, the Seltos is hard to beat.'),
])

ep(3, 'kia-sorento', 'Kia Sorento', 'the global 7-seater', [
    (dict(label='7-seat SUV', tags=['LARGE SUV', '7 SEATS', 'GLOBAL MODEL']), 'The Kia Sorento is Kia\'s big seven seat SUV, sold in markets like the US, Europe and Australia.'),
    (dict(label='4th gen', spec=['2020', 'fourth generation launched']), 'The fourth generation arrived in 2020, on an all new platform.'),
    (dict(label='powertrains', specs=[['Petrol', 'non-turbo & turbo'], ['Diesel', '2.2 litre'], ['Hybrid', '1.6 turbo + motor']]), 'Depending on the market, you can get petrol, diesel, a hybrid, or a plug in hybrid.'),
    (dict(label='plug-in', spec=['~50 km', 'electric-only range (approx.)']), 'The plug in hybrid can drive around fifty kilometres on electricity alone, before the engine starts.'),
    (dict(label='inside', specs=[['3 rows', 'seats 7'], ['AWD', 'available']]), 'Three rows of seats, and all wheel drive on many versions.'),
    (dict(label='tech', tags=['12.3" SCREENS', 'BLIND-SPOT CAMERA', 'ADAS']), 'Big screens, and a clever camera that shows your blind spot in the dials when you indicate.'),
    (dict(label='india?', spec=['Not sold', 'in India (yet)']), 'It is not sold in India, where Kia\'s three row SUV is the Carens and the electric E V nine.'),
    (dict(label='verdict', tags=['SPACIOUS', 'HYBRID OPTIONS', 'FAMILY HAULER']), 'A roomy, efficient family hauler, with a hybrid for every need.'),
], note='Specs differ by market. Not sold in India.')

ep(4, 'fortuner', 'Toyota Fortuner', 'the tough one', [
    (dict(label='body on frame', tags=['LADDER FRAME', 'IMV PLATFORM', 'SHARED WITH HILUX']), 'The Toyota Fortuner is built the old school way. A ladder frame chassis, shared with the Hilux pickup truck.'),
    (dict(label='diesel', specs=[['204 PS', '2.8 diesel'], ['500 Nm', 'with automatic']]), 'Its two point eight diesel makes two hundred and four P S, and up to five hundred newton metres with the automatic.'),
    (dict(label='petrol', spec=['166 PS', '2.7 litre petrol']), 'There is also a two point seven petrol, with a hundred and sixty six P S.'),
    (dict(label='4x4', tags=['4WD', 'LOW RANGE', 'REAR DIFF LOCK']), 'Four wheel drive versions get a low range gearbox and a locking rear differential, for serious off roading.'),
    (dict(label='trade-off', specs=[['Tough', 'rough roads'], ['Heavy', 'more body roll']]), 'The ladder frame makes it tough on bad roads, but heavier, with more body roll than a monocoque SUV.'),
    (dict(label='seats', spec=['7 seats', 'third row folds to the sides']), 'Seven seats, with a third row that folds up against the sides.'),
    (dict(label='legender', tags=['LEGENDER', 'SPORTIER LOOK', 'GR SPORT']), 'The Legender and G R Sport versions add sharper styling and extra features.'),
    (dict(label='verdict', tags=['BUILT TOUGH', 'GREAT RESALE', 'GO ANYWHERE']), 'Known for toughness and strong resale value, it is the go anywhere status symbol.'),
])

ep(5, 'tata-safari', 'Tata Safari', 'the legend, reborn', [
    (dict(label='since 1998', spec=['1998', 'first Tata Safari']), 'The Tata Safari name goes back to 1998, when it was one of India\'s first lifestyle SUVs.'),
    (dict(label='old school', tags=['LADDER FRAME', 'BOXY', '4X4']), 'The old Safari was a boxy, body on frame four by four.'),
    (dict(label='reborn', spec=['2021', 'all-new Safari']), 'In 2021 it was reborn as a modern monocoque SUV. It was previewed as the Buzzard concept at the 2019 Geneva motor show.'),
    (dict(label='platform', spec=['OMEGARC', 'derived from Land Rover D8']), 'It rides on Tata\'s Omega Arc platform, derived from a Land Rover architecture.'),
    (dict(label='engine', specs=[['170 PS', '2.0 diesel'], ['350 Nm', 'torque']]), 'The two litre diesel makes a hundred and seventy P S and three hundred and fifty newton metres, with manual or automatic.'),
    (dict(label='safety', spec=['5 stars', 'Global NCAP & Bharat NCAP']), 'The updated Safari scored five stars in both Global N CAP and Bharat N CAP crash tests.'),
    (dict(label='inside', tags=['12.3" SCREEN', 'ADAS', 'PANORAMIC ROOF', 'CAPTAIN SEATS']), 'Inside, a twelve point three inch screen, level two driver assistance, a panoramic sunroof, and optional captain seats.'),
    (dict(label='verdict', tags=['7 SEATS', 'TOP SAFETY', 'ROAD PRESENCE']), 'A legendary name, now with seven seats, top safety, and huge road presence.'),
])

ep(6, 'nexon-ev', 'Tata Nexon EV', 'India\'s EV pioneer', [
    (dict(label='since 2020', spec=['2020', 'launched in India']), 'The Tata Nexon E V launched in 2020, and became one of India\'s best selling electric cars.'),
    (dict(label='batteries', specs=[['30 kWh', 'medium range'], ['45 kWh', 'long range']]), 'Today it comes with different battery sizes, up to forty five kilowatt hours.'),
    (dict(label='range', spec=['489 km', 'claimed range, 45 kWh']), 'The biggest battery has a claimed range of up to four hundred and eighty nine kilometres. Real world is lower.'),
    (dict(label='motor', specs=[['145 PS', 'power'], ['215 Nm', 'instant torque']]), 'The long range motor makes a hundred and forty five P S, and two hundred and fifteen newton metres from zero r p m.'),
    (dict(label='party trick', tags=['V2L', 'POWER YOUR KETTLE', 'V2V CHARGING']), 'Vehicle to load lets you run appliances from the car, and even charge another E V.'),
    (dict(label='safety', spec=['5 stars', 'Bharat NCAP']), 'It scored five stars in the Bharat N CAP crash test.'),
    (dict(label='charging', tags=['HOME WALLBOX', 'DC FAST CHARGE']), 'Charge it overnight at home, or use a D C fast charger on longer trips.'),
    (dict(label='verdict', tags=['PROVEN', 'PRACTICAL', 'SAFE']), 'The car that made electric mainstream in India.'),
])

ep(7, 'byd-atto3', 'BYD Atto 3', 'the Blade battery SUV', [
    (dict(label='BYD', tags=['CHINA', 'BATTERY GIANT', 'EV RIVAL TO TESLA']), 'B Y D started as a battery maker, and is now one of the biggest electric car makers in the world.'),
    (dict(label='blade', spec=['LFP', 'Blade battery cells']), 'The Atto three uses B Y D\'s Blade battery. Long, thin lithium iron phosphate cells, known for being very resistant to catching fire.'),
    (dict(label='battery', specs=[['60.48 kWh', 'battery'], ['521 km', 'claimed range']]), 'The bigger battery is sixty point four eight kilowatt hours, with a claimed range of up to five hundred and twenty one kilometres.'),
    (dict(label='performance', specs=[['204 PS', 'power'], ['7.3 s', '0-100 km/h']]), 'Two hundred and four P S, and zero to one hundred in about seven point three seconds.'),
    (dict(label='safety', spec=['5 stars', 'Euro NCAP, 2022']), 'It earned five stars in Euro N CAP crash tests.'),
    (dict(label='quirky', tags=['ROTATING SCREEN', 'GUITAR-STRING POCKETS', 'GYM-INSPIRED']), 'The interior is wonderfully weird. A screen that rotates, and door pockets strung like a guitar.'),
    (dict(label='platform', spec=['e-Platform 3.0', 'dedicated EV platform']), 'It sits on B Y D\'s dedicated electric platform, with a flat floor.'),
    (dict(label='verdict', tags=['SAFE BATTERY', 'QUICK', 'FUN INSIDE']), 'A safe battery, a quick motor, and an interior with real personality.'),
])

ep(8, 'ioniq5', 'Hyundai Ioniq 5', 'the 800-volt EV', [
    (dict(label='award', spec=['2022', 'World Car of the Year']), 'The Hyundai Ioniq five won World Car of the Year in 2022.'),
    (dict(label='design', tags=['PIXEL LIGHTS', 'RETRO 1974 PONY', 'FLAT FLOOR']), 'Its pixel style lights and sharp lines are inspired by Hyundai\'s 1974 Pony concept.'),
    (dict(label='800 V', spec=['~18 min', '10-80% on a 350 kW charger']), 'Its eight hundred volt system can charge from ten to eighty percent in about eighteen minutes, on an ultra fast charger.'),
    (dict(label='India', specs=[['72.6 kWh', 'battery'], ['631 km', 'claimed range']]), 'In India it has a seventy two point six kilowatt hour battery, and a claimed range of six hundred and thirty one kilometres.'),
    (dict(label='motor', specs=[['217 PS', 'rear motor'], ['350 Nm', 'torque']]), 'A rear motor with two hundred and seventeen P S, and three hundred and fifty newton metres.'),
    (dict(label='space', spec=['3,000 mm', 'wheelbase']), 'A three metre wheelbase gives limousine like legroom, and the centre console slides back and forth.'),
    (dict(label='V2L', tags=['V2L', 'POWER A LAPTOP', 'OR A COFFEE MACHINE']), 'Vehicle to load lets you power a laptop, or a coffee machine, from the car.'),
    (dict(label='verdict', tags=['FAST CHARGING', 'HUGE SPACE', 'ICONIC DESIGN']), 'Fast charging, a huge cabin, and a design that still turns heads.'),
])

ep(9, 'mg-zs-ev', 'MG ZS EV', 'the early mover', [
    (dict(label='since 2020', spec=['2020', 'launched in India']), 'The M G Z S E V was one of the first electric SUVs sold in India, launched in 2020.'),
    (dict(label='battery', specs=[['50.3 kWh', 'battery'], ['461 km', 'claimed range']]), 'It has a fifty point three kilowatt hour battery, and a claimed range of four hundred and sixty one kilometres.'),
    (dict(label='motor', specs=[['176 PS', 'power'], ['280 Nm', 'torque']]), 'The motor makes a hundred and seventy six P S, and two hundred and eighty newton metres.'),
    (dict(label='charging', tags=['HOME WALLBOX', 'OVERNIGHT', 'DC FAST CHARGE']), 'Charge it overnight on a home wallbox, or top up quickly at a D C fast charger.'),
    (dict(label='ADAS', spec=['Level 2', 'driver assistance']), 'Newer versions add level two driver assistance.'),
    (dict(label='inside', tags=['PANORAMIC SUNROOF', 'DIGITAL CLUSTER', 'CONNECTED CAR']), 'Inside, a panoramic sunroof, a digital cluster, and connected car tech.'),
    (dict(label='safety', spec=['5 stars', 'Euro NCAP, 2019']), 'It scored five stars in Euro N CAP crash tests.'),
    (dict(label='verdict', tags=['PROVEN', 'COMFORTABLE', 'EASY EV']), 'A comfortable, proven electric SUV that helped start India\'s E V story.'),
])

ep(10, 'xuv400', 'Mahindra XUV400', 'the quick electric SUV', [
    (dict(label='first EV SUV', spec=['2023', "Mahindra's first electric SUV"]), 'The Mahindra X U V four hundred, launched in 2023, was Mahindra\'s first electric SUV.'),
    (dict(label='based on', tags=['XUV300 BASED', 'LONGER BODY', 'BIGGER BOOT']), 'It is based on the X U V three hundred, but longer, with a bigger boot.'),
    (dict(label='batteries', specs=[['34.5 kWh', 'standard'], ['39.4 kWh', 'long range']]), 'Two battery options. Thirty four point five, and thirty nine point four kilowatt hours.'),
    (dict(label='range', spec=['456 km', 'claimed range, 39.4 kWh']), 'The bigger battery has a claimed range of up to four hundred and fifty six kilometres.'),
    (dict(label='quick', specs=[['150 PS', 'power'], ['310 Nm', 'torque']]), 'With a hundred and fifty P S and three hundred and ten newton metres, it is properly quick.'),
    (dict(label='boot', spec=['378 L', 'boot space']), 'The boot holds three hundred and seventy eight litres, big for this size.'),
    (dict(label='modes', tags=['FUN', 'FAST', 'FEARLESS', 'ONE-PEDAL']), 'Drive modes called fun, fast and fearless, plus one pedal driving with strong regeneration.'),
    (dict(label='verdict', tags=['QUICK', 'ROOMY BOOT', 'VALUE EV']), 'A quick, practical electric SUV, with plenty of punch for the money.'),
])
