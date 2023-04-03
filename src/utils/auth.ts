import { emit } from "process";


var jwksClient = require('jwks-rsa');
var jwt = require("jsonwebtoken")

var client = jwksClient({
    jwksUri: 'https://appleid.apple.com/auth/keys'
});

const verifyApple = async (token: string) => {
    var decoded = await jwt.decode(token, { complete: true });
    const key = await client.getSigningKey(decoded.header.kid);
    const signingKey = key.publicKey || key.rsaPublicKey;
    const verifytoken = await jwt.verify(token, signingKey)

    return verifytoken
}



const LogUserIn = async (userid: string) => {
    return await jwt.sign({ id: userid }, process.env.TOKEN_SECRET, { expiresIn: '60d' });
}




export {
    verifyApple, LogUserIn
}