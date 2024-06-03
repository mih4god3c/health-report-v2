export const sendEmail = async (sendgridBody: any): Promise<void> => {
    const sendgridUrl = "https://api.sendgrid.com/v3/mail/send";
    const sendgridApiKey = Deno.env.get("SENDGRID_API_KEY");

    const headers = {
        "Authorization": `Bearer ${sendgridApiKey}`,
        "Content-Type": "application/json",
    };

    await fetch(sendgridUrl, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(sendgridBody),
    });
};

export const sendNewAccountEmail = async (recepient: string, password: string): Promise<void> => {
    const body = {
        personalizations: [
            {
                to: [{ email: recepient }],
                from: { email: "support@arootha.com" },
                subject: "Arootah account created",
                content: [
                    {
                        type: "text/html",
                        value: `We've created an account for you.
                                Temporary password: ${password} (Change it immediately!)

                            You can log in with your email and the provided password <a href="https://hat-arootah-web-24408-staging.botics.co/">here.</a>

                            Arootah team!`
                    }
                ]
            }
        ]
    };

    return sendEmail(body);
};
