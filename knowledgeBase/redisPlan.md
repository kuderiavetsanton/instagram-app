This plan focuses on the core plumbing: establishing a stable connection to your **Redis Docker container** and setting up the **Instagram Webhook** to capture and store messages the moment they arrive.

---

## 🛠️ Implementation Plan: Redis & Webhook Setup

### 1. Redis Connection (Internal & External)

Since your Redis is on port `6379` and linked via Docker, your app needs to handle connection retries to ensure it doesn't crash if the container restarts.

* **Host:** `localhost` (if running your app on the host machine) or `redis` (if your app is in the same Docker network).
* **Port:** `6379`.
* **Action:** Initialize a persistent client (using `ioredis` for Node.js or `redis-py` for Python).
* **Validation:** Log a "Redis Connected" message on startup to ensure your `.yml` volume is active.

### 2. Instagram Webhook Specification

Meta requires a single endpoint that handles **two different HTTP methods**. You can use any path (e.g., `/api/webhook/instagram`).

#### **A. The Verification (GET Method)**

When you first save your URL in the Meta Developer Dashboard, Instagram sends a `GET` request to verify you own the server.

* **Expects:** Query parameters `hub.mode`, `hub.verify_token`, and `hub.challenge`.
* **Logic:** 1. Check if `hub.verify_token` matches your secret string (set by you in the dashboard).
2. If yes, return the `hub.challenge` value as **plain text** (Status 200).
3. If no, return 403 Forbidden.

#### **B. The Event Payload (POST Method)**

Once verified, all new messages arrive here as a JSON payload.

* **Expects:** A nested JSON structure.
* **Key Fields to Extract:**
* `entry[0].messaging[0].sender.id`: The unique ID of the person messaging you.
* `entry[0].messaging[0].message.text`: The actual message content.
* `entry[0].id`: Your own Instagram Business Account ID.



---

### 3. Logic: Writing to Redis on Trigger

Inside your **POST** handler, execute the following logic sequence:

1. **Extract Data**: Get the `sender_id` and the `text`.
2. **Serialize**: Create a compact JSON string: `{"r": "u", "t": "user message content"}`.
3. **Atomic Push**:
* `RPUSH chat:{sender_id} {serialized_json}`
* `LTRIM chat:{sender_id} -20 -1` (Keep the last 20 messages for LLM context).


4. **Set TTL**: `EXPIRE chat:{sender_id} 86400` (24-hour cleanup).
5. **Acknowledge**: Immediately return `res.sendStatus(200)`. **Crucial:** If you don't return 200 quickly, Meta will retake the webhook and eventually disable it.

---

### 4. Integration Checklist for your IDE

1. [ ] **Environment Variables**: Add `REDIS_URL`, `IG_VERIFY_TOKEN`, and `PORT`.
2. [ ] **Verify Route**: Create `GET /webhook` to handle the Meta "handshake."
3. [ ] **Messaging Route**: Create `POST /webhook` to handle the actual data.
4. [ ] **Redis Client**: Create a shared `redisClient` instance to be used across routes.
5. [ ] **Payload Logger**: Log the `req.body` during your first test to see the exact structure of your account's messaging events.