import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const AROOTAH_AUTH_URL = Deno.env.get("AROOTAH_USER_SERVICE_URL")!; 

// Tries to create an account on the Arootah system. Returns null if password creation failed
export const tryCreateArootahAccount = async (supabase: SupabaseClient, email: string, typeform: string): Promise<string | undefined> => {
    const password = generatePassword();
    const reqBody = {
        first_name: "Change me",
        last_name: "Change me",
        email: email,
        password: password,
        password_2: password,
    };

    const response = await fetch(AROOTAH_AUTH_URL + "/user/", {
        method: "POST",
        body: JSON.stringify(reqBody),
        headers: {
            "Content-Type": "application/json"
        }
    });

    await upsertUserEmail(supabase, email);

    if (!response.ok) {
        const resBody = await response.text();
        console.error(`User creation failed upon ${typeform} submission.`);
        console.error("Reason:", resBody);

        return undefined;
    }

    return password;
};

const generatePassword = (): string => {
    const buff = new Uint8Array(16);
    crypto.getRandomValues(buff);

    let pwd = "";
    for (let i = 0; i < buff.length; ++i) {
        pwd += ("0" + buff[i].toString(16)).slice(-2);
    }

    return pwd;
};

const upsertUserEmail = async (supabase: SupabaseClient, email: string): Promise<void> => {

    const { data, error } = await supabase
    .from("masterplan_index")
    .select("id")
    .eq("email", email)
    .maybeSingle();

    if (error) {
        throw error;
    }

    if (!data) {
        const { error: insertError } = await supabase
        .from("masterplan_index")
        .insert({ email: email });

        if (insertError) {
            throw insertError;
        }
    }
};
