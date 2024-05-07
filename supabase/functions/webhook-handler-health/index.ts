import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from '../_shared/cors.ts'

// CONST DICTIONARY TO MAP FORM_ID
const FORM_ID_MAP = {
  "ZTi5SsvB": "e925ac5d-baa2-4131-883e-cb01d6d5ab6e"
}

const parsePayload = (payload:any) => {

  const formResponse = payload.form_response;
  const formId = formResponse.form_id;
  const answers = formResponse.answers;
  const questions = formResponse.definition.fields;
  const variables = formResponse.variables
  const totalWeightedAvg = variables.find((variable:any) => variable.key === "total_weighted_avg")?.number; 
  const email = answers.find((answer:any) => answer.field.type === "email")?.email;

  const scoreKeys = [
    "prevention_score",
    "sleep_score",
    "nutriton_score",
    "structure_score",
    "exercise_score",
    "weight_management_score",
    "perils_score",
    "detoxification_score",
    "stress_score",
    "longevity_score"
  ];
  
  const scoreDict = {};
  scoreKeys.forEach(key => {
    const variable = variables.find(variable => variable.key === key);
    scoreDict[key.replace('_score', '')] = variable ? variable.number : null;
  });

  // Map question answer pairs to a dictionary with question, answer and type
  let questionAnswerMap = answers.map((answer:any) => {
    // Question must not be Full Name or Email
    const question = questions.find((question:any) => question.id === answer.field.id);

    return {
      question: question.title,
      answer: answer.choice?.label ?? answer.text,
      type: question.type,
    };
  }
  );

  // Remove the questions where question is Email of Full Name
  questionAnswerMap = questionAnswerMap.filter((qa:any) => qa.question !== "Email" && qa.question !== "Full Name");

 
  const data = {
    formId,
    totalWeightedAvg,
    email,
    assesmentId: FORM_ID_MAP[formId],
    questionAnswerMap,
    scoreDict
  };

  return data;
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
    // const header = req.headers.get("typeform-signature");

    // Insert the payload to the mock_payloads table
    const { data: insertdata, error } = await supabase
      .from("mock_payloads")
      .insert([
        {
          payload: payload,
          type: 'health'
        },
      ])
      .select("id");

    if (error) {
      throw new Error(error.message);
    }

    // Parse the payload
    const payloadParsed = parsePayload(payload);

    // Insert the payload to the database
    await insertToWebhooks(supabase,payload,payloadParsed);

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
