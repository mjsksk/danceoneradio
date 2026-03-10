

## Move Hat Image Lower in Product Card

**Problem**: The hat product image is cropped at the top because the square container uses `object-cover` with default centering, cutting off the top of the hat.

**Solution**: Add a custom `object-position` style to the hat image so it shifts downward, making the full hat visible. This needs to be applied in two places:

1. **Merch page grid card** (`src/pages/Merch.tsx`) — the product card thumbnail uses `object-cover` in the `aspect-square` container. We'll add conditional `object-position: bottom` (or a specific value like `center 70%`) when rendering the hat item, so the image shifts to reveal the top of the hat.

2. **Product preview dialog** (`src/components/ProductPreview.tsx`) — the full-size preview also uses `object-cover` in an `aspect-square` container. Same adjustment needed here.

**Approach**: Add an optional `imagePosition` field to the product data in `CartContext.tsx` (e.g., `"bottom"` for the hat), then use it as `style={{ objectPosition }}` on the `<img>` tags in both the Merch page and ProductPreview. This keeps it data-driven and reusable for future products.

**Changes**:
- `src/contexts/CartContext.tsx` — add `imagePosition?: string` to the `MerchItem` type and set `imagePosition: "bottom"` on the hat product (ID 3)
- `src/pages/Merch.tsx` — apply `style={{ objectPosition: item.imagePosition }}` on the card image
- `src/components/ProductPreview.tsx` — apply the same on the preview image

