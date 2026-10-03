-- Fromage & Figue: a first test blog post. Paste into Supabase > SQL Editor > New query, then press Run.
-- Safe to run more than once (it updates the same post). You can edit or delete it later in the admin, under Blog.
insert into public.posts (slug, title, excerpt, featured_image, featured_alt, category, author, content, editor_mode, status, published_at, seo_title, seo_description, read_minutes)
values (
  'why-a-great-comte-is-worth-the-wait',
  'Why a great Comté is worth the wait',
  'Forty kilos of cheese, four hundred litres of milk and up to three years in a cellar. The story of the wheel we are most excited to put on the counter.',
  'https://fromageandfigue.co.uk/assets/counter.webp',
  'The cheese counter at Fromage and Figue',
  'Cheese',
  'Benoit Severin-Delos',
  $body$<p>A wheel of Comté weighs about forty kilos, takes roughly four hundred litres of milk to make, and can spend up to three years in a cellar before anyone is allowed to eat it. We think that is the best argument in the world for patience.</p><h2>It begins on a mountain</h2><p>Comté comes from the Jura, a high, green range on the border between France and Switzerland. The milk comes from Montbéliarde cows grazing on mountain pasture, and it is turned into cheese in small village dairies called <em>fruitières</em>, usually within a day of milking. Every wheel is stamped with the dairy that made it, so you can trace your slice back to a single valley.</p><p>Then comes the part we love most. The young wheels are collected by an <em>affineur</em>, a specialist who ripens cheese for a living. Over weeks and months he turns, brushes and salts each wheel by hand, and tastes it with a long steel probe to decide when it is ready.</p><blockquote>Age is not a number on the label. It is a long conversation between the cheese and the cellar.</blockquote><h2>Four ages, four personalities</h2><p>The same wheel tastes completely different depending on how long it rests.</p><ul><li><strong>12 months:</strong> fresh, fruity and supple. Brilliant for melting into a toastie or a gratin.</li><li><strong>18 months:</strong> toasted hazelnut, a little more savoury, with the first hint of crunch.</li><li><strong>24 months:</strong> deep amber, caramel and brown butter, with a long finish. This is the one we stock, and the one we would choose for the board.</li><li><strong>36 months:</strong> intense, almost spicy and wonderfully dry. A few thin shavings go a very long way.</li></ul><p><img src="https://fromageandfigue.co.uk/assets/counter.webp" alt="The cheese counter at Fromage and Figue"></p><p><em>A first look at the counter, where the Comté will sit.</em></p><h2>What is the crunch?</h2><p>Bite into a well-aged Comté and you will notice tiny, crunchy crystals. They are not salt and they are not sugar. They are clusters of an amino acid called tyrosine, and they only form when a cheese has been given enough time. Think of them as a quality mark: the more you can feel, the longer it waited.</p><h2>How to eat it</h2><ol><li><strong>Take it out of the fridge an hour before.</strong> Cold cheese is quiet cheese. At room temperature the flavour opens up.</li><li><strong>Cut it thin.</strong> Slices, not cubes. They warm faster and show off the crystals.</li><li><strong>Pour something with nuts in it.</strong> A glass of Vin Jaune from the same mountains is the classic partner, and a good white Burgundy never lets you down. For more ideas, have a look at our <a href="https://fromageandfigue.co.uk/pairing">pairing guide</a>.</li></ol><h2>Come and taste it</h2><p>When the doors open in Liverpool in Spring 2027, a wheel of 24 month Comté will be waiting on the counter, ready to be cut to order. Until then you can see it, and everything else we are planning, in the <a href="https://fromageandfigue.co.uk/collection">Main Collection</a>.</p><p>Good things take time. We are happy to wait with you.</p>$body$,
  'visual',
  'published',
  now(),
  'Why a Great Comté Is Worth the Wait',
  'How Comté is made in the Jura, why it ages for up to three years, and the best way to taste it. A story from the Fromage & Figue counter.',
  3
)
on conflict (lower(slug)) do update set
  title = excluded.title, excerpt = excluded.excerpt, featured_image = excluded.featured_image, featured_alt = excluded.featured_alt,
  category = excluded.category, content = excluded.content, editor_mode = excluded.editor_mode, status = excluded.status,
  seo_title = excluded.seo_title, seo_description = excluded.seo_description, read_minutes = excluded.read_minutes, updated_at = now();
