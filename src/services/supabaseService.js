const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const requireEmailConfirmation = String(process.env.AUTH_REQUIRE_EMAIL_CONFIRMATION || "true") === "true";
const termsVersion = process.env.AUTH_TERMS_VERSION || "2026-03-11";
const requiredProfileFields = ["full_name", "date_of_birth", "headline", "bio"];

function getUserMetadata(user) {
  return user?.user_metadata && typeof user.user_metadata === "object" ? user.user_metadata : {};
}

function getMissingProfileFields(user) {
  const metadata = getUserMetadata(user);
  return requiredProfileFields.filter((field) => !String(metadata[field] || "").trim());
}

function assertEligibleUser(user, options = {}) {
  const {
    requireProfile = false,
    requireTermsAcceptance = false,
    requireTwoStepPreference = false
  } = options;

  const metadata = getUserMetadata(user);

  if (requireProfile) {
    const missingFields = getMissingProfileFields(user);
    if (missingFields.length > 0) {
      throw new Error(`Complete your profile before continuing. Missing: ${missingFields.join(", ")}.`);
    }
  }

  if (requireTermsAcceptance) {
    const acceptedAt = String(metadata.terms_accepted_at || "").trim();
    const safetyAcceptedAt = String(metadata.safety_acknowledged_at || "").trim();
    const acceptedVersion = String(metadata.terms_version || "").trim();

    if (!acceptedAt || !safetyAcceptedAt || acceptedVersion !== termsVersion) {
      throw new Error("You must accept the latest safety terms and conditions before continuing.");
    }
  }

  if (requireTwoStepPreference && !String(metadata.two_step_preference || "").trim()) {
    throw new Error("Select a 2-step verification preference in your account before continuing.");
  }
}

function getSupabaseClient() {
  if (!supabaseUrl || !supabaseServiceRoleKey) return null;
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

function getPublicSupabaseConfig() {
  return {
    supabaseUrl: supabaseUrl || "",
    supabaseAnonKey: supabaseAnonKey || ""
  };
}

async function getUserFromBearerToken(authHeader) {
  const token = (authHeader || "").replace("Bearer ", "").trim();
  if (!token) throw new Error("Missing bearer token");

  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase server config missing");

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) throw new Error("Invalid auth token");

  if (requireEmailConfirmation && !data.user.email_confirmed_at) {
    throw new Error("Email confirmation required. Please verify your email first.");
  }

  return { user: data.user, supabase };
}

async function requireEligibleUser(authHeader, options = {}) {
  const { user, supabase } = await getUserFromBearerToken(authHeader);
  assertEligibleUser(user, options);
  return { user, supabase };
}

async function saveProjectHistory({ authHeader, payload }) {
  const { user, supabase } = await getUserFromBearerToken(authHeader);

  const { error, data } = await supabase
    .from("startup_projects")
    .insert({
      user_id: user.id,
      idea_input: payload.ideaInput,
      blueprint: payload.blueprint,
      landing_code: payload.landingCode || null
    })
    .select("id, created_at")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

async function listProjectHistory(authHeader) {
  const { user, supabase } = await getUserFromBearerToken(authHeader);

  const { data, error } = await supabase
    .from("startup_projects")
    .select("id, created_at, idea_input, blueprint, landing_code")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) throw new Error(error.message);
  return data || [];
}

  async function getPublicFeed() {
    const supabaseApiKey = process.env.SUPABASE_ANON_KEY;
    const supabaseUrl = process.env.SUPABASE_URL;

    if (!supabaseApiKey || !supabaseUrl) {
      throw new Error("Supabase internal config missing");
    }

    const { createClient } = require("@supabase/supabase-js");
    const adminClient = createClient(supabaseUrl, supabaseApiKey);

    const { data, error } = await adminClient
      .from("startup_projects")
      .select("id, created_at, idea_input, blueprint, landing_code")
      .order("created_at", { ascending: false })
      .limit(25);

    if (error) throw new Error(error.message);
    return data || [];
  }

async function deleteAccount({ authHeader, confirmText, confirmEmail }) {
  const { user, supabase } = await getUserFromBearerToken(authHeader);

  const expectedPhrase = "DELETE MY ACCOUNT";
  if (String(confirmText || "").trim() !== expectedPhrase) {
    throw new Error(`Invalid confirmation phrase. Type exactly: ${expectedPhrase}`);
  }

  const normalizedEmail = String(confirmEmail || "").trim().toLowerCase();
  if (!normalizedEmail || normalizedEmail !== String(user.email || "").trim().toLowerCase()) {
    throw new Error("Confirmation email does not match signed-in account.");
  }

  const { error: projectDeleteError } = await supabase.from("startup_projects").delete().eq("user_id", user.id);
  if (projectDeleteError) {
    throw new Error(`Unable to remove project history: ${projectDeleteError.message}`);
  }

  // Best-effort cleanup for optional profile images.
  const { data: profileAssets, error: listAssetsError } = await supabase.storage
    .from("profile-assets")
    .list(user.id, { limit: 100, offset: 0 });

  if (!listAssetsError && Array.isArray(profileAssets) && profileAssets.length > 0) {
    const objectPaths = profileAssets.map((item) => `${user.id}/${item.name}`);
    await supabase.storage.from("profile-assets").remove(objectPaths);
  }

  const { error: userDeleteError } = await supabase.auth.admin.deleteUser(user.id);
  if (userDeleteError) {
    throw new Error(`Unable to delete auth account: ${userDeleteError.message}`);
  }

  return {
    ok: true,
    deletedUserId: user.id
  };
}

module.exports = {
  getPublicSupabaseConfig,
  getMissingProfileFields,
  requireEligibleUser,
  saveProjectHistory,
  listProjectHistory,
  getPublicFeed,
  deleteAccount
};
