import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from '../_shared/cors.ts';
import { tryCreateArootahAccount } from "../_shared/arootah-account-helper.ts";
import { sendNewAccountEmail } from "../_shared/email-helper.ts";
// import { validateSignature } from "../_shared/webhook-signature-validator.ts";

// CONST DICTIONARY TO MAP FORM_ID
const FORM_ID_MAP = {
  "Y4AKTX5W": "96b17328-8ba8-4828-b250-d886458ed5d0"
}

const PRINCIPLES_WITH_QUESTIONS = {
    "p1": [
        "How do you handle overlapping priorities from different projects within the same week?",
        "When planning your week, how do you allocate time to your tasks?",
        "If an unexpected task arises, how do you integrate it into your schedule?"
    ],
    "p2": [
        "Do you have a written mission statement for your business and personal career?",
        "How often do you review and adjust your goals?",
        "How clear are you on your overall purpose in life and business, and how does it guide your daily actions?"
    ],
    "p3": [
        "Do you have a defined process in place for scheduling your week?",
        "How do you manage follow-ups from meetings, emails, and other communications?",
        "What procedures do you have in place for meetings?"
    ],
    "p4": [
        "Do you use a habit tracker or similar tool to monitor your daily habits?",
        "How do you approach the process of instilling new positive habits?",
        "What method do you use to eradicate habits that negatively impact your time management?"
    ],
    "p5": [
        "How much time do you typically spend on social media and watching TV on a daily basis?",
        "How often do you practice meditation or any other mindfulness exercises to improve focus?",
        "How often do you find yourself consciously choosing where to direct your focus during work sessions?"
    ],
    "p6": [
        "How many hours of sleep do you typically get on a nightly basis?",
        "Are you aware of your circadian rhythms, and do you schedule important tasks when you have the most energy?",
        "How often do you engage in physical exercise?"
    ],
    "p7": [
        "How do you typically handle your tax preparation?",
        "How well do you recognize the signs of procrastination in your behavior?",
        "How would you rate your level of self-discipline in resisting procrastination?This question is required."
    ],
    "p8": [
        "Would you spend 10 hours teaching someone a task that takes you 10 minutes but needs to be done daily? Why?",
        "How do you decide which tasks to delegate?",
        "How well do you communicate your expectations when delegating tasks?"
    ],
    "p9": [
        "Which types of technology do you regularly use to manage your time and tasks?",
        "Have you automated any of your routine tasks using technology?",
        "How well is technology integrated into your daily workflow?"
    ],
    "p10": [
        "How often do you find yourself fully absorbed in the task at hand?",
        "In meetings or conversations, how present are you with the other person or people involved?",
        "How do you handle the feeling of being overwhelmed by future tasks or past regrets?"
    ]
};

const parsePayload = (payload: any) => {

  const formResponse = payload.form_response;
  const formId = formResponse.form_id;
  const hiddenAnswers = formResponse.hidden;
  const email = hiddenAnswers.email;

  const scoreDict = {
      "prioritization": +hiddenAnswers.p1,
      "purpose": +hiddenAnswers.p2,
      "process": +hiddenAnswers.p3,
      "habits": +hiddenAnswers.p4,
      "distractions": +hiddenAnswers.p5,
      "energy": +hiddenAnswers.p6,
      "procrastination": +hiddenAnswers.p7,
      "delegation": +hiddenAnswers.p8,
      "technology": +hiddenAnswers.p9,
      "mindfulness": formResponse.calculated.score
  };
  const totalWeightedAvg = Object.values(scoreDict)
    .reduce((acc, currValue) => acc += currValue, 0) / 10;

  // Parse out all the answers from the "hidden" object
  const answerKeyRegex = new RegExp(/p\dq\d$/);
  const answerKeys = Object.keys(hiddenAnswers)
    .filter(key => key.match(answerKeyRegex))

  // Map question answer pairs to a dictionary with question, answer and type
  let questionAnswerMap = answerKeys.map((answerKey: string) => {
      const principleKey = answerKey.substring(0, 2);
      const questionIndex = +answerKey.substring(3) - 1;

      return {
        question: PRINCIPLES_WITH_QUESTIONS[principleKey][questionIndex],
        answer: hiddenAnswers[answerKey],
        type: "multiple_choice",
      };
    }
  );

  // Map remaining 3 questions from last principle
  const mindfulnessAnswers = [
    {
      question: PRINCIPLES_WITH_QUESTIONS["p10"][0],
      answer: formResponse.answers[0].choice.label,
      type: "multiple_choice",
    },
    {
      question: PRINCIPLES_WITH_QUESTIONS["p10"][1],
      answer: formResponse.answers[1].choice.label,
      type: "multiple_choice",
    },
    {
      question: PRINCIPLES_WITH_QUESTIONS["p10"][2],
      answer: formResponse.answers[2].choice.label,
      type: "multiple_choice",
    },
  ];

  questionAnswerMap = [...questionAnswerMap, ...mindfulnessAnswers];
 
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

const tryCreateAccountAndSendEmail = async (supabase: SupabaseClient, email: string) => {
};

serve(async (req) => {
  console.log('hello world');
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
  )

  try {

    const payloadRaw = await req.text();
    const payload = JSON.parse(payloadRaw);

    // Read the Typeform-Signature header
    // const header = req.headers.get("typeform-signature");
	//
	// if (!header || !validateSignature(payloadRaw, header)) {
	// 	return new Response(JSON.stringify({ message: "Bad signature" }), { status: 400 });
	// }

    // Insert the payload to the mock_payloads table
    const { data: insertData, error } = await supabase
      .from("mock_payloads")
      .insert([
        {
          payload: payload,
          type: 'TIME'
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

	// Try create new Arootah account
	const password = await tryCreateArootahAccount(supabase, payloadParsed.email, "Time Management");

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
