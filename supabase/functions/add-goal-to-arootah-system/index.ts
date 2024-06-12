// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { SupabaseClient, createClient } from "https://esm.sh/@supabase/supabase-js@2.42.7";
import { corsHeaders } from "../_shared/cors.ts";
import { badResponse, internalServerError } from "../_shared/response-helpers.ts";

const arootahGoalManagerBaseUrl = Deno.env.get("AROOTAH_GOAL_MANAGER_URL");

const getReportEmail = async (supabase: SupabaseClient, reportId: string): Promise<string> => {
  const { data: reportData, error: reportError } = await supabase
    .from("reports")
    .select("email:webhook_id(email)")
    .eq("id", reportId)
    .single();

  if (reportError) {
    throw reportError;
  }

  return reportData.email.email as string;
};

const getMasterplanId = async (supabase: SupabaseClient, authToken: string, reportId: string): Promise<{ masterplanId: string, initialGoalId: string | undefined }> => {
  const email = await getReportEmail(supabase, reportId);

  const { data: masterplanIndexData, error: masterplanIndexError } = await supabase
    .from("masterplan_index")
    .select("masterplan_id")
    .eq("email", email)
    .maybeSingle();

  if (masterplanIndexError) {
    throw masterplanIndexError;
  }

  if (masterplanIndexData && masterplanIndexData.masterplan_id) {
    return { masterplanId: masterplanIndexData.masterplan_id, initialGoalId: undefined };
  }

  let masterplan = await tryFetchMasterplan(authToken);

  if (masterplan.masterplanId === undefined || masterplan.initialGoalId === undefined) {
    masterplan = await createMasterplan(authToken);
  }

  const { error: masterplanIndexUpsertError } = await supabase
    .from("masterplan_index")
    .upsert({ email: email, masterplan_id: masterplan.masterplanId }, { onConflict: "email" });

  if (masterplanIndexUpsertError) {
    throw masterplanIndexUpsertError;
  }

  return masterplan;
}

const tryFetchMasterplan = async (authToken: string): Promise<{ masterplanId: string | undefined, initialGoalId: string | undefined }> => {
  // Get domains first
  const domainsRes = await fetch(arootahGoalManagerBaseUrl + "/domains/", {
    headers: {
      Authorization: `Token ${authToken}`
    }
  });
  
  if (!domainsRes.ok) {
    console.error("Response body:", await domainsRes.text());
    if (domainsRes.status === 403) {
      throw new Error("Bad authentication token provided");
    }
    throw new Error("Arootah Goals returned a non-success status code when trying to fetch masterplans");
  }

  const domains = await domainsRes.json();
  const healthDomain = domains.find(d => d.name === "Health");

  // Check if domain exists (likely does in every case) and if it has an attached masterplan
  if (!healthDomain || healthDomain.current_state.id === null) {
    return { masterplanId: undefined, initialGoalId: undefined };
  }

  const masterplanId = healthDomain.current_state.id;

  // Get masterplan
  const masterplanRes = await fetch(arootahGoalManagerBaseUrl + `/masterplan/${masterplanId}/`, {
    headers: {
      Authorization: `Token ${authToken}`
    }
  });
  const masterplan = await masterplanRes.json();

  return {
    masterplanId: masterplanId,
    initialGoalId: masterplan.areas[0].goal.id
  };
};

const createMasterplan = async (authToken: string): Promise<{ masterplanId: string, initialGoalId: string }> => {
  // If not, create a new one
  const body = new FormData();
  body.set("journey", "00a3f92b-1b16-4e2c-b759-e32563882145"); // UUID is for the 'Life' journey
  const response = await fetch(arootahGoalManagerBaseUrl + "/masterplan/", {
    method: "POST",
    body: body,
    headers: {
      "Authorization": "Token " + authToken
    }
  });

  if (!response.ok) {
    console.error("Response body:", await response.text());
    if (response.status === 403) {
      throw new Error("Bad authentication token provided");
    }
    throw new Error("Arootah User Service returned a non-success status code when trying to create masterplan");
  }

  const { id: masterplanId, areas } = await response.json();

  // TODO: We might need to update/recreate the area here to name it 'GROWTH'

  return { masterplanId, initialGoalId: areas[0].goal.id };
};

