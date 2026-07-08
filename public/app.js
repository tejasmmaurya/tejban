const form = document.getElementById("ideaForm");
const button = document.getElementById("generateButton");
const resultsPanel = document.getElementById("resultsPanel");
const resultGrid = document.getElementById("resultGrid");
const summaryGrid = document.getElementById("summaryGrid");

const downloadJson = document.getElementById("downloadJson");
const downloadBusinessPdf = document.getElementById("downloadBusinessPdf");
const downloadPitchPdf = document.getElementById("downloadPitchPdf");
const exportPremiumPdfBtn = document.getElementById("export-premium-pdf");
const saveProject = document.getElementById("saveProject");
const loadHistory = document.getElementById("loadHistory");
const loadFeed = document.getElementById("loadFeed");
const historyPanel = document.getElementById("historyPanel");
const historyList = document.getElementById("historyList");
const feedPanel = document.getElementById("feedPanel");
const feedList = document.getElementById("feedList");
const generateLandingCodeBtn = document.getElementById("generateLandingCode");
const landingCodePanel = document.getElementById("landingCodePanel");
const landingHtmlOutput = document.getElementById("landingHtmlOutput");
const landingReactOutput = document.getElementById("landingReactOutput");
const landingPreviewFrame = document.getElementById("landingPreviewFrame");
const openPreviewTab = document.getElementById("openPreviewTab");
const tabPreview = document.getElementById("tabPreview");
const tabHtml = document.getElementById("tabHtml");
const tabReact = document.getElementById("tabReact");
const panelPreview = document.getElementById("panelPreview");
const panelHtml = document.getElementById("panelHtml");
const panelReact = document.getElementById("panelReact");
const copyHtmlBtn = document.getElementById("copyHtmlBtn");
const copyReactBtn = document.getElementById("copyReactBtn");
const deployNetlifyBtn = document.getElementById("deployNetlify");
const deployVercelBtn = document.getElementById("deployVercel");
const actionMessage = document.getElementById("actionMessage");
const authToast = document.getElementById("authToast");
const authToastText = document.getElementById("authToastText");
const authToastLogin = document.getElementById("authToastLogin");
const authToastDismiss = document.getElementById("authToastDismiss");

const authStatus = document.getElementById("authStatus");
const authEmail = document.getElementById("authEmail");
const authPassword = document.getElementById("authPassword");
const authFullName = document.getElementById("authFullName");
const authDateOfBirth = document.getElementById("authDateOfBirth");
const authHeadline = document.getElementById("authHeadline");
const authWebsite = document.getElementById("authWebsite");
const authBio = document.getElementById("authBio");
const authAcceptTerms = document.getElementById("authAcceptTerms");
const authAcceptSafety = document.getElementById("authAcceptSafety");
const signUpBtn = document.getElementById("signUpBtn");

// Chatbot DOM Elements
const chatToggle = document.getElementById("chatToggle");
const chatBox = document.getElementById("chatBox");
const chatClose = document.getElementById("chatClose");
const chatInput = document.getElementById("chatInput");
const chatSend = document.getElementById("chatSend");
const chatMessages = document.getElementById("chatMessages");

// Toggle chat logic
if (chatToggle) {
  chatToggle.addEventListener("click", () => {
    chatBox.hidden = !chatBox.hidden;
  });
}
if (chatClose) {
  chatClose.addEventListener("click", () => {
    chatBox.hidden = true;
  });
}

// Chat sending logic
async function handleChatSend() {
  if (!chatInput || !chatMessages) return;
  const text = chatInput.value.trim();
  if (!text) return;

  // Render User Message
  const userMsg = document.createElement("div");
  userMsg.className = "chat-msg chat-user";
  userMsg.textContent = text;
  chatMessages.appendChild(userMsg);
  chatInput.value = "";
  chatMessages.scrollTop = chatMessages.scrollHeight;

  // Add typing indicator
  const loadMsg = document.createElement("div");
  loadMsg.className = "chat-msg chat-tejas";
  loadMsg.textContent = "Tejas is typing...";
  chatMessages.appendChild(loadMsg);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  try {
    const formData = Object.fromEntries(new FormData(document.getElementById("ideaForm")).entries());
    const hasData = formData.startupIdea && formData.industry;

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: text,
        context: hasData ? formData : null
      })
    });
    const data = await res.json();
    loadMsg.innerHTML = String(data.reply).replace(/\\n/g, '<br>') || "Sorry, I encountered an error.";
  } catch (err) {
    loadMsg.textContent = "Error connecting to Tejas AI server.";
  }
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

if (chatSend) chatSend.addEventListener("click", handleChatSend);
if (chatInput) {
  chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleChatSend();
  });
}
const signInBtn = document.getElementById("signInBtn");
const signOutBtn = document.getElementById("signOutBtn");
const resetPasswordBtn = document.getElementById("resetPasswordBtn");
const authPolicyHint = document.getElementById("authPolicyHint");
const authFeedback = document.getElementById("authFeedback");
const authModeSignIn = document.getElementById("authModeSignIn");
const authModeSignUp = document.getElementById("authModeSignUp");
const authSignupSection = document.getElementById("authSignupSection");
const authModal = document.getElementById("authModal");
const openAuthModal = document.getElementById("openAuthModal");
const closeAuthModal = document.getElementById("closeAuthModal");
const authBackdrop = document.getElementById("authBackdrop");
const profileAvatarButton = document.getElementById("profileAvatarButton");
const profileMenu = document.getElementById("profileMenu");
const openProfilePanel = document.getElementById("openProfilePanel");
const openAuthFromMenu = document.getElementById("openAuthFromMenu");
const profilePanel = document.getElementById("profilePanel");
const profileBackdrop = document.getElementById("profileBackdrop");
const closeProfilePanel = document.getElementById("closeProfilePanel");
const profileEmail = document.getElementById("profileEmail");
const profileContent = document.getElementById("profileContent");
const profileGeneralTab = document.getElementById("profileGeneralTab");
const profileAccountTab = document.getElementById("profileAccountTab");
const profilePrivacyTab = document.getElementById("profilePrivacyTab");
const profileTermsTab = document.getElementById("profileTermsTab");
const profileDeactivateTab = document.getElementById("profileDeactivateTab");
const profileDeleteTab = document.getElementById("profileDeleteTab");
const profileNotificationsTab = document.getElementById("profileNotificationsTab");
const profileApiUsageTab = document.getElementById("profileApiUsageTab");

const loadingOverlay = document.getElementById("loadingOverlay");
const loadingText = document.getElementById("loadingText");
const startupSplash = document.getElementById("startupSplash");

let currentBlueprint = null;
let lastIdeaInput = null;
let currentLandingCode = null;
let supabaseClient = null;
let deployConfig = { hasNetlifyDeployHook: false, hasVercelDeployHook: false };
let authPolicy = {
  passwordMinLength: 8,
  requireEmailConfirmation: true,
  redirectUrl: window.location.origin,
  requiredProfileFields: ["full_name", "date_of_birth", "headline", "bio"],
  twoStepOptions: ["email", "authenticator_app"],
  termsVersion: "2026-03-11"
};
let currentUser = null;
let activeProfileTab = "general";
let authToastTimer = null;
let authMode = "signin";
const AUTH_FIELD_LABELS = {
  full_name: "full name",
  date_of_birth: "date of birth",
  headline: "headline",
  bio: "bio"
};

const STATS_KEY = "tejban:stats";
let sessionStartTime = Date.now();

function getStats() {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    return raw ? JSON.parse(raw) : { blueprints: 0, landingCodes: 0, sessions: 0, totalTime: 0 };
  } catch {
    return { blueprints: 0, landingCodes: 0, sessions: 0, totalTime: 0 };
  }
}

function saveStats(s) {
  try { localStorage.setItem(STATS_KEY, JSON.stringify(s)); } catch { /* ignore */ }
}

function trackStat(key) {
  const s = getStats();
  s[key] = (s[key] || 0) + 1;
  saveStats(s);
}

function flushSessionTime() {
  const s = getStats();
  s.totalTime = (s.totalTime || 0) + (Date.now() - sessionStartTime);
  saveStats(s);
  sessionStartTime = Date.now();
}

function getNotificationPrefs() {
  try { return JSON.parse(localStorage.getItem("tejban:notifications") || "{}"); } catch { return {}; }
}

function saveNotificationPrefs(prefs) {
  try { localStorage.setItem("tejban:notifications", JSON.stringify(prefs)); } catch { /* ignore */ }
}

const PROFILE_CACHE_PREFIX = "tejban:profile:";
const profileTabButtons = {
  general: profileGeneralTab,
  account: profileAccountTab,
  notifications: profileNotificationsTab,
  apiUsage: profileApiUsageTab,
  privacy: profilePrivacyTab,
  terms: profileTermsTab,
  deactivate: profileDeactivateTab,
  delete: profileDeleteTab
};

const profileSections = {
  privacy: {
    title: "Privacy",
    copy: "Saved projects are scoped to the authenticated user and filtered through Supabase row level security.",
    items: ["Only your own projects are listed", "Authenticated access required for history", "Email confirmation can be enforced before protected actions"]
  },
  terms: {
    title: "Terms and Conditions",
    copy: "Use the generated business content responsibly. Validate AI-generated business, legal, and market claims before publishing or fundraising.",
    items: ["AI outputs should be reviewed", "External deployment hooks should be protected", "Sensitive credentials should stay in .env only"]
  },
  delete: {
    title: "Delete Account",
    copy: "Permanent account deletion is not automated in this client yet to avoid destructive mistakes.",
    items: ["Rotate and remove your data carefully", "Delete records from Supabase dashboard if needed", "Add a protected server-side delete flow before enabling this publicly"]
  }
};

