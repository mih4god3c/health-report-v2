import { hmac } from "https://deno.land/x/hmac@v2.0.1/mod.ts";

export const validateSignature = (payload: string, signature: string, enableLogging: boolean = true): boolean => {
    const secret = Deno.env.get("TYPEFORM_SECRET");
    const hash = hmac("sha256", secret, payload, "utf8", "base64");
    const result = `sha256=${hash}` === signature;

    if (enableLogging) {
        console.debug("Signature validation results:");
        console.debug(`Signature: ${signature}`);
        console.debug("Payload:", payload);
        console.debug(`Result: ${result}`);
    }

    return result;
};