const createGoal = async (masterplanId: string, authToken: string): Promise<string> => {
  const url = new URL(arootahGoalManagerBaseUrl + "/masterplan/generate_area_category/");
  url.searchParams.set("masterplan", masterplanId);
  url.searchParams.set("priority", "31");

  console.debug(url.toString());

  const response = await fetch(url.toString(), {
    headers: {
      "Authorization": "Token " + authToken
    }
  });

  if (!response.ok) {
    console.error("Response body:", await response.text());
    if (response.status === 403) {
      throw new Error("Bad authentication token provided");
    }
    throw new Error("Arootah User Service returned a non-success status code when trying to create new goal");
  }

  const category = await response.json();
  const newArea = category.areas.pop();

  return newArea.goal.id;
};

const updateGoal = async (goalId: string, goalName: string, categoryName: string, authToken: string): Promise<void> => {
  const url = arootahGoalManagerBaseUrl + `/goals/${goalId}/`;
  const body = new FormData();
  body.set("category_name", categoryName);
  body.set("goal_name", goalName);

  const response = await fetch(url, {
    method: "PATCH",
    body: body,
    headers: {
      "Authorization": "Token " + authToken
    }
  });

  if (!response.ok) {
    console.error("Response body:", await response.text());
    if (response.status === 403) {
      throw new Error("Bad authentication token provided");
    }
    throw new Error("Arootah User Service returned a non-success status code when trying to update goal");
  }
};

const checkTokenValidity = async (authToken: string): Promise<boolean> => {
  const response = await fetch(arootahGoalManagerBaseUrl + "/users/my_user/", {
    headers: {
      "Authorization": "Token " + authToken
    }
  });

  return response.status === 200;
};

Deno.serve(async (req) => {

  if (req.method === "OPTIONS") {
    return new Response("Ok", { headers: corsHeaders });
  }

  try {

    // Harvest data from query params and validate it
    const url = new URL(req.url);
    const subreportId = url.searchParams.get("subreport_id");
    if (!subreportId) {
      return badResponse({ message: "Missing subreportId query param" });
    }

    const goalIdx = url.searchParams.get("goal_idx");
    if (!goalIdx) {
      return badResponse({ message: "Missing goalIdx query param" });
    }

    const token = url.searchParams.get("token");
    if (!token) {
      return badResponse({ message: "Missing token query param" });
    }

    if (!(await checkTokenValidity(token))) {
      return badResponse({ message: "Provided token is invalid" });
    }

    console.debug("Incoming request for adding a new goal...");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: {
            Authorization:
              "Bearer " + Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
          },
        },
      }
    );

    // Fetch subreport
    const fetchSubreportStart = Date.now();
    console.debug("Fetching subreport...");

    const { data: subreportData, error: subreportError } = await supabase
                                    .from("subreports")
                                    .select(`
                                            report_id,
                                            goals,
                                            principle:principle_id(name)
                                            `)
                                    .eq("id", subreportId)
                                    .single();

    if (subreportError) {
      return badResponse({ message: subreportError.message });
    }

    console.debug(`Found subreport in ${Date.now() - fetchSubreportStart}ms`);

    const fetchMasterplanStart = Date.now();
    console.debug("Getting masterplan...");

    // Get masterplan, check if the current report already has one
    // if not, create a new one and return the id along with the initial goal id
    const { masterplanId, initialGoalId } = await getMasterplanId(supabase, token, subreportData.report_id);
    let goalId = initialGoalId;

    console.debug(`Found masterplan in ${Date.now() - fetchMasterplanStart}ms`);

    // Check if we got a goal id from new masterplan creation
    // if not, create a new goal
    if (!goalId) {
      // Create new goal
      const newGoalCreationStart = Date.now();

      console.debug("Creating new goal...");

      goalId = await createGoal(masterplanId, token);

      console.debug(`New goal creation took ${Date.now() - newGoalCreationStart}ms`);
    }

    const goals = subreportData.goals;
    const goal = goals[goalIdx];
    const updateGoalStart = Date.now();

    console.debug("Starting to update goal in Arootah system...");

    await updateGoal(goalId as string, goal.goal, subreportData.principle.name, token);

    console.debug(`Updating goal in Arootah system took ${Date.now() - updateGoalStart}ms`);

    const updateInternalGoalStart = Date.now();
    console.debug("Starting to update internal goal state...");

    goals[goalIdx].added = true;
    const { error: updateGoalError } = await supabase
                                              .from("subreports")
                                              .update({
                                                goals: goals
                                              })
                                              .eq("id", subreportId);

    if (updateGoalError) {
      throw updateGoalError;
    }

    console.debug(`Updating internal goal state took ${Date.now() - updateInternalGoalStart}ms`);

    return new Response("Ok", { headers: corsHeaders });
  } catch (err) {
    console.error(err);
    return internalServerError(err.message);
  }
});
