import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from '../_shared/cors.ts'
import { validateSignature } from "../_shared/webhook-signature-validator.ts";
import { tryCreateArootahAccount } from "../_shared/arootah-account-helper.ts";
import { sendNewAccountEmail } from "../_shared/email-helper.ts";
import { insertToWebhooks } from "../_shared/webhook-helpers.ts";

const parsePayload = (payload: any, assessmentId: string) => {

  const answers = payload.form_response.answers.filter(a => a.type === "choice");
  const questions = payload.form_response.definition.fields.filter(q => q.type === "multiple_choice");
  const email = payload.form_response.hidden.email;
  const formId = payload.form_response.form_id;
  const totalWeightedAvg = payload.form_response.calculated.score;
  const scoreKeyRegex = /p\d{1,2}_score/;
  const variables = payload.form_response.variables.filter(v => scoreKeyRegex.test(v.key)).sort((a, b) => {
    const matchA = +a.key.match(scoreKeyRegex)[0];
    const matchB = +b.key.match(scoreKeyRegex)[0];
    return matchA - matchB;
  });
  const scoreDict = {
    start_with_mindset: variables[0].number,
    structure_your_sales_strategy: variables[1].number,
    empower_sales_through_marketing: variables[2].number,
    build_rapport: variables[3].number,
    master_effective_communication: variables[4].number,
    qualify_leads_and_opportunities: variables[5].number,
    handle_objections_and_overcome_resistances: variables[6].number,
    close_the_sale: variables[7].number,
    assemble_a_winning_team: variables[8].number,
    transform_operations: variables[9].number
  };

  const questionAnswerMap = answers.map(a => {
    const question = questions.find(q => q.id === a.field.id);

    return {
      question: question.title,
      answer: a.choice.label,
      type: question.type
    };
  });

  return {
    formId,
    totalWeightedAvg,
    email,
    assesmentId: assessmentId,
    questionAnswerMap,
    scoreDict
  };
};

Deno.serve(async (req) => {
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

    const payloadRaw = await req.text();
    const payload = JSON.parse(payloadRaw);

    // Read the Typeform-Signature header
    // const header = req.headers.get("typeform-signature");
    //
    // if (!header || !validateSignature(payloadRaw, header)) {
    //   return new Response(JSON.stringify({ message: "Bad signature" }), { status: 400 });
    // }

    // Insert the payload to the mock_payloads table
    const { error } = await supabase
      .from("mock_payloads")
      .insert([
        {
          payload: payload,
          type: 'sales'
        },
      ])
      .select("id");

    if (error) {
      throw new Error(error.message);
    }

    const { data: assessmentId, error: assessmentIdErr } = await supabase
      .from("assesments")
      .select("id")
      .eq("typeform_id", payload.form_response.form_id)
      .single();

    if (assessmentIdErr) {
      throw assessmentIdErr;
    }

    // Parse the payload
    const payloadParsed = parsePayload(payload, assessmentId.id);

    // Insert the payload to the database
    await insertToWebhooks(supabase, payload, payloadParsed);

    const password = await tryCreateArootahAccount(supabase, payloadParsed.email, "Health Assessment");

    if (password) {
      await sendNewAccountEmail(payloadParsed.email, password);
    }

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
    console.error(error);
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
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/webhook-handler-sales' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
