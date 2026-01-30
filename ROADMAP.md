# Buzz Portfolio Upgrade Roadmap

## Overview
Transform Buzz from a basic chat app into a portfolio-ready showcase with high-impact technical features.

---

## 🎯 Feature Categories

### 1. Rich Media Upgrade (Visual Polish)
Make messages interactive and visually impressive.

| Feature | Priority | Status | Complexity |
|---------|----------|--------|------------|
| **Image Lightbox** | High | ✅ DONE | Medium |
| **Rich Link Previews** | High | ⬜ TODO | Hard |
| **Giphy Integration** | Medium | ⬜ TODO | Medium |

#### 1.1 Image Lightbox
- [x] Install lightbox library (yet-another-react-lightbox)
- [x] Create Lightbox component wrapper
- [x] Integrate with message images
- [x] Add zoom, download, and share options
- [x] Keyboard navigation (arrow keys, ESC to close)

#### 1.2 Rich Link Previews
- [ ] URL detection in messages (regex pattern)
- [ ] Create LinkPreview component
- [ ] Set up link preview API (linkpreview.io or custom Cloud Function)
- [ ] Cache link previews to avoid repeated API calls
- [ ] Handle YouTube, GitHub, Twitter special cases
- [ ] Graceful fallback for failed previews

#### 1.3 Giphy Integration
- [ ] Sign up for Giphy API key
- [ ] Create GiphyPicker component
- [ ] Add GIF button in compose area
- [ ] Implement search with debouncing
- [ ] Trending GIFs as default
- [ ] Send GIF as message (store as img)

---

### 2. Power User Workflow (Technical Depth)
Prove understanding of performance and complex data synchronization.

| Feature | Priority | Status | Complexity |
|---------|----------|--------|------------|
| **Optimistic UI Updates** | High | ✅ DONE | Hard |
| **Message Search** | High | ⬜ TODO | Medium |
| **@Mentions** | Medium | ⬜ TODO | Medium |

#### 2.1 Optimistic UI Updates
- [x] Update message state structure (add `status: 'sending' | 'sent' | 'failed'`)
- [x] Show message immediately in UI with "sending" indicator
- [x] Perform Firebase write in background
- [x] Update status to "sent" on success
- [x] Show "failed" with retry option on error
- [ ] Handle offline scenarios

#### 2.2 Message Search
- [ ] Add search bar in chat header
- [ ] Client-side search through loaded messages
- [ ] Highlight matching text in messages
- [ ] Scroll to message on click
- [ ] Search across all chats option
- [ ] Consider Algolia/Typesense for full-text search (optional)

#### 2.3 @Mentions in Group Chats
- [ ] Detect @username pattern in compose input
- [ ] Show autocomplete dropdown of group members
- [ ] Highlight mentions in message bubbles
- [ ] Notify mentioned users (separate notification)
- [ ] "Mentions" filter in chat list

---

### 3. Security & Privacy Flex (Professional Edge)
Demonstrate security awareness for fintech/enterprise roles.

| Feature | Priority | Status | Complexity |
|---------|----------|--------|------------|
| **Disappearing Messages** | High | ⬜ TODO | Hard |
| **E2EE Badge (Simulated)** | Medium | ⬜ TODO | Medium |
| **Session Management** | Medium | ⬜ TODO | Medium |

#### 3.1 Disappearing Messages ("Burn After Reading")
- [ ] Add toggle in compose area for disappearing mode
- [ ] Add `expiresAt` field to message document
- [ ] Set expiration (30s after read)
- [ ] Cloud Function to delete expired messages
- [ ] Visual indicator for disappearing messages (timer icon)
- [ ] Show countdown in recipient's view

#### 3.2 E2EE Simulation
- [ ] Install crypto-js library
- [ ] Generate/store encryption key per chat
- [ ] Encrypt message text before saving to Firestore
- [ ] Decrypt on client when displaying
- [ ] Show "🔒 Encrypted" badge on messages
- [ ] Key exchange simulation for new chats

#### 3.3 Session Management
- [ ] Store session info in Firestore (device, IP, timestamp)
- [ ] Create "Active Sessions" page in settings
- [ ] Show device name, location, last active
- [ ] "Log out other devices" button
- [ ] Firebase Auth token revocation
- [ ] Push notification on new login

---

## 📋 Implementation Order (Recommended)

### Phase 1: Quick Wins (1-2 days)
1. ✅ Image Lightbox - immediate visual impact
2. ✅ Optimistic UI Updates - better UX

### Phase 2: Impressive Features (2-3 days)
3. ⬜ Rich Link Previews - wow factor
4. ⬜ Message Search - utility feature
5. ⬜ @Mentions - group chat enhancement

### Phase 3: Advanced Features (2-3 days)
6. ⬜ Giphy Integration - fun & API skills
7. ⬜ Disappearing Messages - security feature
8. ⬜ E2EE Badge - security showcase

### Phase 4: Polish (1 day)
9. ⬜ Session Management - enterprise feature
10. ⬜ Final testing & bug fixes

---

## 🛠 Dependencies to Install

```bash
# Rich Media
npm install yet-another-react-lightbox  # Lightbox
npm install @giphy/react-components @giphy/js-fetch-api  # Giphy

# Security
npm install crypto-js  # Encryption
npm install @types/crypto-js --save-dev  # TypeScript types

# Optional
npm install react-mentions  # For @mentions autocomplete
```

---

## 📝 Notes

- **API Keys needed**: Giphy API, Link Preview API (or custom Cloud Function)
- **Firebase Functions**: May need for link previews and message expiration
- **Testing**: Each feature should be tested across 1-on-1, group, and global chats
- **Mobile responsiveness**: Ensure all new UI works on mobile

---

## ✅ Completed Features (from previous work)
- [x] Read receipts with checkmarks
- [x] Unread message counts
- [x] WhatsApp-style date separators
- [x] Group chat creation and management
- [x] Avatar with initials and colors
- [x] Group description and editing
- [x] Photo indicator in message preview
- [x] Empty state for chats
