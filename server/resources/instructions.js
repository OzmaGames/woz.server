module.exports =
{
  instructions:
  [
    { shortDescription : "First letter: R * 2", longDescription : "The phrase must contain (at least) two words that begins with R", condition: ["begin 2 r"], bonus: 15, mult: 0, level: 1 },
    { shortDescription : "First letter: S", longDescription : "The phrase must contain (at least) one word that begins with S", condition: ["begin 1 s"], bonus: 10, mult: 0, level: 1 },
    { shortDescription : "Adjective", longDescription : "The phrase must contain (at least) one adjective", condition: ["class 1 adjective"], bonus: 10, mult: 0, level: 3 },
    { shortDescription : "Two Verbs", longDescription : "The phrase must contain (at least) two verbs", condition: ["class 2 verb"], bonus: 15, mult: 0, level: 3 },
    { shortDescription : "Feeling", longDescription : "The phrase must contain (at least) one word that represents a feeling", condition: ["category 1 feeling"], bonus: 40, mult: 0, level: 2 },
    { shortDescription : "Animal", longDescription : "The phrase must contain (at least) one word that represents an animal", condition: ["category 1 animal"], bonus: 0, mult: 2, level: 2 },
    { shortDescription : "Color", longDescription : "The phrase must contain (at least) one word that represents a color", condition: ["category 1 color"], bonus: 0, mult: 2, level: 2 }
  ]
};