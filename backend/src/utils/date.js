export function isIsoDateString(s) {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}


export function getNightDatesBetween(startIso, endIso) {
  // returns array of dates for nights: from start (inclusive) to day before end (exclusive)
  const out = [];
  const s = new Date(startIso);
  const e = new Date(endIso);
  for (let d = new Date(s); d < e; d.setDate(d.getDate() + 1)) {
    out.push(d.toISOString().slice(0, 10));
  }
  // remove last element if equals endIso (defensive)
  if (out.length && out[out.length - 1] === endIso) out.pop();
  return out;
}

export const isoTomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1); // move to tomorrow
  return d.toISOString().slice(0, 10); // return YYYY-MM-DD
};
