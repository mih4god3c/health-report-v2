import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from '../_shared/cors.ts'
import OpenAI from "https://deno.land/x/openai@v4.20.1/mod.ts";
import { sendEmail } from "../_shared/email-helper.ts";

const openai = new OpenAI(Deno.env.get("OPENAI_API_KEY") ?? "");
const coachingEmail = "gasper@thecalda.com";

const patchWebhook = async (supabase: any, webhookId: string) => {
  // Set the email_sent field to true
  const { data, error } = await supabase
    .from("webhooks")
    .update({ email_sent: true })
    .eq("id", webhookId);

  if (error) {
    throw new Error(error.message);
  }
  return data;
}

const sendEmailWithURL = async (email: string, id: number) => {
  const baseUrl = "https://insights.arootah.com";
  const finalUrl = `${baseUrl}/?submissionId=${id}`;

  const body = {
    "from": {
      "email": "support@arootah.com",
    },
    "personalizations": [
      {
        "to": [
          {
            "email": email,
          },
        ],
        "dynamic_template_data": {
          "report_url": finalUrl,
        },
      },
    ],
    "template_id": "d-0501dcc333324f2295161d5daa1d339f",
  };

  await sendEmail(body);
}

const insertSubreports = async (supabase: any, subreports: any, reportId: string, principles:any,scoreDict:any) => {
  // Insert subreports
  for (let subreport of subreports) {
    // Find the principle_id for the subreport
    const principle = principles.find((p:any) => p.name === subreport.principle);
    // Find the score for the principle, based on the name_mapping in the scoreDict
    const score = scoreDict[principle.name_mapping];
    // Insert the subreport
    const { data, error } = await supabase
      .from("subreports")
      .insert([
        {
          report_id: reportId,
          principle_id: principle.id,
          result: subreport.results,
          analysis: subreport.analysis,
          highlight: subreport.highlight,
          goals: subreport.goals,
          habits: subreport.habits,
          score: score,
          openai_payload: subreport
        },
      ]);

    if (error) {
      throw new Error(error.message);
    }
  }

    return "Subreports inserted";
}

