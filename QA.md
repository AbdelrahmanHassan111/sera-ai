# SERA AI - QA Checklist

## ✅ Quality Assurance Checklist

### 🔐 Privacy & Consent
- [ ] Consent modal appears on first visit
- [ ] Modal blocks access until user accepts
- [ ] Privacy notice clearly states local-only storage
- [ ] Medical disclaimer is visible and clear
- [ ] User cannot proceed without consent

### 📁 Data Input
- [ ] Upload page accepts .json, .txt files
- [ ] Sample data loads correctly (healthy, diabetes_risk, brca_like)
- [ ] File parser handles JSON array format
- [ ] File parser handles key-value JSON format
- [ ] Manual entry form validates rsID format (starts with 'rs')
- [ ] Manual entry validates genotype (1-2 letters: A/C/G/T)
- [ ] Can add multiple markers via manual entry
- [ ] Duplicate markers are handled (replaced, not duplicated)
- [ ] Invalid file formats show clear error messages

### 🧬 Recommendation Engine
- [ ] "Generate Recommendations" button works from Dashboard
- [ ] Recommendations are generated from uploaded markers
- [ ] High confidence recommendations appear in dashboard summary
- [ ] Recommendations show correct confidence levels (high/medium/low)
- [ ] Category filtering works (drug/disease/cancer/metabolic/lifestyle)
- [ ] Confidence filtering works
- [ ] Each recommendation shows actionable steps

### 🎯 Recommendation Actions
- [ ] "Accept" button marks recommendation as accepted
- [ ] "Decline" button marks recommendation as declined
- [ ] "Save to Plan" adds item to Lifestyle Planner
- [ ] "Ask AI" generates patient-friendly explanation (with API key)
- [ ] "Export" downloads recommendation as JSON
- [ ] Button states persist after page refresh

### 🤖 Gemini AI Integration
- [ ] Settings page has API key input field
- [ ] API key is masked by default (password field)
- [ ] "Show/Hide" toggle reveals/hides key
- [ ] "Persist" checkbox stores key in localStorage
- [ ] Without API key, AI features show "Demo Mode" message
- [ ] With valid API key, AI generates responses
- [ ] Streaming responses appear token-by-token
- [ ] AI dock appears on every page (except landing/onboarding)
- [ ] AI dock can be collapsed/expanded
- [ ] Quick prompts dropdown works
- [ ] Chat history persists across page navigation

### 🎨 3D Helix Visualization
- [ ] Helix renders on Dashboard when markers present
- [ ] Helix shows "No data" message when no markers
- [ ] Helix strands rotate smoothly (if animation enabled)
- [ ] Rungs are color-coded by confidence:
  - Red = High risk
  - Yellow = Medium risk  
  - Green = Low risk
  - Teal = No finding
- [ ] Hover over rung shows tooltip with gene/rsID/genotype
- [ ] OrbitControls allow rotation and zoom
- [ ] Legend displays correctly
- [ ] Performance is acceptable (no lag/stuttering)

### 📅 Lifestyle Planner
- [ ] "Add Item" modal opens and accepts input
- [ ] Items are grouped by frequency (Daily/Weekly/Monthly/Screening)
- [ ] Toggle checkbox marks item complete/incomplete
- [ ] Complete items show visual indication (grayed out, line-through)
- [ ] Edit button opens modal with pre-filled data
- [ ] Delete button removes item
- [ ] Items saved from recommendations show "Linked" badge
- [ ] Changes persist after page refresh

### ⚙️ Settings Page
- [ ] User profile fields (name, age, sex) save correctly
- [ ] Gemini API key section works:
  - Save key (with/without persist)
  - Clear key removes it
  - Security notice is visible
- [ ] Data Management:
  - Export downloads complete JSON
  - Import loads and restores data
  - Clear All Data shows confirmation modal
  - Clear All Data deletes everything (except consent)

### 💾 Data Persistence
- [ ] Genetic markers persist after page refresh
- [ ] Recommendations persist after page refresh
- [ ] Lifestyle plan items persist
- [ ] Chat history persists
- [ ] Settings persist (including API key if "persist" enabled)
- [ ] Onboarding status persists
- [ ] Exported JSON contains all expected data
- [ ] Imported JSON restores app state correctly

### 🎨 UI/UX
- [ ] All pages load without errors
- [ ] Navigation bar highlights current page
- [ ] Mobile navigation menu works (on small screens)
- [ ] All buttons have hover states
- [ ] All form inputs have focus states
- [ ] Modals can be closed via:
  - Close button (X)
  - Overlay click (if enabled)
  - Escape key
