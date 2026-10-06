"""Writes this project's manual-mode inputs for DocForge.

No Claude API key was available in the session that built this project, so the
research, script and scene plan were written by Claude Code itself (from live web
searches, sources listed in research.json) and saved in DocForge's documented
formats. With llm.provider: claude, DocForge would generate these files instead.

The scene list below is the single source: script.json is assembled from the
scenes' narration, so the two always match word for word.

Run:  python build_inputs.py
"""

import json
from pathlib import Path

HERE = Path(__file__).resolve().parent

# ---------------------------------------------------------------- research
S = {
    "wb_gdp": "https://fred.stlouisfed.org/data/PCAGDPSGA646NWDB",
    "land": "https://data.gov.sg/dataset/total-land-area-of-singapore",
    "land_wiki": "https://en.wikipedia.org/wiki/Geography_of_Singapore",
    "pop": "https://www.population.gov.sg/files/media-centre/publications/Population_in_Brief_2024.pdf",
    "raffles": "https://eresources.nlb.gov.sg/infopedia/articles/SIP_131_2005-01-03.html",
    "raffles2": "https://eresources.nlb.gov.sg/infopedia/articles/SIP_715_2004-12-15.html",
    "fall": "https://www.sg101.gov.sg/learn/resources/onthisday-fall-of-singapore",
    "fall_wiki": "https://en.wikipedia.org/wiki/Fall_of_Singapore",
    "occupation": "https://en.wikipedia.org/wiki/Japanese_occupation_of_Singapore",
    "selfgov": "https://en.wikipedia.org/wiki/1959_Singaporean_general_election",
    "merger": "https://en.wikipedia.org/wiki/History_of_the_State_of_Singapore_(Malaysia)",
    "anguish": "https://biblioasia.nlb.gov.sg/all-sections/vol-22-issue-2-jul-sep-2026-the-days-leading-to-separation-in-lee-kuan-yews-own-words-/",
    "water": "https://eresources.nlb.gov.sg/infopedia/articles/SIP_1533_2009-06-23.html",
    "water2": "https://lkyspp.nus.edu.sg/gia/article/water-policy-in-singapore",
    "withdrawal": "https://www.cia.gov/readingroom/node/1922414",
    "countrystudy": "https://countrystudies.us/singapore/28.htm",
    "edb": "https://www.sg101.gov.sg/economy/surviving-our-independence/1959-1965/",
    "jurong": "https://www.roots.gov.sg/stories-landing/stories/jurong-industrial-estate/story",
    "port": "https://www.mpa.gov.sg/media-centre/details/strong-growth-momentum-for-maritime-singapore",
    "tuas": "https://porteconomicsmanagement.org/pemp/contents/part3/changing-geography-of-seaports/singapore-tuas-port-expansion-project",
    "changi": "https://en.wikipedia.org/wiki/Changi_Airport",
    "chips": "https://www.a-star.edu.sg/News/astarNews/news/features/singapore-semiconductor-rise-ai-chip-wars",
    "mfg": "https://www.statista.com/topics/9319/manufacturing-sector-in-singapore",
    "cpib": "https://www.cpib.gov.sg/who-we-are/our-heritage/",
    "cpi2024": "https://www.cpib.gov.sg/press-room/2024-ti-cpi-singapore-moves-up-2-spots-to-3rd-least-corrupt-country-and-top-in-asia-pacific/",
    "hdb": "https://en.wikipedia.org/wiki/Housing_and_Development_Board",
    "hdb_share": "https://www.singstat.gov.sg/modules/infographics/-/media/Files/visualising_data/infographics/Population/singapore-population10052024.pdf",
    "temasek": "https://en.wikipedia.org/wiki/Temasek_Holdings",
    "gic": "https://en.wikipedia.org/wiki/GIC_(sovereign_wealth_fund)",
    "trade": "https://wits.worldbank.org/CountryProfile/en/Country/SGP/Year/LTST",
    "fin": "https://www.finews.asia/finance/37717-singapore-surpasses-hong-kong-in-financial-hub-index",
    "tfr": "https://asianews.network/?p=136624",
    "sea": "https://www.malaymail.com/amp/news/world/2019/08/19/singapore-to-bolster-coastal-defences-against-rising-sea-levels-says-pm/1781949",
    "treaty1824": "https://biblioasia.nlb.gov.sg/vol-15/issue-1/apr-jun-2019/making-history/",
    "sookching": "https://biblioasia.nlb.gov.sg/vol-12/issue-4/jan-mar-2017/the-sook-ching/",
    "bukom": "https://roots.gov.sg/Collection-Landing/listing/1579795",
    "sia": "https://biblioasia.nlb.gov.sg/vol-18/issue-2/jul-sep-2022/history-singapore-airlines/",
    "ns": "https://en.wikipedia.org/wiki/National_service_in_Singapore",
    "ira": "https://eresources.nlb.gov.sg/infopedia/articles/SIP_2014-07-07_133856.html",
    "concept": "https://biblioasia.nlb.gov.sg/vol-10/issue-3/oct-dec-2014/singapore-concept-plan/",
    "hawker": "https://www.nea.gov.sg/media/news/news/index/hawker-culture-is-singapore-s-first-inscription-on-unesco-s-representative-list-of-the-intangible-cultural-heritage-of-humanity",
    "t5": "https://www.timeout.com/singapore/news/singapore-changi-airports-new-terminal-5-is-slated-to-open-in-the-mid-2030s-works-have-already-begun-051525",
    "tekong": "https://www.tabla.com.sg/news/singapore/plot-twice-size-toa-payoh-reclaimed-pulau-tekong-spores-first-polder-project",
}


def fact(claim, *keys, status="confirmed", note=""):
    return {"claim": claim, "status": status, "sources": [S[k] for k in keys], "note": note}


