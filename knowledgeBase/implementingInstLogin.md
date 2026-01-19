Since we are moving away from the automated "magic" of the SDK and handling the integration manually, your implementation will follow a **server-to-server** security model.

In this plan, **Supabase** acts strictly as your secure database for the final step. All logic happens in your **Vercel** server-side code (Next.js API routes or Server Actions) to keep your **App Secret** hidden from the browser.

---

### Step 1: Initiate the Handshake (Frontend)

Your button will not use a library. It will manually redirect the user to Meta's Authorization endpoint with your required scopes.

**URL Construction:**

```javascript
const handleManualLogin = () => {
  const rootUrl = "https://www.facebook.com/v24.0/dialog/oauth";
  const options = {
    client_id: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
    redirect_uri: "https://your-app.com/api/auth/callback",
    state: "{SECURE_RANDOM_STRING}", // To prevent CSRF
    scope: [
      "instagram_basic",
      "instagram_manage_messages",
      "pages_show_list",
      "pages_manage_metadata"
    ].join(","),
  };

  const queryString = new URLSearchParams(options).toString();
  window.location.href = `${rootUrl}?${queryString}`;
};

```

---

### Step 2: Capture the Code (Vercel API Route)

When the user approves, Meta redirects them to your `/api/auth/callback?code=...`. Your backend must now exchange that `code` for a **Short-Lived Token** (valid for 1–2 hours).

**File:** `/api/auth/callback/route.ts`

```typescript
const response = await fetch(
  `https://graph.facebook.com/v24.0/oauth/access_token?` +
  new URLSearchParams({
    client_id: process.env.FB_APP_ID,
    client_secret: process.env.FB_APP_SECRET,
    redirect_uri: process.env.REDIRECT_URI,
    code: codeFromUrl,
  })
);
const { access_token: shortToken } = await response.json();

```

---

### Step 3: Upgrade to 60-Day Token (Server-to-Server)

You don't want to log the user out every hour. You must manually request an exchange for a **Long-Lived Token**.

```typescript
const upgradeRes = await fetch(
  `https://graph.facebook.com/v24.0/oauth/access_token?` +
  new URLSearchParams({
    grant_type: "fb_exchange_token",
    client_id: process.env.FB_APP_ID,
    client_secret: process.env.FB_APP_SECRET,
    fb_exchange_token: shortToken, // The 1-hour token
  })
);
const { access_token: longLivedToken } = await upgradeRes.json();

```

---

### Step 4: Map to Instagram Business ID

A "Facebook User Token" doesn't give you the Instagram ID directly. You have to perform a two-step lookup:

1. **Find the Facebook Page** linked to their account.
2. **Find the Instagram Account** linked to that Page.

```typescript
// 1. Get Page ID
const pageRes = await fetch(`https://graph.facebook.com/v24.0/me/accounts?access_token=${longLivedToken}`);
const { data } = await pageRes.json();
const pageId = data[0].id;

// 2. Get Instagram Business ID from that Page
const igRes = await fetch(`https://graph.facebook.com/v24.0/${pageId}?fields=instagram_business_account&access_token=${longLivedToken}`);
const igData = await igRes.json();
const igBusinessId = igData.instagram_business_account.id;

```

---

### Step 5: The Final Save (Supabase)

Only now do you use **Supabase**. You save the mapping so that your Webhook (which only sees IDs) can find the correct token.

```typescript
const { error } = await supabase
  .from('user_configs')
  .upsert({
    user_id: currentUserId, // Your app's user ID
    instagram_id: igBusinessId,
    token: longLivedToken, // The 60-day key
  });

```

### Security Note: Supabase Vault

Since you are storing sensitive API tokens, I recommend using the **Supabase Vault** extension rather than a standard table. Vault encrypts the data at rest, so even if your database were exported, the tokens would remain unreadable without the decryption key.


**Would you like me to write the specific SQL to enable the Vault extension in your Supabase project for this extra security?**