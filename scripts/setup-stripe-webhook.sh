#!/bin/bash
# Helper script to set up Stripe webhook

echo "🔗 Stripe Webhook Setup Guide"
echo "=============================="
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
  echo "📦 Installing ngrok..."
  npm install -g ngrok
fi

echo "📋 Step-by-Step Webhook Setup:"
echo ""
echo "1️⃣  Start Next.js Development Server:"
echo "   cd webapp && npm run dev"
echo ""
echo "2️⃣  In another terminal, expose port 3000:"
echo "   ngrok http 3000"
echo ""
echo "3️⃣  Copy the ngrok URL (e.g., https://abc123.ngrok.io)"
echo ""
echo "4️⃣  Configure Webhook in Stripe:"
echo "   - Go to: https://dashboard.stripe.com/webhooks"
echo "   - Click 'Add endpoint'"
echo "   - Endpoint URL: https://your-ngrok-url.ngrok.io/api/webhooks/stripe"
echo "   - Select events:"
echo "     ✅ checkout.session.completed"
echo "     ✅ invoice.payment_succeeded"
echo "     ✅ invoice.payment_failed"
echo "     ✅ customer.subscription.deleted"
echo "     ✅ customer.subscription.updated"
echo "   - Click 'Add endpoint'"
echo ""
echo "5️⃣  Copy the 'Signing secret' (starts with whsec_)"
echo ""
read -p "Paste your STRIPE_WEBHOOK_SECRET here (or press Enter to skip): " WEBHOOK_SECRET

if [ -n "$WEBHOOK_SECRET" ]; then
  # Update .env.local
  if [ -f ".env.local" ]; then
    # Check if STRIPE_WEBHOOK_SECRET already exists
    if grep -q "STRIPE_WEBHOOK_SECRET=" .env.local; then
      # Replace existing STRIPE_WEBHOOK_SECRET
      if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|STRIPE_WEBHOOK_SECRET=.*|STRIPE_WEBHOOK_SECRET=\"$WEBHOOK_SECRET\"|" .env.local
      else
        # Linux
        sed -i "s|STRIPE_WEBHOOK_SECRET=.*|STRIPE_WEBHOOK_SECRET=\"$WEBHOOK_SECRET\"|" .env.local
      fi
    else
      # Add STRIPE_WEBHOOK_SECRET
      echo "STRIPE_WEBHOOK_SECRET=\"$WEBHOOK_SECRET\"" >> .env.local
    fi
    echo ""
    echo "✅ STRIPE_WEBHOOK_SECRET updated in .env.local"
  else
    echo ""
    echo "❌ .env.local not found. Please run auto-setup.sh first."
  fi
else
  echo ""
  echo "⏭️  Skipped. You can update .env.local manually."
fi

echo ""
echo "📝 For production, use your actual domain:"
echo "   https://yourdomain.com/api/webhooks/stripe"
echo ""

