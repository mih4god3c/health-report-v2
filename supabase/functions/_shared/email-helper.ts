export const sendEmail = async (sendgridBody: any): Promise<void> => {
    const sendgridUrl = "https://api.sendgrid.com/v3/mail/send";
    const sendgridApiKey = Deno.env.get("SENDGRID_API_KEY");

    const headers = {
        "Authorization": `Bearer ${sendgridApiKey}`,
        "Content-Type": "application/json",
    };

    const res = await fetch(sendgridUrl, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(sendgridBody),
    });

    if (res.ok) {
        console.debug("Email sending successful");
    } else {
        console.error("Email sending was unsuccessful", "Reason:", await res.json());
    }
};

export const sendNewAccountEmail = async (recepient: string, password: string): Promise<void> => {
    const body = {
        from: { email: "support@arootah.com" },
        subject: "Arootah account created",
        personalizations: [
            {
                to: [{ email: recepient }]
            }
        ],
        content: [
            {
                type: "text/html",
                value: `We've created an account for you
                    <br>
                    <br>
                    Temporary password: ${password} (Change it immediately!)
                    <br>
                    <br>
                    You can log in with your email and the provided password <a href="https://auth.arootah.com/sign-in">here.</a>
                    <br>
                    <br>
                        Arootah team!`
            }
        ]
    };

    return sendEmail(body);
};
