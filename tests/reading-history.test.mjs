import test from "node:test";
import assert from "node:assert/strict";
import { addReading, parseReadings } from "../lib/reading-history.ts";

test("history retains 10 most recent unique texts and moves repeats to the top", () => {
  let history = [];
  for (let i = 0; i < 12; i++) history = addReading(history, `Bonjour ${i}`, i);
  assert.equal(history.length, 10);
  assert.equal(history[9].text, "Bonjour 2");
  history = addReading(history, "  Bonjour 5  ", 20);
  assert.deepEqual(history[0], { text: "Bonjour 5", playedAt: 20 });
  assert.equal(history.filter((item) => item.text === "Bonjour 5").length, 1);
  assert.equal(history.length, 10);
});

test("stored history rejects corrupted data, invalid dates and duplicates", () => {
  assert.deepEqual(parseReadings("oops"), []);
  assert.deepEqual(parseReadings("{}"), []);
  const history = parseReadings(
    JSON.stringify([
      null,
      { text: "bad", playedAt: 1e30 },
      { text: " ", playedAt: 2 },
      { text: "Salut", playedAt: 1 },
      { text: " Salut ", playedAt: 3 },
    ]),
  );
  assert.deepEqual(history, [{ text: "Salut", playedAt: 3 }]);
});

test("history preserves French accents, punctuation and internal line breaks", () => {
  const text = "Tu as quel âge ?\nJ'ai trente-cinq ans.";
  assert.equal(addReading([], `  ${text}\n`, 1)[0].text, text);
  assert.deepEqual(addReading([], "   "), []);
});