const sections = [
  { key: "meta", title: "Generation Meta" },
  { key: "dnaScore", title: "🧬 Startup DNA Score" },
  { key: "realityCheck", title: "🧠 Reality Check AI" },
  { key: "validation", title: "Startup Idea Validation" },
  { key: "marketAnalysis", title: "Market Analysis" },
  { key: "businessPlan", title: "Business Plan" },
  { key: "branding", title: "Name + Branding" },
  { key: "landingPage", title: "Landing Page Copy" },
  { key: "marketingPlan", title: "Marketing Plan" },
  { key: "first100UsersPlan", title: "🎯 First 100 Users Plan" },
  { key: "monetizationHelper", title: "💰 Monetization Helper" },
  { key: "revenueModel", title: "Revenue Model" },
  { key: "pitchDeck", title: "Investor Pitch Deck" }
];

function showMessage(msg, isError = false) {
  actionMessage.textContent = msg;
  actionMessage.style.color = isError ? "#b91c1c" : "#0a7f5a";
}

function setAuthFeedback(message = "", isError = true) {
  if (!authFeedback) return;

  if (!message) {
    authFeedback.hidden = true;
    authFeedback.textContent = "";
    authFeedback.classList.remove("is-success");
    return;
  }

  authFeedback.hidden = false;
  authFeedback.textContent = message;
  authFeedback.classList.toggle("is-success", !isError);
}

function hideAuthRequiredToast() {
  if (!authToast) return;
  authToast.classList.remove("is-visible");
  setTimeout(() => {
    authToast.hidden = true;
  }, 200);
}

function showAuthRequiredToast(message = "Authentication required to continue.") {
  if (!authToast || !authToastText) return;
  authToastText.textContent = message;
  authToast.hidden = false;
  requestAnimationFrame(() => {
    authToast.classList.add("is-visible");
  });

  if (authToastTimer) {
    clearTimeout(authToastTimer);
  }
  authToastTimer = setTimeout(() => {
    hideAuthRequiredToast();
  }, 5000);
}

function setHeaderAvatar(user) {
  profileAvatarButton.innerHTML = "";

  if (!user) {
    profileAvatarButton.textContent = "T";
    return;
  }

  const avatarUrl = user?.user_metadata?.avatar_url;
  if (avatarUrl) {
    const img = document.createElement("img");
    img.src = avatarUrl;
    img.alt = "Profile";
    profileAvatarButton.appendChild(img);
    return;
  }

  const seed = (user.email || "T").trim().charAt(0).toUpperCase() || "T";
  profileAvatarButton.textContent = seed;
}

function getProfileCacheKey(userId) {
  return `${PROFILE_CACHE_PREFIX}${userId}`;
}