research = {
    "topic": "Singapore: How a Tiny Country Became Rich Without Natural Resources",
    "generated_by": "manual (written by Claude Code from live web searches; no API key in session)",
    "sections": [
        {"topic": "Historical background", "facts": [
            fact("Stamford Raffles arrived on 29 January 1819 and signed a treaty with Sultan Hussein and the Temenggong on 6 February 1819.", "raffles", "raffles2"),
            fact("About a thousand people lived on the island before Raffles arrived (estimates vary).", "raffles2", status="uncertain", note="estimates range from a few hundred to about 1,000"),
            fact("Singapore became part of the Straits Settlements in 1826 and their capital in 1836.", "raffles2"),
        ]},
        {"topic": "Geography", "facts": [
            fact("Land area was about 581.5 km² in 1960 and about 744 km² by the 2020s, mostly through reclamation.", "land", "land_wiki"),
            fact("Singapore lies at the southern tip of the Malay Peninsula on the sea route between the Indian Ocean and the South China Sea.", "land_wiki"),
        ]},
        {"topic": "Political development", "facts": [
            fact("Full internal self-government came with the May 1959 election; the PAP won 43 of 51 seats and Lee Kuan Yew became prime minister.", "selfgov"),
            fact("Singapore joined Malaysia on 16 September 1963 and separated on 9 August 1965.", "merger"),
            fact("Lee Kuan Yew called separation 'a moment of anguish' at a televised press conference on 9 August 1965.", "anguish"),
        ]},
        {"topic": "Major historical events", "facts": [
            fact("Singapore fell to Japan on 15 February 1942; about 80,000 Allied troops became prisoners.", "fall", "fall_wiki"),
            fact("Renamed Syonan-to; British rule returned in September 1945.", "occupation"),
            fact("Britain announced in January 1968 it would withdraw forces east of Suez by 1971; most troops left by October 1971.", "withdrawal", "countrystudy"),
            fact("The Bukit Ho Swee fire of 25 May 1961 left about 16,000 people homeless.", "hdb"),
            fact("There were deadly communal riots in Singapore in 1964.", "merger"),
        ]},
        {"topic": "Population", "facts": [
            fact("Total population was 6.04 million in June 2024; about one in five citizens was 65 or older, rising to one in four by 2030.", "pop"),
            fact("Resident total fertility rate fell to 0.97 in 2023, below 1 for the first time.", "tfr"),
            fact("Around 1968 the population was about 2 million.", "countrystudy"),
        ]},
        {"topic": "Natural resources", "facts": [
            fact("Singapore has no significant oil, gas or mineral resources and little farmland.", "land_wiki"),
            fact("Water agreements with Johor were signed in 1961 and 1962; the 1961 agreement expired in 2011, the 1962 one runs to 2061.", "water", "water2"),
            fact("NEWater and desalination meet a large and growing share of demand.", "water2", status="uncertain", note="published shares vary by year (around 40% in older reports); not quoted as a number"),
        ]},
        {"topic": "Economy", "facts": [
            fact("GDP per capita was about US$517 in 1965 and about US$94,900 in 2024 (current US$, World Bank).", "wb_gdp"),
            fact("Manufacturing is about a fifth of the economy.", "mfg"),
            fact("About one in ten chips worldwide is made in Singapore (A*STAR).", "chips"),
            fact("In 1959 roughly 14% unemployment was estimated.", "edb", status="uncertain", note="figure quoted inconsistently; not used in narration"),
        ]},
        {"topic": "Trade", "facts": [
            fact("Trade was about 326% of GDP in 2023.", "trade"),
            fact("The port handled a record 41.12 million TEU in 2024; around 90% is transshipment.", "port"),
        ]},
        {"topic": "Major industries", "facts": [
            fact("Electronics, semiconductors, chemicals, precision engineering and finance are major industries.", "chips", "mfg"),
            fact("Singapore ranks in the global top five financial centres on the Global Financial Centres Index.", "fin"),
        ]},
        {"topic": "Infrastructure", "facts": [
            fact("Changi Airport began operating on 1 July 1981.", "changi"),
            fact("Tuas Port is designed to handle 65 million TEU when completed in the 2040s.", "tuas"),
            fact("Jurong Industrial Estate's first factory opened in August 1963.", "jurong"),
        ]},
        {"topic": "Government policies", "facts": [
            fact("The Economic Development Board was set up on 1 August 1961, after a UN team led by Albert Winsemius advised on industrialisation.", "edb", "jurong"),
            fact("The HDB was created in 1960 and built about 21,000 flats in under three years.", "hdb"),
            fact("From 1968, CPF savings could be used to buy HDB flats.", "hdb"),
            fact("About 77% of residents live in HDB flats; home ownership is about 90% (2023).", "hdb_share"),
            fact("The CPIB was set up in 1952.", "cpib"),
            fact("Temasek was incorporated in 1974; GIC was set up in 1981.", "temasek", "gic"),
        ]},
        {"topic": "International relations", "facts": [
            fact("The British bases generated about 20% of GDP, employed 54,000 people directly and occupied 12% of the land.", "countrystudy", "withdrawal"),
        ]},
        {"topic": "Problems and challenges", "facts": [
            fact("Low fertility and rapid ageing.", "tfr", "pop"),
            fact("Sea levels could rise by up to 1 m by 2100; coastal protection could cost S$100 billion or more (PM Lee, 2019).", "sea"),
        ]},
        {"topic": "Important statistics", "facts": [
            fact("Singapore ranked 3rd of 180 in the 2024 Corruption Perceptions Index (score 84).", "cpi2024"),
        ]},
        {"topic": "Future prospects", "facts": [
            fact("Tuas mega-port, continued reclamation and polders, water self-sufficiency before 2061.", "tuas", "sea", "water"),
        ]},
        {"topic": "Additional sourced details", "facts": [
            fact("The 1824 Anglo-Dutch Treaty and the 1824 Crawfurd treaty secured British sovereignty over Singapore.", "treaty1824"),
            fact("The Sook Ching killings in February-March 1942 killed tens of thousands of Chinese civilians; estimates range widely (Japan claimed under 6,000; common estimates 25,000-50,000).", "sookching"),
            fact("Shell's Pulau Bukom refinery, Singapore's first, opened on 26 July 1961.", "bukom"),
            fact("Singapore Airlines was formed in 1972.", "sia"),
            fact("National Service began in 1967.", "ns"),
            fact("The Employment Act and Industrial Relations (Amendment) Act were passed in 1968.", "ira"),
            fact("The first Concept Plan for long-term land use was unveiled in 1971.", "concept"),
            fact("Hawker culture was inscribed on UNESCO's intangible heritage list in December 2020.", "hawker"),
            fact("Changi Terminal 5 is planned to open in the mid-2030s.", "t5"),
            fact("Singapore's first polder, about 800 ha, is at Pulau Tekong.", "tekong"),
            fact("Changi Airport has won Skytrax's World's Best Airport award many times.", "changi"),
        ]},
    ],
    "statistics": [
        {"name": "GDP per capita", "value": "US$517", "year": "1965", "source": S["wb_gdp"]},
        {"name": "GDP per capita", "value": "US$94,897", "year": "2024", "source": S["wb_gdp"]},
        {"name": "Land area", "value": "581.5 km²", "year": "1960", "source": S["land"]},
        {"name": "Land area", "value": "744.3 km²", "year": "2024", "source": S["land"]},
        {"name": "Population", "value": "6.04 million", "year": "2024", "source": S["pop"]},
        {"name": "Container throughput", "value": "41.12 million TEU", "year": "2024", "source": S["port"]},
        {"name": "Resident fertility rate", "value": "0.97", "year": "2023", "source": S["tfr"]},
        {"name": "Trade / GDP", "value": "326%", "year": "2023", "source": S["trade"]},
    ],
    "sources": [{"url": u} for u in S.values()],
}

