-- ============================================================
-- Optional seed: copy of the built-in defaults into site_content.
-- Not required (the site works from assets/js/content.js), but
-- seeding makes the admin panel start from the same content.
-- Run after schema.sql.
-- ============================================================

insert into public.site_content (key, value) values
  ('site', '{"name_ar":"محمود فيصل","name_en":"Mahmoud Fissal","role_ar":"مصمم جرافيك ومطوّر تعليمي","role_en":"Graphic Designer & Learning Developer"}'),
  ('hero', '{"title_line1_ar":"تصميم يعبّر عنك","title_line1_en":"Design that speaks","title_line2_ar":"ويصل إلى جمهورك","title_line2_en":"and reaches your audience","subtitle_ar":"أنا محمود فيصل، مصمم جرافيك ومطوّر محتوى تعليمي. أساعد العلامات التجارية والمؤسسات التعليمية على تحويل أفكارها إلى هويات بصرية وتجارب تعلم واضحة وجذابة.","subtitle_en":"I''m Mahmoud Fissal, a graphic designer and instructional developer. I help brands and educational organizations turn their ideas into clear, engaging visual identities and learning experiences.","image":"assets/img/hero-designer.jpg","stats":[{"value_ar":"+120","value_en":"120+"},{"value_ar":"7","value_en":"7"},{"value_ar":"24/7","value_en":"24/7"}]}'),
  ('about', '{"image":"assets/img/about-workspace.jpg","text_ar":"أجمع بين عين المصمم وعقل المطوّر التعليمي. أؤمن أن التصميم الجيد ليس شكلًا جميلًا فقط، بل طريقة أوضح للفهم والتواصل. أعمل مع العملاء من الفكرة الأولى حتى المنتج النهائي: هوية بصرية، محتوى تعليمي، منصات، ومواد مطبوعة ورقمية.","text_en":"I combine a designer''s eye with an instructional developer''s mind. Good design is not just a pretty look; it is a clearer way to understand and communicate. I work with clients from the first idea to the final product: visual identity, learning content, platforms, print and digital materials.","points_ar":["تسليم احترافي في المواعيد","تعديلات حتى الرضا الكامل","ملفات مفتوحة المصدر"],"points_en":["Professional on-time delivery","Revisions until full satisfaction","Open-source files included"]}'),
  ('contact', '{"email":"hello@example.com","phone":"+20 100 000 0000","whatsapp":"","location_ar":"قنا، مصر","location_en":"Qena, Egypt","socials":[{"id":"behance","label":"Behance","url":""},{"id":"dribbble","label":"Dribbble","url":""},{"id":"linkedin","label":"LinkedIn","url":""},{"id":"instagram","label":"Instagram","url":""}]}'),
  ('theme', '{"light":{"accent":"#f5b301","heading":"#1f3ab0","bg":"#f2f3f5"},"dark":{"accent":"#ffc61a","heading":"#ffc61a","bg":"#17264a"}}')
on conflict (key) do nothing;

insert into public.portfolio_items (title_ar, title_en, category, image_url, sort_order) values
  ('تصميم شعار', 'Logo Design', 'branding', 'assets/img/work-logo.jpg', 0),
  ('هوية بصرية', 'Brand Identity', 'branding', 'assets/img/work-brand.jpg', 1),
  ('منشورات سوشيال ميديا', 'Social Media Designs', 'social', 'assets/img/work-social.jpg', 2),
  ('أغلفة كتب تعليمية', 'Educational Book Covers', 'print', 'assets/img/work-book.jpg', 3),
  ('واجهة منصة تعليمية', 'Learning Platform UI', 'uiux', 'assets/img/work-uiux.jpg', 4),
  ('موشن جرافيك', 'Motion Graphics', 'motion', 'assets/img/work-motion.jpg', 5)
on conflict do nothing;

-- Note: 'services' and 'marquee' stay at their built-in defaults until
-- edited in the admin panel, which writes them to site_content.