function loadCachedProfile(userId) {
  try {
    const raw = localStorage.getItem(getProfileCacheKey(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveCachedProfile(userId, profile) {
  try {
    localStorage.setItem(getProfileCacheKey(userId), JSON.stringify(profile));
  } catch {
    // Ignore storage write failures.
  }
}

function normalizeProfile(user, cached = {}) {
  const meta = user?.user_metadata || {};
  return {
    fullName: meta.full_name || cached.fullName || "",
    dateOfBirth: meta.date_of_birth || cached.dateOfBirth || "",
    headline: meta.headline || cached.headline || "",
    website: meta.website || cached.website || "",
    bio: meta.bio || cached.bio || "",
    avatarUrl: meta.avatar_url || cached.avatarUrl || "",
    twoStepPreference: meta.two_step_preference || cached.twoStepPreference || "",
    termsAcceptedAt: meta.terms_accepted_at || cached.termsAcceptedAt || "",
    safetyAcknowledgedAt: meta.safety_acknowledged_at || cached.safetyAcknowledgedAt || "",
    termsVersion: meta.terms_version || cached.termsVersion || ""
  };
}

function getSelectedTwoStepPreference() {
  const selected = document.querySelector('input[name="authTwoStep"]:checked');
  return selected instanceof HTMLInputElement ? selected.value : "";
}

function readSignUpProfileInputs() {
  return {
    fullName: authFullName.value.trim(),
    dateOfBirth: authDateOfBirth.value,
    headline: authHeadline.value.trim(),
    website: authWebsite.value.trim(),
    bio: authBio.value.trim(),
    twoStepPreference: getSelectedTwoStepPreference(),
    acceptedTerms: !!authAcceptTerms.checked,
    acceptedSafety: !!authAcceptSafety.checked
  };
}

function getMissingProfileFields(profile) {
  const mapping = {
    full_name: profile.fullName,
    date_of_birth: profile.dateOfBirth,
    headline: profile.headline,
    bio: profile.bio
  };

  return (authPolicy.requiredProfileFields || []).filter((field) => !String(mapping[field] || "").trim());
}

function formatMissingProfileFields(fields) {
  return fields.map((field) => AUTH_FIELD_LABELS[field] || field).join(", ");
}

function getEligibilityState(user = currentUser) {
  if (!user) {
    return { isEligible: false, reason: "Sign in to continue.", action: "auth" };
  }

  if (authPolicy.requireEmailConfirmation && !user.email_confirmed_at) {
    return { isEligible: false, reason: "Verify your email before generating results.", action: "auth" };
  }

  const profile = normalizeProfile(user, loadCachedProfile(user.id) || {});
  const missingFields = getMissingProfileFields(profile);

  if (missingFields.length > 0) {
    return {
      isEligible: false,
      reason: `Complete your profile before continuing. Missing: ${formatMissingProfileFields(missingFields)}.`,
      action: "profile"
    };
  }

  if (!profile.termsAcceptedAt || !profile.safetyAcknowledgedAt || profile.termsVersion !== authPolicy.termsVersion) {
    return {
      isEligible: false,
      reason: "Accept the latest safety terms and conditions in your account before continuing.",
      action: "auth"
    };
  }

  if (!profile.twoStepPreference) {
    return {
      isEligible: false,
      reason: "Choose a 2-step verification preference in Account Security before continuing.",
      action: "profile-account"
    };
  }

  return { isEligible: true, reason: "", action: "ok" };
}

function requireEligibleUserForAction(actionLabel) {
  const eligibility = getEligibilityState();
  if (eligibility.isEligible) return true;

  if (!currentUser) {
    showAuthRequiredToast(`Authentication required: ${actionLabel}.`);
    setAuthModalOpen(true);
    return false;
  }

  showMessage(eligibility.reason, true);
  if (eligibility.action === "profile") {
    renderProfileSection("general");
    setProfilePanelOpen(true);
  } else if (eligibility.action === "profile-account") {
    renderProfileSection("account");
    setProfilePanelOpen(true);
  } else {
    setAuthModalOpen(true);
  }
  return false;
}

function syncBodyLock() {
  const hasModalOpen = !authModal.hidden || !profilePanel.hidden;
  document.body.classList.toggle("splash-active", hasModalOpen);
}

function setActiveProfileTab(tabKey) {
  activeProfileTab = tabKey;
  Object.entries(profileTabButtons).forEach(([key, element]) => {
    element.classList.toggle("is-active", key === tabKey);
  });
}

function setAuthModalOpen(isOpen) {
  authModal.hidden = !isOpen;
  if (isOpen) {
    setAuthMode("signin");
    setAuthFeedback("");
  }
  syncBodyLock();
}

function setAuthMode(mode) {
  authMode = mode === "signup" ? "signup" : "signin";
  const signInMode = authMode === "signin";

  if (currentUser) {
    const displayName = currentUser.user_metadata?.full_name || currentUser.email.split("@")[0];
    authModal.classList.add("is-authenticated");
    authModal.classList.remove("is-signin", "is-signup");
    authModeSignIn.classList.remove("is-active");
    authModeSignIn.setAttribute("aria-selected", "false");
    authModeSignUp.classList.remove("is-active");
    authModeSignUp.setAttribute("aria-selected", "false");

    authSignupSection.hidden = true;
    signInBtn.hidden = true;
    signUpBtn.hidden = true;
    resetPasswordBtn.hidden = true;
    signOutBtn.hidden = false;
    authPolicyHint.textContent = `You are signed in as ${displayName}. Use Sign Out to switch accounts.`;
    return;
  }

  authModal.classList.remove("is-authenticated");
  authModal.classList.toggle("is-signin", signInMode);
  authModal.classList.toggle("is-signup", !signInMode);

  authModeSignIn.classList.toggle("is-active", signInMode);
  authModeSignIn.setAttribute("aria-selected", String(signInMode));
  authModeSignUp.classList.toggle("is-active", !signInMode);
  authModeSignUp.setAttribute("aria-selected", String(!signInMode));

  authSignupSection.hidden = signInMode;
  signInBtn.hidden = !signInMode;
  resetPasswordBtn.hidden = !signInMode;
  signUpBtn.hidden = signInMode;

  if (signInMode) {
    authPolicyHint.textContent = "Sign in with your email and password.";
  } else {
    authPolicyHint.textContent = `Password min: ${authPolicy.passwordMinLength} chars. Email confirmation: ${authPolicy.requireEmailConfirmation ? "required" : "optional"}. Terms version: ${authPolicy.termsVersion}.`;
  }
}

function setProfilePanelOpen(isOpen) {
  profilePanel.hidden = !isOpen;
  syncBodyLock();
}

function setProfileMenuOpen(isOpen) {
  profileMenu.hidden = !isOpen;
}

function syncAuthButtons(user) {
  signOutBtn.disabled = !user;
  signInBtn.disabled = !!user;
  signUpBtn.disabled = !!user;
  resetPasswordBtn.disabled = !!user;
  openAuthModal.textContent = user ? "Account" : "Login";
  openAuthModal.hidden = !!user;
  profileAvatarButton.hidden = !user;
  setHeaderAvatar(user);

  if (user) {
    const displayName = user.user_metadata?.full_name || user.email.split("@")[0];
    authModal.classList.add("is-authenticated");
    authSignupSection.hidden = true;
    signInBtn.hidden = true;
    signUpBtn.hidden = true;
    resetPasswordBtn.hidden = true;
    signOutBtn.hidden = false;
    authPolicyHint.textContent = `You are signed in as ${displayName}. Use Sign Out to switch accounts.`;
    return;
  }

  authModal.classList.remove("is-authenticated");
  setAuthMode(authMode);
}

function renderProfileSection(sectionKey) {
  setActiveProfileTab(sectionKey);

  if (sectionKey === "general") {
    renderGeneralSettingsSection();
    return;
  }

  if (sectionKey === "account") {
    renderAccountSecuritySection();
    return;
  }

  if (sectionKey === "notifications") {
    renderNotificationsSection();
    return;
  }

  if (sectionKey === "apiUsage") {
    renderApiUsageSection();
    return;
  }

  if (sectionKey === "deactivate") {
    renderDeactivateSection();
    return;
  }

  if (sectionKey === "delete") {
    if (!currentUser) {
      profileContent.innerHTML = "";
      const copy = document.createElement("p");
      copy.className = "profile-section-copy";
      copy.textContent = "Sign in to access delete-account controls.";
      profileContent.appendChild(copy);
      return;
    }
    renderDeleteAccountSection();
    return;
  }

  const section = profileSections[sectionKey];
  if (!section) return;

  profileContent.innerHTML = "";
  const title = document.createElement("h3");
  title.className = "profile-section-title";
  title.textContent = section.title;

  const copy = document.createElement("p");
  copy.className = "profile-section-copy";
  copy.textContent = section.copy;

  const list = document.createElement("ul");
  list.className = "profile-list";
  section.items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    list.appendChild(li);
  });

  profileContent.appendChild(title);
  profileContent.appendChild(copy);
  profileContent.appendChild(list);
}

async function renderGeneralSettingsSection() {
  profileContent.innerHTML = "";

  const title = document.createElement("h3");
  title.className = "profile-section-title";
  title.textContent = "General Settings";
  profileContent.appendChild(title);

  if (!currentUser) {
    const copy = document.createElement("p");
    copy.className = "profile-section-copy";
    copy.textContent = "Sign in to edit your name, date of birth, and profile details.";

    const signInButton = document.createElement("button");
    signInButton.type = "button";
    signInButton.className = "btn-primary";
    signInButton.textContent = "Open Login";
    signInButton.addEventListener("click", () => {
      setProfilePanelOpen(false);
      setAuthModalOpen(true);
    });

    profileContent.appendChild(copy);
    profileContent.appendChild(signInButton);
    return;
  }

  const cachedProfile = loadCachedProfile(currentUser.id) || {};
  const profile = normalizeProfile(currentUser, cachedProfile);

  const description = document.createElement("p");
  description.className = "profile-section-copy";
  description.textContent = "Changes are saved to Supabase user metadata and cached locally for faster reloads. Full name, date of birth, headline, and bio are required before generation is allowed.";
  profileContent.appendChild(description);

  const formEl = document.createElement("form");
  formEl.className = "profile-settings-form";

  const grid = document.createElement("div");
  grid.className = "profile-settings-grid";

  const fields = [
    { key: "fullName", label: "Full Name", type: "text", placeholder: "Tejas Kumar" },
    { key: "dateOfBirth", label: "Date of Birth", type: "date", placeholder: "" },
    { key: "headline", label: "Headline", type: "text", placeholder: "Founder at TejBan" },
    { key: "website", label: "Website", type: "url", placeholder: "https://example.com" },
    { key: "bio", label: "Bio", type: "text", placeholder: "Short intro about yourself" }
  ];

  const inputs = {};

  fields.forEach((field) => {
    const labelEl = document.createElement("label");
    labelEl.textContent = field.label;

    const inputEl = document.createElement("input");
    inputEl.type = field.type;
    inputEl.placeholder = field.placeholder;
    inputEl.value = profile[field.key] || "";
    if (field.key === "dateOfBirth") {
      inputEl.max = new Date().toISOString().split("T")[0];
    }

    labelEl.appendChild(inputEl);
    grid.appendChild(labelEl);
    inputs[field.key] = inputEl;
  });

  const avatarSettings = document.createElement("div");
  avatarSettings.className = "avatar-settings";

  const avatarPreview = document.createElement("div");
  avatarPreview.className = "avatar-preview";

  const paintAvatarPreview = (url) => {
    avatarPreview.innerHTML = "";
    if (url) {
      const img = document.createElement("img");
      img.src = url;
      img.alt = "Avatar preview";
      avatarPreview.appendChild(img);
      return;
    }
    avatarPreview.textContent = (currentUser.email || "T").trim().charAt(0).toUpperCase() || "T";
  };

  paintAvatarPreview(profile.avatarUrl);

  const avatarFile = document.createElement("input");
  avatarFile.type = "file";
  avatarFile.accept = "image/png,image/jpeg,image/webp";

  const avatarActions = document.createElement("div");
  avatarActions.className = "avatar-settings-actions";

  const uploadAvatarBtn = document.createElement("button");
  uploadAvatarBtn.type = "button";
  uploadAvatarBtn.className = "btn-outline";
  uploadAvatarBtn.textContent = "Upload Photo";

  const removeAvatarBtn = document.createElement("button");
  removeAvatarBtn.type = "button";
  removeAvatarBtn.className = "btn-danger";
  removeAvatarBtn.textContent = "Remove Photo";

  uploadAvatarBtn.addEventListener("click", async () => {
    try {
      const selectedFile = avatarFile.files?.[0];
      if (!selectedFile) throw new Error("Choose an image first.");
      if (selectedFile.size > 2 * 1024 * 1024) {
        throw new Error("Image must be 2MB or smaller.");
      }
      if (!supabaseClient || !currentUser) {
        throw new Error("Please sign in first.");
      }

      const extension = (selectedFile.name.split(".").pop() || "jpg").toLowerCase();
      const storagePath = `${currentUser.id}/avatar.${extension}`;

      const { error: uploadError } = await supabaseClient.storage.from("profile-assets").upload(storagePath, selectedFile, {
        upsert: true,
        contentType: selectedFile.type || "image/jpeg",
        cacheControl: "3600"
      });
      if (uploadError) throw new Error(`${uploadError.message}. Check bucket policies for profile-assets.`);

      const { data: publicData } = supabaseClient.storage.from("profile-assets").getPublicUrl(storagePath);
      const avatarUrl = `${publicData.publicUrl}?v=${Date.now()}`;

      const { error: updateError } = await supabaseClient.auth.updateUser({ data: { avatar_url: avatarUrl } });
      if (updateError) throw updateError;

      const latestCache = normalizeProfile(currentUser, loadCachedProfile(currentUser.id) || {});
      saveCachedProfile(currentUser.id, {
        ...latestCache,
        avatarUrl
      });

      const { data: refreshed, error: refreshError } = await supabaseClient.auth.getUser();
      if (refreshError) throw refreshError;
      updateAuthStatus(refreshed?.user || currentUser);
      paintAvatarPreview(avatarUrl);
      showMessage("Profile photo uploaded.");
    } catch (error) {
      showMessage(error.message || "Unable to upload profile photo.", true);
    }
  });

  removeAvatarBtn.addEventListener("click", async () => {
    try {
      if (!supabaseClient || !currentUser) {
        throw new Error("Please sign in first.");
      }

      const { error: updateError } = await supabaseClient.auth.updateUser({ data: { avatar_url: "" } });
      if (updateError) throw updateError;

      const latestCache = normalizeProfile(currentUser, loadCachedProfile(currentUser.id) || {});
      saveCachedProfile(currentUser.id, {
        ...latestCache,
        avatarUrl: ""
      });

      const { data: refreshed, error: refreshError } = await supabaseClient.auth.getUser();
      if (refreshError) throw refreshError;
      updateAuthStatus(refreshed?.user || currentUser);
      avatarFile.value = "";
      paintAvatarPreview("");
      showMessage("Profile photo removed.");
    } catch (error) {
      showMessage(error.message || "Unable to remove profile photo.", true);
    }
  });

  avatarActions.appendChild(uploadAvatarBtn);
  avatarActions.appendChild(removeAvatarBtn);
  avatarSettings.appendChild(avatarPreview);
  avatarSettings.appendChild(avatarFile);
  avatarSettings.appendChild(avatarActions);

  const actions = document.createElement("div");
  actions.className = "profile-settings-actions";

  const saveBtn = document.createElement("button");
  saveBtn.type = "submit";
  saveBtn.className = "btn-primary";
  saveBtn.textContent = "Save Changes";

  const resetBtn = document.createElement("button");
  resetBtn.type = "button";
  resetBtn.className = "btn-outline";
  resetBtn.textContent = "Reset";
  resetBtn.addEventListener("click", () => {
    const latest = normalizeProfile(currentUser, loadCachedProfile(currentUser.id) || {});
    inputs.fullName.value = latest.fullName;
    inputs.dateOfBirth.value = latest.dateOfBirth;
    inputs.headline.value = latest.headline;
    inputs.website.value = latest.website;
    inputs.bio.value = latest.bio;
  });

  actions.appendChild(saveBtn);
  actions.appendChild(resetBtn);

  const localNote = document.createElement("p");
  localNote.className = "inline-note";
  localNote.textContent = "Tip: Signed-out state keeps your local cache but cannot sync profile updates.";

  formEl.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
      if (!supabaseClient || !currentUser) {
        throw new Error("Please sign in first.");
      }

      const updatePayload = {
        full_name: inputs.fullName.value.trim(),
        date_of_birth: inputs.dateOfBirth.value,
        headline: inputs.headline.value.trim(),
        website: inputs.website.value.trim(),
        bio: inputs.bio.value.trim()
      };

      const missingFields = getMissingProfileFields({
        fullName: updatePayload.full_name,
        dateOfBirth: updatePayload.date_of_birth,
        headline: updatePayload.headline,
        bio: updatePayload.bio
      });
      if (missingFields.length > 0) {
        throw new Error(`Complete the required profile fields: ${formatMissingProfileFields(missingFields)}.`);
      }

      const { error } = await supabaseClient.auth.updateUser({ data: updatePayload });
      if (error) throw error;

      saveCachedProfile(currentUser.id, {
        fullName: updatePayload.full_name,
        dateOfBirth: updatePayload.date_of_birth,
        headline: updatePayload.headline,
        website: updatePayload.website,
        bio: updatePayload.bio,
        avatarUrl: profile.avatarUrl || ""
      });

      const { data: refreshed, error: refreshError } = await supabaseClient.auth.getUser();
      if (refreshError) throw refreshError;
      updateAuthStatus(refreshed?.user || currentUser);
      showMessage("General settings updated.");
    } catch (error) {
      showMessage(error.message || "Unable to save settings.", true);
    }
  });

  formEl.appendChild(grid);
  formEl.appendChild(avatarSettings);
  formEl.appendChild(actions);
  formEl.appendChild(localNote);
  profileContent.appendChild(formEl);

  const profileBlock = document.createElement("section");
  profileBlock.className = "profile-block";
  profileBlock.innerHTML = "<h4>Current account</h4><p>Manage your identity details here. Security actions stay in the Account Security tab.</p>";
  profileContent.appendChild(profileBlock);
}

