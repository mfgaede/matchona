#!/bin/bash

# Matchona Deployment Script - Following Reclaim Hosting Guidelines
# Based on: https://support.reclaimhosting.com/hc/en-us/articles/4406431747223-Using-Rsync-to-Move-Files

# Configuration - UPDATE THESE FOR YOUR HOSTING
HOST="digdug.reclaimhosting.com"       # Your Reclaim server hostname  
USERNAME="nuestros"                    # Your cPanel username
REMOTE_PATH="matchona.org/"            # Path for your site folder
LOCAL_PATH="_site/"                    # Local Jekyll build directory

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Matchona Deployment - Reclaim Hosting Compatible${NC}"
echo -e "${YELLOW}📋 Configuration:${NC}"
echo -e "   Host: $USERNAME@$HOST"
echo -e "   Destination: $REMOTE_PATH"
echo -e "   Local: $LOCAL_PATH"
echo ""

# Build Jekyll site
echo -e "${YELLOW}🔨 Building Jekyll site...${NC}"
bundle exec jekyll build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Jekyll build failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Jekyll build complete${NC}"

# Test basic connection
echo -e "${YELLOW}🔌 Testing connection to $HOST...${NC}"
ssh -o ConnectTimeout=10 "$USERNAME@$HOST" "pwd" 2>/dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ SSH connection successful${NC}"
else
    echo -e "${YELLOW}ℹ️  SSH test failed - will use password authentication${NC}"
fi

echo ""
echo -e "${YELLOW}🎯 Deployment Options:${NC}"
echo "1) Full sync (following Reclaim's standard method)"
echo "2) Dry run (see what would be transferred)"
echo "3) Small files first (safer for large sites)"
read -p "Choose option (1, 2, or 3): " -n 1 -r
echo
echo

case $REPLY in
    1)
        echo -e "${YELLOW}🚀 Full deployment using Reclaim's method...${NC}"
        echo -e "${YELLOW}💡 You'll be prompted for your cPanel password${NC}"
        
        # Use Reclaim's recommended rsync flags
        rsync -avz \
            --exclude='.DS_Store' \
            --exclude='Thumbs.db' \
            --exclude='.git*' \
            --progress \
            "$LOCAL_PATH" "$USERNAME@$HOST:$REMOTE_PATH"
        ;;
        
    2)
        echo -e "${YELLOW}🔍 Dry run - showing what would be transferred...${NC}"
        rsync -avz --dry-run \
            --exclude='.DS_Store' \
            --exclude='Thumbs.db' \
            --exclude='.git*' \
            "$LOCAL_PATH" "$USERNAME@$HOST:$REMOTE_PATH"
        echo -e "${YELLOW}💡 This was just a preview. Run option 1 to actually deploy.${NC}"
        ;;
        
    3)
        echo -e "${YELLOW}📋 Step 1: Small files first...${NC}"
        # Upload small files first
        rsync -avz \
            --include='*.html' \
            --include='*.css' \
            --include='*.js' \
            --include='*.json' \
            --include='*.xml' \
            --include='*.txt' \
            --include='*/' \
            --exclude='*' \
            --max-size=500K \
            --progress \
            "$LOCAL_PATH" "$USERNAME@$HOST:$REMOTE_PATH"
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Small files uploaded${NC}"
            echo -e "${YELLOW}🖼️  Step 2: Images and medium files...${NC}"
            
            rsync -avz \
                --include='*.jpg' \
                --include='*.jpeg' \
                --include='*.png' \
                --include='*.gif' \
                --include='*.svg' \
                --include='*.ico' \
                --include='*/' \
                --exclude='*' \
                --max-size=2M \
                --progress \
                "$LOCAL_PATH" "$USERNAME@$HOST:$REMOTE_PATH"
            
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}✅ Images uploaded${NC}"
                echo -e "${YELLOW}🎵 Step 3: Large media files...${NC}"
                
                rsync -avz \
                    --include='*.mp3' \
                    --include='*.mp4' \
                    --include='*.pdf' \
                    --include='*/' \
                    --exclude='*' \
                    --progress \
                    --timeout=1800 \
                    "$LOCAL_PATH" "$USERNAME@$HOST:$REMOTE_PATH"
            fi
        fi
        ;;
        
    *)
        echo -e "${RED}❌ Invalid choice${NC}"
        exit 1
        ;;
esac

if [ $? -eq 0 ]; then
    echo -e "${GREEN}🎉 Deployment successful!${NC}"
    echo -e "${YELLOW}🔧 Fixing file permissions...${NC}"
    
    # Fix permissions as recommended by Reclaim
    ssh "$USERNAME@$HOST" "find '$REMOTE_PATH' -type d -exec chmod 755 {} \; && find '$REMOTE_PATH' -type f -exec chmod 644 {} \;"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Permissions fixed${NC}"
    else
        echo -e "${YELLOW}⚠️  Permission fix failed, but deployment succeeded${NC}"
    fi
    
    echo -e "${GREEN}🌐 Check your site at: https://matchona.org${NC}"
    echo ""
    echo -e "${YELLOW}💡 If you experience issues, Reclaim recommends running:${NC}"
    echo -e "${YELLOW}   sh fixperms.sh -a $USERNAME${NC}"
    echo -e "${YELLOW}   (Ask Reclaim support to run this on your account)${NC}"
else
    echo -e "${RED}❌ Deployment failed${NC}"
    echo ""
    echo -e "${YELLOW}🔧 Troubleshooting tips:${NC}"
    echo -e "   • Make sure you're using your cPanel password"
    echo -e "   • Try connecting to your server hostname instead (e.g., x.reclaimhosting.com)"
    echo -e "   • Contact Reclaim support if the issue persists"
    exit 1
fi
