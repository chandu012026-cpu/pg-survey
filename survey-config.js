// Connection details for the survey pages. The key is a publishable key: it is safe in a web page, and the
// database's own rules decide what it can do (send a survey; nothing else without the admin login).
window.SURVEY_CONFIG = {
  url: "https://ujhfwxzfwruyphiyqtns.supabase.co",
  key: "sb_publishable_ahkDT6CKyJ4H7ur_bgsOeg_8Db8HvSs",
  // Optional: an email or WhatsApp number shown to people with questions about the survey or their ₹25.
  // Leave it empty to show nothing.
  contact: ""
};
