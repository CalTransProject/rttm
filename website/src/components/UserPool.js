import {CognitoUserPool } from "amazon-cognito-identity-js";

const poolData = {
    UserPoolId: "us-east-1_dm3FV28co",
    ClientId: "12fg12fg"
}

export default new CognitoUserPool(poolData);