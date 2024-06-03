import { corsHeaders } from "./cors.ts";

export const badResponse = (body: any): Response => {
  return new Response(
    JSON.stringify(body),
    { 
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    }
  );
};

export const internalServerError = (message: string): Response => {
  return new Response(
    JSON.stringify({ message: message }),
    { 
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    }
  );
};
