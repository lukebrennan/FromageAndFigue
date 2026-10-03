-- Fromage & Figue: a first test blog post. Paste into Supabase > SQL Editor > New query, then press Run.
-- Safe to run more than once (it updates the same post). You can edit or delete it later in the admin, under Blog.
insert into public.posts (slug, title, excerpt, featured_image, featured_alt, category, author, content, editor_mode, status, published_at, seo_title, seo_description, read_minutes)
values (
  'why-a-great-comte-is-worth-the-wait',
  'Why a great Comté is worth the wait',
  'Forty kilos of cheese, four hundred litres of milk and up to three years in a cellar. The story of the wheel we are most excited to put on the counter.',
  'https://fromageandfigue.co.uk/assets/apron.webp',
  'A cheesemonger in a black apron wrapping a piece of cheese',
  'Cheese',
  'Benoit Severin-Delos',
  $body$<p class="lead">A wheel of Comté weighs about forty kilos, takes roughly four hundred litres of milk to make, and can spend up to three years in a cellar before anyone is allowed to eat it. We think that is the best argument in the world for patience.</p>
<div class="stats"><div><b>40 kg</b><span>One wheel</span></div><div><b>400 L</b><span>Of milk per wheel</span></div><div><b>36 mo</b><span>Longest ageing</span></div></div>
<h2>It begins on a mountain</h2>
<p>Comté comes from the Jura, a high, green range on the border between France and Switzerland. The milk comes from Montbéliarde cows grazing on mountain pasture, and it is turned into cheese in small village dairies called <em>fruitières</em>, usually within a day of milking. Every wheel is stamped with the dairy that made it, so you can trace your slice back to a single valley.</p>
<figure class="wide"><img src="https://fromageandfigue.co.uk/assets/counter.webp" alt="The cheese counter at Fromage and Figue" loading="lazy"><figcaption>The counter, ready for its first wheels</figcaption></figure>
<p>Then comes the part we love most. The young wheels are collected by an <em>affineur</em>, a specialist who ripens cheese for a living. Over weeks and months he turns, brushes and salts each wheel by hand, and tastes it with a long steel probe to decide when it is ready.</p>
<blockquote class="pull">Age is not a number on the label. It is a long conversation between the cheese and the cellar.<cite>Benoit Severin-Delos</cite></blockquote>
<h2>Four ages, four personalities</h2>
<p>The same wheel tastes completely different depending on how long it rests. Here is how we think of them.</p>
<div class="ages"><div><b>12</b><i>Months</i><p>Fresh, fruity and supple. Brilliant melted into a toastie or a gratin.</p></div><div><b>18</b><i>Months</i><p>Toasted hazelnut, a little more savoury, with the first hint of crunch.</p></div><div class="hl"><b>24</b><i>Months &middot; our choice</i><p>Deep amber, caramel and brown butter with a long finish. The one waiting on our counter.</p></div><div><b>36</b><i>Months</i><p>Intense, almost spicy and wonderfully dry. A few thin shavings go a long way.</p></div></div>
<div class="pair"><figure><img src="https://fromageandfigue.co.uk/assets/wrap-800.webp" alt="Cheese wrapped in paper with a Fromage and Figue label" loading="lazy"><figcaption>Wrapped by hand, cut to order</figcaption></figure><figure><img src="https://fromageandfigue.co.uk/assets/lunch-800.webp" alt="Cheese, a baguette and radishes on a board" loading="lazy"><figcaption>The simplest lunch in France</figcaption></figure></div>
<h2>What is the crunch?</h2>
<p>Bite into a well-aged Comté and you will notice tiny, crunchy crystals. They are not salt and they are not sugar. They are clusters of an amino acid called tyrosine, and they only form when a cheese has been given enough time.</p>
<div class="callout"><h3>A good sign</h3><p>Think of the crunch as a quality mark. The more you can feel, the longer the wheel waited.</p></div>
<h2>How to eat it</h2>
<ol class="steps"><li><span><strong>Take it out of the fridge an hour before.</strong> Cold cheese is quiet cheese. At room temperature the flavour opens up.</span></li><li><span><strong>Cut it thin.</strong> Slices, not cubes. They warm faster and show off the crystals.</span></li><li><span><strong>Pour something with nuts in it.</strong> A glass of Vin Jaune from the same mountains is the classic partner, and a good white Burgundy never lets you down. For more ideas, see our <a href="https://fromageandfigue.co.uk/pairing">pairing guide</a>.</span></li></ol>
<figure class="wide"><img src="https://fromageandfigue.co.uk/assets/tasting.webp" alt="Two glasses of wine with plates of cheese and a basket of bread" loading="lazy"><figcaption>Cheese, bread and two glasses. All you need.</figcaption></figure>
<h2>Come and taste it</h2>
<p>When the doors open in Liverpool in Spring 2027, a wheel of 24 month Comté will be waiting on the counter, ready to be cut to order. Good things take time, and we are happy to wait with you.</p>
<div class="gallery"><figure><img src="https://fromageandfigue.co.uk/assets/shelves-800.webp" alt="Shelves of preserves and wine" loading="lazy"></figure><figure><img src="https://fromageandfigue.co.uk/assets/board-800.webp" alt="A cheese board with Comté, brie and blue cheese" loading="lazy"></figure><figure><img src="https://fromageandfigue.co.uk/assets/window-800.webp" alt="The shop window" loading="lazy"></figure></div>
<p><a class="cta" href="https://fromageandfigue.co.uk/collection#comte">Meet the Comté</a></p>$body$,
  'html',
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
