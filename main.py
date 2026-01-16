from flask import Flask, request, jsonify

app = Flask(__name__)

# This matches the 'Verify Token' you type into the Facebook dashboard
VERIFY_TOKEN = "ardanai"

@app.route('/webhook', methods=['GET', 'POST'])
def webhook():
    # 1. HANDLE VERIFICATION (GET request)
    if request.method == 'GET':
        mode = request.args.get('hub.mode')
        token = request.args.get('hub.verify_token')
        challenge = request.args.get('hub.challenge')

        if mode == 'subscribe' and token == VERIFY_TOKEN:
            print("WEBHOOK_VERIFIED")
            return challenge, 200
        else:
            return "Verification failed", 403

    # 2. HANDLE MESSAGES (POST request)
    if request.method == 'POST':
        data = request.json
        print(f"New Event Received: {data}")

        # Basic logic to extract the message text
        try:
            for entry in data.get('entry', []):
                for messaging_event in entry.get('messaging', []):
                    if 'message' in messaging_event:
                        sender_id = messaging_event['sender']['id']
                        message_text = messaging_event['message'].get('text')
                        print(f"MESSAGE FROM {sender_id}: {message_text}")
        except Exception as e:
            print(f"Error parsing: {e}")

        return "EVENT_RECEIVED", 200

if __name__ == '__main__':
    app.run(port=5000)