async function renderAccountSecuritySection() {
  profileContent.innerHTML = "";

  const title = document.createElement("h3");
  title.className = "profile-section-title";
  title.textContent = "Account Security";
  profileContent.appendChild(title);

  if (!currentUser) {
    const copy = document.createElement("p");
    copy.className = "profile-section-copy";
    copy.textContent = "Sign in to manage your account security.";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn-primary";
    btn.textContent = "Open Login";
    btn.addEventListener("click", () => { setProfilePanelOpen(false); setAuthModalOpen(true); });
    profileContent.appendChild(copy);
    profileContent.appendChild(btn);
    return;
  }

  const emailBlock = document.createElement("div");
  emailBlock.className = "profile-block";
  emailBlock.innerHTML = `<h4>Signed-in as</h4><p style="font-weight:600;">${currentUser.email}</p>`;
  profileContent.appendChild(emailBlock);

  const securityProfile = normalizeProfile(currentUser, loadCachedProfile(currentUser.id) || {});
  const missingProfileFields = getMissingProfileFields(securityProfile);
  const securityStatusGrid = document.createElement("div");
  securityStatusGrid.className = "auth-status-grid";
  securityStatusGrid.innerHTML = `
    <div class="auth-status-card">
      <h4>Email Verification</h4>
      <p>${currentUser.email_confirmed_at ? "Verified" : "Pending verification"}</p>
    </div>
    <div class="auth-status-card">
      <h4>Profile Status</h4>
      <p>${missingProfileFields.length ? `Missing ${formatMissingProfileFields(missingProfileFields)}.` : "Complete"}</p>
    </div>
    <div class="auth-status-card">
      <h4>Safety Terms</h4>
      <p>${securityProfile.termsAcceptedAt ? `Accepted on ${new Date(securityProfile.termsAcceptedAt).toLocaleString()}` : "Not accepted"}</p>
    </div>
  `;
  profileContent.appendChild(securityStatusGrid);

  const safetyActions = document.createElement("div");
  safetyActions.className = "profile-settings-actions";

  const acceptTermsBtn = document.createElement("button");
  acceptTermsBtn.type = "button";
  acceptTermsBtn.className = "btn-soft";
  acceptTermsBtn.textContent = "Accept Latest Safety Terms";

  const acceptTermsMsg = document.createElement("p");
  acceptTermsMsg.className = "inline-note";

  acceptTermsBtn.addEventListener("click", async () => {
    try {
      if (!supabaseClient) throw new Error("Supabase not configured.");
      const acceptedAt = new Date().toISOString();
      const { error } = await supabaseClient.auth.updateUser({
        data: {
          terms_accepted_at: acceptedAt,
          safety_acknowledged_at: acceptedAt,
          terms_version: authPolicy.termsVersion
        }
      });
      if (error) throw error;

      const cached = normalizeProfile(currentUser, loadCachedProfile(currentUser.id) || {});
      saveCachedProfile(currentUser.id, {
        ...cached,
        termsAcceptedAt: acceptedAt,
        safetyAcknowledgedAt: acceptedAt,
        termsVersion: authPolicy.termsVersion
      });

      const { data: refreshed, error: refreshError } = await supabaseClient.auth.getUser();
      if (refreshError) throw refreshError;
      updateAuthStatus(refreshed?.user || currentUser);

      acceptTermsMsg.textContent = "Safety terms accepted.";
      acceptTermsMsg.style.color = "#0a7f5a";
      renderAccountSecuritySection();
    } catch (error) {
      acceptTermsMsg.textContent = error.message || "Unable to update safety terms acceptance.";
      acceptTermsMsg.style.color = "#b91c1c";
    }
  });

  safetyActions.appendChild(acceptTermsBtn);
  safetyActions.appendChild(acceptTermsMsg);
  profileContent.appendChild(safetyActions);

  const twoStepTitle = document.createElement("h4");
  twoStepTitle.style.margin = "16px 0 8px";
  twoStepTitle.textContent = "2-Step Verification Preference";
  profileContent.appendChild(twoStepTitle);

  const twoStepCopy = document.createElement("p");
  twoStepCopy.className = "profile-section-copy";
  twoStepCopy.textContent = "Choose how you want your second verification step handled. Authenticator app requires Supabase MFA to be enabled for this project.";
  profileContent.appendChild(twoStepCopy);

  const twoStepForm = document.createElement("form");
  twoStepForm.className = "profile-settings-form";

  const twoStepGroup = document.createElement("fieldset");
  twoStepGroup.className = "auth-choice-group";

  const twoStepLegend = document.createElement("legend");
  twoStepLegend.textContent = "Verification Method";
  twoStepGroup.appendChild(twoStepLegend);

  [
    { value: "email", label: "Email code" },
    { value: "authenticator_app", label: "Authenticator app" }
  ].forEach(({ value, label }) => {
    const option = document.createElement("label");
    option.className = "auth-choice-option";

    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "profileTwoStepPreference";
    radio.value = value;
    radio.checked = (securityProfile.twoStepPreference || "email") === value;

    const text = document.createElement("span");
    text.textContent = label;

    option.appendChild(radio);
    option.appendChild(text);
    twoStepGroup.appendChild(option);
  });

  const twoStepActions = document.createElement("div");
  twoStepActions.className = "profile-settings-actions";

  const twoStepSaveBtn = document.createElement("button");
  twoStepSaveBtn.type = "submit";
  twoStepSaveBtn.className = "btn-outline";
  twoStepSaveBtn.textContent = "Save 2-Step Preference";

  const twoStepMsg = document.createElement("p");
  twoStepMsg.className = "inline-note";

  twoStepActions.appendChild(twoStepSaveBtn);
  twoStepForm.appendChild(twoStepGroup);
  twoStepForm.appendChild(twoStepActions);
  twoStepForm.appendChild(twoStepMsg);

  twoStepForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
      if (!supabaseClient) throw new Error("Supabase not configured.");
      const selected = twoStepForm.querySelector('input[name="profileTwoStepPreference"]:checked');
      const value = selected instanceof HTMLInputElement ? selected.value : "";
      if (!value) throw new Error("Choose a 2-step verification method.");

      const { error } = await supabaseClient.auth.updateUser({ data: { two_step_preference: value } });
      if (error) throw error;

      const cached = normalizeProfile(currentUser, loadCachedProfile(currentUser.id) || {});
      saveCachedProfile(currentUser.id, {
        ...cached,
        twoStepPreference: value
      });

      const { data: refreshed, error: refreshError } = await supabaseClient.auth.getUser();
      if (refreshError) throw refreshError;
      updateAuthStatus(refreshed?.user || currentUser);

      twoStepMsg.textContent = "2-step verification preference updated.";
      twoStepMsg.style.color = "#0a7f5a";
    } catch (error) {
      twoStepMsg.textContent = error.message || "Unable to update 2-step verification preference.";
      twoStepMsg.style.color = "#b91c1c";
    }
  });

  profileContent.appendChild(twoStepForm);

  const pwTitle = document.createElement("h4");
  pwTitle.style.margin = "16px 0 8px";
  pwTitle.textContent = "Change Password";
  profileContent.appendChild(pwTitle);

  const pwCopy = document.createElement("p");
  pwCopy.className = "profile-section-copy";
  pwCopy.textContent = "Choose a strong password with uppercase, lowercase, and a number.";
  profileContent.appendChild(pwCopy);

  const pwForm = document.createElement("form");
  pwForm.className = "profile-settings-form";

  const newPwLabel = document.createElement("label");
  newPwLabel.textContent = "New Password";
  const newPwInput = document.createElement("input");
  newPwInput.type = "password";
  newPwInput.placeholder = "Min 8 chars, A-z + number";
  newPwLabel.appendChild(newPwInput);

  const confirmPwLabel = document.createElement("label");
  confirmPwLabel.textContent = "Confirm New Password";
  const confirmPwInput = document.createElement("input");
  confirmPwInput.type = "password";
  confirmPwInput.placeholder = "Repeat new password";
  confirmPwLabel.appendChild(confirmPwInput);

  const pwActions = document.createElement("div");
  pwActions.className = "profile-settings-actions";

  const pwSaveBtn = document.createElement("button");
  pwSaveBtn.type = "submit";
  pwSaveBtn.className = "btn-primary";
  pwSaveBtn.textContent = "Update Password";

  const pwMsg = document.createElement("p");
  pwMsg.className = "inline-note";

  pwActions.appendChild(pwSaveBtn);
  pwForm.appendChild(newPwLabel);
  pwForm.appendChild(confirmPwLabel);
  pwForm.appendChild(pwActions);
  pwForm.appendChild(pwMsg);

  pwForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const newPw = newPwInput.value.trim();
    const confirmPw = confirmPwInput.value.trim();
    const err = validatePasswordStrength(newPw, authPolicy.passwordMinLength);
    if (err) { pwMsg.textContent = err; pwMsg.style.color = "#b91c1c"; return; }
    if (newPw !== confirmPw) { pwMsg.textContent = "Passwords do not match."; pwMsg.style.color = "#b91c1c"; return; }
    try {
      if (!supabaseClient) throw new Error("Supabase not configured.");
      const { error } = await supabaseClient.auth.updateUser({ password: newPw });
      if (error) throw error;
      pwMsg.textContent = "Password updated successfully.";
      pwMsg.style.color = "#0a7f5a";
      newPwInput.value = "";
      confirmPwInput.value = "";
    } catch (error) {
      pwMsg.textContent = error.message || "Password update failed.";
      pwMsg.style.color = "#b91c1c";
    }
  });

  profileContent.appendChild(pwForm);

  const signOutBlock = document.createElement("div");
  signOutBlock.className = "profile-block";
  signOutBlock.style.marginTop = "16px";
  const signOutTitle = document.createElement("h4");
  signOutTitle.textContent = "Sign Out";
  const signOutCopy = document.createElement("p");
  signOutCopy.className = "profile-section-copy";
  signOutCopy.textContent = "End your current browser session on this device.";
  const signOutBtn2 = document.createElement("button");
  signOutBtn2.type = "button";
  signOutBtn2.className = "btn-danger";
  signOutBtn2.textContent = "Sign Out Now";
  signOutBtn2.addEventListener("click", async () => {
    if (!supabaseClient) return;
    await supabaseClient.auth.signOut().catch(() => {});
    setProfilePanelOpen(false);
    showMessage("Signed out.");
  });
  signOutBlock.appendChild(signOutTitle);
  signOutBlock.appendChild(signOutCopy);
  signOutBlock.appendChild(signOutBtn2);
  profileContent.appendChild(signOutBlock);
}

