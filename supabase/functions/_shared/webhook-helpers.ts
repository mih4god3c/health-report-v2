import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export const insertToWebhooks = async (supabase: SupabaseClient, payload: any, payloadParsed: any) => {
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
