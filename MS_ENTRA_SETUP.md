# 🔐 Microsoft Entra ID (Azure AD) Setup Guide for LibreChat

## 📋 Prerequisites
- Azure subscription with access to Azure Active Directory
- Admin rights to create App Registrations in Azure AD
- LibreChat running locally

## 🚀 Quick Setup

### Step 1: Register Application in Azure Portal

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** → **App registrations**
3. Click **New registration**
4. Configure the application:
   - **Name**: LibreChat (or any name you prefer)
   - **Supported account types**: Choose based on your needs:
     - Single tenant (your organization only)
     - Multi-tenant (any Azure AD directory)
     - Personal Microsoft accounts
   - **Redirect URI**: 
     - Platform: **Web**
     - URI: `http://localhost:3080/oauth/openid/callback`
     
   For production, add: `https://yourdomain.com/oauth/openid/callback`

5. Click **Register**

### Step 2: Configure Application Secrets

1. In your app registration, go to **Certificates & secrets**
2. Click **New client secret**
3. Add a description (e.g., "LibreChat")
4. Choose expiration period
5. Click **Add**
6. **IMPORTANT**: Copy the secret value immediately (you won't see it again!)

### Step 3: Gather Required Information

From the **Overview** page of your app registration, copy:
- **Application (client) ID**
- **Directory (tenant) ID**

### Step 4: Configure API Permissions (Optional but Recommended)

1. Go to **API permissions**
2. Click **Add a permission**
3. Choose **Microsoft Graph**
4. Select **Delegated permissions**
5. Add these permissions:
   - `User.Read` (usually added by default)
   - `email`
   - `openid`
   - `profile`
6. Click **Add permissions**
7. Click **Grant admin consent** (if you're an admin)

### Step 5: Configure LibreChat

Add these environment variables to your `.env` file:

```env
# Microsoft Entra ID Configuration
OPENID_CLIENT_ID=<your-application-client-id>
OPENID_CLIENT_SECRET=<your-client-secret>
OPENID_ISSUER=https://login.microsoftonline.com/<your-tenant-id>/v2.0
OPENID_SESSION_SECRET=<generate-random-string-here>
OPENID_SCOPE="openid profile email User.Read"
OPENID_CALLBACK_URL=/oauth/openid/callback

# UI Customization
OPENID_BUTTON_LABEL=Sign in with Microsoft
OPENID_IMAGE_URL=https://learn.microsoft.com/en-us/entra/identity-platform/media/howto-add-branding-in-apps/ms-symbollockup_mssymbol_19.png

# Security Settings
OPENID_USE_PKCE=true
OPENID_USE_END_SESSION_ENDPOINT=true

# Optional: Auto-redirect to Microsoft login
# OPENID_AUTO_REDIRECT=false
```

### Step 6: Generate Session Secret

Generate a secure random string for `OPENID_SESSION_SECRET`:

```bash
# On Linux/Mac:
openssl rand -hex 32

# Or use Node.js:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 7: Restart LibreChat

Kill and restart your LibreChat servers to apply the new configuration.

## 🔒 Advanced Configuration

### Role-Based Access Control

To restrict access based on Azure AD groups or roles:

1. In Azure Portal, configure App Roles or use existing groups
2. Add to `.env`:

```env
OPENID_REQUIRED_ROLE=YourRoleName
OPENID_REQUIRED_ROLE_TOKEN_KIND=id
OPENID_REQUIRED_ROLE_PARAMETER_PATH=roles
```

### Custom Claims Mapping

Customize how user information is mapped:

```env
OPENID_USERNAME_CLAIM=preferred_username
OPENID_NAME_CLAIM=name
```

### Microsoft Graph API Integration

For advanced features like user photos:

```env
OPENID_ON_BEHALF_FLOW_FOR_USERINFO_REQUIRED=true
OPENID_ON_BEHALF_FLOW_USERINFO_SCOPE="User.Read"
```

## 🧪 Testing

1. Open LibreChat: http://localhost:3080
2. You should see "Sign in with Microsoft" button
3. Click it to test the authentication flow
4. After successful login, you'll be redirected back to LibreChat

## 🐛 Troubleshooting

### Common Issues:

1. **Redirect URI mismatch**
   - Ensure the redirect URI in Azure exactly matches your `.env` configuration
   - Check protocol (http vs https) and port number

2. **Invalid client secret**
   - Client secrets expire - check expiration date in Azure Portal
   - Make sure you copied the secret value, not the secret ID

3. **Permissions issues**
   - Grant admin consent for the required permissions
   - Check if your organization has restrictions on app permissions

4. **Token validation errors**
   - Verify the OPENID_ISSUER URL format
   - For single-tenant apps: `https://login.microsoftonline.com/{tenant-id}/v2.0`
   - For multi-tenant apps: `https://login.microsoftonline.com/common/v2.0`

### Debug Mode

Enable debug logging to troubleshoot issues:

```env
DEBUG_OPENID_REQUESTS=true
DEBUG_LOGGING=true
```

## 📚 Resources

- [Microsoft identity platform documentation](https://docs.microsoft.com/en-us/azure/active-directory/develop/)
- [OpenID Connect on Azure AD](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-protocols-oidc)
- [LibreChat Documentation](https://www.librechat.ai/docs/configuration/authentication)

## ✅ Security Best Practices

1. Always use HTTPS in production
2. Rotate client secrets regularly
3. Use PKCE for enhanced security
4. Implement proper session management
5. Consider implementing MFA in Azure AD
6. Regularly review and audit app permissions