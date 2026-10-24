// Per-video configuration read by the CO7 engine.
window.VIDEO = {
  slug: 'microwave',
  audioEnd: 58.28,                 // length of the tightened voice-over (s)
  tail: 1.6,                       // end card hold after the voice ends (s)
  likeLine: null,                  // index of "دير لايك واشتراك…" (new videos: 2). This older example has none.
  stingLine: 2,                    // index of the sting line (new videos: 3 = "وكمل معايا باش تعرف.")
  recapLine: 28,                   // first line spoken over the recap card
  ctaLine: 30,                     // first CTA line (captions hide, end card shows)
  chapters: [                      // 4–6 chapters, labels ≤ 7 letters, `at` = start time (s)
    { label: 'السؤال', at: 0 },
    { label: 'الموجات', at: 4.49 },
    { label: 'الما', at: 17.33 },
    { label: 'الطبسيل', at: 32.28 },
    { label: 'الغريب', at: 45.25 },
    { label: 'الملخص', at: 51.92 },
  ],
  display: { 'الماڭْنِيترون': 'الماڭنيترون' },   // caption text fixes (drop harakat used only for the voice)
  keywords: {                      // line index -> [[exact word, 'r' (red) | 'b' (blue)]]
    0: [['تانسخنو', 'r']], 1: [['الطبسيل', 'r']], 2: [['فدقيقة', 'r']], 3: [['الماڭنيترون', 'r']], 4: [['الويفي', 'b']],
    5: [['وترجع', 'r']], 7: [['الماكلة', 'r']], 8: [['بالما', 'b']], 9: [['الما', 'b']], 10: [['جوج طراف', 'r']],
    11: [['موجب', 'r'], ['سالب', 'b']], 12: [['ليمن وليسر', 'r']], 13: [['جوج مليار ونص', 'r']], 14: [['وتاتضرب', 'r']],
    16: [['السخانة', 'r']], 17: [['والطبسيل؟', 'r']], 18: [['السيراميك', 'b'], ['الزاج', 'b']], 19: [['وقاصحين', 'r']],
    20: [['الما الحر', 'b']], 21: [['تاتدوز', 'r']], 23: [['من الماكلة', 'r']], 24: [['والغريب؟', 'r']], 25: [['الثلج', 'b']],
    26: [['مجمّدين', 'b']], 27: [['بشوية', 'r']], 28: [['ماتايسخنش الطبسيل', 'r']], 29: [['تايحرّك الما', 'r']],
  },
  recap: {
    title: 'علاش المايكروويف تايسخن الماكلة… وماتايسخنش الطبسيل؟',
    legend: ['الماڭنيترون', 'الحيوط ديال الحديد', 'الجزيئات ديال الما', 'الطبسيل'],
    hero: { value: '~2.45', text: 'مليار مرة فالثانية<br>الموجة تاتجرّ الجزيء ديال الما' },
    points: '1. الموجات تاتنقز بين الحيوط وتوصل للماكلة. 2. الما تايدور ويتضارب، والحكّان تايعطي السخانة. 3. الطبسيل ما فيهش الما الحر: الموجة تاتدوز منو، وتايسخن غير من الماكلة.',
  },
  cta: { l1: 'قولو لينا فالكومونتير…', l2: 'شنو بغيتو نشرحو المرة الجاية؟' },
  cover: { t: 2.8, html: 'علاش <span style="color:#D0111B">الطبسيل</span><br>ماتايسخنش؟' },
};
