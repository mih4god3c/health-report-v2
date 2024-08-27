import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from '../_shared/cors.ts'

// CONST DICTIONARY TO MAP FORM_ID
const FORM_ID_MAP = {
  "ZTi5SsvB": "e925ac5d-baa2-4131-883e-cb01d6d5ab6e"
}

const parsePayload = async (supabase: SupabaseClient, payload:any) => {

  const formResponse = payload.form_response;
  const formId = formResponse.form_id;

  // Get assessment
  const { data: assessment, error: assessmentErr } = await supabase
    .from("assesments")
    .select("id")
    .eq("typeform_id", formId)
    .single();

  if (assessmentErr) {
    throw assessmentErr;
  }

  // Get principles
  const { data: principles, error: principlesErr } = await supabase
    .from("principles")
    .select("name_mapping, question_answer_config, score_path")
    .eq("assesment_id", assessment.id);

  if (principlesErr) {
    throw principlesErr;
  }

  const scoreDict = 
 
  const result = {
    formId,
    totalWeightedAvg,
    email,
    assesmentId: assessment.id,
    questionAnswerMap,
    scoreDict
  };

  return result;
}
  
 
const insertToWebhooks = async (supabase: any, payload: any, payloadParsed:any) => {
  // Insert the whole payload to the payload column as text and return the result
  const { data: insertData, error } = await supabase
    .from("webhooks")
    .insert([
      {
        payload: payload,
        payload_parsed: payloadParsed,
        email: payloadParsed.email,
        assesment_id: payloadParsed.assesmentId,
        total_avg: payloadParsed.totalWeightedAvg,
        score_dict: payloadParsed.scoreDict,
      },
    ])
    .select("id");

  if (error) {
    throw new Error(error.message);
  }
  return insertData;
};


serve(async (req) => {

  // Enable CORS
  if (req.method === "OPTIONS") {
    return new Response("Ok", { headers: corsHeaders });
  }

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

  try {

    const payload = await req.json();

    // Read the Typeform-Signature header
    const header = req.headers.get("typeform-signature");

    // Insert the payload to the mock_payloads table
    const { data: insertData, error } = await supabase
      .from("mock_payloads")
      .insert([
        {
          payload: payload,
        },
      ])
      .select("id");

    if (error) {
      throw new Error(error.message);
    }

    // Parse the payload
    // const payloadParsed = await parsePayload(payload);

    // Insert the payload to the database
    // await insertToWebhooks(supabase,payload,payloadParsed);

    // Return data as response
    return new Response(
      JSON.stringify({
        message: "Webhook received",
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: error.message,
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
        status: 400,
      }
    );
  }
});
