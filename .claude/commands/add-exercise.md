Add a new exercise to the program.

Exercises are defined in `js/data.js` in the `EX` object. Each entry follows this shape:

```js
g1_XX: {
  id: "g1_XX",
  name: "Exercise Name",
  scheme: "3×10",          // display string e.g. "4×5+", "3×8-12", "3×max"
  sets: 3,
  reps: 10,
  repType: "fixed",        // "fixed" | "range" | "plus" | "max"
  hasWeight: true,
  rmMult: 0.85 * 0.60,     // fraction of 1RM used for starting weight calc
  alts: ["Alt 1", "Alt 2", "Alt 3"],
  gifUrl: ""               // leave empty; EXERCISE_GIFS map handles display names
}
```

- ID prefix: `g1_` = Gün 1, `g2_` = Gün 2, `g3_` = Gün 3
- Add the ID to the correct day array in `DAYS`
- If there's a GIF, add `"Exercise Name": "https://raw.githubusercontent.com/furkankkokcek/fitness/main/exercises/File.gif"` to `EXERCISE_GIFS`
- `repType:"max"` exercises should have `reps:0` and `hasWeight:false`