function renderNotificationsSection() {
  profileContent.innerHTML = "";

  const title = document.createElement("h3");
  title.className = "profile-section-title";
  title.textContent = "Notifications";
  profileContent.appendChild(title);

  const copy = document.createElement("p");
  copy.className = "profile-section-copy";
  copy.textContent = "Control which in-app notifications you see. Preferences are stored locally in your browser.";
  profileContent.appendChild(copy);

  const prefs = getNotificationPrefs();
  const notifItems = [
    { key: "blueprintComplete", label: "Blueprint generation complete", defaultOn: true },
    { key: "landingComplete", label: "Landing page code generated", defaultOn: true },
    { key: "saveSuccess", label: "Project saved to history", defaultOn: true },
    { key: "deployComplete", label: "Deploy hook triggered", defaultOn: true },
    { key: "errors", label: "Errors and warnings", defaultOn: true }
  ];

  const list = document.createElement("div");
  list.className = "notif-list";

  notifItems.forEach(({ key, label, defaultOn }) => {
    const row = document.createElement("label");
    row.className = "notif-row";

    const text = document.createElement("span");
    text.textContent = label;

    const toggle = document.createElement("input");
    toggle.type = "checkbox";
    toggle.className = "notif-toggle";
    toggle.checked = prefs[key] !== undefined ? prefs[key] : defaultOn;
    toggle.addEventListener("change", () => {
      const latest = getNotificationPrefs();
      latest[key] = toggle.checked;
      saveNotificationPrefs(latest);
    });

    row.appendChild(text);
    row.appendChild(toggle);
    list.appendChild(row);
  });

  profileContent.appendChild(list);

  const note = document.createElement("p");
  note.className = "inline-note";
  note.style.marginTop = "14px";
  note.textContent = "Push notifications are not enabled in this version. Settings apply to banners shown inside the app.";
  profileContent.appendChild(note);
}

function renderApiUsageSection() {
  profileContent.innerHTML = "";

  const title = document.createElement("h3");
  title.className = "profile-section-title";
  title.textContent = "API Usage & Stats";
  profileContent.appendChild(title);

  const copy = document.createElement("p");
  copy.className = "profile-section-copy";
  copy.textContent = "Counts are tracked locally in this browser. AI requests use the Gemini model chain — if a model is quota-limited the app automatically tries the next one.";
  profileContent.appendChild(copy);

  const s = getStats();

  function fmtTime(ms) {
    if (!ms || ms < 1000) return "< 1 min";
    const mins = Math.floor(ms / 60000);
    if (mins < 60) return `${mins} min`;
    return `${(ms / 3600000).toFixed(1)} hr`;
  }

  const statsItems = [
    { label: "Blueprints Generated", value: s.blueprints || 0, note: "Total AI blueprint runs (this browser)" },
    { label: "Landing Codes Generated", value: s.landingCodes || 0, note: "Landing page HTML + React runs" },
    { label: "App Sessions", value: s.sessions || 0, note: "Browser sessions tracked" },
    { label: "Total Time on Site", value: fmtTime(s.totalTime || 0), note: "Across all sessions (approx.)" }
  ];

  const grid = document.createElement("div");
  grid.className = "api-stats-grid";

  statsItems.forEach(({ label, value, note }) => {
    const card = document.createElement("div");
    card.className = "api-stat-card";
    card.innerHTML = `<p class="api-stat-label">${label}</p><p class="api-stat-value">${value}</p><p class="api-stat-note">${note}</p>`;
    grid.appendChild(card);
  });

  profileContent.appendChild(grid);

  const modelBlock = document.createElement("div");
  modelBlock.className = "profile-block";
  modelBlock.style.marginTop = "16px";
  modelBlock.innerHTML = `<h4>AI Model Chain</h4><p class="profile-section-copy">The app tries each model in order when quota is exceeded. Primary model is set via GEMINI_MODEL in your server environment.</p>`;
  const modelChain = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-3-flash-preview", "gemini-3.1-flash-lite-preview", "gemini-2.5-flash-preview-tts"];
  const chainList = document.createElement("ol");
  chainList.className = "profile-list";
  modelChain.forEach((m) => {
    const li = document.createElement("li");
    li.textContent = m;
    chainList.appendChild(li);
  });
  modelBlock.appendChild(chainList);
  profileContent.appendChild(modelBlock);

  const clearActions = document.createElement("div");
  clearActions.className = "profile-settings-actions";
  clearActions.style.marginTop = "16px";
  const clearBtn = document.createElement("button");
  clearBtn.type = "button";
  clearBtn.className = "btn-outline";
  clearBtn.textContent = "Clear Local Stats";
  clearBtn.addEventListener("click", () => {
    saveStats({ blueprints: 0, landingCodes: 0, sessions: 0, totalTime: 0 });
    sessionStartTime = Date.now();
    renderApiUsageSection();
    showMessage("Local stats cleared.");
  });
  clearActions.appendChild(clearBtn);
  profileContent.appendChild(clearActions);
}

function renderDeactivateSection() {
  profileContent.innerHTML = "";

  const title = document.createElement("h3");
  title.className = "profile-section-title";
  title.textContent = "Deactivate Account";
  profileContent.appendChild(title);

  const copy = document.createElement("p");
  copy.className = "profile-section-copy";
  copy.textContent = "Deactivating signs you out from this browser and clears your locally cached profile. Your Supabase data and saved projects remain untouched.";
  profileContent.appendChild(copy);

  const items = [
    "Signs out your current session in this browser",
    "Clears your locally cached profile data",
    "Saved Supabase projects are not deleted",
    "You can sign back in at any time"
  ];

  const list = document.createElement("ul");
  list.className = "profile-list";
  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    list.appendChild(li);
  });
  profileContent.appendChild(list);

  if (!currentUser) {
    const note = document.createElement("p");
    note.className = "inline-note";
    note.style.marginTop = "12px";
    note.textContent = "You are not currently signed in.";
    profileContent.appendChild(note);
    return;
  }

  const actions = document.createElement("div");
  actions.className = "profile-settings-actions";
  actions.style.marginTop = "16px";

  const deactivateBtn = document.createElement("button");
  deactivateBtn.type = "button";
  deactivateBtn.className = "btn-danger";
  deactivateBtn.textContent = "Deactivate (Sign Out & Clear Cache)";
  deactivateBtn.addEventListener("click", async () => {
    try {
      if (currentUser?.id) {
        localStorage.removeItem(getProfileCacheKey(currentUser.id));
      }
      if (supabaseClient) {
        await supabaseClient.auth.signOut();
      }
      setProfilePanelOpen(false);
      showMessage("Signed out and local cache cleared.");
    } catch (error) {
      showMessage(error.message || "Deactivation failed.", true);
    }
  });

  actions.appendChild(deactivateBtn);
  profileContent.appendChild(actions);
}

function validatePasswordStrength(password, minLength) {
  if (password.length < minLength) {
    return `Password must be at least ${minLength} characters.`;
  }

  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);

  if (!hasUpper || !hasLower || !hasDigit) {
    return "Password must include uppercase, lowercase, and a number.";
  }

  return "";
}

function validateSignupRequirements(signupProfile) {
  const missingFields = getMissingProfileFields(signupProfile);
  if (missingFields.length > 0) {
    return `Complete the required profile fields: ${formatMissingProfileFields(missingFields)}.`;
  }

  if (!signupProfile.acceptedTerms || !signupProfile.acceptedSafety) {
    return "You must accept the safety terms and confirm responsible use before signing up.";
  }

  if (!signupProfile.twoStepPreference) {
    return "Choose a 2-step verification preference before signing up.";
  }

  return "";
}

function runStartupSplash() {
  if (!startupSplash) return;
  document.body.classList.add("splash-active");

  let hidden = false;
  const hideSplash = () => {
    if (hidden) return;
    hidden = true;
    startupSplash.classList.add("fade-out");
    setTimeout(() => {
      startupSplash.remove();
      document.body.classList.remove("splash-active");
      const chatWidget = document.getElementById("chatWidget");
      if (chatWidget) chatWidget.hidden = false;
    }, 500);
  };

  setTimeout(hideSplash, 2000);
  setTimeout(hideSplash, 4500);
}

