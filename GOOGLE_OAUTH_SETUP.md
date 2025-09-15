# Google OAuth Setup Guide

This guide will help you configure Google OAuth authentication for your Contabilease application.

## Prerequisites

- Google Cloud Console account
- Supabase project with authentication enabled

## Step 1: Create Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application" as the application type
   - Add authorized redirect URIs:
     - `https://your-project-ref.supabase.co/auth/v1/callback`
     - `http://localhost:3000/auth/callback` (for development)

## Step 2: Configure Supabase

1. Go to your Supabase project dashboard
2. Navigate to "Authentication" > "Providers"
3. Enable Google provider
4. Enter your Google OAuth credentials:
   - **Client ID**: From Google Cloud Console
   - **Client Secret**: From Google Cloud Console
5. Set the redirect URL to: `https://your-project-ref.supabase.co/auth/v1/callback`

## Step 3: Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## Step 4: Test the Integration

1. Start your development server: `npm run dev`
2. Navigate to the login page
3. Click the "Login with Google" button
4. Complete the OAuth flow
5. Verify that you're redirected back to your application

## Troubleshooting

### Common Issues

1. **"redirect_uri_mismatch" error**
   - Ensure the redirect URI in Google Console matches exactly with Supabase
   - Check for trailing slashes and protocol (http vs https)

2. **"invalid_client" error**
   - Verify your Client ID and Client Secret are correct
   - Ensure the credentials are properly configured in Supabase

3. **"access_denied" error**
   - Check that the Google+ API is enabled
   - Verify the OAuth consent screen is configured

### Development vs Production

- **Development**: Use `http://localhost:3000/auth/callback`
- **Production**: Use `https://your-domain.com/auth/callback`

## Security Considerations

1. Never commit your Google OAuth credentials to version control
2. Use environment variables for all sensitive configuration
3. Regularly rotate your OAuth credentials
4. Monitor OAuth usage in Google Cloud Console

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)