# ------------------------------------------------------------------ scenes
SECTIONS = [
    ("hook", "The hook"), ("why-it-matters", "Why Singapore matters"), ("origins", "Origins"),
    ("history", "War, merger and separation"), ("geography", "An island with nothing"),
    ("turning-point", "The turning point"), ("transformation", "The economic transformation"),
    ("policies", "The key policies"), ("people", "People and society"), ("global-role", "A global role"),
    ("problems", "The problems"), ("future", "The future"), ("conclusion", "Conclusion"),
]


def photo(q, *alts, cam="push_in", period="present", loc="Singapore", desc="", mood="", shots=1):
    return {"kind": "photo", "search_query": q, "alt_queries": list(alts), "camera": cam, "period": period,
            "location": loc, "description": desc or q, "mood": mood, "shots": shots}


def g(kind, desc="", **data):
    return {"kind": kind, "description": desc or kind, "data": data, "camera": "static"}


SG = [1.29, 103.85]
MAP_REGION = [95, -8, 115, 9]

SCENES = {
"hook": [
    ("In 1965, a small island was pushed out of a country it had joined less than two years earlier.",
     g("map", "Singapore alone at the tip of the peninsula", title="1965", focus=["Singapore"], context=["Malaysia"], bbox=[103.2, 0.9, 104.4, 1.7], start_zoom=6), "tense"),
    ("It had no oil, no farmland, no hinterland, and not even enough fresh water for its own people.",
     g("text", text="No oil. No farmland. No hinterland. Not enough water."), "tense"),
    ("Its own prime minister broke down on television as he announced the news.",
     g("quote", text="For me, it is a moment of anguish.", attribution="Lee Kuan Yew, 9 August 1965"), "tense"),
    ("Today, its people are among the richest in the world.",
     photo("Singapore skyline Marina Bay", "Singapore skyline", cam="drone_forward", mood="awe"), "hopeful"),
    ("Its port is one of the busiest anywhere, and its airport connects the planet.",
     photo("Singapore port container cranes ships", "Singapore container terminal", cam="pan_right"), "hopeful"),
    ("How did a tiny country with almost nothing become this?",
     photo("Singapore skyline night", "Marina Bay night", cam="pull_out"), "hopeful"),
    ("This is the story of Singapore.",
     g("title", text="SINGAPORE", subtitle="How a tiny country became rich without natural resources"), "epic"),
],
"why-it-matters": [
    ("Singapore's entire land area is less than seven hundred and fifty square kilometres.",
     g("stat", value="744 km²", label="Singapore's land area, 2024", source="Singapore Land Authority via data.gov.sg"), "reflective"),
    ("About six million people live on it.",
     g("stat", value="6.04 million", label="Singapore's total population, June 2024", source="Population in Brief 2024"), "reflective"),
    ("In 1965, Singapore's output per person was about five hundred dollars a year.",
     g("stat", value="$517", label="GDP per person, 1965 (current US$)", source="World Bank"), "reflective"),
    ("By 2024, it was more than ninety thousand dollars.",
     g("comparison", title="GDP per person (current US$)", left={"label": "1965", "value": "$517"}, right={"label": "2024", "value": "$94,897"}, source="World Bank via FRED"), "hopeful"),
    ("That is about a hundred and eighty times as much, before adjusting for inflation.",
     g("stat", value="~180×", label="growth in GDP per person, 1965 to 2024 (current US$, not inflation-adjusted)", source="World Bank"), "hopeful"),
    ("Few countries have ever made that journey from poverty to wealth so quickly.",
     photo("Singapore Central Business District skyscrapers", "Raffles Place Singapore", cam="tilt_up"), "hopeful"),
    ("And Singapore did it without the things that usually make countries rich: oil, minerals, land.",
     g("text", text="No oil. No minerals. No land to spare."), "reflective"),
    ("So what did it have instead?",
     photo("Singapore Strait ships anchored", "ships Singapore Strait", cam="pan_left", loc="Singapore Strait"), "reflective"),
],
"origins": [
    ("Start with location.",
     g("map", "Southeast Asia, zooming to Singapore", title="Location", focus=["Singapore"], context=["Malaysia", "Indonesia"], bbox=MAP_REGION, start_zoom=3), "reflective"),
    ("Singapore sits at the southern tip of the Malay Peninsula, where the Strait of Malacca opens toward the South China Sea.",
     g("map", "Strait of Malacca and South China Sea", title="Between two oceans", focus=["Singapore"], context=["Malaysia", "Indonesia"], bbox=[98, -2, 110, 7],
       points=[{"name": "Strait of Malacca", "lat": 3.2, "lon": 100.4}, {"name": "South China Sea", "lat": 4.6, "lon": 107.2}]), "reflective"),
    ("For centuries, ships sailing between India, China and the Middle East have passed through these waters.",
     g("map", "Trade routes through the strait", title="An ancient sea route", focus=["Singapore"], context=["Malaysia", "Indonesia", "India", "China", "Thailand", "Vietnam"], bbox=[75, -10, 125, 28], start_zoom=1.5,
       routes=[{"from": [8.0, 77.5], "to": SG, "label": "from India"}, {"from": SG, "to": [22.3, 114.2], "label": "to China"}]), "reflective"),
    ("In January 1819, an official of the British East India Company, Stamford Raffles, arrived on the island.",
     photo("Raffles statue Singapore", "Sir Stamford Raffles statue", cam="tilt_up", desc="The statue of Stamford Raffles at his landing site, today"), "reflective"),
    ("Britain wanted a port on this route that its Dutch rivals, the main European power in the region, could not control.",
     g("map", "British and Dutch spheres", title="A rival to the Dutch", focus=["Singapore"], context=["Malaysia", "Indonesia"], bbox=[95, -9, 120, 8], labels=["Singapore", "Indonesia"]), "reflective"),
    ("At the time, perhaps a thousand people lived there.",
     g("stat", value="~1,000", label="estimated population of the island in 1819 (estimates vary)", source="National Library Board, Singapore"), "reflective"),
    ("On the sixth of February, he signed a treaty with the local rulers that allowed the British to set up a trading post.",
     g("timeline", title="A trading post", events=[{"year": "Jan 1819", "label": "Raffles arrives"}, {"year": "6 Feb 1819", "label": "Treaty with Sultan Hussein and the Temenggong"}], highlight=1), "reflective"),
    ("Singapore became a free port, open to traders from everywhere.",
     photo("Singapore harbor", "Singapore river boats", period="1900", cam="pan_right", desc="Singapore harbour, early 1900s"), "reflective"),
    ("Treaties signed in 1824, with the Dutch and with the local rulers, made the island British.",
     g("timeline", title="Becoming British", events=[{"year": "1819", "label": "Trading post"}, {"year": "1824", "label": "Anglo-Dutch Treaty"}, {"year": "1824", "label": "Island ceded to the British"}], highlight=2), "reflective"),
    ("Merchants and workers came from China, India, the Malay world and far beyond, and the town grew quickly.",
     photo("Singapore street", "Singapore Chinatown street", period="1900", cam="push_in", desc="A busy Singapore street around 1900"), "reflective"),
    ("Rubber and tin from the Malay Peninsula flowed out through its harbour, and goods from Europe and India flowed in.",
     photo("rubber plantation Malaya", "rubber tapping", "tin mine Malaya", period="1920", loc="Malaya", cam="pan_right", desc="Rubber and tin from the peninsula"), "reflective"),
    ("In 1826, it became part of the Straits Settlements, and ten years later their capital.",
     g("timeline", title="Colonial Singapore", events=[{"year": "1819", "label": "Trading post"}, {"year": "1826", "label": "Straits Settlements"}, {"year": "1836", "label": "Capital of the Settlements"}], highlight=2), "reflective"),
    ("For more than a century, Singapore was a busy colonial port, built on one thing: trade.",
     photo("Singapore wharf", "Singapore quay", "Singapore harbour", period="1910", cam="pan_left", desc="Colonial wharves"), "reflective"),
],
"history": [
    ("That world collapsed in February 1942.",
     g("title", text="February 1942"), "tense"),
    ("Japanese forces crossed the narrow Johor Strait and attacked the island from the north-west.",
     g("map", "The Johor Strait crossing", title="The invasion", focus=["Singapore"], context=["Malaysia"], bbox=[103.45, 1.15, 104.15, 1.6],
       routes=[{"from": [1.56, 103.62], "to": [1.42, 103.68], "label": "8 February 1942"}]), "tense"),
    ("On the fifteenth of February, the British commander surrendered.",
     g("stat", value="15 Feb 1942", label="Singapore surrenders to Japan", source="National Archives of Singapore"), "tense"),
    ("About eighty thousand British, Indian, Australian and local troops became prisoners of war.",
     g("stat", value="80,000", label="Allied troops taken prisoner at Singapore", source="National Archives of Singapore"), "tense"),
    ("Singapore was renamed Syonan-to, and endured three and a half years of occupation.",
     g("text", text="Renamed Syonan-to. Three and a half years of occupation."), "tense"),
    ("In the first weeks, thousands of Chinese civilians were rounded up and killed in a purge known as Sook Ching.",
     g("text", text="Sook Ching, 1942: tens of thousands of civilians killed. Estimates still vary widely."), "tense"),
    ("Food ran short, and many families survived on tapioca and sweet potatoes.",
     g("text", text="Tapioca. Sweet potatoes. Hunger."), "tense"),
    ("When the British returned in September 1945, the old idea that they could always protect the colony was gone.",
     g("timeline", title="Occupation", events=[{"year": "Feb 1942", "label": "Surrender"}, {"year": "1942-45", "label": "Syonan-to"}, {"year": "Sep 1945", "label": "British return"}], highlight=2), "reflective"),
    ("The years that followed brought strikes, riots and a long struggle over who would govern the colony.",
     g("text", text="Strikes. Riots. A fight over who would rule."), "tense"),
    ("In 1959, Singapore won self-government, and Lee Kuan Yew of the People's Action Party became its first prime minister.",
     photo("Lee Kuan Yew", "Lee Kuan Yew portrait", period="", loc="", cam="push_in", desc="Lee Kuan Yew"), "reflective"),
    ("His government believed the island was too small to survive on its own.",
     g("text", text="Too small to survive alone?"), "tense"),
    ("So in September 1963, Singapore joined the new Federation of Malaysia.",
     g("map", "Malaysia in 1963 including Singapore", title="Malaysia, 1963", focus=["Malaysia", "Singapore"], context=["Indonesia", "Brunei"], bbox=[99, -1, 120, 8], labels=["Malaysia"]), "hopeful"),
    ("It did not last. There were deep political disagreements, and deadly racial riots in 1964.",
     g("text", text="Political disagreements. Racial riots in 1964."), "tense"),
    ("On the ninth of August 1965, Singapore separated from Malaysia and became an independent country.",
     g("stat", value="9 Aug 1965", label="Singapore becomes independent", source="National Library Board, Singapore"), "tense"),
    ("Lee Kuan Yew called it a moment of anguish. He had believed in merger all his adult life.",
     g("quote", text="For me, it is a moment of anguish.", attribution="Lee Kuan Yew, press conference, 9 August 1965"), "tense"),
    ("Singapore was now a nation. Whether it could survive was a different question.",
     g("text", text="A nation. But could it survive?"), "tense"),
],
"geography": [
    ("Look at what the new country had to work with.",
     g("map", "Singapore island close up", title="The new nation", focus=["Singapore"], context=["Malaysia", "Indonesia"], bbox=[103.55, 1.15, 104.1, 1.48], start_zoom=2), "reflective"),
    ("The main island is only about fifty kilometres from east to west.",
     g("map", "The island's width", title="About 50 km across", focus=["Singapore"], context=["Malaysia"], bbox=[103.55, 1.15, 104.1, 1.48],
       points=[{"name": "West", "lat": 1.32, "lon": 103.64}, {"name": "East", "lat": 1.36, "lon": 104.03}]), "reflective"),
    ("Much of it was swamp, forest or crowded town, with very little room to spare.",
     photo("Singapore mangrove swamp", "Sungei Buloh mangroves", cam="pan_right", desc="Mangrove swamp, as much of the coast once was"), "reflective"),
    ("No oil. No gas. No minerals worth mining. No room for large farms.",
     g("text", text="No oil. No gas. No minerals. No farmland."), "tense"),
    ("Worst of all, not enough water for a growing city.",
     photo("Singapore reservoir", "MacRitchie Reservoir", cam="pan_right", desc="A reservoir in Singapore"), "tense"),
    ("Since 1961 and 1962, Singapore had depended on agreements to buy water from the Malaysian state of Johor, across the strait.",
     g("map", "Water from Johor", title="Water from next door", focus=["Singapore"], context=["Malaysia"], bbox=[103.3, 1.15, 104.3, 1.95],
       routes=[{"from": [1.78, 103.75], "to": [1.42, 103.78], "label": "water from Johor"}]), "tense"),
    ("Its neighbours, Malaysia and Indonesia, were far larger, and relations in the region were tense.",
     g("map", "Singapore between its large neighbours", title="Big neighbours", focus=["Malaysia", "Indonesia"], context=["Singapore"], bbox=[94, -11, 141, 8], labels=["Malaysia", "Indonesia"]), "tense"),
    ("Its population, about two million people, was crowded, mostly poor, and growing.",
     photo("Singapore crowded street", "Singapore street people", "Chinatown Singapore", period="1930", cam="pan_left", desc="Crowded streets of old Singapore"), "reflective"),
    ("Many lived in crowded shophouses and wooden villages, and jobs were scarce.",
     photo("Singapore shophouses", "Singapore houses", period="1930", cam="push_in", desc="Shophouses"), "reflective"),
],
"turning-point": [
    ("Then, in January 1968, came a second shock.",
     g("title", text="January 1968"), "tense"),
    ("Britain announced it would pull its military forces out of the region by 1971.",
     g("timeline", title="Britain leaves", events=[{"year": "Jan 1968", "label": "Withdrawal announced"}, {"year": "Oct 1971", "label": "Most forces gone"}], highlight=0), "tense"),
    ("Its bases in Singapore generated around a fifth of the economy.",
     g("chart", title="Share of Singapore's economy from British bases, 1960s", type="bar", unit="%", source="US Library of Congress country study; CIA (1968)", bars=[{"label": "British bases", "value": 20}, {"label": "Everything else", "value": 80}], highlight=0), "tense"),
    ("They employed tens of thousands of local workers and occupied about twelve percent of the island's land.",
     g("comparison", title="The British bases", left={"label": "Direct jobs", "value": "54,000"}, right={"label": "Share of land", "value": "12%"}, source="US Library of Congress country study"), "tense"),
    ("Singapore had already lost its hoped-for common market when it left Malaysia.",
     g("text", text="First the common market. Now the bases."), "tense"),
    ("Now it was about to lose its protector and one of its biggest employers.",
     g("text", text="No protector. Fewer jobs."), "tense"),
    ("The government moved fast. In 1967 it began national service, to build an army of its own.",
     g("timeline", title="Moving fast", events=[{"year": "1967", "label": "National service begins"}, {"year": "1968", "label": "New labour laws"}, {"year": "1971", "label": "First Concept Plan"}], highlight=0), "tense"),
    ("In 1968, new labour laws limited strikes and gave employers more control, to make the island more attractive to investors.",
     g("text", text="1968: new labour laws. Fewer strikes. More investors."), "reflective"),
    ("And in 1971, a long-term Concept Plan mapped out land, roads, housing and industry for decades ahead.",
     g("stat", value="1971", label="First Concept Plan: land use mapped decades ahead", source="National Library Board, Singapore"), "reflective"),
    ("The government had to decide what kind of economy this island would have.",
     photo("Singapore Parliament House", "Old Parliament House Singapore", cam="push_in", desc="Parliament House"), "reflective"),
],
"transformation": [
    ("Part of the answer was already under way.",
     photo("Jurong Singapore", "Jurong industrial", cam="drone_forward", desc="Jurong today"), "hopeful"),
    ("In 1961, a United Nations team led by the Dutch economist Albert Winsemius had advised Singapore to industrialise, fast.",
     g("text", text="1961: a UN team led by Albert Winsemius says industrialise, fast."), "hopeful"),
    ("That year, the government set up the Economic Development Board to win investment and create jobs.",
     g("timeline", title="Building an economy", events=[{"year": "1961", "label": "Economic Development Board"}, {"year": "1963", "label": "First Jurong factory"}], highlight=0), "hopeful"),
    ("Its first big project was a vast industrial estate on swampy land at Jurong, in the west of the island.",
     g("map", "Jurong in the west", title="Jurong", focus=["Singapore"], context=["Malaysia"], bbox=[103.55, 1.18, 104.1, 1.5], points=[{"name": "Jurong", "lat": 1.333, "lon": 103.70}]), "hopeful"),
    ("Many newly independent countries at the time were wary of foreign multinational companies.",
     g("text", text="Many new nations kept foreign companies out."), "reflective"),
    ("Singapore did the opposite. It invited them in.",
     g("title", text="It invited them in."), "hopeful"),
    ("Foreign companies brought money, technology and know-how, and Singaporean workers learned on the job.",
     photo("technician factory", "engineer manufacturing", loc="", cam="push_in", desc="Skilled factory work"), "hopeful"),
    ("Factories making clothing, electronics and parts for global brands opened across the island, and jobs followed.",
     photo("electronics factory workers", "factory assembly line electronics", loc="", cam="pan_right", desc="An electronics assembly line"), "hopeful"),
    ("Oil companies built refineries here too. Shell opened the first, on the island of Pulau Bukom, in 1961.",
     photo("Pulau Bukom refinery", "Singapore oil refinery", "Jurong Island refinery", cam="pan_left", desc="Refineries off Singapore"), "hopeful"),
    ("A country with no oil of its own became one of Asia's great refining centres.",
     g("title", text="No oil. Huge refineries."), "hopeful"),
    ("Trade kept growing too, and Singapore's harbour became one of the busiest ports on the planet.",
     photo("Singapore port", "Singapore container port", "PSA Singapore", cam="drone_forward", desc="The port of Singapore"), "hopeful"),
    ("In 2024, it handled a record forty one million containers, counted in twenty foot units.",
     g("stat", value="41.12 million", label="containers handled in 2024 (twenty-foot equivalent units)", source="Maritime and Port Authority of Singapore"), "hopeful"),
    ("About nine in ten are transshipped, moved from one ship to another on the way somewhere else.",
     g("chart", title="Singapore's container traffic", type="bar", unit="%", source="Maritime and Port Authority of Singapore", bars=[{"label": "Transshipment", "value": 90}, {"label": "Local cargo", "value": 10}], highlight=0), "hopeful"),
    ("In 1981, Changi Airport opened, making Singapore a hub of the air as well as the sea.",
     photo("Changi Airport", "Changi Airport terminal", cam="pan_left", desc="Changi Airport"), "hopeful"),
    ("Singapore Airlines, formed in 1972, carried the country's name around the world.",
     photo("Singapore Airlines aircraft", "Singapore Airlines A380", "Singapore Airlines plane", loc="", cam="pan_right"), "hopeful"),
    ("Over the decades, the economy climbed up the value chain, into chemicals, precision engineering, finance and semiconductors.",
     photo("Marina Bay Financial Centre", "Singapore financial district", cam="tilt_up", shots=2), "hopeful"),
    ("Manufacturing is still about a fifth of the economy, and around one in every ten chips made in the world is made in Singapore.",
     g("stat", value="1 in 10", label="of the world's chips are made in Singapore", source="A*STAR"), "hopeful"),
],
"policies": [
    ("Investors did not come only for the location.",
     photo("Singapore skyline day", "Singapore city", cam="pan_right"), "reflective"),
    ("They came because the government worked, and because it was clean.",
     g("text", text="A government that worked. And was clean."), "reflective"),
    ("Civil servants were judged on results, and the rules on bribery applied all the way up.",
     photo("Singapore government buildings", "Singapore civic district", cam="tilt_up"), "reflective"),
    ("The streets were cleaned up, and littering was punished with fines.",
     photo("Singapore clean street", "Singapore street trees", cam="pan_left"), "reflective"),
    ("An anti-corruption agency, set up in 1952, was given tough new laws in 1960 to go after bribery at every level.",
     g("timeline", title="Fighting corruption", events=[{"year": "1952", "label": "Corrupt Practices Investigation Bureau"}, {"year": "1960", "label": "Prevention of Corruption Act"}], highlight=1), "reflective"),
    ("In 2024, Transparency International ranked Singapore the third least corrupt country in the world.",
     g("stat", value="#3", label="of 180 countries, Corruption Perceptions Index 2024", source="Transparency International / CPIB"), "hopeful"),
    ("Then there was housing.",
     photo("HDB flats Singapore", "Singapore public housing", cam="tilt_up", desc="Public housing blocks"), "reflective"),
    ("In 1960, the government created the Housing and Development Board to replace overcrowded slums with modern flats.",
     photo("HDB estate Singapore", "Singapore housing estate", cam="pan_left"), "reflective"),
    ("In May 1961, a huge fire in Bukit Ho Swee left about sixteen thousand people homeless.",
     g("stat", value="16,000", label="people made homeless by the Bukit Ho Swee fire, 1961", source="Housing and Development Board history"), "tense"),
    ("The board rehoused them and kept building at remarkable speed: twenty one thousand flats in less than three years.",
     g("stat", value="21,000", label="flats built in under three years", source="Housing and Development Board history"), "hopeful"),
    ("From 1968, workers could use savings from the Central Provident Fund, a compulsory savings scheme, to buy their homes.",
     g("text", text="1968: Pension savings can buy a home."), "hopeful"),
    ("Today, about seventy seven percent of residents live in public housing, and around nine in ten own their home.",
     g("comparison", title="Housing in Singapore, 2023", left={"label": "Live in public housing", "value": "77%"}, right={"label": "Own their home", "value": "~90%"}, source="Department of Statistics Singapore"), "hopeful"),
    ("Owning a home gave ordinary people a direct stake in the country's success.",
     photo("HDB void deck", "Singapore HDB playground", "Singapore neighbourhood", cam="push_in"), "hopeful"),
    ("The state saved and invested too. Temasek Holdings was set up in 1974, and GIC in 1981, to manage its assets and reserves.",
     g("timeline", title="Saving for the long run", events=[{"year": "1974", "label": "Temasek Holdings"}, {"year": "1981", "label": "GIC"}], highlight=1), "reflective"),
    ("And it chose English as a common working language, alongside each community's mother tongue.",
     g("text", text="English to work together. Mother tongues to stay rooted."), "reflective"),
    ("None of this was gentle. The government was strict, and critics point to tight limits on the press and the political opposition.",
     g("text", text="The trade-off: a strict state, a tightly controlled press, a weak opposition."), "tense"),
],
"people": [
    ("Singapore's real resource has always been its people.",
     photo("Singapore people street", "Singapore crowd", cam="pan_right"), "hopeful"),
    ("Most are of Chinese, Malay or Indian descent, alongside many other communities.",
     photo("Little India Singapore", "Serangoon Road Singapore", cam="push_in"), "hopeful"),
    ("Within a single generation, many families moved from villages and crowded shophouses into high-rise flats.",
     photo("Singapore HDB flats", "Toa Payoh Singapore", cam="tilt_up"), "hopeful"),
    ("Each has left its mark on the city's neighbourhoods, festivals and food.",
     photo("Kampong Glam Singapore", "Sultan Mosque Singapore", cam="tilt_up"), "hopeful"),
    ("Public housing estates use ethnic quotas, so that communities live side by side rather than apart.",
     photo("Singapore HDB estate aerial", "HDB blocks", cam="drone_forward"), "reflective"),
    ("Hawker centres, where cheap meals from every tradition are sold under one roof, became part of the national identity.",
     photo("hawker centre Singapore", "Singapore food court hawker", cam="pan_left"), "hopeful"),
    ("In 2020, UNESCO recognised Singapore's hawker culture as part of humanity's intangible heritage.",
     photo("Singapore hawker food", "Singapore street food", cam="push_in", shots=2), "hopeful"),
    ("Education became a national priority, and Singapore's students now regularly score near the top of international tests.",
     photo("Singapore students", "Singapore school", "Singapore university", cam="pan_right"), "hopeful"),
    ("Today, about six million people live on the island, and nearly a third of them are not citizens or permanent residents.",
     g("chart", title="Who lives in Singapore, June 2024 (millions)", type="bar", source="Population in Brief 2024", bars=[{"label": "Citizens", "value": 3.64}, {"label": "Permanent residents", "value": 0.54}, {"label": "Non-residents", "value": 1.86}]), "reflective"),
],
"global-role": [
    ("For a country this small, Singapore's reach is enormous.",
     photo("Singapore port night", "Singapore harbour night", cam="pull_out"), "epic"),
    ("Its total trade is worth more than three times its whole economy.",
     g("stat", value="326%", label="trade as a share of GDP, 2023", source="World Bank WITS"), "epic"),
    ("It is one of the world's leading financial centres, ranked in the global top five.",
     photo("Singapore financial district skyscrapers", "Raffles Place towers", cam="tilt_up"), "epic"),
    ("Hundreds of global companies run their Asian operations from the island.",
     photo("Singapore office towers", "Singapore business district", cam="pan_left"), "epic"),
    ("And Changi has been voted the world's best airport many times.",
     photo("Changi Airport interior", "Changi Airport terminal", cam="pan_right", desc="Inside Changi Airport"), "epic"),
    ("Its shipping lanes, airport and banks tie Southeast Asia to the rest of the world.",
     g("map", "Routes radiating from Singapore", title="A hub", focus=["Singapore"], context=["Malaysia", "Indonesia", "India", "China", "Australia"], bbox=[70, -38, 155, 40], start_zoom=1.3,
       routes=[{"from": SG, "to": [13.1, 80.3], "label": "India"}, {"from": SG, "to": [31.2, 121.5], "label": "China"},
               {"from": SG, "to": [-33.9, 151.2], "label": "Australia"}, {"from": SG, "to": [25.2, 55.3], "label": "Gulf"}]), "epic"),
    ("And it works hard to stay on good terms with both the United States and China.",
     g("text", text="Friends with Washington. Friends with Beijing."), "reflective"),
],
"problems": [
    ("Success has brought problems of its own.",
     g("title", text="The price of success"), "tense"),
    ("Singapore is regularly ranked among the most expensive cities in the world to live in.",
     photo("Orchard Road Singapore", "Singapore shopping street", cam="pan_left"), "tense"),
    ("Its people are having very few children. In 2023, the fertility rate fell below one child per woman for the first time.",
     g("stat", value="0.97", label="births per woman, Singapore residents, 2023", source="Singapore Department of Statistics"), "tense"),
    ("About one in five citizens is now sixty five or older, and by 2030 it will be one in four.",
     g("comparison", title="Citizens aged 65 and over", left={"label": "2024", "value": "1 in 5"}, right={"label": "2030", "value": "1 in 4"}, source="Population in Brief 2024"), "tense"),
    ("Land is still scarce, and the economy relies heavily on foreign workers.",
     photo("Singapore construction site", "construction workers Singapore", cam="pan_right"), "tense"),
    ("Housing prices have climbed, and many young couples worry about whether they can afford a home.",
     photo("Singapore condominium", "Singapore apartments", cam="tilt_up"), "tense"),
    ("And as a low-lying island, Singapore is exposed to rising seas, which could rise by up to a metre by the end of the century.",
     photo("East Coast Park Singapore sea", "Singapore coastline", cam="pan_left"), "tense"),
    ("In 2019, the prime minister said protecting the coast could cost a hundred billion Singapore dollars or more over the coming decades.",
     g("stat", value="S$100 billion+", label="estimated cost of coastal protection over 50 to 100 years", source="PM Lee Hsien Loong, National Day Rally 2019"), "tense"),
    ("And some Singaporeans ask whether a system built for growth leaves enough room for dissent.",
     g("text", text="Growth first. But how much room for dissent?"), "reflective"),
],
"future": [
    ("So Singapore is doing what it has always done: planning decades ahead.",
     photo("Singapore Gardens by the Bay", "Supertree Grove", cam="drone_forward"), "hopeful"),
    ("It has grown its own land by more than a quarter since the 1960s, by reclaiming it from the sea.",
     g("chart", title="Singapore's land area (km²)", type="bar", source="Singapore Land Authority via data.gov.sg", bars=[{"label": "1960", "value": 581.5}, {"label": "2024", "value": 744.3}], highlight=1), "hopeful"),
    ("Off the island of Pulau Tekong, it has built its first polder, Dutch style: land below sea level, protected by a wall.",
     g("map", "Pulau Tekong polder", title="Pulau Tekong", focus=["Singapore"], context=["Malaysia"], bbox=[103.75, 1.25, 104.15, 1.5], points=[{"name": "Pulau Tekong polder", "lat": 1.42, "lon": 104.03}]), "hopeful"),
    ("A giant new port is rising at Tuas, designed to handle sixty five million containers a year when it is finished in the 2040s.",
     g("stat", value="65 million", label="containers a year: Tuas Port's planned capacity in the 2040s", source="Port Economics, Management and Policy"), "hopeful"),
    ("At Changi, a fifth terminal is under construction, planned to open in the mid 2030s.",
     photo("Changi Airport Jewel", "Jewel Changi", "Changi Airport", cam="tilt_up", desc="Changi Airport today"), "hopeful"),
    ("For water, it has built its own supply: rainwater, recycled water called NEWater, and desalination plants.",
     photo("Marina Barrage Singapore", "Marina Reservoir", cam="pan_right"), "hopeful"),
    ("The first water agreement with Malaysia ended in 2011. The last one runs until 2061.",
     g("timeline", title="Water agreements with Johor", events=[{"year": "1961", "label": "First agreement"}, {"year": "1962", "label": "Second agreement"}, {"year": "2011", "label": "1961 deal expires"}, {"year": "2061", "label": "1962 deal expires"}], highlight=3), "reflective"),
],
"conclusion": [
    ("Singapore began with no oil, no farmland and not enough water.",
     g("text", text="No oil. No farmland. Not enough water."), "reflective"),
    ("What it had was a location, and leaders who treated that location as a starting point, not a guarantee.",
     photo("Singapore Strait sunset ships", "Singapore sunset skyline", cam="pull_out"), "reflective"),
    ("It invited the world in, housed its people, fought corruption, and saved for the future.",
     photo("Singapore skyline aerial", "Singapore city aerial", cam="drone_forward", shots=2), "epic"),
    ("Its success came from choices: to stay open, to plan ahead, and to keep its promises to investors and to its own people.",
     photo("Singapore skyline sunrise", "Singapore Marina Bay morning", cam="push_in"), "epic"),
    ("None of it was inevitable. In 1965, even its founders were not sure it would survive.",
     g("quote", text="For me, it is a moment of anguish.", attribution="Lee Kuan Yew, 1965"), "reflective"),
    ("Resources matter. But Singapore shows that what a country does with its position can matter even more.",
     g("title", text="SINGAPORE", subtitle="From nothing to one of the richest nations on Earth"), "epic"),
],
}

