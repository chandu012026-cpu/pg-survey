// Hostel & PG survey questions, version 2.
// Residents (the default link): exactly 25 questions, Q1–Q25, and every one needs an answer, because
// participants are paid ₹25 for a complete survey. Owners (?for=owner): the longer owner survey, B1–B13.
// To change a question, edit its text or options here. If a question's meaning changes, raise `version`
// at the bottom so old and new answers stay apart.
//
// Each question: id, q (question), t (type), o (options). Types: one = pick one · all = pick all (max = most
// picks) · top3 = pick 3 in order · stars = 1–5 · nps = 0–10 · grid = rate each row · num = a number · text.
// Extras: other (adds "Other" with a box) · only (an option that clears the others) · when (show only if …)
// · ask (contact boxes for an option) · lead (a line above) · core (in the owners' short survey).
(function () {
  const has = (v, x) => Array.isArray(v) && v.includes(x);

  // ---------------- Residents: 25 questions ----------------
  const FACILITIES = ['Food', 'Wi-Fi', 'AC', 'Attached bathroom', 'Washing machine', 'Housekeeping', 'Hot water',
    'Power backup', 'CCTV / security guard', 'Gym', 'Parking'];
  const resident = [
    { id: 'S1', title: 'About you', qs: [
      { id: 'Q1', q: 'Gender', t: 'one', o: ['Male', 'Female', 'Prefer not to say'] },
      { id: 'Q2', q: 'Your age', t: 'one', o: ['18–21', '22–25', '26–30', 'Above 30'] },
      { id: 'Q3', q: 'What do you do?', t: 'one', o: ['Working (IT)', 'Working (non-IT)', 'Student', 'Preparing for exams'], other: 1 }
    ] },
    { id: 'S2', title: 'Your hostel or PG', qs: [
      { id: 'Q4', q: 'Name of your hostel or PG', t: 'text', short: 1, ph: 'e.g. Sri Sai PG for Men', group: 1 },
      { id: 'Q5', q: 'Which area is it in?', t: 'one', o: ['Gachibowli', 'Madhapur / HITEC City', 'Kondapur', 'Financial District', 'Kukatpally / KPHB', 'Ameerpet / SR Nagar', 'Dilsukhnagar / LB Nagar'], other: 1 },
      { id: 'Q6', q: 'Your hostel is for', t: 'one', o: ['Men', 'Women', 'Both'] },
      { id: 'Q7', q: 'How many people share your room?', t: 'one', o: ['Just me', '2', '3', '4 or more'] },
      { id: 'Q8', q: 'Your monthly rent (your share)', t: 'one', o: ['Under ₹6,000', '₹6,000–8,000', '₹8,000–10,000', '₹10,000–13,000', '₹13,000–16,000', 'Above ₹16,000'] },
      { id: 'Q9', q: 'Extra charges each month, on top of rent', t: 'one', o: ['None', 'Under ₹500', '₹500–1,000', 'Above ₹1,000'] },
      { id: 'Q10', q: 'Security deposit you paid', t: 'one', o: ['None', "1 month's rent or less", "About 2 months' rent", "More than 2 months' rent"] },
      { id: 'Q11', q: 'How long have you stayed here?', t: 'one', o: ['Under 3 months', '3–6 months', '6–12 months', 'Over a year'] },
      { id: 'Q12', q: 'How did you find this place?', t: 'all', o: ['Walked in / saw the board', 'Friend or colleague', 'Google / Maps', 'Website or app', 'Broker', 'Social media'] },
      { id: 'Q13', q: 'Why did you choose to stay here?', t: 'all', max: 3, o: ['Near work or college', 'Affordable rent', 'Good food', 'Clean', 'Safe', 'Good facilities', 'Friends stay here', 'Good owner / staff', 'No better option'] },
      { id: 'Q14', q: 'What does your hostel provide?', t: 'all', o: FACILITIES }
    ] },
    { id: 'S3', title: 'Rate your stay', qs: [
      { id: 'Q15', q: 'Rate your stay overall', t: 'stars', lo: 'Very poor', hi: 'Excellent' },
      { id: 'Q16', q: 'Rate each', t: 'grid', scale: 'stars', items: [{ t: 'Food', when: a => has(a.Q14, 'Food') }, { t: 'Cleanliness' }, { t: 'Safety' }, { t: 'Wi-Fi', when: a => has(a.Q14, 'Wi-Fi') }, { t: 'Water supply' }, { t: 'Staff behaviour' }, { t: 'Room and bed' }] },
      { id: 'Q17', q: 'Is it value for money?', t: 'one', o: ['Very poor', 'Poor', 'Fair', 'Good', 'Excellent'] },
      { id: 'Q18', q: 'Biggest problems here', t: 'all', max: 3, o: ['Food', 'Cleanliness', 'Water', 'Wi-Fi', 'Power cuts', 'Noise', 'Strict rules', 'Slow repairs', 'Staff behaviour', 'Hidden charges', 'No problems'], only: 'No problems' },
      { id: 'Q19', q: 'When you complain, how fast is it fixed?', t: 'one', o: ['Same day', 'In 2–3 days', 'A week or more', 'Not fixed', 'Never complained'] }
    ] },
    { id: 'S4', title: 'Extras', qs: [
      { id: 'Q20', q: 'Which facilities would you most like added?', t: 'all', max: 3, o: a => FACILITIES.filter(f => !has(a.Q14, f)).concat(['Nothing more needed']), only: 'Nothing more needed' },
      { id: 'Q21', q: 'If these were added, would you pay more each month?', t: 'one', o: ['No', '₹500 more', '₹1,000 more', 'More than ₹1,000'] },
      { id: 'Q22', lead: 'Prices are per month.', q: 'Which extra services would you pay for?', t: 'all', o: ['Laundry and ironing — ₹500', 'Daily room cleaning — ₹300', 'Lunch box to office — ₹1,000', 'Gym access — ₹500', 'Faster Wi-Fi — ₹200', 'Weekly bedsheet change — ₹200', 'None of these'], only: 'None of these' }
    ] },
    { id: 'S5', title: 'Last questions', qs: [
      { id: 'Q23', q: 'Will you stay here for the next 6 months?', t: 'one', o: ['Yes', 'Not sure', 'No, planning to move'] },
      { id: 'Q24', q: 'Would you recommend this place to a friend?', t: 'one', o: ['Yes', 'Maybe', 'No'] },
      { id: 'Q25', q: "One thing you'd change here", t: 'text', ph: 'e.g. better food on weekends' }
    ] }
  ];
  resident.forEach(s => s.qs.forEach(q => { q.core = 1; }));

  // ---------------- Owners (?for=owner) ----------------
  const OWNER_AREAS = ['Gachibowli', 'HITEC City/Madhapur', 'Kondapur', 'Financial District/Nanakramguda', 'Kukatpally/KPHB',
    'Ameerpet/SR Nagar', 'Ashok Nagar/Dilsukhnagar', 'Begumpet/Secunderabad', 'Uppal', 'Shamshabad'];
  const YMN = ['Yes', 'Maybe', 'No'];
  const MUST = ['Must have', 'Nice to have', "Don't need"];
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const O_FEATURES = [
    { t: 'Listing with floor plan and bed booking' },
    { t: 'Bed board: free and occupied beds at a glance', core: 1 },
    { t: 'Add a walk-in resident in 30 seconds', core: 1 },
    { t: 'QR self check-in for new residents', core: 1 },
    { t: 'Resident register for the police', core: 1 },
    { t: 'ID storage (owner only, deleted after move-out)' },
    { t: 'Rent bills, reminders and late fees', core: 1 },
    { t: 'UPI AutoPay for rent', core: 1 },
    { t: 'Receipts sent automatically' },
    { t: 'Deposit tracking and refund record' },
    { t: 'Complaints with photos', core: 1 },
    { t: 'Food menu, meal-skip counts and meal ratings', core: 1 },
    { t: 'Notices to residents' },
    { t: 'Approve late entry, night out and guest requests' },
    { t: 'Staff logins (warden, cook)', core: 1 },
    { t: 'Expenses and profit per property', core: 1 },
    { t: 'Several properties in one login' },
    { t: 'Reviews and replies', core: 1 },
    { t: 'Featured listing in busy months' },
    { t: 'Residents sent by companies and colleges' },
    { t: 'WhatsApp reminders', core: 1 },
    { t: 'Electricity bill split' },
    { t: 'Grocery and stock tracking' },
    { t: 'Rent insights: your rent vs the area average' },
    { t: 'Licence renewal reminders' }
  ];
  const featureNames = list => mode => list.filter(f => mode === 'full' || f.core).map(f => f.t);

  const owner = [
    { id: 'B1', title: 'About you and your PG', lead: 'If you run several PGs, answer about the main one.', qs: [
      { id: 'B1.1', core: 1, q: 'Your role', t: 'one', o: ['Owner', 'Family member who runs it', 'Manager', 'Warden', 'Partner or investor'] },
      { id: 'B1.2', core: 1, q: 'How many PG or hostel properties do you run?', t: 'one', o: ['1', '2–3', '4–10', 'Over 10'] },
      { id: 'B1.3', q: 'Years running PGs', t: 'one', o: ['Under 1', '1–3', '3–5', '5–10', 'Over 10'] },
      { id: 'B1.4', q: 'Do you own the building or lease it?', t: 'one', o: ['Own', 'Lease', 'Some of each'] },
      { id: 'B1.5', core: 1, q: 'Type of property', t: 'one', o: ['PG', 'Hostel', 'Co-living', '1 RK/studios', 'Service apartments', 'Mixed'] },
      { id: 'B1.6', core: 1, q: 'Area', t: 'one', o: OWNER_AREAS, other: 1 },
      { id: 'B1.7', q: "It's for", t: 'one', o: ['Women', 'Men', 'Everyone'] },
      { id: 'B1.8', core: 1, q: 'Total beds', t: 'one', o: ['Under 20', '20–50', '51–100', '101–200', 'Over 200'] },
      { id: 'B1.9', core: 1, q: 'Rent per bed for each sharing type', t: 'grid', scale: ['Under ₹5k', '₹5–7k', '₹7–9k', '₹9–12k', '₹12–15k', 'Over ₹15k', "Don't offer"], items: ['Single', '2-sharing', '3-sharing', '4-sharing', '5 or more'] },
      { id: 'B1.10', q: 'Food you serve', t: 'one', o: ['All 3 meals', '2 meals', 'Breakfast only', 'Optional add-on', 'No food'] },
      { id: 'B1.11', q: 'Kitchen', t: 'one', o: ['Own cook', 'Outside caterer', 'No kitchen'], when: a => a['B1.10'] !== 'No food' },
      { id: 'B1.12', q: 'Amenities you provide', t: 'all', o: ['Wi-Fi', 'AC rooms', 'Attached washrooms', 'Housekeeping', 'Washing machine', 'Power backup', 'RO water', 'Hot water', 'CCTV', 'Security guard', 'Lift', 'Gym', 'Parking', 'Biometric entry', 'Common room'], other: 1 },
      { id: 'B1.13', core: 1, q: 'Average occupancy in the last 12 months', t: 'one', o: ['Under 50%', '50–70%', '70–85%', '85–95%', 'Over 95%'] },
      { id: 'B1.14', q: 'Busiest months', t: 'all', o: MONTHS },
      { id: 'B1.15', q: 'Slowest months', t: 'all', o: MONTHS },
      { id: 'B1.16', q: 'How long do residents usually stay?', t: 'one', o: ['Under 3 months', '3–6 months', '6–12 months', '1–2 years', 'Longer'] },
      { id: 'B1.17', q: 'Your residents are mostly', t: 'one', o: ['Working', 'Students', 'Exam aspirants', 'Mixed'] },
      { id: 'B1.18', core: 1, q: 'Deposit you take', t: 'one', o: ['None', 'Under 1 month', '1 month', '2 months', 'More'] },
      { id: 'B1.19', q: 'Notice period', t: 'one', o: ['None', '7 days', '15 days', '30 days'] },
      { id: 'B1.20', q: 'Your token', t: 'one', o: ['No token', 'Refundable', 'Adjusted in rent', 'Non-refundable'] }
    ] },
    { id: 'B2', title: 'Finding residents', qs: [
      { id: 'B2.1', core: 1, q: 'Where do new residents come from?', t: 'grid', scale: ['None', 'Some', 'Most'], items: ['Walk-ins and boards', 'Referrals from residents', 'Google Maps', 'NoBroker, Housing, etc.', 'Brokers', 'Facebook or WhatsApp groups', 'Companies or colleges', 'Co-living brands or aggregators', 'Instagram', 'JustDial'] },
      { id: 'B2.2', core: 1, q: 'Do you pay brokers? How much per resident?', t: 'one', o: ['No', 'Under ₹1,000', '₹1,000–3,000', "Half a month's rent", "A month's rent"] },
      { id: 'B2.3', q: 'Monthly spend on getting residents (ads, listings, boards, brokers)', t: 'one', o: ['₹0', 'Under ₹2,000', '₹2,000–5,000', '₹5,000–10,000', 'Over ₹10,000'] },
      { id: 'B2.4', q: 'Paid listing apps you use now', t: 'all', o: ['NoBroker', 'Housing.com', 'MagicBricks', '99acres', 'JustDial', 'Google ads', 'None'], only: 'None', other: 1 },
      { id: 'B2.5', core: 1, q: 'How long does it take to fill an empty bed?', t: 'one', o: ['Under 3 days', 'About a week', 'About 2 weeks', 'About a month', 'Longer'] },
      { id: 'B2.6', q: 'Enquiries or visits needed for one resident', t: 'one', o: ['1–2', '3–5', '6–10', 'More than 10'] },
      { id: 'B2.7', q: 'How often do people pay a token and not turn up?', t: 'one', o: ['Often', 'Sometimes', 'Rarely', 'Never'] },
      { id: 'B2.8', q: 'Biggest problems filling beds', t: 'all', o: ['Time-wasting enquiries', 'Hard bargaining', 'Competition nearby', 'Bad online reviews', 'No-shows', 'Slow seasons', "Can't reach people outside Hyderabad"], other: 1 },
      { id: 'B2.9', core: 1, q: 'Would you list your PG on a free app?', t: 'one', o: YMN },
      { id: 'B2.10', q: 'What worries you about listing?', t: 'all', o: ['Commission', 'Pressure to cut rent', 'Unfair reviews', 'Fake bookings', 'Competitors seeing my data', 'Too much updating', 'Nothing'], only: 'Nothing', other: 1 },
      { id: 'B2.11', q: 'Would you like companies and colleges to send you residents?', t: 'one', o: YMN }
    ] },
    { id: 'B3', title: 'Bookings, visits and beds', qs: [
      { id: 'B3.1', q: 'How do you handle visits?', t: 'one', o: ['Walk in any time', 'By appointment', 'Only after a call'] },
      { id: 'B3.2', core: 1, q: 'How do you track which beds are free?', t: 'one', o: ['In my head', 'Register or notebook', 'Excel or Sheets', 'WhatsApp notes', 'Software or app'] },
      { id: 'B3.3', q: 'Have you double-booked a bed by mistake?', t: 'one', o: ['Never', 'Once', 'Several times'] },
      { id: 'B3.4', core: 1, q: 'Would you accept online bookings of an exact bed with a token?', t: 'one', o: YMN },
      { id: 'B3.5', q: 'Would you update bed availability in an app if it took under a minute a day?', t: 'one', o: YMN },
      { id: 'B3.6', core: 1, lead: "Move-in Guarantee: if a bed booked through the app doesn't match the listing, the resident gets a full refund.", q: 'Would you list under this rule?', t: 'one', o: ['Yes', 'Yes, if my listing is checked first', 'No'] },
      { id: 'B3.7', q: 'Would you agree that the app price is never higher than your walk-in price?', t: 'one', o: YMN },
      { id: 'B3.8', lead: 'Booking credit: if someone visits or holds a bed through the app and moves in within 60 days, it counts as an app booking.', q: 'How fair is that?', t: 'stars' },
      { id: 'B3.9', q: 'Would you hold a bed for someone moving in up to 15 days later?', t: 'one', o: ['Yes, with a token', 'Up to 7 days', 'No'] },
      { id: 'B3.10', q: 'Would you offer a paid trial night?', t: 'one', o: YMN }
    ] },
    { id: 'B4', title: 'New residents and records', qs: [
      { id: 'B4.1', q: 'Documents you collect', t: 'all', o: ['Aadhaar', 'PAN', 'Office or college ID', 'Photo', 'Police verification form', 'Parent contact', 'Offer letter', 'None'], only: 'None', other: 1 },
      { id: 'B4.2', q: 'Do you do police verification of residents?', t: 'one', o: ['Always', 'Sometimes', 'Never', 'Not sure how'] },
      { id: 'B4.3', core: 1, q: 'Where do you keep resident records?', t: 'one', o: ['Paper file or register', 'Photos on my phone', 'Excel', 'Software or app', 'Not kept'] },
      { id: 'B4.4', core: 1, q: 'Paperwork time for each new resident', t: 'one', o: ['Under 15 min', '15–30 min', '30–60 min', 'Over an hour'] },
      { id: 'B4.5', core: 1, q: 'How useful: the resident scans a QR at reception and fills in their own details and ID photo', t: 'stars' },
      { id: 'B4.6', q: 'How useful: a ready resident register to show the police', t: 'stars' },
      { id: 'B4.7', q: 'Do you give a written agreement or rules sheet?', t: 'one', o: ['Signed agreement', 'Rules sheet', 'Verbal only', 'Nothing'] },
      { id: 'B4.8', q: 'How useful: residents accept your rules in the app, with the date and time saved', t: 'stars' },
      { id: 'B4.9', q: "Has a resident left whom you couldn't trace later?", t: 'one', o: ['Never', 'Once', 'More than once'] },
      { id: 'B4.10', q: 'Would you prefer residents with a "Trusted resident" record?', t: 'one', o: ['Yes', "Doesn't matter"] }
    ] },
    { id: 'B5', title: 'Rent collection', qs: [
      { id: 'B5.1', core: 1, q: 'How do residents pay?', t: 'grid', scale: ['None', 'Some', 'Most'], items: ['Cash', 'UPI to personal number', 'Business UPI or QR', 'Bank transfer', 'Cheque', 'An app'] },
      { id: 'B5.2', q: 'When is rent due?', t: 'one', o: ['Same date for everyone', "Each resident's move-in date"], other: 1 },
      { id: 'B5.3', core: 1, q: 'Share of residents who pay late each month', t: 'one', o: ['Under 10%', '10–25%', '25–50%', 'Over 50%'] },
      { id: 'B5.4', q: 'How do you remind them?', t: 'all', o: ['Calls', 'WhatsApp', 'In person', 'Notice board', 'Staff remind them'], other: 1 },
      { id: 'B5.5', core: 1, q: 'Hours a month spent chasing rent', t: 'one', o: ['Under 2', '2–5', '5–10', 'Over 10'] },
      { id: 'B5.6', q: 'Late fee', t: 'one', o: ['None', 'Fixed amount', 'Per day', "Have one but don't charge it"] },
      { id: 'B5.7', q: 'Money lost to residents who left without paying (last 12 months)', t: 'one', o: ['None', 'Under ₹10,000', '₹10,000–50,000', 'Over ₹50,000'] },
      { id: 'B5.8', q: 'Do you give rent receipts?', t: 'one', o: ['Always', 'When asked', 'Never'] },
      { id: 'B5.9', core: 1, q: 'For each tool: must have, nice to have, or don\'t need?', t: 'grid', scale: MUST, items: ['Automatic reminders', 'UPI AutoPay', 'Automatic late fees', 'Automatic receipts', 'Who-has-paid list', 'Electricity bill split'] },
      { id: 'B5.10', core: 1, lead: 'A payment company (like Razorpay) collects rent and sends it to your bank the next day. It asks for your bank account and PAN once.', q: 'Would you take payments this way?', t: 'one', o: ['Yes', 'Need to know more', 'No, direct UPI only'] },
      { id: 'B5.11', q: 'How fast must the money reach your bank?', t: 'one', o: ['Same day', 'Next day', 'Within a week'] },
      { id: 'B5.12', q: 'Would you accept card payments if the resident pays the extra fee?', t: 'one', o: ['Yes', 'No'] }
    ] },
    { id: 'B6', title: 'Deposits and move-outs', qs: [
      { id: 'B6.1', q: 'When do you usually refund deposits?', t: 'one', o: ['Same day', 'Within a week', '2–4 weeks', 'Longer', "Adjusted in the last month's rent"] },
      { id: 'B6.2', q: 'Common reasons for cutting deposits', t: 'all', o: ['Damage', 'Cleaning', 'Notice not served', 'Unpaid bills', 'Lost keys', 'None'], only: 'None', other: 1 },
      { id: 'B6.3', q: 'How often are there arguments over deposits?', t: 'one', o: ['Often', 'Sometimes', 'Rarely'] },
      { id: 'B6.4', q: 'Do you use a move-in and move-out checklist?', t: 'one', o: ['Yes, with photos', 'Yes, written', 'No'] },
      { id: 'B6.5', core: 1, lead: 'Deposit Promise: refund within 7 days of move-out, with your refund record shown on your listing.', q: 'Would you agree to this?', t: 'one', o: ['Yes', 'With conditions', 'No'] },
      { id: 'B6.6', q: 'Would you take a smaller deposit from residents with a "Trusted resident" record?', t: 'one', o: YMN },
      { id: 'B6.7', q: 'How often do residents leave without serving notice?', t: 'one', o: ['Often', 'Sometimes', 'Rarely'] },
      { id: 'B6.8', lead: "Swap: a resident who leaves early doesn't pay the notice penalty if their bed is booked through the app.", q: 'Would you agree to this?', t: 'one', o: YMN }
    ] },
    { id: 'B7', title: 'Daily running', qs: [
      { id: 'B7.1', q: 'Staff you have', t: 'all', o: ['Cook', 'Cleaner', 'Warden', 'Security guard', 'Manager', 'Maintenance person', 'None'], only: 'None', other: 1 },
      { id: 'B7.2', q: 'How do you give staff instructions and check their work?', t: 'one', o: ['In person', 'WhatsApp', 'Phone calls', 'Register', 'Not really tracked'] },
      { id: 'B7.3', q: 'How do residents send complaints?', t: 'one', o: ['In person', 'Calls', 'WhatsApp', 'Complaint book'] },
      { id: 'B7.4', q: 'Average time to fix a complaint', t: 'one', o: ['Same day', '1–2 days', '3–7 days', 'Longer'] },
      { id: 'B7.5', q: 'Most common complaints', t: 'all', o: ['Food', 'Water', 'Wi-Fi', 'Cleaning', 'Plumbing', 'Electrical', 'Noise', 'Roommates', 'Pests'], other: 1 },
      { id: 'B7.6', core: 1, q: 'How much food is wasted?', t: 'one', o: ['Very little', 'Some', 'A lot'], when: a => a['B1.10'] !== 'No food' },
      { id: 'B7.7', q: 'If residents marked meal skips in advance, how much could you save a month?', t: 'one', o: ['Nothing', 'Under ₹2,000', '₹2,000–5,000', '₹5,000–10,000', 'Over ₹10,000'], when: a => a['B1.10'] !== 'No food' },
      { id: 'B7.8', q: 'How often does your menu change?', t: 'one', o: ['Fixed weekly menu', 'Changes often', 'No fixed menu'], when: a => a['B1.10'] !== 'No food' },
      { id: 'B7.9', q: 'How do you send notices?', t: 'all', o: ['WhatsApp group', 'Notice board', 'Word of mouth'], other: 1 },
      { id: 'B7.10', q: 'Your rules for late entry, nights out and guests', t: 'all', o: ['Late entry needs approval', 'Night out needs approval', 'Day guests allowed', 'No guests', 'No rules'], only: 'No rules' },
      { id: 'B7.11', q: 'How do you charge electricity?', t: 'one', o: ['Included in rent', 'Meter per room', 'Split equally', 'AC rooms only'] },
      { id: 'B7.12', q: 'How useful: one app for complaints, food counts, notices and requests', t: 'stars' }
    ] },
    { id: 'B8', title: 'Costs and profit', qs: [
      { id: 'B8.1', q: 'Your biggest monthly costs', t: 'top3', o: ['Building rent or loan EMI', 'Food and groceries', 'Staff salaries', 'Electricity', 'Water or tankers', 'Wi-Fi', 'Repairs', 'Brokers and ads', 'Taxes and licences', 'Laundry'] },
      { id: 'B8.2', core: 1, q: 'Do you know your monthly profit for each property?', t: 'one', o: ['Exactly', 'Roughly', 'Not really'] },
      { id: 'B8.3', core: 1, q: 'How do you track expenses?', t: 'one', o: ['Notebook', 'Excel or Sheets', 'Accountant', 'Software or app', 'Not tracked'] },
      { id: 'B8.4', q: 'How useful: profit per property each month, with a 6-month chart', t: 'stars' },
      { id: 'B8.5', q: 'Would monthly statements for your accountant (income tax) help?', t: 'one', o: ['Yes', 'No'] },
      { id: 'B8.6', lead: 'Optional. Your answer stays private.', q: 'Registrations your PG has', t: 'all', o: ['GHMC trade licence', 'Fire NOC', 'Food licence (FSSAI)', 'GST', 'Police intimation', 'None', 'Prefer not to say'], only: 'Prefer not to say' },
      { id: 'B8.7', q: 'Would reminders before licence renewals help?', t: 'one', o: ['Yes', 'No'] }
    ] },
    { id: 'B9', title: 'Phones and software', qs: [
      { id: 'B9.1', q: 'Your phone', t: 'one', o: ['Android', 'iPhone', 'Basic phone'] },
      { id: 'B9.2', q: 'Who does the phone and computer work for the PG?', t: 'one', o: ['Me', 'A family member', 'Manager', 'Staff'] },
      { id: 'B9.3', q: 'Apps you use for the business now', t: 'all', o: ['WhatsApp', 'WhatsApp Business', 'Excel or Google Sheets', 'Tally', 'A PG management app', 'Listing apps', 'None'], only: 'None', other: 1 },
      { id: 'B9.4', q: 'Have you tried a PG management app?', t: 'one', o: ['Using one now', 'Tried and stopped', 'Never'] },
      { id: 'B9.5', q: 'Why did you stop?', t: 'all', o: ['Too complicated', 'Too expensive', "Residents didn't use it", "Staff couldn't use it", 'Missing features', 'Language'], other: 1, when: a => a['B9.4'] === 'Tried and stopped' },
      { id: 'B9.6', q: 'How comfortable are you with apps?', t: 'stars' },
      { id: 'B9.7', q: 'Language you prefer', t: 'one', o: ['English', 'Telugu', 'Hindi'], other: 1 },
      { id: 'B9.8', q: 'Do you use a laptop or computer for the business?', t: 'one', o: ['Daily', 'Sometimes', 'Never'] }
    ] },
    { id: 'B10', title: 'Reviews, star levels and verification', qs: [
      { id: 'B10.1', core: 1, q: 'How do you feel about public ratings only from real residents?', t: 'stars', lo: 'Against', hi: 'Welcome' },
      { id: 'B10.2', q: 'Your concerns about ratings', t: 'all', o: ['Unfair angry reviews', 'Competitors', 'Ex-residents with grudges', 'Nothing'], only: 'Nothing', other: 1 },
      { id: 'B10.3', q: 'Would you reply to reviews?', t: 'one', o: ['Yes', 'Sometimes', 'No'] },
      { id: 'B10.4', core: 1, lead: 'Star level: ★ to ★★★★★ based on your facilities.', q: 'Would you like a star level for your PG?', t: 'one', o: YMN },
      { id: 'B10.5', q: 'Would you allow a verification visit (photos, checklist) for a "Verified" badge?', t: 'one', o: YMN },
      { id: 'B10.6', q: 'Would you pay for that visit?', t: 'one', o: ['Only if free', 'Up to ₹500', 'Up to ₹1,000', 'Up to ₹2,000'] },
      { id: 'B10.7', q: 'Would you add facilities to reach a higher star level?', t: 'one', o: YMN }
    ] },
    { id: 'B11', title: 'Features: what matters to you', qs: [
      { id: 'B11.1', core: 1, q: 'For each feature: must have, nice to have, or don\'t need?', t: 'grid', scale: MUST, items: featureNames(O_FEATURES) },
      { id: 'B11.2', core: 1, q: 'Your top 3 features', t: 'top3', o: (a, mode) => featureNames(O_FEATURES)(mode) },
      { id: 'B11.3', q: 'Anything missing?', t: 'text' },
      { id: 'B11.4', q: 'What would make you stop using an app like this?', t: 'all', o: ['Too much data entry', "Residents won't use it", "Staff can't use it", 'Costs too much', 'Nothing'], only: 'Nothing', other: 1 }
    ] },
    { id: 'B12', title: "Pricing: what you'd pay", lead: 'These are ideas; nothing is decided.', qs: [
      { id: 'B12.1', core: 1, q: 'Which way of paying would you prefer?', t: 'one', o: ['Free basic plan + paid extras', 'Fixed monthly fee', 'Fee only when the app brings a resident', 'Per bed per month', 'One-time setup fee'] },
      { id: 'B12.2', core: 1, q: 'A fair fee for each resident the app brings you', t: 'one', o: ['Nothing', '₹499', '₹999', '₹1,499', '5% of first month', '10% of first month', "15 days' rent"] },
      { id: 'B12.3', core: 1, q: 'A fair monthly fee for the full owner tools (rent, complaints, food, profit, staff)', t: 'one', o: ['Nothing', 'Up to ₹499', '₹500–999', '₹1,000–1,999', '₹2,000–2,999', '₹3,000 or more'] },
      { id: 'B12.4', q: 'Or per bed per month', t: 'one', o: ['₹10', '₹20', '₹30', '₹50', "Wouldn't pay per bed"] },
      { id: 'B12.5', lead: 'Think about the full owner tools: rent, complaints, food, profit and staff.', q: "At what monthly price would they seem so cheap you'd doubt them?", t: 'num', unit: '₹' },
      { id: 'B12.6', q: 'At what monthly price would they be a good deal?', t: 'num', unit: '₹' },
      { id: 'B12.7', q: 'At what monthly price would they be getting expensive, but still worth thinking about?', t: 'num', unit: '₹' },
      { id: 'B12.8', q: 'At what monthly price would they be too expensive to consider?', t: 'num', unit: '₹' },
      { id: 'B12.9', q: 'Would you pay to appear at the top of search in busy months?', t: 'one', o: ['No', 'Up to ₹500 a week', '₹500–1,000 a week', 'Over ₹1,000 a week'] },
      { id: 'B12.10', q: "Free trial you'd need before paying", t: 'one', o: ['1 month', '3 months', '6 months', "Only if it's free forever"] },
      { id: 'B12.11', q: 'Who should pay the extra fee when a resident pays by card?', t: 'one', o: ['Resident', 'Me', 'Split'] },
      { id: 'B12.12', q: 'Would you like the app to pay your warden ₹50 for each resident added in it?', t: 'one', o: ['Yes', "Doesn't matter", 'No'] },
      { id: 'B12.13', q: 'What would make you switch from how you work today?', t: 'text' }
    ] },
    { id: 'B13', title: 'Wrap-up', qs: [
      { id: 'B13.1', core: 1, q: 'How likely are you to try an app like this?', t: 'nps' },
      { id: 'B13.2', core: 1, q: 'The biggest problem you want solved', t: 'text' },
      { id: 'B13.3', core: 1, q: 'Would you be one of the first PGs on the app (free during the pilot)?', t: 'one', o: ['Yes', 'Maybe', 'No'], ask: { Yes: ['phone'] }, flag: 'pilot' },
      { id: 'B13.4', q: 'Can we visit to take photos and a 360° tour?', t: 'one', o: ['Yes', 'Later', 'No'] },
      { id: 'B13.5', q: 'Would you ask your residents to join the app?', t: 'one', o: ['Yes, all of them', 'Some', 'No'] },
      { id: 'B13.6', q: 'Would you, your staff or residents test the app before launch?', t: 'one', o: ['Yes', 'No'], ask: { Yes: ['gmail'] }, flag: 'testing' },
      { id: 'B13.7', q: 'Other owners we should talk to? (optional)', t: 'text', toContact: 'note' }
    ] }
  ];

  window.SURVEY = {
    version: 2,
    resident: { title: 'Hostel & PG stay survey', minutes: { core: 5 }, required: true, payout: 25, sections: resident },
    owner: { title: 'PG owner survey', minutes: { core: 20, full: 45 }, sections: owner }
  };
})();
