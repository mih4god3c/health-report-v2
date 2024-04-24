import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from '../_shared/cors.ts'

const generatePrompt = async (supabase: any, promptTemplate: any, principles: any) => {

  const promptRole = promptTemplate.role;
  const promptGoal = promptTemplate.goal;
  let promptFormat = JSON.stringify(promptTemplate.output_format, null, 2);
  const promptRules = promptTemplate.rules;

  // Remove slashes, newlines and extra spaces from promptFormat
  promptFormat = promptFormat.replace(/\\/g, "");


  // Create a dictionary to store prompt for each principle, add a key for each principle
  const prompts:any = [];
 
  // Generate a prompt for each principle name
  for (const principle of principles) {
    let promptObj = {
      "principle": principle.name,
      "role": promptTemplate.role,
      "prompt_text": ""
    };
    let prompt = "Act as a " + promptRole 
    prompt += " Your goal is: " + promptGoal;
    prompt += "The principle you are designing for is: " + principle.name + ". ";
    prompt += "You should ouput in the following JSON format: " + promptFormat;
    prompt += " Rules: ";
    for (const rule of promptRules) {
      // Dont add the last rule with an ampersand
      if (rule === promptRules[promptRules.length - 1]) {
        prompt += rule;
        break;
      }
      prompt += rule + " & ";
    }
    promptObj.prompt_text = prompt;
    prompts.push(promptObj);
  }

  return prompts;
}

const getPromptTemplate = async (supabase: any, assesmentId: string) => {
  // Fetch prompt template from promts table where assesment_id is equal to assesmentId, and active is true, return first sorted by version
  const { data, error } = await supabase
    .from("prompts")
    .select("*")
    .eq("assesment_id", assesmentId)
    .eq("active", true)
    .order("version", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  // If no prompt template found, throw an error
  if (data.length === 0) {
    throw new Error("Prompt template not found");
  }

  return data[0];
}

const getWebhook = async (supabase: any, webhookId: string) => {
  const { data, error } = await supabase
    .from("webhooks")
    .select("*")
    .eq("id", webhookId);
  if (error) {
    throw new Error(error.message);
  }

  // If no webhook found, throw an error
  if (data.length === 0) {
    throw new Error("Webhook not found");
  }

  return data[0];
}

const getPrinciples = async (supabase: any, assesmentId: string) => {
  const { data, error } = await supabase
    .from("principles")
    .select("*")
    .eq("assesment_id", assesmentId);
  if (error) {
    throw new Error(error.message);
  }
  return data;
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

    // A row from webhooks table
    const webhookId = data.webhook_id;

    // Get webhook
    const webhook = await getWebhook(supabase, webhookId);

    // Get principles
    const principles = await getPrinciples(supabase, webhook.assesment_id);
    
    // Get prompt template
    const promptTemplate = await getPromptTemplate(supabase, webhook.assesment_id);

    // Generate prompt
    const prompts = await generatePrompt(supabase, promptTemplate, principles);

    
    // Return data as response
    return new Response(
      JSON.stringify({
        message: "Prompt generated successfully",
        prompts: prompts,
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