function setLoading(isLoading, text = "Building your startup blueprint...") {
  loadingText.textContent = text;
  loadingOverlay.classList.toggle("is-visible", isLoading);
}

function createList(items) {
  const ul = document.createElement("ul");
  ul.className = "result-list";
  const source = Array.isArray(items) ? items : [items];
  source.forEach((item) => {
    const li = document.createElement("li");
    const normalizedItem = normalizeStructuredValue(item);

    if (Array.isArray(normalizedItem)) {
      li.appendChild(createList(normalizedItem));
    } else if (normalizedItem && typeof normalizedItem === "object") {
      li.appendChild(createKeyValue(normalizedItem));
    } else {
      li.textContent = String(normalizedItem);
    }

    ul.appendChild(li);
  });
  return ul;
}

function createKeyValue(obj) {
  const container = document.createElement("div");
  container.className = "result-kv";

  Object.entries(obj || {}).forEach(([k, v]) => {
    const row = document.createElement("div");
    row.className = "result-kv-row";

    const keyEl = document.createElement("div");
    keyEl.className = "result-kv-key";
    keyEl.textContent = k;

    const valueEl = document.createElement("div");
    valueEl.className = "result-kv-value";

    const normalizedValue = normalizeStructuredValue(v);

    if (Array.isArray(normalizedValue)) {
      valueEl.appendChild(createList(normalizedValue));
    } else if (normalizedValue && typeof normalizedValue === "object") {
      valueEl.appendChild(createKeyValue(normalizedValue));
    } else {
      valueEl.textContent = String(normalizedValue);
    }

    row.appendChild(keyEl);
    row.appendChild(valueEl);
    container.appendChild(row);
  });

  return container;
}

function normalizeStructuredValue(value) {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  const looksJson =
    (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
    (trimmed.startsWith("[") && trimmed.endsWith("]"));

  if (!looksJson) {
    return value;
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    // Many LLM responses use smart quotes; normalize once before giving up.
    const normalizedQuotes = trimmed
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[\u2018\u2019]/g, "'");

    try {
      return JSON.parse(normalizedQuotes);
    } catch {
      return value;
    }
  }
}

function renderStructuredContent(container, key, value) {
  if (!value) {
    container.textContent = "Section not generated in this run.";
    return;
  }

  const normalizedValue = normalizeStructuredValue(value);

  if (["validation", "businessPlan", "revenueModel", "landingPage"].includes(key)) {
    container.appendChild(createKeyValue(normalizedValue));
    return;
  }

  if (key === "marketingPlan") {
    const source = normalizedValue || {};
    container.appendChild(
      createKeyValue({
        channels: source.channels,
        first90Days: source.first90Days,
        metrics: source.metrics
      })
    );
    return;
  }

  if (key === "pitchDeck") {
    const source = normalizedValue || {};
    container.appendChild(createList(source.slides || []));
    const ask = document.createElement("p");
    ask.className = "result-note";
    ask.textContent = `Funding ask: ${source.fundingAsk || "Not provided"}`;
    container.appendChild(ask);
    return;
  }

  if (key === "branding") {
    const source = normalizedValue || {};
    container.appendChild(
      createKeyValue({
        names: source.names,
        domains: source.domains,
        slogans: source.slogans,
        logoIdeas: source.logoIdeas,
        colorPalette: source.colorPalette
      })
    );
    return;
  }

  if (key === "marketAnalysis") {
    const source = normalizedValue || {};
    container.appendChild(
      createKeyValue({
        tamSamSom: source.tamSamSom,
        trends: source.trends,
        competitors: source.competitors
      })
    );
    return;
  }

  if (Array.isArray(normalizedValue)) {
    container.appendChild(createList(normalizedValue));
    return;
  }

  if (normalizedValue && typeof normalizedValue === "object") {
    container.appendChild(createKeyValue(normalizedValue));
    return;
  }

  container.textContent = String(normalizedValue);
}

function renderSummary(blueprint) {
  summaryGrid.innerHTML = "";
  const summaryData = {
    Mode: blueprint?.meta?.mode || "unknown",
    Sections: sections.length,
    Competitors: Array.isArray(blueprint?.marketAnalysis?.competitors) ? blueprint.marketAnalysis.competitors.length : 0,
    "Brand Names": Array.isArray(blueprint?.branding?.names) ? blueprint.branding.names.length : 0,
    "Pitch Slides": Array.isArray(blueprint?.pitchDeck?.slides) ? blueprint.pitchDeck.slides.length : 0
  };

  Object.entries(summaryData).forEach(([label, value]) => {
    const card = document.createElement("article");
    card.className = "summary-card";
    card.innerHTML = `<h4>${label}</h4><p>${value}</p>`;
    summaryGrid.appendChild(card);
  });
}

function renderBlueprint(blueprint) {
  resultGrid.innerHTML = "";
  renderSummary(blueprint);

  sections.forEach(({ key, title }, index) => {
    const value = blueprint[key];
    const card = document.createElement("article");
    card.className = "result-card";
    card.style.animationDelay = `${index * 40}ms`;

    const heading = document.createElement("h3");
    heading.textContent = title;

    const content = document.createElement("div");
    renderStructuredContent(content, key, value);

    card.appendChild(heading);
    card.appendChild(content);
    resultGrid.appendChild(card);
  });

  resultsPanel.hidden = false;
}

async function downloadFromEndpoint(endpoint, filename, payload) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Download failed");
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

async function initSupabase() {
  const configRes = await fetch("/api/config");
  const config = await configRes.json();

  deployConfig = {
    hasNetlifyDeployHook: !!config.hasNetlifyDeployHook,
    hasVercelDeployHook: !!config.hasVercelDeployHook
  };
  if (deployNetlifyBtn) {
    deployNetlifyBtn.disabled = !deployConfig.hasNetlifyDeployHook;
  }
  if (deployVercelBtn) {
    deployVercelBtn.disabled = !deployConfig.hasVercelDeployHook;
  }

  authPolicy = {
    passwordMinLength: config?.auth?.passwordMinLength || 8,
    requireEmailConfirmation: config?.auth?.requireEmailConfirmation !== false,
    redirectUrl: config?.auth?.redirectUrl || window.location.origin,
    requiredProfileFields: config?.auth?.requiredProfileFields || ["full_name", "date_of_birth", "headline", "bio"],
    twoStepOptions: config?.auth?.twoStepOptions || ["email", "authenticator_app"],
    termsVersion: config?.auth?.termsVersion || "2026-03-11"
  };
  setAuthMode(authMode);

  if (!config.supabaseUrl || !config.supabaseAnonKey || !window.supabase) {
    authStatus.textContent = "Supabase not configured";
    openAuthModal.disabled = true;
    signUpBtn.disabled = true;
    signInBtn.disabled = true;
    signOutBtn.disabled = true;
    resetPasswordBtn.disabled = true;
    return;
  }

  openAuthModal.disabled = false;
  supabaseClient = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);
  trackStat("sessions");
  window.addEventListener("beforeunload", flushSessionTime);
  const { data } = await supabaseClient.auth.getSession();
  updateAuthStatus(data?.session?.user || null);

  supabaseClient.auth.onAuthStateChange((_event, session) => {
    updateAuthStatus(session?.user || null);
  });
}

function updateAuthStatus(user) {
  currentUser = user;
  const displayName = user ? (user.user_metadata?.full_name || user.email.split('@')[0]) : "";
  authStatus.textContent = user ? `Hi 👋, ${displayName}` : "Not signed in";
  profileEmail.textContent = user ? `Hi 👋, ${displayName}` : "Not signed in";
  if (!user) {
    setProfileMenuOpen(false);
    setProfilePanelOpen(false);
  }
  syncAuthButtons(user);

  if (user) {
    const normalized = normalizeProfile(user, loadCachedProfile(user.id) || {});
    saveCachedProfile(user.id, normalized);
  }

  if (!profilePanel.hidden) {
    renderProfileSection(activeProfileTab);
  }
}

function assertCredentials(email, password = "", requirePassword = false) {
  if (!email) throw new Error("Enter your email.");
  if (requirePassword && !password) throw new Error("Enter your password.");
}

function formatAuthError(error, context = "sign-in") {
  const raw = String(error?.message || "").trim();
  const normalized = raw.toLowerCase();

  if (!raw) return `Unable to complete ${context}. Please try again.`;

  if (normalized.includes("invalid login credentials")) {
    return "Invalid email or password. If you just signed up, confirm your email first, then try again.";
  }

  if (normalized.includes("email rate limit exceeded") || normalized.includes("security purposes")) {
    return "Too many attempts in a short time. Wait a moment, then try again or reset your password.";
  }

  if (normalized.includes("user already registered")) {
    return "An account with this email already exists. Try logging in or use reset password.";
  }

  if (normalized.includes("signup is disabled")) {
    return "Account creation is disabled in Supabase Auth settings right now.";
  }

  if (normalized.includes("email not confirmed")) {
    return "Your email is not confirmed yet. Open the Supabase confirmation email, then sign in again.";
  }

  if (normalized.includes("invalid api key") || normalized.includes("anonymous sign-ins are disabled")) {
    return "Supabase auth configuration looks invalid. Verify SUPABASE_URL and SUPABASE_ANON_KEY in .env and restart the server.";
  }

  return raw;
}