- [ ] Toasts appear for actions (success/error/info/warning)
- [ ] Toasts auto-dismiss after 5 seconds
- [ ] Loading states show spinners/skeleton loaders
- [ ] Empty states show helpful messages
- [ ] Error states show clear error messages

### ♿ Accessibility
- [ ] All interactive elements are keyboard-accessible
- [ ] Tab order is logical
- [ ] Focus indicators are visible
- [ ] Buttons have aria-labels where needed
- [ ] Modals trap focus
- [ ] Images have alt text
- [ ] Color contrast meets WCAG AA standards
- [ ] Screen reader announcements work (aria-live regions)

### 📱 Responsiveness
- [ ] Layout adapts to mobile screens (<768px)
- [ ] Layout adapts to tablet screens (768-1024px)
- [ ] Layout adapts to desktop screens (>1024px)
- [ ] Text is readable on all screen sizes
- [ ] Buttons are tappable on touch devices
- [ ] 3D helix is usable on mobile (pinch-to-zoom)
- [ ] Navigation collapses to hamburger on mobile

### 🚀 Performance
- [ ] Initial page load < 3 seconds
- [ ] 3D helix renders without blocking main thread
- [ ] Large datasets (100+ markers) don't cause lag
- [ ] Recommendation generation completes in < 5 seconds
- [ ] No memory leaks (test with long session)
- [ ] Build size is reasonable (<2MB gzipped)

### 🧪 Edge Cases
- [ ] Empty genetic file shows appropriate error
- [ ] Malformed JSON shows parse error
- [ ] Invalid rsID format is rejected
- [ ] Invalid genotype format is rejected
- [ ] Very long gene names don't break layout
- [ ] No Gemini API key shows graceful fallback
- [ ] Invalid Gemini API key shows error
- [ ] Network error during Gemini call handled gracefully
- [ ] Concurrent recommendation generations are handled
- [ ] Browser storage quota exceeded shows warning

### 🌐 Deployment
- [ ] `npm run build` completes without errors
- [ ] `npm run preview` serves production build correctly
- [ ] GitHub Pages deployment works
- [ ] All routes work with HashRouter
- [ ] Assets load correctly (images, fonts, etc.)
- [ ] No 404 errors in production
- [ ] Console has no errors (prod mode)

### 🔒 Security
- [ ] No sensitive data in localStorage (except API key with user consent)
- [ ] API key is not visible in network requests (only to Gemini API)
- [ ] No XSS vulnerabilities in user-entered data
- [ ] File upload validates file size (<10MB recommended)
- [ ] Imported JSON is validated before applying

---

## 🐛 Known Issues / Future Improvements

- [ ] Full VCF format parsing (currently only VCF-lite)
- [ ] PDF report generation
- [ ] Multi-language support (i18n)
- [ ] Dark mode toggle
- [ ] Advanced filtering (by gene, by category, by date)
- [ ] Comparison view (before/after)
- [ ] Family tree / pedigree visualization
- [ ] Integration with 23andMe/AncestryDNA APIs (privacy concerns)
- [ ] Medication interaction checker (expand drug database)
- [ ] Educational resources library

---

## 📊 Test Scenarios

### Scenario 1: New User Flow
1. Visit landing page → See features
2. Click "Get Started" → Onboarding
3. Complete onboarding steps → Accept consent
4. Redirected to Dashboard → Empty state
5. Upload sample data (diabetes_risk.json)
6. Generate recommendations → See results
7. Accept high-priority recommendation
8. Navigate to Lifestyle Planner → See empty state
9. Save recommendation to planner
10. Navigate to Settings → Add Gemini API key
11. Return to Recommendations → Ask AI for explanation
12. Open AI dock → Chat about findings

### Scenario 2: Returning User
1. Visit site → Auto-redirect to Dashboard
2. See previously uploaded markers and 3D helix
3. View existing recommendations
4. Check lifestyle plan progress
5. Export data as JSON
6. Clear all data
7. Import previously exported JSON
8. Verify data restored

### Scenario 3: Error Handling
1. Upload invalid JSON file → See error message
2. Try to generate recommendations without markers → See warning
3. Enter invalid rsID in manual entry → Validation error
4. Enter invalid API key → Error on AI request
5. Lose network during Gemini call → Graceful error

---

**Last Updated**: November 2025  
**Version**: 1.0.0

