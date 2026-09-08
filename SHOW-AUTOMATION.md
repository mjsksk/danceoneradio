# Creating the next show page automatically

One command builds the next upcoming show page from a pasted tracklist. It works
out the next episode number and the next Friday broadcast date on its own, then
wires up the page, the link in the shows list, the previous/next buttons, the
web address and the sitemap.

## Wh0 Plays Sessions (the usual case)

```bash
npm run new:show -- --guest "Johan S"
```

Paste the tracklist, then press Ctrl-D. Or keep it in a file:

```bash
npm run new:show -- --guest "Johan S" --tracks tracklist.txt
```

Leave off `--guest` for an episode without a guest DJ.

## Future Dance Anthems

```bash
npm run new:show -- --brand fda --tracks tracklist.txt
```

The audio link is pulled from the podcast feed when the episode is already
published; otherwise pass `--audio "<url>"` later. The tracklist is also written
as a ready-to-run database file in `scripts/output/`.

## Tracklist formats it understands

Any mix of these, one track per line:

```text
00:55 - Low Steppa, Jewel Kid - The Roller (Wh0 Remix)
Piem - Give Me The Rhythm
1. Mark Knight, Cristoph - Yebisah (Extended Mix)
Genie in a Bottle	Christina Aguilera      (two columns pasted from a sheet)
```

Timestamps are optional and list numbering is stripped automatically.

## Useful extras

| Option | What it does |
| --- | --- |
| `--dry-run` | Show what would change without writing anything |
| `--number 248` | Force a specific episode number |
| `--date 2026-09-25` | Force a broadcast date (6 PM Pacific) |
| `--help` | Full usage |

After running it, check the new page in the preview and publish.
