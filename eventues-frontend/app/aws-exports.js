const awsmobile = {
    "aws_project_region": "us-east-1",
    "aws_cognito_identity_pool_id": "us-east-1:dda87239-717f-408e-9e48-88b3b6598fdb",
    "aws_cognito_region": "us-east-1",
    "aws_user_pools_id": "us-east-1_1M0A6Jdmk",
    "aws_user_pools_web_client_id": "5j8rthh59ab7opoa8ojir2ekuh",
    "oauth": {
        domain: 'dev-eventues-dev.auth.us-east-1.amazoncognito.com',
        scope: ["email", "profile", "openid"],
        "redirectSignIn": "http://localhost:3000/callback",
        "redirectSignOut": "http://localhost:3000/",
        "responseType": "code"
    },
    "federationTarget": "COGNITO_USER_POOLS",
    "aws_cognito_username_attributes": [
        "EMAIL"
    ],
    "aws_cognito_social_providers": [],
    "aws_cognito_signup_attributes": [
        "EMAIL"
    ],
    "aws_cognito_mfa_configuration": "OFF",
    "aws_cognito_mfa_types": [
        "SMS"
    ],
    "aws_cognito_password_protection_settings": {
        "passwordPolicyMinLength": 8,
        "passwordPolicyCharacters": []
    },
    "aws_cognito_verification_mechanisms": [
        "EMAIL"
    ]
};

export default awsmobile;
