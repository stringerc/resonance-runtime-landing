#!/bin/bash
# Get your current IP address

echo "🌐 Your current IP addresses:"
echo ""
echo "Public IP:"
curl -s ifconfig.me
echo ""
echo ""
echo "Alternative method:"
curl -s https://api.ipify.org
echo ""
echo ""
echo "📋 Copy this IP and add it to Supabase dashboard:"
echo "   https://supabase.com/dashboard/project/kwhnrlzibgfedtxpkbgb/settings/database"
echo ""

