import sgMail from "@sendgrid/mail"

if (process.env.SENDGRID_API_KEY) {

    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}


const SendEmail = async (email: string, code: string) => {

    const msg = {
        to: email,
        from: process.env.Email || 'test@example.com',
        subject: 'LSTN Verification code',
        text: `<strong>Your verification code is:${code}`,
        html: `<strong>Your verification code is:${code}</strong>`,
    }
    const emailsent = await sgMail.send(msg)
    console.log('Email sent')
}




export {
    SendEmail,

}