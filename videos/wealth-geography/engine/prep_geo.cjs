// usage: NODE_PATH=DIR/node_modules node prep_geo.cjs OUT.json
// Packs Natural Earth 1:50m countries (world-atlas) and GeoNames cities (all-the-cities) into one small file:
// { countries: { id: [ring, ...] }, cities: [[lon, lat, pop], ...] }, coordinates rounded to 0.02 degrees.
const topo = require('topojson-client'), fs = require('fs');
const w = require('world-atlas/countries-50m.json'), fc = topo.feature(w, w.objects.countries);
const r = v => Math.round(v * 50) / 50, countries = {};
fc.features.forEach((f, i) => { const id = f.id || 'x' + i, polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
  countries[id] = (countries[id] || []).concat(polys.map(p => { const out = []; p[0].forEach(([x, y]) => { const q = [r(x), r(y)], l = out[out.length - 1]; if (!l || l[0] !== q[0] || l[1] !== q[1]) out.push(q); }); return out; }).filter(p => p.length > 3)); });
const cities = require('all-the-cities').filter(c => c.population >= 25000).map(c => [r(c.loc.coordinates[0]), r(c.loc.coordinates[1]), c.population]);
fs.writeFileSync(process.argv[2], JSON.stringify({ countries, cities }));
console.log(Object.keys(countries).length, 'countries', cities.length, 'cities', (fs.statSync(process.argv[2]).size / 1e6).toFixed(2), 'MB');
