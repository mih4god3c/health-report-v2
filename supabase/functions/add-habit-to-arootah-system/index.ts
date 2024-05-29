// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.7";
import { corsHeaders } from "../_shared/cors.ts";
import { badResponse, internalServerError } from "../_shared/response-helpers.ts";
import { getStartOfWeek, getEndOfWeek } from "../_shared/date-helper.ts";

const arootahHATBaseUrl = Deno.env.get("AROOTAH_HAT_URL");

const getStartOfWeekFormatted = (): string => getStartOfWeek().toISOString().split("T")[0];
const getEndOfWeekFormatted = (): string => getEndOfWeek().toISOString().split("T")[0];

const getAndValidateHATUserInfo = async (principle: string, authToken: string)
  : Promise<{ success: boolean, userId: number | undefined, areaId: number | undefined, subcategoryId: number | undefined, nextHabitWeight: number }> => {
  const start = getStartOfWeekFormatted();
  const end = getEndOfWeekFormatted();
  const url = new URL(arootahHATBaseUrl + "/userinfo/");
  url.searchParams.set("start_date", start);
  url.searchParams.set("end_date", end);

  const response = await fetch(url.toString(), {
    headers: {
      "Authorization": "Token " + authToken
    }
  });

  if (!response.ok) {
    console.error("Response body:", await response.text());
    if (response.status === 403) {
      return { success: false, userId: undefined, areaId: undefined };
    }
    throw new Error("Arootah Habit Tracker returned a non-success status code when trying to fetch user");
  }

  const result = await response.json();
  const area = result.results.userArea.find(a => a.system_area_name.id === 9);

  if (area.userCategories) {
    const category = area.userCategories.find(c => c.custom_category_name === principle);
    const subcategory = category?.userSubCategories?.find(sc => sc.custom_subcategory_name === principle);

    if (subcategory) {
      if (subcategory.userHabits.length === 10) {
        throw new Error(`Subcategory ${principle} already full`);
      }

      if (subcategory.userHabits.length > 0) {
        return { success: true, userId: area.user, areaId: area.area, subcategoryId: subcategory.customsubcategory, nextHabitWeight: 10 - subcategory.userHabits.length };
      }

      return { success: true, userId: area.user, areaId: area.area, subcategoryId: subcategory.customsubcategory, nextHabitWeight: 10 };
    }
  }

  return { success: true, userId: area.user, areaId: area.area, subcategoryId: undefined, nextHabitWeight: 10 };
};

const addHabit = async (principle: string, habit: string, habitWeight: number, area: number, subcategoryId: number, userId: number, authToken: string): Promise<void> => {
  const start = getStartOfWeekFormatted();
  const end = getEndOfWeekFormatted();
  let body: any = {
    custom_habit_name: habit,
    note: "",
    weight: habitWeight,
    type: 0,
    start_date: start,
    end_date: end,
    motivation: "",
    trigger: "",
    obstacle: "",
    belief: "",
    is_category_create: false,
    is_subcategory_create: false,
    is_key_stone_habit: false,
    habit_status: "Current",
    periodic_time: null,
    is_periodic: false,
    is_private: false,
    user_id: userId
  };

  if (habitWeight === 10) {
    body.is_category_create = true;
    body.is_subcategory_create = true;

    body = {
      ...body,
      category: {
        system_category_name: null,
        custom_category_name: principle,
        description: "",
        parent_area: area,
        weight: 10
      },
      subcategory: {
        parent_category: principle,
        custom_subcategory_name: principle,
        system_subcategory_name: null,
        weight: 10
      }
    };
  } else {
    body = {
      ...body,
      parent_subcategory: subcategoryId
    };
  }

  console.debug(body);

  const response = await fetch(arootahHATBaseUrl + "/userhabit/", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Token " + authToken
    }
  });

  if (!response.ok) {
    console.error(await response.text());
    if (response.status === 403) {
      throw new Error("Bad authentication token provided");
    }
    throw new Error("Arootah HAT backend returned a non-success status code when trying to add a habit");
  }
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
      return badResponse({ message: "Missing subreport_id query param" });
    }

    const habitIdx = url.searchParams.get("habit_idx");
    if (!habitIdx) {
      return badResponse({ message: "Missing habit_idx query param" });
    }

    const token = url.searchParams.get("token");
    if (!token) {
      return badResponse({ message: "Missing token query param" });
    }

    console.debug("Incoming request for adding a new habit...");

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

    const fetchSubreportStart = Date.now();
    console.debug("Fetching subreport...");

    const { data: subreportData, error: subreportError } = await supabase
                                    .from("subreports")
                                    .select(`
                                            report_id,
                                            habits,
                                            principle:principle_id(name)
                                            `)
                                    .eq("id", subreportId)
                                    .single();

    if (subreportError) {
      return badResponse({ message: subreportError.message });
    }

    console.debug(`Found subreport in ${Date.now() - fetchSubreportStart}ms`);

    // Validate token
    const userTokenValidationStart = Date.now();
    console.debug("Validating user token and fetching area data...");

    const principle = subreportData.principle.name;
    const { success, userId, areaId, subcategoryId, nextHabitWeight } = await getAndValidateHATUserInfo(principle, token);

    if (!success) {
      return badResponse({ message: "Bad authentication token provided" });
    }

    console.debug(`User token validation and data fetching took ${Date.now() - userTokenValidationStart}ms`);

    const habits = subreportData.habits;

    const addHabitStart = Date.now();
    console.debug("Adding habit...");

    await addHabit(principle, habits[habitIdx].habit, nextHabitWeight, areaId as number, subcategoryId as number, userId as number, token);

    console.debug(`Habit added in ${Date.now() - addHabitStart}ms`);

    habits[habitIdx].added = true;

    const updateInternalHabitStateStart = Date.now();
    console.debug("Updating internal habit state...");

    const { error: subreportUpdateError } = await supabase
                                    .from("subreports")
                                    .update({ habits: habits })
                                    .eq("id", subreportId);
    
    if (subreportUpdateError) {
      throw subreportUpdateError;
    }

    console.debug(`Updating internal habit state took ${Date.now() - updateInternalHabitStateStart}ms`);

    return new Response("Ok", { headers : corsHeaders });
  } catch (error) {
    console.error(error);
    return internalServerError(error.message);
  }
});
