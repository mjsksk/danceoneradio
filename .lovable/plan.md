Episode 412 is the next "Anthems of the week" podcast episode, which uses the automated episode generator (not the Wh0 Plays Sessions flow). I'll use that automation and then paste in the 20 tracks from the uploaded `412.numbers` file.

## Steps

1. **Run the episode generator**
   - `npm run generate-episode`
   - This fetches Episode 412 metadata from the Blubrry RSS feed, then creates:
     - `src/pages/Episode412.tsx` with full SEO, audio player, progress tracking, login prompt, social sharing, ads, and Apple Podcasts link
     - Adds the lazy import + `/episode/412` route to `src/components/AnimatedRoutes.tsx`
     - Updates `scripts/generate-prerender.ts` with Episode 412 metadata

2. **Insert the tracklist** into the generated `Episode412.tsx`, replacing the `{/* TODO: Add track listing here after CSV import */}` block with:
   ```
   1. Agoria, Blasé – You're Not Alone (MoBlack, Simone Santagati Remix)
   2. Wax Motif – Something More (Extended Mix)
   3. Franky Wah – Down For You (feat. Jyll)
   4. Whitesquare – Twin Humanities
   5. Tommy Veanud – Same Man (Extended Mix)
   6. Brunello – Ghost Dance
   7. Victor Flash, Ary Sya – Motion
   8. East Side Beat – Ride Like The Wind (Nick Coles Remix)
   9. Shimza X Ar:Co X Kasango – Fire Fire (Gil Glaze Remix)
   10. Wax Motif – You Forget ft. Maeta (Radio Edit)
   11. Tastexperience – Beach Ball (Extended Club Mix)
   12. Calvin Harris, Jazzy – Satisfy
   13. Meduza & RANI – Silence (Extended Mix)
   14. Kelly Cappuccio – Don't Come Back (Extended Mix)
   15. Tastexperience – Beach Ball (Club Mix)
   16. ANOTR & 3DDY – Like It
   17. Dunmore Brothers feat. Ben Westbeech – TRUST ME
   18. Peking Duk, Phantogram – Forever (Original Mix)
   19. M.A.N.D.Y. vs Booka Shade – Body Language
   20. Cinnamon Chasers – Memories (Nordfold Remix - Radio Edit)
   ```
   (Source spreadsheet skipped rows 3 and 5, so the displayed list is renumbered 1–20.)

3. **Validate**
   - `npm run validate-episodes` to confirm no missing tracking parameters, header present, etc.
   - Verify `/episode/412` loads in the preview.

## Notes
- If the RSS feed doesn't yet contain Episode 412, the generator will fail — in that case I'll let you know so we can wait for the feed to update or generate manually using Episode 411 as a template.
- No other files (Shows.tsx, etc.) need changes for the weekly Anthems episodes; routing + prerender are the only integration points.