const getPrinciples = async (supabase: any, assesmentId: string) => {
  // Fetch principles from principles table where assesment_id is equal to assesmentId
  const { data, error } = await supabase
    .from("principles")
    .select("*")
    .eq("assesment_id", assesmentId);

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

const parseResponses = async (supabase: SupabaseClient, openAiResponses: any, reportId: string): Promise<any[]> => {

  console.debug("Started parsing prompts...");

  console.debug(`Parsing prompts: `, openAiResponses);

  // Make a copy of oepnAiResponses
  const parsedResponses: any = [];

  for (const res of openAiResponses) {
    // Replace escaped backslashes with single backslashes
    const responseString = res.replace(/\\\\"/g, '\\"').replaceAll("```json", "").replaceAll("```", "");
    const { error } = await supabase
                              .from("reports")
                              .update({ openai_response_cleaned: responseString })
                              .eq("id", reportId);

    if (error) {
      throw error;
    }

    const response = JSON.parse(responseString);

    // Parse goals and habits to an array of strings
    response.goals = JSON.parse(response.goals).map((g: string) => { return { id: "", goal: g, added: false }; });
    response.habits = JSON.parse(response.habits).map((h: string) => { return { id: "", habit: h, added: false }; });

    // Remove extra double quotes from results, analysis, highlight and principle
    response.results = response.results.replace(/"/g, "");
    response.analysis = response.analysis.replace(/"/g, "");
    response.highlight = response.highlight.replace(/"/g, "");
    response.principle = response.principle.replace(/"/g, "");

    // Remove backslashes from results, analysis, highlight and principle
    response.results = response.results.replace(/\\/g, "");
    response.analysis = response.analysis.replace(/\\/g, "");
    response.highlight = response.highlight.replace(/\\/g, "");
    response.principle = response.principle.replace(/\\/g, "");

    parsedResponses.push(response);
  }
  return parsedResponses;
}

const generateResponse = async (prompt: string) => {
  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "gpt-4-turbo-preview",
    max_tokens: 2064,
    temperature: 0.5,
  });

  return chatCompletion.choices[0].message.content
}

const createReport = async (supabase: any, record: any) => {
  // Insert and select the newly created record
  const { data, error } = await supabase
    .from("reports")
    .insert([
      {
        webhook_id: record.id,
        assesment_id: record.assesment_id,
        score: record.total_avg,
      },
    ])
    .select("*");

  if (error) {
    throw new Error(error.message);
  }
  return data[0];
}

const generatePrompts = async (supabase: any, record: any) => {
  // Make a call to the generate-prompt edge function
  const { data, error } = await supabase
  .functions
  .invoke("generate-prompt", {
    body: JSON.stringify({
      "webhook_id": record.id,
    })
  })

  if (error) {
    throw new Error(error.message);
  }

  return data.prompts;
}


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

    const data = await req.json();
    const record = data.record;

    // Create a report
    const report = await createReport(supabase, record);

    // Generate prompts
    const prompts = await generatePrompts(supabase, record);

    console.debug("Generated prompts...");

    const subreportsStart = Date.now();
    
    console.debug("Starting to prompt OpenAI API for subreports...");

    // Generate response for every prompt in the prompts array, prompt_text is the key
    const openAiResponse = await Promise.all(prompts.map(async (prompt: any) => {
      return generateResponse(prompt.prompt_text);
    }));

    const { error: reportUpdateError } = await supabase
                                                .from("reports")
                                                .update({ openai_response: JSON.stringify(openAiResponse) })
                                                .eq("id", report.id);

    if (reportUpdateError) {
      throw reportUpdateError;
    }

    console.debug(`Got subreports, took ${Date.now() - subreportsStart}ms`);

    const subreportParsingStart = Date.now();

    console.debug("Parsing reports...");
    // Parse responses and wait for all of them to be parsed
    const parsedResponses = await parseResponses(supabase, openAiResponse, report.id);

    console.debug(`Parsing took ${Date.now() - subreportParsingStart}ms`);

    console.debug("Started summary generation...");
    const combinedAnalysis = parsedResponses.reduce((analysis: string, response: { analysis: string }) => analysis += ` ${response.analysis}`, "");
    console.debug(`Summary will be generated based on the following combined analysis: ${combinedAnalysis}`);

    console.debug("Sending prompt to OpenAI API...");

    const analysisStart = Date.now();
    const reducedAnalysis = await generateResponse(`Write a very short summary, maximum of 28 words of the following analysis: ${combinedAnalysis}`);
    const duration = Date.now() - analysisStart; 

    console.debug(`Response generation took ${duration}ms`);

    const { error } = await supabase
                            .from("reports")
                            .update({ summary: reducedAnalysis })
                            .eq("id", report.id);

    if (error) throw error;

    // Get principles
    const principles = await getPrinciples(supabase, record.assesment_id);

    const insertingSubreportsStart = Date.now();
    console.debug("Inserting subreports...");

    // Insert subreports
    await insertSubreports(supabase, parsedResponses, report.id, principles, record.score_dict);

    console.debug(`Inserting subreports took ${Date.now() - insertingSubreportsStart}ms`);

    const emailStart = Date.now();

    console.debug(`Sending email to ${coachingEmail}...`);

    // Send email with URL
    await sendEmailWithURL(coachingEmail, report.id);

    console.debug(`Email sending took ${Date.now() - emailStart}ms`);

    const patchingWebhookStart = Date.now();

    console.debug("Patching webhook...");
    // Patch webhook
    await patchWebhook(supabase, record.id);

    console.debug(`Patching webhook took ${Date.now() - patchingWebhookStart}ms`);

    // Return data as response
    return new Response(
      JSON.stringify({
        message: "Report generated successfully",
        // parseResponses: parsedResponses,
        // principles: principles,
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
});