async function renderDeleteAccountSection() {
  profileContent.innerHTML = "";

  const title = document.createElement("h3");
  title.className = "profile-section-title";
  title.textContent = "Delete Account";

  const copy = document.createElement("p");
  copy.className = "profile-section-copy";
  copy.textContent = "This permanently deletes your account and project history. Type the confirmation phrase and your email to continue.";

  const formEl = document.createElement("form");
  formEl.className = "profile-settings-form";

  const phraseLabel = document.createElement("label");
  phraseLabel.textContent = "Type confirmation phrase";
  const phraseInput = document.createElement("input");
  phraseInput.placeholder = "DELETE MY ACCOUNT";

  const emailLabel = document.createElement("label");
  emailLabel.textContent = "Confirm your email";
  const emailInput = document.createElement("input");
  emailInput.type = "email";
  emailInput.value = currentUser?.email || "";

  phraseLabel.appendChild(phraseInput);
  emailLabel.appendChild(emailInput);

  const submitBtn = document.createElement("button");
  submitBtn.type = "submit";
  submitBtn.className = "btn-danger";
  submitBtn.textContent = "Delete Account Permanently";

  formEl.appendChild(phraseLabel);
  formEl.appendChild(emailLabel);
  formEl.appendChild(submitBtn);

  formEl.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
      const token = await requireTokenForAction("Delete Account");
      const response = await fetch("/api/account/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          confirmText: phraseInput.value.trim(),
          confirmEmail: emailInput.value.trim()
        })
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "Account deletion failed.");
      }

      if (currentUser?.id) {
        localStorage.removeItem(getProfileCacheKey(currentUser.id));
      }

      if (supabaseClient) {
        await supabaseClient.auth.signOut();
      }
      setProfilePanelOpen(false);
      setAuthModalOpen(false);
      showMessage("Account deleted permanently.");
    } catch (error) {
      if (error.message === "AUTH_REQUIRED") return;
      showMessage(error.message || "Account deletion failed.", true);
    }
  });

  profileContent.appendChild(title);
  profileContent.appendChild(copy);
  profileContent.appendChild(formEl);
}

async function getAccessToken() {
  if (!supabaseClient) throw new Error("Supabase is not configured.");
  const { data } = await supabaseClient.auth.getSession();
  const token = data?.session?.access_token;
  if (!token) throw new Error("Please sign in first.");
  return token;
}

async function requireTokenForAction(actionLabel) {
  try {
    return await getAccessToken();
  } catch {
    showAuthRequiredToast(`Authentication required: ${actionLabel}.`);
    throw new Error("AUTH_REQUIRED");
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!requireEligibleUserForAction("Generate Blueprint")) return;

  const data = Object.fromEntries(new FormData(form).entries());
  if (!data.startupIdea || !data.targetUsers || !data.country || !data.budget || !data.industry) {
    showMessage("Please fill out all fields in the journey to continue.", true);
    return;
  }

  button.disabled = true;
  let timer;

  try {
    // Gamified Journey loading steps
    const steps = [
      "🔍 Step 1: Validating idea & reality check...",
      "🎯 Step 2: Defining audience & target...",
      "📈 Step 3: Analyzing market sizing...",
      "🎨 Step 4: Generating brand kit...",
      "💰 Step 5: Building monetization helper...",
      "🎯 Step 6: Creating 100 users plan...",
      "💻 Step 7: Structuring MVP...",
      "🚀 Finalizing your Startup Blueprint..."
    ];
    let i = 0;
    setLoading(true, steps[0]);

    timer = setInterval(() => {
      i++;
      if (i < steps.length) {
        loadingText.innerHTML = `<strong>Unlock:</strong> ${steps[i]}`;
      } else {
        i = 0;
      }
    }, 1200);
    const token = await getAccessToken();
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || "Generation failed");
    }

    const payload = await response.json();
    currentBlueprint = payload.blueprint;
    trackStat("blueprints");
    renderBlueprint(payload.blueprint);
    showMessage("Blueprint generated successfully.");
  } catch (error) {
    showMessage(error.message || "Generation failed.", true);
  } finally {
    clearInterval(timer);
    setLoading(false);
    button.disabled = false;
  }
});

downloadJson.addEventListener("click", async () => {
  if (!currentBlueprint) return showMessage("Generate a blueprint first.", true);
  try {
    await downloadFromEndpoint("/api/export/json", "startup-blueprint.json", currentBlueprint);
    showMessage("JSON export downloaded.");
  } catch (error) {
    showMessage(error.message, true);
  }
});

downloadBusinessPdf.addEventListener("click", async () => {
  if (!currentBlueprint) return showMessage("Generate a blueprint first.", true);
  try {
    await downloadFromEndpoint("/api/export/business-plan-pdf", "business-plan.pdf", { blueprint: currentBlueprint });
    showMessage("Business plan PDF downloaded.");
  } catch (error) {
    showMessage(error.message, true);
  }
});

downloadPitchPdf.addEventListener("click", async () => {
  if (!currentBlueprint) return showMessage("Generate a blueprint first.", true);
  try {
    await downloadFromEndpoint("/api/export/pitch-deck-pdf", "pitch-deck.pdf", { blueprint: currentBlueprint });
    showMessage("Pitch deck PDF downloaded.");
  } catch (error) {
    showMessage(error.message, true);
  }
});

if (exportPremiumPdfBtn) {
  exportPremiumPdfBtn.addEventListener("click", async () => {
    if (!currentBlueprint) return showMessage("Generate a blueprint first.", true);
      
      const overlay = document.getElementById('pdfLoadingOverlay');
      const fill = document.getElementById('pdfProgressBarFill');
      let interval;
      
      try {
        if (overlay && fill) {
          overlay.hidden = false;
          fill.style.width = '0%';
          let elapsed = 0;
          
          interval = setInterval(() => {
            elapsed++;
            const progress = (elapsed / 20) * 100;
            fill.style.width = Math.min(progress, 95) + '%';
          }, 1000);
        } else {
          showMessage("Generating premium report PDF... this might take a few moments.");
        }

        await downloadFromEndpoint("/api/export/premium-report-pdf", "premium-report.pdf", { blueprint: currentBlueprint });
        
        if (interval) clearInterval(interval);
        if (fill) fill.style.width = '100%';
        if (overlay) setTimeout(() => { overlay.hidden = true; }, 500);
        
        showMessage("Premium report PDF downloaded successfully.");
      } catch (error) {
        if (interval) clearInterval(interval);
        if (overlay) overlay.hidden = true;
        showMessage(error.message, true);
      }
  });
}

generateLandingCodeBtn.addEventListener("click", async () => {
  if (!lastIdeaInput) return showMessage("Generate a blueprint first to use the same startup idea.", true);
  if (!requireEligibleUserForAction("Generate Landing Code")) return;

  try {
    setLoading(true, "Generating landing page HTML and React code...");
    const token = await getAccessToken();
    const response = await fetch("/api/generate-landing-code", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(lastIdeaInput)
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || "Landing code generation failed");
    }

    const payload = await response.json();
    currentLandingCode = payload.landingCode;
    trackStat("landingCodes");
    landingHtmlOutput.textContent = payload.landingCode.html || "";
    landingReactOutput.textContent = payload.landingCode.react || "";
    landingPreviewFrame.srcdoc = payload.landingCode.html || "<h1>No preview available</h1>";
    landingCodePanel.hidden = false;
    setLandingTab(tabPreview);
    showMessage("Landing page code generated.");
  } catch (error) {
    showMessage(error.message, true);
  } finally {
    setLoading(false);
  }
});

saveProject.addEventListener("click", async () => {
  if (!lastIdeaInput || !currentBlueprint) return showMessage("Generate a blueprint before saving.", true);

  try {
    const token = await requireTokenForAction("Save Project");
    const response = await fetch("/api/history/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        ideaInput: lastIdeaInput,
        blueprint: currentBlueprint,
        landingCode: currentLandingCode
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || "Could not save project");
    }

    showMessage("Project saved to history.");
  } catch (error) {
    if (error.message === "AUTH_REQUIRED") return;
    showMessage(error.message, true);
  }
});

loadHistory.addEventListener("click", async () => {
  try {
    const token = await requireTokenForAction("Load History");
    const response = await fetch("/api/history/list", {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || "Could not fetch history");
    }

    const payload = await response.json();
    historyList.innerHTML = "";

    payload.items.forEach((item) => {
      const card = document.createElement("article");
      card.className = "history-item";
      card.innerHTML = `<h3>${item.idea_input?.startupIdea || "Untitled"}</h3><p>${new Date(item.created_at).toLocaleString()}</p>`;

      const useBtn = document.createElement("button");
      useBtn.className = "ghost";
      useBtn.textContent = "Load";
      useBtn.type = "button";
      useBtn.addEventListener("click", () => {
        currentBlueprint = item.blueprint;
        currentLandingCode = item.landing_code || null;
        renderBlueprint(item.blueprint);
        if (currentLandingCode) {
          landingHtmlOutput.textContent = currentLandingCode.html || "";
          landingReactOutput.textContent = currentLandingCode.react || "";
          landingPreviewFrame.srcdoc = currentLandingCode.html || "<h1>No preview available</h1>";
          landingCodePanel.hidden = false;
          setLandingTab(tabPreview);
        }
        showMessage("Loaded project from history.");
      });

      card.appendChild(useBtn);
      historyList.appendChild(card);
    });

    historyPanel.hidden = false;
    showMessage("History loaded.");
  } catch (error) {
    if (error.message === "AUTH_REQUIRED") return;
    showMessage(error.message, true);
  }
});

loadFeed.addEventListener("click", async () => {
  try {
    const response = await fetch("/api/feed");
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || "Could not fetch public feed");
    }

    const payload = await response.json();
    feedList.innerHTML = "";

    payload.items.forEach((item) => {
      const card = document.createElement("article");
      card.className = "history-item";
      card.innerHTML = `<h3>${item.idea_input?.startupIdea || "Anonymous Idea"}</h3><p>${new Date(item.created_at).toLocaleString()}</p>`;

      const useBtn = document.createElement("button");
      useBtn.className = "ghost";
      useBtn.textContent = "View";
      useBtn.type = "button";
      useBtn.addEventListener("click", () => {
        currentBlueprint = item.blueprint;
        currentLandingCode = item.landing_code || null;
        renderBlueprint(item.blueprint);
        if (currentLandingCode) {
          landingHtmlOutput.textContent = currentLandingCode.html || "";
          landingReactOutput.textContent = currentLandingCode.react || "";
          landingPreviewFrame.srcdoc = currentLandingCode.html || "<h1>No preview available</h1>";
          landingCodePanel.hidden = false;
          setLandingTab(tabPreview);
        } else {
          landingCodePanel.hidden = true;
          landingPreviewFrame.srcdoc = "";
        }
        showMessage("Feed item loaded.");
      });

      card.appendChild(useBtn);
      feedList.appendChild(card);
    });

    feedPanel.hidden = false;
    showMessage("Global feed loaded.");
  } catch (error) {
    showMessage(error.message, true);
  }
});