SHORT = {"In 1965, a small island", "In 2024, it handled", "In May 1961, a huge fire", "Its people are having very few"}


def main():
    scenes, script_sections = [], []
    for sid, title in SECTIONS:
        lines = [line for line, *_ in SCENES[sid]]
        script_sections.append({"id": sid, "title": title, "narration": [" ".join(lines)]})
        for line, visual, mood in SCENES[sid]:
            v = dict(visual)
            v.setdefault("camera", "push_in")
            scenes.append({
                "id": "", "section": sid, "narration": line, "visual": v, "music_mood": mood,
                "transition": "crossfade", "sfx": [],
                "short_candidate": any(line.startswith(s) for s in SHORT),
            })
    script = {
        "topic": research["topic"],
        "generated_by": research["generated_by"],
        "title_options": [
            "How Singapore Got Rich With Nothing",
            "Singapore Had No Oil, No Land, No Water. Then This",
            "The Island That Was Thrown Out and Got Rich",
            "Singapore: From $517 to $94,897 per Person",
            "Why Singapore Is Rich (It Isn't Luck)",
        ],
        "sections": script_sections,
    }
    plan = {
        "style_bible": ("Premium documentary realism: natural colour, gentle contrast, 35mm look. Colonial era "
                        "(1819-1941): sepia and monochrome archival prints, shophouses, bumboats, rickshaws. "
                        "1942-1970: monochrome press photography. Today: clean daylight or blue-hour city light, "
                        "Marina Bay, HDB estates, container port, greenery everywhere. No readable signage."),
        "scenes": scenes,
    }
    (HERE / "research" / "research.json").write_text(json.dumps(research, indent=1, ensure_ascii=False))
    (HERE / "script" / "script.json").write_text(json.dumps(script, indent=1, ensure_ascii=False))
    (HERE / "scenes" / "scene_plan.json").write_text(json.dumps(plan, indent=1, ensure_ascii=False))
    words = sum(len(line.split()) for sec in SCENES.values() for line, *_ in sec)
    print(f"{len(scenes)} scenes, {words} words")


if __name__ == "__main__":
    main()