async function deploy(platform) {
  try {
    const response = await fetch(`/api/deploy/${platform}`, { method: "POST" });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || `Deploy to ${platform} failed`);
    }
    showMessage(`Deploy hook triggered for ${platform}.`);
  } catch (error) {
    showMessage(error.message, true);
  }
}

if (deployNetlifyBtn) {
  deployNetlifyBtn.addEventListener("click", () => deploy("netlify"));
}
if (deployVercelBtn) {
  deployVercelBtn.addEventListener("click", () => deploy("vercel"));
}

signUpBtn.addEventListener("click", async () => {
  try {
    setAuthFeedback("");
    if (!supabaseClient) throw new Error("Supabase not configured.");
    const email = authEmail.value.trim();
    const password = authPassword.value.trim();
    const signupProfile = readSignUpProfileInputs();
    assertCredentials(email, password, true);
    const passwordError = validatePasswordStrength(password, authPolicy.passwordMinLength);
    if (passwordError) {
      throw new Error(passwordError);
    }

    const signupError = validateSignupRequirements(signupProfile);
    if (signupError) {
      throw new Error(signupError);
    }

    const acceptedAt = new Date().toISOString();

    const { error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: authPolicy.redirectUrl,
        data: {
          full_name: signupProfile.fullName,
          date_of_birth: signupProfile.dateOfBirth,
          headline: signupProfile.headline,
          website: signupProfile.website,
          bio: signupProfile.bio,
          terms_accepted_at: acceptedAt,
          safety_acknowledged_at: acceptedAt,
          terms_version: authPolicy.termsVersion,
          two_step_preference: signupProfile.twoStepPreference,
          profile_completed_at: acceptedAt
        }
      }
    });

    if (error) throw error;
    const successMessage = authPolicy.requireEmailConfirmation
      ? "Sign up successful. Check your inbox to confirm your email."
      : "Sign up successful.";
    showMessage(successMessage);
    setAuthFeedback(successMessage, false);
    if (!authPolicy.requireEmailConfirmation) {
      setAuthModalOpen(false);
    }
  } catch (error) {
    const message = formatAuthError(error, "sign-up");
    showMessage(message, true);
    setAuthFeedback(message, true);
  }
});

signInBtn.addEventListener("click", async () => {
  try {
    setAuthFeedback("");
    if (!supabaseClient) throw new Error("Supabase not configured.");
    const email = authEmail.value.trim();
    const password = authPassword.value.trim();
    assertCredentials(email, password, true);
    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) throw error;
    showMessage("Signed in.");
    setAuthFeedback("");
    setAuthModalOpen(false);
  } catch (error) {
    const message = formatAuthError(error, "sign-in");
    showMessage(message, true);
    setAuthFeedback(message, true);
  }
});

signOutBtn.addEventListener("click", async () => {
  try {
    if (!supabaseClient) throw new Error("Supabase not configured.");
    const { error } = await supabaseClient.auth.signOut();
    if (error) throw error;
    showMessage("Signed out.");
    setAuthModalOpen(false);
    setProfileMenuOpen(false);
    setProfilePanelOpen(false);
  } catch (error) {
    showMessage(error.message, true);
  }
});

resetPasswordBtn.addEventListener("click", async () => {
  try {
    setAuthFeedback("");
    if (!supabaseClient) throw new Error("Supabase not configured.");
    const email = authEmail.value.trim();
    assertCredentials(email);

    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: authPolicy.redirectUrl
    });

    if (error) throw error;
    showMessage("Password reset email sent.");
    setAuthFeedback("Password reset email sent.", false);
  } catch (error) {
    const message = formatAuthError(error, "password reset");
    showMessage(message, true);
    setAuthFeedback(message, true);
  }
});

authEmail.addEventListener("input", () => setAuthFeedback(""));
authPassword.addEventListener("input", () => setAuthFeedback(""));
authFullName.addEventListener("input", () => setAuthFeedback(""));
authDateOfBirth.addEventListener("input", () => setAuthFeedback(""));
authHeadline.addEventListener("input", () => setAuthFeedback(""));
authWebsite.addEventListener("input", () => setAuthFeedback(""));
authBio.addEventListener("input", () => setAuthFeedback(""));
authAcceptTerms.addEventListener("change", () => setAuthFeedback(""));
authAcceptSafety.addEventListener("change", () => setAuthFeedback(""));
document.querySelectorAll('input[name="authTwoStep"]').forEach((input) => {
  input.addEventListener("change", () => setAuthFeedback(""));
});

authModeSignIn.addEventListener("click", () => {
  setAuthMode("signin");
  setAuthFeedback("");
});

authModeSignUp.addEventListener("click", () => {
  setAuthMode("signup");
  setAuthFeedback("");
});

openAuthModal.addEventListener("click", () => {
  setProfileMenuOpen(false);
  setAuthModalOpen(true);
});

closeAuthModal.addEventListener("click", () => {
  setAuthModalOpen(false);
});

authBackdrop.addEventListener("click", () => {
  setAuthModalOpen(false);
});

profileAvatarButton.addEventListener("click", () => {
  setProfileMenuOpen(profileMenu.hidden);
});

openProfilePanel.addEventListener("click", () => {
  setProfileMenuOpen(false);
  renderProfileSection("general");
  setProfilePanelOpen(true);
});

openAuthFromMenu.addEventListener("click", () => {
  setProfileMenuOpen(false);
  setAuthModalOpen(true);
});

closeProfilePanel.addEventListener("click", () => {
  setProfilePanelOpen(false);
});

profileBackdrop.addEventListener("click", () => {
  setProfilePanelOpen(false);
});

profileGeneralTab.addEventListener("click", () => renderProfileSection("general"));
profileAccountTab.addEventListener("click", () => renderProfileSection("account"));
profileNotificationsTab.addEventListener("click", () => renderProfileSection("notifications"));
profileApiUsageTab.addEventListener("click", () => renderProfileSection("apiUsage"));
profilePrivacyTab.addEventListener("click", () => renderProfileSection("privacy"));
profileTermsTab.addEventListener("click", () => renderProfileSection("terms"));
profileDeactivateTab.addEventListener("click", () => renderProfileSection("deactivate"));
profileDeleteTab.addEventListener("click", async () => {
  setActiveProfileTab("delete");
  if (!currentUser) {
    showAuthRequiredToast("Authentication required: Delete Account.");
    return;
  }
  await renderDeleteAccountSection();
});

if (authToastLogin) {
  authToastLogin.addEventListener("click", () => {
    hideAuthRequiredToast();
    setAuthModalOpen(true);
  });
}

if (authToastDismiss) {
  authToastDismiss.addEventListener("click", () => {
    hideAuthRequiredToast();
  });
}

document.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const clickedAvatar = target === profileAvatarButton || profileAvatarButton.contains(target);
  if (!profileMenu.hidden && !profileMenu.contains(target) && !clickedAvatar) {
    setProfileMenuOpen(false);
  }
});

function setLandingTab(tab) {
  const tabs   = [tabPreview, tabHtml, tabReact];
  const panels = [panelPreview, panelHtml, panelReact];
  tabs.forEach((t, i) => {
    const active = t === tab;
    t.classList.toggle("is-active", active);
    t.setAttribute("aria-selected", String(active));
    panels[i].hidden = !active;
  });
}

tabPreview.addEventListener("click", () => setLandingTab(tabPreview));
tabHtml.addEventListener("click",    () => setLandingTab(tabHtml));
tabReact.addEventListener("click",   () => setLandingTab(tabReact));

copyHtmlBtn.addEventListener("click", async () => {
  const text = landingHtmlOutput.textContent || "";
  if (!text.trim()) return;
  await navigator.clipboard.writeText(text).catch(() => {});
  copyHtmlBtn.textContent = "Copied!";
  setTimeout(() => { copyHtmlBtn.textContent = "Copy"; }, 1800);
});

copyReactBtn.addEventListener("click", async () => {
  const text = landingReactOutput.textContent || "";
  if (!text.trim()) return;
  await navigator.clipboard.writeText(text).catch(() => {});
  copyReactBtn.textContent = "Copied!";
  setTimeout(() => { copyReactBtn.textContent = "Copy"; }, 1800);
});

openPreviewTab.addEventListener("click", () => {
  const html = landingHtmlOutput.textContent || "";
  if (!html.trim()) {
    showMessage("Generate landing page code first.", true);
    return;
  }

  const preview = window.open("", "_blank");
  if (!preview) {
    showMessage("Popup blocked. Allow popups and try again.", true);
    return;
  }

  preview.document.open();
  preview.document.write(html);
  preview.document.close();
});

runStartupSplash();
syncAuthButtons(null);
renderProfileSection("general");
initSupabase();


// Gamified Wizard Logic
window.currentStep = 1;
window.nextStep = function(step) {
  document.querySelectorAll('.form-step').forEach(el => el.style.display = 'none');
  document.getElementById('step' + step).style.display = 'grid';
  document.querySelectorAll('.step-dot').forEach((el, index) => {
    if (index + 1 < step) el.className = 'step-dot completed';
    else if (index + 1 === step) el.className = 'step-dot active';
    else el.className = 'step-dot';
  });
};
window.prevStep = function(step) { window.nextStep(step); };

